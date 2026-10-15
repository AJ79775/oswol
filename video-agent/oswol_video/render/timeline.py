"""Build the render plan: frame-exact scene offsets, item reveal times, captions."""
from __future__ import annotations

import re
from datetime import date

from ..models import Cue, Newsletter, Scene, SceneTiming, Storyboard
from ..speech import COMPANY_NAMES
from ..timeutil import short_date

_STOP = set("""a an the and or of to in on for with at by from as is are was were be been it its this that these those
into over under after before about than then so but not no yes we you your our their they them he she his her
today todays day week up down more less most least has have had will would could may might can just also very
""".split())

CAPTION_CHARS = 96


def _words(text: str) -> list[str]:
    return [w for w in re.findall(r"[A-Za-z][A-Za-z0-9&.\-']+|\d[\d.,]*", text.lower()) if w not in _STOP and len(w) > 2]


def _keywords_for(group: str, item) -> list[str]:
    if group == "tiles":
        return [item.label.lower(), *(_words(COMPANY_NAMES.get(item.label, "")))]
    if group in {"gainers", "losers"}:
        return [item.symbol.lower(), *(_words(item.name or COMPANY_NAMES.get(item.symbol, "")))]
    if group == "nodes":
        return _words(item.label) + _words(item.detail)[:2]
    if group == "events":
        return _words(item.event) + _words(item.when)
    if group == "narratives":
        return _words(item.name)
    if group == "disclosures":
        return _words(item.who) + _words(item.asset)
    return _words(str(item))  # bullets


def _match(keywords: list[str], cues: list[Cue], from_idx: int) -> tuple[int, float] | None:
    """Best cue (at or after from_idx) for these keywords, and where in the sentence they occur (0..1)."""
    if not keywords:
        return None
    best = None
    for ci in range(from_idx, len(cues)):
        low = cues[ci].text.lower()
        hits = [low.find(k) for k in keywords if k and low.find(k) >= 0]
        if not hits:
            continue
        score = len(hits)
        if best is None or score > best[0]:
            best = (score, ci, min(hits) / max(1, len(low)))
        if score >= max(2, len(keywords) // 2):
            break
    if best is None:
        return None
    return best[1], best[2]


def reveal_times(items: list, group: str, cues: list[Cue], speech_end: float) -> list[float]:
    n = len(items)
    if n == 0:
        return []
    raw: list[float | None] = []
    ci = 0
    for item in items:
        m = _match(_keywords_for(group, item), cues, ci)
        if m is None:
            raw.append(None)
            continue
        ci, frac = m
        c = cues[ci]
        raw.append(c.start + frac * (c.end - c.start) - 0.2)
    if all(r is None for r in raw):
        first = cues[0].start if cues else 0.6
        span = max(1.0, (speech_end - first) * 0.8)
        return [round(first + span * i / n, 3) for i in range(n)]
    # Fill gaps by interpolating between known neighbours.
    known = [(i, r) for i, r in enumerate(raw) if r is not None]
    out = []
    for i, r in enumerate(raw):
        if r is not None:
            out.append(r)
            continue
        prev = next(((j, v) for j, v in reversed(known) if j < i), None)
        nxt = next(((j, v) for j, v in known if j > i), None)
        if prev and nxt:
            out.append(prev[1] + (nxt[1] - prev[1]) * (i - prev[0]) / (nxt[0] - prev[0]))
        elif prev:
            out.append(prev[1] + 0.6 * (i - prev[0]))
        else:
            out.append(max(0.5, nxt[1] - 0.6 * (nxt[0] - i)))
    # Monotonic, readable spacing, inside the scene.
    fixed, last = [], 0.3
    for v in out:
        v = max(v, last + 0.18, 0.45)
        fixed.append(round(min(v, max(0.5, speech_end - 0.4)), 3))
        last = fixed[-1]
    return fixed


def caption_chunks(cues: list[Cue]) -> list[dict]:
    chunks = []
    for c in cues:
        text = c.text.strip()
        if len(text) <= CAPTION_CHARS:
            chunks.append({"start": c.start, "end": c.end, "text": text})
            continue
        words, parts, buf = text.split(), [], ""
        n_parts = -(-len(text) // CAPTION_CHARS)
        target = len(text) / n_parts
        for w in words:
            if buf and len(buf) + 1 + len(w) > target and len(parts) < n_parts - 1:
                parts.append(buf)
                buf = w
            else:
                buf = f"{buf} {w}".strip()
        parts.append(buf)
        total = sum(len(p) for p in parts)
        t = c.start
        for p in parts:
            d = (c.end - c.start) * len(p) / total
            chunks.append({"start": round(t, 3), "end": round(t + d, 3), "text": p})
            t += d
    return chunks


def frame_counts(timings: list[SceneTiming], fps: int) -> list[int]:
    return [max(1, round(t.duration * fps)) for t in timings]


def build_story(board: Storyboard, timings: list[SceneTiming], nl: Newsletter, settings) -> dict:
    fps = settings.fps
    counts = frame_counts(timings, fps)
    scenes, start, number = [], 0.0, 0
    for scene, timing, n in zip(board.scenes, timings, counts):
        duration = n / fps
        speech_end = timing.cues[-1].end if timing.cues else duration - 1.0
        if scene.type not in {"cold_open", "agenda", "recap", "outro", "caution"}:
            number += 1
        groups = {}
        for g in ("tiles", "gainers", "losers", "nodes", "bullets", "events", "narratives", "disclosures"):
            items = getattr(scene, g)
            if items:
                groups[g] = reveal_times(items, g, timing.cues, speech_end)
        if scene.type == "movers" and "gainers" in groups and "losers" in groups:
            # Losers never appear before the last gainer: the narration moves top to bottom.
            floor = max(groups["gainers"]) + 0.2
            groups["losers"] = [max(v, floor + 0.12 * i) for i, v in enumerate(groups["losers"])]
        scenes.append({
            "index": timing.index, "type": scene.type, "start": round(start, 4), "duration": round(duration, 4),
            "frames": n, "number": f"{number:02d}" if number else "", "chapter": scene.chapter,
            "speechEnd": round(speech_end, 3), "data": _scene_data(scene), "reveals": groups,
            "warnAt": _warn_time(scene, timing.cues, speech_end), "captions": caption_chunks(timing.cues),
        })
        start += duration
    try:
        long_date = date.fromisoformat(nl.date).strftime("%B ") + str(date.fromisoformat(nl.date).day) + \
            date.fromisoformat(nl.date).strftime(", %Y")
    except ValueError:
        long_date = nl.date
    return {
        "width": settings.width, "height": settings.height, "fps": fps, "total": round(start, 4),
        "dateLabel": short_date(nl.date), "dateLong": long_date, "isDemo": nl.is_demo,
        "burnCaptions": settings.burn_captions, "site": "oswol.com", "title": board.title, "names": COMPANY_NAMES,
        "chapters": [{"start": s["start"], "label": s["chapter"]} for s in scenes],
        "scenes": scenes,
    }


def _warn_time(scene: Scene, cues: list[Cue], speech_end: float) -> float:
    if not scene.warning:
        return -1
    for c in cues:
        low = c.text.lower()
        if any(k in low for k in ("delay", "noisy", "noise", "keep in mind", "caution", "not reflect", "manipulat")):
            return round(c.start - 0.2, 3)
    return round(max(0.6, speech_end * 0.7), 3)


def _scene_data(scene: Scene) -> dict:
    d = scene.model_dump(by_alias=True, exclude={"narration"})
    return d
