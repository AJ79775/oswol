from __future__ import annotations

from datetime import date, datetime
from zoneinfo import ZoneInfo


def now(settings) -> datetime:
    tz = ZoneInfo(settings.timezone) if getattr(settings, "timezone", "") else None
    return datetime.now(tz) if tz else datetime.now().astimezone()


def today(settings) -> date:
    return now(settings).date()


def pretty_date(iso: str) -> str:
    """'2026-10-15' -> 'Thursday, October 15, 2026'."""
    try:
        d = date.fromisoformat(iso)
    except ValueError:
        return iso
    return d.strftime("%A, %B ") + str(d.day) + d.strftime(", %Y")


def short_date(iso: str) -> str:
    """'2026-10-15' -> 'THU · OCT 15 · 2026'."""
    try:
        d = date.fromisoformat(iso)
    except ValueError:
        return iso.upper()
    return f"{d.strftime('%a').upper()} · {d.strftime('%b').upper()} {d.day} · {d.year}"
