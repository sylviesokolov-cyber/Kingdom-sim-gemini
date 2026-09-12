import type {
  FacilityState,
  MarketState,
  NpcState,
  PerkDefinition,
  ResourceDefinition,
  Season,
  SupplyBand,
  Weather,
} from '../../types';
import { RESOURCES, RESOURCE_LIST } from '../../content/resources';
import { FACILITIES } from '../../content/world';
import { perkMultiplier } from '../relationships';
import type { Rng } from '../rng';

/* ------------------------------------------------------------------ *
 * Efficiency
 * ------------------------------------------------------------------ */

/** An NPC's condition governs the facility she runs. This is the top of the chain. */
export function overseerEfficiency(npc: NpcState | undefined): number {
  if (!npc) return 0.5;

  switch (npc.condition.status) {
    case 'Deceased':
    case 'Missing':
    case 'Imprisoned':
      // Nobody is running the facility. Skeleton output only.
      return 0.2;
    case 'Critical':
      return 0.25;
    case 'Sick':
    case 'Injured':
      return 0.45;
    case 'Fatigued':
      return 0.75;
    case 'Healthy':
    default:
      break;
  }

  // A loyal overseer works harder. Resentment shows up in the output.
  const loyalty = (npc.relationship.trust + npc.relationship.affection) / 200;
  const resentment = npc.relationship.resentment / 200;
  return Math.max(0.3, 1 + loyalty * 0.25 - resentment * 0.3) * npc.efficiencyModifier;
}

export function seasonProductionModifier(
  season: Season,
  profile: ResourceDefinition['seasonProfile'],
): number {
  switch (profile) {
    case 'crop':
      // The harvest curve: everything is grown, stored, and then endured.
      return season === 'Autumn' ? 1.3 : season === 'Summer' ? 1.1 : season === 'Winter' ? 0.45 : 1;
    case 'water':
      // Snowmelt. High in spring, lowest when the melt stops.
      return season === 'Spring' ? 1.25 : season === 'Winter' ? 0.75 : season === 'Autumn' ? 0.9 : 1;
    case 'harvest':
      return season === 'Summer' ? 1.1 : season === 'Winter' ? 0.7 : 1;
    case 'processed':
      return season === 'Winter' ? 0.95 : 1;
    case 'industry':
    default:
      return season === 'Winter' ? 0.9 : 1;
  }
}

export function weatherProductionModifier(
  weather: Weather,
  profile: ResourceDefinition['seasonProfile'],
): number {
  const exposed = profile === 'crop' || profile === 'harvest' || profile === 'water';
  if (!exposed) return weather === 'Storm' ? 0.92 : 1;

  switch (weather) {
    case 'Drought':
      // The one that starts campaigns. Water suffers worst of all.
      return profile === 'water' ? 0.45 : 0.6;
    case 'Storm':
      return profile === 'harvest' ? 0.55 : 0.8;
    case 'Frost':
      return profile === 'crop' ? 0.72 : 0.9;
    case 'Snow':
      return profile === 'crop' ? 0.82 : 0.9;
    case 'Rain':
      return profile === 'water' ? 1.12 : profile === 'crop' ? 1.06 : 0.95;
    case 'Overcast':
    case 'Clear':
    default:
      return 1;
  }
}

/* ------------------------------------------------------------------ *
 * Production
 * ------------------------------------------------------------------ */

export interface ProductionResult {
  /** Gross output attempted, before input constraints. */
  attempted: Record<string, number>;
  /** Output actually produced after inputs were consumed. */
  produced: Record<string, number>;
  /** Inputs consumed by chained production. */
  inputsConsumed: Record<string, number>;
  /** Facility efficiencies applied this day, for the UI. */
  facilities: Record<string, FacilityState>;
  /** Resource ids whose chain was starved by a missing input. */
  starvedChains: string[];
}

/**
 * Resolve production. Chained resources draw their inputs from storage, so
 * breaking an input line starves the whole chain two days later — exactly the
 * legible cascade the simulation exists to produce.
 */
