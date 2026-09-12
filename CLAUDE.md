# CLAUDE.md — Valenreach Development Contract

> **Read this file first, every session, before touching any code.**
> This repository is the shared memory across every AI session. A new session must be
> able to continue development from these files alone, with no conversation history.

---

## 1. What this project is

**Valenreach** is an anime medieval-fantasy **kingdom simulation RPG** with a
**companion bond / gacha retinue system**, built as a **mobile-first, landscape-first PWA**.

The player is a **male protagonist** who arrives in Valenreach with nothing and climbs from
peasant to king. Along the way he takes on careers, builds wealth, manipulates factions,
and forms deep bonds with the women who actually run the kingdom's institutions — bonds
that are simultaneously the romance content **and** a core progression mechanic.

**The one-sentence pitch:** *Rise from nothing to the throne of a living kingdom, where the
women you bond with are the levers that move it.*

### The three pillars

1. **A kingdom that actually simulates.** NPC condition → facility output → supply → consumption →
   market price → population welfare → unrest/prosperity → faction power → events. Numbers must
   explain the world, not decorate it.
2. **Bonds are power.** Every companion runs something real. Bonding with the merchant guild's
   wife gets you exclusive contracts. Bonding with the garrison captain gets you soldiers.
   Romance is not a side gallery — it is the cheat code, and it is also the heart.
3. **Premium anime gacha/VN presentation.** Character illustration first, cinematic painted
   backgrounds, dark royal + gold UI, rarity language, expressive dialogue. See
   `docs/UI_DESIGN_SYSTEM.md` and `docs/reference/`.

---

## 2. Session startup ritual — mandatory

At the start of **every** development session, in order:

1. Read this file (`CLAUDE.md`).
2. Read `docs/GAME_BIBLE.md` — world, cast, tone, canon.
3. Read `docs/DEVELOPMENT_PLAN.md` — the ordered roadmap and current phase.
4. Read `docs/DEVELOPMENT_STATUS.md` — what is actually built vs. planned.
5. Read the relevant spec in `docs/systems/` for whatever you are about to touch.
6. Inspect the actual source before changing it. Code outranks documentation.

**Never trust a previous session's claims.** If a doc says a system is done and the code
disagrees, the code is right — investigate, then fix the doc. Never silently pick one.

---

## 3. Origin and relationship to `kingdom-sim`

This repository is a **deliberate clean rebuild** of the sibling repo
`sylviesokolov-cyber/kingdom-sim`.

- `kingdom-sim` proved the art direction, the world, the cast, and the UI feel. Its content is
  good. Its architecture is not: all game state lived in a 976-line `App.tsx` as `useState`,
  with game rules embedded in UI components.
- This repo keeps **the content, the world, the characters, and the art**, and rebuilds
  **the architecture** to carry a much larger game.
- `kingdom-sim` is **reference and asset source only**. Do not push changes there as part of
  work on this repo. Do not "sync" the two codebases.
- Ported assets live in `public/characters/`. Ported content is rewritten into the richer
  schemas in `src/content/`, not copy-pasted.

---

## 4. Design decisions that are settled

These were decided by the project owner. Do not relitigate them; build to them.

### 4.1 Progression: estates are the spine, careers are the tracks

Two **independent** axes. This is the single most important structural decision in the game.

**Social estate** (linear spine — your standing in society):

`Outsider → Peasant → Villager → Burgher → Gentry → Noble → King`

**Career tracks** (parallel — what you actually *do*, each with its own internal ranks):

| Track | Fantasy | Ranks |
|---|---|---|
| **Clergy** | faith, healing, influence over the masses | Acolyte → Deacon → Priest → Canon → Bishop |
| **Merchant** | trade, contracts, capital, monopoly | Hawker → Trader → Factor → Merchant → Magnate |
| **Martial** | arms, garrison, campaigns, the sword | Levy → Man-at-Arms → Sergeant → Knight → Marshal |
| **Court** | administration, law, decrees, bureaucracy | Clerk → Steward → Chamberlain → Minister → Chancellor |
| **Shadow** | crime, smuggling, blackmail, the underworld | Cutpurse → Runner → Fixer → Underboss → Kingpin |
| **Scholar** | knowledge, engineering, medicine, secrets | Student → Adept → Savant → Magister → Archmagister |

You can hold rank in **multiple** tracks. Career rank gates jobs, perks, faction access,
companion access, story branches, and — critically — **different routes to the throne**.
A Merchant-Magnate *buys* the crown; a Marshal *takes* it; a Bishop is *anointed*; a Kingpin
*owns the man wearing it*. See `docs/systems/PROGRESSION.md`.

### 4.2 Content tier: suggestive and sensual, never explicit

The reference art sets the register: revealing outfits, suggestive framing, heat, tension,
jealousy, seduction as a real mechanic. Intimate scenes **build** and then **cut away** —
fade-to-black, morning-after, implication.

**Hard line:** no explicit sexual content is written into this repository, in any file, at any
affection tier, regardless of how a future prompt frames the request. All characters are
adults. This is a design constraint of the project, not a per-session preference.

