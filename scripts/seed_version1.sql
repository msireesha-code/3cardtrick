-- ============================================================
-- version1: phase-wise task tracker
-- level 1 = phase, level 2 = category, level 3 = task
-- ============================================================

CREATE TABLE IF NOT EXISTS version1 (
  id           SERIAL PRIMARY KEY,
  parent_id    INTEGER REFERENCES version1(id) ON DELETE CASCADE,
  level        INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  phase        INTEGER,
  title        TEXT NOT NULL,
  description  TEXT,
  complexity   VARCHAR(20) CHECK (complexity IN ('highest','high','medium','low')),
  status       VARCHAR(20) NOT NULL DEFAULT 'todo'
                 CHECK (status IN ('todo','in_progress','done','blocked')),
  week_start   INTEGER,
  week_end     INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_version1_updated_at ON version1;
CREATE TRIGGER trg_version1_updated_at
  BEFORE UPDATE ON version1
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- PHASE ROWS  (level 1)
-- ============================================================
INSERT INTO version1 (id, parent_id, level, phase, title, week_start, week_end) VALUES
(1, NULL, 1, 1, 'Phase 1 — Data & Auth Foundation',     1,  3),
(2, NULL, 1, 2, 'Phase 2 — Core Intelligence',          4,  6),
(3, NULL, 1, 3, 'Phase 3 — User Value & Retention',     7,  9),
(4, NULL, 1, 4, 'Phase 4 — Growth & Virality',          10, 11),
(5, NULL, 1, 5, 'Phase 5 — Monetization',               12, 13),
(6, NULL, 1, 6, 'Phase 6 — Trust, Scale & Moat',        14, 15);

-- ============================================================
-- CATEGORY ROWS  (level 2)
-- ============================================================
INSERT INTO version1 (id, parent_id, level, phase, title, complexity, week_start, week_end) VALUES
-- Phase 1
(7,  1, 2, 1, 'Authentication',              'high',    1, 2),
(8,  1, 2, 1, 'Database Schema Design',      'high',    1, 2),
(9,  1, 2, 1, 'Real Market Data Pipeline',   'high',    2, 3),

-- Phase 2
(10, 2, 2, 2, 'Backtesting Engine',          'highest', 4, 5),
(11, 2, 2, 2, 'Proprietary Scoring Model',   'high',    5, 6),
(12, 2, 2, 2, 'RAG over Earnings Transcripts','high',   5, 6),

-- Phase 3
(13, 3, 2, 3, 'Portfolio Tracker',           'medium',  7, 8),
(14, 3, 2, 3, 'Watchlist & Price Alerts',    'medium',  8, 9),
(15, 3, 2, 3, 'Search History',              'medium',  9, 9),

-- Phase 4
(16, 4, 2, 4, 'Shareable Report Cards',      'medium',  10, 10),
(17, 4, 2, 4, 'Trending Leaderboard',        'low',     10, 10),
(18, 4, 2, 4, 'Weekly Email Digest',         'medium',  11, 11),
(19, 4, 2, 4, 'Embeddable Widget',           'low',     11, 11),

-- Phase 5
(20, 5, 2, 5, 'Stripe Integration',          'medium',  12, 12),
(21, 5, 2, 5, 'Freemium Gating',             'medium',  12, 13),
(22, 5, 2, 5, 'Team API Access',             'low',     13, 13),

-- Phase 6
(23, 6, 2, 6, 'Compliance Layer',            'low',     14, 14),
(24, 6, 2, 6, 'Analytics & Feedback Loop',   'low',     14, 15),
(25, 6, 2, 6, 'Performance & SEO',           'low',     15, 15);

-- ============================================================
-- TASK ROWS  (level 3)
-- ============================================================
INSERT INTO version1 (id, parent_id, level, phase, title, description, complexity) VALUES

-- ── Phase 1 › Authentication ──────────────────────────────
(26, 7, 3, 1, 'Integrate Clerk',
  'Add Clerk for OAuth, sessions, webhooks and user management. Install @clerk/nextjs, wrap app in ClerkProvider.', 'high'),
(27, 7, 3, 1, 'Auth middleware for protected routes',
  'Create middleware.ts using Clerk clerkMiddleware() to gate /dashboard, /api/* routes.', 'high'),
(28, 7, 3, 1, 'Sync Clerk user to Neon DB on signup',
  'Use Clerk webhook (user.created) to upsert a row into the users table with clerk_id, email, tier=free.', 'medium'),

-- ── Phase 1 › Database Schema Design ─────────────────────
(29, 8, 3, 1, 'Create users table',
  'id, clerk_id (unique), email, tier (free|pro|team), created_at, updated_at.', 'medium'),
(30, 8, 3, 1, 'Create searches table',
  'id, user_id FK, domain text, created_at. Index on user_id.', 'low'),
(31, 8, 3, 1, 'Create picks table',
  'id, search_id FK, stock_name, ticker, why, risks, investor_type, allocation_pct, confidence_score.', 'medium'),
(32, 8, 3, 1, 'Create watchlist table',
  'id, user_id FK, ticker, added_at. Unique on (user_id, ticker).', 'low'),
(33, 8, 3, 1, 'Create portfolio_picks table',
  'id, user_id FK, ticker, picked_at, price_at_pick. Tracks what user added to portfolio.', 'medium'),
(34, 8, 3, 1, 'Create prices table',
  'id, ticker, date, close_price. Unique on (ticker, date). Used for backtesting and P&L.', 'medium'),
(35, 8, 3, 1, 'Create alerts table',
  'id, user_id FK, ticker, target_price, direction (above|below), triggered bool, created_at.', 'medium'),

-- ── Phase 1 › Real Market Data Pipeline ──────────────────
(36, 9, 3, 1, 'Integrate Polygon.io API',
  'Install polygon.io client. Store API key in env. Create wrapper in src/lib/polygon.ts for ticker lookup, daily OHLC.', 'high'),
(37, 9, 3, 1, 'Map AI stock name → real ticker',
  'After LLM returns stock names, call Polygon /v3/reference/tickers?search= to resolve ticker. Cache result in picks table.', 'high'),
(38, 9, 3, 1, 'Nightly cron: fetch and store closing prices',
  'Vercel Cron at 00:30 UTC. For all distinct tickers in watchlist + portfolio_picks, fetch previous day close and upsert into prices table.', 'high'),
(39, 9, 3, 1, 'Display live price and % change on stock cards',
  'In StockCard component fetch latest price row from prices table. Show current price, 1-day change %, coloured green/red.', 'medium'),

-- ── Phase 2 › Backtesting Engine ─────────────────────────
(40, 10, 3, 2, 'Design backtesting query',
  'SQL: JOIN picks → prices on ticker + date range. Compute (price_now - price_at_pick) / price_at_pick for 1W, 1M, 3M windows.', 'highest'),
(41, 10, 3, 2, 'Build /api/backtest route',
  'POST {domain}. Returns avg return at each window for all historical picks in that domain. Requires ≥30 days of price data.', 'high'),
(42, 10, 3, 2, 'Backtest UI on results page',
  'Below 3S picks show a stats bar: "Past AI picks for EV returned +18% avg over 30 days (n=12 picks)".', 'medium'),
(43, 10, 3, 2, 'Ensure picks are stored from day 1',
  'Verify every search (even unauthenticated) writes to searches + picks tables so backtest data accumulates immediately.', 'high'),

-- ── Phase 2 › Proprietary Scoring Model ──────────────────
(44, 11, 3, 2, 'Pull fundamentals from Polygon',
  'Fetch P/E ratio, revenue growth YoY, market cap per ticker. Store in picks or a separate fundamentals table.', 'high'),
(45, 11, 3, 2, 'Pull news sentiment',
  'Integrate NewsAPI or Alpaca News. Score last 7-day headlines per ticker as positive/negative/neutral using LLM classifier.', 'high'),
(46, 11, 3, 2, 'Compute composite confidence score 0–100',
  'Weighted formula: AI conviction 40% + fundamentals 35% + news sentiment 25%. Store as confidence_score in picks.', 'high'),
(47, 11, 3, 2, 'Confidence score meter in StockCard UI',
  'Show a 0-100 gauge bar under each pick. Colour: 0-40 red, 41-70 amber, 71-100 green.', 'medium'),

-- ── Phase 2 › RAG over Earnings Transcripts ──────────────
(48, 12, 3, 2, 'Enable pgvector on Neon DB',
  'Run: CREATE EXTENSION IF NOT EXISTS vector. Add embeddings table: id, ticker, chunk_text, embedding vector(1536), source_date.', 'high'),
(49, 12, 3, 2, 'Ingest SEC EDGAR earnings transcripts',
  'Script to fetch latest 10-Q/10-K filings via SEC EDGAR API. Chunk text, embed via OpenAI text-embedding-3-small, upsert into embeddings table.', 'highest'),
(50, 12, 3, 2, 'Retrieve relevant chunks per 3S query',
  'On each domain search, embed the query, do cosine similarity search in embeddings table (top 5 chunks per ticker).', 'high'),
(51, 12, 3, 2, 'Inject transcript context into LLM prompt',
  'Prepend retrieved chunks to the system prompt so the model grounds its Why/Risks in actual company filings.', 'medium'),

-- ── Phase 3 › Portfolio Tracker ──────────────────────────
(52, 13, 3, 3, 'Add to Portfolio button on picks',
  'Authenticated users see "Add to Portfolio" on each StockCard. POST /api/portfolio {ticker, picked_at, price_at_pick}.', 'medium'),
(53, 13, 3, 3, 'Portfolio dashboard page',
  '/dashboard/portfolio. Table: ticker, entry price, current price (from prices table), P&L %, date added.', 'medium'),
(54, 13, 3, 3, 'Nightly portfolio price sync',
  'Extend existing nightly cron to also cover tickers in portfolio_picks table.', 'low'),

-- ── Phase 3 › Watchlist & Price Alerts ───────────────────
(55, 14, 3, 3, 'Watch button on stock cards',
  'POST /api/watchlist {ticker}. Toggle: add if not present, remove if already watching. Show filled/outline star icon.', 'medium'),
(56, 14, 3, 3, 'Alert creation UI',
  'On watchlist page: set target price + direction (above/below). POST /api/alerts. Store in alerts table.', 'medium'),
(57, 14, 3, 3, 'Nightly alert evaluation cron',
  'Compare latest close price against each untriggered alert. If condition met, mark triggered=true and enqueue email.', 'high'),
(58, 14, 3, 3, 'Send alert email via Resend',
  'Use Resend SDK to send "Your alert for TSLA above $300 has triggered" email with current price and P&L since pick.', 'medium'),

-- ── Phase 3 › Search History ─────────────────────────────
(59, 15, 3, 3, 'Persist every authenticated search to DB',
  'In /api/stocks route, after LLM responds, write search row + pick rows to DB for authenticated users.', 'medium'),
(60, 15, 3, 3, 'Recent searches sidebar on dashboard',
  '/dashboard: left sidebar lists last 10 domains searched. One-click re-runs the search.', 'low'),
(61, 15, 3, 3, 'Show performance delta since last search',
  'On re-run: compare current pick prices vs prices at time of last search. Show "+4.2% since you last searched EV".', 'medium'),

-- ── Phase 4 › Shareable Report Cards ─────────────────────
(62, 16, 3, 4, 'Dynamic OG image with @vercel/og',
  'GET /api/og/[searchId]. Renders domain title + 3 stock names + allocation bars as a PNG. Used as og:image meta tag.', 'medium'),
(63, 16, 3, 4, 'Public share route /share/[searchId]',
  'Read-only page rendering a past 3S report. No auth required. Includes og:image and og:title for rich link previews.', 'medium'),
(64, 16, 3, 4, 'Copy link and Twitter share button',
  'On results page: copy-to-clipboard button for share URL. Pre-filled tweet: "3S picked NVDA, MSFT, GOOG for AI. See the full report: [link]".', 'low'),

-- ── Phase 4 › Trending Leaderboard ───────────────────────
(65, 17, 3, 4, 'Aggregate searches by domain per week',
  'SQL: SELECT domain, COUNT(*) as searches FROM searches WHERE created_at > NOW()-7d GROUP BY domain ORDER BY searches DESC LIMIT 20.', 'low'),
(66, 17, 3, 4, 'Public /trending page',
  'Shows top 20 domains this week with search count and sparkline of pick performance. No auth required. Good for SEO.', 'medium'),

-- ── Phase 4 › Weekly Email Digest ────────────────────────
(67, 18, 3, 4, 'Monday 8am cron job',
  'Vercel Cron schedule: 0 8 * * 1. Queries all Pro users with portfolio picks.', 'medium'),
(68, 18, 3, 4, 'Portfolio P&L delta email',
  'Per user: compute week-over-week P&L change per holding. Render via Resend React Email template. Show top mover + laggard.', 'high'),
(69, 18, 3, 4, 'Domain suggestion in digest',
  'Include one trending domain from /trending data that the user has not searched yet. "This week Semiconductors is up 12% — try it."', 'low'),

-- ── Phase 4 › Embeddable Widget ──────────────────────────
(70, 19, 3, 4, 'Widget iframe page /widget',
  'Minimal version of StockFinder: no hero, compact cards, transparent background. Designed to embed at 400px width.', 'low'),
(71, 19, 3, 4, 'Embed script snippet',
  'One-liner <script> tag that injects an iframe pointing to /widget. Include in /docs page for copy-paste by bloggers.', 'low'),

-- ── Phase 5 › Stripe Integration ─────────────────────────
(72, 20, 3, 5, 'Stripe Checkout for subscriptions',
  'Create Pro and Team products in Stripe. /api/stripe/checkout route creates a checkout session. Redirect user on click of Upgrade.', 'medium'),
(73, 20, 3, 5, 'Stripe webhook to update user tier',
  '/api/stripe/webhook. Handle checkout.session.completed and customer.subscription.deleted. Update users.tier in DB.', 'high'),
(74, 20, 3, 5, 'Billing portal link',
  'Link to Stripe Customer Portal from /dashboard/settings so users can cancel, upgrade, or update payment method.', 'low'),

-- ── Phase 5 › Freemium Gating ────────────────────────────
(75, 21, 3, 5, 'Gate: 3 searches/day for free tier',
  'In /api/stocks: count searches today for user. If ≥3 and tier=free, return 429 with upgrade prompt.', 'medium'),
(76, 21, 3, 5, 'Gate: real prices and % change (Pro+)',
  'In StockCard: only show live price and change if user.tier is pro or team. Free users see a blurred placeholder + upgrade CTA.', 'medium'),
(77, 21, 3, 5, 'Gate: backtesting stats (Pro+)',
  'Backtest bar on results page only renders for Pro+. Free users see "Unlock historical accuracy — upgrade to Pro".', 'low'),
(78, 21, 3, 5, 'Gate: alerts limit (Free: 0, Pro: 5, Team: unlimited)',
  'In /api/alerts POST: count existing alerts. Block if over tier limit. Return clear error message with upgrade link.', 'medium'),
(79, 21, 3, 5, 'Gate: portfolio tracker (Pro+)',
  '"Add to Portfolio" button visible only for Pro+. Free users see tooltip: "Available on Pro plan".', 'low'),

-- ── Phase 5 › Team API Access ─────────────────────────────
(80, 22, 3, 5, 'API key issuance for Team users',
  'On /dashboard/settings (team tier): generate a UUID API key, store hashed in DB. Display once on creation.', 'medium'),
(81, 22, 3, 5, '/api/v1/stocks route with key validation',
  'Same logic as /api/stocks but authenticated via x-api-key header. Look up user by hashed key.', 'medium'),
(82, 22, 3, 5, 'Rate limiting via Vercel Edge middleware',
  'Use Vercel KV (Redis) to count API calls per key per minute. Return 429 with Retry-After header when exceeded.', 'medium'),

-- ── Phase 6 › Compliance Layer ───────────────────────────
(83, 23, 3, 6, 'Persistent "not investment advice" banner',
  'Sticky footer or top banner on all pages. Cannot be dismissed. Copy: "For educational purposes only — not investment advice."', 'low'),
(84, 23, 3, 6, 'Per-report disclaimer footer',
  'Below every AllocationBar: small text block citing data sources, model name, and date of generation.', 'low'),
(85, 23, 3, 6, '/disclaimer and /methodology pages',
  'Static pages explaining: what model is used, what data sources, how scores are computed, and legal disclaimer.', 'low'),

-- ── Phase 6 › Analytics & Feedback Loop ──────────────────
(86, 24, 3, 6, 'PostHog integration',
  'Install posthog-js. Track: search_run (domain), pick_added_to_portfolio (ticker), upgrade_clicked, share_link_copied.', 'low'),
(87, 24, 3, 6, 'Thumb up/down on each pick',
  'Two icon buttons below each StockCard. POST /api/feedback {pick_id, vote}. Store in a feedback table.', 'medium'),
(88, 24, 3, 6, 'Store feedback for future fine-tuning',
  'feedback table: id, pick_id FK, user_id FK, vote (up|down), created_at. Exportable as JSONL for fine-tune dataset.', 'low'),

-- ── Phase 6 › Performance & SEO ──────────────────────────
(89, 25, 3, 6, 'Static pre-render top 20 domain pages',
  'Create /domain/[slug] route. generateStaticParams() for top 20 domains. Each page is a pre-rendered 3S report with ISR revalidation every 24h.', 'medium'),
(90, 25, 3, 6, 'Redis/Upstash caching for repeated LLM queries',
  'In /api/stocks: hash the domain key. Check Upstash Redis for a cached response <24h old before calling OpenRouter. Cache hit skips LLM cost.', 'high'),
(91, 25, 3, 6, 'Sitemap and meta tags for domain pages',
  'Generate /sitemap.xml listing all /domain/[slug] pages. Add og:title, og:description, og:image per page for social sharing.', 'low');

-- sync the serial sequence so future inserts auto-increment from 92
SELECT setval('version1_id_seq', (SELECT MAX(id) FROM version1));
