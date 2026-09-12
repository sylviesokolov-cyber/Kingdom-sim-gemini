# Valenreach — Game Bible

> Canonical world, cast, tone, and long-term design target.
> This describes what the game **is**, not what is **built**. For build state see
> `DEVELOPMENT_STATUS.md`.

---

## 1. Identity

**Title:** Valenreach
**Genre:** Anime medieval-fantasy kingdom simulation RPG with companion bonds and a gacha retinue
**Platform:** Landscape-first PWA (phone primary, larger landscape secondary)
**Protagonist:** Male. Named by the player, default **Syl**. Starts with nothing.
**Length target:** 200+ in-game days to a first ending; multiple endings; heavy replay.

**Core fantasy:** You arrive in Valenreach as nobody. You haul water for coppers. Two hundred
days later the kingdom's granaries, garrison, treasury, cathedral, and underworld answer to you —
because the women who run them answer to you, and because you learned how the machine works.

---

## 2. Tone

Ornate, warm, and a little dangerous. Valenreach is beautiful and rotten in equal measure: gold
leaf over water rot, a cathedral funded by smuggling, a harvest festival held over a mass grave
nobody names.

- **Not grimdark.** People are kind here. Kindness is just expensive.
- **Not cozy.** Shortages kill. The plague quarter is real. Choices cost people their lives.
- **Romantic in the old sense** — longing, restraint, the charged pause before anyone says
  anything true. Then the modern sense too.
- **Anime-literate.** Dramatic silhouettes, declarative emotional beats, characters who say the
  quiet part out loud at exactly the right moment.

---

## 3. The world

### Valenreach, the kingdom

A river valley kingdom in the shadow of the **Tellmar Range**. Snowmelt feeds the **Grand
Aqueduct**, the aqueduct feeds the city, and everything else in Valenreach is downstream of that
single fact — economically and politically. Whoever controls the water controls the realm; this
is the kingdom's oldest open secret and the seed of its coming crisis.

The crown sits on **King Aldric IV**, aging, ill, and without an undisputed heir. The court is
already carving up a succession nobody will say aloud is coming.

### Districts

| District | What it is | Controls |
|---|---|---|
| **The Crown Quarter** | Palace, high court, royal treasury | Law, taxation, appointments |
| **Cathedral Hill** | Cathedral of Sol, seminary, almshouses | Piety, charity, public opinion |
| **The Bourse** | Merchant consortium, exchange, warehouses | Prices, contracts, capital |
| **The Garrison** | Barracks, armory, city walls | Security, force |
| **Weaverlane** | Textile guilds, dye houses, workshops | Craft, goods, guild votes |
| **The Goldfields** | Farmland, granaries, mills | Grain — the kingdom's stomach |
| **Springhead** | Aqueduct works, cisterns, reservoirs | Water — the kingdom's throat |
| **The Wharfs** | Harbor, fishing fleet, customs | Fish, imports, smuggling |
| **Emberworks** | Mines, foundry, forges | Iron, tools, arms |
| **Thornwood** | Forest, orchards, herbaries | Herbs, medicine, fruit |
| **The Ashes** | Refugee camps, slums | Population pressure, unrest |
| **The Catacomb Quarter** | Underworld, black market, old tunnels | Everything the others deny |

### Factions

Eight competing interests, each with support, power, needs, red lines, and a leader.

| Faction | Wants | Red line |
|---|---|---|
| **The Crown** | Stability, continuity, obedience | Open challenge to succession |
| **The Nobility** | Privilege, land, precedence | Taxation of noble estates |
| **The Church of Sol** | Souls, alms, moral authority | Open heresy or tolerated vice |
| **The Military** | Pay, walls, a war worth winning | Garrison budget cuts |
| **The Guilds** | Monopoly, contracts, guild law | Foreign goods undercutting members |
| **The Commons** | Bread, water, safety | Famine, or a tax on bread |
| **The Refugees** | Shelter, work, legal standing | Expulsion orders |
| **The Syndicate** | Free trade in everything | A customs crackdown that actually works |

