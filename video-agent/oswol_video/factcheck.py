"""Trust-by-design checks for the storyboard.

1. Every number spoken or shown must exist in the newsletter (or in the
   labelled live-data snapshot). Anything else is treated as a hallucination.
2. Oswol's financial-safety rules: no buy/sell advice, no certainty language.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from .models import Scene, Storyboard

# Mirrors src/lib/compliance/financialSafety.ts in the Oswol app, plus a few spoken variants.
FORBIDDEN_PHRASES = [
    "buy this stock", "sell this stock", "guaranteed return", "risk-free", "sure thing",
    "definitely going up", "definitely going down", "will definitely", "100% certain",
    "you should buy", "you should sell", "invest now", "don't miss out", "can't lose",
    "time to buy", "time to sell", "load up on", "must buy", "must sell", "strong buy",
    "get in now", "financial advice:", "we recommend buying", "we recommend selling",
]

OSWOL_DISCLAIMER = (
    "Oswol provides market data, public-disclosure summaries, social sentiment, and AI-generated "
    "educational analysis. It does not provide investment, legal, tax, or financial advice. Public "
    "filings may be delayed, incomplete, amended, or historical. Verify original sources before "
    "making decisions."
)

# Numbers that are part of names, not claims.
_NAME_PATTERNS = [
    r"S&P\s*500", r"Nasdaq[- ]?100", r"Russell\s*[12]000", r"Dow\s*30", r"FTSE\s*100", r"Nikkei\s*225",
    r"\b\d{1,2}[- ]?(?:year|month|week|day)s?\b", r"\b\d{1,2}Y\b", r"\b\d{1,2}[- ]?yr\b", r"\bQ[1-4]\b",
    r"\b13F\b", r"\b10-[KQ]\b", r"\b8-K\b", r"\bForm\s*4\b", r"\b24/7\b", r"\bG(?:7|20)\b", r"\bWeb3\b",
    r"\bH[12]\b", r"\bFY\s?\d{2,4}\b", r"\b[A-Z]{1,4}\d{1,3}\b",
]

_NUM_RE = re.compile(
    r"(?<![\w.])(?P<sign>[+\-−–]?)\$?(?P<num>\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)"
    r"\s*(?P<suffix>%|percent|k\b|K\b|thousand|m\b|M\b|mn\b|million|b\b|B\b|bn\b|billion|t\b|T\b|trillion|bps|bp|basis points)?",
)
_MULT = {"k": 1e3, "thousand": 1e3, "m": 1e6, "mn": 1e6, "million": 1e6, "b": 1e9, "bn": 1e9,
         "billion": 1e9, "t": 1e12, "trillion": 1e12}


@dataclass(frozen=True)
class Num:
    value: float
    decimals: int
    raw: str
    has_unit: bool


def _strip_names(text: str) -> str:
    for pat in _NAME_PATTERNS:
        text = re.sub(pat, " ", text, flags=re.I if "year" in pat or "yr" in pat else 0)
    text = re.sub(r"\b\d{1,2}:\d{2}\b", " ", text)  # clock times are checked literally elsewhere
    return text


def extract_numbers(text: str) -> list[Num]:
    out: list[Num] = []
    for m in _NUM_RE.finditer(_strip_names(text or "")):
        num = m.group("num").replace(",", "")
        suffix = (m.group("suffix") or "").strip()
        decimals = len(num.split(".")[1]) if "." in num else 0
        value = abs(float(num)) * _MULT.get(suffix.lower(), 1.0)
        has_unit = bool(suffix) or "$" in m.group(0) or bool(m.group("sign")) or decimals > 0
        out.append(Num(value=value, decimals=decimals, raw=m.group(0).strip(), has_unit=has_unit))
    return out


class NumberIndex:
    """Every number that appears in the trusted source material."""

    def __init__(self, *texts: str, extra_values: list[float] | None = None):
        self.values: list[float] = []
        for t in texts:
            self.values += [n.value for n in extract_numbers(t)]
            # Also index the bare figures so "48.2k" also matches "48.2".
            self.values += [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*(?:\.\d+)?", t or "")]
        self.values += [abs(v) for v in (extra_values or [])]
        self.clock_times = set(re.findall(r"\b\d{1,2}:\d{2}\b", " ".join(texts)))

    def supports(self, n: Num) -> bool:
        tol = 0.5 * (10 ** -n.decimals) if n.decimals else max(0.5, n.value * 0.005)
        return any(abs(v - n.value) <= tol + 1e-9 for v in self.values)


def is_exempt(n: Num, allowed_ints: set[int]) -> bool:
    if n.decimals == 0 and not n.has_unit:
        iv = int(n.value)
        if iv < 10 or iv in allowed_ints or 1990 <= iv <= 2100:
            return True
    return False


@dataclass
class Issue:
    scene: int
    field: str
    value: str
    text: str


def _scene_texts(scene: Scene) -> list[tuple[str, str]]:
    pairs = [("narration", scene.narration), ("title", scene.title), ("headline", scene.headline),
             ("subtitle", scene.subtitle), ("warning", scene.warning)]
    pairs += [(f"bullets[{i}]", b) for i, b in enumerate(scene.bullets)]
    for i, t in enumerate(scene.tiles):
        pairs += [(f"tiles[{i}].value", t.value), (f"tiles[{i}].note", t.note)]
        if t.change_pct is not None:
            pairs.append((f"tiles[{i}].change_pct", f"{t.change_pct}%"))
    for name in ("gainers", "losers"):
        for i, m in enumerate(getattr(scene, name)):
            pairs.append((f"{name}[{i}].change_pct", f"{m.change_pct}%"))
    for i, n in enumerate(scene.nodes):
        pairs += [(f"nodes[{i}].label", n.label), (f"nodes[{i}].detail", n.detail)]
    for i, e in enumerate(scene.edges):
        pairs.append((f"edges[{i}].label", e.label))
    for i, d in enumerate(scene.disclosures):
        pairs += [(f"disclosures[{i}].size", d.size)]
        if d.delay_days is not None:
            pairs.append((f"disclosures[{i}].delay_days", f"{d.delay_days} days"))
    for i, nv in enumerate(scene.narratives):
        pairs.append((f"narratives[{i}].mentions", nv.mentions))
        if nv.velocity is not None:
            pairs.append((f"narratives[{i}].velocity", f"{nv.velocity}%"))
    for i, ev in enumerate(scene.events):
        pairs += [(f"events[{i}].detail", ev.detail), (f"events[{i}].event", ev.event)]
    if scene.stat:
        pairs += [("stat.value", scene.stat.value), ("stat.context", scene.stat.context)]
    return [(f, t) for f, t in pairs if t]


def find_unsupported_numbers(board: Storyboard, index: NumberIndex, allowed_ints: set[int]) -> list[Issue]:
    issues: list[Issue] = []
    for si, scene in enumerate(board.scenes):
        if scene.type == "outro":
            continue
        for field, text in _scene_texts(scene):
            for n in extract_numbers(text):
                if is_exempt(n, allowed_ints) or index.supports(n):
                    continue
                issues.append(Issue(scene=si, field=field, value=n.raw, text=text))
    return issues


def find_forbidden(board: Storyboard) -> list[Issue]:
    issues = []
    for si, scene in enumerate(board.scenes):
        for field, text in _scene_texts(scene):
            low = text.lower()
            for phrase in FORBIDDEN_PHRASES:
                if phrase in low:
                    issues.append(Issue(scene=si, field=field, value=phrase, text=text))
    return issues


_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"'(])")


def _drop_sentences(text: str, bad_values: set[str], forbidden: bool) -> str:
    kept = []
    for sent in _SENT_SPLIT.split(text):
        low = sent.lower()
        if any(v and v in sent for v in bad_values):
            continue
        if forbidden and any(p in low for p in FORBIDDEN_PHRASES):
            continue
        kept.append(sent)
    return " ".join(kept).strip()


def sanitize(board: Storyboard, index: NumberIndex, allowed_ints: set[int]) -> tuple[Storyboard, list[Issue]]:
    """Last line of defence: remove anything that is still unsupported or non-compliant."""
    removed: list[Issue] = []
    for _ in range(3):  # a couple of passes, since removing items can shift indices
        issues = find_unsupported_numbers(board, index, allowed_ints) + find_forbidden(board)
        if not issues:
            break
        removed += issues
        by_scene: dict[int, list[Issue]] = {}
        for iss in issues:
            by_scene.setdefault(iss.scene, []).append(iss)
        for si, scene_issues in by_scene.items():
            s = board.scenes[si]
            bad = {i.value for i in scene_issues}
            fields = {i.field for i in scene_issues}
            forbidden = any(i.value in FORBIDDEN_PHRASES for i in scene_issues)
            for name in ("narration", "title", "headline", "subtitle", "warning"):
                if name in fields:
                    setattr(s, name, _drop_sentences(getattr(s, name), bad, forbidden))
            s.bullets = [b for i, b in enumerate(s.bullets) if f"bullets[{i}]" not in fields]
            s.tiles = [t for i, t in enumerate(s.tiles)
                       if f"tiles[{i}].value" not in fields and f"tiles[{i}].change_pct" not in fields]
            for i, t in enumerate(s.tiles):
                if f"tiles[{i}].note" in fields:
                    t.note = ""
            s.gainers = [m for i, m in enumerate(s.gainers) if f"gainers[{i}].change_pct" not in fields]
            s.losers = [m for i, m in enumerate(s.losers) if f"losers[{i}].change_pct" not in fields]
            for i, n in enumerate(s.nodes):
                if f"nodes[{i}].detail" in fields:
                    n.detail = ""
                if f"nodes[{i}].label" in fields:
                    n.label = re.sub(_NUM_RE, "", n.label).strip() or n.label
            for i, e in enumerate(s.edges):
                if f"edges[{i}].label" in fields:
                    e.label = ""
            for i, d in enumerate(s.disclosures):
                if f"disclosures[{i}].size" in fields:
                    d.size = ""
                if f"disclosures[{i}].delay_days" in fields:
                    d.delay_days = None
            for i, nv in enumerate(s.narratives):
                if f"narratives[{i}].mentions" in fields:
                    nv.mentions = ""
                if f"narratives[{i}].velocity" in fields:
                    nv.velocity = None
            s.events = [ev for i, ev in enumerate(s.events) if f"events[{i}].event" not in fields]
            for ev in s.events:
                if any(v in ev.detail for v in bad):
                    ev.detail = ""
            if s.stat and ("stat.value" in fields or "stat.context" in fields):
                if "stat.value" in fields:
                    s.stat = None
                else:
                    s.stat.context = ""
    # Scenes that lost all their spoken content are removed (except bookends).
    board.scenes = [s for s in board.scenes if s.narration.strip() or s.type in {"outro"}]
    return board, removed
