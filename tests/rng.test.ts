import { describe, expect, it } from 'vitest';
import { createDayRng, createRng } from '../src/engine/rng';

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = Array.from({ length: 50 }, () => a.next());
    const seqB = Array.from({ length: 50 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it('stays within [0, 1)', () => {
    const rng = createRng('bounds');
    for (let i = 0; i < 10000; i += 1) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() is inclusive on both ends and never exceeds them', () => {
    const rng = createRng('ints');
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i += 1) {
      const v = rng.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
      seen.add(v);
    }
    expect(seen).toEqual(new Set([3, 4, 5, 6, 7]));
  });

  it('forks are independent of one another', () => {
    const rng = createRng(999);
    const market = rng.fork('market');
    const events = rng.fork('events');
    expect(market.next()).not.toBe(events.next());
  });

  it('forking by domain is stable regardless of parent consumption', () => {
    // This is the property that keeps tests from breaking when a new random
    // call is added to an unrelated stage.
    const a = createRng(4242).fork('market').next();
    const parent = createRng(4242);
    parent.next();
    parent.next();
    const b = parent.fork('market').next();
    expect(a).toBe(b);
  });

  it('weighted() respects the weights', () => {
    const rng = createRng('weights');
    const items = [
      { id: 'common', w: 90 },
      { id: 'rare', w: 10 },
    ];
    let rare = 0;
    const trials = 20000;
    for (let i = 0; i < trials; i += 1) {
      if (rng.weighted(items, (x) => x.w).id === 'rare') rare += 1;
    }
    expect(rare / trials).toBeGreaterThan(0.08);
    expect(rare / trials).toBeLessThan(0.12);
  });

  it('weighted() ignores zero-weight entries', () => {
    const rng = createRng('zero');
    const items = [
      { id: 'never', w: 0 },
      { id: 'always', w: 1 },
    ];
    for (let i = 0; i < 200; i += 1) {
      expect(rng.weighted(items, (x) => x.w).id).toBe('always');
    }
  });

  it('throws rather than silently returning undefined on an empty pool', () => {
    const rng = createRng(1);
    expect(() => rng.pick([])).toThrow();
    expect(() => rng.weighted([], () => 1)).toThrow();
  });

  it('replays a specific day identically', () => {
    const first = Array.from({ length: 20 }, () => createDayRng(777, 47).next());
    const second = Array.from({ length: 20 }, () => createDayRng(777, 47).next());
    expect(first).toEqual(second);
    expect(createDayRng(777, 47).next()).not.toBe(createDayRng(777, 48).next());
  });
});
