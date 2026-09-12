# NPCs — Character System

> *"Characters are people."* An NPC that is only a resource button with a portrait has failed
> review, regardless of how good the portrait is.

---

## 1. What every NPC has

### Identity
id · name · title · role · district · facility · faction · rarity · portrait · stage art ·
background · theme color · voice descriptor

### Personality
3–5 traits (`Devoted`, `Guarded`, `Mercenary`, `Playful`, `Zealous`, `Pragmatic`, …), displayed
as the tags on the companion panel and **read by the engine** — traits modify gift preferences,
dialogue selection, event reactions, and drift rates.

### Interior life
| Field | Use |
|---|---|
| **Want** | A goal independent of the player. Drives her own quest line. |
| **Fear** | What breaks her. Read by crisis and confrontation events. |
| **Secret** | Discoverable, with consequences for knowing and for telling |
| **Wound** | What already happened to her. Shapes her voice. |

### Systemic role
managed facility · base output · efficiency modifier · what her absence costs the kingdom

### Condition
health · energy · status (`Healthy · Fatigued · Sick · Injured · Critical · Imprisoned ·
Missing · Deceased`) · illness · days in condition · required treatment

### Relationship (see `BONDS.md`)
affection · trust · respect · desire · resentment · jealousy · tier · resonance

### Social graph
opinion of every other NPC (`ally · neutral · rival · nemesis`) with a reason string

### Memory
An append-only log of significant player actions toward her — used by dialogue selection and by
confrontation events. *She remembers that you sold the grain.*

### Content
greetings · dialogue by topic and by mood · favorite and hated gifts · bond episodes · outfits ·
gallery entries · personal quest line

---

## 2. Mood

Derived, not stored: a function of health, relationship, jealousy, and recent memory. Mood
selects which dialogue variant plays and modifies interaction outcomes.

`Content · Warm · Tired · Worried · Hurt · Cold · Jealous · Elated`

A companion at Devoted affection but high jealousy greets you **coldly**. The numbers say she
loves you; the scene says she's furious. Both are true, and the dialogue layer has to carry it.

---

## 3. Absence has a cost

Every principal NPC runs something. When she is sick, imprisoned, or dead, the kingdom feels it:

| NPC | If she stops working |
|---|---|
| Mira | Water production −60%. Two days later, thirst. |
| Caren | Grain −50%, granary management fails, refugee support collapses |
| Elena | Medicine production stops; any active plague accelerates |
| Beatrix | Church opinion decays, alms stop, unrest climbs |
| Claire | Garrison ninth stands down; crime and ambush events rise |
| Rin | Market spread widens for everyone |
| Vesper | Syndicate destabilizes — which is *worse*, not better |

**NPCs can die.** Untreated Critical status, certain crisis outcomes, and certain story choices
are permanent. Death removes her output, her perks, her content, and writes a flag every other
companion reads. This is the sharpest tool the game has; it should be rare and always the result
of something the player could have prevented.

---

## 4. Authoring checklist

An NPC is not ready to merge until:

- [ ] All six questions from `CONTENT_GUIDE.md` §3 are answered in the data
- [ ] She runs a real facility with real output
- [ ] She has ≥ 3 greetings and ≥ 4 dialogue topics with mood variants
- [ ] She has favorite **and** hated gifts
- [ ] She has an opinion of ≥ 3 other NPCs, each with a reason
- [ ] At least one rival, with a reason that is actually a disagreement
- [ ] Bond episodes 1–5 outlined (full scripts may land later)
- [ ] Bond perks are registered systemic modifiers, not flavor text
- [ ] Her absence has a defined kingdom cost
- [ ] Portrait, stage art, and background are assigned

---

## 5. Implementation notes

```
src/types/npc.ts            the full NPC type
src/content/npcs/           one file per NPC + an index + the relationship graph
src/engine/relationships/   mood derivation, memory, drift, opinion resolution
```

Required pure functions:

```ts
deriveMood(npc, player, day): Mood
selectDialogue(npc, topic, mood, memory): string
recordMemory(npc, event): NpcState
npcProductionOutput(npc, facility, season, weather, perks): number
absenceImpact(npc): KingdomImpact
```

Content files are **data only**. If an NPC file contains an `if`, it belongs in the engine.
