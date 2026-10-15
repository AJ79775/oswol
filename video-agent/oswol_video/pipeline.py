"""The daily agent: newsletter -> storyboard -> voice -> motion graphics -> MP4 -> gallery."""
from __future__ import annotations

import fcntl
import json
import logging
import shutil
import time
from contextlib import contextmanager
from pathlib import Path

import httpx

from . import assemble, enrich, storyboard, tts
from .config import Settings
from .memory import Memory
from .models import Newsletter, Scene, SceneTiming, Storyboard, Tile
from .publish import day_dir, publish
from .render import renderer, timeline
from .sources import fetch_newsletter
from .timeutil import today

log = logging.getLogger(__name__)


@contextmanager
def run_lock(settings: Settings):
    settings.work_dir.mkdir(parents=True, exist_ok=True)
    fh = open(settings.work_dir / ".lock", "w")
    try:
        fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError as exc:
        raise RuntimeError("Another oswol-video run is in progress") from exc
    try:
        yield
    finally:
        fcntl.flock(fh, fcntl.LOCK_UN)
        fh.close()


def get_newsletter(settings: Settings, wait_minutes: int = 0) -> Newsletter:
    deadline = time.time() + wait_minutes * 60
    while True:
        nl = fetch_newsletter(settings)
        if not settings.require_today or nl.date == today(settings).isoformat():
            return nl
        if time.time() >= deadline:
            raise RuntimeError(f"Newsletter is dated {nl.date}, not today ({today(settings)}); giving up")
        log.info("Newsletter still dated %s; retrying in 10 minutes", nl.date)
        time.sleep(600)


def _live_scene(snap: enrich.Snapshot) -> Scene:
    spoken = []
    for t in snap.tiles[:4]:
        piece = f"{t['label']} at {t['value']}"
        if t.get("change_pct") is not None:
            piece += f", {'up' if t['change_pct'] >= 0 else 'down'} {abs(t['change_pct']):.2f}% over 24 hours"
        spoken.append(piece)
    narration = (f"For a live check at the time this video was made, here is what {' and '.join(snap.sources)} "
                 f"report: {'; '.join(spoken)}. These are live snapshots, not part of the newsletter.")
    return Scene(type="live_data", chapter="Live check", title="Live snapshot", sources=snap.sources,
                 tiles=[Tile(**t) for t in snap.tiles], narration=narration)


def script_markdown(board: Storyboard) -> str:
    out = [f"# {board.title}", f"*{board.date}* · script: {board.generated_by} {board.model}".rstrip(), ""]
    for s in board.scenes:
        out += [f"## {s.chapter}", s.narration, ""]
    return "\n".join(out)


def transcript(board: Storyboard) -> list[dict]:
    rows: list[dict] = []
    for s in board.scenes:
        if rows and rows[-1]["chapter"] == s.chapter:
            rows[-1]["text"] += " " + s.narration
        elif s.narration.strip():
            rows.append({"chapter": s.chapter, "text": s.narration})
    return rows


def notify(settings: Settings, payload: dict) -> None:
    if not settings.notify_webhook:
        return
    try:
        httpx.post(settings.notify_webhook, json=payload, timeout=20)
    except httpx.HTTPError as exc:
        log.warning("Webhook notification failed: %s", exc)


