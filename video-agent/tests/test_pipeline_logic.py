"""Unit tests for the parts that decide what the video says and when things appear.

Run:  .venv/bin/python -m pytest -q tests
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from oswol_video import factcheck, storyboard
from oswol_video.config import load_settings
from oswol_video.llm import LLMReply, extract_json
from oswol_video.models import Cue, Newsletter, Storyboard
from oswol_video.render import timeline
from oswol_video.sources import from_json, from_markdown
from oswol_video.speech import split_sentences, to_speech

ROOT = Path(__file__).resolve().parents[1]
NL = Newsletter.model_validate_json((ROOT / "samples" / "oswol-demo-newsletter.json").read_text())


# ---------------------------------------------------------------- sources

def test_oswol_api_shape_is_normalized():
    raw = {"title": "T", "date": "Thursday, October 15, 2026", "summary": "S", "isDemoData": True,
           "sections": [{"id": "overview", "title": "Market Overview", "content": "SPY +0.68%", "regime": "RISK-ON"}]}
    nl = from_json(raw, load_settings())
    assert nl.date == "2026-10-15" and nl.is_demo
    assert "Market regime: RISK-ON" in nl.sections[0].content


def test_markdown_sections_and_warnings():
    md = "# Big day\n*Oct 15*\n\nIntro line.\n\n## Movers\nNVDA +4.21%\n> ⚠️ Filings are delayed.\n\n## Macro\nCPI Friday."
    nl = from_markdown(md, load_settings())
    assert nl.title == "Big day" and nl.summary == "Intro line."
    assert [s.title for s in nl.sections] == ["Movers", "Macro"]
    assert nl.sections[0].warning == "Filings are delayed."


# ---------------------------------------------------------------- fact-check

def test_numbers_must_come_from_the_newsletter():
    index = factcheck.NumberIndex(NL.full_text())
    ok = factcheck.extract_numbers("Nvidia rose 4.21% and the VIX fell to 13.42.")
    assert all(index.supports(n) for n in ok)
    bad = factcheck.extract_numbers("Nvidia rose 7.9% to $1,234.")
    assert not any(index.supports(n) for n in bad)


def test_rounding_is_allowed_but_not_invention():
    index = factcheck.NumberIndex("AMD +4.27%")
    assert index.supports(factcheck.extract_numbers("about 4.3%")[0])
    assert not index.supports(factcheck.extract_numbers("about 5.3%")[0])


def test_names_with_numbers_are_not_claims():
    assert factcheck.extract_numbers("The S&P 500 and the Nasdaq-100 and the 10-year yield in Q1") == []


def test_sanitize_drops_unverified_sentences_and_advice():
    board = Storyboard(title="t", date="2026-10-15", scenes=[
        {"type": "bullets", "narration": "Nvidia rose 4.21%. Analysts expect 12.5% more. You should buy now.",
         "bullets": ["NVDA +4.21%", "Target +12.5%"]},
        {"type": "outro", "narration": "Bye."}])
    board, removed = factcheck.sanitize(board, factcheck.NumberIndex(NL.full_text()), set())
    s = board.scenes[0]
    assert s.narration == "Nvidia rose 4.21%."
    assert s.bullets == ["NVDA +4.21%"]
    assert removed


# ---------------------------------------------------------------- speech

def test_speech_normalization():
    out = to_speech("NVDA +4.21% while TSLA −2.36%; SPY ETF; $1–5M; 10Y at 4.28%; CPI YoY.")
    assert "Nvidia up 4.21 percent" in out
    assert "Tesla down 2.36 percent" in out
    assert "1 to 5 million dollars" in out
    assert "10-year" in out and "C P I year over year" in out


def test_sentence_split_keeps_abbreviations():
    assert split_sentences("The U.S. dollar rose. Yields fell!") == ["The U.S. dollar rose.", "Yields fell!"]


# ---------------------------------------------------------------- storyboard (LLM path, mocked)

LLM_BOARD = {
    "title": "Chips lead a risk-on day", "date": "2026-10-15", "regime": "RISK-ON",
    "summary": "Semis led as AI spending confidence held.",
    "scenes": [
        {"type": "cold_open", "chapter": "Intro", "headline": "Chips lead a risk-on day",
         "narration": "Chips led the market today. Here is why it matters."},
        {"type": "overview", "chapter": "Market Overview", "title": "The big picture",
         "tiles": [{"label": "QQQ", "change_pct": 1.12}, {"label": "VIX", "value": "13.42", "change_pct": -4.82}],
         "narration": "The Nasdaq-100 fund rose 1.12%. The VIX fell 4.82% to 13.42."},
        {"type": "movers", "chapter": "Top Movers", "gainers": [{"symbol": "NVDA", "change_pct": 4.21}],
         "losers": [{"symbol": "TSLA", "change_pct": -9.99}],
         "narration": "Nvidia gained 4.21%. Tesla dropped 9.99%."},
        {"type": "recap", "chapter": "Recap", "bullets": ["Chips led", "Fear eased", "Filings lag"],
         "narration": "Three things to remember."},
        {"type": "outro", "chapter": "Outro", "narration": "That's the brief."},
    ],
}


def test_llm_storyboard_is_repaired_or_sanitized(monkeypatch):
    calls = []

    def fake_chat(self, system, user, **kw):
        calls.append(user)
        # The model "fixes" the invented Tesla number on the repair round.
        board = json.loads(json.dumps(LLM_BOARD))
        if len(calls) > 1:
            board["scenes"][2]["losers"][0]["change_pct"] = -2.36
            board["scenes"][2]["narration"] = "Nvidia gained 4.21%. Tesla dropped 2.36%."
        return LLMReply(text=json.dumps(board), model="fake-model", routed_via="test/fake")

    monkeypatch.setattr("oswol_video.llm.LLMClient.chat", fake_chat)
    s = load_settings(llm_enabled=True)
    board = storyboard.generate(NL, s)
    assert board.generated_by == "llm" and len(calls) == 2
    assert "9.99" in calls[1]  # the repair prompt named the bad number
    movers = next(x for x in board.scenes if x.type == "movers")
    assert movers.losers[0].change_pct == -2.36
    assert board.scenes[0].type == "cold_open" and board.scenes[-1].type == "outro"
    assert "not investment advice" in board.scenes[-1].narration.lower()
    assert "demonstration data" in board.scenes[0].narration  # demo newsletters are labelled


def test_llm_failure_falls_back(monkeypatch):
    def boom(self, *a, **k):
        raise RuntimeError("all providers down")

    monkeypatch.setattr("oswol_video.llm.LLMClient.chat", boom)
    board = storyboard.generate(NL, load_settings(llm_enabled=True))
    assert board.generated_by == "fallback"
    assert {"cold_open", "overview", "movers", "recap", "outro"} <= {s.type for s in board.scenes}


def test_extract_json_tolerates_fences_and_trailing_commas():
    assert extract_json('Sure!\n```json\n{"a": [1, 2,], "b": "x"}\n```') == {"a": [1, 2], "b": "x"}


# ---------------------------------------------------------------- timeline

def test_reveals_follow_the_narration():
    board = storyboard.generate(NL, load_settings(llm_enabled=False))
    movers = next(s for s in board.scenes if s.type == "movers")
    cues = [Cue(start=1.0, end=3.0, text="Now the names that moved the most."),
            Cue(start=3.3, end=9.0, text="On the upside: Nvidia up 4.21%, AMD up 4.27%, Meta up 1.84%."),
            Cue(start=9.3, end=14.0, text="On the downside: Tesla down 2.36%, Intel down 1.82%.")]
    times = timeline.reveal_times(movers.gainers, "gainers", cues, 14.0)
    assert times == sorted(times) and 3.0 < times[0] < times[1] < 9.0
    lose = timeline.reveal_times(movers.losers, "losers", cues, 14.0)
    assert lose[0] > 9.0


def test_captions_are_chunked():
    long = Cue(start=0, end=10, text="word " * 60)
    chunks = timeline.caption_chunks([long])
    assert len(chunks) >= 3 and all(len(c["text"]) <= timeline.CAPTION_CHARS + 12 for c in chunks)
    assert chunks[-1]["end"] == pytest.approx(10, abs=0.01)


# ---------------------------------------------------------------- Oswol plain-text email layout

PLAIN = """Banks Split on Q3, Chips Rally
Good morning! Earnings diverged today.
IN THIS ISSUE
• Bank A beats on trading.
• Bank B misses after a $1.2 billion fine.
EARNINGS
Bank A Tops Estimates on $909 Million Trading Beat
Strong trading lifted results.
Bank A posted EPS of $3.03, beating by $0.11.
Why it matters: Trading desks profit when markets move.
What to watch: Fourth-quarter dealmaking.
Sources: Bank A tops estimates
QUICK HITS

