# Gacha — The Summon System

> Retinue acquisition. **In-game currency only. There is no real-money purchase path, and none
> will be added.** Gacha here is a progression and collection system, not monetization.

---

## 1. Currency

| Currency | Source | Spent on |
|---|---|---|
| **Fate Crystals** | Daily login, quests, story beats, deeds, festivals, achievements | Summons |
| **Copper** | Work, trade, crime | Everything mundane |
| **Guild Marks** | Career track progress | Career shop, career perks |
| **Bond Hearts** | Bond episodes, high-affection days | Gifts, outfits, gallery unlocks |

Crystal income must be tuned so a steady player affords roughly **one 10-pull per in-game week**.
Fast enough to feel generous; slow enough that a pull is a decision.

---

## 2. Rates

| Rarity | Base rate | Soft pity | Hard pity |
|---|---|---|---|
| **SSR** | 1.6% | ramps from pull 61 (+6%/pull) | guaranteed at 80 |
| **SR** | 8.5% | — | guaranteed within every 10 |
| **R** | 89.9% | — | — |

- **Rate-up:** on a featured banner, 50% of SSR results are the featured companion. Losing the
  50/50 guarantees the featured companion on the next SSR.
- **Pity carries across banners** of the same type. It never resets on a banner ending —
  expiring someone's 73-pull counter is hostile design.
- The pity counter is **always visible** on the summon screen. No hidden state.

---

## 3. Banner types

| Banner | Pool | Notes |
|---|---|---|
| **Standard** | All non-limited companions, outfits, charters | Permanent |
| **Rate Up** | One featured SSR companion | Rotating, dated |
| **Friendship** | R/SR companions, gifts, bond items | Cheap currency, generous |
| **Royal** | Charters and outfits only | No companions — cosmetic/passive |
| **Limited** | Festival/story-tied exclusives | Returns; never permanently missable |

**No companion is permanently missable.** Limited banners rerun, and every principal companion is
also reachable through story or reputation. Gacha changes *when* and *how fast*, never *whether*.

---

## 4. What you can pull

1. **Companions** — new retinue members. Duplicates convert to **Resonance**.
2. **Resonance** — raises a companion's affection cap and unlocks her later bond episodes.
   R1 → Close, R2 → Devoted, R3 → Sworn. Also obtainable via her personal questline.
3. **Outfits** — alternate stage art, dialogue tone shift, small modifier.
4. **Retinue Charters** — passive kingdom bonuses (`+5% granary capacity`, `−10% market spread`).
   These are the "ship equipment" layer: collectible, stackable, systemically real.

---

## 5. Summon screen

Per `03-full-ui-screen-map.png`, panel 6:

- Banner carousel with featured art and end date
- **Summon x1** (300 crystals) and **Summon x10** (3,000 crystals — no discount, but the
  10-pull SR guarantee is the value)
- Pity counter, visible and exact: `61/80 to guaranteed SSR`
- Full rate details, one tap away, stating real numbers
- Result reel: suspense hold → flare → cards, with **skip always available**
- New companions route straight into a first-meeting VN scene

**Never** dark-pattern the reveal: no fake near-misses, no rigged animation implying a rarity the
result isn't. The suspense is theater; the numbers are honest.

---

## 6. Implementation notes

```
src/types/gacha.ts            Banner, PullResult, PityState, Rarity
src/content/gacha/            banner definitions, pool tables
src/engine/gacha/             pure pull resolution
```

Required pure functions:

```ts
resolvePull(banner, pity, rng): PullResult
resolveMultiPull(banner, pity, count, rng): PullResult[]   // applies the 10-pull SR floor
applyPullResults(state, results): GameState               // dupes → Resonance
pityAfter(pity, results): PityState
```

Tests must assert, over 100,000 seeded pulls:

- observed SSR rate lands within tolerance of the published rate **including** pity
- hard pity never exceeds 80
- every 10-pull block contains at least one SR
- rate-up 50/50 with guarantee resolves correctly across banner boundaries
- pity survives serialization and never resets on banner change
