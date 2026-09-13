import { describe, expect, it } from 'vitest';
import type { GameState } from '../src/types';
import { createNewGame } from '../src/content/initialState';
import { NARRATIVE_EVENTS, NARRATIVE_EVENTS_BY_ID } from '../src/content/events/narrative';
import { NPCS_BY_ID } from '../src/content/npcs';
import { RESOURCES } from '../src/content/resources';
import { FACTION_IDS } from '../src/types';
import {
  choiceAvailability,
  dueScheduledEvents,
  eligibleEvents,
  eventById,
  resolveEventChoice,
  selectDailyEvent,
} from '../src/engine/events';
import { simulateDay } from '../src/engine/simulation';
import { createRng } from '../src/engine/rng';
import { migrateSave, serializeSave } from '../src/state/save';

function fresh(seed = 1234): GameState {
  return createNewGame(seed);
}

/**
 * A fresh game on a later day. Day 1 has nothing eligible on purpose — no
 * event's premise is true before the player has done anything — so most
 * eligibility tests need a clock that has moved.
 */
function onDay(day: number, seed = 1234): GameState {
  const state = fresh(seed);
  return { ...state, clock: { ...state.clock, day } };
}

/* ------------------------------------------------------------------ *
 * Content integrity — a typo in authored data is a broken game, and
 * these are the checks a human reviewer cannot do by eye across 24
 * events with three choices each.
 * ------------------------------------------------------------------ */

