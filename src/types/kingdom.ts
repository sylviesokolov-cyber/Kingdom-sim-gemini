import type { DistrictId, ResourceCategory, Season, Weather } from './core';

export interface KingdomStats {
  population: number;
  /** 0-100 aggregate welfare of the population. */
  welfare: number;
  publicHealth: number;
  security: number;
  piety: number;
  literacy: number;
  treasury: number;
  unrest: number;
  prosperity: number;
}

export type KingdomStat = keyof KingdomStats;

export interface ResourceDefinition {
  id: string;
  name: string;
  category: ResourceCategory;
  icon: string;
  description: string;
  basePrice: number;
  unit: string;
  /**
   * Units produced per day at efficiency 1.0. Output belongs to the resource,
   * not to the overseer: several NPCs run two facilities, and tools and arms
   * share one foundry, so a per-NPC figure is ambiguous.
   */
  baseOutput: number;
  /** Maximum storable before overflow is wasted. */
  storageCapacity: number;
  /** Fraction lost per day in storage, 0-1. */
  spoilageRate: number;
  /**
   * Days of cover that counts as a healthy stock for THIS resource. Bread
   * spoils in days and can never hold eight days of cover, so scarcity bands
   * and prices are measured against this rather than one global number.
   */
  parCover: number;
  /** Units consumed per capita per day by the population. */
  perCapitaDemand: number;
  /** How sharply price responds to scarcity. Survival goods are high. */
  elasticity: number;
  /**
   * How the seasons treat this resource. Water is snowmelt off an aqueduct,
   * not a crop, so it must not share the harvest curve.
   */
  seasonProfile: 'crop' | 'water' | 'harvest' | 'processed' | 'industry';
  /** Resource ids required to produce this one, with quantities. */
  inputs?: { resourceId: string; amount: number }[];
  sourceFacility: string;
}

export type SupplyBand =
  | 'Critically Scarce'
  | 'Scarce'
  | 'Normal'
  | 'Abundant'
  | 'Surplus';

export type Trend = 'up' | 'down' | 'steady';

export interface MarketState {
  resourceId: string;
  currentPrice: number;
  /** Previous day's price, for the trend arrow. */
  previousPrice: number;
  trend: Trend;
  /** Units currently in kingdom storage. */
  stored: number;
  /** Units produced on the most recent day. */
  lastProduced: number;
  /** Units consumed on the most recent day. */
  lastConsumed: number;
  /** stored / dailyDemand — the honest measure of scarcity. */
  daysOfCover: number;
  supplyBand: SupplyBand;
}

export interface FacilityState {
  id: string;
  name: string;
  district: DistrictId;
  /** NPC id who governs this facility. */
  overseerNpcId: string;
  resourceId: string;
  /** Development level 0-5, raised by kingdom investment. */
  level: number;
  /** Today's multiplier from overseer condition, weather and investment. */
  efficiency: number;
}

export interface DistrictState {
  id: DistrictId;
  name: string;
  description: string;
  /** 0-5 infrastructure level. */
  development: number;
  population: number;
  /** 0-100. Local unrest can exceed kingdom unrest. */
  unrest: number;
  unlocked: boolean;
}

export interface WorldClock {
  day: number;
  season: Season;
  phase: import('./core').Phase;
  weather: Weather;
  year: number;
}
