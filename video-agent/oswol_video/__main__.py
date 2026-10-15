"""oswol-video command line.

  python -m oswol_video run            make (and publish) today's video
  python -m oswol_video run --force    rebuild even if today's video exists
  python -m oswol_video doctor         check every dependency and service
  python -m oswol_video script         write only the storyboard with FreeLLMAPI (fast prompt test)
  python -m oswol_video preview        render one still per scene for review (no video)
  python -m oswol_video gallery        rebuild the gallery pages and feeds
  python -m oswol_video voices         list voices / write a voice sample
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import shutil
import subprocess
import sys
from pathlib import Path

from .config import load_settings


def _setup_logging(verbose: bool) -> None:
    logging.basicConfig(level=logging.DEBUG if verbose else logging.INFO,
                        format="%(asctime)s %(levelname)-7s %(name)s: %(message)s", datefmt="%H:%M:%S")
    for noisy in ("httpx", "httpcore", "phonemizer", "openai", "PIL"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def _settings(args):
    s = load_settings()
    if getattr(args, "no_llm", False):
        s.llm_enabled = False
    if getattr(args, "minutes", None):
        s.target_minutes = args.minutes
    if getattr(args, "file", None):
        s.source, s.source_file = "file", args.file
    if getattr(args, "date", None):
        s.date_override = args.date
    return s


def cmd_run(args) -> int:
    from . import pipeline

    s = _settings(args)
    s.ensure_dirs()
    result = pipeline.run(s, force=args.force, wait_minutes=args.wait, keep_intermediate=args.keep,
                          storyboard_file=args.storyboard)
    print(json.dumps({k: result.get(k) for k in ("date", "title", "duration", "url", "video_url")}, indent=2))
    return 0


def cmd_preview(args) -> int:
    from . import storyboard, tts
    from .render import renderer, timeline
    from .sources import fetch_newsletter

    s = _settings(args)
    nl = fetch_newsletter(s)
    out = Path(args.out or (s.work_dir / f"preview-{nl.date}"))
    out.mkdir(parents=True, exist_ok=True)
    board = storyboard.generate(nl, s)
    (out / "storyboard.json").write_text(board.model_dump_json(indent=2, by_alias=True))
    timings = tts.narrate(board, s, out / "audio")
    story = timeline.build_story(board, timings, nl, s)
    shots = [(i, max(0.5, min(sc["duration"] - 0.6, sc["speechEnd"] - 0.3)), out / f"scene-{i:02d}-{sc['type']}.png")
             for i, sc in enumerate(story["scenes"])]
    renderer.render_stills(story, shots, s)
    print(f"Wrote {len(shots)} stills + storyboard.json to {out}")
    return 0


def cmd_script(args) -> int:
    """Only the storyboard: test the FreeLLMAPI prompt in seconds, without voice or rendering."""
    from . import storyboard
    from .sources import fetch_newsletter

    s = _settings(args)
    nl = fetch_newsletter(s)
    if args.dump_prompt:
        Path(args.dump_prompt).write_text("=== SYSTEM PROMPT ===\n" + storyboard.load_system_prompt()
                                          + "\n\n=== USER MESSAGE ===\n" + storyboard._user_prompt(nl, s, "", ""),
                                          encoding="utf-8")
        print(f"Prompt written to {args.dump_prompt}")
    board = storyboard.generate(nl, s)
    out = Path(args.out or (s.work_dir / nl.date / "storyboard-draft.json"))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(board.model_dump_json(indent=2, by_alias=True), encoding="utf-8")
    words = sum(len(x.narration.split()) for x in board.scenes)
    print(f"\n{board.title}  ({nl.date})")
    print(f"script by: {board.generated_by}  model: {board.model}")
    print(f"{len(board.scenes)} scenes, {words} words, about {words / s.words_per_minute:.1f} min")
    for i, x in enumerate(board.scenes):
        print(f"  {i:02d} {x.type:<11} {x.chapter[:18]:<18} {x.title or x.headline}")
    print(f"\nSaved to {out}\nRender it with: oswol-video run --file <newsletter> --storyboard {out} --force")
    return 0 if board.generated_by == "llm" or args.no_llm else 2


def cmd_gallery(args) -> int:
    from .publish import rebuild_gallery

    s = _settings(args)
    rebuild_gallery(s)
    print(f"Gallery rebuilt in {s.video_root}")
    return 0


def cmd_voices(args) -> int:
    from . import tts

    s = _settings(args)
    if args.voice:
        s.tts_voice = args.voice
    engine = tts.make_engine(s)
    if hasattr(engine, "kokoro") and not args.sample:
        print("\n".join(sorted(v for v in engine.kokoro.get_voices() if v[:2] in {"af", "am", "bf", "bm"})))
        return 0
    import soundfile as sf

    audio, _ = tts.narrate_scene(engine, args.text, s.sentence_pause, min_duration=0)
    path = Path(args.sample or "voice-sample.wav")
    sf.write(str(path), audio, tts.SAMPLE_RATE)
    print(f"Wrote {path} ({len(audio) / tts.SAMPLE_RATE:.1f}s) with {engine.signature()}")
    return 0


def cmd_doctor(args) -> int:
    s = _settings(args)
    ok = True

    def check(name: str, fn):
        nonlocal ok
        try:
            detail = fn()
            print(f"  ✔ {name}" + (f" — {detail}" if detail else ""))
        except Exception as exc:  # noqa: BLE001
            ok = False
            print(f"  ✘ {name} — {exc}")

    print("oswol-video doctor")
    check("ffmpeg", lambda: subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True, check=True).stdout.split("\n")[0])
    check("chromium (playwright)", _check_chromium(s))
    check(f"voice: {s.tts_engine}", lambda: __import__("oswol_video.tts", fromlist=["x"]).make_engine(s).signature())
    if s.llm_enabled:
        from .llm import LLMClient

        check(f"LLM at {s.llm_base_url}", lambda: LLMClient(s).ping())
    check(f"newsletter source: {s.source}", lambda: (lambda nl: f"'{nl.title}' ({nl.date}, {len(nl.sections)} sections)")(
        __import__("oswol_video.sources", fromlist=["x"]).fetch_newsletter(s)))
    check(f"storage {s.video_root}", lambda: _writable(s.video_root))
    check(f"work dir {s.work_dir}", lambda: _writable(s.work_dir))
    if s.openviking_url:
        import httpx

        check(f"OpenViking {s.openviking_url}", lambda: httpx.get(s.openviking_url.rstrip("/") + "/health", timeout=10).status_code)
    print("All good." if ok else "Some checks failed.")
    return 0 if ok else 1


def _check_chromium(s):
    def fn():
        from .render import renderer

        story = {"width": 320, "height": 180, "fps": 1, "total": 1, "dateLabel": "", "dateLong": "", "isDemo": False,
                 "burnCaptions": False, "site": "", "title": "", "names": {}, "chapters": [{"start": 0, "label": "x"}],
                 "scenes": [{"index": 0, "type": "caution", "start": 0, "duration": 1, "frames": 1, "number": "",
                             "chapter": "x", "speechEnd": 1, "data": {"warning": "ok"}, "reveals": {}, "warnAt": -1, "captions": []}]}
        tmp = Path(s.work_dir) / ".doctor.png"
        renderer.render_stills(story, [(0, 0.5, tmp)], s)
        tmp.unlink(missing_ok=True)
        return "rendered a test frame"
    return fn


def _writable(p: Path) -> str:
    p.mkdir(parents=True, exist_ok=True)
    probe = p / ".write-test"
    probe.write_text("ok")
    probe.unlink()
    free = shutil.disk_usage(p).free / 1e9
    return f"writable, {free:.1f} GB free"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="oswol-video", description="Oswol Daily Brief video agent")
    ap.add_argument("-v", "--verbose", action="store_true")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="make today's video")
    r.add_argument("--force", action="store_true", help="rebuild even if already published")
    r.add_argument("--wait", type=int, default=int(os.environ.get("NEWSLETTER_WAIT_MINUTES", "0") or 0), help="minutes to wait for today's newsletter (with NEWSLETTER_REQUIRE_TODAY=1)")
    r.add_argument("--keep", action="store_true", help="keep intermediate segments")
    r.add_argument("--no-llm", action="store_true", help="skip the LLM and use the template script")
    r.add_argument("--minutes", type=float, help="target length in minutes")
    r.add_argument("--file", help="use a local newsletter file (.json/.md/.html/.txt)")
    r.add_argument("--date", help="issue date YYYY-MM-DD (default: from the file name or text, else today)")
    r.add_argument("--storyboard", help="render this storyboard JSON instead of asking the LLM (still fact-checked)")
    p = sub.add_parser("preview", help="render one still per scene")
    p.add_argument("--out")
    p.add_argument("--no-llm", action="store_true")
    p.add_argument("--file")
    p.add_argument("--date")
    sc = sub.add_parser("script", help="write only the storyboard with the LLM (fast prompt test)")
    sc.add_argument("--file")
    sc.add_argument("--date")
    sc.add_argument("--out", help="where to save the storyboard JSON")
    sc.add_argument("--dump-prompt", help="also save the exact system + user prompt to this file")
    sc.add_argument("--no-llm", action="store_true")
    sc.add_argument("--minutes", type=float)
    sub.add_parser("gallery", help="rebuild gallery and feeds")
    sub.add_parser("doctor", help="check dependencies and services")
    v = sub.add_parser("voices", help="list voices or write a sample")
    v.add_argument("--voice")
    v.add_argument("--sample", help="write a WAV sample to this path")
    v.add_argument("--text", default="Good morning. This is your Oswol daily brief: calm intelligence for the next generation of investors.")
    args = ap.parse_args(argv)
    _setup_logging(args.verbose)
    return {"run": cmd_run, "script": cmd_script, "preview": cmd_preview, "gallery": cmd_gallery, "doctor": cmd_doctor, "voices": cmd_voices}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
