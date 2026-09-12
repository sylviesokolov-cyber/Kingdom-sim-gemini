import type { ThroneRouteDefinition } from '../../types';

/**
 * The six routes to the throne (PROGRESSION.md §4).
 *
 * These are declared as ordinary `Prerequisite` data so the existing
 * evaluator explains a locked route in the same voice it explains a locked
 * job — "Requires martial rank 5 (rank 3)" — instead of the UI greying a row
 * out with no reason.
 *
 * `requires` is the *political* qualification: what your life has to have
 * built for this route to be yours to take. It is deliberately separate from
 * when Act 7 lets anyone take a route at all (the throne has to be empty
 * first). Showing qualification early is the point — a Hawker on day 12
 * should be able to see what a Magnate is for.
 */
export const THRONE_ROUTES: ThroneRouteDefinition[] = [
  {
    id: 'heir',
    name: 'The Heir',
    track: 'court',
    howYouTakeIt: 'Legitimized in open court and named successor before the King dies.',
    character: 'A reign of continuity. The machine keeps running, and it runs for you.',
    requires: {
      career: [{ track: 'court', minRank: 4 }],
      faction: [{ id: 'crown', minOpinion: 70 }],
      bond: [{ npcId: 'seraphine', minTier: 'Devoted' }],
    },
  },
  {
    id: 'marshal',
    name: 'The Marshal',
    track: 'martial',
    howYouTakeIt: 'You take it, and the army agrees that you have taken it.',
    character: 'A reign held by the garrison. Order first, and order is expensive.',
    requires: {
      career: [{ track: 'martial', minRank: 5 }],
      faction: [
        { id: 'military', minOpinion: 80, minPower: 65 },
      ],
      bond: [{ npcId: 'claire', minTier: 'Close' }],
    },
  },
  {
    id: 'magnate',
    name: 'The Magnate',
    track: 'merchant',
    howYouTakeIt: 'You buy it. The crown owes you more than it can ever repay.',
    character: 'A reign of contracts. Everything works, and everything has a price.',
    requires: {
      career: [{ track: 'merchant', minRank: 5 }],
      faction: [{ id: 'guilds', minOpinion: 75 }],
      kingdom: { treasury: { max: 4000 } },
      flags: { all: ['merchant.magnate'] },
    },
  },
  {
    id: 'anointed',
    name: 'The Anointed',
    track: 'clergy',
    howYouTakeIt: 'Anointed by Sol. The Church crowns you and dares anyone to argue.',
    character: 'A reign by mandate. Moral authority, and the weight of having to keep it.',
    requires: {
      career: [{ track: 'clergy', minRank: 5 }],
      faction: [{ id: 'church', minOpinion: 80 }],
      bond: [{ npcId: 'beatrix', minTier: 'Sworn' }],
    },
  },
  {
    id: 'kingpin',
    name: 'The Kingpin',
    track: 'shadow',
    howYouTakeIt: 'You do not wear it. You own whoever does.',
    character: 'A reign nobody can name. Total control, and no one to share it with.',
    requires: {
      career: [{ track: 'shadow', minRank: 5 }],
      faction: [{ id: 'syndicate', minOpinion: 80 }],
      flags: { all: ['shadow.dossier_1', 'shadow.dossier_2', 'shadow.dossier_3'] },
    },
  },
  {
    id: 'reformer',
    name: 'The Reformer',
    howYouTakeIt: 'The people put you there — and they can take you back down.',
    character: 'A reign on sufferance. The most legitimate crown and the least secure.',
    requires: {
      faction: [
        { id: 'commons', minOpinion: 80 },
        { id: 'refugees', minOpinion: 70 },
      ],
      kingdom: { unrest: { min: 60 } },
    },
  },
];
