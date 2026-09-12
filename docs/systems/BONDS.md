# Bonds — Companions, Affection, and the Harem

> Bonds are the heart of the game **and** its most powerful progression system. A bond that
> doesn't change how you play the kingdom is a failed bond.

---

## 1. Relationship dimensions

Affection alone is a slot machine. Companions track **five** independent values:

| Dimension | 0–100 | Raised by | Lowered by |
|---|---|---|---|
| **Affection** | romantic warmth | talking, gifts, bond episodes, kindness | neglect, jealousy, cruelty |
| **Trust** | will she rely on you | keeping promises, discretion, competence | broken promises, betrayal, lies caught |
| **Respect** | does she take you seriously | career rank, deeds, decisive choices | cowardice, incompetence, grovelling |
| **Desire** | charged tension | flirtation, proximity, phase-gated scenes, outfits | rejection, coldness |
| **Resentment** | the counterweight | jealousy, being used, exploitation, taking her side against her | apology arcs, sacrifice, time |

**Affection cannot substitute for trust.** A companion can adore you and still refuse to hand
over the granary keys because she knows you'll sell the grain. This is the whole point.

Resentment is not a bar you drain with gifts. It comes down through **action** — visible
sacrifice, taking her side when it costs you, or a dedicated apology arc.

---

## 2. Tiers

Gated on `affection`, with a **trust floor** on every tier past Warm.

| Tier | Affection | Trust floor | Unlocks |
|---|---|---|---|
| **Stranger** | 0–19 | — | Basic greeting only |
| **Acquainted** | 20–39 | 15 | Personal dialogue, gift preferences visible, Episode 1 |
| **Warm** | 40–59 | 35 | Assist actions, first bond perk, Episode 2, gallery CG 1 |
| **Close** | 60–74 | 50 | Second bond perk, Episode 3, outfit 1, private phase scenes |
| **Devoted** | 75–89 | 65 | Third bond perk, Episode 4, outfit 2, gallery CG 2, route flag |
| **Sworn** | 90–100 | 80 | Final perk, Episode 5, exclusive scene, ending eligibility |

**Resonance** (from gacha duplicates) raises the affection **cap**. Without Resonance a companion
caps at Devoted. Sworn always requires either Resonance or the completion of her full personal
questline — so a non-paying, non-pulling player can still reach every Sworn bond through play.

---

## 3. Bond perks — the cheat codes

This is what the owner asked for explicitly: *"they will play part in progression as cheat, by
bonding with merchant wife you get special contracts."*

Every perk is a **real systemic modifier**, registered in `src/content/bonds/perks.ts` and read
by the engine. No perk is flavor text.

| Companion | Warm | Close | Devoted | Sworn |
|---|---|---|---|---|
| **Caren** (granaries) | See true granary reserves | Famine events −40% severity | Draw 3 days' grain reserve per season | Goldfields answer to you; set the harvest levy |
| **Mira** (aqueduct) | Sabotage early warning | Route water priority to one district | Drought events −50% severity | Close the sluices — kingdom-scale leverage |
| **Rin** (exchange) | See real prices before market open | Buy 0.9× / sell 1.1× | Buy 0.8× / sell 1.15×, exclusive contracts | Corner one resource per season |
| **Vesper** (syndicate) | Bounty accrues at half rate | Black market at member rates | Blackmail dossier on any court NPC | Syndicate protection: one crime auto-succeeds/season |
| **Beatrix** (church) | Confession clears minor bounty | Church opinion +1/day | Pulpit endorsement: +15 Commons on any decree | Anointment — unlocks the Anointed throne route |
| **Sylvie** (guilds) | Guild gossip: see faction intents | One guild vote in council | Luxury goods at cost | Guild bloc votes with you |
| **Claire** (ninth company) | Escort: no ambush events | +2 Might, martial training | One garrison intervention per crisis | The ninth company is yours |
| **Lyra** (thornwood) | Herb yields +20% | Free medicine per week | Poison and antidote access | Thornwood's rare reagents, exclusively |
| **Elena** (apothecary) | Illness recovery doubled | Plague response halves mortality | Research: one permanent attribute +3 | Cure development — ends any plague crisis |
| **Seraphine** (household) | Court gossip and schedules | Court access without rank | Royal favor: one decree passes unopposed | Legitimacy — unlocks the Heir throne route |
| **Elare** (archive) | Records lookup on any NPC | Genealogy: find leverage | The Drought archives | Your own name, and what it's worth |

