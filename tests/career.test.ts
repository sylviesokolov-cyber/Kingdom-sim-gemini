import { describe, expect, it } from 'vitest';
import { createNewGame } from '../src/content/initialState';
import { CAREER_DEFINITIONS, CAREER_TRIALS, TRIALS_BY_ID } from '../src/content/progression';
import { canAttemptTrial, completeTrial, jobEffect, nextTrial } from '../src/engine/career';
import { canPromoteEstate, promoteEstate, throneRoutesAvailable } from '../src/engine/progression';
import { JOBS_BY_ID } from '../src/content/jobs';
import { CAREER_TRACKS } from '../src/types';
import type { CareerTrack, GameState } from '../src/types';

/** Put the player in a state where the named trial is the only thing left. */
function readyFor(game: GameState, trialId: string): GameState {
  const trial = TRIALS_BY_ID[trialId];
  const def = CAREER_DEFINITIONS[trial.track];

  game.player.careers[trial.track].rank = trial.rank - 1;
  game.player.careers[trial.track].xp = def.xpThresholds[trial.rank - 1];
  if (def.faction) game.factions[def.faction].opinion = 100;

  game.player.currencies.copper = 500_000;
  game.player.vitals.maxEnergy = 200;
  game.player.vitals.energy = 200;
  for (const attr of Object.keys(game.player.attributes) as (keyof typeof game.player.attributes)[]) {
    game.player.attributes[attr] = 60;
  }
  for (const npc of Object.values(game.npcs)) {
    npc.relationship.trust = 100;
    npc.relationship.affection = 100;
  }
  game.player.estate = 'Gentry';
  game.clock.day = 200;
  game.player.flags = CAREER_TRIALS.flatMap((t) => t.rewards.setFlags ?? []);
  return game;
}

describe('career rank trials', () => {
  it('authors a trial for every rank every track declares', () => {
    for (const track of CAREER_TRACKS) {
      for (const trialId of CAREER_DEFINITIONS[track].trials) {
        expect(TRIALS_BY_ID[trialId], `missing trial ${trialId}`).toBeDefined();
      }
    }
    expect(CAREER_TRIALS).toHaveLength(CAREER_TRACKS.length * 5);
  });

  it('names the trial standing in front of the player, and nothing beyond it', () => {
    const game = createNewGame(1);
    expect(nextTrial(game.player, 'merchant')?.id).toBe('trial_merchant_1');

    game.player.careers.merchant.rank = 2;
    expect(nextTrial(game.player, 'merchant')?.id).toBe('trial_merchant_3');

    game.player.careers.merchant.rank = 5;
    expect(nextTrial(game.player, 'merchant')).toBeUndefined();
  });

  it('refuses a trial the player has not earned the experience for', () => {
    const game = createNewGame(1);
    const verdict = canAttemptTrial(game, 'trial_merchant_1');

    expect(verdict.eligible).toBe(false);
    expect(verdict.reasons.join(' ')).toContain('experience');
  });

  it('cannot be bought: copper alone never qualifies anyone', () => {
    const game = createNewGame(1);
    game.player.currencies.copper = 10_000_000;

    expect(canAttemptTrial(game, 'trial_martial_1').eligible).toBe(false);
  });

  it('advances the rank, spends the rank xp, and applies the rewards', () => {
    const game = readyFor(createNewGame(1), 'trial_martial_1');
    // readyFor maxes faction opinion; back it off so the reward has room to
    // show up rather than being clamped at the top of the scale.
    game.factions.military.opinion = 40;
    const copperBefore = game.player.currencies.copper;
    const militaryBefore = game.factions.military.opinion;

    const result = completeTrial(game, 'trial_martial_1');

    expect(result.passed).toBe(true);
    expect(result.newRankName).toBe('Levy');
    expect(result.state.player.careers.martial.rank).toBe(1);
    expect(result.state.player.careers.martial.completedTrials).toContain('trial_martial_1');
    // 80 xp is the rank-1 threshold and the rank consumed it.
    expect(result.state.player.careers.martial.xp).toBe(0);
    expect(result.state.player.vitals.energy).toBe(game.player.vitals.energy - 22);
    expect(result.state.player.currencies.copper).toBe(copperBefore);
    expect(result.state.factions.military.opinion).toBeGreaterThan(militaryBefore);
    expect(result.state.player.flags).toContain('martial.stood_the_muster');
  });

  it('refuses to run the same trial twice', () => {
    const game = readyFor(createNewGame(1), 'trial_clergy_1');
    const first = completeTrial(game, 'trial_clergy_1');
    const again = completeTrial(first.state, 'trial_clergy_1');

    expect(again.passed).toBe(false);
    expect(again.state.player.careers.clergy.rank).toBe(1);
  });

  it('changes nothing at all when the trial is refused', () => {
    const game = createNewGame(1);
    const result = completeTrial(game, 'trial_shadow_1');

    expect(result.passed).toBe(false);
    expect(result.state).toBe(game);
  });

  it('honours the antagonism cap: a bishop cannot sit the kingpin trial', () => {
    const game = readyFor(createNewGame(1), 'trial_shadow_5');
    game.player.careers.clergy.rank = 5;

    const verdict = canAttemptTrial(game, 'trial_shadow_5');

    expect(verdict.eligible).toBe(false);
    expect(verdict.reasons.join(' ')).toContain('conflicting track');
  });

  it('gates the senior trials behind a woman who has to trust him', () => {
    const game = readyFor(createNewGame(1), 'trial_court_3');
    game.npcs.seraphine.relationship.trust = 5;

    const verdict = canAttemptTrial(game, 'trial_court_3');

    expect(verdict.eligible).toBe(false);
    expect(verdict.reasons.join(' ')).toContain('trust');
  });
});