Faction power is real: it gates content, changes event pools, decides succession votes, and
determines which endings are reachable. See `systems/FACTIONS.md`.

---

## 4. The protagonist

Default name **Syl**. An outsider who arrived in the refugee influx after the **Red Drought**
three years ago — the summer the aqueduct failed and the Goldfields burned. He remembers being
somebody before that. The game does not tell him who, and the answer is a main-story thread.

He has no innate power. His advantages are exactly three: he pays attention, he is useful to
people who matter, and he is willing to be liked.

**Attributes:** Might · Cunning · Authority · Piety · Charm
**Vitals:** Energy · Health · Hunger · Standing (reputation per faction)

---

## 5. The cast

Companions are the heart of the game. Each one **runs something the kingdom needs**, which is
what makes bonding with them a progression mechanic rather than a side activity.

Every companion has: a role with real systemic output, a personality, a want, a fear, a secret,
opinions about the other companions, and memory of what the player has done.

### Principal companions (bondable)

| Name | Title | Runs | Rarity | Bond unlocks |
|---|---|---|---|---|
| **Caren** | Lady of the Harvest | Goldfields granaries | SSR | Grain reserve access, famine mitigation, harvest festival |
| **Mira** | The Springtender | Grand Aqueduct | SSR | Water priority routing, sabotage warnings, Springhead access |
| **Vesper** | The Shadow Mirage | Nightshade Syndicate | SSR | Black market rates, blackmail dossiers, safe passage |
| **Beatrix** | Voice of the Dawn Sun | Cathedral of Sol | SSR | Church endorsement, absolution of bounty, alms network |
| **Sylvie** | The Weaver of Sol | Weaverlane guilds | SR | Guild votes, luxury goods, whose cloak went where |
| **Lyra** | The Forest Herbalist | Thornwood herbaries | SR | Medicine supply, rare reagents, poison knowledge |
| **Elena** | The Sage of Elixirs | Apothecary & alchemy | SR | Plague response, cures, alchemical research |
| **Seraphine** | The Loyal Queen | The royal household | SSR | Court access, succession leverage, the crown itself |
| **Rin** | The Coin Countess | Bourse exchange floor | SR | Contract rates, insider prices, credit |
| **Claire** | Knight of the Ninth | Garrison ninth company | SR | Troops, escorts, martial training |
| **Elare** | The Archive Keeper | Royal archive | R | Records, genealogies, the protagonist's own past |

### Key non-bondable figures

| Name | Role | Function |
|---|---|---|
| **King Aldric IV** | The dying king | The clock on the whole game |
| **Commander Valerius** | Captain of the City Guard | Martial career gate, rival, possible ally |
| **Guildmaster Silas** | President of the Merchant Consortium | Merchant career gate, obstacle, mentor |
| **Master Torvin** | Grand Blacksmith | Equipment, Emberworks output |
| **Old Bran** | Harbor Master | Wharfs supply, smuggling rumors |
| **Duke Corvin Ashgrave** | The other claimant | Primary antagonist of the succession arc |

> The cast roster is authored in `src/content/npcs/`. This table is the design intent; the
> content files are the implementation. Keep them reconciled.

---

## 6. Companion bonds

The bond system is described fully in `systems/BONDS.md`. The shape:

**Affection tiers:** Stranger → Acquainted → Warm → Close → Devoted → Sworn

Each tier gates: new dialogue, new bond episodes, a gallery CG, an outfit, and a **bond perk** —
a permanent mechanical advantage tied to what that character controls.

**Bonds must pay out mechanically.** Examples of what a bond perk looks like:

- *Caren, Close:* granary reserve — famine events cost 40% less kingdom stability
- *Rin, Devoted:* exclusive contracts — buy at 0.8× and sell at 1.15× at the Bourse
- *Vesper, Warm:* the Syndicate looks away — bounty accrues at half rate
- *Beatrix, Devoted:* pulpit endorsement — Church opinion +1 per day while standing is positive
- *Claire, Close:* the ninth answers — one garrison intervention per crisis

