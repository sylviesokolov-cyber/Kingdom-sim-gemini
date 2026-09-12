# Factions — The Eight Interests

> Factions are what make political choices cost something. Without them, every decision is a
> free upgrade.

---

## 1. Faction state

Each faction tracks:

| Field | Meaning |
|---|---|
| **Opinion** (0–100) | How they feel about the player specifically |
| **Power** (0–100) | How much they can actually do about it |
| **Stability** (0–100) | Internal cohesion — low stability means splinters and coups |
| **Needs** | Current unmet demands, generated from kingdom state |
| **Leader** | An NPC. Kill or replace them and the faction changes character. |
| **Relations** | Opinion of every other faction |
| **Red lines** | Actions that cause a large, immediate opinion collapse |

**Opinion and power are independent.** The Refugees may adore you and be able to do nothing.
The Nobility may despise you and still decide the succession.

---

## 2. The eight

| Faction | Leader | Wants | Red line | Power source |
|---|---|---|---|---|
| **The Crown** | King Aldric IV | Stability, obedience, an undisputed heir | Open challenge to succession | Law, treasury, appointments |
| **The Nobility** | Duke Corvin Ashgrave | Privilege, land, precedence | Taxing noble estates | Land, private levies, votes |
| **The Church of Sol** | High Priestess Beatrix | Souls, alms, moral authority | Tolerated vice, seized church land | Public opinion, literacy, charity |
| **The Military** | Commander Valerius | Pay, walls, a war worth winning | Garrison budget cuts | Force — the only faction that can simply take things |
| **The Guilds** | Guildmaster Silas | Monopoly, contracts, guild law | Foreign goods undercutting members | Capital, production, city votes |
| **The Commons** | (emergent — no fixed leader) | Bread, water, safety | Famine, or a tax on bread | Numbers. Riots. Labor. |
| **The Refugees** | Caren (de facto) | Shelter, work, legal standing | Expulsion orders | Cheap labor, and a moral claim |
| **The Syndicate** | Vesper | Free trade in everything | A customs crackdown that works | Information, violence, every black market |

---

## 3. Zero-sum pressure

Most meaningful actions **help one faction and hurt another**. The design target is that the
player is always trading, never just gaining.

| Action | Gains | Costs |
|---|---|---|
| Tax noble estates | Commons ++, Crown + | Nobility −−− |
| Crack down on smuggling | Guilds ++, Crown + | Syndicate −−−, Commons − (prices rise) |
| Grant refugees legal standing | Refugees +++, Church + | Commons −− (job competition), Nobility − |
| Raise the garrison budget | Military +++ | Commons −, Guilds − (tax) |
| Seize church land for granaries | Commons ++, Crown + | Church −−− |
| Fix prices during famine | Commons +++ | Guilds −−−, Syndicate ++ (black market booms) |

A decree that costs nobody anything should be rejected in design review.

---

## 4. What faction state does

- **Gates content** — jobs, quests, companions, council actions, districts
- **Shapes events** — each faction has an event pool weighted by opinion and unmet needs
- **Decides the succession** — Act 6 is literally a weighted vote of faction power
- **Determines endings** — which throne routes exist, and what kingdom you end up with
- **Applies daily modifiers** — a hostile Guild faction manipulates prices against you; a loyal
  Military reduces crime and unrest

---

## 5. Faction crises

Opinion below 20 with power above 60 starts a **faction crisis** — a multi-day arc that escalates
if ignored:

| Faction | Crisis |
|---|---|
| Nobility | Noble revolt — private levies march |
| Church | Schism — a rival pulpit preaches against you |
| Military | Mutiny — the garrison stops enforcing |
| Guilds | Embargo — supply chains close |
| Commons | Bread riot — districts burn |
| Refugees | Mass exodus or camp uprising |
| Syndicate | Shadow war — assassination attempts |
| Crown | Attainder — your titles and property are stripped |

These are handled by the crisis engine (`SIMULATION.md` stage 14) as staged arcs, not popups.

---

## 6. Implementation notes

```
src/types/factions.ts       Faction, FactionState, Relation, RedLine
src/content/factions/       the eight definitions, relation graph, event pools
src/engine/factions/        pure opinion/power/crisis functions
```

Required pure functions:

```ts
applyFactionImpact(factions, impact): FactionState[]   // includes relation ripple
dailyFactionDrift(factions, kingdom, day): FactionState[]
factionNeeds(faction, kingdom): Need[]
checkRedLines(factions, action): RedLineViolation[]
factionCrisisCheck(factions): CrisisTrigger[]
successionVote(factions, player, npcs): VoteResult
```

**Relation ripple matters:** helping the Church should slightly move every faction that has an
opinion of the Church. Factions react to each other, not only to the player.
