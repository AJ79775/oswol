"""Narration with one fixed voice.

Engines:
  kokoro      local Kokoro-82M ONNX (default, CPU, deterministic, no network)
  voicestudio VoiceStudio server's OpenAI-compatible /v1/audio/speech (fixed profile + seed)
  edge        Microsoft Edge neural voices via edge-tts (needs internet)
  openai      any OpenAI-compatible /v1/audio/speech, e.g. FreeLLMAPI

Each sentence is synthesized separately, so captions and on-screen reveals
line up exactly with the voice.
"""
from __future__ import annotations

import asyncio
import hashlib
import io
import json
import logging
import os
import subprocess
from pathlib import Path

import httpx
import numpy as np
import soundfile as sf

from .config import Settings
from .models import Cue, SceneTiming, Storyboard
from .speech import split_sentences, to_speech

log = logging.getLogger(__name__)

SAMPLE_RATE = 24000
LEAD_IN = 0.75   # silence before the first sentence: the visual lands first
TAIL = 1.0       # breathing room before the next scene
MIN_SCENE = 4.0


class Engine:
    name = "base"

    def synth(self, text: str) -> np.ndarray:  # float32 mono @ SAMPLE_RATE
        raise NotImplementedError

    def signature(self) -> str:
        return self.name


class KokoroEngine(Engine):
    name = "kokoro"

    def __init__(self, settings: Settings):
        from kokoro_onnx import Kokoro

        d = Path(settings.kokoro_model_dir)
        model = next((p for p in (d / "kokoro-v1.0.onnx", d / "kokoro-v1.0.fp16.onnx", d / "kokoro-v1.0.int8.onnx")
                      if p.is_file()), None)
        if model is None or not (d / "voices-v1.0.bin").is_file():
            raise FileNotFoundError(f"Kokoro model files not found in {d} (run install.sh or scripts/get-models.sh)")
        self.kokoro = Kokoro(str(model), str(d / "voices-v1.0.bin"))
        self.voice = settings.tts_voice or "af_heart"
        self.speed = settings.tts_speed
        self.lang = "en-gb" if self.voice.startswith("b") else "en-us"
        if self.voice not in self.kokoro.get_voices():
            raise ValueError(f"Unknown Kokoro voice '{self.voice}'")

    def synth(self, text: str) -> np.ndarray:
        audio, sr = self.kokoro.create(text, voice=self.voice, speed=self.speed, lang=self.lang)
        return _resample(np.asarray(audio, dtype=np.float32), sr)

    def signature(self) -> str:
        return f"kokoro:{self.voice}:{self.speed}"


class OpenAISpeechEngine(Engine):
    name = "openai"

    def __init__(self, base_url: str, api_key: str, model: str, voice: str, speed: float, extra: dict | None = None):
        self.url = base_url.rstrip("/") + "/audio/speech"
        self.headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
        self.model, self.voice, self.speed, self.extra = model, voice, speed, extra or {}

    def synth(self, text: str) -> np.ndarray:
        body = {"model": self.model, "input": text, "voice": self.voice, "response_format": "wav",
                "speed": self.speed, **self.extra}
        r = httpx.post(self.url, json=body, headers=self.headers, timeout=600)
        r.raise_for_status()
        audio, sr = sf.read(io.BytesIO(r.content), dtype="float32", always_2d=False)
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        return _resample(audio, sr)

    def signature(self) -> str:
        return f"{self.name}:{self.model}:{self.voice}:{self.speed}:{json.dumps(self.extra, sort_keys=True)}"


class EdgeEngine(Engine):
    name = "edge"

    def __init__(self, settings: Settings):
        import edge_tts  # noqa: F401

        self.voice = settings.edge_voice
        pct = int(round((settings.tts_speed - 1.0) * 100))
        self.rate = f"{pct:+d}%"

    def synth(self, text: str) -> np.ndarray:
        import edge_tts

        async def run() -> bytes:
            buf = bytearray()
            async for chunk in edge_tts.Communicate(text, self.voice, rate=self.rate).stream():
                if chunk["type"] == "audio":
                    buf += chunk["data"]
            return bytes(buf)

        mp3 = asyncio.run(run())
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SAMPLE_RATE),
                              "pipe:1"], input=mp3, capture_output=True, check=True).stdout
        return np.frombuffer(pcm, dtype=np.float32).copy()

    def signature(self) -> str:
        return f"edge:{self.voice}:{self.rate}"


