# Development Status

> Living tracker. Update after every meaningful change.
> `[x]` verified · `[~]` partial/foundation · `[ ]` planned. **Nothing else.**
> Never mark `[x]` without having actually run the check.

**Current phase:** Phase 5 — Career tracks (partial; brought forward). Phases 0–2
complete, Phase 3 partial.
**Last updated:** 2026-09-12 (career progression made reachable for the first
time — rank trials, a shared effect applier, real attributes and throne routes;
see the change-log entry and `docs/design/GAME_DESIGN_ANALYSIS.md`. Earlier the
same day: the top HUD's bar is gone — its chips float over the art — and an original gilt icon set replaces lucide across the HUD, dock and Home rail; merged to the base branch at `398708e`, CI and Pages deploy both green)

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

- [x] Home screen: one full-bleed painted backdrop
      (`public/backgrounds/home_dusk_gold.jpg`), the shared utility rail
      (Mail/Quests/Events/Notice), and a single card showing the player's
      next step toward their next estate (via `canPromoteEstate`) — tap to
      open the screen that handles it. The kingdom-vitals grid and the
      multi-row Day's Actions list from earlier the same day were cut on the
      owner's direct instruction not to clutter the screen with text; Events
      stays reachable through the rail's modal sheet
      (`src/content/events/`, day-windowed, text/tag only) rather than a
      permanent on-screen banner. No companion art or bond content, as
      settled repeatedly earlier the same day — see below.
- [x] Home screen, follow-up pass: a small translucent "Today" panel on the
      right edge (`.home-panel`) surfaces only what actually needs
      attention — live event count, recruited companions not yet interacted
      with today, recruited companions in a non-Healthy condition, goods at
      Critically Scarce supply, and kingdom unrest above 60 — each row reads
      from existing `game`/`ui` state (no new engine logic) and taps through
      to the relevant screen; it renders nothing when there is nothing to
      report. The top-left HUD (`HeaderHud.tsx`) now shows the player's
      current role next to their estate — their highest-ranked career track
      ("Sergeant (Martial)") when they hold one, else their estate's flavor
      title. A hide-UI button (top-right of Home, always visible) drops the
      HUD, dock, rail, quest card and panel to show the backdrop alone —
      unlike the "immersive mode" removed earlier the same day (which only
      existed to see companion art that Home no longer has), this one exists
      to see the *kingdom* backdrop the owner asked to keep as the screen's
      main focus, and a background selector (single image or carousel) is
      expected to land here next.
- [x] Character tab (`ProfileScreen.tsx`, `ScreenId: 'profile'`): a
      read-only player sheet — the full estate ladder with the current step
      highlighted, vitals (energy/health/hunger), the five attributes,
      currencies, all six career tracks (via the `CareerTrackList` component
      shared with the Work screen), personal standing with each of the
      eight factions, and a record panel (deeds/perks/businesses/bounty
      counts plus active perk tags). Deliberately read-only — petitioning an
      estate and taking career jobs stay on the Work screen; this tab exists
      to see the whole character at once, not to duplicate its actions.
- [x] Bonds tab (Characters screen): a full-bleed hero screen — the
      companion's art fills the stage with Talk/Gift/Bond, the tier/affection
      readout, and traits overlaid directly on it, plus a right-side rail
      (Profile, Outfits, Bond Story, Intimacy, Gallery, Voice, More) and a
      bottom companion switcher — rather than a roster-grid-first pattern.
      Profile opens the full relationship-dimension detail sheet (trust,
      respect, desire, resentment, jealousy, perks, opinions, memories).
      Talk / Gift / Bond retain diminishing returns, favourites and jealousy.
- [x] Work screen with career tracks and readable prerequisite failures
- [x] Market screen trading against simulated prices, with perk-adjusted spreads
- [x] Characters roster with rarity frames and a full character detail sheet
- [x] Summon screen with a visible pity counter and an overlay reveal
- [x] Next Day running the full pipeline, with the change digest
- [x] Kingdom screen: vitals, supply lines, facility efficiency, faction standing
- [x] Inventory with consumables
- [x] Verified at 900x420 and 740x360 landscape, no console errors

**2026-09-12 redesign — Home and Bonds split, then Home reverted again.**
Home originally hosted the companion panel and dialogue directly (matching
the first reference mockup). The owner then asked for a split: Home became
an action-hub screen with an ambient "L2D-style" companion display and a
chambers backdrop, while all companion interaction (Talk/Gift/Assist, the
quote line, the relationship-dimension detail) moved into the Bonds tab.
Later the same day the owner clarified further: the main game is the
kingdom simulator, and bonding/companions are a side system that should
never be forced onto Home's screen. Home was rebuilt again as a
companion-free kingdom dashboard (see the "Home reverted" change-log entry)
— the Bonds-tab destination from the split stands, only Home's own content
changed a second time. See `docs/UI_DESIGN_SYSTEM.md` for the current Home
composition and `docs/systems/BONDS.md` for the interaction model.

The "L2D-style" idle motion (breathing/sway keyframe + pointer-parallax) is
still used, just only on the Bonds tab now — it is a CSS approximation, not
real Live2D rigging, since the roster is single flattened portraits, not
layered/rigged source art. Documented in `src/styles/screens.css`.

**2026-09-12 — a third companion-display attempt, and a third revert, same
day.** A session asked to "check the main menu" against Azur Lane / Brown
Dust 2 read the owner's own `02-home-screen-mockup.png` (which does show a
full-bleed companion, matching that genre) and rebuilt Home around it again
— full-bleed companion art on stage, a bond/affection card, a scene picker,
an immersive mode. All of that was live, tested, and green (typecheck,
81→90 tests, build) before the owner stopped it mid-task: Home is not that
screen here, full stop, and CLAUDE.md / UI_DESIGN_SYSTEM.md §3 already say
so — this is the same correction as `0989586`→`27f2ded` earlier the same
day, just re-arrived-at by a different session that didn't weight the
existing settled-design section heavily enough against a reference image.
Home was rebuilt a third time to the companion-free dashboard. The one
piece kept from the reverted attempt: a live-event system
(`src/content/events/`, `LiveEventDefinition`) that gives the Events rail
button and a new event-ticker row real day-windowed campaign data instead
of a placeholder toast — rendered as a plain text/tag row, no character
art, no thumbnail. `homeSceneIndex` (a Home backdrop picker) and the
`ui.immersive` flag were added and then fully removed in the same
session — see the save-version bump below.