↗ Bitcoin holds above $83,000.
↗ Diesel crunch may last into 2027.
THE BOTTOM LINE
Scale is creating clear winners.
Until tomorrow, keep your eye on the numbers
"""


def test_plain_oswol_layout_is_sectioned(tmp_path):
    f = tmp_path / "oswol-2026-10-14.md"
    f.write_text(PLAIN)
    from oswol_video.sources import fetch_file

    nl = fetch_file(load_settings(source="file", source_file=str(f)))
    assert nl.title == "Banks Split on Q3, Chips Rally" and nl.date == "2026-10-14"
    ids = [s.id for s in nl.sections]
    assert ids == ["in-this-issue", "earnings-1", "quick-hits", "the-bottom-line"]
    story = nl.sections[1]
    assert story.title.startswith("Bank A Tops Estimates") and "Why it matters:" in story.content
    assert nl.sections[2].content.splitlines() == ["Bitcoin holds above $83,000.", "Diesel crunch may last into 2027."]
    assert "Until tomorrow" not in nl.sections[3].content


def test_dates_from_text_and_override():
    from oswol_video.sources import find_date, fetch_newsletter

    assert find_date("Daily brief\nWednesday, October 14, 2026\nHello") == "2026-10-14"
    assert find_date("14 Oct 2026 edition") == "2026-10-14"
    assert find_date("no date here") is None


def test_dollar_amounts_are_spoken_naturally():
    out = to_speech("EPS of $3.03, beating by $0.11. Revenue hit $20.34 billion, after touching $84,000, and a $1.2B fine.")
    assert "3.03 dollars, beating by 0.11 dollars." in out
    assert "20.34 billion dollars" in out and "84,000 dollars," in out and "1.2 billion dollars fine" in out


def test_system_prompt_files_load_and_example_is_valid():
    from oswol_video.storyboard import PROMPT_DIR, load_system_prompt
    from oswol_video.models import Storyboard

    text = load_system_prompt()
    for must in ("Oswol Daily Brief", "Hard rules", "This is not investment advice.", "NEVER reuse its facts"):
        assert must in text
    example = Storyboard.model_validate_json((PROMPT_DIR / "example_storyboard.json").read_text())
    assert example.scenes[0].type == "cold_open" and example.scenes[-1].type == "outro"
