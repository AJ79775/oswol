"""Fetch the day's newsletter from wherever it lives and normalize it."""
from __future__ import annotations

import email
import imaplib
import json
import logging
import re
from datetime import date, datetime
from email.header import decode_header, make_header
from pathlib import Path
from typing import Any

import httpx

from .config import Settings
from .models import Newsletter, Section
from .timeutil import today

log = logging.getLogger(__name__)

_DATE_FORMATS = (
    "%Y-%m-%d", "%A, %B %d, %Y", "%B %d, %Y", "%b %d, %Y", "%d %B %Y", "%d %b %Y",
    "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%a, %d %b %Y %H:%M:%S %z",
)


def parse_date(value: Any, fallback: date) -> str:
    if not value:
        return fallback.isoformat()
    text = str(value).strip()
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return fallback.isoformat()


def _headers(settings: Settings) -> dict[str, str]:
    headers = {"User-Agent": "oswol-video-agent/1.0", "Accept": "application/json, text/html;q=0.9, */*;q=0.5"}
    if settings.oswol_api_key:
        headers["x-api-key"] = settings.oswol_api_key
        headers["Authorization"] = f"Bearer {settings.oswol_api_key}"
    for pair in filter(None, (p.strip() for p in settings.source_headers.split(";"))):
        if ":" in pair:
            k, v = pair.split(":", 1)
            headers[k.strip()] = v.strip()
    return headers


# ---------------------------------------------------------------------------
# Shape normalizers
# ---------------------------------------------------------------------------


def from_json(data: dict, settings: Settings, source_url: str = "") -> Newsletter:
    """Map the Oswol newsletter JSON (and similar shapes) to a Newsletter."""
    if isinstance(data.get("newsletter"), dict):
        data = data["newsletter"]
    if isinstance(data.get("data"), dict):
        data = data["data"]
    title = data.get("title") or data.get("headline") or data.get("subject") or "Oswol Daily Brief"
    sections: list[Section] = []
    for i, raw in enumerate(data.get("sections") or []):
        if not isinstance(raw, dict):
            continue
        content = raw.get("content") or raw.get("body") or raw.get("text") or ""
        if isinstance(content, list):
            content = "\n".join(map(str, content))
        if raw.get("regime") and "regime" not in content.lower():
            content = f"{content}\nMarket regime: {raw['regime']}"
        sections.append(Section(
            id=str(raw.get("id") or f"s{i}"),
            title=str(raw.get("title") or raw.get("heading") or f"Section {i + 1}"),
            content=str(content).strip(),
            warning=raw.get("warning") or None,
        ))
    md = data.get("markdown") or data.get("content") or data.get("body") or ""
    if not sections and md:
        parsed = from_markdown(str(md), settings, source_url)
        sections = parsed.sections
        if not data.get("summary"):
            data["summary"] = parsed.summary
    return Newsletter(
        title=str(title).strip(),
        date=parse_date(data.get("date") or data.get("publishedAt") or data.get("published_at"), today(settings)),
        summary=str(data.get("summary") or "").strip(),
        sections=sections,
        disclaimer=str(data.get("disclaimer") or "").strip(),
        source_url=source_url,
        is_demo=bool(data.get("isDemoData") or data.get("is_demo") or False),
        raw_text=str(md)[:20000] if md else "",
    )


_MONTHS = ("January|February|March|April|May|June|July|August|September|October|November|December|"
           "Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec")
_BULLET = re.compile(r"^\s*[•↗▪◦·*\-–]\s+")
_SIGNOFF = re.compile(r"^(until tomorrow|see you|thanks for reading|unsubscribe|view in browser|forward this)", re.I)


def find_date(text: str) -> str | None:
    """A date written near the top of a newsletter: 2026-10-14, October 14, 2026, 14 Oct 2026 …"""
    head = "\n".join(text.splitlines()[:25])
    m = re.search(r"\b(20\d\d)-(\d\d)-(\d\d)\b", head)
    if m:
        return m.group(0)
    for pat, fmt in ((rf"\b({_MONTHS})\.?\s+(\d{{1,2}}),?\s+(20\d\d)\b", "{0} {1} {2}"),
                     (rf"\b(\d{{1,2}})\s+({_MONTHS})\.?,?\s+(20\d\d)\b", "{1} {0} {2}")):
        m = re.search(pat, head)
        if m:
            text_date = fmt.format(*m.groups()).replace("Sept", "Sep")
            for f in ("%B %d %Y", "%b %d %Y"):
                try:
                    return datetime.strptime(text_date, f).date().isoformat()
                except ValueError:
                    continue
    return None


def _is_label(line: str) -> bool:
    """ALL-CAPS section labels such as 'EARNINGS', 'QUICK HITS', 'THE BOTTOM LINE'."""
    s = line.strip()
    letters = [c for c in s if c.isalpha()]
    return (3 <= len(s) <= 40 and len(letters) >= 3 and all(c.isupper() for c in letters)
            and not s.endswith((".", ":", "!", "?")) and len(s.split()) <= 5 and not _BULLET.match(s))