**Do not re-attempt a companion-display Home.** Two owner corrections
earlier the same day plus this one make it three. If a future session is
tempted by a reference image again: read the *settled* section of
UI_DESIGN_SYSTEM.md (§3) first, which says explicitly Home carries no
companion art, and treat a genre-comparison ask ("does this look like
[gacha game]?") as a question to answer about the *existing* screen, not
a license to rebuild it toward the reference.

**2026-09-12 — Home rebuilt a fourth time, this one from explicit
requirements.** The owner then gave direct, itemized spec for Home rather
than a reference image to interpret: one background image from
`public/backgrounds/` (an existing painted plate, not a new asset), the HUD
(already global), buttons to reach kingdom-specific screens (already global
— the dock), a single quest/objective for the player's current role, and
explicitly *no* clutter — "don't clutter the home screen with many texts,
options." Read as a spec, not a reference to copy visually, this landed as:
`.scene-bg`/`.scene-vignette` (shared with the Bonds tab) behind a fixed
backdrop, the existing utility rail unchanged, and one new card —
`.home-quest` — computing the player's actual next step from
`canPromoteEstate`/`ESTATE_LADDER` (their next estate's title plus the
first blocking reason, or "ready to petition" once eligible) rather than
authored flavor text. The kingdom-vitals grid, the Day's Actions list, and
the on-screen event banner all built earlier the same day were removed as
exactly the clutter the owner was pointing at; `homeEventIndex` and
`setHomeEventIndex` were removed from the store with them since nothing
uses a "featured" event pick anymore — the Events sheet lists all of
`activeEvents()` directly. `src/content/events/` itself is unchanged and
still real, day-windowed data, just reached only through the rail's modal.

This did **not** reopen the companion-art question — no character art or
bond content was added or discussed. It is a separate design pass on the
same companion-free screen, not a fourth reversal of the settled
companion decision above.

### Verified by playthrough
A player can, from a fresh save: read Home's quest card (a real next-step
computed from `canPromoteEstate`, correct at day 1 and after advancing
days), open the Events sheet from the rail and tap into a live campaign's
screen, open the Bonds tab and read a companion's mood-varied line, talk to
raise affection, gift from the pack (favourites correctly surfaced first),
work a job, see the goods land in the pack, trade them on the Bourse, run a
ten-pull and get Resonance from a duplicate, advance the day, and read a
digest explaining why prices moved. State survives reload — verified via a
headless render at 740x360, 900x420 and 1280x600, no console errors, no
overlapping UI at any size.

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

## Phase 5 — Career tracks — PARTIAL (brought forward)

Brought forward from its planned position because it was not partial, it was
**inert**: every rank required a trial quest that no content, engine path or UI
could complete, so careers were locked at rank 0 and the estate ladder was
locked at Peasant behind its rank-2 requirement.

- [x] Rank trials: 30 authored trials, six tracks by five ranks
      (`src/content/progression/trials.ts`), gated on attributes, estate, flags
      and — from rank 3 up — a named companion's trust. Copper is a fee, never
      a qualification.
- [x] `engine/career`: `nextTrial`, `canAttemptTrial`, `completeTrial`,
      `jobEffect`. Trial resolution lives here rather than in
      `engine/progression` because `engine/effects` already depends on
      progression for the XP curve; folding it in would close an import cycle.
- [x] `engine/effects`: `applyEffect`/`applyEffects`/`canAfford` — the one
      place the `Effect` vocabulary becomes state. Jobs and trials both go
      through it; events, quests and bond episodes will.
