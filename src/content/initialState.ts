import type {
  CareerState,
  CareerTrack,
  FactionId,
  FactionState,
  GameState,
  KingdomStats,
  MarketState,
  NpcState,
  PlayerState,
  Standing,
} from '../types';
import { CAREER_TRACKS, FACTION_IDS } from '../types';
import { NPC_DEFINITIONS } from './npcs';
import { RESOURCE_LIST } from './resources';
import { createInitialDistricts, createInitialFacilities, TOTAL_START_POPULATION } from './world';

export const SAVE_VERSION = 1;

/** Faction opinion and power at game start. The player is nobody to all of them. */
const INITIAL_FACTION_SETUP: Record<FactionId, { opinion: number; power: number; stability: number }> = {
  crown: { opinion: 5, power: 72, stability: 48 },
  nobility: { opinion: 0, power: 68, stability: 62 },
  church: { opinion: 10, power: 55, stability: 70 },
  military: { opinion: 5, power: 60, stability: 44 },
  guilds: { opinion: 8, power: 58, stability: 66 },
  commons: { opinion: 22, power: 30, stability: 40 },
  refugees: { opinion: 30, power: 12, stability: 28 },
  syndicate: { opinion: 18, power: 42, stability: 55 },
};

function createCareers(): Record<CareerTrack, CareerState> {
  return Object.fromEntries(
    CAREER_TRACKS.map((track) => [track, { track, rank: 0, xp: 0, completedTrials: [] } satisfies CareerState]),
  ) as unknown as Record<CareerTrack, CareerState>;
}

function createStanding(): Standing {
  return Object.fromEntries(
    FACTION_IDS.map((id) => [id, INITIAL_FACTION_SETUP[id].opinion]),
  ) as Standing;
}

export function createInitialPlayer(name = 'Syl'): PlayerState {
  return {
    name,
    title: 'The Nameless',
    estate: 'Outsider',
    standingPoints: 0,
    level: 1,
    xp: 0,
    xpToNext: 100,
    attributes: { might: 8, cunning: 10, authority: 6, piety: 7, charm: 9 },
    vitals: { energy: 80, maxEnergy: 80, health: 82, hunger: 30 },
    // Enough for one ten-pull on day one: a player must be able to meet the
    // summon system before they are asked to save for it.
    currencies: { copper: 45, guildMarks: 0, fateCrystals: 3200, bondHearts: 0 },
    inventory: { water: 2, bread: 1 },
    careers: createCareers(),
    standing: createStanding(),
    bounty: 0,
    businesses: [],
    deeds: [],
    completedEpisodes: [],
    perks: [],
    flags: [],
  };
}

export function createInitialKingdom(): KingdomStats {
  return {
    population: TOTAL_START_POPULATION,
    welfare: 46,
    publicHealth: 52,
    security: 58,
    piety: 64,
    literacy: 22,
    treasury: 18400,
    unrest: 38,
    prosperity: 41,
  };
}

export function createInitialNpcs(): Record<string, NpcState> {
  return Object.fromEntries(
    NPC_DEFINITIONS.map((def) => {
      const rel = def.initialRelationship ?? {};
      const cond = def.initialCondition ?? {};
      const state: NpcState = {
        id: def.id,
        condition: {
          health: cond.health ?? 100,
          maxHealth: cond.maxHealth ?? 100,
          energy: cond.energy ?? 100,
          status: cond.status ?? 'Healthy',
          illness: cond.illness,
          daysInStatus: cond.daysInStatus ?? 0,
          requiredTreatment: cond.requiredTreatment,
        },
        relationship: {
          affection: rel.affection ?? 0,
          trust: rel.trust ?? 0,
          respect: rel.respect ?? 0,
          desire: rel.desire ?? 0,
          resentment: rel.resentment ?? 0,
          jealousy: rel.jealousy ?? 0,
          resonance: rel.resonance ?? 0,
        },
        memories: [],
        efficiencyModifier: 1,
        recruited: true,
      };
      return [def.id, state];
    }),
  );
}

export function createInitialFactions(): Record<FactionId, FactionState> {
  return Object.fromEntries(
    FACTION_IDS.map((id) => {
      const setup = INITIAL_FACTION_SETUP[id];
      const state: FactionState = {
        id,
        opinion: setup.opinion,
        power: setup.power,
        stability: setup.stability,
        needs: [],
      };
      return [id, state];
    }),
  ) as Record<FactionId, FactionState>;
}

/**
 * Starting market. Storage is seeded at roughly eight days of cover for
 * survival goods, so the opening days feel stable but not comfortable.
 */
export function createInitialMarket(): Record<string, MarketState> {
  const population = TOTAL_START_POPULATION;
  return Object.fromEntries(
    RESOURCE_LIST.map((resource) => {
      const dailyDemand = population * resource.perCapitaDemand;
      const stored = Math.min(resource.storageCapacity, Math.round(dailyDemand * resource.parCover));
      const state: MarketState = {
        resourceId: resource.id,
        currentPrice: resource.basePrice,
        previousPrice: resource.basePrice,
        trend: 'steady',
        stored,
        lastProduced: 0,
        lastConsumed: 0,
        daysOfCover: dailyDemand > 0 ? stored / dailyDemand : 99,
        supplyBand: 'Normal',
      };
      return [resource.id, state];
    }),
  );
}

export function createNewGame(seed?: number, playerName = 'Syl'): GameState {
  return {
    version: SAVE_VERSION,
    seed: seed ?? Math.floor(Math.random() * 0xffffffff),
    clock: { day: 1, season: 'Spring', phase: 'Morning', weather: 'Clear', year: 1 },
    player: createInitialPlayer(playerName),
    kingdom: createInitialKingdom(),
    npcs: createInitialNpcs(),
    factions: createInitialFactions(),
    districts: createInitialDistricts(),
    facilities: createInitialFacilities(),
    market: createInitialMarket(),
    gacha: {
      pity: {
        standard: { sinceSsr: 0, sinceSr: 0, guaranteedFeatured: false, totalPulls: 0 },
        rate_up: { sinceSsr: 0, sinceSr: 0, guaranteedFeatured: false, totalPulls: 0 },
        friendship: { sinceSsr: 0, sinceSr: 0, guaranteedFeatured: false, totalPulls: 0 },
        royal: { sinceSsr: 0, sinceSr: 0, guaranteedFeatured: false, totalPulls: 0 },
        limited: { sinceSsr: 0, sinceSr: 0, guaranteedFeatured: false, totalPulls: 0 },
      },
      obtained: [],
      lifetimePulls: 0,
    },
    activeCompanionId: 'caren',
    retinue: ['caren', 'mira', 'vesper', 'lyra', 'sylvie'],
    firedEvents: [],
    scheduled: [],
    lastDigest: [],
    completedQuests: [],
    gallery: [],
  };
}