export function simulateProduction(
  npcs: Record<string, NpcState>,
  facilities: Record<string, FacilityState>,
  market: Record<string, MarketState>,
  season: Season,
  weather: Weather,
  perks: PerkDefinition[],
  population: number,
): ProductionResult {
  const attempted: Record<string, number> = {};
  const produced: Record<string, number> = {};
  const inputsConsumed: Record<string, number> = {};
  const nextFacilities: Record<string, FacilityState> = {};
  const starvedChains: string[] = [];

  // Track what is available to spend on chained production this tick.
  const available: Record<string, number> = {};
  for (const [id, m] of Object.entries(market)) available[id] = m.stored;

  // Stage 1: raw resources (no inputs), so chains have something to draw on.
  const ordered = [...RESOURCE_LIST].sort((a, b) => (a.inputs ? 1 : 0) - (b.inputs ? 1 : 0));

  for (const resource of ordered) {
    const facility = FACILITIES.find((f) => f.id === resource.sourceFacility);
    if (!facility) continue;

    const facilityState = facilities[facility.id];
    const npc = npcs[facility.overseerNpcId];

    const efficiency =
      overseerEfficiency(npc) *
      seasonProductionModifier(season, resource.seasonProfile) *
      weatherProductionModifier(weather, resource.seasonProfile) *
      (1 + (facilityState?.level ?? 1) * 0.08) *
      perkMultiplier(perks, 'production_multiplier', resource.id);

    const gross = Math.max(0, resource.baseOutput * efficiency);
    attempted[resource.id] = (attempted[resource.id] ?? 0) + gross;

    // Chained resources are limited by their scarcest input — and the
    // bakeries do not take grain out of people's mouths: the population's own
    // direct demand for an input is reserved before any workshop draws on it.
    let actual = gross;
    if (resource.inputs) {
      for (const input of resource.inputs) {
        const inputDef = RESOURCES[input.resourceId];
        // The reserve is the granary principle: workshops draw only on what
        // is left once the kingdom holds a healthy stock of the raw good. It
        // is what lets autumn bank a surplus that winter can live on.
        const reserved = inputDef
          ? population * inputDef.perCapitaDemand * inputDef.parCover
          : 0;
        const have = Math.max(0, (available[input.resourceId] ?? 0) - reserved);
        actual = Math.min(actual, have / input.amount);
      }

      // Nor do they run the ovens to fill a store that is already spoiling.
      const headroom = Math.max(
        0,
        resource.storageCapacity - (market[resource.id]?.stored ?? 0),
      );
      actual = Math.min(actual, headroom + population * resource.perCapitaDemand);

      if (actual < gross * 0.95) starvedChains.push(resource.id);

      for (const input of resource.inputs) {
        const used = actual * input.amount;
        available[input.resourceId] = Math.max(0, (available[input.resourceId] ?? 0) - used);
        inputsConsumed[input.resourceId] = (inputsConsumed[input.resourceId] ?? 0) + used;
      }
    }

    actual = Math.max(0, actual);
    produced[resource.id] = (produced[resource.id] ?? 0) + actual;
    available[resource.id] = (available[resource.id] ?? 0) + actual;

    nextFacilities[facility.id] = {
      ...(facilityState ?? {
        id: facility.id,
        name: facility.name,
        district: facility.district,
        overseerNpcId: facility.overseerNpcId,
        resourceId: facility.resourceId,
        level: 1,
        efficiency: 1,
      }),
      efficiency,
    };
  }

  // Carry through facilities we did not touch.
  for (const [id, state] of Object.entries(facilities)) {
    if (!nextFacilities[id]) nextFacilities[id] = state;
  }

  return { attempted, produced, inputsConsumed, facilities: nextFacilities, starvedChains };
}

/* ------------------------------------------------------------------ *
 * Consumption
 * ------------------------------------------------------------------ */

export interface ConsumptionResult {
  demanded: Record<string, number>;
  consumed: Record<string, number>;
  /** Fraction of demand that went unmet, 0-1. */
  shortfall: Record<string, number>;
  /** Units lost to spoilage. */
  spoiled: Record<string, number>;
}

export function simulateConsumption(
  market: Record<string, MarketState>,
  produced: Record<string, number>,
  inputsConsumed: Record<string, number>,
  population: number,
): ConsumptionResult {
  const demanded: Record<string, number> = {};
  const consumed: Record<string, number> = {};
  const shortfall: Record<string, number> = {};
  const spoiled: Record<string, number> = {};

  for (const resource of RESOURCE_LIST) {
    const m = market[resource.id];
    if (!m) continue;

    const afterProduction = Math.max(
      0,
      m.stored + (produced[resource.id] ?? 0) - (inputsConsumed[resource.id] ?? 0),
    );

    const demand = population * resource.perCapitaDemand;
    const taken = Math.min(afterProduction, demand);
    const remaining = afterProduction - taken;
    const lost = remaining * resource.spoilageRate;

    demanded[resource.id] = demand;
    consumed[resource.id] = taken;
    shortfall[resource.id] = demand > 0 ? Math.max(0, (demand - taken) / demand) : 0;
    spoiled[resource.id] = lost;
  }

  return { demanded, consumed, shortfall, spoiled };
}