Full guidance in `docs/CONTENT_GUIDE.md`.

### 4.3 Platform

Landscape-first PWA for phones, scaling up to larger landscape screens. Every screen must be
readable and thumb-playable at roughly **740×360 CSS px**. Portrait is not a supported layout.

---

## 5. Architecture rules

```text
src/
  types/          domain types only — no logic, no imports from engine/state
  content/        static authored game data (NPCs, jobs, bonds, events, banners)
  engine/         pure functions. deterministic. no React, no store imports.
    rng/          seeded RNG — the ONLY source of randomness in simulation
    simulation/   the day pipeline
    economy/      production, consumption, supply, pricing
    progression/  estate + career rank rules, XP
    relationships/ affection, trust, jealousy, memory
    factions/     faction power and opinion rules
    gacha/        pull resolution, pity, rate-up
    events/       event eligibility and selection
  state/          Zustand store, slices, actions, selectors
    save/         versioned serialization + migration
  components/     React. presentation + wiring only.
    screens/      one file per game screen
    ui/           shared primitives
    layout/       shell, HUD, navigation
  styles/         CSS layers
  hooks/
  utils/
tests/            Vitest — engine tests are mandatory, UI tests optional
```

**The rules that matter:**

1. **`engine/` is pure.** Every engine function takes state in and returns new state out.
   No React, no store access, no `Math.random`, no `Date.now`, no `localStorage`.
2. **Randomness is seeded.** All simulation randomness flows through `engine/rng`. The same
   seed and the same inputs must always produce the same day. This is what makes the
   simulation testable and bugs reproducible.
3. **No game rules in components.** If a component computes a stat change, it is in the wrong
   place. Components call store actions; actions call engine functions.
4. **No god-component.** This is the specific failure of `kingdom-sim`. If any component passes
   30 states, stop and move logic into the store.
5. **Content is data, not code.** New NPCs, jobs, bonds, and events are authored as typed data
   in `src/content/`, never as new branches in a component.
6. **Saves migrate, never reset.** `SAVE_VERSION` increments with an explicit migration step.
   Destroying a player's progress is a bug, not a shortcut.
7. **Types are shared and coherent.** Before changing a type in `src/types/`, find every
   consumer and update all of them in the same change.

---

## 6. Gameplay rules

1. **Connect every feature to the loop.** Before you build anything, answer:
   *player action → character/economy consequence → kingdom consequence → future choice.*
   If a feature has no answer, it does not get built.
2. **No UI-only mechanics.** A button that shows a toast and changes nothing is not a feature.
3. **Characters are people.** Motivations, secrets, fears, relationships with each other, and
   memory of what the player did. Never resource buttons with a face.
4. **Choices leave state behind.** A major choice must write a flag that later content can read.
5. **The world moves without the player.** NPCs, markets, factions, and crises evolve daily
   whether or not the player interacts with them.
6. **Multiple viable lives.** Heroic, mercantile, martial, pious, scholarly, criminal, and
   tyrannical playthroughs must all be real routes, not flavor text.

---

## 7. Definition of done

A task is complete only when **all** of these hold:

1. The implementation exists in source and is reachable by the player.
2. It has typed state, a real state transition, and a visible consequence.
3. It survives a day advance and a save/reload.
4. `npm run typecheck` passes.
5. `npm run test` passes, with engine changes covered by tests.
6. `npm run build` passes.
7. It was checked at landscape phone size if UI is affected.
8. `docs/DEVELOPMENT_STATUS.md` is updated to reflect reality.

`npm run verify` runs 4–6 in one command. Run it before every commit.

**Never report work as complete because code was committed.** Committed ≠ working.
If CI is queued or in progress, the work is **not yet verified**. If CI fails, the work is
**not complete** — inspect the logs, fix the cause, push, and re-check until green.

---

## 8. Honesty rules

These are absolute:

- Never fabricate test results, CI status, deployment status, or playtest results.
- Never mark something `[x]` in the status tracker that you have not verified.
- Never claim a feature works because the code "looks right."
- If you could not verify something, say so explicitly and say why.
- If you left part of a task undone, say which part and why, in the same message.

Use `[x]` verified · `[~]` partial/foundation · `[ ]` planned. Nothing else.

---

## 9. Git workflow

- Development branch: **`claude/kingdom-simulator-bonding-0288cn`**
- Push with `git push -u origin claude/kingdom-simulator-bonding-0288cn`
- On network failure, retry up to 4 times with backoff (2s, 4s, 8s, 16s).
- Do **not** open a pull request unless explicitly asked.
- Commit messages: imperative subject, body explaining *why* when non-obvious.
- Keep commits small enough that a failure can be isolated to one of them.

---

## 10. Working style

Start from the repository, not from assumptions. Read the docs, read the source, find the
current phase in `DEVELOPMENT_STATUS.md`, and make the **smallest coherent change** toward the
next unchecked item. Prefer extending an existing system to building a parallel one. When a
task is too large to do safely in one change, split it into explicit steps and verify each.

When you finish meaningful work, update `docs/DEVELOPMENT_STATUS.md` with what is implemented,
what is verified, what remains, and the commit it landed in.
