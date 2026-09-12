import type { Attribute, CareerTrack, Estate, FactionId } from './core';
import type { BondTier, NpcStatus } from './npc';
import type { KingdomStat } from './kingdom';
import type { FactionImpact } from './faction';

/* ------------------------------------------------------------------ *
 * Prerequisites — the single gating vocabulary for all content.
 * Content declares requirements; the engine evaluates them. Content
 * must never check state imperatively.
 * ------------------------------------------------------------------ */

export interface Prerequisite {
  day?: { min?: number; max?: number };
  estate?: Estate;
  career?: { track: CareerTrack; minRank: number }[];
  attribute?: Partial<Record<Attribute, number>>;
  faction?: { id: FactionId; minOpinion?: number; minPower?: number }[];
  bond?: { npcId: string; minTier?: BondTier; minTrust?: number }[];
  kingdom?: Partial<Record<KingdomStat, { min?: number; max?: number }>>;
  inventory?: { resourceId: string; min: number }[];
  copper?: number;
  flags?: { all?: string[]; any?: string[]; none?: string[] };
  completedQuests?: string[];
}

/** Why a prerequisite failed, so the quest log can explain itself. */
export interface PrereqFailure {
  kind: string;
  requirement: string;
  actual: string;
}

export interface PrereqResult {
  met: boolean;
  failures: PrereqFailure[];
}

/* ------------------------------------------------------------------ *
 * Effects — the single vocabulary for changing state.
 * ------------------------------------------------------------------ */

export interface Effect {
  copper?: number;
  fateCrystals?: number;
  guildMarks?: number;
  bondHearts?: number;
  energy?: number;
  health?: number;
  hunger?: number;
  xp?: number;
  standingPoints?: number;
  bounty?: number;
  attributes?: Partial<Record<Attribute, number>>;
  careerXp?: { track: CareerTrack; amount: number }[];
  kingdom?: Partial<Record<KingdomStat, number>>;
  factions?: FactionImpact[];
  items?: { resourceId: string; amount: number }[];
  npc?: {
    npcId: string;
    affection?: number;
    trust?: number;
    respect?: number;
    desire?: number;
    resentment?: number;
    health?: number;
    status?: NpcStatus;
  }[];
  setFlags?: string[];
  clearFlags?: string[];
  grantPerks?: string[];
  /** Schedule an event to fire on a future day — the delayed-consequence tool. */
  scheduled?: { inDays: number; eventId: string }[];
}

/* ------------------------------------------------------------------ *
 * Jobs
 * ------------------------------------------------------------------ */

export interface JobDefinition {
  id: string;
  title: string;
  description: string;
  /** Which career track this work advances, if any. */
  track?: CareerTrack;
  facility: string;
  supervisorNpcId?: string;
  energyCost: number;
  requires: Prerequisite;
  rewards: Effect;
  /** Affection gained with the supervising NPC. */
  supervisorAffection?: number;
}

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

export type EventTone = 'warning' | 'celebration' | 'intrigue' | 'disaster' | 'romance' | 'political';

export interface EventChoice {
  id: string;
  text: string;
  /** Shown to the player before choosing. Be honest about the cost. */
  consequenceHint?: string;
  requires?: Prerequisite;
  outcome: string;
  effects: Effect;
}

export interface EventDefinition {
  id: string;
  title: string;
  description: string;
  tone: EventTone;
  speakerNpcId?: string;
  speakerName?: string;
  illustrationUrl?: string;
  requires?: Prerequisite;
  /** Relative selection weight within the eligible pool. */
  weight: number;
  /** Can this event fire more than once per playthrough? */
  repeatable: boolean;
  choices: EventChoice[];
}

/* ------------------------------------------------------------------ *
 * Live events — the limited-time campaigns advertised on Home
 * ------------------------------------------------------------------ */

/**
 * A limited-time campaign shown on the Home screen's event banner.
 *
 * This is deliberately *not* `EventDefinition`: that is the narrative event
 * engine's unit (a thing that fires, with choices and effects). A live event
 * is the storefront for a campaign that is already implemented somewhere —
 * a rate-up banner on Summon, a festival on the Bourse — so its only job is
 * to advertise a real destination inside a real day window. It carries no
 * effects of its own, because a banner that granted rewards on tap would be
 * a reward button with a picture, not an event.
 */
export interface LiveEventDefinition {
  id: string;
  name: string;
  /** One line of diegetic copy — what is happening, in the world's voice. */
  blurb: string;
  /** Short badge, e.g. `SSR Rate Up`. Rendered as the card's flag. */
  tag: string;
  tone: 'gacha' | 'market' | 'realm' | 'bond';
  /** Inclusive day window. The event is live when startsOnDay <= day <= endsOnDay. */
  startsOnDay: number;
  endsOnDay: number;
  /** The screen this banner opens. Must be a screen that actually exists. */
  screen: 'summon' | 'market' | 'kingdom' | 'characters' | 'work' | 'council';
}

/* ------------------------------------------------------------------ *
 * Bond episodes — VN scenes
 * ------------------------------------------------------------------ */

export type Emotion =
  | 'neutral'
  | 'happy'
  | 'blush'
  | 'serious'
  | 'tender'
  | 'thoughtful'
  | 'determined'
  | 'hurt'
  | 'sly';

export interface EpisodeChoice {
  id: string;
  text: string;
  response: string;
  requires?: Prerequisite;
  effects: Effect;
  reactionEmotion?: Emotion;
}

export interface EpisodeBeat {
  id: string;
  /** Speaker name, or omitted for narration. */
  speaker?: string;
  narration?: boolean;
  text: string;
  emotion?: Emotion;
  backgroundUrl?: string;
  choices?: EpisodeChoice[];
}

export interface BondEpisode {
  id: string;
  npcId: string;
  /** 1-5, following introduction -> trust -> conflict -> revelation -> choice. */
  episodeNumber: number;
  title: string;
  synopsis: string;
  location: string;
  backgroundUrl?: string;
  requires: Prerequisite;
  /** Minimum affection and trust, checked alongside `requires`. */
  minAffection: number;
  minTrust: number;
  rewards: Effect;
  /** Gallery entry unlocked on completion. */
  galleryId?: string;
  beats: EpisodeBeat[];
}

/* ------------------------------------------------------------------ *
 * Bond perks — the systemic payoff of a relationship
 * ------------------------------------------------------------------ */

export type PerkKind =
  | 'market_buy_multiplier'
  | 'market_sell_multiplier'
  | 'production_multiplier'
  | 'bounty_rate'
  | 'crisis_severity'
  | 'faction_daily'
  | 'illness_recovery'
  | 'energy_bonus'
  | 'attribute_bonus'
  | 'unlock';

export interface PerkDefinition {
  id: string;
  name: string;
  description: string;
  /** Companion this perk comes from, if it is a bond perk. */
  npcId?: string;
  /** Bond tier at which it unlocks. */
  tier?: BondTier;
  kind: PerkKind;
  /** Numeric magnitude; meaning depends on `kind`. */
  value: number;
  /** Resource, faction, or feature this perk targets, if scoped. */
  target?: string;
}