**The harem is explicit and supported.** Multiple simultaneous bonds are intended play. They are
not free: companions have opinions about each other, jealousy is a tracked state, and some pairs
will force a choice. A maxed harem is a hard-mode achievement, not a default.

**Content tier:** suggestive and sensual, fade-to-black. See `../CONTENT_GUIDE.md`.

---

## 7. The gacha layer

Summoning is the **retinue acquisition** system. In-game currency only — no real-money purchase
path exists or will be added.

- **Currency:** Fate Crystals, earned from play (daily rewards, quests, story beats, deeds).
- **Rarities:** SSR / SR / R, with rate-up banners.
- **Pity:** hard pity at 80 pulls, soft pity ramp from 60. Guaranteed SR every 10.
- **Duplicates** convert to **Resonance**, which raises a companion's bond cap and unlocks their
  later bond episodes.
- **What you pull:** companions, outfits, and **retinue charters** (passive kingdom bonuses).

Gacha is a *supplement* to the world, not a wall. Every principal companion is also obtainable
through play — story, questlines, or reputation. Summoning gets you there faster and gets you
the cosmetics. A player who never pulls must still be able to reach every ending.

See `systems/GACHA.md`.

---

## 8. The core loop

```
Wake → spend Energy on actions (work · career · social · political · criminal)
     → consume food/water, manage Health and Hunger
     → interact with companions (talk · gift · assist · bond episode)
     → advance the day
     → the world simulates: production, consumption, prices, factions, crises
     → events and consequences surface
     → rank up, unlock, and face bigger decisions
```

The systemic chain every feature must plug into:

```
NPC condition → facility efficiency → production → supply/storage
  → consumption/shortage → market price → population welfare
  → unrest/prosperity → faction power → political consequence
  → player choice → future consequence
```

---

## 9. Story structure

Eight acts, data-driven (`Story → Chapter → Quest → Stage → Choice → Consequence`), gated on
estate, career rank, faction standing, bonds, kingdom state, and prior choices.

1. **The Ashes** — arrival, survival, first coin, first ally. Who were you before the Drought?
2. **The Useful Man** — citizenship, a trade, a room of your own, a name people know.
3. **The Rising Tide** — a business, a career rank, competing patrons who each want you loyal.
4. **What Runs Downhill** — the aqueduct threads, the smuggling threads, and the noble threads
   turn out to be one thread. Someone has been engineering the shortages.
5. **The Court** — you are invited in. Scandal, blackmail, alliance, betrayal, and the discovery
   of who benefits from a thirsty kingdom.
6. **The Dying King** — Aldric fails. Ashgrave moves. Every faction picks a side and asks you
   which one you are on.
7. **The Throne** — six routes to the crown, determined by your careers, factions, and bonds.
8. **The Reign** — endgame governance. Laws, crises, succession of your own, and the ending the
   kingdom actually earned.

---

## 10. Endings

Endings are **authored**, selected by accumulated state — not a score screen.

**Route archetypes:** Heir · Marshal · Magnate · Anointed · Kingpin · Reformer · Regent · Exile

**Kingdom outcomes:** Golden Age · Iron Kingdom · Holy Kingdom · Merchant Republic ·
Shadow Kingdom · The Commons' Realm · Hollow Crown · Failed State

**Personal outcomes** layer on top: who stayed, who left, who you buried, and whether the man
who arrived in the Ashes got an answer about who he used to be.

---

## 11. Design pillars

1. **Choices matter.** Major choices write state that later content reads.
2. **Characters are people.** Trust, conflict, goals, secrets, memory — not affection bars.
3. **Numbers represent systems.** A price change should be explainable by a supply story.
4. **The world moves without you.** Daily evolution regardless of player attention.
5. **Multiple viable lives.** Seven career routes to the same throne, all real.
6. **Presentation is core identity.** Character art, VN dialogue, and premium gacha framing are
   not chrome — they are the product.
7. **Landscape phone is the design constraint.** Dense systems, readable at 740×360.