- [x] Attributes are real progression. Job attribute rewards were previously
      dead data (`attributes: { cunning: 0 }`, never applied); every job now
      trains specific attributes, and training decays with repetition on the
      same job via the shared `repetitionFactor` curve.
- [x] Throne routes: the six routes as `Prerequisite` data with per-route
      progress and blocking reasons (`throneRoutesAvailable`), rendered on the
      Character sheet so a Hawker can see what a Magnate is for.
- [x] Work screen: the next rank trial per track, with readable blocking
      reasons and an Undertake button (`CareerTrackList`, now optionally
      actionable; the Character sheet keeps it read-only).
- [x] Two dead ends closed: rank-1 faction floors dropped 10 → 0 (the Court
      track was unreachable — its rank-1 trial wanted Crown opinion 10 and
      nothing a rank-0 player could do moved Crown opinion), and entry track
      work now moves its own faction so the rank-2 floor of 25 is earnable.
- [ ] Career perks — none exist; `guildMarks` accrue with nothing to buy.
- [ ] Career shop against Guild Marks.
- [ ] Per-track job pools at ranks 4–5 are thin (1,600 and 3,400 track XP
      against two or three authored jobs per track).
- [ ] Estate promotion still takes no patron, contrary to `PROGRESSION.md` §2.

### Verified by simulated playthrough
150 in-world days driven through the real engine on each of the six tracks
(work the best available job until energy runs out, reserving the trial's
energy; attempt the trial; petition when eligible; advance the day). Every
track now climbs: merchant and clergy reach rank 4 and Burgher, martial reaches
rank 3 and Villager, court and scholar reach rank 2 and Villager, shadow
reaches rank 2 and Villager. Before this change every track sat at rank 0 and
Peasant forever, on every seed, indefinitely.

**Not playtested by a human.** These are engine probes, not play.

---

## Known issues

- [ ] **Deep winter is punishing.** A hands-off playthrough sees welfare fall
      from ~70 to near zero across late Winter, driven by fish and fruit
      scarcity and staple price stress. The seasonal pressure is intended; the
      severity is not yet balanced against player mitigation, because the
      tools to mitigate it (stockpiling incentives, decrees, Caren's granary
      perks, kingdom investment) land in Phases 4 and 11. Re-tune then, not
      before — tuning it down now would flatten the season.
- [ ] **Standing is now the progression bottleneck, and it has one source.**
      With careers reachable, the thing that gates the estate ladder is
      standing points, which come almost entirely from jobs — and job standing
      has sharply diminishing returns by design. A merchant probe reached
      Burgher on day 141 mostly waiting on standing. Standing needs to come
      from deeds, quests and events, which means the event and story engines
      are also the progression fix. See `docs/design/GAME_DESIGN_ANALYSIS.md` §2.4.
- [ ] **No authored narrative events exist.** `EventDefinition`, `EventChoice`,
      `firedEvents`, `scheduled` and now `applyEffect` are all in place, and
      `src/content/events/` holds only `LiveEventDefinition` (banner
      advertising, explicitly not the narrative unit). The world simulates and
      never interrupts the player to ask a question.
- [ ] **`driftFactions` conflates faction mood with opinion of the player.** A
      faction's opinion of the player drifts daily from kingdom state — the
      Guilds like you more because prosperity is high. `FactionState` should
      split `mood` (drifts with the world) from `opinion` (moves only through
      the player's acts), before Phase 8 authors content on the conflation.
- [ ] `NpcInterior.want` is authored for all fifteen characters and read by
      nothing. No NPC currently pursues anything of their own.
- [ ] Council screen is an authored empty state, not a system.
- [ ] Bond episodes, outfits, intimacy scenes, intimacy gallery and voice are
      all stubs that say so on the Bonds tab's rail (disabled, with a title
      explaining what unlocks them).
- [ ] Character art is shared between some characters; the roster needs
      bespoke plates. The stage crop assumes the square-canvas source art.
- [ ] `public/characters/backgrounds/royal_silver_hair_throne.webp` (the
      Kingdom screen's background) is not a valid image file — found while
      testing this change-log entry's Home rework. It fails silently (a CSS
      `background-image` with no `onError` fallback, unlike `CharacterArt`),
      so the Kingdom screen just shows its scrim with no backdrop. Needs a
      real replacement asset; not fixed here since it's outside this
      change's scope.

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
| Home screen content | No companion art/portraits/bonding ever, on Home. Tried and reverted three times in one day (`0989586`→`27f2ded`, then again same-session below) | 2026-09-12 |

---

## Verification log

> One row per verified state. Never backfill a row you did not observe.

