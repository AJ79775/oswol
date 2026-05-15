#!/usr/bin/env python3
"""Oswol Social MCP Server - social sentiment and narrative tools."""
import os
import json
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("oswol-social")
OSWOL_API_URL = os.getenv("OSWOL_API_URL", "http://localhost:3000")
OSWOL_API_KEY = os.getenv("OSWOL_API_KEY", "dev-key")

SOCIAL_WARNING = (
    "Social sentiment can be noisy, manipulated, incomplete, or wrong. "
    "High mention volume does not imply positive price action. "
    "Sentiment scores are algorithmically derived from public data. "
    "This is not financial advice."
)


@mcp.tool()
async def get_social_sentiment(symbol: str, timeframe: str = "24h") -> str:
    """
    Get social sentiment score for a given asset symbol over the specified timeframe.
    WARNING: Social sentiment can be noisy, manipulated, incomplete, or wrong.
    """
    sentiments = {
        "NVDA": {
            "sentiment_score": 0.82,
            "mention_volume": 142500,
            "bullish_pct": 74.2,
            "bearish_pct": 12.1,
            "neutral_pct": 13.7,
            "velocity_score": 92,
            "hype_risk_score": 68,
            "top_topics": ["AI chips", "datacenter", "earnings beat"],
        },
        "TSLA": {
            "sentiment_score": 0.31,
            "mention_volume": 198200,
            "bullish_pct": 42.3,
            "bearish_pct": 38.8,
            "neutral_pct": 18.9,
            "velocity_score": 85,
            "hype_risk_score": 82,
            "top_topics": ["delivery numbers", "FSD progress", "price cuts"],
        },
        "BTC": {
            "sentiment_score": 0.68,
            "mention_volume": 312000,
            "bullish_pct": 62.1,
            "bearish_pct": 21.4,
            "neutral_pct": 16.5,
            "velocity_score": 89,
            "hype_risk_score": 74,
            "top_topics": ["ETF inflows", "halving", "institutional buying"],
        },
    }
    data = sentiments.get(symbol.upper(), {
        "sentiment_score": 0.50,
        "mention_volume": 5000,
        "bullish_pct": 50.0,
        "bearish_pct": 30.0,
        "neutral_pct": 20.0,
        "velocity_score": 40,
        "hype_risk_score": 30,
        "top_topics": [],
    })
    return json.dumps({
        "symbol": symbol.upper(),
        "timeframe": timeframe,
        **data,
        "isDemoData": True,
        "warning": SOCIAL_WARNING,
    })


@mcp.tool()
async def get_trending_narratives(limit: int = 6) -> str:
    """
    Get current trending social narratives by velocity and mention volume.
    WARNING: Social sentiment can be noisy, manipulated, incomplete, or wrong.
    """
    narratives = [
        {
            "id": "ai-power-demand",
            "title": "AI Power Demand",
            "summary": "Data center electricity consumption projections drive utility stocks and grid infrastructure plays.",
            "mention_volume": 48200,
            "velocity": 94,
            "hype_risk": 62,
            "related_tickers": ["NVDA", "AMD", "VST", "CEG", "ETN"],
            "sentiment": "bullish",
        },
        {
            "id": "btc-etf-inflows",
            "title": "BTC ETF Inflows",
            "summary": "Spot Bitcoin ETFs continue to attract institutional capital, with BlackRock IBIT leading inflows.",
            "mention_volume": 38100,
            "velocity": 88,
            "hype_risk": 71,
            "related_tickers": ["BTC", "IBIT", "FBTC", "COIN"],
            "sentiment": "bullish",
        },
        {
            "id": "rate-cut-timeline",
            "title": "Fed Rate Cut Timeline",
            "summary": "Markets reassessing Fed cut expectations after stronger-than-expected jobs data.",
            "mention_volume": 31800,
            "velocity": 76,
            "hype_risk": 45,
            "related_tickers": ["TLT", "SPY", "GLD", "DXY"],
            "sentiment": "mixed",
        },
        {
            "id": "ev-demand-slowdown",
            "title": "EV Demand Slowdown",
            "summary": "Multiple automakers cutting EV production targets amid softening consumer demand.",
            "mention_volume": 22400,
            "velocity": 68,
            "hype_risk": 58,
            "related_tickers": ["TSLA", "GM", "F", "RIVN", "LCID"],
            "sentiment": "bearish",
        },
        {
            "id": "pharma-glp1",
            "title": "GLP-1 Weight Loss Market",
            "summary": "Ozempic/Wegovy expansion pipeline creates downstream winners and losers across sectors.",
            "mention_volume": 19200,
            "velocity": 62,
            "hype_risk": 55,
            "related_tickers": ["LLY", "NVO", "AMGN", "WW"],
            "sentiment": "bullish",
        },
        {
            "id": "china-stimulus",
            "title": "China Stimulus Response",
            "summary": "Markets watching PBOC and fiscal stimulus measures for second-order effects on commodities.",
            "mention_volume": 15800,
            "velocity": 54,
            "hype_risk": 48,
            "related_tickers": ["FXI", "BABA", "BIDU", "COPPER"],
            "sentiment": "uncertain",
        },
    ]
    return json.dumps({
        "narratives": narratives[:limit],
        "total": len(narratives),
        "isDemoData": True,
        "warning": SOCIAL_WARNING,
    })


@mcp.tool()
async def detect_hype_risk(symbol: str) -> str:
    """
    Detect and score hype risk for a given asset.
    WARNING: Social sentiment can be noisy, manipulated, incomplete, or wrong.
    """
    hype_data = {
        "NVDA": {"hype_risk_score": 68, "risk_level": "moderate", "flags": ["high mention velocity", "retail FOMO detected"]},
        "TSLA": {"hype_risk_score": 82, "risk_level": "high", "flags": ["celebrity amplification", "meme stock overlap", "sentiment divergence from fundamentals"]},
        "BTC": {"hype_risk_score": 74, "risk_level": "moderate-high", "flags": ["halving narrative active", "ETF inflow amplification"]},
    }
    data = hype_data.get(symbol.upper(), {
        "hype_risk_score": 35,
        "risk_level": "low",
        "flags": [],
    })
    return json.dumps({
        "symbol": symbol.upper(),
        **data,
        "interpretation": (
            "A high hype risk score means social sentiment may be inflating perceived momentum. "
            "Price may not follow narrative. Use additional fundamental analysis."
        ),
        "isDemoData": True,
        "warning": SOCIAL_WARNING,
    })


if __name__ == "__main__":
    mcp.run()