describe('the two ladders climb each other', () => {
  /**
   * The regression this whole system exists for: before rank trials were
   * authored, `canAdvanceCareer` refused every rank forever, so the estate
   * ladder stalled at Peasant behind its rank-2 requirement and the game had
   * no progression above its second tier.
   */
  it('carries a player from Outsider to Burgher, alternating rung by rung', () => {
    let game = createNewGame(7);
    const track: CareerTrack = 'merchant';
    const def = CAREER_DEFINITIONS[track];

    // A life lived: the player has done the work, made the money, and is
    // known to the Bourse and to Rin and Sylvie.
    game.player.standingPoints = 3000;
    game.player.currencies.copper = 60_000;
    game.player.vitals.maxEnergy = 200;
    game.player.vitals.energy = 200;
    game.player.attributes.cunning = 30;
    game.player.attributes.charm = 25;
    game.player.attributes.authority = 20;
    game.factions.guilds.opinion = 90;
    game.npcs.sylvie.relationship.trust = 60;
    game.npcs.rin.relationship.trust = 60;

    const reached: string[] = [];

    for (let rank = 1; rank <= 4; rank += 1) {
      game.player.careers[track].xp = def.xpThresholds[rank - 1];
      game.player.vitals.energy = game.player.vitals.maxEnergy;

      const trial = nextTrial(game.player, track);
      expect(trial?.rank, `trial for rank ${rank}`).toBe(rank);

      const result = completeTrial(game, trial!.id);
      expect(result.passed, `rank ${rank}: ${result.reasons.join(' ')}`).toBe(true);
      game = result.state;
      reached.push(result.newRankName!);

      // Every rank the estate ladder is waiting on unlocks the next estate.
      const verdict = canPromoteEstate(game.player, game.factions);
      if (verdict.eligible) {
        game = { ...game, player: promoteEstate(game.player) };
      }
    }

    expect(reached).toEqual(['Hawker', 'Trader', 'Factor', 'Merchant']);
    expect(game.player.estate).toBe('Burgher');
  });
});

