import { describe, expect, it } from 'vitest';
import { createNewGame } from '../src/content/initialState';
import {
  advanceCareer,
  applyXp,
  canAdvanceCareer,
  canPromoteEstate,
  effectiveCareerCap,
  highestCareerRank,
  promoteEstate,
  standingGain,
} from '../src/engine/progression';
import { CAREER_DEFINITIONS } from '../src/content/progression';

describe('estate ladder', () => {
  it('refuses promotion with nothing earned, and says why', () => {
    const game = createNewGame(1);
    const verdict = canPromoteEstate(game.player, game.factions);
    expect(verdict.eligible).toBe(false);
    expect(verdict.reasons.length).toBeGreaterThan(0);
    expect(verdict.reasons[0]).toContain('standing');
  });

  it('allows the first promotion once standing and copper are met', () => {
    const game = createNewGame(1);
    game.player.standingPoints = 120;
    game.player.currencies.copper = 150;

    const verdict = canPromoteEstate(game.player, game.factions);
    expect(verdict.eligible).toBe(true);

    const promoted = promoteEstate(game.player);
    expect(promoted.estate).toBe('Peasant');
    expect(promoted.title).toBe('Tenant of the Ashes');
    expect(promoted.currencies.copper).toBe(50);
    expect(promoted.vitals.maxEnergy).toBeGreaterThan(game.player.vitals.maxEnergy);
  });

  it('requires a career rank at Villager and above', () => {
    const game = createNewGame(1);
    game.player.estate = 'Peasant';
    game.player.standingPoints = 5000;
    game.player.currencies.copper = 50000;

    const blocked = canPromoteEstate(game.player, game.factions);
    expect(blocked.eligible).toBe(false);
    expect(blocked.reasons.some((r) => r.includes('career track'))).toBe(true);

    game.player.careers.merchant.rank = 2;
    expect(canPromoteEstate(game.player, game.factions).eligible).toBe(true);
  });

  it('requires faction backing at Gentry', () => {
    const game = createNewGame(1);
    game.player.estate = 'Burgher';
    game.player.standingPoints = 9000;
    game.player.currencies.copper = 99999;
    game.player.careers.court.rank = 4;

    const blocked = canPromoteEstate(game.player, game.factions);
    expect(blocked.eligible).toBe(false);
    expect(blocked.reasons.some((r) => r.includes('factions'))).toBe(true);

    game.factions.crown.opinion = 70;
    game.factions.church.opinion = 70;
    expect(canPromoteEstate(game.player, game.factions).eligible).toBe(true);
  });
});

describe('career tracks', () => {
  it('is blocked by experience, faction standing, and the trial', () => {
    const game = createNewGame(1);
    const verdict = canAdvanceCareer(game.player, 'merchant', game.factions);
    expect(verdict.eligible).toBe(false);
    expect(verdict.reasons.some((r) => r.includes('experience'))).toBe(true);
    expect(verdict.reasons.some((r) => r.includes('trial'))).toBe(true);
  });

  it('advances once every requirement is met', () => {
    const game = createNewGame(1);
    game.player.careers.merchant.xp = 500;
    game.player.careers.merchant.completedTrials = [CAREER_DEFINITIONS.merchant.trials[0]];
    game.factions.guilds.opinion = 50;

    expect(canAdvanceCareer(game.player, 'merchant', game.factions).eligible).toBe(true);

    const advanced = advanceCareer(game.player, 'merchant');
    expect(advanced.careers.merchant.rank).toBe(1);
    expect(advanced.careers.merchant.xp).toBeLessThan(500);
  });

  it('allows several tracks at once', () => {
    const game = createNewGame(1);
    game.player.careers.merchant.rank = 3;
    game.player.careers.martial.rank = 2;
    expect(highestCareerRank(game.player)).toBe(3);
  });
});

describe('track antagonism', () => {
  it('leaves the first two ranks of a conflicting track free', () => {
    const game = createNewGame(1);
    game.player.careers.shadow.rank = 2;
    expect(effectiveCareerCap(game.player, 'clergy')).toBe(5);
  });

  it('caps the opposing track as the other one climbs', () => {
    const game = createNewGame(1);
    game.player.careers.shadow.rank = 3;
    expect(effectiveCareerCap(game.player, 'clergy')).toBe(4);

    game.player.careers.shadow.rank = 4;
    expect(effectiveCareerCap(game.player, 'clergy')).toBe(3);
  });

  it('makes Bishop and Kingpin mutually exclusive', () => {
    const game = createNewGame(1);
    game.player.careers.shadow.rank = 5;
    expect(effectiveCareerCap(game.player, 'clergy')).toBe(2);

    // And the relationship is symmetric.
    const other = createNewGame(1);
    other.player.careers.clergy.rank = 5;
    expect(effectiveCareerCap(other.player, 'shadow')).toBe(2);
  });

  it('blocks the advancement and explains the conflict', () => {
    const game = createNewGame(1);
    game.player.careers.shadow.rank = 5;
    game.player.careers.clergy.rank = 2;
    game.player.careers.clergy.xp = 5000;
    game.player.careers.clergy.completedTrials = CAREER_DEFINITIONS.clergy.trials;
    game.factions.church.opinion = 100;

    const verdict = canAdvanceCareer(game.player, 'clergy', game.factions);
    expect(verdict.eligible).toBe(false);
    expect(verdict.reasons.join(' ')).toContain('Syndicate');
  });

  it('does not cap unrelated tracks', () => {
    const game = createNewGame(1);
    game.player.careers.shadow.rank = 5;
    expect(effectiveCareerCap(game.player, 'merchant')).toBe(5);
    expect(effectiveCareerCap(game.player, 'martial')).toBe(5);
  });
});

describe('standing and levels', () => {
  it('diminishes standing from grinding one source', () => {
    expect(standingGain(10, 0)).toBe(10);
    expect(standingGain(10, 5)).toBeLessThan(10);
    expect(standingGain(10, 25)).toBeLessThan(standingGain(10, 5));
  });

  it('levels up and raises the next threshold', () => {
    const game = createNewGame(1);
    const result = applyXp(game.player, 100);
    expect(result.level).toBe(2);
    expect(result.levelsGained).toBe(1);
    expect(result.xpToNext).toBeGreaterThan(game.player.xpToNext);
  });

  it('handles several levels from one large award', () => {
    const game = createNewGame(1);
    const result = applyXp(game.player, 10000);
    expect(result.levelsGained).toBeGreaterThan(3);
    expect(result.xp).toBeLessThan(result.xpToNext);
  });
});
