import type { GameState, PrereqFailure, PrereqResult, Prerequisite } from '../../types';
import { estateIndex } from '../../content/progression';
import { NPCS_BY_ID } from '../../content/npcs';
import { RESOURCES } from '../../content/resources';
import { bondTier, tierIndex } from '../relationships';

/**
 * Evaluate a content prerequisite against the game state.
 *
 * Returns the REASON for failure, not a boolean: the quest log and the work
 * hall have to be able to say "Requires Burgher estate, Church opinion 40
 * (you have 22)" rather than greying a row out with no explanation.
 */
export function evaluatePrerequisite(prereq: Prerequisite, state: GameState): PrereqResult {
  const failures: PrereqFailure[] = [];
  const { player, clock, kingdom, factions, npcs, completedQuests } = state;

  if (prereq.day) {
    if (prereq.day.min !== undefined && clock.day < prereq.day.min) {
      failures.push({
        kind: 'day',
        requirement: `Not before day ${prereq.day.min}`,
        actual: `Day ${clock.day}`,
      });
    }
    if (prereq.day.max !== undefined && clock.day > prereq.day.max) {
      failures.push({
        kind: 'day',
        requirement: `Only before day ${prereq.day.max}`,
        actual: `Day ${clock.day}`,
      });
    }
  }

  if (prereq.estate) {
    const needed = estateIndex(prereq.estate);
    const have = estateIndex(player.estate);
    if (have < needed) {
      failures.push({
        kind: 'estate',
        requirement: `Requires ${prereq.estate}`,
        actual: player.estate,
      });
    }
  }

  for (const req of prereq.career ?? []) {
    const rank = player.careers[req.track]?.rank ?? 0;
    if (rank < req.minRank) {
      failures.push({
        kind: 'career',
        requirement: `Requires ${req.track} rank ${req.minRank}`,
        actual: `rank ${rank}`,
      });
    }
  }

  for (const [attr, min] of Object.entries(prereq.attribute ?? {})) {
    const have = player.attributes[attr as keyof typeof player.attributes] ?? 0;
    if (have < (min ?? 0)) {
      failures.push({
        kind: 'attribute',
        requirement: `Requires ${attr} ${min}`,
        actual: String(have),
      });
    }
  }

  for (const req of prereq.faction ?? []) {
    const f = factions[req.id];
    if (!f) continue;
    if (req.minOpinion !== undefined && f.opinion < req.minOpinion) {
      failures.push({
        kind: 'faction',
        requirement: `Requires ${req.id} opinion ${req.minOpinion}`,
        actual: String(Math.floor(f.opinion)),
      });
    }
    if (req.minPower !== undefined && f.power < req.minPower) {
      failures.push({
        kind: 'faction',
        requirement: `Requires ${req.id} power ${req.minPower}`,
        actual: String(Math.floor(f.power)),
      });
    }
  }

  for (const req of prereq.bond ?? []) {
    const npc = npcs[req.npcId];
    const name = NPCS_BY_ID[req.npcId]?.name ?? req.npcId;
    if (!npc) {
      failures.push({ kind: 'bond', requirement: `Requires ${name}`, actual: 'not in your retinue' });
      continue;
    }
    if (req.minTier) {
      const have = bondTier(npc.relationship);
      if (tierIndex(have) < tierIndex(req.minTier)) {
        failures.push({
          kind: 'bond',
          requirement: `Requires ${name} at ${req.minTier}`,
          actual: have,
        });
      }
    }
    if (req.minTrust !== undefined && npc.relationship.trust < req.minTrust) {
      failures.push({
        kind: 'bond',
        requirement: `Requires ${name}'s trust at ${req.minTrust}`,
        actual: String(Math.floor(npc.relationship.trust)),
      });
    }
  }

  for (const [stat, range] of Object.entries(prereq.kingdom ?? {})) {
    const have = kingdom[stat as keyof typeof kingdom] as number;
    if (range?.min !== undefined && have < range.min) {
      failures.push({
        kind: 'kingdom',
        requirement: `Requires ${stat} above ${range.min}`,
        actual: String(Math.floor(have)),
      });
    }
    if (range?.max !== undefined && have > range.max) {
      failures.push({
        kind: 'kingdom',
        requirement: `Requires ${stat} below ${range.max}`,
        actual: String(Math.floor(have)),
      });
    }
  }

  for (const req of prereq.inventory ?? []) {
    const have = player.inventory[req.resourceId] ?? 0;
    if (have < req.min) {
      const name = RESOURCES[req.resourceId]?.name ?? req.resourceId;
      failures.push({
        kind: 'inventory',
        requirement: `Requires ${req.min} ${name}`,
        actual: String(have),
      });
    }
  }

  if (prereq.copper !== undefined && player.currencies.copper < prereq.copper) {
    failures.push({
      kind: 'copper',
      requirement: `Requires ${prereq.copper} copper`,
      actual: String(Math.floor(player.currencies.copper)),
    });
  }

  if (prereq.flags) {
    const held = new Set(player.flags);
    for (const flag of prereq.flags.all ?? []) {
      if (!held.has(flag)) {
        failures.push({ kind: 'flag', requirement: 'Something has not happened yet', actual: flag });
      }
    }
    if (prereq.flags.any && prereq.flags.any.length > 0) {
      if (!prereq.flags.any.some((f) => held.has(f))) {
        failures.push({
          kind: 'flag',
          requirement: 'Something has not happened yet',
          actual: prereq.flags.any.join(' or '),
        });
      }
    }
    for (const flag of prereq.flags.none ?? []) {
      if (held.has(flag)) {
        failures.push({ kind: 'flag', requirement: 'That road is already closed', actual: flag });
      }
    }
  }

  for (const questId of prereq.completedQuests ?? []) {
    if (!completedQuests.includes(questId)) {
      failures.push({
        kind: 'quest',
        requirement: 'An earlier task is unfinished',
        actual: questId,
      });
    }
  }

  return { met: failures.length === 0, failures };
}

/** Convenience for call sites that genuinely only need a boolean. */
export function meetsPrerequisite(prereq: Prerequisite, state: GameState): boolean {
  return evaluatePrerequisite(prereq, state).met;
}
