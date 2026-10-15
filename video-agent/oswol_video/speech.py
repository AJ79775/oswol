"""Turn on-screen text into text a TTS voice reads naturally.

Captions always show the original sentence; only the audio uses this form.
Add your own pronunciations in lexicon.json (same folder as the package or
LEXICON_FILE) as {"WORD": "spoken form"}.
"""
from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path

# Display names: what narration and captions say instead of a bare ticker.
COMPANY_NAMES = {
    "SPY": "the S&P 500 ETF", "QQQ": "the Nasdaq-100 ETF", "IWM": "the Russell 2000 ETF", "DIA": "the Dow ETF",
    "VIX": "the VIX volatility index", "DXY": "the US dollar index", "BTC": "Bitcoin", "ETH": "Ether", "SOL": "Solana", "XRP": "XRP",
    "NVDA": "Nvidia", "AMD": "AMD", "TSLA": "Tesla", "AAPL": "Apple", "META": "Meta", "MSFT": "Microsoft",
    "INTC": "Intel", "XOM": "Exxon Mobil", "GOOGL": "Alphabet", "GOOG": "Alphabet", "AMZN": "Amazon",
    "AVGO": "Broadcom", "NFLX": "Netflix", "JPM": "JPMorgan", "TSM": "TSMC", "ASML": "ASML", "COIN": "Coinbase",
    "MSTR": "MicroStrategy", "PLTR": "Palantir", "SMCI": "Super Micro", "ARM": "Arm", "BRK.B": "Berkshire Hathaway",
    "LLY": "Eli Lilly", "NVO": "Novo Nordisk", "TASI": "the Tadawul index", "DFMGI": "the Dubai index",
}
# Kept for backwards compatibility with older imports.
TICKER_NAMES = COMPANY_NAMES

ACRONYMS = {
    "AI": "A I", "ETF": "E T F", "ETFs": "E T Fs", "CPI": "C P I", "PCE": "P C E", "PPI": "P P I", "GDP": "G D P",
    "FOMC": "F O M C", "EPS": "E P S", "CEO": "C E O", "CFO": "C F O", "SEC": "S E C", "IPO": "I P O",
    "YoY": "year over year", "QoQ": "quarter over quarter", "MoM": "month over month", "bps": "basis points",
    "bp": "basis points", "ECB": "E C B", "BoJ": "Bank of Japan", "BoE": "Bank of England", "OPEC": "OPEC",
    "GCC": "G C C", "US": "U S", "U.S.": "U S", "UK": "U K", "EU": "E U", "EV": "E V", "EVs": "E Vs", "M&A": "M and A",
    "ET": "Eastern", "GST": "Gulf time", "UTC": "U T C", "ATH": "all-time high", "HBM": "H B M", "API": "A P I",
    "GLP-1": "G L P one", "AMD": "A M D", "XRP": "X R P", "TSMC": "T S M C", "ASML": "A S M L",
    "JPMorgan": "J P Morgan", "VIX": "vix", "GAAP": "gap", "BofA": "Bank of America", "UAE": "U A E",
    "IEA": "I E A", "BBVA": "B B V A", "BNP": "B N P", "ING": "I N G", "MiCA": "Mica", "AUM": "A U M",
    "IPOs": "I P Os", "ETFs": "E T Fs", "CEOs": "C E Os", "NII": "net interest income",
}

_ORD = {"1": "first", "2": "second", "3": "third", "4": "fourth"}


@lru_cache(maxsize=1)
def _custom_lexicon() -> dict[str, str]:
    path = Path(os.environ.get("LEXICON_FILE", Path(__file__).parent / "lexicon.json"))
    if path.is_file():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {}
    return {}


def _signed_pct(m: re.Match) -> str:
    sign, num = m.group(1), m.group(2)
    word = "down" if sign in "-−–" else "up"
    return f"{word} {num} percent"


def to_speech(text: str) -> str:
    t = text
    for k, v in _custom_lexicon().items():
        t = re.sub(rf"(?<![\w$]){re.escape(k)}(?![\w])", v, t)
    t = t.replace("S&P", "S and P").replace("&", " and ")
    t = re.sub(r"Nasdaq-100", "Nasdaq 100", t)
    # $1–5M -> 1 to 5 million dollars ; $67,420 -> 67,420 dollars ; $2.1B -> 2.1 billion dollars
    num = r"(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)"  # 1,234.56 — never swallows trailing punctuation
    t = re.sub(rf"\${num}\s*[–-]\s*\$?{num}\s*([KMBT])\b",
               lambda m: f"{m.group(1)} to {m.group(2)} {_scale(m.group(3))} dollars", t)
    t = re.sub(rf"\${num}\s*([KMBT]|bn|mn)\b", lambda m: f"{m.group(1)} {_scale(m.group(2))} dollars", t)
    t = re.sub(rf"\${num}\s+(thousand|million|billion|trillion)\b", r"\1 \2 dollars", t, flags=re.I)
    t = re.sub(rf"\${num}", r"\1 dollars", t)
    t = re.sub(r"(\d[\d.]*)k\b", r"\1 thousand", t)
    # +4.21% / −2.36% -> up/down x percent ; 4.21% -> 4.21 percent
    t = re.sub(r"(?<![\w.])([+\-−–])(\d[\d,]*(?:\.\d+)?)\s*%", _signed_pct, t)
    t = re.sub(r"(\d[\d,]*(?:\.\d+)?)\s*%", r"\1 percent", t)
    t = re.sub(r"(\d+)\s*[–-]\s*(\d+)\s*(day|days|percent)", r"\1 to \2 \3", t)
    t = re.sub(r"\b(\d{1,2})Y\b", r"\1-year", t)
    t = re.sub(r"\bQ([1-4])\b", lambda m: f"{_ORD[m.group(1)]}-quarter", t)
    t = re.sub(r"\b13F\b", "thirteen F", t)
    t = re.sub(r"\b(\d{1,2}):00\b", r"\1 o'clock", t)
    for k, v in sorted(COMPANY_NAMES.items(), key=lambda kv: -len(kv[0])):
        if k not in ACRONYMS:
            t = re.sub(rf"(?<![\w$]){re.escape(k)}(?![\w])", v, t)
    t = t.replace("S&P", "S and P").replace("&", " and ")
    for k, v in sorted(ACRONYMS.items(), key=lambda kv: -len(kv[0])):
        t = re.sub(rf"(?<![\w]){re.escape(k)}(?![\w])", v, t)
    t = re.sub(r"[·|•→]", ", ", t)
    t = re.sub(r"\s*—\s*", ", ", t)
    t = re.sub(r"[*_#`>]", "", t)
    t = re.sub(r"\s{2,}", " ", t)
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    t = re.sub(r",\s*,", ",", t)
    return t.strip()


def _scale(s: str) -> str:
    return {"K": "thousand", "M": "million", "mn": "million", "B": "billion", "bn": "billion", "T": "trillion"}.get(s, s)


_SPLIT = re.compile(r"(?<=[.!?])[\"')\]]?\s+(?=[A-Z0-9\"'(])")


def split_sentences(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text or "").strip()
    if not text:
        return []
    # Protect common abbreviations from being treated as sentence ends.
    protected = re.sub(r"\b(U\.S|U\.K|e\.g|i\.e|vs|Inc|Corp|Ltd|Mr|Ms|Dr|St|No)\.", lambda m: m.group(0).replace(".", "§"), text)
    parts = [p.replace("§", ".").strip() for p in _SPLIT.split(protected)]
    return [p for p in parts if p]