def from_plain_newsletter(text: str, settings: Settings, source_url: str = "", date_hint: Any = None) -> Newsletter | None:
    """The Oswol email layout: title, intro, then ALL-CAPS section labels with story blocks or bullets."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    labels = [i for i, l in enumerate(lines) if _is_label(l)]
    if len(lines) < 4 or len(labels) < 2:
        return None
    title, intro = lines[0], " ".join(lines[1:labels[0]])
    sections: list[Section] = []
    counts: dict[str, int] = {}
    for n, start in enumerate(labels):
        label = lines[start]
        block = [l for l in lines[start + 1: labels[n + 1] if n + 1 < len(labels) else len(lines)]
                 if not _SIGNOFF.match(l)]
        if not block:
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
        counts[slug] = counts.get(slug, 0) + 1
        sid = f"{slug}-{counts[slug]}" if counts[slug] > 1 or slug not in {"in-this-issue", "markets", "quick-hits", "the-bottom-line"} else slug
        bullets = [_BULLET.sub("", l) for l in block if _BULLET.match(l)]
        if bullets and len(bullets) >= len(block) - 1:
            sections.append(Section(id=sid, title=label.title(), content="\n".join(bullets)))
            continue
        looks_like_story = len(block) >= 3 and not block[0].endswith(".") and len(block[0]) <= 160
        if looks_like_story:
            headline, rest = block[0], block[1:]
            body = [l for l in rest if not re.match(r"^(why it matters|what to watch|sources?):", l, re.I)]
            extras = [l for l in rest if re.match(r"^(why it matters|what to watch|sources?):", l, re.I)]
            content = "\n".join(body + extras)
            sections.append(Section(id=sid, title=headline, content=f"[{label.title()}]\n{content}"))
        else:
            sections.append(Section(id=sid, title=label.title(), content=" ".join(block)))
    return Newsletter(title=title, date=parse_date(date_hint or find_date(text), today(settings)), summary=intro,
                      sections=sections, source_url=source_url, raw_text=text[:20000])


def from_markdown(md: str, settings: Settings, source_url: str = "", date_hint: Any = None) -> Newsletter:
    if not re.search(r"^#{1,3}\s", md, flags=re.M):
        plain = from_plain_newsletter(md, settings, source_url, date_hint)
        if plain is not None:
            return plain
    date_hint = date_hint or find_date(md)
    title, summary_lines, sections = "", [], []
    current: dict | None = None
    for line in md.splitlines():
        h = re.match(r"^(#{1,3})\s+(.*)", line)
        if h:
            level, text = len(h.group(1)), h.group(2).strip()
            if level == 1 and not title:
                title = text
                continue
            if current:
                sections.append(current)
            current = {"title": text, "lines": []}
            continue
        if current is None:
            summary_lines.append(line)
        else:
            current["lines"].append(line)
    if current:
        sections.append(current)

    secs = []
    for i, s in enumerate(sections):
        body = "\n".join(s["lines"]).strip()
        warning = None
        quote = re.findall(r"^>\s*(?:⚠️)?\s*(.*)$", body, flags=re.M)
        if quote:
            warning = " ".join(q.strip() for q in quote if q.strip()) or None
            body = re.sub(r"^>.*$", "", body, flags=re.M).strip()
        if body or warning:
            secs.append(Section(id=f"s{i}", title=s["title"], content=body, warning=warning))
    summary = "\n".join(l for l in summary_lines if l.strip() and not re.match(r"^\*[^*]+\*$", l.strip())).strip()
    if not title:
        first = next((l.strip() for l in md.splitlines() if l.strip()), "Oswol Daily Brief")
        title = first[:140]
    if not secs and summary:
        # No headings at all: chunk paragraphs into sections so the video still has structure.
        paras = [p.strip() for p in re.split(r"\n\s*\n", summary) if p.strip()]
        summary = paras[0] if paras else ""
        for i, p in enumerate(paras[1:], start=1):
            secs.append(Section(id=f"p{i}", title=_title_from(p), content=p))
    return Newsletter(
        title=title, date=parse_date(date_hint, today(settings)), summary=summary, sections=secs,
        source_url=source_url, raw_text=md[:20000],
    )


def _title_from(paragraph: str) -> str:
    words = re.sub(r"[*_#>`]", "", paragraph).split()
    return " ".join(words[:6]).rstrip(",.;:") or "Update"


def from_html(html: str, settings: Settings, source_url: str = "") -> Newsletter:
    import trafilatura

    md = trafilatura.extract(html, output_format="markdown", include_tables=True, include_links=False,
                             include_formatting=True, favor_recall=True) or ""
    meta = trafilatura.extract_metadata(html)
    date_hint = getattr(meta, "date", None) if meta else None
    if meta and getattr(meta, "title", None) and not md.lstrip().startswith("# "):
        md = f"# {meta.title}\n\n{md}"
    return from_markdown(md, settings, source_url, date_hint=date_hint)


# ---------------------------------------------------------------------------
# Adapters
# ---------------------------------------------------------------------------


def fetch_oswol_api(settings: Settings) -> Newsletter:
    payload = {"type": "daily", "tone": "educational", "language": settings.language or "en",
               "date": today(settings).isoformat()}
    with httpx.Client(timeout=60, follow_redirects=True) as client:
        r = client.post(settings.source_url, json=payload, headers=_headers(settings))
        if r.status_code == 405:  # endpoint only supports GET
            r = client.get(settings.source_url, headers=_headers(settings))
        r.raise_for_status()
        return from_json(r.json(), settings, settings.source_url)


def fetch_url(settings: Settings) -> Newsletter:
    with httpx.Client(timeout=60, follow_redirects=True) as client:
        r = client.get(settings.source_url, headers=_headers(settings))
        r.raise_for_status()
    ctype = r.headers.get("content-type", "")
    if "json" in ctype:
        return from_json(r.json(), settings, settings.source_url)
    text = r.text
    if text.lstrip().startswith("{"):
        try:
            return from_json(json.loads(text), settings, settings.source_url)
        except json.JSONDecodeError:
            pass
    if "<html" in text[:2000].lower() or "<body" in text.lower():
        return from_html(text, settings, settings.source_url)
    return from_markdown(text, settings, settings.source_url)


def fetch_rss(settings: Settings) -> Newsletter:
    import feedparser

    with httpx.Client(timeout=60, follow_redirects=True) as client:
        r = client.get(settings.source_url, headers=_headers(settings))
        r.raise_for_status()
    feed = feedparser.parse(r.content)
    if not feed.entries:
        raise RuntimeError(f"RSS feed has no entries: {settings.source_url}")
    entry = feed.entries[0]
    html = ""
    if entry.get("content"):
        html = entry.content[0].value
    html = html or entry.get("summary", "")
    nl = from_html(f"<html><body><h1>{entry.get('title', '')}</h1>{html}</body></html>", settings,
                   entry.get("link", settings.source_url))
    nl.date = parse_date(entry.get("published") or entry.get("updated"), today(settings))
    return nl


def fetch_file(settings: Settings) -> Newsletter:
    path = Path(settings.source_file)
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".json":
        nl = from_json(json.loads(text), settings, str(path))
    elif path.suffix.lower() in {".html", ".htm"}:
        nl = from_html(text, settings, str(path))
    else:
        nl = from_markdown(text, settings, str(path))
    m = re.search(r"(20\d\d)-(\d\d)-(\d\d)", path.name)
    if m:  # a dated filename (oswol-2026-10-14.md) is the most reliable date there is
        nl.date = m.group(0)
    return nl


def fetch_imap(settings: Settings) -> Newsletter:
    if not (settings.imap_host and settings.imap_user and settings.imap_password):
        raise RuntimeError("IMAP source needs NEWSLETTER_IMAP_HOST, _USER and _PASSWORD")
    with imaplib.IMAP4_SSL(settings.imap_host) as box:
        box.login(settings.imap_user, settings.imap_password)
        box.select(settings.imap_folder, readonly=True)
        criteria = f'(FROM "{settings.imap_from}")' if settings.imap_from else "ALL"
        _, data = box.search(None, criteria)
        ids = data[0].split()
        if not ids:
            raise RuntimeError("No matching newsletter email found")
        _, msg_data = box.fetch(ids[-1], "(RFC822)")
    msg = email.message_from_bytes(msg_data[0][1])
    subject = str(make_header(decode_header(msg.get("Subject", ""))))
    html, plain = "", ""
    for part in msg.walk():
        ctype = part.get_content_type()
        if ctype == "text/html" and not html:
            html = part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", "replace")
        elif ctype == "text/plain" and not plain:
            plain = part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", "replace")
    nl = from_html(html, settings) if html else from_markdown(plain, settings)
    nl.title = subject or nl.title
    nl.date = parse_date(email.utils.parsedate_to_datetime(msg["Date"]).date().isoformat() if msg["Date"] else None,
                         today(settings))
    return nl


ADAPTERS = {
    "oswol_api": fetch_oswol_api,
    "url": fetch_url,
    "rss": fetch_rss,
    "file": fetch_file,
    "imap": fetch_imap,
}


def fetch_newsletter(settings: Settings) -> Newsletter:
    try:
        adapter = ADAPTERS[settings.source]
    except KeyError as exc:
        raise ValueError(f"Unknown NEWSLETTER_SOURCE '{settings.source}'. Use one of: {', '.join(ADAPTERS)}") from exc
    nl = adapter(settings)
    if settings.date_override:
        nl.date = parse_date(settings.date_override, today(settings))
    if not nl.sections and not nl.summary:
        raise RuntimeError("Newsletter fetched but no readable content was found")
    log.info("Fetched newsletter '%s' (%s) with %d sections", nl.title, nl.date, len(nl.sections))
    return nl
