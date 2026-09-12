import { describe, expect, it } from 'vitest';
import { LIVE_EVENTS, activeEvents, daysRemaining, eventAt } from '../src/content/events';

/**
 * The Home screen's event banner. A pure selector over authored content,
 * load-bearing for honesty: it must never advertise a campaign that has
 * closed.
 */
describe('live events', () => {
  it('only reports events whose day window contains the day', () => {
    for (const event of LIVE_EVENTS) {
      expect(activeEvents(event.startsOnDay)).toContain(event);
      expect(activeEvents(event.endsOnDay)).toContain(event);
      expect(activeEvents(event.startsOnDay - 1)).not.toContain(event);
      expect(activeEvents(event.endsOnDay + 1)).not.toContain(event);
    }
  });

  it('closes a finished campaign instead of advertising it forever', () => {
    const latest = Math.max(...LIVE_EVENTS.map((e) => e.endsOnDay));
    expect(activeEvents(latest + 1)).toEqual([]);
    expect(eventAt(latest + 1, 0)).toBeNull();
  });

  it('cycles the banner within the live set for any index, negative included', () => {
    const live = activeEvents(1);
    expect(live.length).toBeGreaterThan(1);

    for (const index of [0, 1, 2, 7, 41, -1, -6]) {
      const picked = eventAt(1, index);
      expect(picked).not.toBeNull();
      expect(live).toContain(picked!);
    }

    expect(eventAt(1, 0)).toBe(live[0]);
    expect(eventAt(1, live.length)).toBe(live[0]);
  });

  it('counts the remaining days inclusively and never below zero', () => {
    const event = LIVE_EVENTS[0];
    expect(daysRemaining(event, event.endsOnDay)).toBe(1);
    expect(daysRemaining(event, event.endsOnDay - 1)).toBe(2);
    expect(daysRemaining(event, event.endsOnDay + 5)).toBe(0);
  });

  it('points every banner at a screen that exists', () => {
    const screens = ['summon', 'market', 'kingdom', 'characters', 'work', 'council'];
    for (const event of LIVE_EVENTS) {
      expect(screens).toContain(event.screen);
      expect(event.endsOnDay).toBeGreaterThanOrEqual(event.startsOnDay);
    }
  });
});
