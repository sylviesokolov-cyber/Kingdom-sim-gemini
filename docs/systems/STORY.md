# Story Engine

> Narrative is authored **data**, not code. Adding a chapter must never mean adding a branch to
> a component.

---

## 1. Structure

```
Story → Act → Chapter → Quest → Stage → Choice → Consequence
```

| Level | Meaning |
|---|---|
| **Story** | The whole campaign, or a character's personal arc |
| **Act** | One of the eight acts from the Game Bible |
| **Chapter** | A themed cluster of quests, gated as a unit |
| **Quest** | A discrete objective with stages |
| **Stage** | One step — a scene, an objective, a wait, or a choice |
| **Choice** | A branch that writes flags |
| **Consequence** | State written now, or scheduled to land on a future day |

---

## 2. Gating

Every chapter, quest, and stage declares typed prerequisites. The engine evaluates them; content
never checks state imperatively.

```ts
interface Prerequisite {
  day?: { min?: number; max?: number };
  estate?: Estate;
  career?: { track: CareerTrack; minRank: number };
  attribute?: Partial<Record<Attribute, number>>;
  faction?: { id: FactionId; minOpinion?: number; minPower?: number }[];
  bond?: { npcId: string; minTier: BondTier; minTrust?: number }[];
  kingdom?: Partial<Record<KingdomStat, { min?: number; max?: number }>>;
  inventory?: { itemId: string; min: number }[];
  flags?: { all?: string[]; any?: string[]; none?: string[] };
  completedQuests?: string[];
}
```

If a prerequisite shape is missing, **add it to the type** — never work around it with a
one-off check inside a scene.

---

## 3. Flags

Flags are the story's memory. Namespaced, permanent, and never silently overwritten.

```
act3.chose_silas_over_vesper
mira.knows_about_the_sabotage
caren.ep5.took_the_children
court.blackmailed_ashgrave
drought.learned_the_truth
```

Naming: `<domain>.<subject>_<verb>`. Flags are set by consequences, read by prerequisites, and
displayed nowhere — the player learns the world remembers by *experiencing* it.

---

## 4. Delayed consequences

The most valuable narrative tool in the game. A consequence can schedule itself for a future day.

```ts
{ kind: 'scheduled', inDays: 21, effect: { event: 'ashgrave_retaliation' } }
```

Act 5's payoffs should mostly be Act 3's decisions coming due. If a player can't be surprised by
their own past, the story engine isn't earning its complexity.

---

## 5. The eight acts

Full beats live in `docs/story/`, authored as each act is built. The Game Bible has the summary.
Gating targets:

| Act | Opens at | Ends when |
|---|---|---|
| 1 The Ashes | Day 1 | Peasant estate |
| 2 The Useful Man | Peasant | Villager + 1 career rank 2 |
| 3 The Rising Tide | Villager | Burgher + a business |
| 4 What Runs Downhill | Burgher, 3 mystery threads found | The conspiracy is named |
| 5 The Court | Gentry | Court access + 1 court ally |
| 6 The Dying King | Act 5 done, day 140+ | Aldric dies |
| 7 The Throne | Aldric dead | A throne route resolves |
| 8 The Reign | King | An ending triggers |

Acts 1–3 are playable without the mystery; a player can just live in Valenreach. Act 4 is where
the campaign asserts itself.

---

## 6. The central mystery

Recorded here so no future session contradicts it.

**The Red Drought three years ago was not a natural failure.** The aqueduct's upper sluices were
deliberately closed during the melt. The Goldfields burned, the refugee influx followed, land
prices in the outer valley collapsed, and **Duke Corvin Ashgrave bought most of it** within
eighteen months — through guild intermediaries, using capital fronted by the Syndicate before
Vesper took over.

Ashgrave is doing it again, slower, ahead of the succession: a thirsty, frightened kingdom will
accept a strong hand. Mira has been finding evidence at Springhead and has told no one, because
the last person who did died in the catacombs.

**The protagonist arrived in the refugee influx caused by that drought.** He does not remember
who he was. The archive holds the answer — Elare can find it — and the answer is that he was
part of the household of the man who signed the sluice order. Whether he was a witness, an
accomplice, or the intended scapegoat is the Act 4 revelation, and the game supports more than
one truth depending on earlier flags.

---

## 7. Implementation notes

```
src/types/story.ts          Story, Act, Chapter, Quest, Stage, Choice, Consequence, Prerequisite
src/content/story/          authored acts, one directory per act
src/engine/story/           prerequisite evaluation, quest advance, consequence application
```

Required pure functions:

```ts
evaluatePrerequisite(prereq, state): PrereqResult      // and WHY it failed, for the UI
availableQuests(state): Quest[]
advanceQuest(state, questId, choiceId): StoryResult
applyConsequence(state, consequence): GameState
dueScheduledConsequences(state, day): Consequence[]
```

`evaluatePrerequisite` must return the **reason** for failure, not a boolean — the quest log
needs to tell the player *"Requires: Burgher estate, Church opinion 40 (you have 22)"*.
