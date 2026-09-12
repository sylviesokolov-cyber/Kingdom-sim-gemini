import type {
  BondTier,
  Mood,
  NpcDefinition,
  NpcMemory,
  NpcState,
  PerkDefinition,
  Relationship,
} from '../../types';
import { NPCS_BY_ID } from '../../content/npcs';
import { BOND_PERKS } from '../../content/bonds/perks';

export const TIER_ORDER: BondTier[] = [
  'Stranger',
  'Acquainted',
  'Warm',
  'Close',
  'Devoted',
  'Sworn',
];

interface TierGate {
  tier: BondTier;
  minAffection: number;
  minTrust: number;
}

const TIER_GATES: TierGate[] = [
  { tier: 'Stranger', minAffection: 0, minTrust: 0 },
  { tier: 'Acquainted', minAffection: 20, minTrust: 15 },
  { tier: 'Warm', minAffection: 40, minTrust: 35 },
  { tier: 'Close', minAffection: 60, minTrust: 50 },
  { tier: 'Devoted', minAffection: 75, minTrust: 65 },
  { tier: 'Sworn', minAffection: 90, minTrust: 80 },
];

/**
 * Affection alone never promotes a tier — trust gates every step past Warm.
 * A companion can adore the player and still refuse him the granary keys.
 */
export function bondTier(rel: Relationship): BondTier {
  let result: BondTier = 'Stranger';
  for (const gate of TIER_GATES) {
    if (rel.affection >= gate.minAffection && rel.trust >= gate.minTrust) {
      result = gate.tier;
    }
  }
  return result;
}