describe('narrative event content', () => {
  it('has unique ids and an index that agrees with the roster', () => {
    const ids = NARRATIVE_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(NARRATIVE_EVENTS_BY_ID)).toHaveLength(NARRATIVE_EVENTS.length);
    for (const event of NARRATIVE_EVENTS) {
      expect(eventById(event.id)).toBe(event);
    }
  });

  it('gives every event at least two choices with unique ids', () => {
    for (const event of NARRATIVE_EVENTS) {
      expect(event.choices.length, event.id).toBeGreaterThanOrEqual(2);
      const ids = event.choices.map((c) => c.id);
      expect(new Set(ids).size, event.id).toBe(ids.length);
    }
  });

  it('gives every event at least one unconditional choice, so no event is a dead end', () => {
    for (const event of NARRATIVE_EVENTS) {
      expect(event.choices.some((c) => !c.requires), event.id).toBe(true);
    }
  });

  it('writes a flag on every choice — a choice that leaves no trace is a button', () => {
    for (const event of NARRATIVE_EVENTS) {
      for (const choice of event.choices) {
        const wrote = (choice.effects.setFlags?.length ?? 0) + (choice.effects.clearFlags?.length ?? 0);
        expect(wrote, `${event.id}/${choice.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('names flags as <domain>.<subject>_<verb> per STORY.md §3', () => {
    for (const event of NARRATIVE_EVENTS) {
      for (const choice of event.choices) {
        for (const flag of [...(choice.effects.setFlags ?? []), ...(choice.effects.clearFlags ?? [])]) {
          expect(flag, `${event.id}/${choice.id}`).toMatch(/^[a-z]+\.[a-z0-9_]+$/);
        }
      }
    }
  });

  it('references only real npcs, resources, factions and events', () => {
    for (const event of NARRATIVE_EVENTS) {
      if (event.speakerNpcId) expect(NPCS_BY_ID[event.speakerNpcId], event.id).toBeDefined();

      for (const bond of event.requires?.bond ?? []) {
        expect(NPCS_BY_ID[bond.npcId], event.id).toBeDefined();
      }

      for (const choice of event.choices) {
        const where = `${event.id}/${choice.id}`;

        for (const bond of choice.requires?.bond ?? []) {
          expect(NPCS_BY_ID[bond.npcId], where).toBeDefined();
        }
        for (const item of choice.requires?.inventory ?? []) {
          expect(RESOURCES[item.resourceId], where).toBeDefined();
        }
        for (const npc of choice.effects.npc ?? []) {
          expect(NPCS_BY_ID[npc.npcId], where).toBeDefined();
        }
        for (const item of choice.effects.items ?? []) {
          expect(RESOURCES[item.resourceId], where).toBeDefined();
        }
        for (const impact of choice.effects.factions ?? []) {
          expect(FACTION_IDS, where).toContain(impact.factionId);
        }
        // A scheduled follow-up that points at nothing is a consequence that
        // silently never arrives — the exact failure this test exists for.
        for (const scheduled of choice.effects.scheduled ?? []) {
          expect(eventById(scheduled.eventId), `${where} → ${scheduled.eventId}`).toBeDefined();
          expect(scheduled.inDays, where).toBeGreaterThan(0);
        }
      }
    }
  });

  it('makes every scheduled-only event reachable from some choice', () => {
    const scheduledFrom = new Set(
      NARRATIVE_EVENTS.flatMap((e) =>
        e.choices.flatMap((c) => (c.effects.scheduled ?? []).map((s) => s.eventId)),
      ),
    );

    for (const event of NARRATIVE_EVENTS.filter((e) => e.scheduledOnly)) {
      expect(scheduledFrom, event.id).toContain(event.id);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Eligibility and selection
 * ------------------------------------------------------------------ */

describe('event eligibility', () => {
  it('never offers a scheduled-only event as an ambient one, even once its flag is set', () => {
    const retaliation = eventById('sluice_order_retaliation')!;
    const state = fresh();
    const armed: GameState = {
      ...state,
      clock: { ...state.clock, day: 30 },
      player: { ...state.player, flags: ['mystery.saw_the_sluices'] },
    };

    // Its premise is now true, which is exactly when the bug would bite: the
    // consequence for a day-20 decision must not arrive on day 21.
    expect(choiceAvailability(retaliation.choices[0], armed).met).toBe(true);
    expect(eligibleEvents(armed)).not.toContain(retaliation);
  });

  it('offers nothing at all on day 1 — no premise is true before the player acts', () => {
    expect(eligibleEvents(fresh())).toEqual([]);
  });

  it('opens the first event inside the first week, so the system is met early', () => {
    const firstOpenDay = [1, 2, 3, 4, 5, 6, 7].find((day) => eligibleEvents(onDay(day)).length > 0);
    expect(firstOpenDay).toBeDefined();
    expect(firstOpenDay!).toBeLessThanOrEqual(7);
  });

  it('excludes a non-repeatable event once it has fired, and keeps a repeatable one', () => {
    const state = onDay(30);
    const open = eligibleEvents(state);
    expect(open.length).toBeGreaterThan(0);

    const once = open.find((e) => !e.repeatable)!;
    const again = NARRATIVE_EVENTS.find((e) => e.repeatable)!;

    const after: GameState = { ...state, firedEvents: [once.id, again.id] };
    expect(eligibleEvents(after)).not.toContain(once);
    expect(eligibleEvents(after)).toContain(again);
  });

  it('excludes an event already queued, so the same question is not asked twice', () => {
    const state = onDay(30);
    const first = eligibleEvents(state)[0]!;
    expect(eligibleEvents(state, [first.id])).not.toContain(first);
  });

  it('never offers an event whose every choice is locked', () => {
    const state = onDay(30);
    for (const event of eligibleEvents(state)) {
      expect(event.choices.some((c) => choiceAvailability(c, state).met), event.id).toBe(true);
    }
  });

  it('respects the premise: an unrest event is not eligible in a calm kingdom', () => {
    const cistern = eventById('cistern_queue_turns')!;
    const state = onDay(30);

    const calm: GameState = { ...state, kingdom: { ...state.kingdom, unrest: 20 } };
    const boiling: GameState = { ...state, kingdom: { ...state.kingdom, unrest: 70 } };

    expect(eligibleEvents(calm)).not.toContain(cistern);
    expect(eligibleEvents(boiling)).toContain(cistern);
  });
});

describe('daily selection', () => {
  it('is deterministic for a given seed and day', () => {
    const state = onDay(30);
    const a = selectDailyEvent(state, createRng('seed:events'));
    const b = selectDailyEvent(state, createRng('seed:events'));
    expect(a?.id).toBe(b?.id);
  });

  it('never stacks a second question on an unanswered one', () => {
    const state = onDay(30);
    for (let i = 0; i < 50; i += 1) {
      expect(selectDailyEvent(state, createRng(`s${i}`), ['ashes_bread_queue'])).toBeNull();
    }
  });

  it('leaves quiet days — the world does not interrupt every morning', () => {
    const base = onDay(30);
    const state = { ...base, kingdom: { ...base.kingdom, unrest: 70, publicHealth: 30 } };
    let quiet = 0;
    for (let i = 0; i < 200; i += 1) {
      if (selectDailyEvent(state, createRng(`day${i}`)) === null) quiet += 1;
    }
    expect(quiet).toBeGreaterThan(20);
    expect(quiet).toBeLessThan(180);
  });

  it('only ever picks from the eligible pool', () => {
    const state = onDay(30);
    const pool = eligibleEvents(state);
    for (let i = 0; i < 100; i += 1) {
      const picked = selectDailyEvent(state, createRng(`p${i}`));
      if (picked) expect(pool).toContain(picked);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Resolution
 * ------------------------------------------------------------------ */

describe('resolving a choice', () => {
  const event = eventById('ashes_bread_queue')!;

  function armed(): GameState {
    const state = fresh();
    return {
      ...state,
      kingdom: { ...state.kingdom, welfare: 40 },
      pendingEvents: [event.id],
    };
  }

  it('applies the effects, records the flag, and marks the event fired', () => {
    const before = armed();
    const result = resolveEventChoice(before, event.id, 'work_the_line');

    expect(result.ok).toBe(true);
    expect(result.state.player.standingPoints).toBe(before.player.standingPoints + 22);
    expect(result.state.player.flags).toContain('ashes.served_the_dole');
    expect(result.state.firedEvents).toContain(event.id);
    expect(result.outcome).toBe(event.choices[0].outcome);
  });

  it('grants standing, which is the whole point — jobs alone cannot carry the ladder', () => {
    let granted = 0;
    for (const e of NARRATIVE_EVENTS) {
      for (const c of e.choices) granted += c.effects.standingPoints ?? 0;
    }

    // Peasant→Villager alone wants 300 standing against sharply diminishing
    // job returns, and Burgher wants 800. The roster has to be able to
    // contribute on that scale or it is not the fix it is meant to be.
    expect(granted).toBeGreaterThan(800);
  });

  it('refuses a locked choice and changes nothing', () => {
    const poor: GameState = {
      ...armed(),
      player: { ...armed().player, currencies: { ...armed().player.currencies, copper: 10 } },
    };

    const result = resolveEventChoice(poor, event.id, 'buy_the_shortfall');
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('90 copper');
    expect(result.state).toBe(poor);
  });

  it('refuses an unknown event or choice without throwing', () => {
    expect(resolveEventChoice(armed(), 'no_such_event', 'x').ok).toBe(false);
    expect(resolveEventChoice(armed(), event.id, 'no_such_choice').ok).toBe(false);
  });

  it('schedules the follow-up on a future day rather than now', () => {
    const state = fresh();
    const mira = state.npcs.mira;
    const trusting: GameState = {
      ...state,
      clock: { ...state.clock, day: 40 },
      npcs: { ...state.npcs, mira: { ...mira, relationship: { ...mira.relationship, trust: 60 } } },
    };

    const result = resolveEventChoice(trusting, 'mira_asks_you_to_look', 'help_her_prove_it');
    expect(result.ok).toBe(true);

    const followUp = result.state.scheduled.find((s) => s.eventId === 'sluice_order_retaliation');
    expect(followUp).toBeDefined();
    expect(followUp!.fireOnDay).toBe(54);
  });

  it('lets a repeatable event come round again, but only after its cooldown', () => {
    const cistern = eventById('cistern_queue_turns')!;
    const cooldown = cistern.cooldownDays!;
    expect(cooldown).toBeGreaterThan(0);

    const base = onDay(40);
    const boiling: GameState = {
      ...base,
      kingdom: { ...base.kingdom, unrest: 70 },
      pendingEvents: [cistern.id],
    };

    const result = resolveEventChoice(boiling, cistern.id, 'open_the_gate');
    expect(result.ok).toBe(true);
    expect(result.state.firedEvents).not.toContain(cistern.id);
    expect(result.state.eventHistory[cistern.id]).toBe(40);

    // The queue does not re-form the next morning just because unrest is
    // still high — that turns the world into a loop rather than a world.
    const nextDay = { ...result.state, clock: { ...result.state.clock, day: 41 } };
    expect(eligibleEvents(nextDay)).not.toContain(cistern);

    const stillEarly = {
      ...result.state,
      clock: { ...result.state.clock, day: 40 + cooldown - 1 },
    };
    expect(eligibleEvents(stillEarly)).not.toContain(cistern);

    const due = { ...result.state, clock: { ...result.state.clock, day: 40 + cooldown } };
    expect(eligibleEvents(due)).toContain(cistern);
  });

  it('never puts a non-repeatable event on cooldown instead of retiring it', () => {
    for (const event of NARRATIVE_EVENTS) {
      if (!event.repeatable) expect(event.cooldownDays, event.id).toBeUndefined();
      else expect(event.cooldownDays, event.id).toBeGreaterThan(0);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The pipeline, and persistence
 * ------------------------------------------------------------------ */

describe('events in the day pipeline', () => {
  it('queues an event across a run of days and stays deterministic', () => {
    const run = (): string[] => {
      let state = fresh(99);
      const seen: string[] = [];
      for (let i = 0; i < 40; i += 1) {
        state = simulateDay(state).state;
        for (const id of state.pendingEvents) if (!seen.includes(id)) seen.push(id);
        // Answer with the first open choice so the queue keeps moving.
        const pending = state.pendingEvents[0];
        if (pending) {
          const def = eventById(pending)!;
          const open = def.choices.find((c) => choiceAvailability(c, state).met)!;
          const resolved = resolveEventChoice(state, pending, open.id);
          state = {
            ...resolved.state,
            pendingEvents: resolved.state.pendingEvents.filter((id) => id !== pending),
          };
        }
      }
      return seen;
    };

    const first = run();
    expect(first.length).toBeGreaterThan(0);
    expect(run()).toEqual(first);
  });

  it('fires a scheduled consequence on its day and not before', () => {
    const state = fresh(7);
    const armed: GameState = {
      ...state,
      clock: { ...state.clock, day: 20 },
      player: { ...state.player, flags: ['ague.kept_it_quiet'] },
      scheduled: [{ eventId: 'ague_returns', fireOnDay: 25, source: 'test' }],
    };

    expect(dueScheduledEvents(armed, 24)).toEqual([]);
    expect(dueScheduledEvents(armed, 25).map((e) => e.id)).toEqual(['ague_returns']);

    let walked = armed;
    for (let day = 21; day <= 24; day += 1) {
      walked = simulateDay(walked).state;
      expect(walked.pendingEvents).not.toContain('ague_returns');
    }
    walked = simulateDay(walked).state;
    expect(walked.clock.day).toBe(25);
    expect(walked.pendingEvents).toContain('ague_returns');
    expect(walked.scheduled.some((s) => s.eventId === 'ague_returns')).toBe(false);
  });

  it('does not re-queue an event that is already waiting', () => {
    const state = fresh(11);
    const waiting: GameState = {
      ...state,
      clock: { ...state.clock, day: 30 },
      pendingEvents: ['ashes_bread_queue'],
    };
    const next = simulateDay(waiting).state;
    expect(next.pendingEvents.filter((id) => id === 'ashes_bread_queue')).toHaveLength(1);
    expect(next.pendingEvents).toHaveLength(1);
  });

  it('carries an unanswered event through a save round-trip', () => {
    const state = fresh(5);
    const waiting: GameState = { ...state, pendingEvents: ['rin_dye_contract'] };
    const restored = migrateSave(JSON.parse(serializeSave(waiting)));
    expect(restored?.pendingEvents).toEqual(['rin_dye_contract']);
  });

  it('migrates a pre-event-engine save to an empty queue rather than undefined', () => {
    const state = fresh(5) as GameState & { pendingEvents?: string[] };
    const legacy = JSON.parse(serializeSave(state));
    delete legacy.pendingEvents;
    legacy.version = 3;

    const restored = migrateSave(legacy);
    expect(restored?.pendingEvents).toEqual([]);
  });
});
