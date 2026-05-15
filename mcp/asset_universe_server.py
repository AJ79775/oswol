#!/usr/bin/env python3
"""Oswol Asset Universe MCP Server - asset search and universe data."""
import os
import json
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("oswol-asset-universe")
OSWOL_API_URL = os.getenv("OSWOL_API_URL", "http://localhost:3000")
OSWOL_API_KEY = os.getenv("OSWOL_API_KEY", "dev-key")

ASSET_UNIVERSE = [
    # Equities
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "asset_class": "EQUITY", "sector": "Technology", "exchange": "NASDAQ"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "asset_class": "EQUITY", "sector": "Technology", "exchange": "NASDAQ"},
    {"symbol": "AAPL", "name": "Apple Inc.", "asset_class": "EQUITY", "sector": "Technology", "exchange": "NASDAQ"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "asset_class": "EQUITY", "sector": "Communication Services", "exchange": "NASDAQ"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "asset_class": "EQUITY", "sector": "Consumer Discretionary", "exchange": "NASDAQ"},
    {"symbol": "META", "name": "Meta Platforms", "asset_class": "EQUITY", "sector": "Communication Services", "exchange": "NASDAQ"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "asset_class": "EQUITY", "sector": "Consumer Discretionary", "exchange": "NASDAQ"},
    {"symbol": "AMD", "name": "Advanced Micro Devices", "asset_class": "EQUITY", "sector": "Technology", "exchange": "NASDAQ"},
    {"symbol": "AVGO", "name": "Broadcom Inc.", "asset_class": "EQUITY", "sector": "Technology", "exchange": "NASDAQ"},
    {"symbol": "NFLX", "name": "Netflix Inc.", "asset_class": "EQUITY", "sector": "Communication Services", "exchange": "NASDAQ"},
    # ETFs
    {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "asset_class": "ETF", "sector": "Broad Market", "exchange": "NYSE"},
    {"symbol": "QQQ", "name": "Invesco QQQ Trust", "asset_class": "ETF", "sector": "Technology", "exchange": "NASDAQ"},
    {"symbol": "IWM", "name": "iShares Russell 2000 ETF", "asset_class": "ETF", "sector": "Small Cap", "exchange": "NYSE"},
    {"symbol": "GLD", "name": "SPDR Gold Shares", "asset_class": "ETF", "sector": "Commodities", "exchange": "NYSE"},
    {"symbol": "TLT", "name": "iShares 20+ Year Treasury", "asset_class": "ETF", "sector": "Bonds", "exchange": "NASDAQ"},
    {"symbol": "IBIT", "name": "iShares Bitcoin Trust ETF", "asset_class": "ETF", "sector": "Crypto", "exchange": "NASDAQ"},
    # Crypto
    {"symbol": "BTC", "name": "Bitcoin", "asset_class": "CRYPTO", "sector": "Layer 1", "exchange": "CRYPTO"},
    {"symbol": "ETH", "name": "Ethereum", "asset_class": "CRYPTO", "sector": "Layer 1", "exchange": "CRYPTO"},
    {"symbol": "SOL", "name": "Solana", "asset_class": "CRYPTO", "sector": "Layer 1", "exchange": "CRYPTO"},
    {"symbol": "BNB", "name": "BNB", "asset_class": "CRYPTO", "sector": "Exchange Token", "exchange": "CRYPTO"},
    {"symbol": "XRP", "name": "XRP", "asset_class": "CRYPTO", "sector": "Payments", "exchange": "CRYPTO"},
    # FX
    {"symbol": "DXY", "name": "US Dollar Index", "asset_class": "FX", "sector": "Currency", "exchange": "FX"},
    {"symbol": "EURUSD", "name": "Euro / US Dollar", "asset_class": "FX", "sector": "Currency", "exchange": "FX"},
    {"symbol": "GBPUSD", "name": "British Pound / US Dollar", "asset_class": "FX", "sector": "Currency", "exchange": "FX"},
    {"symbol": "USDJPY", "name": "US Dollar / Japanese Yen", "asset_class": "FX", "sector": "Currency", "exchange": "FX"},
    # Commodities
    {"symbol": "GOLD", "name": "Gold Spot", "asset_class": "COMMODITY", "sector": "Precious Metals", "exchange": "COMEX"},
    {"symbol": "OIL", "name": "WTI Crude Oil", "asset_class": "COMMODITY", "sector": "Energy", "exchange": "NYMEX"},
    {"symbol": "SILVER", "name": "Silver Spot", "asset_class": "COMMODITY", "sector": "Precious Metals", "exchange": "COMEX"},
    # Rates / Macro
    {"symbol": "US10Y", "name": "US 10-Year Treasury Yield", "asset_class": "RATE", "sector": "Rates", "exchange": "TREASURY"},
    {"symbol": "VIX", "name": "CBOE Volatility Index", "asset_class": "VOLATILITY", "sector": "Volatility", "exchange": "CBOE"},
]


@mcp.tool()
async def get_supported_assets(asset_class: str = None) -> str:
    """
    Get the list of supported assets. Optionally filter by asset class.

    Args:
        asset_class: Optional filter — EQUITY, ETF, CRYPTO, FX, COMMODITY, RATE
    """
    assets = ASSET_UNIVERSE
    if asset_class:
        assets = [a for a in assets if a["asset_class"] == asset_class.upper()]
    return json.dumps({
        "assets": assets,
        "total": len(assets),
        "isDemoData": True,
        "disclaimer": "Demo asset universe. Not all assets may be available with real data.",
    })


@mcp.tool()
async def search_assets(query: str) -> str:
    """
    Search for assets by symbol or name.

    Args:
        query: Search term (symbol or company name)
    """
    q = query.lower()
    results = [
        a for a in ASSET_UNIVERSE
        if q in a["symbol"].lower() or q in a["name"].lower()
    ]
    return json.dumps({
        "results": results[:10],
        "total": len(results),
        "query": query,
        "isDemoData": True,
    })


@mcp.tool()
async def get_index_constituents(index_symbol: str) -> str:
    """
    Get constituents of a major index.

    Args:
        index_symbol: e.g. QQQ, SPY, IWM
    """
    constituents = {
        "QQQ": [
            {"symbol": "NVDA", "weight_pct": 5.2},
            {"symbol": "MSFT", "weight_pct": 7.4},
            {"symbol": "AAPL", "weight_pct": 7.1},
            {"symbol": "GOOGL", "weight_pct": 5.3},
            {"symbol": "AMZN", "weight_pct": 5.0},
            {"symbol": "META", "weight_pct": 3.2},
            {"symbol": "TSLA", "weight_pct": 1.8},
            {"symbol": "AMD", "weight_pct": 0.7},
        ],
        "SPY": [
            {"symbol": "MSFT", "weight_pct": 6.8},
            {"symbol": "AAPL", "weight_pct": 6.5},
            {"symbol": "NVDA", "weight_pct": 5.4},
            {"symbol": "AMZN", "weight_pct": 4.2},
            {"symbol": "META", "weight_pct": 2.8},
        ],
    }
    data = constituents.get(index_symbol.upper(), [])
    return json.dumps({
        "index": index_symbol.upper(),
        "constituents": data,
        "count": len(data),
        "isDemoData": True,
        "note": "Demo data — top holdings only, weights are approximate.",
        "disclaimer": "Not financial advice.",
    })


if __name__ == "__main__":
    mcp.run()