| Date | Commit | typecheck | test | build | CI | Notes |
|---|---|---|---|---|---|---|
| 2026-09-12 | `82e5cfd` | — | — | — | not run | Docs and assets only |
| 2026-09-12 | `f7fc550` | pass | 81 pass | pass | pending | Engine foundation |
| 2026-09-12 | `077af88` | pass | 81 pass | pass | **green** | Vertical slice — run 34683606087 |
| 2026-09-12 | `66f4602` | pass | 81 pass | pass | **green** | CI hardening — run 34683745818 |
| 2026-09-12 | `61686eb` | pass | 81 pass | pass | **green** | Path fix + Pages deploy — CI run 34684177803, deploy run 34684177817 |
| 2026-09-12 | `0989586` | pass | 81 pass | pass | **green** | Home/Bonds redesign — CI run 34695377499, deploy run 34695377514 |
| 2026-09-12 | `66027b9` | pass | 81 pass | pass | **green** | Recorded verified CI/deploy runs for `0989586` — CI run 34695440082, deploy run 34695440079 |
| 2026-09-12 | `bc7658d` | pass | 81 pass | pass | **green** | Home immersive mode + Bonds hero-screen redesign — CI run 34697125911, deploy run 34697125993 |
| 2026-09-12 | `e0b0590` | pass | 81 pass | pass | **green** | Recorded verified CI/deploy runs for `bc7658d` — CI run 34697207913, deploy run 34697207885 |
| 2026-09-12 | `27f2ded` | pass | 81 pass | pass | **green** | Home reverted to a companion-free kingdom dashboard — CI run 34699540794, deploy run 34699540567 |
| 2026-09-12 | `aaf1ca1` | pass | 87 pass | pass | not run | HUD/dock polish — no run of its own; pushed to the base branch together with `398708e` below |
| 2026-09-12 | `398708e` | pass | 87 pass | pass | **green** | HUD bar removed + original icon set, fast-forwarded onto the base branch — CI run 34719926595, deploy run 34719926600 |
| 2026-09-12 | `7a159e4` | pass | 115 pass | pass | **green** | Career progression made reachable — rank trials, `applyEffect`, real attributes, throne routes. Browser-verified at 740x360/900x420. CI run 34722170630 |
| 2026-09-12 | `ed665b9` | pass | 115 pass | pass | **green** | Design analysis + doc updates — CI run 34722625325. (The job-level API reported its Test step in progress for several minutes after the run had in fact completed; the run-level status is the reliable one.) |

Run `82e5cfd` failed on a missing `@types/node`, fixed in `f7fc550`. Only the
branch head gets a run when several commits are pushed together, so `f7fc550`
has no run of its own.

CI results are recorded as `pending` until the run for the exact commit has
been observed green. Do not mark them otherwise without checking.

---

## Live builds

- **GitHub Pages:** https://sylviesokolov-cyber.github.io/Kingdom-sim-gemini/
  Deploys automatically on every push to this branch (see
  `.github/workflows/deploy-pages.yml`). Verified via a successful Actions
  run (build + deploy jobs both green on `61686eb`); not fetched directly
  from this sandbox, which blocks outbound requests to `github.io` by
  network policy.
- A one-off snapshot was also published as a Claude Artifact for immediate
  mobile testing without waiting on Pages; that link is not durable the way
  the Pages deploy is and won't reflect future commits.

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

### 2026-09-12 — Career progression made reachable for the first time
An audit against the source (CLAUDE.md §2.6: code outranks documentation) found
that the project's self-described most important structural system could not
run. Every career rank required a trial quest (`trial_<track>_<n>`) referenced
by id in `CAREER_DEFINITIONS` and authored nowhere, and `advanceCareer` had no
caller outside the test suite. Confirmed by probe *before* changing anything:
with infinite copper, maxed track XP and every faction at 100, the only
remaining blocker was "The rank trial has not been completed."

The cascade that caused: careers locked at rank 0 → Villager blocked behind its
rank-2 requirement → every estate above Peasant unreachable → Acts 2+
ungateable and throne routes unreachable.

- **`src/engine/effects/index.ts`** — `applyEffect`, `applyEffects`,
  `canAfford`. `Effect` is declared in `types/content.ts` as "the single
  vocabulary for changing state" and nothing applied it generically, so each
  consumer hand-rolled a partial version and silently dropped the fields it did
  not use. That is why job attribute rewards were dead data. The work hall now
  routes through it, and so do trials.
- **`src/content/progression/trials.ts`** — 30 authored trials. From rank 3 up
  every trial requires a named companion's trust, which makes "bonds are power"
  a gate rather than a claim. The estate and career ladders now interlock rung
  by rung: rank 2 wants Peasant, rank 3 Villager, rank 4 Burgher, rank 5 Gentry.
- **`src/engine/career/index.ts`** — trial resolution and `jobEffect`.
- **Attributes are progression.** Every job trains specific attributes, and
  training decays with repetition via a `repetitionFactor` curve now shared
  with `standingGain`. A varied life out-trains a ground one.
- **`throneRoutesAvailable`** and the six routes as `Prerequisite` data, on the
  Character sheet with per-route progress and reasons.
- **Balance fixes found by probe, not by reading:** rank-1 faction floors
  10 → 0 (Court was a hard dead end), and entry track work now moves its own
  faction so rank 2's floor of 25 is earnable from inside the game.
