"""Final assembly: narration track, captions, chapters, thumbnail, MP4 mux."""
from __future__ import annotations

import json
import logging
import os
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

from .tts import SAMPLE_RATE

log = logging.getLogger(__name__)


def _run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    log.debug("$ %s", " ".join(cmd))
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


# ---------------------------------------------------------------------------
# Audio
# ---------------------------------------------------------------------------


def build_narration(story: dict, timings, out_wav: Path) -> Path:
    """Concatenate scene audio, each padded/trimmed to its frame-exact scene length (no A/V drift)."""
    parts = []
    for sc, t in zip(story["scenes"], timings):
        audio, sr = sf.read(t.audio_path, dtype="float32")
        if sr != SAMPLE_RATE:
            raise ValueError("unexpected sample rate in scene audio")
        n = int(round(sc["frames"] / story["fps"] * SAMPLE_RATE))
        audio = audio[:n] if len(audio) >= n else np.concatenate([audio, np.zeros(n - len(audio), dtype=np.float32)])
        parts.append(audio)
    sf.write(str(out_wav), np.concatenate(parts), SAMPLE_RATE, subtype="PCM_16")
    return out_wav


def master_voice(in_wav: Path, out_m4a: Path) -> Path:
    """Broadcast-style voice polish + two-pass EBU R128 loudness (-16 LUFS). No music, voice only."""
    chain = "highpass=f=70,lowpass=f=12000,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2"
    target = "I=-16:TP=-1.5:LRA=7"
    first = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(in_wav), "-af",
                            f"{chain},loudnorm={target}:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True, check=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", first.stderr, flags=re.S)
    if m:
        meas = json.loads(m.group(0))
        ln = (f"loudnorm={target}:measured_I={meas['input_i']}:measured_TP={meas['input_tp']}:"
              f"measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}:offset={meas['target_offset']}:linear=true")
    else:
        ln = f"loudnorm={target}"
    _run(["ffmpeg", "-y", "-v", "error", "-i", str(in_wav), "-af", f"{chain},{ln},aresample=48000",
          "-c:a", "aac", "-b:a", "192k", "-ac", "1", str(out_m4a)])
    return out_m4a


# ---------------------------------------------------------------------------
# Captions & chapters
# ---------------------------------------------------------------------------


def _ts(t: float, sep: str) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


def global_captions(story: dict) -> list[dict]:
    out = []
    for sc in story["scenes"]:
        for c in sc["captions"]:
            out.append({"start": sc["start"] + c["start"], "end": sc["start"] + c["end"], "text": c["text"]})
    return out


def write_captions(story: dict, srt: Path, vtt: Path) -> None:
    caps = global_captions(story)
    srt.write_text("\n".join(f"{i}\n{_ts(c['start'], ',')} --> {_ts(c['end'], ',')}\n{c['text']}\n"
                             for i, c in enumerate(caps, 1)), encoding="utf-8")
    vtt.write_text("WEBVTT\n\n" + "\n".join(f"{_ts(c['start'], '.')} --> {_ts(c['end'], '.')}\n{c['text']}\n"
                                           for c in caps), encoding="utf-8")


def chapters(story: dict) -> list[dict]:
    """Merge consecutive scenes that share a chapter name."""
    out: list[dict] = []
    for sc in story["scenes"]:
        if out and out[-1]["title"] == sc["chapter"]:
            out[-1]["end"] = sc["start"] + sc["duration"]
            continue
        out.append({"title": sc["chapter"], "start": sc["start"], "end": sc["start"] + sc["duration"]})
    return out


def write_ffmetadata(story: dict, path: Path, title: str, comment: str) -> None:
    esc = lambda s: re.sub(r"([=;#\\\n])", r"\\\1", s)  # noqa: E731
    lines = [";FFMETADATA1", f"title={esc(title)}", "artist=Oswol", "album=Oswol Daily Brief", f"comment={esc(comment)}"]
    for ch in chapters(story):
        lines += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={int(ch['start'] * 1000)}", f"END={int(ch['end'] * 1000)}",
                  f"title={esc(ch['title'])}"]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def youtube_chapters(story: dict) -> str:
    rows = []
    for ch in chapters(story):
        m, s = divmod(int(ch["start"]), 60)
        rows.append(f"{m}:{s:02d} {ch['title']}")
    return "\n".join(rows)


# ---------------------------------------------------------------------------
# Video
# ---------------------------------------------------------------------------


def concat_segments(segments: list[Path], out: Path) -> Path:
    lst = out.with_suffix(".txt")
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in segments), encoding="utf-8")
    _run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(out)])
    return out


def mux(video: Path, audio: Path, srt: Path, meta: Path, out: Path) -> Path:
    _run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-i", str(audio), "-i", str(srt), "-i", str(meta),
          "-map", "0:v:0", "-map", "1:a:0", "-map", "2:s:0", "-map_metadata", "3", "-map_chapters", "3",
          "-c:v", "copy", "-c:a", "copy", "-c:s", "mov_text",
          "-metadata:s:a:0", "language=eng", "-metadata:s:s:0", "language=eng", "-metadata:s:s:0", "title=English",
          "-movflags", "+faststart", str(out)])
    return out


def probe_duration(path: Path) -> float:
    r = _run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)])
    return float(r.stdout.strip() or 0)


# ---------------------------------------------------------------------------
# Thumbnail (poster frame, brag-style: a settled frame, not a mid-animation one)
# ---------------------------------------------------------------------------


def make_thumbnail(png: Path, out_jpg: Path) -> Path:
    from PIL import Image, ImageFilter

    sharpened = png
    photocraft = os.environ.get("PHOTOCRAFT_BIN") or shutil.which("photocraft-cli")
    if photocraft:
        polished = png.with_name(png.stem + "-pc.png")
        try:
            _run([photocraft, "run", str(png), "--cmd", "filter.sharpen.unsharpMask",
                  "--params", json.dumps({"amount": 40, "radius": 0.8, "threshold": 2}), "--out", str(polished)])
            sharpened = polished
            log.info("Thumbnail polished with PhotoCraft")
        except (subprocess.CalledProcessError, OSError) as exc:
            log.warning("PhotoCraft step skipped: %s", exc)
    im = Image.open(sharpened).convert("RGB").resize((1280, 720), Image.LANCZOS)
    if sharpened == png:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=40, threshold=2))
    im.save(out_jpg, "JPEG", quality=90, optimize=True, progressive=True)
    return out_jpg
