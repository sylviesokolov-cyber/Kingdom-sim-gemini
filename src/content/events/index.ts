import type { LiveEventDefinition } from '../../types';

/**
 * The live event roster — what the Home screen's event banner advertises.
 *
 * Every entry points at a screen that already exists and a campaign that is
 * already implemented there; the banner is advertising, not a mechanic of its
 * own. Content is data, not code (CLAUDE.md §5): a new campaign is a new entry
 * here, never a new branch in the Home component.
 *
 * Day windows are absolute in-world days, so an event genuinely closes when
 * the player advances past it — the banner list is derived from the clock, not
 * from a hand-maintained flag.
 */
export const LIVE_EVENTS: LiveEventDefinition[] = [
  {
    id: 'fateful_encounters',
    name: 'Fateful Encounters',
    blurb: 'The Lady of the Harvest answers a summons for the first time.',
    tag: 'SSR Rate Up',
    tone: 'gacha',
    startsOnDay: 1,
    endsOnDay: 30,
    screen: 'summon',
  },
  {
    id: 'spring_grain_writ',
    name: 'The Spring Writ',
    blurb: 'The granaries open their ledgers early. Grain moves cheap while it lasts.',
    tag: 'Trade Window',
    tone: 'market',
    startsOnDay: 1,
    endsOnDay: 18,
    screen: 'market',
  },
  {
    id: 'kindred_call',
    name: 'Kindred Call',
    blurb: 'Cheap summons, generous with keepsakes. Someone always answers.',
    tag: 'Standing',
    tone: 'gacha',
    startsOnDay: 1,
    endsOnDay: 9999,
    screen: 'summon',
  },
];

/** Events live on the given in-world day, in roster order. */
export function activeEvents(day: number): LiveEventDefinition[] {
  return LIVE_EVENTS.filter((e) => day >= e.startsOnDay && day <= e.endsOnDay);
}

/**
 * The event to show on the banner, cycling by index. Returns null when
 * nothing is running, so Home can render an honest empty state rather than a
 * card advertising a campaign that has closed.
 */
export function eventAt(day: number, index: number): LiveEventDefinition | null {
  const live = activeEvents(day);
  if (live.length === 0) return null;
  return live[((index % live.length) + live.length) % live.length] ?? live[0];
}

/** Days remaining, inclusive of today. Used for the `N days left` line. */
export function daysRemaining(event: LiveEventDefinition, day: number): number {
  return Math.max(0, event.endsOnDay - day + 1);
}