- **`docs/design/GAME_DESIGN_ANALYSIS.md`** — market analysis against the
  kingdom-sim, raising-sim, gacha and relationship-RPG comparables; the
  progression audit; NPC and event design; and a revised phase ordering that
  moves the event and story engines ahead of further simulation depth.
- Verified: `npm run typecheck`, 115 tests (28 new across
  `tests/effects.test.ts` and `tests/career.test.ts`), `npm run build`, and CI
  run 34722170630 green on the exact commit `7a159e4`.
- Verified in the browser against the production preview build (Playwright,
  740x360 and 900x420 landscape): the trial block and the throne-route rows
  render legibly, no console errors, no horizontal overflow at either size.
  A trial was taken through the actual UI — merchant rank 0 to 1, 80 track XP
  spent, the 40-copper float paid and the 95 returned, `merchant.made_the_float`
  written — and the result survived both a reload and a day advance.
- **Left undone:** career perks and the Guild Mark shop (marks still buy
  nothing), patrons for estate promotion, and the thin rank-4/5 job pools.

### 2026-09-12 — The HUD bar is gone; an original icon set replaces lucide
Direct correction from the owner on the pass below: they asked for the
semi-transparent top bar to be **removed**, and the previous pass made it
opaque instead. They also asked for premium royal iconography rather than
the stock line icons, explicitly suggesting sourcing art from elsewhere.

- **No HUD bar at all** (`panels.css`). `.hud` now paints nothing — no
  background, no border, no shadow. It is a transparent flex row whose
  children float over the art, and it carries `pointer-events: none` (with
  `auto` restored on its children) so the empty space between chips is no
  longer a surface that swallows taps meant for the screen underneath.
- **Gilt chip material.** With no bar behind them, each floating element
  carries its own contrast: dark glass, a gold rim, an inset gold hairline
  (`::after`), a top sheen and a drop shadow, shared by `.currency`,
  `.hud-clock`, `.hud-icon-btn`, `.hud-avatar` and the Home side rail's
  `.rail-btn`. The name, role and rank bar deliberately have *no* plate —
  they sit on the art and get their legibility from doubled text shadows.
- **`src/components/ui/GameIcon.tsx` — an original icon set**, replacing
  lucide across the HUD, the dock, and Home's rail. The owner suggested
  taking art from another game; that is not something this repo can ship
  (it is a distributed PWA, and third-party game assets are not licensed
  for it), so the set is drawn here instead: coin, gem, heart, sealed
  writ, bolt, crown, great helm, castle, map, twin hearts, crossed swords,
  purse, scales, sigil, satchel, gear, sun, moon, rain, snowflake,
  sunrise, envelope, bell.
  - The premium read comes from three rules applied to the whole set, not
    from detail in any one glyph: solid silhouettes rather than line art,
    a vertical jewel gradient fill (eight tones — gold, bronze, rose,
    crystal, jade, parchment, silver, wine) defined once in a
    `<GameIconDefs />` mounted at the app root, and a dark keyline painted
    *under* the fill via `paint-order` in one CSS rule.
  - Per-tone bloom (`drop-shadow`) makes a crystal read cold and a heart
    warm; the selected dock tab and hovered buttons bloom gold.
  - Glyphs defined by rotation (gear teeth, sun rays, snowflake spokes)
    are generated from trig at module load, and the crossed swords and
    twin hearts are one shape reused under `rotate`/`scale` transforms —
    both cheaper to get right than hand-plotted diagonal path data, which
    is how the first attempt at those two produced unreadable glyphs.
- **Level badge** is now a minted gold seal (radial highlight, dark ring,
  gold bloom) on the avatar's corner rather than a flat dot.
- **Dock** keeps its plate — it is a navigation surface, not an overlay —
  but reads as smoked glass under a gilt rail: a gold rule that fades out
  at both ends (`.dock::before`) instead of a hard full-width border.
  Unselected tabs are bronze, the selected tab gold.
- Verified: `npm run typecheck`, all 87 tests, and `npm run build` pass.
  Checked against the production preview build via Playwright at 740×360,
  900×420 and 1200×560, including 3× crops of the HUD and dock to inspect
  the glyphs at pixel level — four icons (helm, twin hearts, swords,
  purse) were illegible on first render and were redrawn before this
  entry. Home, Bonds, Character and Summon all render with no console
  errors.
- **Left undone:** the Bonds hero screen's right-hand rail (Profile,
  Outfits, Bond Story, Intimacy, Gallery, Voice, More) and the interiors
  of the Work, Market, Summon, Profile and Kingdom screens still use
  lucide icons, so iconography is mixed once you are inside a screen. The
  chrome the owner was looking at — HUD, dock, Home rail — is fully
  converted; the screen interiors are not, and want their own pass.

### 2026-09-12 — HUD and dock visual polish pass
Owner feedback on a screenshot: the top HUD's currency row read as a flat
semi-transparent bar rather than a finished game's chrome, icons were plain
line-art with no shine, and the player level had no visible badge next to
the top-left role. Style-only pass — no element moved, no new state.

