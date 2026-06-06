# Vault Schema

> Instructions for Claude / any LLM maintaining this vault.
> Based on: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

---

## Folder Structure

```
/                        ← vault root
├── index.md             ← content catalog (update on every ingest)
├── log.md               ← append-only timeline (never edit past entries)
├── SCHEMA.md            ← this file — behavioral protocol
├── raw/                 ← immutable source material (never modify)
├── wiki/                ← synthesized concept pages (LLM-maintained)
├── _templates/          ← Templater templates
└── build/               ← phase-wise implementation plan
    ├── P1 - Data & Auth Foundation/   🔵 Blue
    ├── P2 - Core Intelligence/        🟣 Purple
    ├── P3 - User Value & Retention/   🟢 Green
    ├── P4 - Growth & Virality/        🟠 Orange
    ├── P5 - Monetization/             🟡 Yellow
    └── P6 - Trust, Scale & Moat/     🔴 Red
```

---

## Color Coding (Nord / PLN theme)

| Phase | Color | Hex |
|-------|-------|-----|
| P1 Data & Auth | Blue | `#5e81ac` |
| P2 Intelligence | Purple | `#b48ead` |
| P3 Retention | Green | `#a3be8c` |
| P4 Virality | Orange | `#d08770` |
| P5 Monetization | Yellow | `#ebcb8b` |
| P6 Trust & Scale | Red | `#bf616a` |
| raw/ | Sea-green | `#8fbcbb` |
| wiki/ | Cyan | `#88c0d0` |
| _templates/ | Dark | `#4C566A` |

---

## Note Frontmatter Conventions

### Task note
```yaml
---
type: task
id: <db id>
phase: <1-6>
category: <category name>
title: <task title>
complexity: highest | high | medium | low
status: todo | in_progress | done | blocked
week_start: <int>
week_end: <int>
tags: [task, phase-N, <category-slug>]
---
```

### Category note
```yaml
---
type: category
phase: <1-6>
title: <category name>
complexity: <highest|high|medium|low>
week_start: <int>
week_end: <int>
tags: [category, phase-N]
---
```

### Phase note
```yaml
---
type: phase
phase: <1-6>
title: <phase title>
week_start: <int>
week_end: <int>
tags: [phase]
---
```

---

## Workflows

### Ingest new source
1. Add file to `raw/`
2. Update `index.md` under Raw Sources
3. Append entry to `log.md`
4. Create or update relevant `wiki/` pages

### Update task status
1. Open the task note in `build/`
2. Change `status:` in frontmatter
3. Update the checkbox list
4. Run SQL: `UPDATE version1 SET status = '...' WHERE id = <id>;`
5. Append to `log.md`

### Query progress
- Open `index.md` — Dataview table shows all tasks live
- Visit https://3cardtrick.vercel.app/progress for visual dashboard

---

## External Systems

| System | Purpose |
|--------|---------|
| https://3cardtrick.vercel.app/ | Live app |
| https://3cardtrick.vercel.app/progress | Build dashboard |
| github.com/msireesha-code/3cardtrick | Source code |
| Neon DB `version1` table | Task status store |
