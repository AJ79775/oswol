#!/usr/bin/env python3
"""Oswol Newsletter MCP Server - newsletter generation tools."""
import os
import json
from datetime import datetime
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("oswol-newsletter")
OSWOL_API_URL = os.getenv("OSWOL_API_URL", "http://localhost:3000")
OSWOL_API_KEY = os.getenv("OSWOL_API_KEY", "dev-key")


@mcp.tool()
async def create_daily_newsletter(tone: str = "professional", language: str = "en") -> str:
    """
    Create a daily AI market newsletter.

    Args:
        tone: One of 'professional', 'sharp', 'educational'
        language: One of 'en', 'ar', 'bilingual'
    """
    date_str = datetime.now().strftime("%B %d, %Y")

    headlines = {
        "professional": "Markets Stage Tech-Led Rally as AI Capex Momentum Persists",
        "sharp": "NVDA rips 4%, AI power trade back on — here's what you need to know",
        "educational": "Understanding Today's Tech Rally: Why AI Infrastructure Spending Matters",
    }

    summaries = {
        "professional": (
            "Equity markets traded higher Thursday, led by semiconductor names after NVIDIA's "
            "Q1 earnings beat reaffirmed the durability of AI infrastructure spending. "
            "The Nasdaq-100 outperformed with a 1.12% gain. Rate-sensitive sectors lagged "
            "as yields remained elevated ahead of Friday's PCE data."
        ),
        "sharp": (
            "NVDA crushed it again. +4.21% after a clean Q1 beat — revenue, EPS, guidance, all green. "
            "AMD following suit at +4.27%. The AI power trade is very much alive. "
            "Meanwhile, TSLA continues to underperform. Rate cut hopes cooling on strong jobs data."
        ),
        "educational": (
            "Today's market action offers a useful case study in how earnings surprises affect sector dynamics. "
            "When a bellwether company like NVIDIA reports above expectations, it signals confidence "
            "in the broader AI investment cycle, creating positive spillover effects for related names."
        ),
    }

    return json.dumps({
        "title": headlines.get(tone, headlines["professional"]),
        "date": date_str,
        "summary": summaries.get(tone, summaries["professional"]),
        "tone": tone,
        "language": language,
        "sections": [
            {
                "title": "Market Overview",
                "content": "SPY +0.68% | QQQ +1.12% | IWM -0.42% | VIX 13.42 (-4.82%)",
                "regime": "RISK-ON",
            },
            {
                "title": "Top Movers",
                "content": "NVDA +4.21% | AMD +4.27% | META +1.84% | TSLA -2.36% | INTC -1.82%",
            },
            {
                "title": "Smart Money",
                "content": "7 Congressional NVDA purchases disclosed. Lisa Su (AMD CEO) bought open market. No unusual institutional exits flagged.",
                "warning": "Filings carry 30-45 day delay.",
            },
            {
                "title": "Social Narratives",
                "content": "AI Power Demand narrative at peak velocity (94/100). BTC ETF inflows story gaining. EV demand slowdown trending bearish.",
            },
        ],
        "disclaimer": (
            "This newsletter is for informational purposes only and does not constitute financial advice. "
            "All data is demo/simulated. Past performance does not indicate future results. "
            "Always consult a qualified financial advisor before making investment decisions."
        ),
        "isDemoData": True,
        "readingTimeMinutes": 3,
        "wordCount": 320,
    })


@mcp.tool()
async def get_newsletter_templates() -> str:
    """Get available newsletter templates."""
    return json.dumps({
        "templates": [
            {
                "id": "daily",
                "name": "The Daily",
                "description": "Comprehensive daily market briefing with all sections",
                "sections": ["overview", "movers", "smart-money", "social", "macro", "watchlist"],
            },
            {
                "id": "weekly-macro",
                "name": "The Weekly Macro",
                "description": "Weekly deep-dive into macro themes and sector rotations",
                "sections": ["macro-themes", "sector-rotation", "fund-flows", "calendar"],
            },
            {
                "id": "single-thesis",
                "name": "Single Thesis",
                "description": "Deep analysis of one asset or narrative",
                "sections": ["thesis", "catalysts", "smart-money", "risk-factors"],
            },
            {
                "id": "crypto-watch",
                "name": "Crypto Watch",
                "description": "Focused crypto market intelligence",
                "sections": ["btc-eth", "alt-movers", "on-chain", "narratives"],
            },
        ],
        "isDemoData": True,
    })


if __name__ == "__main__":
    mcp.run()
