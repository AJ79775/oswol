#!/usr/bin/env python3
"""Oswol Market MCP Server - provides market data tools to AI agents."""
import os
import json
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("oswol-market")
OSWOL_API_URL = os.getenv("OSWOL_API_URL", "http://localhost:3000")
OSWOL_API_KEY = os.getenv("OSWOL_API_KEY", "dev-key")


@mcp.tool()
async def get_market_overview() -> str:
    """Get current market overview including major indices and market status."""
    return json.dumps({
        "status": "demo",
        "market_open": True,
        "indices": [
            {"symbol": "SPY", "price": 524.87, "change_pct": 0.68},
            {"symbol": "QQQ", "price": 448.92, "change_pct": 1.12},
            {"symbol": "DIA", "price": 392.14, "change_pct": 0.31},
            {"symbol": "IWM", "price": 208.45, "change_pct": -0.42},
            {"symbol": "VIX", "price": 13.42, "change_pct": -4.82},
        ],
        "market_regime": "risk-on",
        "isDemoData": True,
        "disclaimer": "Demo data only. Not financial advice.",
    })


@mcp.tool()
async def get_asset_snapshot(symbol: str) -> str:
    """Get current price snapshot for a given asset symbol."""
    demo_prices = {
        "NVDA": {"price": 875.42, "change_pct": 4.21, "name": "NVIDIA Corporation"},
        "TSLA": {"price": 242.15, "change_pct": -2.36, "name": "Tesla Inc."},
        "BTC": {"price": 67842.50, "change_pct": 2.48, "name": "Bitcoin"},
        "AMD": {"price": 168.92, "change_pct": 4.27, "name": "Advanced Micro Devices"},
        "MSFT": {"price": 412.50, "change_pct": 0.80, "name": "Microsoft Corporation"},
        "AAPL": {"price": 189.25, "change_pct": 0.95, "name": "Apple Inc."},
        "META": {"price": 492.40, "change_pct": 1.84, "name": "Meta Platforms"},
    }
    data = demo_prices.get(symbol.upper(), {"price": 100.0, "change_pct": 0.0, "name": symbol})
    return json.dumps({
        "symbol": symbol.upper(),
        **data,
        "isDemoData": True,
        "disclaimer": "Demo data only. Not financial advice.",
    })


@mcp.tool()
async def get_top_movers(limit: int = 10) -> str:
    """Get top gaining and losing assets by percentage change today."""
    return json.dumps({
        "gainers": [
            {"symbol": "NVDA", "change_pct": 4.21, "price": 875.42},
            {"symbol": "AMD", "change_pct": 4.27, "price": 168.92},
            {"symbol": "SOL", "change_pct": 3.82, "price": 148.20},
            {"symbol": "META", "change_pct": 1.84, "price": 492.40},
        ],
        "losers": [
            {"symbol": "TSLA", "change_pct": -2.36, "price": 242.15},
            {"symbol": "INTC", "change_pct": -1.82, "price": 31.45},
            {"symbol": "XOM", "change_pct": -0.88, "price": 108.30},
        ],
        "isDemoData": True,
        "disclaimer": "Demo data only. Not financial advice.",
    })


@mcp.tool()
async def get_macro_calendar(days_ahead: int = 7) -> str:
    """Get upcoming macro economic events calendar."""
    return json.dumps({
        "events": [
            {"date": "2025-05-28", "event": "FOMC Rate Decision", "impact": "high"},
            {"date": "2025-05-29", "event": "US GDP Q1 Advance", "impact": "high"},
            {"date": "2025-05-30", "event": "PCE Price Index", "impact": "high"},
            {"date": "2025-06-06", "event": "US Nonfarm Payrolls", "impact": "high"},
        ],
        "isDemoData": True,
        "disclaimer": "Demo data only. Not financial advice.",
    })


if __name__ == "__main__":
    mcp.run()