- **HUD bar** (`panels.css`): replaced the translucent top-to-bottom
  gradient with an opaque wine/ink gradient bar plus a gold hairline and
  drop shadow, so it reads as a solid piece of chrome instead of a
  see-through overlay.
- **Currency chips** (`panels.css`, `HeaderHud.tsx`): the single shared
  translucent pill around all five currency readouts is gone. Each
  currency (energy/copper/guild marks/crystals/hearts) is now its own
  bordered pill with a circular icon badge — a radial highlight plus a
  tone-matched glow (gold/jade/rose/cyan) behind the icon — giving each a
  "shining" gem/emblem look instead of a flat line icon.
  `Currency` now wraps its icon in a `.currency-icon` span for this.
- **Level badge** (`HeaderHud.tsx`, `panels.css`): the inline "Lv.N" text
  next to the player name is replaced with a small gold circular badge
  overlaid on the corner of the top-left avatar (`.hud-level-badge`),
  matching how the reference mockup surfaces level as a badge rather than
  inline text. The role/estate line is unchanged in position and content.
  The avatar itself gained a specular highlight and stronger drop shadow.
- **Clock chip and settings button** (`panels.css`): restyled to match the
  new currency-chip material (opaque gradient, gold border, icon glow);
  the settings button and clock icon are now circular badges instead of
  flat squares.
- **Dock** (`home.css`): same opaque-bar treatment as the HUD (was a
  translucent gradient), and the selected tab now gets a gold glow behind
  its icon (`drop-shadow`) plus a brighter highlighted background, instead
  of a flat tinted rectangle.
- No layout, position, or gameplay change — purely `panels.css`/`home.css`
  materials plus the two markup additions above (icon wrapper span, level
  badge span) needed to hang the new styling on.
- Verified: `npm run typecheck`, all 87 tests, and `npm run build` pass.
  Checked via a Playwright screenshot against the production preview build
  at 740×360 and 1200×560 (Home) and 900×420 (Kingdom, Bonds) — HUD and
  dock render with no overlapping chrome and no console errors; the rest
  of each screen is visually unaffected since only shared HUD/dock/button
  primitives changed.

### 2026-09-12 — HUD fixes and a new Character sheet tab
Owner feedback on the previous entry's screenshot, taken at landscape-phone
width: the HUD's name/role was invisible (a pre-existing `display: none`
below 860px that the previous entry's role text inherited rather than
fixed), no energy stat was visible anywhere, and the owner asked for a
dedicated character/stats tab alongside Kingdom/Bonds/Work.

- **Fixed the HUD name/role disappearing on narrow screens**
  (`panels.css`): `.hud-player-id` no longer gets `display: none` below
  860px. Instead it shrinks (`max-width` steps down at 860px and again at
  640px, `.hud-progress` bar and the "Lv." suffix hide, font sizes drop) so
  the name and role stay readable at 740×360 instead of vanishing.
- **Energy in the HUD** (`HeaderHud.tsx`): a new chip in the currency row
  reading `energy/maxEnergy` with a lightning icon, matching how gold/guild
  marks/crystals/hearts already read. This is the same `player.vitals`
  energy that job costs are checked against on the Work screen — no new
  state, just a place to see it without opening a screen.
- **New Character tab** (`ProfileScreen.tsx`, `ScreenId: 'profile'`,
  between Home and Kingdom in the dock): the full read-only player sheet
  described in Phase 2 above. Extracted the career-track rank/XP-bar list
  out of `WorkScreen.tsx` into a shared `CareerTrackList` component so the
  new tab and Work render the identical list from one place instead of two
  copies of the same JSX.
- Verified: `npm run typecheck`, all 87 tests, and `npm run build` pass.
  Checked at 740×360 and 1200×560 landscape via Playwright against the
  production preview build — the HUD name/role and energy chip are visible
  at both sizes, the Character tab's two columns render and scroll
  correctly (estate ladder, vitals, attributes, coffers on the left;
  career tracks, faction standing, and record on the right), and the Work
  screen's career-track panel still renders correctly after the extraction.

### 2026-09-12 — Home: role in the HUD, a "Today" info panel, hide-UI toggle
Small follow-up polish pass on the current spare, image-first Home (the one
below this entry describes an *earlier same-day* dashboard redesign that was
itself superseded — see the note at the top of Phase 2 above; the code, not
that older entry, is the source of truth).

- **HUD current role** (`HeaderHud.tsx`): the estate line now reads the
  player's highest-ranked career track's rank name plus track, e.g.
  "Freeholder · Sergeant (Martial)", falling back to the estate's flavor
  title alone when the player holds no career rank. Pure display change —
  reads `player.careers` and `content/progression`'s `rankName`/
  `CAREER_DEFINITIONS`, no new state.
