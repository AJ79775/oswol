"""Optional live snapshot from free public APIs (picked from public-apis/public-apis).

  CoinGecko   https://www.coingecko.com/api      crypto prices, no key
  Frankfurter https://www.frankfurter.app/docs   ECB FX reference rates, no key
  FRED        https://fred.stlouisfed.org        10-year Treasury yield, free key (FRED_API_KEY)

Only assets the newsletter already mentions are fetched, and the numbers are
labelled as a live snapshot with source and time, never mixed into the
newsletter's own figures.
"""
from __future__ import annotations

import logging
import os
import re
from dataclasses import dataclass, field

import httpx

from .models import Newsletter
from .timeutil import now

log = logging.getLogger(__name__)

COINS = {"BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana", "XRP": "ripple"}
FX = {"EUR": "EUR/USD", "GBP": "GBP/USD", "JPY": "USD/JPY", "SAR": "USD/SAR", "AED": "USD/AED"}


@dataclass
class Snapshot:
    tiles: list[dict] = field(default_factory=list)
    sources: list[str] = field(default_factory=list)
    as_of: str = ""

    def as_prompt(self) -> str:
        if not self.tiles:
            return ""
        rows = [f"- {t['label']}: {t['value']}" + (f" ({t['change_pct']:+.2f}% 24h)" if t.get("change_pct") is not None else "")
                for t in self.tiles]
        return f"as of {self.as_of} from {', '.join(self.sources)}:\n" + "\n".join(rows)

    def values(self) -> list[float]:
        out = []
        for t in self.tiles:
            out += [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*(?:\.\d+)?", t["value"])]
            if t.get("change_pct") is not None:
                out.append(abs(round(t["change_pct"], 2)))
        return out


def _mentioned(nl: Newsletter, keys) -> list[str]:
    text = nl.full_text()
    return [k for k in keys if re.search(rf"\b{k}\b", text) or (k in COINS and COINS[k] in text.lower())]


def snapshot(nl: Newsletter, settings) -> Snapshot:
    snap = Snapshot(as_of=now(settings).strftime("%H:%M %Z").strip())
    with httpx.Client(timeout=20, headers={"User-Agent": "oswol-video-agent/1.0"}) as client:
        coins = _mentioned(nl, COINS)
        if coins:
            try:
                ids = ",".join(COINS[c] for c in coins)
                r = client.get("https://api.coingecko.com/api/v3/simple/price",
                               params={"ids": ids, "vs_currencies": "usd", "include_24hr_change": "true"})
                r.raise_for_status()
                data = r.json()
                for c in coins:
                    row = data.get(COINS[c]) or {}
                    if "usd" in row:
                        price = row["usd"]
                        snap.tiles.append({"label": c, "value": f"${price:,.0f}" if price >= 100 else f"${price:,.2f}",
                                           "change_pct": round(row.get("usd_24h_change") or 0.0, 2), "note": "24h change"})
                snap.sources.append("CoinGecko")
            except Exception as exc:  # noqa: BLE001
                log.warning("CoinGecko snapshot skipped: %s", exc)
        fx = _mentioned(nl, FX)
        if fx or "DXY" in nl.full_text() or "dollar" in nl.full_text().lower():
            try:
                r = client.get("https://api.frankfurter.app/latest", params={"from": "USD", "to": "EUR,JPY,GBP"})
                r.raise_for_status()
                rates = r.json().get("rates", {})
                if "EUR" in rates:
                    snap.tiles.append({"label": "EUR/USD", "value": f"{1 / rates['EUR']:.4f}", "change_pct": None, "note": "ECB reference"})
                if "JPY" in rates:
                    snap.tiles.append({"label": "USD/JPY", "value": f"{rates['JPY']:.2f}", "change_pct": None, "note": "ECB reference"})
                snap.sources.append("Frankfurter (ECB)")
            except Exception as exc:  # noqa: BLE001
                log.warning("Frankfurter snapshot skipped: %s", exc)
        key = os.environ.get("FRED_API_KEY", "")
        if key and re.search(r"10Y|10-year|treasury", nl.full_text(), flags=re.I):
            try:
                r = client.get("https://api.stlouisfed.org/fred/series/observations",
                               params={"series_id": "DGS10", "api_key": key, "file_type": "json", "sort_order": "desc", "limit": 1})
                r.raise_for_status()
                obs = r.json()["observations"][0]
                snap.tiles.append({"label": "US 10Y", "value": f"{float(obs['value']):.2f}%", "change_pct": None,
                                   "note": f"FRED close {obs['date']}"})
                snap.sources.append("FRED")
            except Exception as exc:  # noqa: BLE001
                log.warning("FRED snapshot skipped: %s", exc)
    snap.tiles = snap.tiles[:6]
    return snap
