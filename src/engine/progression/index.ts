import type { CareerTrack, Estate, PlayerState, FactionState, FactionId } from '../../types';
import {
  CAREER_DEFINITIONS,
  ESTATE_LADDER,
  TRACK_ANTAGONISMS,
  estateIndex,
  getEstateTier,
} from '../../content/progression';

export interface Eligibility {
  eligible: boolean;
  reasons: string[];
}

/**
 * Track antagonism: holding high rank in one track caps a conflicting one.
 *
 * cap(this) = 5 - max(0, rank(other) - gap), symmetrically. With gap 2 that
 * means the first two ranks in the other track are free, and rank 5 in one
 * caps the other at 2 — so you cannot be the Church's bishop and the
 * Syndicate's kingpin.
 */
export function effectiveCareerCap(player: PlayerState, track: CareerTrack): number {
  let cap = 5;

  for (const ant of TRACK_ANTAGONISMS) {
    const other: CareerTrack | undefined =
      ant.a === track ? ant.b : ant.b === track ? ant.a : undefined;
    if (!other) continue;

    const otherRank = player.careers[other].rank;
    cap = Math.min(cap, 5 - Math.max(0, otherRank - ant.gap));
  }

  return Math.max(0, cap);
}

export function canAdvanceCareer(
  player: PlayerState,
  track: CareerTrack,
  factions: Record<FactionId, FactionState>,
): Eligibility {
  const def = CAREER_DEFINITIONS[track];
  const career = player.careers[track];
  const reasons: string[] = [];
  const nextRank = career.rank + 1;

  if (nextRank > 5) {
    return { eligible: false, reasons: ['Already at the apex of this track.'] };
  }

  const cap = effectiveCareerCap(player, track);
  if (nextRank > cap) {
    const conflict = TRACK_ANTAGONISMS.find((a) => a.a === track || a.b === track);
    reasons.push(conflict ? conflict.reason : 'Another track you hold blocks this advancement.');
  }

  const xpNeeded = def.xpThresholds[nextRank - 1];
  if (career.xp < xpNeeded) {
    reasons.push(`Requires ${xpNeeded} track experience (you have ${Math.floor(career.xp)}).`);
  }

  if (def.faction) {
    const floor = def.factionFloors[nextRank - 1];
    const opinion = factions[def.faction]?.opinion ?? 0;
    if (opinion < floor) {
      reasons.push(`Requires ${floor} standing with ${def.faction} (you have ${Math.floor(opinion)}).`);
    }
  }

  const trial = def.trials[nextRank - 1];
  if (trial && !career.completedTrials.includes(trial)) {
    reasons.push('The rank trial has not been completed.');
  }

  return { eligible: reasons.length === 0, reasons };
}

export function advanceCareer(player: PlayerState, track: CareerTrack): PlayerState {
  const def = CAREER_DEFINITIONS[track];
  const career = player.careers[track];
  const nextRank = Math.min(5, career.rank + 1);
  const xpSpent = def.xpThresholds[nextRank - 1] ?? 0;

  return {
    ...player,
    careers: {
      ...player.careers,
      [track]: { ...career, rank: nextRank, xp: Math.max(0, career.xp - xpSpent) },
    },
  };
}

export function highestCareerRank(player: PlayerState): number {
  return Math.max(...Object.values(player.careers).map((c) => c.rank));
}

export function canPromoteEstate(
  player: PlayerState,
  factions: Record<FactionId, FactionState>,
): Eligibility {
  const currentIndex = estateIndex(player.estate);
  const next = ESTATE_LADDER[currentIndex + 1];
  const reasons: string[] = [];

  if (!next) return { eligible: false, reasons: ['There is nothing above the throne.'] };

  if (player.standingPoints < next.standingRequired) {
    reasons.push(`Requires ${next.standingRequired} standing (you have ${Math.floor(player.standingPoints)}).`);
  }
  if (player.currencies.copper < next.copperCost) {
    reasons.push(`Requires ${next.copperCost} copper (you have ${Math.floor(player.currencies.copper)}).`);
  }
  if (next.minCareerRank > 0 && highestCareerRank(player) < next.minCareerRank) {
    reasons.push(`Requires rank ${next.minCareerRank} in at least one career track.`);
  }
  if (next.factionFloor) {
    const qualifying = Object.values(factions).filter(
      (f) => f.opinion >= next.factionFloor!.minOpinion,
    ).length;
    if (qualifying < next.factionFloor.count) {
      reasons.push(
        `Requires ${next.factionFloor.count} factions at ${next.factionFloor.minOpinion} opinion (you have ${qualifying}).`,
      );
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

export function promoteEstate(player: PlayerState): PlayerState {
  const currentIndex = estateIndex(player.estate);
  const next = ESTATE_LADDER[currentIndex + 1];
  if (!next) return player;

  const newMaxEnergy = player.vitals.maxEnergy + next.maxEnergyBonus;

  return {
    ...player,
    estate: next.estate,
    title: next.title,
    standingPoints: player.standingPoints - next.standingRequired,
    currencies: { ...player.currencies, copper: player.currencies.copper - next.copperCost },
    vitals: { ...player.vitals, maxEnergy: newMaxEnergy, energy: newMaxEnergy },
  };
}

export function nextEstate(estate: Estate): Estate | undefined {
  return ESTATE_LADDER[estateIndex(estate) + 1]?.estate;
}

export { getEstateTier };

/**
 * Standing from repeating the same source has sharply diminishing returns.
 * The game wants a varied life, not one job ground three hundred times.
 */
export function standingGain(
  base: number,
  timesPerformed: number,
): number {
  if (timesPerformed <= 3) return base;
  if (timesPerformed <= 8) return base * 0.6;
  if (timesPerformed <= 20) return base * 0.3;
  return base * 0.1;
}

export interface LevelResult {
  level: number;
  xp: number;
  xpToNext: number;
  levelsGained: number;
}

export function applyXp(player: PlayerState, amount: number): LevelResult {
  let { level, xp, xpToNext } = player;
  xp += amount;
  let levelsGained = 0;

  while (xp >= xpToNext && level < 99) {
    xp -= xpToNext;
    level += 1;
    levelsGained += 1;
    xpToNext = Math.round(xpToNext * 1.35);
  }

  return { level, xp, xpToNext, levelsGained };
}
