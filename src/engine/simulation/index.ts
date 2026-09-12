import type {
  DigestEntry,
  MarketState,
  NpcStatus,
  FacilityState,
  FactionId,
  FactionState,
  GameState,
  KingdomStats,
  NpcState,
  PerkDefinition,
  Season,
  Weather,
} from '../../types';
import { DAYS_PER_SEASON, FACTION_IDS } from '../../types';
import { RESOURCES, RESOURCE_LIST } from '../../content/resources';
import { createDayRng, type Rng } from '../rng';
import {
  simulateConsumption,
  simulateMarket,
  simulateProduction,
  type ConsumptionResult,
} from '../economy';
import { activePerks, dailyRelationshipDrift, perkMultiplier } from '../relationships';

export interface DayResult {
  state: GameState;
  digest: DigestEntry[];
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/* ------------------------------------------------------------------ *
 * Stage 1 — clock
 * ------------------------------------------------------------------ */

export function seasonForDay(day: number): Season {
  const seasons: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const index = Math.floor(((Math.max(1, day) - 1) % (DAYS_PER_SEASON * 4)) / DAYS_PER_SEASON);
  return seasons[index];
}

export function yearForDay(day: number): number {
  return Math.floor((Math.max(1, day) - 1) / (DAYS_PER_SEASON * 4)) + 1;
}

/** Weather is rolled within the season's distribution. Drought has teeth. */
export function rollWeather(season: Season, rng: Rng): Weather {
  const table: Record<Season, [Weather, number][]> = {
    Spring: [
      ['Clear', 34],
      ['Overcast', 26],
      ['Rain', 30],
      ['Storm', 8],
      ['Frost', 2],
    ],
    Summer: [
      ['Clear', 48],
      ['Overcast', 20],
      ['Rain', 16],
      ['Storm', 10],
      ['Drought', 6],
    ],
    Autumn: [
      ['Clear', 30],
      ['Overcast', 30],
      ['Rain', 26],
      ['Storm', 9],
      ['Frost', 5],
    ],
    Winter: [
      ['Overcast', 32],
      ['Clear', 20],
      ['Snow', 28],
      ['Frost', 16],
      ['Storm', 4],
    ],
  };

  return rng.weighted(table[season], ([, w]) => w)[0];
}

/* ------------------------------------------------------------------ *
 * Stage 2 — player upkeep
 * ------------------------------------------------------------------ */

function upkeepPlayer(state: GameState, digest: DigestEntry[]): GameState['player'] {
  const p = state.player;
  const v = p.vitals;

  const hunger = clamp(v.hunger + 16);
  // Hunger only bites past two-thirds; below that the player simply feels it.
  const starving = hunger >= 70;
  const healthDelta = starving ? -(hunger - 60) * 0.25 : +8;

  if (starving) {
    digest.push({
      stage: 'player',
      message: 'You went to sleep hungry, and it shows.',
      tone: 'bad',
      delta: Math.round(healthDelta),
    });
  }

  return {
    ...p,
    vitals: {
      ...v,
      energy: v.maxEnergy,
      hunger,
      health: clamp(v.health + healthDelta, 1, 100),
    },
  };
}

/* ------------------------------------------------------------------ *
 * Stage 3 — NPC condition
 * ------------------------------------------------------------------ */

function progressNpcConditions(
  npcs: Record<string, NpcState>,
  kingdom: KingdomStats,
  perks: PerkDefinition[],
  rng: Rng,
  digest: DigestEntry[],
): Record<string, NpcState> {
  const next: Record<string, NpcState> = {};
  const recoveryRate = perkMultiplier(perks, 'illness_recovery');

  // A sick kingdom makes sick people. Public health drives the illness roll.
  const baseIllnessChance = 0.012 + Math.max(0, (55 - kingdom.publicHealth) / 100) * 0.05;

  for (const [id, npc] of Object.entries(npcs)) {
    const c = npc.condition;

    if (c.status === 'Deceased') {
      next[id] = npc;
      continue;
    }

    let health = c.health;
    let status: NpcStatus = c.status;
    let daysInStatus = c.daysInStatus;

    if (status === 'Sick' || status === 'Injured' || status === 'Critical') {
      daysInStatus += 1;
      // Illness bites for the first few days and then resolves on its own —
      // but only in a kingdom that can care for its sick. Where public health
      // has collapsed, the same illness kills, which makes an NPC death a
      // consequence of mismanagement rather than an unavoidable dice roll.
      // Recovery is not automatic — it is *care*, and care scales with the
      // kingdom's public health. A well-tended city shrugs off a fever in a
      // week; a collapsed one buries her. That makes an NPC death the
      // consequence of something the player could have prevented.
      const care = Math.max(0.05, kingdom.publicHealth / 100);
      const drift = -5 + (recoveryRate * 3 + daysInStatus * 1.4) * care;
      health = clamp(health + drift, 0, c.maxHealth);

      if (health <= 0) {
        status = 'Deceased';
        digest.push({
          stage: 'npcs',
          message: `${id} did not survive the night.`,
          tone: 'bad',
        });
      } else if (health < 25) {
        if (status !== 'Critical') {
          status = 'Critical';
          digest.push({
            stage: 'npcs',
            message: `${id} has taken a turn for the worse.`,
            tone: 'bad',
          });
        }
      } else if (health > 70) {
        status = 'Healthy';
        daysInStatus = 0;
        digest.push({ stage: 'npcs', message: `${id} is back on her feet.`, tone: 'good' });
      }
    } else {
      health = clamp(health + 6, 0, c.maxHealth);
      daysInStatus = 0;

      if (rng.chance(baseIllnessChance)) {
        status = 'Sick';
        health = Math.min(health, 62);
        daysInStatus = 1;
        digest.push({ stage: 'npcs', message: `${id} has fallen ill.`, tone: 'bad' });
      }
    }

    next[id] = {
      ...npc,
      condition: { ...c, health, status, daysInStatus },
    };
  }

  return next;
}

/* ------------------------------------------------------------------ *
 * Stage 8 — welfare
 * ------------------------------------------------------------------ */

interface WelfareResult {
  welfare: number;
  publicHealth: number;
  populationDelta: number;
  /** Worst shortfall seen, for the digest. */
  worst: { resourceId: string; shortfall: number } | null;
  /** Worst price stress seen, for the digest. */
  priciest: { resourceId: string; stress: number; ratio: number } | null;
}

/**
 * Shortfall consequences escalate by band. Water is roughly twice as severe
 * as grain: thirst kills faster than hunger, and Valenreach is built on one
 * aqueduct.
 */
function resolveWelfare(
  kingdom: KingdomStats,
  consumption: ConsumptionResult,
  market: Record<string, MarketState>,
): WelfareResult {
  let pressure = 0;
  let worst: WelfareResult['worst'] = null;
  let priciest: WelfareResult['priciest'] = null;

  for (const resource of RESOURCE_LIST) {
    const severity =
      resource.id === 'water'
        ? 2
        : resource.category === 'survival'
          ? 1
          : resource.category === 'medicine'
            ? 0.6
            : 0.12;

    // An empty store is famine.
    const shortfall = consumption.shortfall[resource.id] ?? 0;
    if (shortfall > 0.01) {
      pressure += shortfall * severity;
      if (!worst || shortfall > worst.shortfall) {
        worst = { resourceId: resource.id, shortfall };
      }
    }

    // A full store nobody can afford is also hunger. Scarcity reaches the
    // population through price long before the granary is empty — which is
    // what makes the market political, and what makes cornering a resource
    // something the kingdom feels.
    // Only the goods nobody can substitute away from bite through price.
    // Apples get dear in winter and people simply stop buying apples.
    const m = market[resource.id];
    if (m && (resource.category === 'survival' || resource.category === 'medicine')) {
      const ratio = m.currentPrice / resource.basePrice;
      const stress = Math.min(1, Math.max(0, ratio - 1.3) / 2.5);
      if (stress > 0) {
        pressure += stress * severity * 0.5;
        if (!priciest || stress > priciest.stress) {
          priciest = { resourceId: resource.id, stress, ratio };
        }
      }
    }
  }

  // Merely feeding people gets the kingdom to tolerable and no further:
  // passive recovery tapers hard above SUBSISTENCE_CEILING, and everything
  // past it has to be built through investment, decrees and development.
  const SUBSISTENCE_CEILING = 68;
  const welfareDelta =
    pressure > 0
      ? -pressure * 9
      : kingdom.welfare < SUBSISTENCE_CEILING
        ? 1.2
        : 0.08;
  const healthDelta = pressure === 0 ? (kingdom.publicHealth < 60 ? 0.8 : 0.05) : -pressure * 5;

  // People leave a failing city, and slowly return to a thriving one.
  const populationDelta =
    pressure > 0.6
      ? -Math.round(kingdom.population * pressure * 0.004)
      : pressure === 0 && kingdom.welfare > 60
        ? Math.round(kingdom.population * 0.0012)
        : 0;

  return {
    welfare: clamp(kingdom.welfare + welfareDelta),
    publicHealth: clamp(kingdom.publicHealth + healthDelta),
    populationDelta,
    worst,
    priciest,
  };
}

/* ------------------------------------------------------------------ *
 * Stages 10-12 — vitals, unrest, factions
 * ------------------------------------------------------------------ */

function resolveKingdom(
  kingdom: KingdomStats,
  welfare: WelfareResult,
  facilities: Record<string, FacilityState>,
): KingdomStats {
  const avgEfficiency =
    Object.values(facilities).reduce((sum, f) => sum + f.efficiency, 0) /
    Math.max(1, Object.keys(facilities).length);

  // Unrest is driven by welfare first, security second.
  const welfareGap = Math.max(0, 55 - welfare.welfare);
  const securityGap = Math.max(0, 50 - kingdom.security);
  const unrestDelta = welfareGap * 0.12 + securityGap * 0.06 - (welfare.welfare > 65 ? 2.2 : 0.8);

  // There is no such thing as a kingdom at zero unrest.
  const unrest = clamp(kingdom.unrest + unrestDelta, 6, 100);

  const prosperityDelta = (avgEfficiency - 0.85) * 3 - (unrest > 60 ? 1.5 : 0) + (welfare.welfare > 60 ? 0.6 : -0.4);

  // High unrest suppresses tax receipts; a frightened city does not trade.
  const taxBase = kingdom.population * 0.55;
  const taxReceipt = Math.round(taxBase * (1 - unrest / 200) * (0.6 + kingdom.prosperity / 200));

  return {
    ...kingdom,
    welfare: welfare.welfare,
    publicHealth: welfare.publicHealth,
    population: Math.max(100, kingdom.population + welfare.populationDelta),
    unrest,
    prosperity: clamp(kingdom.prosperity + prosperityDelta),
    treasury: kingdom.treasury + taxReceipt,
    security: clamp(kingdom.security - (unrest > 65 ? 0.8 : 0) + 0.2),
    piety: clamp(kingdom.piety - 0.1),
  };
}

function driftFactions(
  factions: Record<FactionId, FactionState>,
  kingdom: KingdomStats,
  perks: PerkDefinition[],
): Record<FactionId, FactionState> {
  const next = { ...factions };

  for (const id of FACTION_IDS) {
    const f = factions[id];
    if (!f) continue;

    let opinionDelta = 0;
    let powerDelta = 0;

    // Factions react to the kingdom's condition, not only to the player.
    switch (id) {
      case 'commons':
      case 'refugees':
        opinionDelta = kingdom.welfare > 60 ? 0.4 : kingdom.welfare < 35 ? -0.8 : 0;
        powerDelta = kingdom.unrest > 60 ? 0.5 : -0.1;
        break;
      case 'military':
        opinionDelta = kingdom.treasury > 20000 ? 0.2 : -0.3;
        powerDelta = kingdom.security > 60 ? 0.2 : -0.2;
        break;
      case 'guilds':
        opinionDelta = kingdom.prosperity > 50 ? 0.3 : -0.2;
        powerDelta = kingdom.prosperity > 55 ? 0.3 : -0.1;
        break;
      case 'church':
        opinionDelta = kingdom.piety > 55 ? 0.2 : -0.2;
        powerDelta = kingdom.welfare < 40 ? 0.3 : 0; // suffering fills the pews
        break;
      case 'nobility':
        powerDelta = kingdom.unrest > 55 ? 0.3 : 0;
        break;
      case 'syndicate':
        opinionDelta = kingdom.security < 45 ? 0.3 : -0.2;
        powerDelta = kingdom.unrest > 50 ? 0.4 : -0.1;
        break;
      case 'crown':
        powerDelta = kingdom.unrest > 60 ? -0.4 : 0.1;
        break;
    }

    // Beatrix's pulpit perk, and anything like it, applies here.
    const dailyPerk = perks.find((p) => p.kind === 'faction_daily' && p.target === id);
    if (dailyPerk && f.opinion > 0) opinionDelta += dailyPerk.value;

    next[id] = {
      ...f,
      opinion: clamp(f.opinion + opinionDelta),
      power: clamp(f.power + powerDelta),
    };
  }

  return next;
}

/* ------------------------------------------------------------------ *
 * The orchestrator
 * ------------------------------------------------------------------ */

/**
 * Advance one day through the full pipeline.
 *
 * Pure and deterministic: the same state and seed always produce the same
 * result. The digest is not optional — if the player cannot see why bread
 * doubled in price, the simulation has failed regardless of correctness.
 */
export function simulateDay(state: GameState, interactedToday: string[] = []): DayResult {
  const digest: DigestEntry[] = [];

  const day = state.clock.day + 1;
  const season = seasonForDay(day);
  const year = yearForDay(day);

  const rng = createDayRng(state.seed, day);
  const weatherRng = rng.fork('weather');
  const npcRng = rng.fork('npcs');
  const marketRng = rng.fork('market');

  const weather = rollWeather(season, weatherRng);

  if (season !== state.clock.season) {
    digest.push({ stage: 'clock', message: `${season} comes to Valenreach.`, tone: 'neutral' });
  }
  if (weather === 'Drought' || weather === 'Storm' || weather === 'Frost') {
    digest.push({ stage: 'clock', message: `${weather} over the valley.`, tone: 'bad' });
  }

  const perks = activePerks(state.npcs);

  // 2 — player upkeep
  const player = upkeepPlayer(state, digest);

  // 3 — NPC condition, then relationship drift for anyone ignored
  const conditioned = progressNpcConditions(state.npcs, state.kingdom, perks, npcRng, digest);
  const npcs = dailyRelationshipDrift(conditioned, interactedToday);

  // 4-6 — facilities, production, storage
  const production = simulateProduction(
    npcs,
    state.facilities,
    state.market,
    season,
    weather,
    perks,
    state.kingdom.population,
  );

  for (const resourceId of production.starvedChains) {
    const resource = RESOURCES[resourceId];
    if (!resource) continue;
    digest.push({
      stage: 'production',
      message: `${resource.name} production is starved — the inputs are not arriving.`,
      tone: 'bad',
    });
  }

  // 7 — consumption
  const consumption = simulateConsumption(
    state.market,
    production.produced,
    production.inputsConsumed,
    state.kingdom.population,
  );

  // 9 — market. Resolved before welfare, because price is one of the two
  // ways scarcity reaches the population.
  const market = simulateMarket(state.market, production, consumption, season, marketRng);
  for (const resource of RESOURCE_LIST) {
    const before = state.market[resource.id];
    const after = market[resource.id];
    if (!before || !after) continue;
    const change = (after.currentPrice - before.currentPrice) / Math.max(1, before.currentPrice);
    if (Math.abs(change) >= 0.1) {
      digest.push({
        stage: 'market',
        message: `${resource.name} ${change > 0 ? 'rose' : 'fell'} to ${after.currentPrice} copper — ${after.supplyBand.toLowerCase()}.`,
        tone: change > 0 ? 'bad' : 'good',
        delta: Math.round(change * 100),
      });
    }
  }

  // 8 — welfare
  const welfare = resolveWelfare(state.kingdom, consumption, market);
  if (welfare.worst && welfare.worst.shortfall > 0.05) {
    const resource = RESOURCES[welfare.worst.resourceId];
    const pct = Math.round(welfare.worst.shortfall * 100);
    digest.push({
      stage: 'welfare',
      message: `The city went short of ${resource?.name ?? welfare.worst.resourceId} by ${pct}%.`,
      tone: 'bad',
      delta: -pct,
    });
  }
  if (welfare.priciest && welfare.priciest.stress > 0.25) {
    const resource = RESOURCES[welfare.priciest.resourceId];
    digest.push({
      stage: 'welfare',
      message: `${resource?.name ?? welfare.priciest.resourceId} is priced beyond what the Ashes can pay.`,
      tone: 'bad',
    });
  }
  if (welfare.populationDelta < 0) {
    digest.push({
      stage: 'welfare',
      message: `${Math.abs(welfare.populationDelta)} people left Valenreach, or did not wake.`,
      tone: 'bad',
      delta: welfare.populationDelta,
    });
  }

  // 10-11 — vitals, unrest, prosperity
  const kingdom = resolveKingdom(state.kingdom, welfare, production.facilities);
  if (kingdom.unrest - state.kingdom.unrest > 3) {
    digest.push({
      stage: 'kingdom',
      message: 'Unrest is climbing in the districts.',
      tone: 'bad',
      delta: Math.round(kingdom.unrest - state.kingdom.unrest),
    });
  }

  // 12 — factions
  const factions = driftFactions(state.factions, kingdom, perks);

  // 15 — scheduled consequences come due
  const due = state.scheduled.filter((s) => s.fireOnDay <= day);
  const remaining = state.scheduled.filter((s) => s.fireOnDay > day);
  for (const s of due) {
    digest.push({ stage: 'events', message: `Something you set in motion has arrived.`, tone: 'neutral' });
    void s;
  }

  const nextState: GameState = {
    ...state,
    clock: { day, season, phase: 'Morning', weather, year },
    player,
    kingdom,
    npcs,
    factions,
    facilities: production.facilities,
    market,
    scheduled: remaining,
    lastDigest: digest,
  };

  return { state: nextState, digest };
}
