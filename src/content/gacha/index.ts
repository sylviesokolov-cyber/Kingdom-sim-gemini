import type { BannerDefinition, PoolEntry } from '../../types';
import { NPC_DEFINITIONS } from '../npcs';

/** Companion entries derived from the roster, so the pool can never drift. */
function companionEntries(): PoolEntry[] {
  return NPC_DEFINITIONS.filter((npc) => npc.bondable).map((npc) => ({
    id: npc.id,
    kind: 'companion' as const,
    rarity: npc.rarity,
    name: npc.name,
    weight: npc.rarity === 'SSR' ? 1 : npc.rarity === 'SR' ? 1 : 1,
    imageUrl: npc.portraitUrl,
  }));
}

/** Passive kingdom bonuses — the collectible "equipment" layer. */
const CHARTERS: PoolEntry[] = [
  { id: 'charter_granary', kind: 'charter', rarity: 'SR', name: 'Granary Charter', weight: 1 },
  { id: 'charter_cistern', kind: 'charter', rarity: 'SR', name: 'Cistern Charter', weight: 1 },
  { id: 'charter_toll', kind: 'charter', rarity: 'R', name: 'Toll Charter', weight: 2 },
  { id: 'charter_ledger', kind: 'charter', rarity: 'R', name: "Factor's Ledger", weight: 2 },
  { id: 'charter_writ', kind: 'charter', rarity: 'SSR', name: 'Royal Writ', weight: 1 },
];

const GIFTS: PoolEntry[] = [
  { id: 'gift_silk_ribbon', kind: 'gift', rarity: 'R', name: 'Silk Ribbon', weight: 3 },
  { id: 'gift_amber_comb', kind: 'gift', rarity: 'R', name: 'Amber Comb', weight: 3 },
  { id: 'gift_pressed_flower', kind: 'gift', rarity: 'N', name: 'Pressed Silverleaf', weight: 5 },
  { id: 'gift_copper_charm', kind: 'gift', rarity: 'N', name: 'Copper Charm', weight: 5 },
];

const SUNDRIES: PoolEntry[] = [
  { id: 'sundry_crystals_small', kind: 'currency', rarity: 'N', name: '50 Fate Crystals', weight: 6 },
  { id: 'sundry_hearts', kind: 'currency', rarity: 'N', name: '20 Bond Hearts', weight: 6 },
  { id: 'sundry_marks', kind: 'currency', rarity: 'N', name: '10 Guild Marks', weight: 5 },
];

export const BANNERS: BannerDefinition[] = [
  {
    id: 'fateful_encounters',
    name: 'Fateful Encounters',
    type: 'rate_up',
    description: 'The Lady of the Harvest answers a summons for the first time. SSR rate up.',
    featuredId: 'caren',
    featuredSrIds: ['rin', 'claire'],
    costPerPull: 300,
    costPerTen: 3000,
    artUrl: 'characters/rubia_assassin.png',
    pool: [...companionEntries(), ...CHARTERS, ...GIFTS, ...SUNDRIES],
  },
  {
    id: 'standard_call',
    name: 'The Standing Call',
    type: 'standard',
    description: 'The permanent roster. Everyone who can be called, can be called here.',
    costPerPull: 300,
    costPerTen: 3000,
    artUrl: 'characters/vesper_eclipse.png',
    pool: [...companionEntries(), ...CHARTERS, ...GIFTS, ...SUNDRIES],
  },
  {
    id: 'friendship_call',
    name: 'Kindred Call',
    type: 'friendship',
    description: 'Gifts, keepsakes, and the occasional friend. Cheap, and generous about it.',
    costPerPull: 60,
    costPerTen: 600,
    artUrl: 'characters/elena_scheherazade.png',
    pool: [
      ...companionEntries().filter((e) => e.rarity !== 'SSR'),
      ...GIFTS,
      ...SUNDRIES,
    ],
  },
];

export const BANNERS_BY_ID: Record<string, BannerDefinition> = Object.fromEntries(
  BANNERS.map((b) => [b.id, b]),
);
