# Oswol — AI Market Intelligence Terminal

> "The AI market intelligence terminal for the next generation."

Oswol helps users know **what moved**, **why it moved**, **who is behind the move**, and **whether the signal is real or just noise**.

## What Oswol Is

- **AI-powered market intelligence** — not a broker, not a trading app
- **Explain This Move** — structured AI analysis of any price movement
- **Smart Money Radar** — politician trades, insider filings, hedge fund 13F data
- **Social Narrative Scanner** — velocity-ranked narratives with hype risk scoring
- **Market Heat Map** — Nasdaq-100, sectors, ETFs, crypto visual maps
- **AI Copilot** — cited conversational research assistant
- **Newsletter Builder** — one-click professional market newsletters

## Safety & Compliance

Oswol does **not** provide investment advice. All outputs include:
- Source citations and confidence scores
- Filing delay warnings (politician trades often 30-45 days delayed)
- Demo data labels
- Financial safety guardrails (no buy/sell recommendations)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand, TanStack Query |
| Validation | Zod |
| Database | PostgreSQL (Prisma ORM) |
| Cache | Redis |
| AI | OpenAI (plug in key to activate) |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start database and Redis
docker-compose up -d

# 3. Set up environment
cp .env.example .env

# 4. Generate Prisma client
npx prisma generate

# 5. Seed demo data
npx prisma db seed

# 6. Start development server
npm run dev
```

## Environment Variables

See `.env.example` for all required and optional variables.

Minimum required for demo mode:
```
DATABASE_URL=postgresql://oswol:oswol_dev_password@localhost:5432/oswol_db
REDIS_URL=redis://localhost:6379
```

Add `OPENAI_API_KEY` to activate real AI explanations.

## Pages

| Route | Description |
|-------|-------------|
| /dashboard | Main market intelligence dashboard |
| /markets | Asset explorer with search |
| /markets/[symbol] | Individual asset detail + Explain This Move |
| /heatmap | Market heat maps (Nasdaq-100, sectors, ETFs, crypto) |
| /smart-money | Politician, insider, hedge fund disclosures |
| /social | Social narrative scanner |
| /watchlist | Watchlist intelligence |
| /brief | Daily AI market brief + design guide |
| /copilot | AI conversational research assistant |
| /newsletter | AI newsletter builder |

## MCP Servers

Oswol provides MCP servers for AI agent integration:

```bash
# Install Python dependencies
pip install -r mcp/requirements.txt

# Run a server (STDIO mode)
python mcp/market_server.py
```

See `.codex/config.toml` for Codex/Claude integration.

## CLI

```bash
# Explain a market move
npx tsx cli/index.ts explain NVDA

# Generate market brief
npx tsx cli/index.ts brief

# Show heat map
npx tsx cli/index.ts heatmap sectors

# List asset universe
npx tsx cli/index.ts assets list
```

## Architecture

```
src/
├── app/
│   ├── (app)/          # All authenticated routes
│   │   ├── dashboard/  # Main dashboard
│   │   ├── markets/    # Asset explorer + detail
│   │   ├── heatmap/    # Heat maps
│   │   ├── smart-money/# Politician + insider + funds
│   │   ├── social/     # Narrative scanner
│   │   ├── watchlist/  # Watchlist intelligence
│   │   ├── copilot/    # AI chat interface
│   │   ├── newsletter/ # Newsletter builder
│   │   └── brief/      # Daily brief
│   └── api/            # API routes
├── components/
│   ├── layout/         # AppShell, Sidebar, Topbar
│   ├── ai/             # ExplainMovePanel
│   └── shared/         # Common components
├── lib/
│   ├── agents/         # AI agent implementations
│   ├── compliance/     # Financial safety guardrails
│   ├── data/           # Mock data providers
│   └── scoring/        # Signal scoring engines
sdk/                    # TypeScript SDK
cli/                    # CLI tool
mcp/                    # Python MCP servers
prisma/                 # Database schema + seeds
```

## Demo Mode

All data is demo/mock data for illustration purposes. The platform is architected for real data integration via provider interfaces in `src/lib/providers/`.

## Roadmap

- [ ] Real market data provider integration
- [ ] OpenAI-powered explanations (add API key to activate)
- [ ] User authentication (NextAuth)
- [ ] Alert system
- [ ] Mobile-responsive layouts
- [ ] Arabic/bilingual support
- [ ] GCC market coverage
- [ ] Production data pipeline

## Disclaimer

Oswol is a research and intelligence platform. It does not execute trades or provide personalized investment advice. All public filing disclosures carry legal reporting delays. Past performance is not indicative of future results.
