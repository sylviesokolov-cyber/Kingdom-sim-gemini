import type { CareerTrack, Estate, FactionId } from '../../types';

/* ------------------------------------------------------------------ *
 * Social estates — the linear spine
 * ------------------------------------------------------------------ */

export interface EstateTier {
  estate: Estate;
  title: string;
  /** Standing points required to petition for this estate. */
  standingRequired: number;
  copperCost: number;
  /** Minimum rank on at least one career track. */
  minCareerRank: number;
  /** Factions that must hold at least this opinion, and how many must. */
  factionFloor?: { minOpinion: number; count: number };
  maxEnergyBonus: number;
  grants: string;
}

export const ESTATE_LADDER: EstateTier[] = [
  {
    estate: 'Outsider',
    title: 'The Nameless',
    standingRequired: 0,
    copperCost: 0,
    minCareerRank: 0,
    maxEnergyBonus: 0,
    grants: 'Nothing. You cannot own property, testify, or petition.',
  },
  {
    estate: 'Peasant',
    title: 'Tenant of the Ashes',
    standingRequired: 100,
    copperCost: 100,
    minCareerRank: 0,
    maxEnergyBonus: 15,
    grants: 'Legal residence and the right to hold work.',
  },
  {
    estate: 'Villager',
    title: 'Freeholder',
    standingRequired: 300,
    copperCost: 800,
    minCareerRank: 2,
    maxEnergyBonus: 15,
    grants: 'Property, a market stall, and a name the guilds will record.',
  },
  {
    estate: 'Burgher',
    title: 'Burgher of Valenreach',
    standingRequired: 800,
    copperCost: 4000,
    minCareerRank: 3,
    maxEnergyBonus: 10,
    grants: 'Guild eligibility, hired workers, and a city vote.',
  },
  {
    estate: 'Gentry',
    title: 'Armiger',
    standingRequired: 2000,
    copperCost: 15000,
    minCareerRank: 4,
    factionFloor: { minOpinion: 50, count: 2 },
    maxEnergyBonus: 10,
    grants: 'The right to petition the court, hold land, and keep a retinue.',
  },
  {
    estate: 'Noble',
    title: 'Lord of Valenreach',
    standingRequired: 5000,
    copperCost: 50000,
    minCareerRank: 5,
    factionFloor: { minOpinion: 60, count: 3 },
    maxEnergyBonus: 10,
    grants: 'A council seat, the power of decree, and the right to levy.',
  },
  {
    estate: 'King',
    title: 'Sovereign of Valenreach',
    standingRequired: 12000,
    copperCost: 0,
    minCareerRank: 5,
    maxEnergyBonus: 20,
    grants: 'The kingdom.',
  },
];

export const ESTATE_ORDER: Estate[] = ESTATE_LADDER.map((t) => t.estate);

export function estateIndex(estate: Estate): number {
  return ESTATE_ORDER.indexOf(estate);
}

export function getEstateTier(estate: Estate): EstateTier {
  return ESTATE_LADDER[estateIndex(estate)] ?? ESTATE_LADDER[0];
}

/* ------------------------------------------------------------------ *
 * Career tracks — the parallel branches
 * ------------------------------------------------------------------ */

export interface CareerTrackDefinition {
  id: CareerTrack;
  name: string;
  description: string;
  faction?: FactionId;
  icon: string;
  /** Rank names, index 0 = rank 1. */
  rankNames: string[];
  /** XP required to reach each rank, index 0 = rank 1. */
  xpThresholds: number[];
  /** Faction opinion floor required for each rank. */
  factionFloors: number[];
  /** Quest id of each rank's trial. */
  trials: string[];
}