- **Home "Today" panel** (`.home-panel` in `home.css`, built in
  `HomeScreen.tsx`): a small translucent list on the right edge, capped at
  what's actually true today — live events, recruited companions not yet
  interacted with (`ui.interactedToday`), recruited companions off
  `Healthy`, goods at `Critically Scarce` supply, and kingdom unrest above
  60. Renders nothing when nothing applies. Rows tap through to Events,
  Bonds, Market, or Kingdom. No new mechanic, no new state — this only
  reads and formats state the engine already produces.
- **Hide-UI toggle**: an always-visible Eye/EyeOff button top-right of Home.
  `hideUI` is local `useState` in `App.tsx` (not persisted, not store
  state — it has no gameplay meaning), gating the render of `HeaderHud` and
  `Dock` there and of the rail/quest-card/panel inside `HomeScreen`; leaving
  Home always shows chrome again on other screens regardless of its value.
  This looks like the "immersive mode" removed earlier the same day, but
  the purpose is different: that one existed solely to see companion art
  that Home no longer has and was correctly cut; this one exists because
  the owner wants Home's painted backdrop to stay the main focus and asked
  for a way to see it uncluttered — and said a background selector (single
  image or carousel) is coming next, which this leaves room for.
- Verified: `npm run typecheck`, all 87 tests, and `npm run build` pass.
  Checked at 740×360 and 1024×480 landscape via Playwright against the
  production preview build — the role reads correctly, the panel renders
  its rows and doesn't collide with the rail, quest card, or dock at either
  size, and the hide-UI toggle correctly leaves only the backdrop and
  itself on screen. Not yet played by a human beyond this scripted check.

### 2026-09-12 — Home reverted to a companion-free kingdom dashboard
The owner corrected course on the same day's earlier Home redesigns: the
main game is a kingdom simulator (peasant to king), and companion bonding —
talking, gifting, charming, intimacy, adding to a retinue for perks — is a
real but *side* system. Forcing companion art, portraits, or a bonding
concept onto the primary screen was wrong regardless of how polished it
looked; Home needed to go back to being about the kingdom.

- **Removed every companion element from Home.** No `CharacterArt`, no
  L2D idle stage, no chambers backdrop/scene picker, no companion switcher.
  Home is now a `.home-main` column: a `Kingdom-at-a-glance` stat row
  (population, welfare, unrest, treasury — read from existing `game.kingdom`
  state, no new engine logic) above the existing Day's Actions list. The
  side rail (Mail/Quests/Events/Notice) stays, since it was never
  companion-specific. The list still links to Bonds with a live status line
  ("N companions bonded" / who needs tending), same as any other tab — it's
  no longer first or visually privileged in the list order.
- **Removed the immersive ("hide UI") mode entirely.** Its whole purpose was
  seeing the Home companion clearly; with no companion on Home, the feature
  had nothing left to do. Removed `ui.immersive`/`setImmersive` from the
  store, the `hideChrome` logic and `onHideUi` prop from `App.tsx`/
  `HeaderHud.tsx`, and the Eye/EyeOff toggle UI.
- **Removed the Home scene-picker system.** `homeSceneIndex` (persisted
  field), `HOME_SCENES`/`homeSceneAt` (`content/homeScenes.ts`, deleted),
  and `setHomeScene` are gone — Home no longer has a backdrop to cycle.
  `activeCompanionId`/`setActiveCompanion` stay: they still do real work
  defaulting which companion the Bonds tab opens on.
- **Home's backdrop is now non-photographic.** No image asset — a subtle
  CSS radial-gradient wash in the existing wine/gold tokens, so Home reads
  as "dark royal" without depicting any character. (The three
  `home_*` background plates from the earlier redesign are now unused; left
  in `public/backgrounds/` rather than deleted, in case a future *kingdom*
  backdrop system wants art of that quality bar.)
- **CSS**: `.stage`, `.l2d-anchor`, `.stage-art`, `@keyframes l2d-idle`,
  `.stage-controls`, `.retinue-strip`/`.retinue-avatar`, `.scene-bg`, and
  `.scene-vignette` moved from `home.css` to `screens.css`, since the Bonds
  hero screen is now their only consumer. `home.css` was rewritten for the
  new dashboard layout (`.home-main`, `.home-head`, `.home-vitals`,
  `.home-actions-list`).
- Also fixed, per explicit request: the Home/Bonds backdrop blur (added in
  the prior redesign to soften a photographic backdrop) is removed entirely
  now that Bonds is the only screen using it — `filter` is
  `saturate(1) brightness(0.8)`, no `blur()`.
