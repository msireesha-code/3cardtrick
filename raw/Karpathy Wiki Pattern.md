---
type: source
source_url: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
ingested: 2026-06-06
tags: [raw, reference, wiki-pattern]
---

# Karpathy Wiki Pattern

> Source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## Core Idea

Build a **persistent, LLM-maintained knowledge base** rather than regenerating answers from scratch on each query.

## Three Layers

| Layer | Folder | Rule |
|-------|--------|------|
| Raw Sources | `raw/` | Immutable. Never modified. Source of truth. |
| The Wiki | `wiki/` | LLM-generated/maintained markdown. Fully owned by LLM. |
| The Schema | `SCHEMA.md` | Behavioral protocol defining workflows, conventions, structure. |

## Special Files

- **`index.md`** — Content-oriented catalog. All pages with one-line summaries. Updated every ingest.
- **`log.md`** — Append-only chronological record. Format: `## [YYYY-MM-DD] operation | title`

## Core Workflows

- **Ingest**: New source → LLM reads → updates 10-15 existing pages → appends log entry
- **Query**: Ask question → search index → read relevant pages → synthesize answer
- **Lint**: Health check for contradictions, stale claims, orphaned pages

## Philosophy

> "The wiki is a persistent, compounding artifact" — not regenerated each query.
> Human curates sources and asks questions. LLM handles bookkeeping and cross-referencing.