describe('routes to the throne', () => {
  it('reports every route with a reason, not a boolean', () => {
    const game = createNewGame(1);
    const routes = throneRoutesAvailable(game);

    expect(routes).toHaveLength(6);
    for (const route of routes) {
      expect(route.eligible).toBe(false);
      expect(route.blockers.length).toBeGreaterThan(0);
      expect(route.progress).toBeGreaterThanOrEqual(0);
      expect(route.progress).toBeLessThanOrEqual(1);
    }
  });

  it('opens the Marshal route to a Marshal the garrison loves', () => {
    const game = createNewGame(1);
    game.player.careers.martial.rank = 5;
    game.factions.military.opinion = 85;
    game.factions.military.power = 70;
    game.npcs.claire.relationship.affection = 80;
    game.npcs.claire.relationship.trust = 80;

    const marshal = throneRoutesAvailable(game).find((r) => r.route.id === 'marshal');

    expect(marshal?.eligible, marshal?.blockers.join(' ')).toBe(true);
  });

  it('keeps the other routes shut when only one is qualified', () => {
    const game = createNewGame(1);
    game.player.careers.martial.rank = 5;
    game.factions.military.opinion = 85;
    game.factions.military.power = 70;
    game.npcs.claire.relationship.affection = 80;
    game.npcs.claire.relationship.trust = 80;

    const open = throneRoutesAvailable(game).filter((r) => r.eligible);

    expect(open.map((r) => r.route.id)).toEqual(['marshal']);
  });

  it('measures partial progress so a track shows what it is building toward', () => {
    const game = createNewGame(1);
    const before = throneRoutesAvailable(game).find((r) => r.route.id === 'anointed')!.progress;

    game.player.careers.clergy.rank = 5;
    const after = throneRoutesAvailable(game).find((r) => r.route.id === 'anointed')!.progress;

    expect(after).toBeGreaterThan(before);
  });
});

describe('a day of work', () => {
  it('pays the authored wage and trains the authored attribute the first time', () => {
    const job = JOBS_BY_ID.weed_goldfields;
    const effect = jobEffect(job, 0);

    expect(effect.copper).toBe(job.rewards.copper);
    expect(effect.energy).toBe(-job.energyCost);
    expect(effect.standingPoints).toBe(job.rewards.standingPoints);
    expect(effect.attributes?.might).toBeCloseTo(job.rewards.attributes!.might!);
  });

  it('decays standing and training, but never the wage or the trade learned', () => {
    const job = JOBS_BY_ID.run_stall;
    const fresh = jobEffect(job, 0);
    const ground = jobEffect(job, 400);

    expect(ground.standingPoints).toBeLessThan(fresh.standingPoints!);
    expect(ground.attributes!.cunning).toBeLessThan(fresh.attributes!.cunning!);
    // The work is still worth its wage and still teaches the trade.
    expect(ground.copper).toBe(fresh.copper);
    expect(ground.careerXp).toEqual(fresh.careerXp);
  });

  it('leaves a varied life ahead of a ground one', () => {
    const hauled = Array.from({ length: 60 }, (_, i) => jobEffect(JOBS_BY_ID.haul_water, i))
      .reduce((sum, e) => sum + (e.attributes?.might ?? 0), 0);
    const varied =
      Array.from({ length: 20 }, (_, i) => jobEffect(JOBS_BY_ID.haul_water, i))
        .reduce((sum, e) => sum + (e.attributes?.might ?? 0), 0) +
      Array.from({ length: 20 }, (_, i) => jobEffect(JOBS_BY_ID.weed_goldfields, i))
        .reduce((sum, e) => sum + (e.attributes?.might ?? 0), 0) +
      Array.from({ length: 20 }, (_, i) => jobEffect(JOBS_BY_ID.foundry_shift, i))
        .reduce((sum, e) => sum + (e.attributes?.might ?? 0), 0);

    expect(varied).toBeGreaterThan(hauled);
  });
});
