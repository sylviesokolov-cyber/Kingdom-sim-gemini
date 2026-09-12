/**
 * Core scalar types shared across every domain.
 * This file must not import from anywhere else in the project.
 */

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type Phase = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export type Weather = 'Clear' | 'Overcast' | 'Rain' | 'Storm' | 'Drought' | 'Frost' | 'Snow';

export type Rarity = 'SSR' | 'SR' | 'R' | 'N';

/** The player's legal/social standing. Linear spine — see docs/systems/PROGRESSION.md. */
export type Estate = 'Outsider' | 'Peasant' | 'Villager' | 'Burgher' | 'Gentry' | 'Noble' | 'King';

/** Parallel career tracks. A player may hold rank in several at once. */
export type CareerTrack = 'clergy' | 'merchant' | 'martial' | 'court' | 'shadow' | 'scholar';

export type Attribute = 'might' | 'cunning' | 'authority' | 'piety' | 'charm';

export type FactionId =
  | 'crown'
  | 'nobility'
  | 'church'
  | 'military'
  | 'guilds'
  | 'commons'
  | 'refugees'
  | 'syndicate';

export type DistrictId =
  | 'crown_quarter'
  | 'cathedral_hill'
  | 'bourse'
  | 'garrison'
  | 'weaverlane'
  | 'goldfields'
  | 'springhead'
  | 'wharfs'
  | 'emberworks'
  | 'thornwood'
  | 'ashes'
  | 'catacombs';

export type ResourceCategory =
  | 'survival'
  | 'food'
  | 'medicine'
  | 'goods'
  | 'material'
  | 'military'
  | 'luxury'
  | 'illicit';

/** A signed change to a named numeric field, used by content data. */
export type Delta<K extends string> = Partial<Record<K, number>>;

export const SEASONS: readonly Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

export const PHASES: readonly Phase[] = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

export const ATTRIBUTES: readonly Attribute[] = [
  'might',
  'cunning',
  'authority',
  'piety',
  'charm',
] as const;

export const CAREER_TRACKS: readonly CareerTrack[] = [
  'clergy',
  'merchant',
  'martial',
  'court',
  'shadow',
  'scholar',
] as const;

export const FACTION_IDS: readonly FactionId[] = [
  'crown',
  'nobility',
  'church',
  'military',
  'guilds',
  'commons',
  'refugees',
  'syndicate',
] as const;

/** Days in one season, and therefore 4x that in a year. */
export const DAYS_PER_SEASON = 30;
export const DAYS_PER_YEAR = DAYS_PER_SEASON * 4;
