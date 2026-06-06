-- ============================================================
-- Phase 1 — DB Schema Migration
-- Creates 7 core tables for 3S Stock Finder
-- ============================================================

-- auto-update trigger (reuse pattern from version1)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  clerk_id   VARCHAR(255) UNIQUE NOT NULL,
  email      VARCHAR(255) NOT NULL,
  tier       VARCHAR(20)  NOT NULL DEFAULT 'free'
               CHECK (tier IN ('free','pro','team')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── searches ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS searches (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  domain     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_searches_user_id    ON searches(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_domain     ON searches(domain);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at);

-- ── picks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS picks (
  id               SERIAL PRIMARY KEY,
  search_id        INTEGER NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  stock_name       TEXT    NOT NULL,
  ticker           VARCHAR(20),
  why              TEXT,
  risks            TEXT,
  investor_type    VARCHAR(50),
  allocation_pct   INTEGER,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_picks_search_id ON picks(search_id);
CREATE INDEX IF NOT EXISTS idx_picks_ticker    ON picks(ticker);

-- ── watchlist ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id       SERIAL PRIMARY KEY,
  user_id  INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker   VARCHAR(20) NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);

-- ── portfolio_picks ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_picks (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker        VARCHAR(20)    NOT NULL,
  stock_name    TEXT,
  picked_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  price_at_pick NUMERIC(12, 4)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio_picks(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_ticker  ON portfolio_picks(ticker);

-- ── prices ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prices (
  id          SERIAL PRIMARY KEY,
  ticker      VARCHAR(20)    NOT NULL,
  date        DATE           NOT NULL,
  close_price NUMERIC(12, 4) NOT NULL,
  UNIQUE (ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_prices_ticker_date ON prices(ticker, date DESC);

-- ── alerts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker       VARCHAR(20)    NOT NULL,
  target_price NUMERIC(12, 4) NOT NULL,
  direction    VARCHAR(10)    NOT NULL CHECK (direction IN ('above','below')),
  triggered    BOOLEAN        NOT NULL DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id   ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_untriggered ON alerts(triggered) WHERE triggered = FALSE;

-- ── feedback (Phase 6 pre-wire) ───────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id         SERIAL PRIMARY KEY,
  pick_id    INTEGER NOT NULL REFERENCES picks(id) ON DELETE CASCADE,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  vote       VARCHAR(4) NOT NULL CHECK (vote IN ('up','down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_pick_id ON feedback(pick_id);
