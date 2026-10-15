"""Deterministic frame capture: headless Chromium -> JPEG frames -> ffmpeg (one segment per scene).

Scenes render in parallel (RENDER_WORKERS pages), each piped straight into its
own ffmpeg encoder, then the segments are concatenated without re-encoding.
"""
from __future__ import annotations

import asyncio
import base64
import contextlib
import copy
import functools
import http.server
import logging
import threading
import time
from pathlib import Path

from ..config import Settings

log = logging.getLogger(__name__)

STATIC = Path(__file__).resolve().parent / "static"
FALLBACK_CHROMIUM = Path("/opt/pw-browsers/chromium")

ENCODE_ARGS = [
    "-c:v", "libx264", "-preset", "medium", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-vf", "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
]


@contextlib.contextmanager
def static_server():
    """Serve the stage over loopback HTTP so fonts and images load like a normal page."""
    handler = functools.partial(_QuietHandler, directory=str(STATIC))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{httpd.server_address[1]}/stage.html"
    finally:
        httpd.shutdown()


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):  # noqa: D401 - silence per-request logging
        pass


async def _launch(p, settings: Settings):
    args = ["--force-color-profile=srgb", "--hide-scrollbars", "--disable-gpu", "--font-render-hinting=none",
            "--disable-background-timer-throttling", "--disable-renderer-backgrounding"]
    if settings.chromium_path:
        return await p.chromium.launch(executable_path=settings.chromium_path, args=args)
    try:
        return await p.chromium.launch(args=args)
    except Exception:
        if FALLBACK_CHROMIUM.exists():
            return await p.chromium.launch(executable_path=str(FALLBACK_CHROMIUM), args=args)
        raise


async def _open_stage(browser, url: str, story: dict, settings: Settings):
    page = await browser.new_page(viewport={"width": settings.width, "height": settings.height}, device_scale_factor=1)
    page.on("pageerror", lambda exc: log.error("stage JS error: %s", exc))
    await page.goto(url)
    await page.evaluate("s => OSV.init(s)", story)
    return page


async def _render_scene(browser, url: str, story: dict, i: int, out: Path, settings: Settings, sem: asyncio.Semaphore):
    async with sem:
        sc = story["scenes"][i]
        t0 = time.time()
        page = await _open_stage(browser, url, story, settings)
        await page.evaluate("i => OSV.mount(i)", i)
        cdp = await page.context.new_cdp_session(page)
        cmd = ["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(settings.fps), "-c:v", "mjpeg",
               "-i", "pipe:0", *ENCODE_ARGS, "-crf", str(settings.crf), "-r", str(settings.fps),
               "-g", str(settings.fps * 2), str(out)]
        proc = await asyncio.create_subprocess_exec(*cmd, stdin=asyncio.subprocess.PIPE)
        try:
            for f in range(sc["frames"]):
                await page.evaluate("t => OSV.seek(t)", f / settings.fps)
                shot = await cdp.send("Page.captureScreenshot", {"format": "jpeg", "quality": 93, "optimizeForSpeed": True})
                proc.stdin.write(base64.b64decode(shot["data"]))
                await proc.stdin.drain()
        finally:
            proc.stdin.close()
            await proc.wait()
            await page.close()
        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg failed for scene {i}")
        log.info("Rendered scene %02d %-11s %4d frames in %5.1fs", i, sc["type"], sc["frames"], time.time() - t0)


async def _render_all(story: dict, seg_dir: Path, settings: Settings, only: list[int] | None) -> list[Path]:
    from playwright.async_api import async_playwright

    seg_dir.mkdir(parents=True, exist_ok=True)
    outs = [seg_dir / f"seg-{i:02d}.mp4" for i in range(len(story["scenes"]))]
    todo = [i for i in range(len(outs)) if only is None or i in only]
    sem = asyncio.Semaphore(max(1, settings.render_workers))
    with static_server() as url:
        async with async_playwright() as p:
            browser = await _launch(p, settings)
            try:
                await asyncio.gather(*[_render_scene(browser, url, story, i, outs[i], settings, sem) for i in todo])
            finally:
                await browser.close()
    return outs


def render_segments(story: dict, seg_dir: Path, settings: Settings, only: list[int] | None = None) -> list[Path]:
    return asyncio.run(_render_all(story, seg_dir, settings, only))


async def _stills(story: dict, shots: list[tuple[int, float, Path]], settings: Settings, captions: bool):
    from playwright.async_api import async_playwright

    story = copy.deepcopy(story)
    story["burnCaptions"] = captions
    with static_server() as url:
        async with async_playwright() as p:
            browser = await _launch(p, settings)
            try:
                page = await _open_stage(browser, url, story, settings)
                for i, t, out in shots:
                    await page.evaluate("i => OSV.mount(i)", i)
                    await page.evaluate("t => OSV.seek(t)", t)
                    await page.screenshot(path=str(out), type="png")
            finally:
                await browser.close()


def render_stills(story: dict, shots: list[tuple[int, float, Path]], settings: Settings, captions: bool = True) -> None:
    """Render single frames (scene index, local time, output png) — used for posters and previews."""
    asyncio.run(_stills(story, shots, settings, captions))
