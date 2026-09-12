# Simulation — The Day Pipeline

> The kingdom must be a machine the player can learn to operate. Every number on screen should
> be traceable to a cause the player could have influenced.

---

## 1. The chain

```
NPC condition → facility efficiency → production → storage/supply
  → consumption → shortage/surplus → market price → population welfare
  → unrest / prosperity → faction power → event pressure
  → player-visible consequence
```

Nothing in the game may short-circuit this chain. A decree that "adds +5 security" without
touching the chain is a bug in the design.

---

## 2. Pipeline stages

`simulateDay(state, rng) → DaySimulationResult` runs these in strict order. Each stage is a
separate pure function so it can be tested alone.

| # | Stage | Reads | Writes |
|---|---|---|---|
| 1 | **Advance clock** | day | day, season, weather |
| 2 | **Player upkeep** | player, inventory | energy, health, hunger, status effects |
| 3 | **NPC condition** | npcs, kingdom health | health, energy, status, illness, recovery |
| 4 | **Facility efficiency** | npcs, district state, weather | per-facility efficiency multiplier |
| 5 | **Production** | facilities, season, efficiency | resource output |
| 6 | **Storage** | output, storage capacity, decay | stored supply, spoilage |
| 7 | **Consumption** | population, supply | consumed, shortfall per resource |
| 8 | **Welfare** | shortfall | hunger, thirst, sickness, mortality, migration |
| 9 | **Market** | supply, demand, shortfall, events | prices, trend, supply band |
| 10 | **Vitals** | welfare, security, piety, treasury | kingdom stats |
| 11 | **Unrest / prosperity** | vitals, welfare, taxes, decrees | unrest, prosperity |
| 12 | **Factions** | vitals, player actions, decrees | faction opinion and power |
| 13 | **Relationships** | player actions, proximity, jealousy | affection, trust, resentment drift |
| 14 | **Crises** | vitals, active crises | crisis stage advance/resolve |
| 15 | **Events** | full state | eligible event pool → selected event |
| 16 | **Digest** | all deltas | a player-readable list of what changed and why |

Stage 16 is not optional. If the player cannot see *why* bread doubled in price, the simulation
has failed regardless of how correct it is.

---

## 3. Determinism

**All randomness flows through `engine/rng`.** A seeded, splittable PRNG.

```ts
const rng = createRng(seed);
const marketRng = rng.fork('market');
const eventRng  = rng.fork('events');
```

Forking by domain means adding a new random call in one stage cannot shift the rolls in another
— which keeps tests stable as the game grows.

Rules:
- No `Math.random()` anywhere under `src/engine/`.
- No `Date.now()` in simulation. Game time comes from `day`.
- `simulateDay(sameState, createRng(sameSeed))` must be byte-identical across runs.
- Each save stores its seed and day count so any day is reproducible for bug reports.

---

## 4. Time

- **Day** — the atomic unit. One advance = one full pipeline pass.
- **Phase** — Morning / Afternoon / Evening / Night. Energy is spent across phases; some actions
  and companions are phase-gated. (Night is when the interesting things happen.)
- **Season** — 30 days each, `Spring → Summer → Autumn → Winter`. Modifies production, prices,
  illness rate, and the event pool.
- **Year** — 120 days. Annual events: harvest festival, tax assessment, the king's health check.
- **Weather** — rolled daily within a season's distribution. Drought, storm, and frost are the
  ones with teeth.

---

## 5. Resources

Every resource has: category, base price, storage capacity, spoilage rate, daily per-capita
demand, and a source facility.

| Resource | Category | Source | Spoils | Demand |
|---|---|---|---|---|
| Water | Survival | Grand Aqueduct | no | very high |
| Grain | Survival | Goldfields | slow | very high |
| Bread | Survival | Bakeries (from grain) | fast | high |
| Fish | Food | The Wharfs | fast | medium |
| Fruit | Food | Thornwood orchards | fast | low |
| Herbs | Medicine | Thornwood | medium | low |
| Medicine | Medicine | Apothecary (from herbs) | slow | spikes in plague |
| Cloth | Goods | Weaverlane | no | medium |
| Iron Ore | Material | Emberworks mines | no | low |
| Tools | Goods | Foundry (from ore) | no | medium |
| Arms | Military | Foundry (from ore + tools) | no | spikes in war |
| Luxuries | Luxury | Imports | no | nobility only |
| Contraband | Illicit | Catacombs | no | black market |

**Chained resources matter.** Bread needs grain; medicine needs herbs; arms need ore and tools.
Break the input and the whole chain starves two days later — which is exactly the kind of
legible cascade this simulation exists to produce.

---

## 6. Consumption and welfare

Daily demand is `population × perCapitaDemand`, modified by season and unrest.

Shortfall consequences escalate:

| Shortfall | Effect |
|---|---|
| 0% | Welfare improves slowly |
| 1–15% | Prices rise, mild discontent |
| 16–35% | Welfare falls, unrest +, sickness + |
| 36–60% | Mortality begins, migration out, unrest ++ |
| 61%+ | Famine/drought crisis triggers, population falls hard |

Water shortfall is roughly **twice** as severe as grain at every band. Thirst kills faster than
hunger, and Valenreach is built on one aqueduct.

---

## 7. Market

```
price = basePrice
      × supplyDemandRatio ^ elasticity
      × seasonModifier
      × eventModifier
      × factionModifier      (guild manipulation, monopolies)
      ± dampedNoise
```

- **Elasticity is per-resource.** Survival goods spike far harder than luxuries.
- **Prices are damped** — max ±18% movement per day. Real economies have inertia; unbounded
  swings feel broken and make trading unplayable.
- **Supply band** (`Critically Scarce → Surplus`) is derived from stored supply vs. daily demand
  measured in **days of cover**, not from an abstract 0–100.
- **The player moves the market.** Bulk buying and selling shifts supply. A Magnate can corner
  grain and starve the city — and the game must let that happen and then hold him responsible.

---

## 8. Testing requirements

Non-negotiable Vitest coverage:

1. **Determinism** — same seed + same state → identical result, run twice.
2. **Cascade** — sicken Mira → water production falls → supply falls → price rises → welfare
   falls → unrest rises. Assert the whole chain in one test.
3. **Conservation** — produced − consumed − spoiled = stored delta. No resources from nowhere.
4. **Bounds** — every stat stays in range across 500 simulated days with random actions.
5. **No-crash soak** — 1,000 days from a fresh save with randomized player actions.
6. **Save round-trip** — serialize → migrate → deserialize → identical state.

---

## 9. Implementation notes

```
src/engine/rng/            seeded splittable PRNG
src/engine/simulation/     the 16 stages + the orchestrator
src/engine/economy/        production, consumption, storage, pricing
```

Each stage exports a pure `(input) => output` function. The orchestrator only sequences them and
accumulates the digest. Keep the orchestrator boring.
