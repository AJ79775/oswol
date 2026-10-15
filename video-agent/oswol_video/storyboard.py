"""Newsletter -> storyboard (scenes + narration) with FreeLLMAPI, plus a no-LLM fallback."""
from __future__ import annotations

import json
import logging
import re
from datetime import date

from pydantic import ValidationError

from . import factcheck
from .config import Settings
from .llm import LLMClient, extract_json
from .models import CalEvent, Mover, Narrative, Newsletter, Scene, Storyboard, Tile
from .speech import COMPANY_NAMES, split_sentences

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the producer and narrator-writer of "Oswol Daily Brief", a daily explainer video \
made from the Oswol market newsletter. Oswol is an AI market-intelligence terminal: "Calm intelligence for \
the next generation of investors." It helps people understand what moved, why it moved, who is behind the \
move, and whether the signal is real or noise. It is NOT a broker and never gives advice.

VOICE: calm, precise, warm, professional. Signal over noise. AI as a quiet host. Short spoken sentences \
(8-22 words). Explain every piece of jargon the first time in plain words (e.g. "the VIX, Wall Street's \
fear gauge"; "a 13F, the quarterly filing big funds must publish"). Someone new to markets must understand \
it; an expert must not be bored. Use uncertainty language ("may suggest", "worth monitoring", "based on \
the data available"). Never say buy, sell, invest now, guaranteed, or any recommendation.

GROUNDING (critical): use ONLY facts, names and numbers that appear in the NEWSLETTER (or the LIVE DATA / \
PREVIOUS BRIEFS blocks when provided, and say so when you use them). Never invent, round creatively, \
compute new figures, or add outside knowledge. Copy numbers exactly as written. If something is unclear, \
leave it out. Write numbers as digits ("4.21%"), not words.

NARRATION is spoken by a text-to-speech voice: write company and fund names in full in narration \
("Nvidia", not "NVDA"); tickers are fine in on-screen fields. No emoji, no markdown, no stage directions.

PACING (on-screen text must be readable while the voice speaks): on-screen labels <= 6 words, bullets <= 12 \
words, titles <= 7 words. Each scene's narration is 2-6 sentences and should explain what the visual shows, \
in the order it appears on screen. One idea per scene. Hook the viewer in the first two sentences.

DIAGRAMS ("flow" scenes) follow these rules: 3-6 nodes, a clear left-to-right causal chain \
(cause -> mechanism -> effect), at most 1-2 nodes of kind "risk", node labels <= 4 words, edge labels \
<= 14 characters. If a list says it better than a diagram, use "bullets" instead. Narrate the nodes in order.

SCENE TYPES and their fields (every scene also has: type, chapter, title, narration):
- cold_open: headline (<= 12 words), subtitle (one-line why it matters), regime (RISK-ON|RISK-OFF|MIXED|NEUTRAL or null)
- agenda: bullets = chapter names in order (3-6)
- overview: tiles = [{label, value, change_pct (number, e.g. -0.42), note}] (2-6 tiles), regime, subtitle (one-line \
plain-language takeaway shown as "AI READ"), bullets (0-4 very short signals, e.g. "Tech leading")
- movers: gainers / losers = [{symbol, name, change_pct}] (max 5 each)
- flow: nodes = [{id, label, kind: cause|mechanism|effect|risk|neutral, detail}], edges = [{from, to, label}]
- bullets: bullets = 2-5 short points
- disclosures: disclosures = [{who, role, action, asset, size, delay_days}], warning (filing delay note)
- narratives: narratives = [{name, velocity (0-100), mentions, tone: bullish|bearish|neutral|mixed, hype_risk: low|med|high}], warning
- calendar: events = [{when, event, detail, impact: high|med|low}], bullets (0-4 short backdrop facts shown beside)
- stat: stat = {value, label, context} - one number that matters, with plain-language meaning
- caution: warning = what the viewer should keep in mind (data delays, noise, uncertainty)
- recap: bullets = exactly 3 takeaways
- outro: narration = short sign-off that includes "This is not investment advice."

STRUCTURE: cold_open, agenda, then the newsletter's content in its own order using the best-fitting scene \
types (overview / movers / flow "why it moved" / disclosures / narratives / calendar / stat / bullets), a \
caution scene if the newsletter has warnings, recap, outro. Aim for 9-14 scenes.

