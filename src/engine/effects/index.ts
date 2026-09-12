import type { Attribute, DigestEntry, Effect, GameState, KingdomStat } from '../../types';
import { ATTRIBUTES } from '../../types';
import { applyXp } from '../progression';

/**
 * The single place `Effect` becomes state.
 *
 * `Effect` is declared in types/content.ts as "the single vocabulary for
 * changing state", but until now every consumer applied it by hand — the work
 * hall spent forty lines re-implementing half of it and silently dropped the
 * half it did not need, which is why job attribute rewards were dead data.
 *
 * Jobs, rank trials, events, quests and bond episodes all speak this
 * vocabulary, so they all go through this function. Pure: state in, state out,
 * no randomness, no clock.
 */

export interface EffectResult {
  state: GameState;
  /** Player-facing lines describing what changed, in the order it changed. */
  notes: DigestEntry[];
  /** Levels gained, so the caller can celebrate without recomputing. */
  levelsGained: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function note(notes: DigestEntry[], message: string, tone: DigestEntry['tone'] = 'neutral'): void {
  notes.push({ stage: 'effect', message, tone });
}

/**
 * Apply one authored effect to the game state.
 *
 * `day` is passed rather than read, because scheduled consequences need to
 * know "now" and the engine may not read the clock (CLAUDE.md §5.1).
 */
export function applyEffect(state: GameState, effect: Effect, day = state.clock.day): EffectResult {
  const notes: DigestEntry[] = [];
  let player = { ...state.player };

  /* --- currencies and vitals -------------------------------------- */
  if (effect.copper || effect.guildMarks || effect.fateCrystals || effect.bondHearts) {
    player.currencies = {
      ...player.currencies,
      copper: Math.max(0, player.currencies.copper + (effect.copper ?? 0)),
      guildMarks: Math.max(0, player.currencies.guildMarks + (effect.guildMarks ?? 0)),
      fateCrystals: Math.max(0, player.currencies.fateCrystals + (effect.fateCrystals ?? 0)),
      bondHearts: Math.max(0, player.currencies.bondHearts + (effect.bondHearts ?? 0)),
    };
  }

  if (effect.energy || effect.health || effect.hunger) {
    player.vitals = {
      ...player.vitals,
      energy: clamp(player.vitals.energy + (effect.energy ?? 0), 0, player.vitals.maxEnergy),
      health: clamp(player.vitals.health + (effect.health ?? 0), 0, 100),
      hunger: clamp(player.vitals.hunger + (effect.hunger ?? 0), 0, 100),
    };
  }

  if (effect.standingPoints) {
    player.standingPoints = Math.max(0, player.standingPoints + effect.standingPoints);
  }
  if (effect.bounty) {
    player.bounty = Math.max(0, player.bounty + effect.bounty);
  }

  /* --- level and attributes --------------------------------------- */
  let levelsGained = 0;
  if (effect.xp) {
    const leveled = applyXp(player, effect.xp);
    levelsGained = leveled.levelsGained;
    player.level = leveled.level;
    player.xp = leveled.xp;
    player.xpToNext = leveled.xpToNext;
  }

  // A level raises every attribute; an authored effect raises the specific
  // ones the action actually trained. Both land in the same place.
  const attributeGains: Partial<Record<Attribute, number>> = {};
  for (const attr of ATTRIBUTES) {
    const gain = (effect.attributes?.[attr] ?? 0) + levelsGained;
    if (gain !== 0) attributeGains[attr] = gain;
  }
  if (Object.keys(attributeGains).length > 0) {
    const attributes = { ...player.attributes };
    for (const [attr, gain] of Object.entries(attributeGains)) {
      attributes[attr as Attribute] = Math.max(0, attributes[attr as Attribute] + (gain ?? 0));
    }
    player.attributes = attributes;
  }

  /* --- career track xp -------------------------------------------- */
  if (effect.careerXp?.length) {
    const careers = { ...player.careers };
    for (const gain of effect.careerXp) {
      const career = careers[gain.track];
      if (!career) continue;
      careers[gain.track] = { ...career, xp: Math.max(0, career.xp + gain.amount) };
    }
    player.careers = careers;
  }

  /* --- inventory --------------------------------------------------- */
  if (effect.items?.length) {
    const inventory = { ...player.inventory };
    for (const item of effect.items) {
      inventory[item.resourceId] = Math.max(0, (inventory[item.resourceId] ?? 0) + item.amount);
    }
    player.inventory = inventory;
  }

  /* --- flags and perks: append-only, never silently overwritten ---- */
  if (effect.setFlags?.length) {
    player.flags = [...new Set([...player.flags, ...effect.setFlags])];
  }
  if (effect.clearFlags?.length) {
    const cleared = new Set(effect.clearFlags);
    player.flags = player.flags.filter((f) => !cleared.has(f));
  }
  if (effect.grantPerks?.length) {
    player.perks = [...new Set([...player.perks, ...effect.grantPerks])];
  }

  /* --- factions: the player's standing and the faction's opinion --- */
  let factions = state.factions;
  if (effect.factions?.length) {
    factions = { ...factions };
    const standing = { ...player.standing };

    for (const impact of effect.factions) {
      const faction = factions[impact.factionId];
      if (!faction) continue;

      const delta = impact.opinion ?? 0;
      factions[impact.factionId] = {
        ...faction,
        opinion: clamp(faction.opinion + delta, 0, 100),
        power: clamp(faction.power + (impact.power ?? 0), 0, 100),
        stability: clamp(faction.stability + (impact.stability ?? 0), 0, 100),
      };
      standing[impact.factionId] = clamp(standing[impact.factionId] + delta, 0, 100);
    }

    player.standing = standing;
  }

  /* --- kingdom vitals ---------------------------------------------- */
  let kingdom = state.kingdom;
  if (effect.kingdom) {
    kingdom = { ...kingdom };
    for (const [key, delta] of Object.entries(effect.kingdom)) {
      const stat = key as KingdomStat;
      const current = kingdom[stat];
      if (typeof current !== 'number') continue;
      (kingdom[stat] as number) = Math.max(0, current + (delta ?? 0));
    }
  }

  /* --- npcs -------------------------------------------------------- */
  let npcs = state.npcs;
  if (effect.npc?.length) {
    npcs = { ...npcs };
    for (const change of effect.npc) {
      const npc = npcs[change.npcId];
      if (!npc) continue;

      npcs[change.npcId] = {
        ...npc,
        relationship: {
          ...npc.relationship,
          affection: clamp(npc.relationship.affection + (change.affection ?? 0), 0, 100),
          trust: clamp(npc.relationship.trust + (change.trust ?? 0), 0, 100),
          respect: clamp(npc.relationship.respect + (change.respect ?? 0), 0, 100),
          desire: clamp(npc.relationship.desire + (change.desire ?? 0), 0, 100),
          resentment: clamp(npc.relationship.resentment + (change.resentment ?? 0), 0, 100),
        },
        condition: {
          ...npc.condition,
          health: clamp(npc.condition.health + (change.health ?? 0), 0, npc.condition.maxHealth),
          status: change.status ?? npc.condition.status,
          daysInStatus: change.status && change.status !== npc.condition.status ? 0 : npc.condition.daysInStatus,
        },
      };
    }
  }

  /* --- delayed consequences ---------------------------------------- */
  let scheduled = state.scheduled;
  if (effect.scheduled?.length) {
    scheduled = [
      ...scheduled,
      ...effect.scheduled.map((s) => ({
        eventId: s.eventId,
        fireOnDay: day + s.inDays,
        source: 'effect',
      })),
    ];
  }

  if (levelsGained > 0) {
    note(notes, `Level ${player.level}. Every attribute rises.`, 'good');
  }

  return {
    state: { ...state, player, factions, kingdom, npcs, scheduled },
    notes,
    levelsGained,
  };
}

/** Apply several effects in order. Later effects see earlier ones. */
export function applyEffects(state: GameState, effects: Effect[], day = state.clock.day): EffectResult {
  let current = state;
  const notes: DigestEntry[] = [];
  let levelsGained = 0;

  for (const effect of effects) {
    const result = applyEffect(current, effect, day);
    current = result.state;
    notes.push(...result.notes);
    levelsGained += result.levelsGained;
  }

  return { state: current, notes, levelsGained };
}

/**
 * Can the player pay what this effect costs? Negative currency, energy and
 * item entries are costs; everything else is a reward. Checked before the
 * effect is applied so an action never half-succeeds.
 */
export function canAfford(state: GameState, effect: Effect): { ok: boolean; reason?: string } {
  const { player } = state;

  if ((effect.copper ?? 0) < 0 && player.currencies.copper < -(effect.copper ?? 0)) {
    return { ok: false, reason: `Costs ${-(effect.copper ?? 0)} copper; you have ${Math.floor(player.currencies.copper)}.` };
  }
  if ((effect.guildMarks ?? 0) < 0 && player.currencies.guildMarks < -(effect.guildMarks ?? 0)) {
    return { ok: false, reason: `Costs ${-(effect.guildMarks ?? 0)} guild marks; you have ${Math.floor(player.currencies.guildMarks)}.` };
  }
  if ((effect.energy ?? 0) < 0 && player.vitals.energy < -(effect.energy ?? 0)) {
    return { ok: false, reason: 'You do not have the energy for that.' };
  }

  for (const item of effect.items ?? []) {
    if (item.amount < 0 && (player.inventory[item.resourceId] ?? 0) < -item.amount) {
      return { ok: false, reason: `Requires ${-item.amount} ${item.resourceId}.` };
    }
  }

  return { ok: true };
}
