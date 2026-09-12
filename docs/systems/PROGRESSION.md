# Progression — Estates and Career Tracks

> The most important structural system in the game. Two independent axes.

---

## 1. Why two axes

A single linear ladder (`Peasant → Priest → Merchant → Knight → Noble → King`) gives every
playthrough the same shape — you'd be a priest, then stop being one to be a merchant, then stop
that to be a knight. That's not a life, it's a queue.

Splitting it means: **estate** is how society ranks you, **career** is what you actually do.
A Bishop and a Kingpin can both be Gentry. A Peasant can be a Sergeant. Different combinations
open different doors, and — critically — different **routes to the throne**.

---

## 2. Social estate (the spine)

Linear. Each step is a formal change in legal and social standing.

| # | Estate | Title | Requirements | Grants |
|---|---|---|---|---|
| 0 | **Outsider** | The Nameless | — (start) | Nothing. Cannot own property, testify, or petition. |
| 1 | **Peasant** | Tenant of the Ashes | 100 standing, 100 copper | Legal residence, basic jobs, +15 max energy |
| 2 | **Villager** | Freeholder | 300 standing, 800 copper, 1 career rank 2 | Own property, market stall, +15 energy |
| 3 | **Burgher** | Burgher of Valenreach | 800 standing, 4,000 copper, career rank 3, 1 business | Guild eligibility, hire workers, city vote |
| 4 | **Gentry** | Armiger | 2,000 standing, 15,000 copper, career rank 4, 2 factions ≥ 50 | Petition the court, own land, retinue slots |
| 5 | **Noble** | Lord of Valenreach | 5,000 standing, 50,000 copper, career rank 5, a granted title | Council seat, decrees, levy rights |
| 6 | **King** | Sovereign | Act 7 route completion | The kingdom |

**Standing** is earned by deeds, quests, jobs, bonds, and public acts — *not* by grinding a
single job. Repeating the same job has sharply diminishing standing returns. The game wants a
varied life.

Promotion is never automatic: it requires a **patron** — an NPC of sufficient standing who will
vouch for you. Which patron you use colors the estate and is remembered by the factions.

---

## 3. Career tracks (the branches)

Six tracks. Each has 5 ranks. You may hold rank in **any number** of tracks simultaneously, but
advancement competes for the same finite resource: **days**.

### The tracks

| Track | Faction tie | Ranks |
|---|---|---|
| **Clergy** | Church of Sol | Acolyte · Deacon · Priest · Canon · Bishop |
| **Merchant** | The Guilds | Hawker · Trader · Factor · Merchant · Magnate |
| **Martial** | The Military | Levy · Man-at-Arms · Sergeant · Knight · Marshal |
| **Court** | The Crown | Clerk · Steward · Chamberlain · Minister · Chancellor |
| **Shadow** | The Syndicate | Cutpurse · Runner · Fixer · Underboss · Kingpin |
| **Scholar** | (none — independent) | Student · Adept · Savant · Magister · Archmagister |

### Advancement

Each rank requires **track XP**, a **faction standing floor**, and a **trial** — a scripted quest
that cannot be brute-forced with money. Track XP comes from jobs on that track, relevant story
choices, and certain bond episodes.

### Antagonism

Tracks are not free to stack. Some pairs actively fight each other:

| Pair | Effect |
|---|---|
| Clergy ↔ Shadow | Each rank in one caps the other 2 lower. Bishop and Kingpin are mutually exclusive. |
| Court ↔ Shadow | Court trials audit you; high Shadow rank risks exposure and estate loss. |
| Martial ↔ Merchant | Compete for the same ranking days; no hard cap, but both to rank 5 is a 250-day build. |

Clergy + Court, Merchant + Scholar, and Martial + Court are the natural synergy pairs.

### What career rank gates

- **Jobs** — higher-paying, higher-impact work
- **Perks** — passive bonuses (a Factor buys at −10%; a Sergeant takes 30% less injury risk)
- **Companions** — some companions will not take you seriously below a rank. Seraphine does not
  receive a Hawker.
- **Council actions** — which petitions and decrees you may raise
- **Story branches** — Act 4 onward reads career rank constantly
- **Throne routes** — see below

---

## 4. Routes to the throne

Act 7 offers six routes. Eligibility is `career rank + faction power + bonds + kingdom state`.

