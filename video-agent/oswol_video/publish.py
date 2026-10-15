"""Store the day's video on disk and rebuild the static gallery, feeds and `latest` links."""
from __future__ import annotations

import json
import logging
import os
import shutil
from datetime import date, datetime, timedelta, timezone
from email.utils import format_datetime
from pathlib import Path
from xml.sax.saxutils import escape

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .config import PACKAGE_DIR, Settings
from .timeutil import pretty_date

log = logging.getLogger(__name__)
TEMPLATES = PACKAGE_DIR / "publish_templates"
STATIC = PACKAGE_DIR / "render" / "static"


def day_dir(settings: Settings, iso: str) -> Path:
    d = date.fromisoformat(iso)
    return settings.video_root / f"{d.year:04d}" / f"{d.month:02d}" / f"{d.day:02d}"


def rel_url(settings: Settings, path: Path) -> str:
    return f"{settings.public_base_url}/{path.relative_to(settings.video_root).as_posix()}"


def publish(settings: Settings, iso: str, files: dict[str, Path], meta: dict) -> dict:
    """Copy the run's outputs into VIDEO_ROOT/YYYY/MM/DD and refresh the gallery."""
    target = day_dir(settings, iso)
    target.mkdir(parents=True, exist_ok=True)
    stored = {}
    for key, src in files.items():
        if src and Path(src).is_file():
            dst = target / Path(src).name
            tmp = dst.with_suffix(dst.suffix + ".part")
            shutil.copy2(src, tmp)
            os.replace(tmp, dst)  # atomic: viewers never see half-written files
            stored[key] = dst.name
    meta = {**meta, "files": stored, "dir": target.relative_to(settings.video_root).as_posix(),
            "published_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (target / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    _link_latest(settings, target, stored)
    if settings.keep_days > 0:
        _prune(settings)
    rebuild_gallery(settings)
    meta["url"] = f"{settings.public_base_url}/{meta['dir']}/"
    meta["video_url"] = f"{settings.public_base_url}/{meta['dir']}/{stored.get('video', '')}"
    log.info("Published %s", target)
    return meta


def _link_latest(settings: Settings, target: Path, stored: dict) -> None:
    root = settings.video_root
    for name, key in (("latest.mp4", "video"), ("latest.jpg", "thumb"), ("latest.vtt", "vtt")):
        if key not in stored:
            continue
        link = root / name
        tmp = root / f".{name}.tmp"
        if tmp.is_symlink() or tmp.exists():
            tmp.unlink()
        tmp.symlink_to((target / stored[key]).relative_to(root))
        os.replace(tmp, link)


def _prune(settings: Settings) -> None:
    cutoff = date.today() - timedelta(days=settings.keep_days)
    for meta_path in settings.video_root.glob("*/*/*/meta.json"):
        try:
            d = date.fromisoformat(json.loads(meta_path.read_text())["date"])
        except (ValueError, KeyError, json.JSONDecodeError):
            continue
        if d < cutoff:
            shutil.rmtree(meta_path.parent, ignore_errors=True)
            log.info("Pruned %s (older than %d days)", meta_path.parent, settings.keep_days)


def all_videos(settings: Settings) -> list[dict]:
    items = []
    for meta_path in settings.video_root.glob("*/*/*/meta.json"):
        try:
            m = json.loads(meta_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        base = f"{settings.public_base_url}/{m['dir']}"
        m["page"] = f"{base}/"
        m["video_url"] = f"{base}/{m['files'].get('video', '')}"
        m["thumb_url"] = f"{base}/{m['files'].get('thumb', '')}"
        m["vtt_url"] = f"{base}/{m['files'].get('vtt', '')}" if m["files"].get("vtt") else ""
        m["pretty_date"] = pretty_date(m["date"])
        mins, secs = divmod(int(m.get("duration", 0)), 60)
        m["length"] = f"{mins}:{secs:02d}"
        items.append(m)
    return sorted(items, key=lambda x: x["date"], reverse=True)


def rebuild_gallery(settings: Settings) -> None:
    root = settings.video_root
    assets = root / "assets"
    (assets / "fonts").mkdir(parents=True, exist_ok=True)
    for f in (STATIC / "fonts").glob("*.woff2"):
        shutil.copy2(f, assets / "fonts" / f.name)
    shutil.copy2(STATIC / "img" / "oswol-mark.png", assets / "oswol-mark.png")
    env = Environment(loader=FileSystemLoader(str(TEMPLATES)), autoescape=select_autoescape(["html"]))
    videos = all_videos(settings)
    base = settings.public_base_url
    (root / "index.html").write_text(env.get_template("gallery.html").render(videos=videos, base=base), encoding="utf-8")
    for v in videos:
        page = root / v["dir"] / "index.html"
        page.write_text(env.get_template("video.html").render(v=v, base=base, videos=videos), encoding="utf-8")
    (root / "feed.json").write_text(json.dumps(_json_feed(videos, base), indent=2, ensure_ascii=False), encoding="utf-8")
    (root / "feed.xml").write_text(_rss(videos, base), encoding="utf-8")
    if videos:
        (root / "latest.json").write_text(json.dumps(videos[0], indent=2, ensure_ascii=False), encoding="utf-8")


def _json_feed(videos: list[dict], base: str) -> dict:
    return {"version": "https://jsonfeed.org/version/1.1", "title": "Oswol Daily Brief", "home_page_url": f"{base}/",
            "items": [{"id": v["date"], "url": v["page"], "title": v["title"], "summary": v.get("summary", ""),
                       "date_published": v.get("published_at"), "image": v["thumb_url"],
                       "attachments": [{"url": v["video_url"], "mime_type": "video/mp4",
                                        "duration_in_seconds": int(v.get("duration", 0))}]} for v in videos]}


def _rss(videos: list[dict], base: str) -> str:
    items = []
    for v in videos:
        pub = datetime.fromisoformat(v["published_at"]) if v.get("published_at") else datetime.now(timezone.utc)
        items.append(f"""<item><title>{escape(v['title'])}</title><link>{escape(v['page'])}</link>
<guid isPermaLink="false">oswol-daily-{v['date']}</guid><pubDate>{format_datetime(pub)}</pubDate>
<description>{escape(v.get('summary', ''))}</description>
<enclosure url="{escape(v['video_url'])}" type="video/mp4" length="{v.get('bytes', 0)}"/></item>""")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Oswol Daily Brief</title><link>{escape(base)}/</link>
<description>Daily AI market brief videos from Oswol. Not investment advice.</description>
{''.join(items)}</channel></rss>
"""
