import type { BannerDefinition, PityState, PoolEntry, PullResult, Rarity } from '../../types';
import {
  HARD_PITY,
  SOFT_PITY_START,
  SOFT_PITY_STEP,
  SR_BASE_RATE,
  SR_FLOOR,
  SSR_BASE_RATE,
} from '../../types';
import type { Rng } from '../rng';

/**
 * The effective SSR rate at a given pity count. Soft pity ramps from 61 and
 * hard pity guarantees at 80 — and the counter is always shown to the player.
 * No hidden state, and no fake near-misses in the reveal.
 */
export function ssrRateAt(sinceSsr: number): number {
  const pullNumber = sinceSsr + 1;
  if (pullNumber >= HARD_PITY) return 1;
  if (pullNumber < SOFT_PITY_START) return SSR_BASE_RATE;
  const steps = pullNumber - SOFT_PITY_START + 1;
  return Math.min(1, SSR_BASE_RATE + steps * SOFT_PITY_STEP);
}

function poolByRarity(banner: BannerDefinition, rarity: Rarity): PoolEntry[] {
  return banner.pool.filter((e) => e.rarity === rarity);
}

function pickFromRarity(banner: BannerDefinition, rarity: Rarity, rng: Rng): PoolEntry {
  const pool = poolByRarity(banner, rarity);
  if (pool.length === 0) {
    // Fall back one rarity down rather than throwing mid-pull.
    const order: Rarity[] = ['SSR', 'SR', 'R', 'N'];
    for (const fallback of order.slice(order.indexOf(rarity) + 1)) {
      const alt = poolByRarity(banner, fallback);
      if (alt.length > 0) return rng.weighted(alt, (e) => e.weight);
    }
    throw new Error(`Banner ${banner.id} has an empty pool`);
  }

  // Featured SRs appear at raised weight on rate-up banners.
  if (rarity === 'SR' && banner.featuredSrIds?.length) {
    return rng.weighted(pool, (e) => (banner.featuredSrIds!.includes(e.id) ? e.weight * 3 : e.weight));
  }

  return rng.weighted(pool, (e) => e.weight);
}

export interface PullContext {
  banner: BannerDefinition;
  pity: PityState;
  obtained: string[];
  rng: Rng;
}

export interface SinglePullOutcome {
  result: PullResult;
  pity: PityState;
  obtained: string[];
}

export function resolvePull(ctx: PullContext, forceSr = false): SinglePullOutcome {
  const { banner, rng } = ctx;
  let { sinceSsr, sinceSr, guaranteedFeatured, totalPulls } = ctx.pity;

  const ssrRate = ssrRateAt(sinceSsr);
  const hitSsrByPity = sinceSsr + 1 >= HARD_PITY;
  const hitSsr = hitSsrByPity || rng.chance(ssrRate);

  let entry: PoolEntry;
  let fromPity = false;
  let fromGuarantee = false;

  if (hitSsr) {
    fromPity = hitSsrByPity;

    if (banner.featuredId) {
      // 50/50, with the loss guaranteeing the featured companion next time.
      if (guaranteedFeatured) {
        const featured = banner.pool.find((e) => e.id === banner.featuredId);
        entry = featured ?? pickFromRarity(banner, 'SSR', rng);
        fromGuarantee = true;
        guaranteedFeatured = false;
      } else if (rng.chance(0.5)) {
        const featured = banner.pool.find((e) => e.id === banner.featuredId);
        entry = featured ?? pickFromRarity(banner, 'SSR', rng);
      } else {
        const offBanner = poolByRarity(banner, 'SSR').filter((e) => e.id !== banner.featuredId);
        entry =
          offBanner.length > 0
            ? rng.weighted(offBanner, (e) => e.weight)
            : pickFromRarity(banner, 'SSR', rng);
        guaranteedFeatured = true;
      }
    } else {
      entry = pickFromRarity(banner, 'SSR', rng);
    }

    sinceSsr = 0;
    sinceSr = 0;
  } else {
    const hitSrByFloor = forceSr || sinceSr + 1 >= SR_FLOOR;
    const hitSr = hitSrByFloor || rng.chance(SR_BASE_RATE);

    if (hitSr) {
      entry = pickFromRarity(banner, 'SR', rng);
      fromPity = hitSrByFloor && !forceSr;
      sinceSr = 0;
    } else {
      entry = pickFromRarity(banner, 'R', rng);
      sinceSr += 1;
    }
    sinceSsr += 1;
  }

  totalPulls += 1;

  // Only companions can be duplicates — everything else stacks.
  const duplicate = entry.kind === 'companion' && ctx.obtained.includes(entry.id);
  const obtained = duplicate ? ctx.obtained : [...ctx.obtained, entry.id];

  return {
    result: { entry, fromPity, fromGuarantee, duplicate },
    pity: { sinceSsr, sinceSr, guaranteedFeatured, totalPulls },
    obtained,
  };
}

export interface MultiPullOutcome {
  results: PullResult[];
  pity: PityState;
  obtained: string[];
}

/**
 * A multi-pull. The SR floor applies to each block of ten: if nine pulls have
 * produced nothing at SR or above, the tenth is forced.
 */
export function resolveMultiPull(ctx: PullContext, count: number): MultiPullOutcome {
  let pity = ctx.pity;
  let obtained = ctx.obtained;
  const results: PullResult[] = [];

  for (let i = 0; i < count; i += 1) {
    const isBlockEnd = (i + 1) % SR_FLOOR === 0;
    const blockStart = i - (i % SR_FLOOR);
    const blockHadSrOrBetter = results
      .slice(blockStart, i)
      .some((r) => r.entry.rarity === 'SR' || r.entry.rarity === 'SSR');

    const forceSr = isBlockEnd && !blockHadSrOrBetter;

    const outcome = resolvePull({ banner: ctx.banner, pity, obtained, rng: ctx.rng }, forceSr);
    results.push(outcome.result);
    pity = outcome.pity;
    obtained = outcome.obtained;
  }

  return { results, pity, obtained };
}

/** Crystals owed for a pull count on a banner, using the x10 price when whole. */
export function pullCost(banner: BannerDefinition, count: number): number {
  const tens = Math.floor(count / SR_FLOOR);
  const singles = count % SR_FLOOR;
  return tens * banner.costPerTen + singles * banner.costPerPull;
}

/** Pulls remaining until the SSR guarantee, for the always-visible counter. */
export function pullsUntilGuarantee(pity: PityState): number {
  return Math.max(0, HARD_PITY - pity.sinceSsr);
}