def make_engine(settings: Settings, name: str | None = None) -> Engine:
    name = (name or settings.tts_engine).lower()
    if name == "kokoro":
        return KokoroEngine(settings)
    if name == "voicestudio":
        eng = OpenAISpeechEngine(settings.voicestudio_url.rstrip("/") + "/v1", os.environ.get("VOICESTUDIO_API_KEY", ""),
                                 settings.voicestudio_engine, settings.tts_voice, settings.tts_speed,
                                 extra={"seed": int(os.environ.get("VOICESTUDIO_SEED", "42")), "language": "en"})
        eng.name = "voicestudio"
        return eng
    if name == "edge":
        return EdgeEngine(settings)
    if name == "openai":
        return OpenAISpeechEngine(os.environ.get("TTS_BASE_URL", settings.llm_base_url),
                                  os.environ.get("TTS_API_KEY", settings.llm_api_key), settings.openai_tts_model,
                                  settings.tts_voice, settings.tts_speed)
    raise ValueError(f"Unknown TTS_ENGINE '{name}'")


# ---------------------------------------------------------------------------


def _resample(audio: np.ndarray, sr: int) -> np.ndarray:
    if sr == SAMPLE_RATE:
        return audio.astype(np.float32)
    n = int(round(len(audio) * SAMPLE_RATE / sr))
    x_old = np.linspace(0, 1, num=len(audio), endpoint=False)
    x_new = np.linspace(0, 1, num=n, endpoint=False)
    return np.interp(x_new, x_old, audio).astype(np.float32)


def _trim(audio: np.ndarray, threshold: float = 0.008, margin: float = 0.04) -> np.ndarray:
    idx = np.flatnonzero(np.abs(audio) > threshold)
    if idx.size == 0:
        return audio
    pad = int(margin * SAMPLE_RATE)
    return audio[max(0, idx[0] - pad): min(len(audio), idx[-1] + pad)]


def _silence(seconds: float) -> np.ndarray:
    return np.zeros(int(seconds * SAMPLE_RATE), dtype=np.float32)


def _pause_after(sentence: str, base: float) -> float:
    s = sentence.rstrip()
    if s.endswith("?"):
        return base + 0.08
    if s.endswith(":"):
        return base * 0.7
    return base


def narrate_scene(engine: Engine, text: str, pause: float, min_duration: float = MIN_SCENE) -> tuple[np.ndarray, list[Cue]]:
    pieces, cues = [_silence(LEAD_IN)], []
    t = LEAD_IN
    for sentence in split_sentences(text):
        spoken = to_speech(sentence)
        if not spoken:
            continue
        audio = _trim(engine.synth(spoken))
        dur = len(audio) / SAMPLE_RATE
        cues.append(Cue(start=round(t, 3), end=round(t + dur, 3), text=sentence))
        gap = _pause_after(sentence, pause)
        pieces += [audio, _silence(gap)]
        t += dur + gap
    if pieces and len(pieces) > 1:
        pieces.pop()  # drop the last inter-sentence gap; the tail replaces it
    pieces.append(_silence(TAIL))
    audio = np.concatenate(pieces)
    if len(audio) / SAMPLE_RATE < min_duration:
        audio = np.concatenate([audio, _silence(min_duration - len(audio) / SAMPLE_RATE)])
    return audio, cues


def narrate(board: Storyboard, settings: Settings, out_dir: Path) -> list[SceneTiming]:
    out_dir.mkdir(parents=True, exist_ok=True)
    try:
        engine = make_engine(settings)
        timings = _narrate_all(board, settings, out_dir, engine)
    except Exception as exc:  # noqa: BLE001
        if not settings.tts_fallback:
            raise
        log.error("TTS engine '%s' failed (%s); re-voicing the WHOLE video with '%s' so the voice stays consistent",
                  settings.tts_engine, exc, settings.tts_fallback)
        engine = make_engine(settings, settings.tts_fallback)
        timings = _narrate_all(board, settings, out_dir, engine)
    return timings


def _narrate_all(board: Storyboard, settings: Settings, out_dir: Path, engine: Engine) -> list[SceneTiming]:
    timings = []
    for i, scene in enumerate(board.scenes):
        key = hashlib.sha1(f"{engine.signature()}|{settings.sentence_pause}|{scene.narration}".encode()).hexdigest()[:16]
        wav = out_dir / f"scene-{i:02d}-{key}.wav"
        meta = wav.with_suffix(".json")
        if wav.is_file() and meta.is_file():
            cues = [Cue(**c) for c in json.loads(meta.read_text())]
            duration = sf.info(str(wav)).duration
        else:
            audio, cues = narrate_scene(engine, scene.narration, settings.sentence_pause,
                                        min_duration=6.0 if scene.type in {"cold_open", "outro"} else MIN_SCENE)
            sf.write(str(wav), audio, SAMPLE_RATE, subtype="PCM_16")
            meta.write_text(json.dumps([c.model_dump() for c in cues]))
            duration = len(audio) / SAMPLE_RATE
        timings.append(SceneTiming(index=i, duration=round(duration, 3), audio_path=str(wav), cues=cues))
        log.info("Voiced scene %02d %-12s %5.1fs (%d sentences)", i, scene.type, duration, len(cues))
    return timings
