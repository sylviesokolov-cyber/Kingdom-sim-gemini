import type { DistrictId, DistrictState, FacilityState } from '../../types';

export interface DistrictDefinition {
  id: DistrictId;
  name: string;
  description: string;
  /** Population living here at game start. */
  basePopulation: number;
  /** Unlocked from day one, or gated behind estate/story. */
  unlockedAtStart: boolean;
}

export const DISTRICTS: Record<DistrictId, DistrictDefinition> = {
  ashes: {
    id: 'ashes',
    name: 'The Ashes',
    description: 'Refugee camps built against the outer wall, three years old and still called temporary.',
    basePopulation: 3400,
    unlockedAtStart: true,
  },
  springhead: {
    id: 'springhead',
    name: 'Springhead',
    description: 'The aqueduct works and the great cisterns. Everything in Valenreach is downstream of here.',
    basePopulation: 420,
    unlockedAtStart: true,
  },
  goldfields: {
    id: 'goldfields',
    name: 'The Goldfields',
    description: 'Farmland, mills, and the silos that hold the difference between a city and a riot.',
    basePopulation: 2100,
    unlockedAtStart: true,
  },
  wharfs: {
    id: 'wharfs',
    name: 'The Wharfs',
    description: 'Harbor, fishing fleet, and a customs house that inspects what it is told to.',
    basePopulation: 1800,
    unlockedAtStart: true,
  },
  weaverlane: {
    id: 'weaverlane',
    name: 'Weaverlane',
    description: 'Textile guilds, dye houses, and four hundred looms that vote as a bloc.',
    basePopulation: 2600,
    unlockedAtStart: true,
  },
  thornwood: {
    id: 'thornwood',
    name: 'Thornwood',
    description: 'Forest, orchards, and the herbary. The paths are bad on purpose.',
    basePopulation: 600,
    unlockedAtStart: true,
  },
  emberworks: {
    id: 'emberworks',
    name: 'Emberworks',
    description: 'Mine shafts and the great foundry. It never stops and it never quite pays.',
    basePopulation: 1900,
    unlockedAtStart: true,
  },
  cathedral_hill: {
    id: 'cathedral_hill',
    name: 'Cathedral Hill',
    description: 'The Cathedral of Sol, the seminary, the almshouses, and the apothecary hall.',
    basePopulation: 1400,
    unlockedAtStart: true,
  },
  garrison: {
    id: 'garrison',
    name: 'The Garrison',
    description: 'Barracks, armory, and the walls. Nineteen days behind on pay.',
    basePopulation: 1100,
    unlockedAtStart: true,
  },
  bourse: {
    id: 'bourse',
    name: 'The Bourse',
    description: 'The exchange floor, the consortium, and the warehouses behind both.',
    basePopulation: 1500,
    unlockedAtStart: true,
  },
  catacombs: {
    id: 'catacombs',
    name: 'The Catacomb Quarter',
    description: 'Old tunnels beneath the city, and the market that uses them. Officially, none of it is there.',
    basePopulation: 900,
    unlockedAtStart: true,
  },
  crown_quarter: {
    id: 'crown_quarter',
    name: 'The Crown Quarter',
    description: 'Palace, high court, treasury, and the archive nobody reads.',
    basePopulation: 800,
    unlockedAtStart: false,
  },
};

export const DISTRICT_LIST: DistrictDefinition[] = Object.values(DISTRICTS);

export interface FacilityDefinition {
  id: string;
  name: string;
  district: DistrictId;
  overseerNpcId: string;
  resourceId: string;
}

export const FACILITIES: FacilityDefinition[] = [
  { id: 'grand_aqueduct', name: 'The Grand Aqueduct', district: 'springhead', overseerNpcId: 'mira', resourceId: 'water' },
  { id: 'goldfield_silos', name: 'The Goldfield Silos', district: 'goldfields', overseerNpcId: 'caren', resourceId: 'grain' },
  { id: 'common_bakeries', name: 'The Common Bakeries', district: 'ashes', overseerNpcId: 'caren', resourceId: 'bread' },
  { id: 'harbor_fishery', name: 'The Harbor Fishery', district: 'wharfs', overseerNpcId: 'bran', resourceId: 'fish' },
  { id: 'thornwood_orchards', name: 'Thornwood Orchards', district: 'thornwood', overseerNpcId: 'lyra', resourceId: 'fruit' },
  { id: 'thornwood_herbary', name: 'The Thornwood Herbary', district: 'thornwood', overseerNpcId: 'lyra', resourceId: 'herbs' },
  { id: 'apothecary_hall', name: 'The Apothecary Hall', district: 'cathedral_hill', overseerNpcId: 'elena', resourceId: 'medicine' },
  { id: 'cathedral_almshouse', name: 'The Cathedral Almshouse', district: 'cathedral_hill', overseerNpcId: 'beatrix', resourceId: 'medicine' },
  { id: 'weaverlane_looms', name: 'The Weaverlane Looms', district: 'weaverlane', overseerNpcId: 'sylvie', resourceId: 'cloth' },
  { id: 'emberworks_mines', name: 'The Emberworks Mines', district: 'emberworks', overseerNpcId: 'torvin', resourceId: 'iron_ore' },
  { id: 'great_foundry', name: 'The Great Foundry', district: 'emberworks', overseerNpcId: 'torvin', resourceId: 'tools' },
  { id: 'garrison_barracks', name: 'The Garrison Barracks', district: 'garrison', overseerNpcId: 'claire', resourceId: 'arms' },
  { id: 'garrison_walls', name: 'The City Walls', district: 'garrison', overseerNpcId: 'valerius', resourceId: 'arms' },
  { id: 'bourse_imports', name: 'The Bourse Exchange', district: 'bourse', overseerNpcId: 'rin', resourceId: 'luxuries' },
  { id: 'catacomb_market', name: 'The Catacomb Market', district: 'catacombs', overseerNpcId: 'vesper', resourceId: 'contraband' },
  { id: 'royal_household', name: 'The Royal Household', district: 'crown_quarter', overseerNpcId: 'seraphine', resourceId: 'luxuries' },
  { id: 'royal_archive', name: 'The Royal Archive', district: 'crown_quarter', overseerNpcId: 'elare', resourceId: 'cloth' },
];

export const FACILITIES_BY_ID: Record<string, FacilityDefinition> = Object.fromEntries(
  FACILITIES.map((f) => [f.id, f]),
);

export function createInitialDistricts(): Record<string, DistrictState> {
  return Object.fromEntries(
    DISTRICT_LIST.map((d) => [
      d.id,
      {
        id: d.id,
        name: d.name,
        description: d.description,
        development: 1,
        population: d.basePopulation,
        unrest: d.id === 'ashes' ? 42 : 18,
        unlocked: d.unlockedAtStart,
      } satisfies DistrictState,
    ]),
  );
}

export function createInitialFacilities(): Record<string, FacilityState> {
  return Object.fromEntries(
    FACILITIES.map((f) => [
      f.id,
      {
        id: f.id,
        name: f.name,
        district: f.district,
        overseerNpcId: f.overseerNpcId,
        resourceId: f.resourceId,
        level: 1,
        efficiency: 1,
      } satisfies FacilityState,
    ]),
  );
}

export const TOTAL_START_POPULATION = DISTRICT_LIST.reduce((sum, d) => sum + d.basePopulation, 0);
