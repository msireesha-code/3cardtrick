---
type: index
updated: 2026-06-06
---

# 3S Stock Finder — Vault Index

> Catalog of all notes in this vault. Update on every ingest or new page.
> Pattern: [Karpathy Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

---

## Build — Phase Notes

| Note | Phase | Weeks | Status |
|------|-------|-------|--------|
| [[P1 - Data & Auth Foundation]] | 1 | 1–3 | 🔵 Todo |
| [[P2 - Core Intelligence]]      | 2 | 4–6 | 🔵 Todo |
| [[P3 - User Value & Retention]] | 3 | 7–9 | 🔵 Todo |
| [[P4 - Growth & Virality]]      | 4 | 10–11 | 🔵 Todo |
| [[P5 - Monetization]]           | 5 | 12–13 | 🔵 Todo |
| [[P6 - Trust, Scale & Moat]]    | 6 | 14–15 | 🔵 Todo |

---

## Build — Category Notes

### Phase 1
- [[Authentication]] · [[Database Schema Design]] · [[Real Market Data Pipeline]]

### Phase 2
- [[Backtesting Engine]] · [[Proprietary Scoring Model]] · [[RAG over Earnings Transcripts]]

### Phase 3
- [[Portfolio Tracker]] · [[Watchlist & Price Alerts]] · [[Search History]]

### Phase 4
- [[Shareable Report Cards]] · [[Trending Leaderboard]] · [[Weekly Email Digest]] · [[Embeddable Widget]]

### Phase 5
- [[Stripe Integration]] · [[Freemium Gating]] · [[Team API Access]]

### Phase 6
- [[Compliance Layer]] · [[Analytics & Feedback Loop]] · [[Performance & SEO]]

---

## Raw Sources

- [[Karpathy Wiki Pattern]] — LLM wiki maintenance pattern
- [[Phase Plan]] — Full YC roadmap from session

---

## Wiki — Concepts

_(populated as we build)_

---

## Stats

```dataview
TABLE complexity, status, phase
FROM "build"
WHERE type = "task"
SORT phase ASC, complexity DESC
```