| Route | Requires | How you take the crown |
|---|---|---|
| **The Heir** | Court 4+, Crown ≥ 70, Seraphine Devoted | Legitimized and named successor |
| **The Marshal** | Martial 5, Military ≥ 80, garrison loyal | You take it, and the army agrees |
| **The Magnate** | Merchant 5, Guilds ≥ 75, treasury debt held | You buy it; the crown owes you |
| **The Anointed** | Clergy 5, Church ≥ 80, Beatrix Sworn | Anointed by Sol; the Church crowns you |
| **The Kingpin** | Shadow 5, Syndicate ≥ 80, 3 blackmail dossiers | You own whoever wears it |
| **The Reformer** | Commons ≥ 80, Refugees ≥ 70, unrest ≥ 60 | The people put you there, and can remove you |

Multiple simultaneous eligibility is a **choice point**, not a stacking bonus — and the routes
you *declined* remember it in the endgame.

---

## 5. Attributes

| Attribute | Raised by | Reads on |
|---|---|---|
| **Might** | Martial jobs, training, combat events | Martial track, physical event options, injury resistance |
| **Cunning** | Shadow jobs, rumors, negotiation | Shadow track, crime success, seeing through lies |
| **Authority** | Court jobs, decrees, command | Court track, faction persuasion, decree strength |
| **Piety** | Clergy jobs, alms, devotions | Clergy track, Church standing, event morale |
| **Charm** | Bonds, social actions, gifts | Affection gain rate, gift efficiency, seduction options |

Level is a summary stat: it ticks from total XP and grants +1 to all attributes and a perk slot.

---

## 6. Implementation notes

```
src/types/core.ts             Estate, CareerTrack, Attribute
src/types/player.ts           PlayerState, CareerState
src/types/content.ts          CareerTrialDefinition, ThroneRouteDefinition
src/content/progression/      estate ladder, track definitions
src/content/progression/trials.ts   the 30 rank trials
src/content/progression/throne.ts   the six throne routes
src/engine/progression/       pure rank/XP/eligibility functions
src/engine/career/            trial resolution and job reward shaping
src/engine/effects/           applyEffect — where an Effect becomes state
```

**Why trial resolution is not in `engine/progression`.** Resolving a trial
means applying an `Effect`, and `engine/effects` already depends on
`engine/progression` for the XP curve. Putting resolution in progression would
close that into an import cycle. Pure rank arithmetic stays in progression;
the part that *spends and grants* lives in `engine/career`.

Required pure functions:

```ts
// engine/progression — implemented and tested
canPromoteEstate(player, factions): Eligibility
promoteEstate(player): PlayerState
canAdvanceCareer(player, track, factions): Eligibility  // includes antagonism caps
advanceCareer(player, track): PlayerState
effectiveCareerCap(player, track): number               // antagonism resolution
standingGain(base, timesPerformed): number              // diminishing returns
repetitionFactor(timesPerformed): number                // the shared decay curve
throneRoutesAvailable(state): ThroneRouteStatus[]

// engine/career — implemented and tested
nextTrial(player, track): CareerTrialDefinition | undefined
canAttemptTrial(state, trialId): TrialEligibility        // every gate, as sentences
completeTrial(state, trialId): TrialResult               // pay, record, advance, grant
jobEffect(job, timesPerformed): Effect                   // what a shift is worth now

// not yet implemented
promoteEstate(player, patron)   // §2 requires a patron; promotion currently takes none
```

All of these must be covered by tests. Antagonism caps and diminishing standing returns are the
two easiest things in this system to get quietly wrong.

---

## 7. Rank trials

Each rank's trial is authored data in `content/progression/trials.ts`. Three
rules hold across the whole set:

1. **Not purchasable.** A trial reads attributes, estate, flags and bonds.
   Copper is at most a fee, never the qualification.
2. **Bonds are the lever.** From rank 3 up, every trial names a woman whose
   trust is required. The people who run an institution decide who rises in it.
3. **The two axes pull each other up.** Rank 2 wants Peasant, rank 3 Villager,
   rank 4 Burgher, rank 5 Gentry — and those estates want ranks 2, 3, 4 and 5
   in turn. Neither ladder climbs alone.

A trial is the *last* gate, not a second one: `canAttemptTrial` checks the
track's XP threshold and faction floor as well as the trial's own
prerequisites, so the work hall shows exactly one next step. Passing it spends
the rank's XP and advances the rank in the same action.

**Rank-1 faction floors are 0 by design.** Requiring standing with a faction to
take its entry rank is circular — nothing a rank-0 player can do moves Crown
opinion, which made the Court track unreachable. Getting in the door is how you
*start* earning an institution's regard.

**Known gap:** estate promotion still takes no patron, contrary to §2 above.