**Two of these perks gate throne routes outright.** Bonds are not optional content.

---

## 4. Bond episodes

Each companion has 5 episodes following the arc from `CONTENT_GUIDE.md`:

1. **Introduction** — who she is when she's not working
2. **Trust** — she asks you for something real
3. **Conflict** — her goal collides with yours, or with another companion's
4. **Revelation** — the secret, and what it costs her to tell you
5. **Choice → Resolution** — a decision that writes a persistent flag

Episodes are VN scenes: background, portrait, emotion states, scripted beats, 2–3 branching
choices, and a reward. **The Episode 5 choice must change later gameplay** — a faction shift, a
story flag, a route unlock. Never just affection.

---

## 5. Jealousy and the harem

The harem is intended play. It is not free.

- Every companion has an **opinion of every other companion**: `ally · neutral · rival · nemesis`
- Advancing a bond raises **jealousy** in companions who are rivals with that one
- Jealousy above 60 causes: cold dialogue, refused assists, perk suspension
- Jealousy above 85 triggers a **confrontation event** — a forced choice that will cost you
  something with someone

### Rival pairs (design intent)

| Pair | Why |
|---|---|
| Beatrix ↔ Vesper | The Church and the Syndicate. She knows what Vesper is. |
| Seraphine ↔ Caren | Crown and commons. One of them thinks the other is using you. |
| Claire ↔ Sylvie | The soldier thinks the guildmistress is a parasite. She is not wrong. |
| Rin ↔ Caren | Rin trades grain futures. Caren knows what that does in a famine. |
| Mira ↔ Elena | An old professional grievance about the Red Drought. |

**Reconciliation arcs exist.** With high enough trust from both, you can broker peace between a
rival pair — a hard, rewarding, late-game piece of content that permanently removes the jealousy
penalty and unlocks a shared scene.

**A full harem should be genuinely difficult.** If a player maxes every bond without ever facing
a confrontation, the system is tuned wrong.

---

## 6. Interactions

| Action | Cost | Effect |
|---|---|---|
| **Talk** | 5 energy | +2 affection, dialogue, info. Diminishing after 3/day. |
| **Gift** | item | +8 affection, +18 if favorite, +trust if personally meaningful |
| **Assist** | 20 energy | +6 affection, +4 trust, +facility efficiency today |
| **Bond Episode** | free, gated | The main payload |
| **Confide** | 10 energy | Share a secret of your own: +trust, +resentment risk if you lie |
| **Request** | trust | Ask for a perk-level favor; may be refused |
| **Night visit** | phase-gated | Desire-gated private scene at Close+ |

---

## 7. Gallery and outfits

- **Gallery** — every unlocked CG and completed episode, rewatchable. Locked entries show a
  silhouette and the unlock condition.
- **Outfits** — cosmetic, but **not only** cosmetic: an outfit shifts her stage art, her dialogue
  tone, and gives a small attribute or desire modifier. Sources: bond tiers, gacha, festivals,
  and gifts.
- **Voice** — architecture supports per-line voice clips; shipping VO is out of scope for now.
  Do not build UI that breaks without audio files present.

---

## 8. Implementation notes

```
src/types/relationships.ts    dimensions, tiers, opinions, jealousy
src/content/npcs/             companion definitions + relationship graph
src/content/bonds/            episodes, perks, outfits, gallery entries
src/engine/relationships/     pure affection/trust/jealousy/perk-resolution
```

Required pure functions:

```ts
applyInteraction(npc, kind, player, rng): InteractionResult
dailyRelationshipDrift(npcs, player, day): NpcState[]      // neglect decay, jealousy tick
availableEpisodes(npc, player): BondEpisode[]              // affection AND trust gates
activePerks(npcs, player): PerkModifier[]                  // suspended while jealous
jealousyAfterBond(npcs, bondedId): NpcState[]
canRequest(npc, favor): RequestVerdict
```

The perk resolver is the load-bearing one: **every engine stage that can be modified by a perk
must read from `activePerks`**, never from a hardcoded companion check.