export const CAREER_DEFINITIONS: Record<CareerTrack, CareerTrackDefinition> = {
  clergy: {
    id: 'clergy',
    name: 'Clergy',
    description: 'Faith, healing, and influence over people who have nothing else.',
    faction: 'church',
    icon: 'church',
    rankNames: ['Acolyte', 'Deacon', 'Priest', 'Canon', 'Bishop'],
    xpThresholds: [80, 260, 700, 1600, 3400],
    factionFloors: [10, 25, 45, 65, 80],
    trials: ['trial_clergy_1', 'trial_clergy_2', 'trial_clergy_3', 'trial_clergy_4', 'trial_clergy_5'],
  },
  merchant: {
    id: 'merchant',
    name: 'Merchant',
    description: 'Trade, contracts, capital, and eventually the monopoly.',
    faction: 'guilds',
    icon: 'scale',
    rankNames: ['Hawker', 'Trader', 'Factor', 'Merchant', 'Magnate'],
    xpThresholds: [80, 260, 700, 1600, 3400],
    factionFloors: [10, 25, 45, 65, 80],
    trials: ['trial_merchant_1', 'trial_merchant_2', 'trial_merchant_3', 'trial_merchant_4', 'trial_merchant_5'],
  },
  martial: {
    id: 'martial',
    name: 'Martial',
    description: 'Arms, the garrison, and the argument that ends other arguments.',
    faction: 'military',
    icon: 'swords',
    rankNames: ['Levy', 'Man-at-Arms', 'Sergeant', 'Knight', 'Marshal'],
    xpThresholds: [80, 260, 700, 1600, 3400],
    factionFloors: [10, 25, 45, 65, 80],
    trials: ['trial_martial_1', 'trial_martial_2', 'trial_martial_3', 'trial_martial_4', 'trial_martial_5'],
  },
  court: {
    id: 'court',
    name: 'Court',
    description: 'Administration, law, and the quiet power of the man who drafts the decree.',
    faction: 'crown',
    icon: 'scroll',
    rankNames: ['Clerk', 'Steward', 'Chamberlain', 'Minister', 'Chancellor'],
    xpThresholds: [80, 260, 700, 1600, 3400],
    factionFloors: [10, 25, 45, 65, 80],
    trials: ['trial_court_1', 'trial_court_2', 'trial_court_3', 'trial_court_4', 'trial_court_5'],
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    description: 'Smuggling, blackmail, and the catacombs under all of it.',
    faction: 'syndicate',
    icon: 'skull',
    rankNames: ['Cutpurse', 'Runner', 'Fixer', 'Underboss', 'Kingpin'],
    xpThresholds: [80, 260, 700, 1600, 3400],
    factionFloors: [10, 25, 45, 65, 80],
    trials: ['trial_shadow_1', 'trial_shadow_2', 'trial_shadow_3', 'trial_shadow_4', 'trial_shadow_5'],
  },
  scholar: {
    id: 'scholar',
    name: 'Scholar',
    description: 'Knowledge, engineering, medicine, and the records nobody else reads.',
    icon: 'book',
    rankNames: ['Student', 'Adept', 'Savant', 'Magister', 'Archmagister'],
    xpThresholds: [80, 260, 700, 1600, 3400],
    factionFloors: [0, 0, 0, 0, 0],
    trials: ['trial_scholar_1', 'trial_scholar_2', 'trial_scholar_3', 'trial_scholar_4', 'trial_scholar_5'],
  },
};

export const CAREER_LIST: CareerTrackDefinition[] = Object.values(CAREER_DEFINITIONS);

/**
 * Track antagonism. Holding rank in one track caps another.
 * `[a, b, gap]` means: rank in `b` is capped at `rank(a) - gap`, and vice versa.
 */
export interface TrackAntagonism {
  a: CareerTrack;
  b: CareerTrack;
  /** How far below the other track's rank this one is capped. */
  gap: number;
  reason: string;
}

export const TRACK_ANTAGONISMS: TrackAntagonism[] = [
  {
    a: 'clergy',
    b: 'shadow',
    gap: 2,
    reason: 'The Church has preached against the Syndicate by name. You cannot be both its bishop and its kingpin.',
  },
  {
    a: 'court',
    b: 'shadow',
    gap: 2,
    reason: 'Court appointments are audited. The higher you rise in one, the more exposed you are in the other.',
  },
];

export function rankName(track: CareerTrack, rank: number): string {
  if (rank <= 0) return 'Untracked';
  return CAREER_DEFINITIONS[track].rankNames[rank - 1] ?? 'Unknown';
}
