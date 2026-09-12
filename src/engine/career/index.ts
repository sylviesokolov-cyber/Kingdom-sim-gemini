import type { CareerTrack, CareerTrialDefinition, DigestEntry, Effect, GameState, JobDefinition } from '../../types';
import { CAREER_DEFINITIONS, TRIALS_BY_ID, rankName, trialFor } from '../../content/progression';
import { applyEffect, canAfford } from '../effects';
import { evaluatePrerequisite } from '../prerequisites';
import { advanceCareer, effectiveCareerCap, repetitionFactor, standingGain } from '../progression';

/**
 * Rank trial resolution.
 *
 * This lives beside `engine/progression` rather than inside it for one
 * mechanical reason: resolving a trial means applying an `Effect`, and
 * `engine/effects` already depends on `engine/progression` for the XP curve.
 * Putting trial resolution in progression would close that loop into an import
 * cycle. Pure rank arithmetic stays in progression; the part that *spends and
 * grants* lives here.
 */

export interface TrialEligibility {
  eligible: boolean;
  reasons: string[];
}

/** The trial standing between the player and their next rank on `track`. */
export function nextTrial(player: GameState['player'], track: CareerTrack): CareerTrialDefinition | undefined {
  const career = player.careers[track];
  if (!career || career.rank >= 5) return undefined;
  return trialFor(track, career.rank + 1);
}

/**
 * Everything the trial asks, in one list of readable sentences.
 *
 * The XP threshold and the track's faction floor are checked here rather than
 * after, so the trial is the last thing you do rather than a second gate
 * behind an already-passed one — the work hall shows exactly one next step.
 */
export function canAttemptTrial(state: GameState, trialId: string): TrialEligibility {
  const trial = TRIALS_BY_ID[trialId];
  if (!trial) return { eligible: false, reasons: ['No such trial.'] };

  const { player } = state;
  const career = player.careers[trial.track];
  const def = CAREER_DEFINITIONS[trial.track];
  const reasons: string[] = [];

  if (career.completedTrials.includes(trial.id)) {
    return { eligible: false, reasons: ['You have already passed this trial.'] };
  }
  if (career.rank + 1 !== trial.rank) {
    return { eligible: false, reasons: ['This is not the trial in front of you.'] };
  }

  if (trial.rank > effectiveCareerCap(player, trial.track)) {
    const antagonist = trial.track === 'shadow' ? 'your standing in the lawful institutions' : 'your standing in the Syndicate';
    reasons.push(`A conflicting track blocks this rank — ${antagonist} caps it.`);
  }

  const xpNeeded = def.xpThresholds[trial.rank - 1];
  if (career.xp < xpNeeded) {
    reasons.push(`Requires ${xpNeeded} ${def.name.toLowerCase()} experience (you have ${Math.floor(career.xp)}).`);
  }

  if (def.faction) {
    const floor = def.factionFloors[trial.rank - 1];
    const opinion = state.factions[def.faction]?.opinion ?? 0;
    if (opinion < floor) {
      reasons.push(`Requires ${floor} standing with the ${def.faction} (you have ${Math.floor(opinion)}).`);
    }
  }

  const prereq = evaluatePrerequisite(trial.requires, state);
  for (const failure of prereq.failures) {
    reasons.push(`${failure.requirement} — ${failure.actual}.`);
  }

  const affordable = canAfford(state, trial.cost);
  if (!affordable.ok && affordable.reason) reasons.push(affordable.reason);

  return { eligible: reasons.length === 0, reasons };
}

export interface TrialResult {
  state: GameState;
  /** True when the trial actually resolved. */
  passed: boolean;
  /** Why it did not, when it did not. */
  reasons: string[];
  notes: DigestEntry[];
  /** The rank name the player now holds, when they advanced. */
  newRankName?: string;
}

/**
 * Undertake a rank trial: pay its cost, record it, advance the rank, and
 * apply its rewards.
 *
 * Order matters. The cost is paid first so a trial can never be half-taken;
 * the rank advances before the rewards land so a reward may reference the
 * rank the player now holds.
 */
export function completeTrial(state: GameState, trialId: string): TrialResult {
  const verdict = canAttemptTrial(state, trialId);
  if (!verdict.eligible) {
    return { state, passed: false, reasons: verdict.reasons, notes: [] };
  }

  const trial = TRIALS_BY_ID[trialId];
  const notes: DigestEntry[] = [];

  const paid = applyEffect(state, trial.cost);
  notes.push(...paid.notes);
  let current = paid.state;

  const career = current.player.careers[trial.track];
  current = {
    ...current,
    player: {
      ...current.player,
      careers: {
        ...current.player.careers,
        [trial.track]: { ...career, completedTrials: [...career.completedTrials, trial.id] },
      },
      deeds: [...current.player.deeds, `trial:${trial.id}`],
    },
  };

  // `advanceCareer` spends the rank's XP threshold, which is the whole point
  // of track XP: a rank consumes the work that earned it.
  current = { ...current, player: advanceCareer(current.player, trial.track) };

  const granted = applyEffect(current, trial.rewards);
  notes.push(...granted.notes);
  current = granted.state;

  return {
    state: current,
    passed: true,
    reasons: [],
    notes,
    newRankName: rankName(trial.track, current.player.careers[trial.track].rank),
  };
}

/* ------------------------------------------------------------------ *
 * Work
 * ------------------------------------------------------------------ */

/**
 * What a shift of this job is actually worth the `timesPerformed`-th time.
 *
 * The authored reward is the *first* day's reward. Standing and attribute
 * training both decay with repetition, so a varied life outpaces a ground
 * one — the rule lives here rather than in the store because it is a game
 * rule, and because a rule in a store action cannot be tested against a
 * hundred repetitions the way this can.
 *
 * Copper, items and career XP deliberately do **not** decay: the work is
 * still worth its wage and still teaches the trade. It is reputation and
 * raw talent that stop compounding.
 */
export function jobEffect(job: JobDefinition, timesPerformed: number): Effect {
  const decay = repetitionFactor(timesPerformed);
  const rewards = job.rewards;

  return {
    ...rewards,
    energy: -job.energyCost,
    standingPoints: standingGain(rewards.standingPoints ?? 0, timesPerformed),
    attributes: rewards.attributes
      ? Object.fromEntries(
          Object.entries(rewards.attributes).map(([attr, value]) => [attr, (value ?? 0) * decay]),
        )
      : undefined,
  };
}
