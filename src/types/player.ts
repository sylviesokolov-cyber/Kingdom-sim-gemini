import type { Attribute, CareerTrack, Estate, FactionId } from './core';

/** Career progress on one track. Rank 0 means "not on this track". */
export interface CareerState {
  track: CareerTrack;
  /** 0-5. Rank 0 = untracked, 5 = the track's apex. */
  rank: number;
  /** XP toward the next rank on this track. */
  xp: number;
  /** Ids of completed rank trials, so a trial is never repeated. */
  completedTrials: string[];
}

export interface PlayerVitals {
  energy: number;
  maxEnergy: number;
  /** 0-100. Falls with untreated hunger and illness; death at 0. */
  health: number;
  /** 0-100 where 100 is starving. Rises daily, falls when the player eats. */
  hunger: number;
}

export interface PlayerCurrencies {
  copper: number;
  /** Career shop currency, earned from career track progress. */
  guildMarks: number;
  /** Gacha currency. Earned only through play. */
  fateCrystals: number;
  /** Bond currency, spent on gifts, outfits and gallery unlocks. */
  bondHearts: number;
}

export type Inventory = Record<string, number>;

/**
 * Standing per faction, 0-100. This is what the factions think of the player
 * personally, and is distinct from a faction's own power.
 */
export type Standing = Record<FactionId, number>;

export interface PlayerState {
  name: string;
  /** Flavor title granted by estate and career, e.g. "Freeholder". */
  title: string;

  estate: Estate;
  /** Progress toward the next estate, earned from varied deeds. */
  standingPoints: number;

  level: number;
  xp: number;
  xpToNext: number;
  attributes: Record<Attribute, number>;

  vitals: PlayerVitals;
  currencies: PlayerCurrencies;
  inventory: Inventory;

  careers: Record<CareerTrack, CareerState>;
  standing: Standing;

  /** Outstanding criminal bounty. High values attract garrison attention. */
  bounty: number;

  /** Owned business ids; each produces and costs upkeep daily. */
  businesses: string[];
  /** Notable deeds performed, used for standing and for story gating. */
  deeds: string[];
  /** Ids of bond episodes the player has completed. */
  completedEpisodes: string[];
  /** Active perk ids from bonds, careers, and charters. */
  perks: string[];
  /** Narrative flags. Namespaced; see docs/systems/STORY.md. */
  flags: string[];
}
