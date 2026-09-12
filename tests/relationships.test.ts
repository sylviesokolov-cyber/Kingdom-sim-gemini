import { describe, expect, it } from 'vitest';
import { createInitialNpcs, createNewGame } from '../src/content/initialState';
import { NPCS_BY_ID } from '../src/content/npcs';
import {
  activePerks,
  affectionCap,
  applyInteraction,
  applyJealousy,
  bondTier,
  dailyRelationshipDrift,
  deriveMood,
  perkMultiplier,
} from '../src/engine/relationships';
import type { Relationship } from '../src/types';

const rel = (over: Partial<Relationship> = {}): Relationship => ({
  affection: 0,
  trust: 0,
  respect: 0,
  desire: 0,
  resentment: 0,
  jealousy: 0,
  resonance: 0,
  ...over,
});

describe('bond tiers', () => {
  it('gates on trust, not affection alone', () => {
    // She can adore him and still not hand over the granary keys.
    expect(bondTier(rel({ affection: 95, trust: 0 }))).toBe('Stranger');
    expect(bondTier(rel({ affection: 95, trust: 80 }))).toBe('Sworn');
  });

  it('climbs through every tier in order', () => {
    expect(bondTier(rel({ affection: 10, trust: 10 }))).toBe('Stranger');
    expect(bondTier(rel({ affection: 25, trust: 20 }))).toBe('Acquainted');
    expect(bondTier(rel({ affection: 45, trust: 40 }))).toBe('Warm');
    expect(bondTier(rel({ affection: 65, trust: 55 }))).toBe('Close');
    expect(bondTier(rel({ affection: 80, trust: 70 }))).toBe('Devoted');
    expect(bondTier(rel({ affection: 92, trust: 85 }))).toBe('Sworn');
  });
});

describe('affection cap', () => {
  it('caps below Sworn without resonance or a completed questline', () => {
    expect(affectionCap(rel(), false)).toBe(74);
    expect(affectionCap(rel({ resonance: 1 }), false)).toBe(84);
    expect(affectionCap(rel({ resonance: 3 }), false)).toBe(100);
  });

  it('lets a non-pulling player reach Sworn through her questline', () => {
    expect(affectionCap(rel({ resonance: 0 }), true)).toBe(100);
  });
});

describe('interactions', () => {
  const def = NPCS_BY_ID.caren;

  it('rewards favorite gifts far more than generic ones', () => {
    const npcs = createInitialNpcs();
    const favorite = applyInteraction({
      npc: npcs.caren,
      def,
      kind: 'gift',
      itemId: def.favoriteGifts[0],
      day: 1,
      charm: 10,
    });
    const generic = applyInteraction({
      npc: npcs.caren,
      def,
      kind: 'gift',
      itemId: 'iron_ore',
      day: 1,
      charm: 10,
    });
    expect(favorite.affectionGain).toBeGreaterThan(generic.affectionGain);
  });

  it('punishes a hated gift', () => {
    const npcs = createInitialNpcs();
    const result = applyInteraction({
      npc: npcs.caren,
      def,
      kind: 'gift',
      itemId: def.hatedGifts[0],
      day: 1,
      charm: 10,
    });
    expect(result.affectionGain).toBeLessThan(0);
    expect(result.npc.relationship.resentment).toBeGreaterThan(0);
  });

  it('diminishes repeated talking on the same day', () => {
    const npcs = createInitialNpcs();
    const first = applyInteraction({ npc: npcs.caren, def, kind: 'talk', talksToday: 0, day: 1, charm: 10 });
    const fourth = applyInteraction({ npc: npcs.caren, def, kind: 'talk', talksToday: 3, day: 1, charm: 10 });
    expect(fourth.affectionGain).toBeLessThan(first.affectionGain);
    expect(fourth.diminished).toBe(true);
  });

  it('builds trust faster through assisting than through gifts', () => {
    const npcs = createInitialNpcs();
    const assist = applyInteraction({ npc: npcs.caren, def, kind: 'assist', day: 1, charm: 10 });
    const gift = applyInteraction({ npc: npcs.caren, def, kind: 'gift', itemId: 'bread', day: 1, charm: 10 });
    expect(assist.trustGain).toBeGreaterThan(gift.trustGain);
  });

  it('never pushes affection past the cap', () => {
    const npcs = createInitialNpcs();
    let npc = npcs.caren;
    for (let i = 0; i < 200; i += 1) {
      npc = applyInteraction({
        npc,
        def,
        kind: 'gift',
        itemId: def.favoriteGifts[0],
        day: i,
        charm: 40,
      }).npc;
    }
    expect(npc.relationship.affection).toBeLessThanOrEqual(affectionCap(npc.relationship, false));
  });
});

