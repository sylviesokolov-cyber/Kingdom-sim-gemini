# Valenreach — Design Analysis and Forward Plan

> Written 2026-09-12, against the code as it actually stands at `7a159e4`.
> Where this document and a system spec disagree, the spec is the target and
> this is the assessment of how far off it we are. Where this document and the
> **code** disagree, the code is right and this is wrong — check before trusting.

---

## 0. The short version

Valenreach has an unusually strong simulation spine and an unusually weak
**reason to play it**. The economy, the day pipeline, the relationship
dimensions and the gacha all work and are tested. What is missing is the layer
that turns those systems into a life: reachable progression (fixed this
session), events that interrupt the player, a story that remembers, and NPCs
who want things on their own.

The single largest risk is not technical. It is that Valenreach becomes a
**very good number model with nothing to decide** — the exact failure the
kingdom-management genre is known for, where a reviewer of *Yes, Your Grace*
put it as: meter-managing is an insufficient long-term mechanic, and if
resources aren't the whole point, they become something you do "not because
it's fun, but because it isn't."

Everything in this plan is pointed at that risk.

---

## 1. Market analysis

### 1.1 Where Valenreach actually sits

Valenreach is not competing in one genre; it sits at the intersection of four,
and its pitch is only defensible if it takes the best mechanic from each.

| Genre | Comparables | What they do well | What Valenreach takes |
|---|---|---|---|
| **Kingdom management** | *Yes, Your Grace*, *Reigns*, *King of Dragon Pass* | Decisions under scarcity, with named people attached | The simulation, but **not** the petition-meter loop |
| **Stat-raising life sim** | *Princess Maker*, *Long Live the Queen*, *The Guild – Europa 1410* | Days are the scarce resource; the build *is* the story | The estate/career/attribute spine |
| **Character gacha** | *Blue Archive*, *Nikke*, *Arknights*, *Path to Nowhere* | Character-first presentation, long-tail retention | Presentation, rarity language, banner cadence |
| **Relationship RPG** | *Persona 5*, *Fire Emblem*, *Stardew Valley* | Relationships that pay out in mechanics | Bonds as progression — the core differentiator |

### 1.2 The five lessons that matter

**1 — Persona's Confidants are the model to beat, and the bar is "the perk
changes how you play."** What makes Persona's system work is not the romance;
it's that each rank unlocks *a mechanic appropriate to that person* — the
fortune teller accelerates other relationships, the politician improves
negotiation, the strategist unlocks an ambush. The relationship is a
**verb unlock**, not a stat buff.

Valenreach's `BOND_PERKS` are currently mostly multipliers (`production_multiplier`,
`market_buy_multiplier`). Multipliers are the weak version. The strong version
is Caren's `granary_truth` and Mira's `sabotage_warning` — perks that give the
player **information or an option they did not previously have**. The perk
table should tilt hard toward `unlock`.

**2 — *King of Dragon Pass* proves events beat menus.** Its clan-ring advisors
give conditional, context-aware advice, and events are three-to-five option
dilemmas tied to the actual state of the clan. The advisors disagree with each
other *in character*. That is the single highest-leverage thing Valenreach does
not yet have: `EventDefinition` is typed, and there is **not one authored
narrative event in the repository**. The world simulates and never once
interrupts the player to ask a question.

