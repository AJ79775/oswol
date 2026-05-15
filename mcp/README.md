# Oswol MCP Servers

Python MCP servers that expose Oswol market intelligence tools to AI agents.

## Setup

```bash
pip install -r requirements.txt
```

## Servers

- `market_server.py` — market data and overview
- `smart_money_server.py` — politician, insider, fund disclosures
- `social_server.py` — social sentiment and narratives
- `newsletter_server.py` — newsletter generation
- `asset_universe_server.py` — asset search and universe data

## Usage with Codex

See `../.codex/config.toml` for configuration.

## Safety

All tools include demo data flags and financial safety disclaimers.
Political trade disclosures always include filing delay context.
Social sentiment tools always include manipulation/noise warnings.
