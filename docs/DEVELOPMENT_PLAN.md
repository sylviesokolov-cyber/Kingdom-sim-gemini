# Development Plan

> Ordered roadmap. Phases run in sequence. A phase is not complete until its exit criteria are
> met **and verified** — see `CLAUDE.md` §7.

---

## Priorities

1. **Foundation before content.** The architecture has to carry 200+ days of systems. Content
   authored onto a weak spine gets rewritten twice.
2. **Every feature plugs into the loop.** `action → character/economy → kingdom → future choice`.
3. **Determinism and tests on the engine.** The simulation is the product; it must be provable.
4. **Landscape phone is the constraint, not an afterthought.**
5. **Verify, then report.** Committed is not done.

---

## Phase 0 — Workspace and design authority
**Status: COMPLETE**

- [x] Repository scaffold (React 18 · TS · Vite 5 · Tailwind 4 · Zustand · Vitest · PWA)
- [x] `CLAUDE.md` development contract
- [x] Game Bible, Content Guide, UI Design System
- [x] System specs: progression, simulation, bonds, gacha, factions, story, NPCs
- [x] Art assets and owner reference images ported
- [x] Roadmap and status tracker

**Exit:** a new session can continue from the repository alone. ✔

---

## Phase 1 — Foundation
**Status: ACTIVE**

The spine. Nothing else is safe to build until this is right.

- Domain types for player, estate, career, NPC, kingdom, resources, factions, story, gacha
- Seeded splittable RNG (`engine/rng`)
- Zustand store with slices; **zero** game logic in components
- Versioned save/migration with round-trip tests
- Day pipeline orchestrator with the 16 stages stubbed and sequenced
- Style tokens and the landscape PWA shell
- CI: typecheck + test + build on every push

**Exit:** a day can advance, state persists across reload, `simulateDay` is deterministic under
test, and the shell renders correctly at 740×360.

---

## Phase 2 — Vertical slice
**Status: ACTIVE**

One complete loop, end to end, proving the spine carries real gameplay.

- Home/Throne screen matching `docs/reference/02-home-screen-mockup.png`
- Companion panel: talk · gift · affection, with real relationship state
- Work screen: jobs costing energy, paying copper, moving standing and NPC affection
- Market screen: buy/sell against simulated prices
- Characters roster with rarity frames
- Summon screen with a working, tested pity system
- Next Day running the full pipeline with a visible change digest

**Exit:** a player can play 10 days, feel consequences, pull a companion, and reload without loss.

---

## Phase 3 — Simulation core
Fill in every pipeline stage for real.

- Production chains (grain→bread, herbs→medicine, ore→tools→arms)
- Storage, spoilage, and days-of-cover supply bands
- Consumption, shortfall bands, welfare and mortality
- Elastic damped pricing with player market impact
- Kingdom vitals, unrest and prosperity feedback
- Season and weather modifiers
- The change digest — *why* every number moved

**Exit:** sicken Mira on day 10 and a test asserts the full cascade through to unrest by day 14.

---

## Phase 4 — Player life
- Energy, hunger, health, and day phases as real constraints
- Equipment, housing, and property progression
- Businesses: capital, workers, upkeep, output, profit
- Deeds and standing with diminishing returns
- Estate promotion with patrons

**Exit:** how to spend a day is a genuine decision with no dominant answer.

---

## Phase 5 — Career tracks
All six tracks per `systems/PROGRESSION.md`.

- Track XP, ranks, faction floors, trial quests
- Track antagonism caps (Clergy↔Shadow, Court↔Shadow)
- Per-track job pools and perks
- Career shop against Guild Marks

**Exit:** two playthroughs on different tracks look and play differently from day 20.

---

## Phase 6 — Character system 2.0
- Five relationship dimensions
- Traits, wants, fears, secrets, wounds
- The NPC social graph and jealousy
- Mood derivation and mood-varied dialogue
- Relationship memory
- Absence impact and NPC mortality

**Exit:** two NPCs respond differently to the same action, for reasons the player can name.

---

## Phase 7 — Bonds, harem, gallery
- Bond episodes 1–5 for the principal cast
- Bond perks wired as engine modifiers
- Outfits and the gallery
- Jealousy confrontations and reconciliation arcs
- Resonance from gacha and from personal questlines

**Exit:** a bond perk provably changes a simulation outcome; a harem run hits a confrontation.

---

## Phase 8 — Factions
All eight, per `systems/FACTIONS.md`: opinion, power, stability, needs, leaders, relations,
red lines, relation ripple, faction crises.

**Exit:** a single decree measurably helps one faction and harms another, with later fallout.

---

## Phase 9 — Politics and council
Petitions · favors · appointments · decrees · taxes · scandals · votes · alliances · blackmail ·
promises · betrayals.

**Exit:** political choices form a persistent web, not a menu of buttons.

---

## Phase 10 — Story engine and Acts 1–3
The data-driven story engine, flags, delayed consequences, quest log with readable prerequisite
failures. Acts 1–3 authored and playable.

**Exit:** a choice in Act 1 is detectable and consequential in Act 3.

---

## Phase 11 — Kingdom development
Districts, buildings, infrastructure levels, investment. Aqueducts, farms, roads, markets, walls,
hospitals, temples, schools, workshops — each altering production, welfare, faction power, or
story availability.

---

## Phase 12 — Crisis engine
Famine · drought · plague · war · noble revolt · schism · criminal uprising · economic collapse ·
assassination · refugee influx. Multi-day staged arcs that evolve with the player's response.

**Exit:** a crisis is a short campaign of decisions, not a popup.

---

## Phase 13 — Acts 4–6 and the succession
The central mystery, the court, the dying king, and the faction succession vote.

---

## Phase 14 — Act 7, the throne, and the reign
Six throne routes. Endgame governance: laws, crises, your own succession.

---

## Phase 15 — Endings
Authored endings selected from accumulated state. Route archetype × kingdom outcome × personal
outcome. An ending gallery.

---

## Phase 16 — Polish and release
Onboarding · tutorial · accessibility · performance · loading and error states · save
export/import · audio · art consistency · balance · content QA · regression suite · production
deploy.

---

## Verification workflow

For every meaningful change:

1. `npm run verify` locally (typecheck → test → build)
2. Commit and push
3. Find the Actions run for the **exact** commit SHA
4. Wait while queued or in progress — queued is *not* verified
5. On failure: read the logs, fix the cause, push, repeat
6. Only then mark `[x]` in `DEVELOPMENT_STATUS.md`

An older green run never verifies a newer commit.
