# Development Status

> Living tracker. Update after every meaningful change.
> `[x]` verified · `[~]` partial/foundation · `[ ]` planned. **Nothing else.**
> Never mark `[x]` without having actually run the check.

**Current phase:** Phase 3 — Simulation core (partial). Phases 0–2 complete.
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

## Phase 1 — Foundation — COMPLETE

- [x] Domain types complete
- [x] Seeded splittable RNG, forked per domain
- [x] Zustand store; no game rules in components
- [x] Versioned save/migration with round-trip tests
- [x] Day pipeline orchestrator with a player-readable digest
- [x] Style tokens and landscape PWA shell
- [x] CI workflow: typecheck + test + build
- [x] Prerequisite evaluator returning failure reasons, not booleans

---

## Phase 2 — Vertical slice — COMPLETE

- [x] Home/Throne screen matching the reference mockup
- [x] Companion panel with real relationship state (affection, trust, mood, tier)
- [x] Talk / Gift / Assist with diminishing returns, favourites and jealousy
- [x] Work screen with career tracks and readable prerequisite failures
- [x] Market screen trading against simulated prices, with perk-adjusted spreads
- [x] Characters roster with rarity frames and a full character detail sheet
- [x] Summon screen with a visible pity counter and an overlay reveal
- [x] Next Day running the full pipeline, with the change digest
- [x] Kingdom screen: vitals, supply lines, facility efficiency, faction standing
- [x] Inventory with consumables
- [x] Verified at 900x420 and 740x360 landscape, no console errors

### Verified by playthrough
A player can, from a fresh save: read a companion's mood-varied line, work a
job, see the goods land in their pack, trade them on the Bourse, run a
ten-pull and get Resonance from a duplicate, advance the day, and read a
digest explaining why prices moved. State survives reload.

---

## Phase 3 — Simulation core — PARTIAL

Most of the pipeline landed while building the foundation, because balancing
it against the real population was the only way to know it worked.

- [x] Production chains with input reservation (grain→bread, herbs→medicine,
      ore→tools→arms)
- [x] Storage, spoilage, and per-resource days-of-cover supply bands
- [x] Consumption, shortfall, welfare and mortality
- [x] Damped elastic pricing with player market impact
- [x] Season and weather modifiers by resource profile
- [x] Price stress: an unaffordable staple hurts as well as an empty one
- [x] The change digest
- [ ] Crisis engine (famine, drought, plague as staged arcs)
- [ ] Player-facing mitigation tools for a hard winter — see below
- [ ] District-level welfare rather than kingdom-wide

---

## Known issues

- [ ] **Deep winter is punishing.** A hands-off playthrough sees welfare fall
      from ~70 to near zero across late Winter, driven by fish and fruit
      scarcity and staple price stress. The seasonal pressure is intended; the
      severity is not yet balanced against player mitigation, because the
      tools to mitigate it (stockpiling incentives, decrees, Caren's granary
      perks, kingdom investment) land in Phases 4 and 11. Re-tune then, not
      before — tuning it down now would flatten the season.
- [ ] Council screen is an authored empty state, not a system.
- [ ] Bond episodes, outfits, gallery and voice are stubs that say so.
- [ ] Character art is shared between some characters; the roster needs
      bespoke plates. The stage crop assumes the square-canvas source art.

---

## Phases 4–16

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
| 2026-09-12 | `82e5cfd` | — | — | — | not run | Docs and assets only |
| 2026-09-12 | `f7fc550` | pass | 81 pass | pass | pending | Engine foundation |
| 2026-09-12 | (this commit) | pass | 81 pass | pass | pending | Vertical slice |

CI results are recorded as `pending` until the run for the exact commit has
been observed green. Do not mark them otherwise without checking.

---

## Playtest log

> Record real sessions only. An unplayed build gets no row.

### 2026-09-12 — vertical slice, automated playthrough
Driven with Playwright at 900x420 and 740x360, landscape.

- **Starting screen:** Home, Caren active, affection 24 (Acquainted), trust 20.
- **First action:** talked to Caren — mood-varied line played, affection rose.
- **First job:** Haul Water from the Cisterns. 18 energy for 26 copper and
  2 water. The water appeared in the pack and was sellable on the Bourse.
- **First market action:** sell was correctly disabled for goods held at zero;
  buy and sell prices showed the expected spread.
- **First summon:** ten-pull for 3,000 crystals. Pity advanced to 10/80.
  Three copies of one companion arrived; the second and third were flagged
  +RES and raised her Resonance, as designed.
- **First day advance:** digest reported three market movements with causes.
- **Bugs found and fixed during the session:** the banner and matters cards
  collided with the dock; the retinue strip was clipped; the pull reveal was
  cut off by the screen's overflow clip; a new player could not afford the
  ten-pull the slice exists to demonstrate; character art rendered at a third
  of its intended size because the source plates are square canvases.
- **Not yet playtested by a human.** No human has played this build.

---

## Change log

### 2026-09-12 — vertical slice
- Built the playable loop: Home, Kingdom, Retinue, Work, Market, Summon, Pack.
- Added the prerequisite evaluator, which reports why a requirement failed so
  the UI can explain itself rather than greying a row out silently.
- Style system: tokens, panels, the Home composition, and shared screen chrome.
- Fixed five balance and design bugs surfaced by probing the simulation against
  the real population; see the engine commit for detail.
- Raised the starting Fate Crystal grant to 3,200 so a new player can meet the
  summon system on day one rather than saving for a week first.

### 2026-09-12 — foundation
- Built types, engine, store and save system. 81 tests.

### 2026-09-12 — workspace
- Created the repository workspace: scaffold, tooling, directory architecture.
- Wrote the full documentation set: development contract, game bible, content guide, UI design
  system, and seven system specs.
- Ported character art, background art, and PWA icons from `kingdom-sim`.
- Stored the owner's three UI/art reference images as the canonical visual target.
- Recorded the four settled design decisions above.
