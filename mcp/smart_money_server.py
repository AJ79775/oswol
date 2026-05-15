#!/usr/bin/env python3
"""Oswol Smart Money MCP Server - politician, insider, and fund disclosures."""
import os
import json
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("oswol-smart-money")
OSWOL_API_URL = os.getenv("OSWOL_API_URL", "http://localhost:3000")
OSWOL_API_KEY = os.getenv("OSWOL_API_KEY", "dev-key")

DELAY_WARNING = (
    "IMPORTANT: Political trade disclosures under the STOCK Act may be filed "
    "30-45 days after the transaction date. Data shown reflects public filings and "
    "may not represent current positions. This is not financial advice."
)


@mcp.tool()
async def get_politician_trades(symbol: str = None, limit: int = 10) -> str:
    """
    Get recent politician trade disclosures. Optionally filter by ticker symbol.
    Always includes filing delay warnings — data may be 30-45 days stale.
    """
    trades = [
        {
            "politician": "Nancy Pelosi",
            "party": "D",
            "chamber": "House",
            "ticker": "NVDA",
            "trade_type": "Purchase",
            "value_range": "$50K-$100K",
            "transaction_date": "2024-10-28",
            "disclosure_date": "2024-12-09",
            "delay_days": 42,
        },
        {
            "politician": "Mark Warner",
            "party": "D",
            "chamber": "Senate",
            "ticker": "NVDA",
            "trade_type": "Purchase",
            "value_range": "$15K-$50K",
            "transaction_date": "2024-11-12",
            "disclosure_date": "2024-12-24",
            "delay_days": 42,
        },
        {
            "politician": "Dan Crenshaw",
            "party": "R",
            "chamber": "House",
            "ticker": "AMD",
            "trade_type": "Purchase",
            "value_range": "$1K-$15K",
            "transaction_date": "2024-10-14",
            "disclosure_date": "2024-11-25",
            "delay_days": 42,
        },
    ]
    if symbol:
        trades = [t for t in trades if t["ticker"] == symbol.upper()]
    return json.dumps({
        "trades": trades[:limit],
        "total": len(trades),
        "isDemoData": True,
        "delayWarning": DELAY_WARNING,
        "disclaimer": "Not financial advice. Demo data only.",
    })


@mcp.tool()
async def get_insider_trades(symbol: str = None, limit: int = 10) -> str:
    """
    Get recent insider trade filings (Form 4 / SEC EDGAR).
    Always includes context about pre-planned 10b5-1 sales.
    """
    trades = [
        {
            "insider": "Jensen Huang",
            "role": "CEO",
            "company": "NVIDIA Corporation",
            "ticker": "NVDA",
            "trade_type": "Sale",
            "shares": 120000,
            "price": 874.20,
            "value": 104904000,
            "is_10b5_1": True,
            "transaction_date": "2024-12-10",
            "filing_date": "2024-12-12",
            "signal": "Planned Sale — pre-scheduled 10b5-1 program",
        },
        {
            "insider": "Lisa Su",
            "role": "CEO",
            "company": "Advanced Micro Devices",
            "ticker": "AMD",
            "trade_type": "Purchase",
            "shares": 5000,
            "price": 155.30,
            "value": 776500,
            "is_10b5_1": False,
            "transaction_date": "2024-12-01",
            "filing_date": "2024-12-03",
            "signal": "Open market purchase — notable insider confidence signal",
        },
    ]
    if symbol:
        trades = [t for t in trades if t["ticker"] == symbol.upper()]
    return json.dumps({
        "trades": trades[:limit],
        "total": len(trades),
        "isDemoData": True,
        "note": "10b5-1 pre-planned sales should not be interpreted as bearish signals.",
        "disclaimer": "Not financial advice. Demo data only.",
    })


@mcp.tool()
async def get_hedge_fund_holdings(symbol: str = None, fund: str = None) -> str:
    """
    Get hedge fund 13F holdings data. Data is typically 45 days stale (quarterly filing).
    """
    holdings = [
        {
            "fund": "Bridgewater Associates",
            "ticker": "SPY",
            "shares": 2400000,
            "value_usd": 1259688000,
            "pct_portfolio": 8.4,
            "quarter": "Q3 2024",
        },
        {
            "fund": "Renaissance Technologies",
            "ticker": "NVDA",
            "shares": 850000,
            "value_usd": 743607000,
            "pct_portfolio": 3.2,
            "quarter": "Q3 2024",
        },
        {
            "fund": "Citadel",
            "ticker": "MSFT",
            "shares": 1200000,
            "value_usd": 495000000,
            "pct_portfolio": 2.1,
            "quarter": "Q3 2024",
        },
    ]
    if symbol:
        holdings = [h for h in holdings if h["ticker"] == symbol.upper()]
    if fund:
        holdings = [h for h in holdings if fund.lower() in h["fund"].lower()]
    return json.dumps({
        "holdings": holdings,
        "isDemoData": True,
        "staleness": "13F filings are quarterly — data may be 45-90 days stale.",
        "disclaimer": "Not financial advice. Demo data only.",
    })


@mcp.tool()
async def get_smart_money_summary(symbol: str) -> str:
    """
    Get a combined smart money summary for a given symbol.
    Includes politician, insider, and fund activity.
    Always includes delay warnings and demo data flags.
    """
    return json.dumps({
        "symbol": symbol.upper(),
        "summary": f"Smart money activity for {symbol.upper()} shows mixed signals. "
                   "2 politician purchases, 1 insider sale (10b5-1 pre-planned), "
                   "hedge fund holdings stable QoQ.",
        "signals": {
            "politician_sentiment": "bullish",
            "insider_sentiment": "neutral",
            "fund_sentiment": "stable",
            "overall_score": 68,
            "signal_label": "Moderate Interest",
        },
        "isDemoData": True,
        "delayWarning": DELAY_WARNING,
        "disclaimer": "Not financial advice. All filings carry legal reporting delays.",
    })


if __name__ == "__main__":
    mcp.run()
