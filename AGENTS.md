# AGENTS.md — Oswol Platform Agent Guide

## Project Overview

Oswol is a full-stack AI market intelligence terminal built with Next.js 15+, TypeScript, Tailwind CSS v4, and Prisma. It tracks smart money flows (politician trades, insider activity, institutional filings), social sentiment, and provides AI-generated market briefs.

## Repository Structure

```
/
├── src/
│   ├── app/
│   │   ├── (app)/              # App shell routes (sidebar + topbar layout)
│   │   │   ├── dashboard/      # Main dashboard (fully built)
│   │   │   ├── heatmap/        # Market heat map (fully built)
│   │   │   ├── markets/        # Asset browser + [symbol] detail
│   │   │   ├── smart-money/    # Politician + insider trades (placeholder)
│   │   │   ├── social/         # Social sentiment (placeholder)
│   │   │   ├── watchlist/      # User watchlist (placeholder)
│   │   │   ├── brief/          # Design brief (placeholder)
│   │   │   ├── copilot/        # AI copilot chat (placeholder)
│   │   │   └── newsletter/     # Newsletter generator (placeholder)
│   │   ├── globals.css         # Design tokens + Tailwind base
│   │   ├── layout.tsx          # Root layout with fonts
│   │   └── page.tsx            # Redirects to /dashboard
│   ├── components/
│   │   ├── layout/             # AppShell, Sidebar, Topbar
│   │   └── shared/             # Sparkline, ChangeChip, DisclaimerFooter, PlaceholderPage
│   ├── lib/
│   │   └── data/
│   │       └── mockMarketData.ts  # All mock data (no DB calls in Phase 1)
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── prisma/
│   ├── schema.prisma           # Full Prisma schema
│   └── seed.ts                 # Demo data seeder
├── public/
│   └── brand/
│       └── oswol-logo.png
├── docker-compose.yml          # PostgreSQL + Redis
└── .env.example
```

## Development Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Production build + TypeScript check
npm run lint      # ESLint
```

## Phase 1 Status

**Built:**
- App shell (sidebar 240px, topbar 56px, theme toggle)
- `/dashboard` — full dashboard with AI Brief, Market Pulse, Top Movers, Smart Money preview, Social Pulse, Heat Map mini, Watchlist, Risk Meter
- `/heatmap` — full heat map with sector grouping, tile sizing by market cap, rankings sidebar
- `/markets` — searchable asset grid with class filters
- All other routes — branded placeholder pages with Phase 2 feature lists

**Phase 2 targets:**
- Database integration (Prisma + PostgreSQL)
- Real data feeds (SEC EDGAR, STOCK Act, social APIs)
- `/smart-money` full page with filtering and signal scoring
- `/social` live sentiment dashboard
- `/copilot` AI chat interface
- `/newsletter` generation workflow
- Authentication (NextAuth or Clerk)

## Design System

### Colors (CSS Variables)
- Day mode: white backgrounds (`--bg-0` through `--bg-4`), dark ink text
- Night mode: dark charcoal backgrounds, light text (toggle via `data-theme="night"` on `<html>`)
- Accent colors: `--ai` (cyan #0891B2), `--up` (emerald #047857), `--down` (red #DC2626), `--warn` (amber #B45309)

### Fonts
- Display/headlines: Sora (`--font-sora`)
- UI/body: Geist (`--font-geist-sans`)
- Numbers/tickers: JetBrains Mono (`--font-jetbrains-mono`)

### Key Utility Classes
- `.card` — standard card with bg-1, border, shadow
- `.card-section` — nested section with bg-2
- `.demo-badge` — orange "Demo Data" warning badge
- `.text-up/down/warn/ai` — semantic color text
- `.font-display` — Sora font
- `.font-mono-nums` — JetBrains Mono with tabular numbers

## Data Layer (Phase 1)

All data comes from `src/lib/data/mockMarketData.ts`. No database calls.

Mock exports:
- `mockIndices` — SPY, QQQ, DIA, IWM, VIX, DXY
- `mockTopMovers` — NVDA, AMD, TSLA, AAPL, META, BTC
- `mockAllAssets` — expanded asset list
- `mockPoliticianTrades` — 4 demo trades
- `mockInsiderTrades` — 3 demo insider filings
- `mockSocialSentiment` — 4 ticker sentiment snapshots
- `mockHeatmapData` — 25+ tiles across 6 sectors
- `mockMacroEvents` — 5 calendar events
- `mockWatchlistItems` — 5 watchlist assets

## Adding New Pages

1. Create `src/app/(app)/[route]/page.tsx`
2. For interactive pages, use `DashboardClient.tsx` pattern (server component exports `page.tsx`, client component handles interactivity)
3. Wrap with `<DisclaimerFooter />` at bottom
4. Add route to `navSections` in `src/components/layout/Sidebar.tsx`

## Environment Variables

Copy `.env.example` to `.env.local` for local development. Database not required for Phase 1 (all data is mocked).

## Prisma (Phase 2+)

```bash
docker-compose up -d         # Start PostgreSQL + Redis
npx prisma migrate dev       # Run migrations
npx prisma db seed           # Seed demo data
npx prisma studio            # Browse data
```
