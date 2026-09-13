import type {
  DigestEntry,
  EventChoice,
  EventDefinition,
  GameState,
  PrereqResult,
} from '../../types';
import { NARRATIVE_EVENTS, NARRATIVE_EVENTS_BY_ID } from '../../content/events/narrative';
import { evaluatePrerequisite } from '../prerequisites';
import { applyEffect } from '../effects';
import type { Rng } from '../rng';

/**
 * The narrative event engine — the thing that makes the simulation ask the
 * player a question.
 *
 * Everything here was already typed and unused: `EventDefinition`,
 * `EventChoice`, `firedEvents`, `scheduled`, `evaluatePrerequisite` and
 * `applyEffect`. This module is the four operations that connect them —
 * eligibility, selection, availability, resolution — and nothing else.
 *
 * Pure, per CLAUDE.md §5.1: randomness arrives as an `Rng` argument, the day
 * arrives as a number, and every function returns new state rather than
 * mutating.
 */

export function eventById(id: string): EventDefinition | undefined {
  return NARRATIVE_EVENTS_BY_ID[id];
}

/**
 * Whether this choice is open to the player, and if not, why not.
 *
 * A locked choice is shown rather than hidden: "Pay her the ninety copper you
 * do not have" is characterising information, and the prerequisite evaluator
 * already returns reasons instead of booleans specifically so the UI can say
 * what is missing.
 */
export function choiceAvailability(choice: EventChoice, state: GameState): PrereqResult {
  if (!choice.requires) return { met: true, failures: [] };
  return evaluatePrerequisite(choice.requires, state);
}

/**
 * Whether a repeatable event was asked too recently to ask again.
 *
 * The premise of a repeatable event can stay true for weeks — a kingdom does
 * not stop being unrestful because you answered once — so without a cooldown
 * the same three questions crowd out the rest of the roster entirely. A probe
 * over 150 days saw 9 distinct events across 46 answers before this existed.
 */
function onCooldown(event: EventDefinition, state: GameState): boolean {
  const cooldown = event.cooldownDays ?? 0;
  if (cooldown <= 0) return false;
  const last = state.eventHistory[event.id];
  if (last === undefined) return false;
  return state.clock.day - last < cooldown;
}

/** At least one choice the player can actually take. */
function hasOpenChoice(event: EventDefinition, state: GameState): boolean {
  return event.choices.some((choice) => choiceAvailability(choice, state).met);
}

/**
 * The events whose premise is true today.
 *
 * The eligibility prerequisite is also the premise (GAME_DESIGN_ANALYSIS §4.2):
 * an event does not describe "a merchant arrives", it describes Rin standing in
 * the doorway about the dye contract, and it is eligible exactly when that is
 * the situation. So the filter is the writing, not a gate in front of it.
 */
export function eligibleEvents(state: GameState, pending: readonly string[] = []): EventDefinition[] {
  const fired = new Set(state.firedEvents);
  const queued = new Set(pending);

  return NARRATIVE_EVENTS.filter((event) => {
    if (event.scheduledOnly) return false;
    if (queued.has(event.id)) return false;
    if (!event.repeatable && fired.has(event.id)) return false;
    if (event.repeatable && onCooldown(event, state)) return false;
    if (event.requires && !evaluatePrerequisite(event.requires, state).met) return false;
    // An event with nothing the player can choose is a dead end, not a scene.
    return hasOpenChoice(event, state);
  });
}

/**
 * Roll the day's ambient event, or null for a quiet day.
 *
 * Quiet days are the point of the chance gate: an interruption every single
 * morning stops reading as the world noticing the player and starts reading as
 * a chore queue. `pending` suppresses the roll entirely — the world does not
 * pile a second question on a player who has not answered the first.
 */
export function selectDailyEvent(
  state: GameState,
  rng: Rng,
  pending: readonly string[] = [],
  dailyChance = 0.45,
): EventDefinition | null {
  if (pending.length > 0) return null;
  if (!rng.chance(dailyChance)) return null;

  const pool = eligibleEvents(state, pending);
  if (pool.length === 0) return null;

  return rng.weighted(pool, (event) => event.weight);
}

/**
 * Scheduled consequences that have come due, resolved to real definitions.
 *
 * A delayed consequence deliberately skips the eligibility filter: the whole
 * value of `Effect.scheduled` is that what you set in motion three weeks ago
 * arrives whether or not today is a convenient day for it.
 */
export function dueScheduledEvents(state: GameState, day: number): EventDefinition[] {
  const seen = new Set<string>(state.pendingEvents);
  const fired = new Set(state.firedEvents);
  const due: EventDefinition[] = [];

  for (const entry of state.scheduled) {
    if (entry.fireOnDay > day) continue;
    if (seen.has(entry.eventId)) continue;
    const event = eventById(entry.eventId);
    if (!event) continue;
    if (!event.repeatable && fired.has(event.id)) continue;
    seen.add(entry.eventId);
    due.push(event);
  }

  return due;
}

export interface EventResolution {
  state: GameState;
  /** Whether the choice was actually taken. */
  ok: boolean;
  /** Why it was refused, when it was. */
  reason?: string;
  /** What happened, in the world's voice — shown to the player after choosing. */
  outcome: string;
  notes: DigestEntry[];
}

/**
 * Take a choice on a pending event.
 *
 * The choice's effects run through `applyEffect`, which is the single place
 * `Effect` becomes state, so an event's consequences reach factions, flags,
 * NPCs, the kingdom and scheduled follow-ups without this module knowing how
 * any of them work.
 */
export function resolveEventChoice(
  state: GameState,
  eventId: string,
  choiceId: string,
  day = state.clock.day,
): EventResolution {
  const event = eventById(eventId);
  if (!event) {
    return { state, ok: false, reason: 'That event is not in the roster.', outcome: '', notes: [] };
  }

  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { state, ok: false, reason: 'That is not one of your options.', outcome: '', notes: [] };
  }

  const availability = choiceAvailability(choice, state);
  if (!availability.met) {
    const failure = availability.failures[0];
    return {
      state,
      ok: false,
      reason: failure ? `${failure.requirement} — ${failure.actual}.` : 'You cannot do that.',
      outcome: '',
      notes: [],
    };
  }

  const applied = applyEffect(state, choice.effects, day);

  // Firing is recorded on resolution rather than on selection, so an event
  // the player never answered can come round again.
  const firedEvents = event.repeatable
    ? applied.state.firedEvents
    : [...new Set([...applied.state.firedEvents, event.id])];

  // A scheduled consequence is spent once it has been answered.
  const scheduled = applied.state.scheduled.filter((s) => s.eventId !== event.id);

  return {
    state: {
      ...applied.state,
      firedEvents,
      scheduled,
      eventHistory: { ...applied.state.eventHistory, [event.id]: day },
    },
    ok: true,
    outcome: choice.outcome,
    notes: [
      { stage: 'events', message: choice.outcome, tone: toneOf(event.tone) },
      ...applied.notes,
    ],
  };
}

function toneOf(tone: EventDefinition['tone']): DigestEntry['tone'] {
  switch (tone) {
    case 'celebration':
    case 'romance':
      return 'good';
    case 'disaster':
    case 'warning':
      return 'bad';
    default:
      return 'neutral';
  }
}
