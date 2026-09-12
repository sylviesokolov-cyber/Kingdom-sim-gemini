/**
 * Seeded, splittable pseudo-random number generator.
 *
 * This is the ONLY source of randomness permitted under src/engine/.
 * `Math.random()` in a simulation stage makes the whole day irreproducible,
 * which breaks both tests and bug reports.
 *
 * Forking by domain matters: `rng.fork('market')` means adding a new random
 * call inside the event stage cannot shift the market rolls. Without that,
 * every new feature silently invalidates every existing test.
 */

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Uniform float in [min, max). */
  float(min: number, max: number): number;
  /** True with probability p. */
  chance(p: number): boolean;
  /** Uniformly pick one element. Throws on an empty array. */
  pick<T>(items: readonly T[]): T;
  /** Pick one element weighted by `weightOf`. Throws if total weight <= 0. */
  weighted<T>(items: readonly T[], weightOf: (item: T) => number): T;
  /** A new independent generator, deterministically derived from this one. */
  fork(domain: string): Rng;
}

/** Convert a string to a 32-bit seed via FNV-1a. */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * mulberry32 — small, fast, and statistically adequate for game simulation.
 * Not cryptographically secure, and must never be used as if it were.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: number | string): Rng {
  const numericSeed = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  const next = mulberry32(numericSeed);

  const rng: Rng = {
    next,

    int(min: number, max: number): number {
      if (max < min) throw new RangeError(`rng.int: max (${max}) < min (${min})`);
      return min + Math.floor(next() * (max - min + 1));
    },

    float(min: number, max: number): number {
      return min + next() * (max - min);
    },

    chance(p: number): boolean {
      return next() < p;
    },

    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new RangeError('rng.pick: empty array');
      return items[Math.floor(next() * items.length)] as T;
    },

    weighted<T>(items: readonly T[], weightOf: (item: T) => number): T {
      if (items.length === 0) throw new RangeError('rng.weighted: empty array');
      let total = 0;
      for (const item of items) {
        const w = weightOf(item);
        if (w > 0) total += w;
      }
      if (total <= 0) throw new RangeError('rng.weighted: total weight must be > 0');

      let roll = next() * total;
      for (const item of items) {
        const w = weightOf(item);
        if (w <= 0) continue;
        roll -= w;
        if (roll < 0) return item;
      }
      // Unreachable except for floating-point drift on the final element.
      return items[items.length - 1] as T;
    },

    fork(domain: string): Rng {
      return createRng((numericSeed ^ hashString(domain)) >>> 0);
    },
  };

  return rng;
}

/**
 * Derive a per-day generator from a playthrough seed. Because the day number
 * is part of the derivation, replaying day 47 always produces day 47.
 */
export function createDayRng(seed: number, day: number): Rng {
  return createRng(`${seed}:day:${day}`);
}