def run(settings: Settings, *, force: bool = False, wait_minutes: int = 0, newsletter: Newsletter | None = None,
        keep_intermediate: bool = False, storyboard_file: str | None = None) -> dict:
    t_start = time.time()
    with run_lock(settings):
        nl = newsletter or get_newsletter(settings, wait_minutes)
        target = day_dir(settings, nl.date)
        if (target / "meta.json").is_file() and not force:
            log.info("Video for %s already published at %s (use --force to rebuild)", nl.date, target)
            return json.loads((target / "meta.json").read_text())
        work = settings.work_dir / nl.date
        work.mkdir(parents=True, exist_ok=True)
        (work / "newsletter.json").write_text(nl.model_dump_json(indent=2), encoding="utf-8")

        memory = Memory(settings)
        context = memory.context_for(nl)
        # A live snapshot only makes sense on the day of the issue (not when re-making an older video).
        live_ok = settings.enrich_live_data and nl.date == today(settings).isoformat()
        snap = enrich.snapshot(nl, settings) if live_ok else enrich.Snapshot()
        if snap.tiles:
            log.info("Live snapshot: %d tiles from %s", len(snap.tiles), ", ".join(snap.sources))

        # 1. Storyboard (FreeLLMAPI, fact-checked; deterministic fallback)
        board_path = work / "storyboard.json"
        if storyboard_file:
            board = storyboard.from_external(nl, json.loads(Path(storyboard_file).read_text(encoding="utf-8")),
                                             memory=context, live=snap.as_prompt(), live_values=snap.values())
            board_path.write_text(board.model_dump_json(indent=2, by_alias=True), encoding="utf-8")
        elif board_path.is_file() and not force:
            board = Storyboard.model_validate_json(board_path.read_text())
        else:
            board = storyboard.generate(nl, settings, memory=context, live=snap.as_prompt(), live_values=snap.values())
            if snap.tiles and not any(s.type == "live_data" for s in board.scenes):
                at = next((i for i, s in enumerate(board.scenes) if s.type in {"caution", "recap"}), len(board.scenes) - 1)
                board.scenes.insert(at, _live_scene(snap))
            board_path.write_text(board.model_dump_json(indent=2, by_alias=True), encoding="utf-8")
        (work / "script.md").write_text(script_markdown(board), encoding="utf-8")
        log.info("Storyboard: %d scenes, %d words (%s)", len(board.scenes),
                 sum(len(s.narration.split()) for s in board.scenes), board.generated_by)

        # 2. Voice (one fixed narrator)
        timings: list[SceneTiming] = tts.narrate(board, settings, work / "audio")

        # 3. Motion graphics
        story = timeline.build_story(board, timings, nl, settings)
        (work / "story.json").write_text(json.dumps(story, indent=1), encoding="utf-8")
        segments = renderer.render_segments(story, work / "segments", settings)

        # 4. Assembly
        base = f"oswol-daily-{nl.date}"
        video_only = assemble.concat_segments(segments, work / "video-only.mp4")
        voice = assemble.master_voice(assemble.build_narration(story, timings, work / "narration.wav"), work / "voice.m4a")
        srt, vtt = work / f"{base}.srt", work / f"{base}.vtt"
        assemble.write_captions(story, srt, vtt)
        meta_txt = work / "chapters.ffmeta"
        assemble.write_ffmetadata(story, meta_txt, f"Oswol Daily Brief — {board.title}", board.summary)
        final = assemble.mux(video_only, voice, srt, meta_txt, work / f"{base}.mp4")

        poster_t = min(story["scenes"][0]["duration"] - 0.8, 4.2)
        poster_png = work / "poster.png"
        renderer.render_stills(story, [(0, poster_t, poster_png)], settings, captions=False)
        thumb = assemble.make_thumbnail(poster_png, work / "thumb.jpg")

        duration = assemble.probe_duration(final)
        meta = {
            "date": nl.date, "title": board.title, "summary": board.summary or nl.summary, "regime": board.regime,
            "duration": round(duration, 2), "bytes": final.stat().st_size, "is_demo": nl.is_demo,
            "generated_by": board.generated_by, "model": board.model,
            "voice": f"{settings.tts_engine}:{settings.tts_voice if settings.tts_engine != 'edge' else settings.edge_voice}",
            "chapters": assemble.chapters(story), "youtube_chapters": assemble.youtube_chapters(story),
            "transcript": transcript(board), "source_url": nl.source_url,
            "render_seconds": round(time.time() - t_start, 1),
        }
        published = publish(settings, nl.date, {
            "video": final, "thumb": thumb, "srt": srt, "vtt": vtt, "script": work / "script.md",
            "storyboard": board_path, "newsletter": work / "newsletter.json",
        }, meta)
        memory.remember(nl, board, published.get("video_url", ""))
        notify(settings, {"event": "oswol_video_published", "date": nl.date, "title": board.title,
                          "url": published.get("url"), "video": published.get("video_url"), "duration": meta["duration"]})
        if not keep_intermediate:
            shutil.rmtree(work / "segments", ignore_errors=True)
            for p in (video_only, work / "narration.wav", poster_png):
                p.unlink(missing_ok=True)
        log.info("Done in %.0fs: %s (%.0fs video)", time.time() - t_start, published.get("video_url"), duration)
        return published
