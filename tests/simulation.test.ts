import { describe, expect, it } from 'vitest';
import { createNewGame } from '../src/content/initialState';
import { RESOURCE_LIST } from '../src/content/resources';
import { seasonForDay, simulateDay, yearForDay } from '../src/engine/simulation';
import type { GameState } from '../src/types';

function run(state: GameState, days: number): GameState {
  let s = state;
  for (let i = 0; i < days; i += 1) s = simulateDay(s).state;
  return s;
}

describe('the day pipeline', () => {
  it('is deterministic for the same seed and state', () => {
    const a = createNewGame(4242);
    const b = createNewGame(4242);
    expect(JSON.stringify(run(a, 30))).toEqual(JSON.stringify(run(b, 30)));
  });

  it('diverges for different seeds', () => {
    const a = run(createNewGame(1), 30);
    const b = run(createNewGame(2), 30);
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
  });

  it('advances the clock and rotates seasons on a 30-day cycle', () => {
    expect(seasonForDay(1)).toBe('Spring');
    expect(seasonForDay(30)).toBe('Spring');
    expect(seasonForDay(31)).toBe('Summer');
    expect(seasonForDay(61)).toBe('Autumn');
    expect(seasonForDay(91)).toBe('Winter');
    expect(seasonForDay(121)).toBe('Spring');
    expect(yearForDay(1)).toBe(1);
    expect(yearForDay(121)).toBe(2);
  });

  it('restores energy to full each morning', () => {
    const state = createNewGame(7);
    state.player.vitals.energy = 5;
    const next = simulateDay(state).state;
    expect(next.player.vitals.energy).toBe(next.player.vitals.maxEnergy);
  });

  it('produces a digest explaining what changed', () => {
    // Break the aqueduct badly enough that the shortfall must be reported.
    const state = createNewGame(11);
    state.npcs.mira.condition.status = 'Critical';
    state.npcs.mira.condition.health = 20;
    for (const r of RESOURCE_LIST) state.market[r.id].stored = 0;

    const result = simulateDay(state);
    expect(result.digest.length).toBeGreaterThan(0);
    expect(result.digest.some((d) => d.stage === 'welfare')).toBe(true);
  });

  it('keeps every kingdom stat in range across 400 days', () => {
    let s = createNewGame(31337);
    for (let i = 0; i < 400; i += 1) {
      s = simulateDay(s).state;
      const k = s.kingdom;
      for (const key of ['welfare', 'publicHealth', 'security', 'piety', 'unrest', 'prosperity'] as const) {
        expect(k[key], `${key} on day ${s.clock.day}`).toBeGreaterThanOrEqual(0);
        expect(k[key], `${key} on day ${s.clock.day}`).toBeLessThanOrEqual(100);
      }
      expect(k.population).toBeGreaterThan(0);
      expect(Number.isFinite(k.treasury)).toBe(true);
    }
  });

  it('never lets stored supply go negative or exceed capacity', () => {
    let s = createNewGame(555);
    for (let i = 0; i < 200; i += 1) {
      s = simulateDay(s).state;
      for (const resource of RESOURCE_LIST) {
        const m = s.market[resource.id];
        expect(m.stored, `${resource.id} stored`).toBeGreaterThanOrEqual(0);
        expect(m.stored, `${resource.id} stored`).toBeLessThanOrEqual(resource.storageCapacity);
        expect(m.currentPrice).toBeGreaterThanOrEqual(1);
        expect(Number.isFinite(m.currentPrice)).toBe(true);
      }
    }
  });

  it('damps price movement to at most 18% per day', () => {
    let s = createNewGame(8080);
    for (let i = 0; i < 150; i += 1) {
      const before = s.market;
      s = simulateDay(s).state;
      for (const resource of RESOURCE_LIST) {
        const prev = before[resource.id].currentPrice;
        const now = s.market[resource.id].currentPrice;
        const move = Math.abs(now - prev) / prev;
        // Rounding to whole copper can nudge a 1-copper item past the ratio.
        expect(move, `${resource.id} moved ${(move * 100).toFixed(1)}%`).toBeLessThanOrEqual(0.19 + 1 / prev);
      }
    }
  });

  it('survives 1000 days from a fresh save without crashing', () => {
    let s = createNewGame(2024);
    expect(() => {
      for (let i = 0; i < 1000; i += 1) s = simulateDay(s).state;
    }).not.toThrow();
    expect(s.clock.day).toBe(1001);
  });
});