describe('jealousy', () => {
  it('makes a rival jealous when the player advances another bond', () => {
    const npcs = createInitialNpcs();
    // Rin is a rival of Caren, and has to already care to be jealous.
    npcs.rin.relationship.affection = 70;
    const after = applyJealousy(npcs, 'caren', 10);
    expect(after.rin.relationship.jealousy).toBeGreaterThan(0);
  });

  it('leaves someone with no opinion of the bonded companion alone', () => {
    const npcs = createInitialNpcs();
    npcs.claire.relationship.affection = 70;
    const after = applyJealousy(npcs, 'elare', 10);
    expect(after.claire.relationship.jealousy).toBe(0);
  });

  it('does not make a stranger jealous', () => {
    const npcs = createInitialNpcs();
    npcs.rin.relationship.affection = 0;
    const after = applyJealousy(npcs, 'caren', 10);
    expect(after.rin.relationship.jealousy).toBe(0);
  });
});

describe('mood', () => {
  it('reads cold when jealous, however high the affection', () => {
    const npcs = createInitialNpcs();
    npcs.caren.relationship = rel({ affection: 90, trust: 80, jealousy: 70 });
    expect(deriveMood(npcs.caren)).toBe('Jealous');
  });

  it('reads worried when she is ill', () => {
    const npcs = createInitialNpcs();
    npcs.caren.condition.status = 'Sick';
    expect(deriveMood(npcs.caren)).toBe('Worried');
  });

  it('reads elated at a deep bond in good health', () => {
    const npcs = createInitialNpcs();
    npcs.caren.relationship = rel({ affection: 85, trust: 70 });
    expect(deriveMood(npcs.caren)).toBe('Elated');
  });
});

describe('drift', () => {
  it('cools an established bond that is neglected', () => {
    const npcs = createInitialNpcs();
    npcs.caren.relationship.affection = 60;
    const after = dailyRelationshipDrift(npcs, []);
    expect(after.caren.relationship.affection).toBeLessThan(60);
  });

  it('does not cool a bond the player tended today', () => {
    const npcs = createInitialNpcs();
    npcs.caren.relationship.affection = 60;
    const after = dailyRelationshipDrift(npcs, ['caren']);
    expect(after.caren.relationship.affection).toBe(60);
  });

  it('leaves a stranger alone — there is nothing to lose', () => {
    const npcs = createInitialNpcs();
    npcs.elare.relationship.affection = 6;
    const after = dailyRelationshipDrift(npcs, []);
    expect(after.elare.relationship.affection).toBe(6);
  });
});

describe('perks', () => {
  it('grants a bond perk once the tier is reached', () => {
    const game = createNewGame(1);
    game.npcs.rin.relationship = rel({ affection: 65, trust: 55, resonance: 1 });
    const perks = activePerks(game.npcs);
    expect(perks.some((p) => p.id === 'rin_close')).toBe(true);
  });

  it('suspends a companion\'s perks while she is jealous', () => {
    const game = createNewGame(1);
    game.npcs.rin.relationship = rel({ affection: 65, trust: 55, resonance: 1, jealousy: 70 });
    const perks = activePerks(game.npcs);
    expect(perks.some((p) => p.id === 'rin_close')).toBe(false);
  });

  it('turns a bond into a real market advantage', () => {
    const game = createNewGame(1);
    expect(perkMultiplier(activePerks(game.npcs), 'market_buy_multiplier')).toBe(1);

    game.npcs.rin.relationship = rel({ affection: 80, trust: 70, resonance: 2 });
    const perks = activePerks(game.npcs);
    expect(perkMultiplier(perks, 'market_buy_multiplier')).toBeLessThan(1);
    expect(perkMultiplier(perks, 'market_sell_multiplier')).toBeGreaterThan(1);
  });

  it('halves bounty accrual once Vesper is Warm', () => {
    const game = createNewGame(1);
    game.npcs.vesper.relationship = rel({ affection: 45, trust: 40 });
    expect(perkMultiplier(activePerks(game.npcs), 'bounty_rate')).toBe(0.5);
  });
});
