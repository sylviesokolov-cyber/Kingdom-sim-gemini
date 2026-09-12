# Development Status

> Living tracker. Update after every meaningful change.
> `[x]` verified · `[~]` partial/foundation · `[ ]` planned. **Nothing else.**
> Never mark `[x]` without having actually run the check.

**Current phase:** Phase 3 — Simulation core (partial). Phases 0–2 complete.
**Last updated:** 2026-09-12 (Home reverted to a companion-free kingdom dashboard)

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

- [x] Home screen: a companion-free kingdom dashboard — a kingdom-vitals
      strip (population, welfare, unrest, treasury) and a Day's Actions list
      driving to every other tab. The owner clarified that the main game is
      the kingdom simulator and bonding is a side system; Home carries no
      character art, portraits, or scene-picking as a result (see the
      2026-09-12 "Home reverted" change-log entry — this superseded the
      immersive-mode/companion-display version built earlier the same day).
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

### Verified by playthrough
A player can, from a fresh save: read the kingdom's vitals and Day's
Actions on Home, open the Bonds tab and read a companion's mood-varied
line, talk to raise affection, gift from the pack (favourites correctly
surfaced first), work a job, see the goods land in the pack, trade them on
the Bourse, run a ten-pull and get Resonance from a duplicate, advance the
day, and read a digest explaining why prices moved. State survives reload.

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