export function tierIndex(tier: BondTier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * Resonance raises the affection ceiling. Without it a companion caps at
 * Devoted, so Sworn requires either gacha duplicates or her full questline.
 */
export function affectionCap(rel: Relationship, questlineComplete: boolean): number {
  if (questlineComplete) return 100;
  if (rel.resonance >= 3) return 100;
  if (rel.resonance >= 2) return 89;
  if (rel.resonance >= 1) return 84;
  return 74;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Mood is derived, never stored. A companion at Devoted affection but high
 * jealousy greets the player coldly — the numbers say she loves him, the
 * scene says she is furious, and both are true.
 */
export function deriveMood(npc: NpcState): Mood {
  const { condition, relationship: rel } = npc;

  if (condition.status === 'Critical' || condition.status === 'Sick' || condition.status === 'Injured') {
    return 'Worried';
  }
  if (condition.status === 'Fatigued' || condition.energy < 30) return 'Tired';

  if (rel.jealousy >= 60) return 'Jealous';
  if (rel.resentment >= 55) return 'Cold';
  if (rel.resentment >= 30) return 'Hurt';

  const recentBetrayal = npc.memories
    .slice(-6)
    .some((m) => m.kind === 'betrayal' || m.kind === 'promise_broken');
  if (recentBetrayal && rel.trust < 45) return 'Hurt';

  if (rel.affection >= 80 && rel.trust >= 65) return 'Elated';
  if (rel.affection >= 45) return 'Warm';
  return 'Content';
}

/** Pick the dialogue variant for a topic, falling back to the default line. */
export function selectDialogue(
  def: NpcDefinition,
  topic: 'work' | 'personal' | 'rumor' | 'plea',
  mood: Mood,
): string {
  const set = def.dialogue[topic];
  if (!set) return def.dialogue.personal.default;
  return set.byMood?.[mood] ?? set.default;
}

export type InteractionKind = 'talk' | 'gift' | 'assist' | 'confide' | 'episode';

export interface InteractionInput {
  npc: NpcState;
  def: NpcDefinition;
  kind: InteractionKind;
  /** Resource id, for gifts. */
  itemId?: string;
  /** How many times the player has already talked to her today. */
  talksToday?: number;
  day: number;
  /** The player's charm, which scales affection gains. */
  charm: number;
  questlineComplete?: boolean;
}

export interface InteractionResult {
  npc: NpcState;
  /** Deltas actually applied, for the UI to float. */
  affectionGain: number;
  trustGain: number;
  message: string;
  /** True when the gain was reduced by the daily talk limit. */
  diminished: boolean;
}

export function applyInteraction(input: InteractionInput): InteractionResult {
  const { npc, def, kind, itemId, day, charm } = input;
  const rel = npc.relationship;
  const cap = affectionCap(rel, input.questlineComplete ?? false);

  // Charm scales gains but never trivialises them.
  const charmScale = 1 + Math.min(0.5, charm / 60);

  let affection = 0;
  let trust = 0;
  let resentment = 0;
  let desire = 0;
  let message = '';
  let diminished = false;
  let memory: NpcMemory | undefined;

  switch (kind) {
    case 'talk': {
      const talks = input.talksToday ?? 0;
      // Attention is welcome; pestering is not.
      const falloff = talks >= 3 ? 0.25 : talks >= 2 ? 0.5 : talks >= 1 ? 0.75 : 1;
      diminished = falloff < 1;
      affection = 2 * falloff * charmScale;
      trust = 0.5 * falloff;
      message = diminished ? `${def.name} has heard enough of you today.` : `${def.name} warms to you.`;
      break;
    }

    case 'gift': {
      const favorite = itemId ? def.favoriteGifts.includes(itemId) : false;
      const hated = itemId ? def.hatedGifts.includes(itemId) : false;
      if (hated) {
        affection = -6;
        resentment = 4;
        message = `${def.name} sets it down without looking at it.`;
        memory = { day, kind: 'neglect', summary: 'Gave her something she despises.', weight: 20 };
      } else if (favorite) {
        affection = 18 * charmScale;
        trust = 3;
        desire = 3;
        message = `${def.name} is delighted.`;
        memory = { day, kind: 'gift', summary: 'Gave her something she loves.', weight: 25 };
      } else {
        affection = 8 * charmScale;
        trust = 1;
        message = `${def.name} accepts the gift.`;
        memory = { day, kind: 'gift', summary: 'Gave her a gift.', weight: 10 };
      }
      break;
    }

    case 'assist': {
      // Working beside her is the strongest trust builder in the game.
      affection = 6 * charmScale;
      trust = 4;
      message = `You work the shift beside ${def.name}.`;
      memory = { day, kind: 'kindness', summary: 'Worked her shift with her.', weight: 30 };
      break;
    }

    case 'confide': {
      affection = 3 * charmScale;
      trust = 6;
      desire = 2;
      message = `${def.name} listens, and does not interrupt.`;
      memory = { day, kind: 'kindness', summary: 'Told her something true.', weight: 35 };
      break;
    }

    case 'episode': {
      // Episode effects come from content; this only records the memory.
      message = `Something between you has changed.`;
      memory = { day, kind: 'kindness', summary: 'Shared a bond episode.', weight: 50 };
      break;
    }
  }

  const nextRel: Relationship = {
    ...rel,
    affection: clamp(rel.affection + affection, 0, cap),
    trust: clamp(rel.trust + trust),
    desire: clamp(rel.desire + desire),
    resentment: clamp(rel.resentment + resentment),
  };

  const nextNpc: NpcState = {
    ...npc,
    relationship: nextRel,
    memories: memory ? [...npc.memories, memory].slice(-40) : npc.memories,
  };

  return {
    npc: nextNpc,
    affectionGain: nextRel.affection - rel.affection,
    trustGain: nextRel.trust - rel.trust,
    message,
    diminished,
  };
}

/**
 * Advancing a bond makes her rivals jealous. This is what stops a harem from
 * being free — if a player maxes every bond without ever hitting a
 * confrontation, this function is tuned wrong.
 */
export function applyJealousy(
  npcs: Record<string, NpcState>,
  bondedNpcId: string,
  magnitude: number,
): Record<string, NpcState> {
  const next = { ...npcs };

  for (const [id, state] of Object.entries(npcs)) {
    if (id === bondedNpcId) continue;
    const def = NPCS_BY_ID[id];
    if (!def) continue;

    const opinion = def.opinions.find((o) => o.npcId === bondedNpcId);
    if (!opinion) continue;

    // Only someone who already cares can be made jealous.
    const investment = state.relationship.affection / 100;
    let delta = 0;
    if (opinion.opinion === 'nemesis') delta = magnitude * 1.5 * investment;
    else if (opinion.opinion === 'rival') delta = magnitude * investment;
    if (delta <= 0) continue;

    next[id] = {
      ...state,
      relationship: {
        ...state.relationship,
        jealousy: clamp(state.relationship.jealousy + delta),
      },
    };
  }

  return next;
}

/**
 * Daily drift: neglect cools affection, jealousy fades slowly, memories lose
 * weight. The world moves without the player, including how people feel.
 */
export function dailyRelationshipDrift(
  npcs: Record<string, NpcState>,
  interactedToday: string[],
): Record<string, NpcState> {
  const next: Record<string, NpcState> = {};

  for (const [id, state] of Object.entries(npcs)) {
    const rel = state.relationship;
    const neglected = !interactedToday.includes(id);

    // Only established relationships can decay — a stranger has nothing to lose.
    const decay = neglected && rel.affection > 25 ? 0.5 : 0;

    next[id] = {
      ...state,
      relationship: {
        ...rel,
        affection: clamp(rel.affection - decay),
        jealousy: clamp(rel.jealousy - 1.5),
        resentment: clamp(rel.resentment - 0.25),
      },
      memories: state.memories
        .map((m) => ({ ...m, weight: Math.max(0, m.weight - 0.5) }))
        .filter((m) => m.weight > 0),
      efficiencyModifier: 1,
    };
  }

  return next;
}

/**
 * Resolve which perks are currently active.
 *
 * Every engine stage that can be modified by a perk MUST read from here,
 * never from a hardcoded companion check — that rule is what keeps perks
 * from becoming flavor text.
 */
export function activePerks(
  npcs: Record<string, NpcState>,
  questlinesComplete: string[] = [],
): PerkDefinition[] {
  const result: PerkDefinition[] = [];

  for (const perk of BOND_PERKS) {
    if (!perk.npcId || !perk.tier) {
      result.push(perk);
      continue;
    }

    const state = npcs[perk.npcId];
    if (!state) continue;

    // Jealousy suspends a companion's perks. She is still fond of you; she is
    // simply not doing you any favors this week.
    if (state.relationship.jealousy >= 60) continue;

    const tier = bondTier(state.relationship);
    const complete = questlinesComplete.includes(perk.npcId);
    const cap = affectionCap(state.relationship, complete);
    if (state.relationship.affection > cap) continue;

    if (tierIndex(tier) >= tierIndex(perk.tier)) {
      result.push(perk);
    }
  }

  return result;
}

/** Sum the multiplier perks of one kind, optionally scoped to a target. */
export function perkMultiplier(
  perks: PerkDefinition[],
  kind: PerkDefinition['kind'],
  target?: string,
): number {
  let best = 1;
  for (const perk of perks) {
    if (perk.kind !== kind) continue;
    if (perk.target && target && perk.target !== target) continue;
    if (perk.target && !target) continue;

    if (kind === 'market_buy_multiplier' || kind === 'bounty_rate') {
      // Lower is better for the player.
      best = Math.min(best, perk.value);
    } else if (kind === 'market_sell_multiplier') {
      best = Math.max(best, perk.value);
    } else {
      // Additive bonuses, e.g. production_multiplier 0.2 -> 1.2x
      best += perk.value;
    }
  }
  return best;
}

export function hasPerkUnlock(perks: PerkDefinition[], target: string): boolean {
  return perks.some((p) => p.kind === 'unlock' && p.target === target);
}