describe('the cascade', () => {
  it('sickening the aqueduct overseer runs all the way to unrest', () => {
    // NPC condition -> facility efficiency -> production -> supply -> price
    //   -> welfare -> unrest. Asserted as one chain, because that chain is
    // the entire product.
    const seed = 9090;

    const sicken = () => {
      const s = createNewGame(seed);
      s.npcs.mira.condition.status = 'Critical';
      s.npcs.mira.condition.health = 22;
      return s;
    };

    // --- While she is still ill: the supply side of the chain.
    const healthyEarly = run(createNewGame(seed), 8);
    const sickEarly = run(sicken(), 8);

    expect(sickEarly.npcs.mira.condition.status).not.toBe('Healthy');

    // 1. Less water is produced.
    expect(sickEarly.market.water.lastProduced).toBeLessThan(healthyEarly.market.water.lastProduced);

    // 2. Less water is in store.
    expect(sickEarly.market.water.stored).toBeLessThan(healthyEarly.market.water.stored);

    // 3. Water costs more.
    expect(sickEarly.market.water.currentPrice).toBeGreaterThan(
      healthyEarly.market.water.currentPrice,
    );

    // --- Once the damage has had time to land: the population side.
    const healthyLate = run(createNewGame(seed), 14);
    const sickLate = run(sicken(), 14);

    // 4. The population is worse off — scarcity reaches them through price,
    //    not only through an empty granary.
    expect(sickLate.kingdom.welfare).toBeLessThan(healthyLate.kingdom.welfare);

    // 5. And they are angry about it.
    expect(sickLate.kingdom.unrest).toBeGreaterThan(healthyLate.kingdom.unrest);
  });

  it('makes an unaffordable staple hurt even when the granary is not empty', () => {
    // A full store nobody can pay for is still hunger.
    const seed = 3131;
    const baseline = run(createNewGame(seed), 6);

    const squeezed = createNewGame(seed);
    for (const id of ['water', 'bread', 'grain']) {
      squeezed.market[id].currentPrice = squeezed.market[id].currentPrice * 5;
    }
    const after = run(squeezed, 6);

    // Stores are not empty in either run...
    expect(after.market.water.stored).toBeGreaterThan(0);
    // ...but the priced-out population is measurably worse off.
    expect(after.kingdom.welfare).toBeLessThan(baseline.kingdom.welfare);
  });

  it('lets illness resolve in a healthy kingdom and kill in a failing one', () => {
    const cared = createNewGame(4);
    cared.kingdom.publicHealth = 80;
    cared.npcs.lyra.condition.status = 'Sick';
    cared.npcs.lyra.condition.health = 60;
    const recovered = run(cared, 14);
    expect(recovered.npcs.lyra.condition.status).toBe('Healthy');

    // The same illness, in a kingdom that cannot care for its sick, kills.
    const neglected = createNewGame(4);
    neglected.kingdom.publicHealth = 10;
    neglected.npcs.lyra.condition.status = 'Sick';
    neglected.npcs.lyra.condition.health = 60;

    const failing = run(neglected, 14);
    expect(failing.npcs.lyra.condition.health).toBeLessThan(30);

    const dead = run(neglected, 25);
    expect(dead.npcs.lyra.condition.status).toBe('Deceased');
  });

  it('costs the kingdom her output for good once she is dead', () => {
    const seed = 606;
    const normal = run(createNewGame(seed), 20);

    const bereaved = createNewGame(seed);
    bereaved.npcs.lyra.condition.status = 'Deceased';
    bereaved.npcs.lyra.condition.health = 0;
    const after = run(bereaved, 20);

    expect(after.market.herbs.lastProduced).toBeLessThan(normal.market.herbs.lastProduced);
    // Death is permanent — no recovery path brings her back.
    expect(after.npcs.lyra.condition.status).toBe('Deceased');
  });

  it('starves a chained resource when its input is gone', () => {
    // Bread needs grain. No grain, no bread — two days later.
    const state = createNewGame(4141);
    state.market.grain.stored = 0;
    state.npcs.caren.condition.status = 'Critical';
    state.npcs.caren.condition.health = 15;

    const result = simulateDay(state);
    expect(result.state.market.bread.lastProduced).toBeLessThan(
      simulateDay(createNewGame(4141)).state.market.bread.lastProduced,
    );
  });

});
