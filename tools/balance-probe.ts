/**
 * Balance probe — run `npm run probe` to print a year of simulated days and
 * the shortfall breakdown for any day you care about.
 *
 * This is a development tool, not a test. Use it when tuning resource output,
 * demand, storage, or season curves: the numbers a spreadsheet predicts and
 * the numbers the pipeline actually produces diverge quickly once chained
 * production and reserves are involved.
 */
import { createNewGame } from '../src/content/initialState';
import { RESOURCE_LIST } from '../src/content/resources';
import { simulateDay } from '../src/engine/simulation';
import { simulateConsumption, simulateProduction } from '../src/engine/economy';
import { activePerks } from '../src/engine/relationships';
import type { GameState } from '../src/types';

const SEED = Number(process.argv[2] ?? 2026);
const DAYS = Number(process.argv[3] ?? 120);

let state = createNewGame(SEED);

console.log(`\nValenreach balance probe — seed ${SEED}, ${DAYS} days\n`);
console.log(' day  season   welfare  unrest  prosper  population   water$  bread$');
console.log(' ' + '-'.repeat(72));

for (let i = 0; i < DAYS; i += 1) {
  state = simulateDay(state).state;
  if (state.clock.day % 15 === 0 || state.clock.day === 2) {
    console.log(
      ' ' +
        [
          String(state.clock.day).padStart(3),
          state.clock.season.padEnd(7),
          state.kingdom.welfare.toFixed(0).padStart(8),
          state.kingdom.unrest.toFixed(0).padStart(7),
          state.kingdom.prosperity.toFixed(0).padStart(8),
          String(state.kingdom.population).padStart(11),
          String(state.market.water.currentPrice).padStart(8),
          String(state.market.bread.currentPrice).padStart(7),
        ].join(' '),
    );
  }
}

printShortfalls(state);

function printShortfalls(s: GameState): void {
  const perks = activePerks(s.npcs);
  const production = simulateProduction(
    s.npcs,
    s.facilities,
    s.market,
    s.clock.season,
    s.clock.weather,
    perks,
    s.kingdom.population,
  );
  const consumption = simulateConsumption(
    s.market,
    production.produced,
    production.inputsConsumed,
    s.kingdom.population,
  );

  console.log(`\n Supply on day ${s.clock.day} (${s.clock.season}, ${s.clock.weather}):\n`);
  console.log(' resource       produced   demand   short   stored    cover   band');
  console.log(' ' + '-'.repeat(72));

  for (const resource of RESOURCE_LIST) {
    const m = s.market[resource.id];
    console.log(
      ' ' +
        [
          resource.id.padEnd(13),
          (production.produced[resource.id] ?? 0).toFixed(0).padStart(8),
          (consumption.demanded[resource.id] ?? 0).toFixed(0).padStart(8),
          ((consumption.shortfall[resource.id] ?? 0) * 100).toFixed(0).padStart(6) + '%',
          m.stored.toFixed(0).padStart(8),
          m.daysOfCover.toFixed(1).padStart(8),
          '  ' + m.supplyBand,
        ].join(' '),
    );
  }
  console.log('');
}