**3 — Meter-management alone does not sustain.** The *Reigns*/*Yes, Your Grace*
critique is that a resource bar you maintain because you must is a chore.
Valenreach's insulation is that its numbers must always be **attached to a
person or a decision**: welfare falls because Caren is sick, not because a bar
ticked. The day digest already does this well. The council/petition screen,
when built, must not become a bar-balancing minigame.

**4 — Gacha hybrids retain on the non-gacha half.** *Arknights* pairs pulls with
base management; *Endfield* targets an explicit ~50:50 split between RPG and
factory building. The pattern: the gacha acquires, the sim retains. Valenreach
is well positioned here because the retinue **does work in the simulation** —
but only if a pulled companion visibly changes a number. Right now a duplicate
raises Resonance and an affection cap; that is gacha-internal. Pulls should
move the *kingdom*.

**5 — The competitive window is real.** *The Guild – Europa 1410* (THQ Nordic,
Early Access July 2026) is doing medieval life-and-economy simulation with a
rise-from-nothing hook on PC. Valenreach's defensible ground is not
simulation depth — it will not out-simulate a dedicated economy sim. It is
**landscape phone, character-first presentation, and bonds as the progression
mechanic**. Lean into the differentiator; do not chase economic fidelity.

### 1.3 What that means concretely

- Stop adding simulation depth for its own sake. The economy is already deeper
  than the content that reads it.
- Every new system must produce a **decision with a named person attached**.
- Bond perks should unlock verbs, not multiply numbers.
- Narrative events are the highest-value unbuilt system in the repository.

---

## 2. Progression: what is built, what was broken, what is needed

### 2.1 What was actually built before this session

| Piece | State | Notes |
|---|---|---|
| Estate ladder (7 tiers) | Built, tested | Data + `canPromoteEstate`/`promoteEstate` |
| Career tracks (6 × 5 ranks) | Data only | Definitions, XP thresholds, faction floors |
| Antagonism caps | Built, tested | `effectiveCareerCap`, Clergy↔Shadow, Court↔Shadow |
| Diminishing standing | Built, tested | `standingGain` |
| Level and XP curve | Built, tested | `applyXp` |
| Prerequisite evaluator | Built, tested, good | Returns *reasons*, not booleans — the best piece of the codebase |
| Rank trials | **Absent** | Referenced by id; no content, no engine, no UI |
| `advanceCareer` | Built, uncalled | No store action, no button, anywhere |
| Attributes | Inert | Only rose via level-up, uniformly. Job attribute rewards were `{ cunning: 0 }` |
| Patron for estate promotion | Absent | Spec §2 requires one; `promoteEstate(player)` takes none |
| Throne routes | Absent | Listed in the spec, no code at all |

### 2.2 The blocker

Every career rank required a trial (`trial_<track>_<n>`) that nothing could
complete. Confirmed by probe before any change: with infinite copper, maxed XP
and every faction at 100, `canAdvanceCareer` still returned
*"The rank trial has not been completed."*

The cascade:

```
no trial  →  career locked at rank 0
          →  Villager estate blocked (needs rank 2)
          →  every estate above Peasant unreachable
          →  Acts 2+ ungateable, throne routes unreachable
          →  guild marks accumulate with no career shop to spend them in
```

The game's self-described "most important structural decision" was the one
thing that could not run.

### 2.3 What landed this session

- **`engine/effects` — `applyEffect`.** `Effect` was declared the single
  vocabulary for changing state; nothing applied it generically, so every
  consumer hand-rolled a partial version. This is now the one place it becomes
  state, shared by jobs, trials, and (next) events, quests and episodes.
- **30 authored rank trials.** Gated on attributes, estate, flags and — from
  rank 3 up — a named woman's trust. Copper is a fee, never a qualification.
- **The two ladders now climb each other.** Rank 2 wants Peasant, 3 wants
  Villager, 4 wants Burgher, 5 wants Gentry; those estates want ranks 2–5 in
  turn. Neither ladder moves alone.
- **Attributes are real** and decay with repetition on the same job, on the
  shared `repetitionFactor` curve, so a varied life out-trains a ground one.
- **Throne routes** as `Prerequisite` data with per-route progress and reasons,
  shown on the Character sheet. A Hawker on day 12 can see what a Magnate is for.
- **Two dead ends closed:** rank-1 faction floors dropped 10 → 0 (Court was
  unreachable — its rank-1 trial wanted Crown opinion 10 and nothing a rank-0
  player could do moved Crown opinion), and entry track work now moves its
  faction so the rank-2 floor of 25 is earnable from inside the game.

Verified by 150-day simulated playthroughs on all six tracks: every track now
reaches rank 2–4 and Villager/Burgher, where before all six sat at rank 0 and
Peasant forever.

### 2.4 What progression still needs, in priority order

1. **Standing is now the real bottleneck, and it has one source.** Jobs, with
   diminishing returns by design. A merchant run reached Burgher on day 141
   mostly waiting on standing. Standing must come from **deeds, quests, events
   and public acts** — which means the event and story engines are also the
   progression fix. This is the top priority and it is not a progression task.
2. **Patrons.** Spec §2: promotion requires an NPC who vouches for you, and
   which patron you use colors the estate and is remembered. Currently absent.
   This is the cheapest remaining way to make bonds matter structurally.
3. **The high-rank job pool is thin.** Ranks 4–5 need 1,600 and 3,400 track XP
   against two or three authored jobs per track. Either more jobs, or ranks 4–5
   draw XP primarily from quests and trials rather than shifts.
4. **Career perks and the Guild Mark shop.** Marks accrue with nothing to buy.
   A Factor should buy at −10%; a Sergeant should take less injury. Perks exist
   as a type and a bond table; careers grant none.
5. **Estate grants are flavor text.** Each tier promises real rights — market
   stall, hired workers, city vote, decrees, levy. Only `maxEnergyBonus` is
   wired. Every grant should unlock a verb.

---

## 3. NPC logic — from reactive to alive

### 3.1 Where it stands

The type layer here is genuinely excellent and ahead of the engine. `NpcState`
already carries five relationship dimensions plus jealousy and resonance,
append-only `NpcMemory` with typed kinds and weights, a condition track with
illness and treatment, and an authored `NpcInterior` (want / fear / secret /
wound) for all fifteen characters. Mood is derived, never stored.

What the engine does with it: affection and trust move on talk/gift/work,
jealousy propagates through authored `opinions`, condition degrades and recovers
daily, and ignored companions drift. That is a solid reactive layer.

**What is missing is agency.** No NPC currently wants anything. `interior.want`
is authored for all fifteen and read by nothing.

### 3.2 The three additions that make them people

**1 — Wants become daily behaviour.** Give each NPC a small goal state machine
that advances without the player: Caren is trying to get the granary audited,
Mira is trying to get the upper sluices inspected, Elena is trying to fund the
fever ward. Each want has a progress value that moves on its own, faster if the
player helps, and **completes or fails** whether or not he was involved. A want
that completes changes her mood, her facility output, and what she talks about.
A want that fails becomes a memory with weight.

This is the difference between a companion and a resource button, and it is
mostly cheap: a `want` progress field, a daily pipeline stage, and authored
completion effects.

**2 — Memory has to read back.** Memories are recorded and weighted and then
consulted only for mood. They should gate dialogue selection, modify gift
acceptance, and be quotable: *"You were there when the ward flooded."* The
cheapest high-impact version is a memory-weighted dialogue selector — the same
`DialogueSet` mechanism, keyed on the strongest recent memory rather than only
on mood.

**3 — The social graph should move on its own.** `NpcOpinion` is authored and
static; jealousy already propagates. NPCs should also form opinions *from
events*: if the player takes Claire's side in a confrontation with Vesper,
Vesper's opinion of Claire should change, not just her opinion of the player.
Two NPCs having a relationship the player is not in the middle of is what makes
a cast feel like a world.

### 3.3 The faction-opinion bug worth naming

`driftFactions` moves a faction's **opinion of the player** based on kingdom
state — the Guilds like you more because prosperity is high, the Church likes
you less because piety fell. That conflates "faction mood" with "what they
think of you," and it means the player's reputation drifts for reasons he had
nothing to do with. `FactionState` should separate the two: `mood` (drifts with
the world) and `opinion` (moves only through the player's acts). This is a
small change with a large honesty payoff, and it should happen before Phase 8
authors content on top of the current conflation.

---

## 4. Events, interaction depth, and the story connection

### 4.1 The gap

`EventDefinition`, `EventChoice`, `Prerequisite` and `Effect` are all typed.
`GameState` carries `firedEvents` and `scheduled`. `applyEffect` now exists to
resolve consequences, and `evaluatePrerequisite` exists to gate them.

**There are zero authored narrative events and no event engine.** The
`src/content/events/` directory holds only `LiveEventDefinition` — banner
advertising for existing screens, explicitly not the narrative unit.

Everything needed to build the event engine now exists. This is the single
highest-value unbuilt system in the repository, and it is small: eligibility
filter, weighted seeded selection, a modal, and `applyEffect` on the chosen
branch.

### 4.2 The design that makes events matter

Four rules, all borrowed from *King of Dragon Pass* and all cheap:

1. **Events read state and name it.** Not "a merchant arrives" but "Rin has not
   been paid for the dye contract, and she is standing in your doorway." The
   eligibility prerequisite is also the premise.
2. **Companions disagree in character.** An event with a choice should show what
   two companions think about it, drawn from their `interior` and their opinions
   of each other. This is what turns a menu into a scene.
3. **Every choice writes a flag.** Already the settled rule (CLAUDE.md §6.4).
   The flag namespace is authored in STORY.md and unused.
4. **The best consequences are late.** `Effect.scheduled` is implemented and
   applied; nothing schedules anything yet. Act 5's payoffs should mostly be
   Act 3's decisions coming due.

### 4.3 How the systems connect — the loop that has to close

```
  work / bond / trade
         ↓
  attributes · track XP · a companion's trust        ← progression (now real)
         ↓
  rank trials → career rank → estate                 ← the two ladders
         ↓
  faction standing · flags · perks
         ↓
  which EVENTS are eligible, which QUESTS unlock     ← the missing link
         ↓
  choices → flags → scheduled consequences
         ↓
  kingdom state moves → NPC conditions change
         ↓
  back to work, with different options
```

Every arrow in that diagram exists in code **except the two marked as the
missing link**. Build those and the game closes its loop for the first time.

### 4.4 Story

The central mystery is well designed and fully specified in STORY.md — the Red
Drought as sabotage, Ashgrave's land purchases, the protagonist's own erased
history. It is also entirely unimplemented: no `types/story.ts`, no
`content/story/`, no `engine/story/`.

Two things are worth saying about it now:

- **The mystery already has hooks in the code.** Three of the trials authored
  this session deliberately set mystery flags — `drought.numbers_do_not_add_up`
  (Scholar 3), `mystery.sluice_order_exists` (Scholar 4), and
  `mystery.drought_published` (Scholar 5). The Scholar track is, structurally,
  the investigation route. That should be deliberate and extended: each track
  should reach the mystery from its own angle — the Shadow track through
  Vesper's dossiers, the Court track through the archive, the Clergy track
  through what the Church was paid to ignore.
- **Quests are the standing fix.** Since standing is the progression bottleneck
  and quests are its natural source, the story engine is not a Phase 10 luxury.
  It is load-bearing for Phase 4.

---

## 5. Revised phase ordering

The existing plan runs Simulation → Player life → Careers → Characters → Bonds
→ Factions → Politics → Story. That ordering puts the story engine at Phase 10,
behind five phases of systems, which is backwards: the story engine is what
makes the systems produce decisions, and it is the source of the standing that
progression is currently starved of.

**Proposed reordering from here:**

| Order | Phase | Why here |
|---|---|---|
| 1 | **Event engine + first 20 events** | Everything it needs now exists. Highest value per line in the repo. The world starts asking questions. |
| 2 | **Patrons + estate grants** | Cheap, makes bonds structural, and turns estate tiers from titles into verbs. |
| 3 | **Story engine + Act 1–2** | Unblocks standing, gives trials somewhere to point, makes flags mean something. |
| 4 | **NPC wants + memory read-back** | Turns the cast from reactive to alive. Mostly engine work on types that already exist. |
| 5 | **Career perks + Guild Mark shop** | Closes the loop on the rank system just built; marks currently buy nothing. |
| 6 | **Faction mood/opinion split, then Phase 8 proper** | Fix the conflation before authoring content on top of it. |
| 7 | Player life (Phase 4 as written), crises, districts | Unchanged, but after the above. |

Phase 3's remaining items (crisis engine, district welfare, winter mitigation)
stay where they are — the known-issues note that winter balance should wait for
player mitigation tools is correct and should be honoured.

---

## 6. Open risks

- **Standing starvation.** Named above; the most likely cause of the game
  feeling stalled around day 60 on a real playthrough.
- **Content volume for six tracks.** Six tracks × five ranks × distinct jobs,
  perks and story branches is a very large authoring commitment. If it has to
  be cut, cut **track count, not track depth** — two shallow tracks are worse
  than one deep one.
- **Bond perks as multipliers.** If the perk table stays numeric, "bonds are
  power" is a claim the mechanics do not support. Tilt to `unlock`.
- **No human has played this build.** Still true. Every balance number in this
  document comes from simulated probes, not from play.