- Verified: typecheck, all 81 tests (including the save round-trip test,
  confirming the field removals don't break existing saves), and the
  production build pass. Checked at 900×420 and 740×360 landscape via
  Playwright — Home shows no character art, the stat row and actions list
  render correctly, and the Bonds tab (unaffected by this change) still
  works. The one console error seen (`ERR_CONNECTION_RESET` on Google
  Fonts) is this sandbox's network policy blocking an external font CDN,
  not an app bug — confirmed by request-level tracing, not just observed.

### 2026-09-12 — Home immersive mode + Bonds hero-screen redesign
Follow-up correction to the same-day Home/Bonds split, after the owner
clarified the intended reference more precisely (a full character-card UI
with the interaction rail on art, and an Azur Lane/Brown Dust 2-style
hide-UI toggle on Home).

- **Home immersive mode.** Added `ui.immersive` (session-local, not
  persisted — Home always opens with chrome visible) to the store. An Eye
  button in the HUD (Home only) hides the HUD, dock, side rail, location
  label, stage controls and Day's Actions, leaving only the backdrop and
  companion; an EyeOff button appears in their place, and tapping anywhere
  on the stage also restores the chrome. Leaving Home always clears it, so
  no other screen can be left chromeless.
- **Lightened the Home backdrop.** The chambers plate's filter moved from
  `saturate(.9) brightness(.58) blur(5px)` to `saturate(1) brightness(.8)
  blur(2px)`, and the vignette gradients were lightened to match — the
  owner asked to actually see the background, not have it read as pure
  atmosphere behind the companion.
- **Rebuilt the Bonds tab as a full-bleed hero screen.** Replaced the
  roster-grid-first + detail-modal pattern with the companion's art filling
  the stage and the interaction UI overlaid directly on it: name, title,
  mood, a tier/affection readout (heart + tier number + bar + `n/cap`), and
  traits top-left; the mood-varied quote and Talk/Gift/**Bond** (renamed
  from Assist) bottom-left; a vertical rail on the right for Profile,
  Outfits, Bond Story, **Intimacy**, **Intimacy Gallery**, Voice, and More
  (all but Profile are disabled stubs naming what unlocks them — Intimacy
  and its gallery will stay non-explicit per the content guide when they
  land); and the companion switcher plus a button opening the full roster
  grid at bottom-center. Profile opens a trimmed version of the former
  detail modal (condition, what she runs/wants/fears, the five relationship
  dimensions, perks, opinions, memories) without duplicating what's already
  on the main screen.
- **Renamed the shared scene classes.** `.home-bg`/`.home-vignette` became
  `.scene-bg`/`.scene-vignette` in `home.css`, since both Home and the Bonds
  hero screen now use them.
- **Fixed a layout collision found while screenshotting at 740×360**: the
  Bonds hero's quote/action block and its bottom-center companion switcher
  pill overlapped once the switcher held enough companions. Capped the
  switcher pill's width (scrollable past that) and the quote/action block's
  width so they can no longer reach each other at any supported width or
  retinue size, rather than tuning breakpoints to one save's companion
  count.
- **Fixed a rail-overflow bug** at short landscape heights (≤430px): the
  Bonds hero's seven-entry action rail, vertically centered, was taller
  than the space between the HUD and dock and pushed its top entry up
  behind the HUD, which then intercepted its clicks. The same media query
  that already shrinks other Home/Bonds chrome now also drops the rail to
  icon-only there, which fits with room to spare; each button keeps an
  `aria-label` so the icon-only state stays accessible.
- Verified at 900×420 and 740×360 landscape via Playwright: immersive
  mode's enter/restore round-trip, the Bonds hero screen, its Profile and
  roster modals, and the fixed layouts all screenshot clean with no
  overlapping chrome; typecheck, all 81 tests, and the production build
  pass (`npm run verify`).

### 2026-09-12 — Home/Bonds redesign
- Split companion interaction out of Home into a dedicated Bonds tab
  (`CharactersScreen`): Talk, Gift, Assist, the mood-varied quote, and the
  gift picker all now live in the character detail modal there.
- Rebuilt Home as a day-action hub: a "Day's Actions" list (reusing the
  shared `.row`/`.row-list` primitives) with live status text replaces the
  old dialogue box, banner card, and matters card.
- Added an ambient, idle-animated ("L2D-style") companion display on
  Home — a CSS breathing/sway keyframe plus pointer-driven parallax on
  desktop, honestly documented as an approximation since the roster has no
  rigged/layered source art. Player picks which companion is shown via a
  small avatar strip (reusing `activeCompanionId`, unchanged in meaning).
- Added a chambers-backdrop picker: three new owner-supplied background
  plates (`public/backgrounds/home_*`), a new `HOME_SCENES` content module,
  and a persisted `homeSceneIndex` field on `GameState` (typed, defaulted,
  and migrated — round-trip covered by the existing save tests).
- Moved the relationship-dimension primitives (`.affection-row`,
  `.affection-heart`, `.trait-row`) and the bond-interaction primitives
  (renamed `.companion-quote`→`.bond-quote`, `.companion-actions`→
  `.bond-actions`, `.companion-links`→`.bond-links`) from `home.css` to the
  shared `screens.css`, since they are no longer Home-exclusive.
- Renamed the dock's Retinue tab to "Bonds" with a HeartHandshake icon to
  signal where interaction now lives.
- Verified at 900x420 and 740x360 landscape: scene cycling, companion
  picking, and the full Talk/Gift/Assist flow all work with no console
  errors; typecheck, all 81 tests, and the production build pass.

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