/* ------------------------------------------------------------------ *
 * Storage and pricing
 * ------------------------------------------------------------------ */

/**
 * Scarcity is relative to what a healthy stock of THIS resource looks like.
 * Eight days of bread is impossible; eight days of iron is unremarkable.
 */
export function supplyBandFor(daysOfCover: number, parCover: number): SupplyBand {
  const ratio = daysOfCover / Math.max(0.1, parCover);
  if (ratio < 0.25) return 'Critically Scarce';
  if (ratio < 0.6) return 'Scarce';
  if (ratio < 1.5) return 'Normal';
  if (ratio < 3) return 'Abundant';
  return 'Surplus';
}

/** Price movement is damped: real economies have inertia, and unbounded
 *  swings make trading unplayable. */
export const MAX_DAILY_PRICE_MOVE = 0.18;

export function simulateMarket(
  market: Record<string, MarketState>,
  production: ProductionResult,
  consumption: ConsumptionResult,
  season: Season,
  rng: Rng,
): Record<string, MarketState> {
  const next: Record<string, MarketState> = {};

  for (const resource of RESOURCE_LIST) {
    const m = market[resource.id];
    if (!m) continue;

    const produced = production.produced[resource.id] ?? 0;
    const inputUse = production.inputsConsumed[resource.id] ?? 0;
    const consumed = consumption.consumed[resource.id] ?? 0;
    const spoiled = consumption.spoiled[resource.id] ?? 0;

    const stored = Math.max(
      0,
      Math.min(resource.storageCapacity, m.stored + produced - inputUse - consumed - spoiled),
    );

    const dailyDemand = consumption.demanded[resource.id] ?? 0;
    const daysOfCover = dailyDemand > 0 ? stored / dailyDemand : 99;

    // Supply/demand ratio drives price; scarcity below par pushes it up.
    const ratio = dailyDemand > 0 ? Math.max(0.05, daysOfCover / resource.parCover) : 1;
    const seasonMod = season === 'Winter' ? 1.12 : season === 'Autumn' ? 0.94 : 1;
    const target =
      resource.basePrice * Math.pow(1 / ratio, resource.elasticity * 0.5) * seasonMod;

    const noise = rng.float(-0.02, 0.02);
    const desired = target * (1 + noise);
    const maxUp = m.currentPrice * (1 + MAX_DAILY_PRICE_MOVE);
    const maxDown = m.currentPrice * (1 - MAX_DAILY_PRICE_MOVE);
    const currentPrice = Math.max(1, Math.round(Math.min(maxUp, Math.max(maxDown, desired))));

    next[resource.id] = {
      resourceId: resource.id,
      currentPrice,
      previousPrice: m.currentPrice,
      trend: currentPrice > m.currentPrice ? 'up' : currentPrice < m.currentPrice ? 'down' : 'steady',
      stored,
      lastProduced: produced,
      lastConsumed: consumed,
      daysOfCover,
      supplyBand: supplyBandFor(daysOfCover, resource.parCover),
    };
  }

  return next;
}

/** Player trade moves the market: bulk buying shifts stored supply. */
export function applyPlayerTrade(
  market: Record<string, MarketState>,
  resourceId: string,
  quantity: number,
  direction: 'buy' | 'sell',
): Record<string, MarketState> {
  const m = market[resourceId];
  const resource = RESOURCES[resourceId];
  if (!m || !resource) return market;

  const stored =
    direction === 'buy'
      ? Math.max(0, m.stored - quantity)
      : Math.min(resource.storageCapacity, m.stored + quantity);

  const dailyDemand = m.lastConsumed > 0 ? m.lastConsumed : 1;

  return {
    ...market,
    [resourceId]: {
      ...m,
      stored,
      daysOfCover: stored / dailyDemand,
      supplyBand: supplyBandFor(stored / dailyDemand, resource.parCover),
    },
  };
}

export function buyPrice(market: MarketState, perks: PerkDefinition[], resourceId: string): number {
  const mult = Math.min(
    perkMultiplier(perks, 'market_buy_multiplier'),
    perkMultiplier(perks, 'market_buy_multiplier', resourceId),
  );
  return Math.max(1, Math.round(market.currentPrice * mult));
}

export function sellPrice(market: MarketState, perks: PerkDefinition[], resourceId: string): number {
  const mult = Math.max(
    perkMultiplier(perks, 'market_sell_multiplier'),
    perkMultiplier(perks, 'market_sell_multiplier', resourceId),
  );
  // The house always takes a cut; perks narrow the spread but never erase it.
  return Math.max(1, Math.round(market.currentPrice * 0.8 * mult));
}
