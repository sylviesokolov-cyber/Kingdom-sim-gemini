import { describe, expect, it } from 'vitest';
import { BANNERS_BY_ID } from '../src/content/gacha';
import { HARD_PITY, SR_FLOOR, type PityState } from '../src/types';
import { pullCost, resolveMultiPull, resolvePull, ssrRateAt } from '../src/engine/gacha';
import { createRng } from '../src/engine/rng';

const freshPity = (): PityState => ({
  sinceSsr: 0,
  sinceSr: 0,
  guaranteedFeatured: false,
  totalPulls: 0,
});

const rateUp = BANNERS_BY_ID.fateful_encounters;
const standard = BANNERS_BY_ID.standard_call;

describe('pity', () => {
  it('uses the base rate before soft pity begins', () => {
    expect(ssrRateAt(0)).toBeCloseTo(0.016);
    expect(ssrRateAt(55)).toBeCloseTo(0.016);
  });

  it('ramps once soft pity starts', () => {
    expect(ssrRateAt(60)).toBeGreaterThan(ssrRateAt(55));
    expect(ssrRateAt(70)).toBeGreaterThan(ssrRateAt(60));
  });

  it('guarantees at hard pity', () => {
    expect(ssrRateAt(HARD_PITY - 1)).toBe(1);
  });

  it('never exceeds 80 pulls without an SSR', () => {
    const rng = createRng('hardpity');
    let pity = freshPity();
    let obtained: string[] = [];

    for (let run = 0; run < 300; run += 1) {
      const outcome = resolvePull({ banner: standard, pity, obtained, rng });
      pity = outcome.pity;
      obtained = outcome.obtained;
      expect(pity.sinceSsr).toBeLessThan(HARD_PITY);
    }
  });
});

describe('rates', () => {
  it('lands near the published SSR rate including pity over 100k pulls', () => {
    const rng = createRng('rates');
    let pity = freshPity();
    let obtained: string[] = [];
    let ssr = 0;
    const trials = 100_000;

    for (let i = 0; i < trials; i += 1) {
      const outcome = resolvePull({ banner: standard, pity, obtained, rng });
      if (outcome.result.entry.rarity === 'SSR') ssr += 1;
      pity = outcome.pity;
      obtained = outcome.obtained;
    }

    const observed = ssr / trials;
    // Base 1.6% plus pity lifts the effective rate to roughly 1.6-2.2%.
    expect(observed).toBeGreaterThan(0.014);
    expect(observed).toBeLessThan(0.030);
  });

  it('gives at least one SR or better in every block of ten', () => {
    const rng = createRng('srfloor');
    let pity = freshPity();
    let obtained: string[] = [];

    for (let block = 0; block < 2000; block += 1) {
      const outcome = resolveMultiPull({ banner: standard, pity, obtained, rng }, SR_FLOOR);
      const best = outcome.results.some(
        (r) => r.entry.rarity === 'SR' || r.entry.rarity === 'SSR',
      );
      expect(best, `block ${block} had no SR`).toBe(true);
      pity = outcome.pity;
      obtained = outcome.obtained;
    }
  });
});

describe('rate-up', () => {
  it('guarantees the featured companion after losing the 50/50', () => {
    const rng = createRng('fifty');
    let pity = freshPity();
    let obtained: string[] = [];
    let lostFiftyFifties = 0;
    let redemptions = 0;

    for (let i = 0; i < 60_000; i += 1) {
      const wasGuaranteed = pity.guaranteedFeatured;
      const outcome = resolvePull({ banner: rateUp, pity, obtained, rng });

      if (outcome.result.entry.rarity === 'SSR') {
        if (wasGuaranteed) {
          // A guaranteed pull must yield the featured companion.
          expect(outcome.result.entry.id).toBe(rateUp.featuredId);
          redemptions += 1;
        } else if (outcome.result.entry.id !== rateUp.featuredId) {
          lostFiftyFifties += 1;
        }
      }

      pity = outcome.pity;
      obtained = outcome.obtained;
    }

    expect(lostFiftyFifties).toBeGreaterThan(0);
    expect(redemptions).toBeGreaterThan(0);
  });

  it('carries pity across banners rather than resetting it', () => {
    const rng = createRng('carry');
    let pity = freshPity();
    let obtained: string[] = [];

    // Build up pity on the standard banner.
    for (let i = 0; i < 40; i += 1) {
      const outcome = resolvePull({ banner: standard, pity, obtained, rng });
      if (outcome.result.entry.rarity === 'SSR') break;
      pity = outcome.pity;
      obtained = outcome.obtained;
    }

    const carried = pity.sinceSsr;
    // Switching banners must not destroy the counter.
    const outcome = resolvePull({ banner: rateUp, pity, obtained, rng });
    expect(outcome.pity.sinceSsr === 0 || outcome.pity.sinceSsr === carried + 1).toBe(true);
  });
});

describe('cost and duplicates', () => {
  it('charges the x10 price for whole tens', () => {
    expect(pullCost(standard, 1)).toBe(standard.costPerPull);
    expect(pullCost(standard, 10)).toBe(standard.costPerTen);
    expect(pullCost(standard, 11)).toBe(standard.costPerTen + standard.costPerPull);
  });

  it('marks a repeat companion as a duplicate so it can become Resonance', () => {
    const rng = createRng('dupes');
    let pity = freshPity();
    let obtained: string[] = [];
    let sawDuplicate = false;

    for (let i = 0; i < 3000 && !sawDuplicate; i += 1) {
      const outcome = resolvePull({ banner: standard, pity, obtained, rng });
      if (outcome.result.entry.kind === 'companion' && outcome.result.duplicate) {
        sawDuplicate = true;
      }
      pity = outcome.pity;
      obtained = outcome.obtained;
    }

    expect(sawDuplicate).toBe(true);
  });

  it('is deterministic for a fixed seed', () => {
    const a = resolveMultiPull(
      { banner: standard, pity: freshPity(), obtained: [], rng: createRng(7) },
      10,
    );
    const b = resolveMultiPull(
      { banner: standard, pity: freshPity(), obtained: [], rng: createRng(7) },
      10,
    );
    expect(a.results.map((r) => r.entry.id)).toEqual(b.results.map((r) => r.entry.id));
  });
});
