# 3S Stock Finder

AI-powered stock discovery for the Indian market (NSE/BSE). Enter any market domain and get the top 3 stocks with allocation strategy, fundamentals, backtesting, and portfolio tracking.

**Production:** https://3cardtrick.vercel.app

---

## Features

- **AI Stock Picks** — enter any sector/domain, get top 3 NSE/BSE stocks with allocation rationale via OpenRouter LLM
- **Fundamentals** — P/E, market cap, revenue, debt-to-equity per stock
- **Backtesting Engine** — historical return simulation with configurable date range
- **News Sentiment** — recent headlines + sentiment score per stock
- **Portfolio Tracker** — track holdings, P&L, and allocation across picks
- **Watchlist** — save stocks for later review
- **Price Alerts** — email notifications via Resend when a stock hits your target
- **Search History** — persisted per user session
- **Trending Searches** — community-level trending domains/stocks
- **Shareable Reports** — public URL per analysis with OG image preview
- **Embed Widget** — embeddable iframe for any stock pick
- **Compliance / Disclaimer** — methodology and disclaimer pages
- **SEO / Sitemap** — `sitemap.ts` auto-generates sitemap
- **Analytics** — PostHog event tracking
- **LLM Response Cache** — Upstash Redis caches results for 6 hours
- **Build Progress Dashboard** — `/progress` — live YC roadmap tracker from Neon DB

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Neon PostgreSQL (pooled via `DATABASE_URL`) |
| Auth | Neon Auth (Stack Auth) — GitHub + Google SSO |
| LLM | OpenRouter (`OPENROUTER_API_KEY` + `OPENROUTER_MODEL`) |
| Market Data | Yahoo Finance (NSE/BSE) |
| Email | Resend |
| Cache | Upstash Redis |
| Analytics | PostHog |
| Charts | Recharts |
| Deployment | Vercel (auto-deploy on push to `main`) |

---

## Routes

| Route | Description |
|---|---|
| `/` | Main stock finder UI |
| `/progress` | Live build progress dashboard |
| `/portfolio` | Portfolio tracker |
| `/watchlist` | Saved stocks |
| `/backtest` | Backtesting engine |
| `/trending` | Trending searches |
| `/share/[id]` | Shareable report page |
| `/sector/[slug]` | Sector-level view |
| `/widget` | Embeddable widget |
| `/methodology` | How the AI picks work |
| `/disclaimer` | Compliance page |
| `/sign-in`, `/sign-up` | Auth pages |
| `/api/stocks` | `POST {domain}` → OpenRouter → stock picks |
| `/api/progress` | `GET` → aggregated build stats from Neon |
| `/api/alerts` | Price alert CRUD |

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env template and fill in keys
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

```
DATABASE_URL              # Neon PostgreSQL (pooled)
DATABASE_URL_UNPOOLED     # Neon PostgreSQL (direct)
OPENROUTER_API_KEY        # LLM calls
OPENROUTER_MODEL          # e.g. openai/gpt-4o-mini
NEXT_PUBLIC_STACK_PROJECT_ID       # Neon Auth
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
STACK_SECRET_SERVER_KEY
CRON_SECRET               # Vercel cron auth
RESEND_API_KEY            # Price alert emails
NEXT_PUBLIC_POSTHOG_KEY   # Analytics
NEXT_PUBLIC_POSTHOG_HOST
UPSTASH_REDIS_REST_URL    # LLM response cache
UPSTASH_REDIS_REST_TOKEN
```

---

## Deployment

Vercel auto-deploys every push to `main`. GitHub Actions workflow (`.github/workflows/`) handles CI.

To deploy manually:

```bash
vercel --prod
```

---

## Repository

- GitHub: https://github.com/msireesha-code/3cardtrick
- Branch: `main`
