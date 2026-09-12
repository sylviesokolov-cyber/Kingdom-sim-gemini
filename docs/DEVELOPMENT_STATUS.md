# Development Status

> Living tracker. Update after every meaningful change.
> `[x]` verified · `[~]` partial/foundation · `[ ]` planned. **Nothing else.**
> Never mark `[x]` without having actually run the check.

**Current phase:** Phase 1 — Foundation / Phase 2 — Vertical slice
**Last updated:** 2026-09-12

---

## Phase 0 — Workspace and design authority — COMPLETE

- [x] Repo scaffold: React 18, TypeScript 5.7, Vite 5, Tailwind 4, Zustand 5, Vitest 2, PWA
- [x] `CLAUDE.md` development contract
- [x] `AGENTS.md` pointer
- [x] `docs/GAME_BIBLE.md`
- [x] `docs/CONTENT_GUIDE.md`
- [x] `docs/UI_DESIGN_SYSTEM.md`
- [x] `docs/systems/PROGRESSION.md`
- [x] `docs/systems/SIMULATION.md`
- [x] `docs/systems/BONDS.md`
- [x] `docs/systems/GACHA.md`
- [x] `docs/systems/FACTIONS.md`
- [x] `docs/systems/STORY.md`
- [x] `docs/systems/NPCS.md`
- [x] `docs/DEVELOPMENT_PLAN.md`
- [x] Art assets ported from `kingdom-sim` (8 portraits, 15 backgrounds, PWA icons)
- [x] Owner reference images stored in `docs/reference/`

---

## Phase 1 — Foundation

- [ ] Domain types complete
- [ ] Seeded splittable RNG
- [ ] Zustand store with slices
- [ ] Versioned save/migration with round-trip test
- [ ] Day pipeline orchestrator, 16 stages sequenced
- [ ] Style tokens and landscape PWA shell
- [ ] CI: typecheck + test + build

---

## Phase 2 — Vertical slice

- [ ] Home/Throne screen matching the reference mockup
- [ ] Companion panel with real relationship state
- [ ] Work screen
- [ ] Market screen
- [ ] Characters roster
- [ ] Summon screen with tested pity
- [ ] Next Day with change digest

---

## Phases 3–16

Not started. See `DEVELOPMENT_PLAN.md`.

---

## Settled design decisions

Recorded so no future session relitigates them:

| Decision | Choice | Date |
|---|---|---|
| Relationship to `kingdom-sim` | Clean rebuild; port content and art; `kingdom-sim` is reference only | 2026-09-12 |
| Progression shape | Estate spine (7 tiers) + 6 parallel career tracks | 2026-09-12 |
| Content maturity | Suggestive/sensual, fade-to-black; no explicit content, ever | 2026-09-12 |
| Gacha monetization | In-game currency only; no real-money path | 2026-09-12 |
| Platform | Landscape-first PWA; portrait unsupported | 2026-09-12 |
| Protagonist | Male, default name Syl, starts as Outsider | 2026-09-12 |

---

## Verification log

> One row per verified state. Never backfill a row you did not observe.

| Date | Commit | typecheck | test | build | CI | Notes |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | No verified builds yet |

---

## Playtest log

> Record real sessions only. An unplayed build gets no row.

None yet.

---

## Change log

### 2026-09-12
- Created the repository workspace: scaffold, tooling, directory architecture.
- Wrote the full documentation set: development contract, game bible, content guide, UI design
  system, and seven system specs.
- Ported character art, background art, and PWA icons from `kingdom-sim`.
- Stored the owner's three UI/art reference images as the canonical visual target.
- Recorded the four settled design decisions above.