Return ONLY a JSON object: {"title": str, "date": "YYYY-MM-DD", "regime": str|null, "summary": \
"one-sentence summary for the video description", "scenes": [ ... ]}"""


def _user_prompt(nl: Newsletter, settings: Settings, memory: str, live: str) -> str:
    words = int(settings.target_minutes * settings.words_per_minute)
    blocks = [
        f"TARGET LENGTH: about {words} spoken words in total (~{settings.target_minutes:g} minutes). "
        f"Go into detail: explain each section, why it matters and how the pieces connect.",
        f"VIDEO DATE: {nl.date}",
        "NEWSLETTER (JSON):\n" + json.dumps(nl.model_dump(exclude={"raw_text"}), ensure_ascii=False, indent=1),
    ]
    if nl.raw_text and len(nl.raw_text) > 50 and not nl.sections:
        blocks.append("NEWSLETTER FULL TEXT:\n" + nl.raw_text[:12000])
    if memory:
        blocks.append("PREVIOUS BRIEFS (for continuity only; mention at most once, label as earlier):\n" + memory)
    if live:
        blocks.append("LIVE DATA (fetched at render time from public APIs; if used, add a 'live_data' scene "
                      "with tiles and say the source and that it is a live snapshot):\n" + live)
    if nl.is_demo:
        blocks.append("NOTE: this newsletter is flagged as DEMO DATA. Say once, in the cold_open narration, "
                      "that today's figures are demonstration data.")
    return "\n\n".join(blocks)


# ---------------------------------------------------------------------------
# Parsing & normalization
# ---------------------------------------------------------------------------

LIMITS = {"tiles": 6, "gainers": 5, "losers": 5, "nodes": 6, "bullets": 5, "events": 5, "disclosures": 4,
          "narratives": 5}


def parse_storyboard(data: dict, nl: Newsletter) -> Storyboard:
    scenes = []
    for i, raw in enumerate(data.get("scenes") or []):
        if not isinstance(raw, dict):
            continue
        for key, limit in LIMITS.items():
            if isinstance(raw.get(key), list):
                raw[key] = raw[key][:limit]
        try:
            scenes.append(Scene.model_validate(raw))
        except ValidationError as exc:
            log.warning("Dropping invalid scene %d (%s): %s", i, raw.get("type"), exc.errors()[:2])
    if not scenes:
        raise ValueError("storyboard has no valid scenes")
    return Storyboard(
        title=str(data.get("title") or nl.title), date=nl.date,
        regime=data.get("regime"), summary=str(data.get("summary") or nl.summary)[:400], scenes=scenes,
    )


def finalize(board: Storyboard, nl: Newsletter) -> Storyboard:
    """Guarantee the bookends and the safety notes, whatever the LLM produced."""
    scenes = [s for s in board.scenes if s.type not in {"outro"}]
    if not scenes or scenes[0].type != "cold_open":
        scenes.insert(0, Scene(type="cold_open", chapter="Intro", headline=nl.title, subtitle=nl.summary[:160],
                               narration=f"This is your Oswol daily brief. Today: {nl.title}."))
    head = scenes[0]
    head.headline = head.headline or nl.title
    head.regime = head.regime or board.regime
    if nl.is_demo and "demo" not in head.narration.lower():
        head.narration += " Please note: today's figures are demonstration data."
    for s in scenes:
        s.chapter = s.chapter or s.title or s.type.replace("_", " ").title()
        if s.type == "disclosures" and not s.warning:
            s.warning = "Public filings are delayed, often 30 to 45 days, and may not reflect current positions."
        if s.type == "narratives" and not s.warning:
            s.warning = "Social sentiment can be noisy, manipulated, or incomplete."
        s.bullets = [b.strip()[:110] for b in s.bullets if b and b.strip()]
    agenda = next((s for s in scenes if s.type == "agenda"), None)
    if agenda is not None and not agenda.bullets:
        agenda.bullets = [s.chapter for s in scenes if s.type not in {"cold_open", "agenda", "recap"}][:6]
    scenes.append(Scene(
        type="outro", chapter="Outro", title="Signal over noise.",
        narration=next((s.narration for s in board.scenes if s.type == "outro" and s.narration.strip()), "")
        or "That's your Oswol daily brief. Stay curious, check the sources, and remember: this is not investment advice.",
        warning=nl.disclaimer or factcheck.OSWOL_DISCLAIMER,
    ))
    if "not investment advice" not in scenes[-1].narration.lower():
        scenes[-1].narration += " This is not investment advice."
    board.scenes = scenes
    board.regime = board.regime or head.regime
    return board


def allowed_integers(nl: Newsletter) -> set[int]:
    try:
        d = date.fromisoformat(nl.date)
        return {d.day, d.month, d.year}
    except ValueError:
        return set()


# ---------------------------------------------------------------------------
# LLM path
# ---------------------------------------------------------------------------


def generate(nl: Newsletter, settings: Settings, memory: str = "", live: str = "",
             live_values: list[float] | None = None) -> Storyboard:
    index = factcheck.NumberIndex(nl.full_text(), memory, live, extra_values=live_values)
    allowed = allowed_integers(nl)
    if not settings.llm_enabled:
        return _fallback(nl, index, allowed)
    client = LLMClient(settings)
    prompt = _user_prompt(nl, settings, memory, live)
    try:
        board = None
        for attempt in range(3):  # free models sometimes truncate or garble JSON: ask again
            reply = client.chat(SYSTEM_PROMPT, prompt)
            try:
                board = parse_storyboard(extract_json(reply.text), nl)
                break
            except (ValueError, json.JSONDecodeError) as exc:
                log.warning("Storyboard JSON unusable (attempt %d, %s): %s", attempt + 1, reply.model, exc)
        if board is None:
            raise ValueError("no usable storyboard JSON after 3 attempts")
        board.model = reply.model + (f" via {reply.routed_via}" if reply.routed_via else "")
        for round_no in range(2):
            issues = factcheck.find_unsupported_numbers(board, index, allowed) + factcheck.find_forbidden(board)
            if not issues:
                break
            log.info("Fact-check round %d: %d issue(s); asking the model to repair", round_no + 1, len(issues))
            listing = "\n".join(f"- scene {i.scene} {i.field}: '{i.value}' in: {i.text[:160]}" for i in issues[:40])
            repair = (prompt + "\n\nYOUR PREVIOUS STORYBOARD:\n" + board.model_dump_json(exclude={"generated_by", "model"})
                      + "\n\nTHESE ITEMS FAILED VERIFICATION (numbers not found in the sources, or advice language):\n"
                      + listing + "\nReturn the full corrected storyboard JSON. Remove or replace each item with an "
                      "exact figure from the newsletter. Keep everything else.")
            try:
                fixed = client.chat(SYSTEM_PROMPT, repair)
                board = parse_storyboard(extract_json(fixed.text), nl)
                board.model = fixed.model + (f" via {fixed.routed_via}" if fixed.routed_via else "")
            except Exception as exc:  # noqa: BLE001
                log.warning("Repair round failed: %s", exc)
                break
        board = finalize(board, nl)
        board, removed = factcheck.sanitize(board, index, allowed)
        if removed:
            log.warning("Removed %d unverified/non-compliant item(s) after repair", len(removed))
        board.generated_by = "llm"
        if len([s for s in board.scenes if s.narration.strip()]) < 4:
            raise ValueError("storyboard too thin after verification")
        return board
    except Exception as exc:  # noqa: BLE001 - always ship a video
        log.error("LLM storyboard failed (%s); using deterministic fallback", exc)
        return _fallback(nl, index, allowed)


# ---------------------------------------------------------------------------
# Deterministic fallback: no LLM needed, built straight from the sections.
# Tuned for the Oswol newsletter format (overview / movers / smart-money /
# social / macro / watchlist) and generic enough for any sectioned text.
# ---------------------------------------------------------------------------

_PCT = r"[+\-−–]?\d+(?:\.\d+)?"
_TILE_RE = re.compile(rf"\b([A-Z][A-Z0-9&.\-]{{1,9}})\s+([\d,]+(?:\.\d+)?)?\s*\(?({_PCT})%\)?")
_DAYS = r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Today|Tomorrow|Tonight|This week|Next week)"


def _num(s: str) -> float:
    return float(s.replace("−", "-").replace("–", "-").replace(",", ""))


def _name(sym: str, start: bool = False) -> str:
    name = COMPANY_NAMES.get(sym, sym)
    return name[0].upper() + name[1:] if start else name


def _clean(text: str) -> str:
    text = re.sub(r"\s*[·|]\s*", ", ", text)
    text = re.sub(r"\s*\n\s*", ". ", text)
    text = re.sub(r"\.\s*\.", ".", text)
    return text.strip()


def _direction(v: float) -> str:
    return "rose" if v > 0 else "fell" if v < 0 else "was flat at"


def _first_words(text: str, n: int = 12) -> str:
    words = text.rstrip(".").split()
    return " ".join(words[:n]) + ("…" if len(words) > n else "")


def _overview(sec, title: str) -> Scene:
    tiles = [Tile(label=sym, value=value or "", change_pct=_num(pct)) for sym, value, pct in _TILE_RE.findall(sec.content)]
    regime = re.search(r"regime:\s*([A-Z\-]+)", sec.content, flags=re.I)
    parts = []
    for t in tiles[:4]:
        who = "The VIX, Wall Street's fear gauge," if t.label == "VIX" else _name(t.label, start=True)
        if t.label == "VIX" and t.value:
            parts.append(f"{who} {_direction(t.change_pct or 0)} {abs(t.change_pct or 0):g}% to {t.value}.")
            continue
        parts.append(f"{who} {_direction(t.change_pct or 0)} {abs(t.change_pct or 0):g}%.")
    rest = [x for x in split_sentences(_clean(sec.content)) if not _TILE_RE.search(x)]
    regime_txt, takeaway = "", ""
    if regime:
        label = regime.group(1).upper()
        meaning = {"RISK-ON": "investors were willing to take more risk",
                   "RISK-OFF": "investors moved toward safety"}.get(label, "signals were mixed")
        regime_txt = f"Oswol reads the regime as {label.lower()}, which means {meaning}."
        takeaway = f"{label.title()}: {meaning}."
        rest = [x for x in rest if "regime" not in x.lower()]
    narration = " ".join(["Let's start with the big picture.", *parts, regime_txt, *rest]).strip()
    signals = [r.rstrip(".") for r in rest if len(r.split()) <= 5][:4]
    return Scene(type="overview", chapter=title, title=title, tiles=tiles[:6], subtitle=takeaway, bullets=signals,
                 regime=regime.group(1).upper() if regime else None, narration=narration)


def _movers(sec, title: str, watchlist: bool) -> Scene:
    gainers, losers = [], []
    for line in sec.content.splitlines():
        bucket = losers if re.match(r"\s*(losers?|decliners?|laggards?)", line, re.I) else gainers
        for sym, _v, pct in _TILE_RE.findall(line):
            bucket.append(Mover(symbol=sym, name=_name(sym), change_pct=_num(pct)))
    if not losers:
        losers = [m for m in gainers if m.change_pct < 0]
        gainers = [m for m in gainers if m.change_pct >= 0]
    g = ", ".join(f"{_name(m.symbol)} up {abs(m.change_pct):g}%" for m in gainers[:3])
    lz = ", ".join(f"{_name(m.symbol)} down {abs(m.change_pct):g}%" for m in losers[:3])
    intro = "On your watchlist." if watchlist else "Now the names that moved the most."
    narration = f"{intro} " + (f"On the upside: {g}. " if g else "") + (f"On the downside: {lz}. " if lz else "")
    if not watchlist:
        narration += "Big single-day moves usually follow news, earnings, or a change in expectations."
    return Scene(type="movers", chapter=title, title=title, gainers=gainers[:5], losers=losers[:5], narration=narration.strip())


def _narratives(sec, title: str) -> Scene:
    items = []
    for sent in split_sentences(_clean(sec.content))[:5]:
        vel = re.search(r"(\d{1,3})\s*/\s*100", sent)
        ment = re.search(r"(\d[\d.,]*k?)\s+mentions", sent)
        low = sent.lower()
        tone = "bearish" if any(w in low for w in ("bearish", "slowdown", "concern", "fear")) else \
               "bullish" if any(w in low for w in ("gaining", "bullish", "inflow", "surging", "peak")) else "neutral"
        name = re.split(r"\s+(narrative|story|trending|at peak|gaining|being)\b", sent)[0].strip(" .,(")
        items.append(Narrative(name=_first_words(name, 5), velocity=float(vel.group(1)) if vel else None,
                               mentions=ment.group(1) if ment else "", tone=tone))
    narration = ("Next, the stories investors are talking about online. Oswol tracks how fast each narrative "
                 "is spreading. " + " ".join(split_sentences(_clean(sec.content))))
    return Scene(type="narratives", chapter=title, title=title, narratives=items, warning=sec.warning or "",
                 narration=narration)


def _macro(sec, title: str) -> list[Scene]:
    sentences = split_sentences(_clean(sec.content))
    events, other = [], []
    for sent in sentences:
        m = re.search(_DAYS, sent)
        if m:
            event = re.split(r"\s+(?:due|on|at)\s+" + _DAYS, sent, maxsplit=1)[0]
            detail = sent.split("—", 1)[1].strip().rstrip(".") if "—" in sent else ""
            events.append(CalEvent(when=m.group(1), event=_first_words(event, 6), detail=detail, impact="high"))
        else:
            other.append(sent)
    if events:
        narration = "On the macro calendar. " + " ".join(s for s in sentences if re.search(_DAYS, s))
        if other:
            narration += " As for the backdrop: " + " ".join(other)
        return [Scene(type="calendar", chapter=title, title=title, events=events[:5],
                      bullets=[_first_words(o, 8).rstrip(".") for o in other[:4]], narration=narration)]
    return [Scene(type="bullets", chapter=title, title=title, bullets=[_first_words(o) for o in other[:5]],
                  narration=f"{title}. " + " ".join(other))]


def _generic(sec, title: str) -> Scene:
    sentences = split_sentences(_clean(sec.content))
    return Scene(type="bullets", chapter=title, title=title, bullets=[_first_words(b) for b in sentences[:5]],
                 warning=sec.warning or "", narration=f"{title}. " + " ".join(sentences))


def _scenes_from_section(sec) -> list[Scene]:
    title = sec.title.strip()
    low = (sec.id + " " + title).lower()
    if "watchlist" in low:
        return [_movers(sec, title, watchlist=True)]
    if any(k in low for k in ("overview", "market pulse")):
        return [_overview(sec, title)]
    if "mover" in low:
        return [_movers(sec, title, watchlist=False)]
    if any(k in low for k in ("social", "narrative", "sentiment")):
        return [_narratives(sec, title)]
    if any(k in low for k in ("macro", "calendar", "week ahead", "events")):
        return _macro(sec, title)
    return [_generic(sec, title)]


def _takeaways(body: list[Scene], regime: str | None) -> tuple[list[str], list[str]]:
    shown, spoken = [], []
    for s in body:
        if s.type == "overview" and s.tiles:
            lead = max((t for t in s.tiles if t.label != "VIX" and t.change_pct is not None),
                       key=lambda t: abs(t.change_pct), default=None)
            if lead:
                tag = f"{regime.title()} day" if regime else "Market tone"
                shown.append(f"{tag}: {lead.label} {lead.change_pct:+g}%")
                spoken.append(f"It was a {regime.lower() if regime else 'mixed'} session, with "
                              f"{_name(lead.label)} {'up' if lead.change_pct > 0 else 'down'} {abs(lead.change_pct):g}%.")
        elif s.type == "movers" and s.gainers and "watchlist" not in s.chapter.lower():
            top = max(s.gainers, key=lambda m: m.change_pct)
            shown.append(f"{top.name or top.symbol} led gainers, {top.change_pct:+g}%")
            spoken.append(f"{_name(top.symbol, start=True)} led the gainers, up {top.change_pct:g}%.")
        elif s.type == "narratives" and s.narratives:
            shown.append(f"Top narrative: {s.narratives[0].name}")
            spoken.append(f"The loudest story online was {s.narratives[0].name}.")
        elif s.type == "calendar" and s.events:
            ev = s.events[0]
            shown.append(f"Watch: {ev.event} ({ev.when})")
            spoken.append(f"And keep an eye on {ev.event}, due {ev.when}.")
        if len(shown) == 3:
            break
    return shown, spoken


def _fallback(nl: Newsletter, index: factcheck.NumberIndex, allowed: set[int]) -> Storyboard:
    regime = None
    m = re.search(r"\b(RISK-ON|RISK-OFF|MIXED|NEUTRAL)\b", nl.full_text())
    if m:
        regime = m.group(1)
    body: list[Scene] = []
    for sec in nl.sections:
        body += _scenes_from_section(sec)
    chapters = list(dict.fromkeys(s.chapter for s in body))
    summary_first = split_sentences(nl.summary)[0] if nl.summary else ""
    scenes = [Scene(type="cold_open", chapter="Intro", headline=nl.title, subtitle=_first_words(summary_first, 16),
                    regime=regime, narration="Welcome to the Oswol daily brief. " + nl.summary),
              Scene(type="agenda", chapter="Today", title="Today's brief", bullets=chapters[:6],
                    narration=f"Here's what we'll cover: {', '.join(chapters[:6])}.")]
    scenes += body
    warnings = [s.warning for s in nl.sections if s.warning]
    if warnings:
        scenes.append(Scene(type="caution", chapter="Keep in mind", title="Keep in mind", warning=" ".join(warnings),
                            narration="Before we wrap up, a few things to keep in mind. " + " ".join(warnings)))
    takeaways, spoken = _takeaways(body, regime)
    scenes.append(Scene(type="recap", chapter="Recap", title="Three things to remember", bullets=takeaways,
                        narration="To recap. " + " ".join(spoken)))
    board = Storyboard(title=nl.title, date=nl.date, regime=regime, summary=nl.summary[:400], scenes=scenes,
                       generated_by="fallback", model="none")
    board = finalize(board, nl)
    board, _ = factcheck.sanitize(board, index, allowed)
    return board
