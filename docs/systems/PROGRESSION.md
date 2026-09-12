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
src/types/progression.ts      Estate, CareerTrack, CareerRank, Attribute types
src/content/progression/      estate ladder, track definitions, trial quest ids
src/engine/progression/       pure rank/XP/eligibility functions
```

Required pure functions:

```ts
canPromoteEstate(player, patron): EstateEligibility
promoteEstate(player, patron): PlayerState
canAdvanceCareer(player, track): CareerEligibility   // includes antagonism caps
advanceCareer(player, track): PlayerState
awardStanding(player, source, amount): PlayerState    // applies diminishing returns
effectiveCareerCap(player, track): number             // antagonism resolution
throneRoutesAvailable(player, factions, npcs): ThroneRoute[]
```

All of these must be covered by tests. Antagonism caps and diminishing standing returns are the
two easiest things in this system to get quietly wrong.
