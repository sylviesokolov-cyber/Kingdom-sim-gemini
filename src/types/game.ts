import type { FactionId } from './core';
import type { PlayerState } from './player';
import type { NpcState } from './npc';
import type { KingdomStats, MarketState, WorldClock, DistrictState, FacilityState } from './kingdom';
import type { FactionState } from './faction';
import type { GachaState } from './gacha';

/** A scheduled consequence waiting to land on a future day. */
export interface ScheduledEvent {
  eventId: string;
  fireOnDay: number;
  /** Why it was scheduled — useful when debugging a surprising event. */
  source: string;
}

/** One line of the day-advance digest: what changed and why. */
export interface DigestEntry {
  /** Which pipeline stage produced this. */
  stage: string;
  /** Player-facing sentence. Diegetic voice — see CONTENT_GUIDE. */
  message: string;
  tone: 'good' | 'bad' | 'neutral';
  /** Optional numeric delta for UI arrows. */
  delta?: number;
}

/**
 * The complete game state. Everything persisted lives here; nothing else does.
 * This is the single source of truth the store wraps and the engine transforms.
 */
export interface GameState {
  /** Save format version — see state/save. */
  version: number;
  /** RNG seed. Fixed per playthrough so any day is reproducible. */
  seed: number;

  clock: WorldClock;
  player: PlayerState;
  kingdom: KingdomStats;

  /** Runtime NPC state keyed by npc id. Definitions live in content/. */
  npcs: Record<string, NpcState>;
  factions: Record<FactionId, FactionState>;
  districts: Record<string, DistrictState>;
  /** Facility levels and today's resolved efficiency, keyed by facility id. */
  facilities: Record<string, FacilityState>;
  market: Record<string, MarketState>;
  gacha: GachaState;

  /** Npc id currently shown on the Home screen. */
  activeCompanionId: string;
  /** Npc ids in the player's retinue, in display order. */
  retinue: string[];

  /** Ids of events already fired, for non-repeatable gating. */
  firedEvents: string[];
  scheduled: ScheduledEvent[];

  /** The most recent day-advance digest, shown after Next Day. */
  lastDigest: DigestEntry[];
  /** Completed quest ids. */
  completedQuests: string[];
  /** Unlocked gallery entry ids. */
  gallery: string[];
}
