import type { Rarity } from './core';

export type BannerType = 'standard' | 'rate_up' | 'friendship' | 'royal' | 'limited';

export type PullItemKind = 'companion' | 'outfit' | 'charter' | 'gift' | 'currency';

export interface PoolEntry {
  id: string;
  kind: PullItemKind;
  rarity: Rarity;
  name: string;
  /** Relative weight within its rarity tier. */
  weight: number;
  imageUrl?: string;
}

export interface BannerDefinition {
  id: string;
  name: string;
  type: BannerType;
  description: string;
  artUrl?: string;
  /** Featured SSR id for rate-up banners. 50/50 with guarantee. */
  featuredId?: string;
  /** Featured SR ids, always in the pool at raised weight. */
  featuredSrIds?: string[];
  costPerPull: number;
  costPerTen: number;
  pool: PoolEntry[];
  /** In-game day the banner closes. Undefined means permanent. */
  endsOnDay?: number;
}

/**
 * Pity is tracked per banner *type*, not per banner, so a banner ending never
 * destroys an in-progress counter.
 */
export interface PityState {
  /** Pulls since the last SSR. */
  sinceSsr: number;
  /** Pulls since the last SR, for the 10-pull floor. */
  sinceSr: number;
  /** True when the next SSR is guaranteed to be the featured companion. */
  guaranteedFeatured: boolean;
  totalPulls: number;
}

export interface PullResult {
  entry: PoolEntry;
  /** Was this result forced by pity rather than rolled? */
  fromPity: boolean;
  /** Was this the guaranteed-featured redemption of a lost 50/50? */
  fromGuarantee: boolean;
  /** True when the player already owned this companion — becomes Resonance. */
  duplicate: boolean;
}

export interface GachaState {
  /** Pity per banner type. */
  pity: Record<BannerType, PityState>;
  /** Ids of everything ever pulled, for duplicate detection. */
  obtained: string[];
  /** Total pulls, for achievements. */
  lifetimePulls: number;
}

export const SSR_BASE_RATE = 0.016;
export const SR_BASE_RATE = 0.085;
export const SOFT_PITY_START = 61;
export const SOFT_PITY_STEP = 0.06;
export const HARD_PITY = 80;
export const SR_FLOOR = 10;
