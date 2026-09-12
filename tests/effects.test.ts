import { describe, expect, it } from 'vitest';
import { createNewGame } from '../src/content/initialState';
import { applyEffect, applyEffects, canAfford } from '../src/engine/effects';

/**
 * `Effect` is declared as the single vocabulary for changing state, so this
 * is the single place it becomes state. Every authored system — jobs, rank
 * trials, events, quests, bond episodes — lands here, which makes a silent
 * dropped field a bug in all of them at once.
 */
describe('applyEffect', () => {
  it('applies authored attribute gains rather than dropping them', () => {
    const game = createNewGame(1);
    const before = game.player.attributes.cunning;

    const { state } = applyEffect(game, { attributes: { cunning: 0.35 } });

    expect(state.player.attributes.cunning).toBeCloseTo(before + 0.35);
  });

  it('adds level-up attribute gains on top of authored ones', () => {
    const game = createNewGame(1);
    const before = game.player.attributes.might;

    // xpToNext starts at 100, so this is exactly one level.
    const { state, levelsGained } = applyEffect(game, {
      xp: 100,
      attributes: { might: 0.5 },
    });

    expect(levelsGained).toBe(1);
    // +1 from the level (every attribute) and +0.5 from the effect.
    expect(state.player.attributes.might).toBeCloseTo(before + 1.5);
    expect(state.player.attributes.charm).toBeCloseTo(game.player.attributes.charm + 1);
  });

  it('moves faction opinion and the player\'s standing together', () => {
    const game = createNewGame(1);
    const before = game.factions.guilds.opinion;

    const { state } = applyEffect(game, { factions: [{ factionId: 'guilds', opinion: 6 }] });

    expect(state.factions.guilds.opinion).toBe(before + 6);
    expect(state.player.standing.guilds).toBe(before + 6);
  });

  it('clamps rather than letting values run off the ends of their scales', () => {
    const game = createNewGame(1);
    game.factions.church.opinion = 97;

    const { state } = applyEffect(game, {
      factions: [{ factionId: 'church', opinion: 20 }],
      copper: -100000,
      hunger: 500,
    });

    expect(state.factions.church.opinion).toBe(100);
    expect(state.player.currencies.copper).toBe(0);
    expect(state.player.vitals.hunger).toBe(100);
  });

  it('keeps flags append-only and never duplicates one', () => {
    const game = createNewGame(1);

    const first = applyEffect(game, { setFlags: ['court.drafted_a_decree'] });
    const second = applyEffect(first.state, { setFlags: ['court.drafted_a_decree', 'court.sorted_by_need'] });

    expect(second.state.player.flags.filter((f) => f === 'court.drafted_a_decree')).toHaveLength(1);
    expect(second.state.player.flags).toContain('court.sorted_by_need');
  });

  it('schedules a delayed consequence relative to the day it was applied', () => {
    const game = createNewGame(1);

    const { state } = applyEffect(game, { scheduled: [{ inDays: 21, eventId: 'ashgrave_retaliation' }] }, 40);

    expect(state.scheduled).toContainEqual(
      expect.objectContaining({ eventId: 'ashgrave_retaliation', fireOnDay: 61 }),
    );
  });

  it('applies a sequence in order, so later effects see earlier ones', () => {
    const game = createNewGame(1);
    game.player.currencies.copper = 100;

    const { state } = applyEffects(game, [{ copper: -100 }, { copper: 50 }]);

    expect(state.player.currencies.copper).toBe(50);
  });

  it('leaves the input state untouched', () => {
    const game = createNewGame(1);
    const before = game.player.currencies.copper;

    applyEffect(game, { copper: 500, setFlags: ['x'] });

    expect(game.player.currencies.copper).toBe(before);
    expect(game.player.flags).not.toContain('x');
  });
});

describe('canAfford', () => {
  it('refuses a cost the player cannot meet, and says what it was', () => {
    const game = createNewGame(1);
    game.player.currencies.copper = 10;

    const verdict = canAfford(game, { copper: -2000 });

    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain('2000 copper');
  });

  it('reads a positive amount as a reward, not a cost', () => {
    const game = createNewGame(1);
    game.player.currencies.copper = 0;

    expect(canAfford(game, { copper: 5000 }).ok).toBe(true);
  });

  it('checks energy against what the player actually has left', () => {
    const game = createNewGame(1);
    game.player.vitals.energy = 10;

    expect(canAfford(game, { energy: -55 }).ok).toBe(false);
    expect(canAfford(game, { energy: -5 }).ok).toBe(true);
  });
});
