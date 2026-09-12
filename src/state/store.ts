import { create } from 'zustand';
import type {
  BannerDefinition,
  DigestEntry,
  GameState,
  JobDefinition,
  NpcState,
  PullResult,
} from '../types';
import { createNewGame } from '../content/initialState';
import { JOBS_BY_ID } from '../content/jobs';
import { NPCS_BY_ID } from '../content/npcs';
import { RESOURCES } from '../content/resources';
import { simulateDay } from '../engine/simulation';
import { activePerks, applyInteraction, applyJealousy, perkMultiplier } from '../engine/relationships';
import { applyPlayerTrade, buyPrice, sellPrice } from '../engine/economy';
import { applyXp, canPromoteEstate, promoteEstate, standingGain } from '../engine/progression';
import { pullCost, resolveMultiPull } from '../engine/gacha';
import { createRng } from '../engine/rng';
import { clearSave, loadSave, writeSave } from './save';

export interface Toast {
  id: number;
  message: string;
  tone: 'good' | 'bad' | 'neutral';
}

export type ScreenId =
  | 'home'
  | 'kingdom'
  | 'characters'
  | 'work'
  | 'market'
  | 'council'
  | 'summon'
  | 'inventory'
  | 'profile';

interface UiState {
  screen: ScreenId;
  toasts: Toast[];
  showDigest: boolean;
  /** Npc ids interacted with today, for the neglect-decay pass. */
  interactedToday: string[];
  /** Talk counts per npc today, for the diminishing-returns pass. */
  talksToday: Record<string, number>;
  lastPullResults: PullResult[] | null;
}

export interface GameStore {
  game: GameState;
  ui: UiState;

  /* --- lifecycle --- */
  newGame: (playerName?: string) => void;
  resetGame: () => void;
  save: () => void;

  /* --- navigation --- */
  setScreen: (screen: ScreenId) => void;
  setActiveCompanion: (npcId: string) => void;
  dismissDigest: () => void;
  pushToast: (message: string, tone?: Toast['tone']) => void;

  /* --- gameplay --- */
  advanceDay: () => void;
  talkTo: (npcId: string) => void;
  giftTo: (npcId: string, resourceId: string) => void;
  assist: (npcId: string) => void;
  workJob: (jobId: string) => void;
  buy: (resourceId: string, quantity: number) => void;
  sell: (resourceId: string, quantity: number) => void;
  consume: (resourceId: string) => void;
  petitionEstate: () => void;
  summon: (banner: BannerDefinition, count: number) => void;
}

let toastId = 0;

function initialUi(): UiState {
  return {
    screen: 'home',
    toasts: [],
    showDigest: false,
    interactedToday: [],
    talksToday: {},
    lastPullResults: null,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: loadSave() ?? createNewGame(),
  ui: initialUi(),

  /* ---------------------------------------------------------------- */
  newGame(playerName) {
    const game = createNewGame(undefined, playerName);
    set({ game, ui: initialUi() });
    writeSave(game);
  },

  resetGame() {
    clearSave();
    const game = createNewGame();
    set({ game, ui: initialUi() });
  },

  save() {
    writeSave(get().game);
  },

  /* ---------------------------------------------------------------- */
  setScreen(screen) {
    set((s) => ({ ui: { ...s.ui, screen } }));
  },

  setActiveCompanion(npcId) {
    set((s) => ({ game: { ...s.game, activeCompanionId: npcId } }));
    get().save();
  },

  dismissDigest() {
    set((s) => ({ ui: { ...s.ui, showDigest: false } }));
  },

  pushToast(message, tone = 'neutral') {
    const id = (toastId += 1);
    set((s) => ({ ui: { ...s.ui, toasts: [...s.ui.toasts, { id, message, tone }] } }));
    setTimeout(() => {
      set((s) => ({ ui: { ...s.ui, toasts: s.ui.toasts.filter((t) => t.id !== id) } }));
    }, 3200);
  },

  /* ---------------------------------------------------------------- */
  advanceDay() {
    const { game, ui } = get();
    const { state } = simulateDay(game, ui.interactedToday);

    set({
      game: state,
      ui: { ...ui, showDigest: state.lastDigest.length > 0, interactedToday: [], talksToday: {} },
    });
    writeSave(state);
  },

  /* ---------------------------------------------------------------- */
  talkTo(npcId) {
    const { game, ui } = get();
    const def = NPCS_BY_ID[npcId];
    const npc = game.npcs[npcId];
    if (!def || !npc) return;

    if (game.player.vitals.energy < 5) {
      get().pushToast('You have nothing left in you today.', 'bad');
      return;
    }

    const result = applyInteraction({
      npc,
      def,
      kind: 'talk',
      talksToday: ui.talksToday[npcId] ?? 0,
      day: game.clock.day,
      charm: game.player.attributes.charm,
    });

    const next: GameState = {
      ...game,
      player: {
        ...game.player,
        vitals: { ...game.player.vitals, energy: game.player.vitals.energy - 5 },
      },
      npcs: { ...game.npcs, [npcId]: result.npc },
    };

    set({
      game: next,
      ui: {
        ...ui,
        interactedToday: [...new Set([...ui.interactedToday, npcId])],
        talksToday: { ...ui.talksToday, [npcId]: (ui.talksToday[npcId] ?? 0) + 1 },
      },
    });

    get().pushToast(
      result.affectionGain > 0
        ? `${result.message}  +${result.affectionGain.toFixed(1)} affection`
        : result.message,
      result.diminished ? 'neutral' : 'good',
    );
    get().save();
  },

  giftTo(npcId, resourceId) {
    const { game, ui } = get();
    const def = NPCS_BY_ID[npcId];
    const npc = game.npcs[npcId];
    if (!def || !npc) return;

    if ((game.player.inventory[resourceId] ?? 0) <= 0) {
      get().pushToast('You have none of that to give.', 'bad');
      return;
    }

    const result = applyInteraction({
      npc,
      def,
      kind: 'gift',
      itemId: resourceId,
      day: game.clock.day,
      charm: game.player.attributes.charm,
    });

    // A gift that advances a bond makes her rivals notice.
    const npcs = applyJealousy(
      { ...game.npcs, [npcId]: result.npc },
      npcId,
      Math.max(0, result.affectionGain) * 0.3,
    );

    const next: GameState = {
      ...game,
      player: {
        ...game.player,
        inventory: {
          ...game.player.inventory,
          [resourceId]: game.player.inventory[resourceId] - 1,
        },
      },
      npcs,
    };

    set({ game: next, ui: { ...ui, interactedToday: [...new Set([...ui.interactedToday, npcId])] } });
    get().pushToast(result.message, result.affectionGain >= 0 ? 'good' : 'bad');
    get().save();
  },

  assist(npcId) {
    const { game, ui } = get();
    const def = NPCS_BY_ID[npcId];
    const npc = game.npcs[npcId];
    if (!def || !npc) return;

    if (game.player.vitals.energy < 20) {
      get().pushToast('Not enough energy to work her shift.', 'bad');
      return;
    }

    const result = applyInteraction({
      npc,
      def,
      kind: 'assist',
      day: game.clock.day,
      charm: game.player.attributes.charm,
    });

    // Assisting boosts her facility's output for today only.
    const boosted: NpcState = {
      ...result.npc,
      efficiencyModifier: Math.min(1.5, result.npc.efficiencyModifier + 0.25),
    };

    const next: GameState = {
      ...game,
      player: {
        ...game.player,
        vitals: { ...game.player.vitals, energy: game.player.vitals.energy - 20 },
        standingPoints: game.player.standingPoints + 4,
      },
      npcs: { ...game.npcs, [npcId]: boosted },
    };

    set({ game: next, ui: { ...ui, interactedToday: [...new Set([...ui.interactedToday, npcId])] } });
    get().pushToast(`${result.message} Her yield rises today.`, 'good');
    get().save();
  },

  /* ---------------------------------------------------------------- */
  workJob(jobId) {
    const { game, ui } = get();
    const job: JobDefinition | undefined = JOBS_BY_ID[jobId];
    if (!job) return;

    if (game.player.vitals.energy < job.energyCost) {
      get().pushToast('You do not have the energy for that.', 'bad');
      return;
    }

    const r = job.rewards;
    const timesDone = game.player.deeds.filter((d) => d === `job:${jobId}`).length;

    let player = { ...game.player };

    player.vitals = { ...player.vitals, energy: player.vitals.energy - job.energyCost };
    player.currencies = {
      ...player.currencies,
      copper: player.currencies.copper + (r.copper ?? 0),
      guildMarks: player.currencies.guildMarks + (r.guildMarks ?? 0),
    };
    player.standingPoints += standingGain(r.standingPoints ?? 0, timesDone);
    player.bounty += r.bounty ?? 0;
    player.deeds = [...player.deeds, `job:${jobId}`];

    const leveled = applyXp(player, r.xp ?? 0);
    player.level = leveled.level;
    player.xp = leveled.xp;
    player.xpToNext = leveled.xpToNext;
    if (leveled.levelsGained > 0) {
      player.attributes = Object.fromEntries(
        Object.entries(player.attributes).map(([k, v]) => [k, v + leveled.levelsGained]),
      ) as typeof player.attributes;
    }

    if (r.careerXp) {
      const careers = { ...player.careers };
      for (const gain of r.careerXp) {
        careers[gain.track] = { ...careers[gain.track], xp: careers[gain.track].xp + gain.amount };
      }
      player.careers = careers;
    }

    if (r.items) {
      const inventory = { ...player.inventory };
      for (const item of r.items) {
        inventory[item.resourceId] = (inventory[item.resourceId] ?? 0) + item.amount;
      }
      player.inventory = inventory;
    }

    if (r.factions) {
      const standing = { ...player.standing };
      for (const impact of r.factions) {
        standing[impact.factionId] = Math.max(
          0,
          Math.min(100, standing[impact.factionId] + (impact.opinion ?? 0)),
        );
      }
      player.standing = standing;
    }

    let factions = game.factions;
    if (r.factions) {
      factions = { ...factions };
      for (const impact of r.factions) {
        const f = factions[impact.factionId];
        if (!f) continue;
        factions[impact.factionId] = {
          ...f,
          opinion: Math.max(0, Math.min(100, f.opinion + (impact.opinion ?? 0))),
        };
      }
    }

    let kingdom = game.kingdom;
    if (r.kingdom) {
      kingdom = { ...kingdom };
      for (const [key, delta] of Object.entries(r.kingdom)) {
        const k = key as keyof typeof kingdom;
        (kingdom[k] as number) = Math.max(0, (kingdom[k] as number) + (delta ?? 0));
      }
    }

    // Working under a supervisor builds the relationship with her.
    let npcs = game.npcs;
    if (job.supervisorNpcId && job.supervisorAffection) {
      const npc = npcs[job.supervisorNpcId];
      const def = NPCS_BY_ID[job.supervisorNpcId];
      if (npc && def) {
        npcs = {
          ...npcs,
          [job.supervisorNpcId]: {
            ...npc,
            relationship: {
              ...npc.relationship,
              affection: Math.min(100, npc.relationship.affection + job.supervisorAffection),
              trust: Math.min(100, npc.relationship.trust + 1),
            },
          },
        };
      }
    }

    const next: GameState = { ...game, player, npcs, factions, kingdom };
    set({
      game: next,
      ui: job.supervisorNpcId
        ? { ...ui, interactedToday: [...new Set([...ui.interactedToday, job.supervisorNpcId])] }
        : ui,
    });

    get().pushToast(`${job.title} — earned ${r.copper ?? 0} copper.`, 'good');
    if (leveled.levelsGained > 0) {
      get().pushToast(`Level ${leveled.level}. Every attribute rises.`, 'good');
    }
    get().save();
  },

  /* ---------------------------------------------------------------- */
  buy(resourceId, quantity) {
    const { game } = get();
    const m = game.market[resourceId];
    if (!m || quantity <= 0) return;

    const perks = activePerks(game.npcs);
    const unit = buyPrice(m, perks, resourceId);
    const total = unit * quantity;

    if (game.player.currencies.copper < total) {
      get().pushToast('You cannot afford that.', 'bad');
      return;
    }
    if (m.stored < quantity) {
      get().pushToast('The market does not hold that much.', 'bad');
      return;
    }

    const next: GameState = {
      ...game,
      player: {
        ...game.player,
        currencies: { ...game.player.currencies, copper: game.player.currencies.copper - total },
        inventory: {
          ...game.player.inventory,
          [resourceId]: (game.player.inventory[resourceId] ?? 0) + quantity,
        },
      },
      // Bulk buying moves the market — a magnate can corner a resource.
      market: applyPlayerTrade(game.market, resourceId, quantity, 'buy'),
    };

    set({ game: next });
    get().pushToast(`Bought ${quantity} ${RESOURCES[resourceId]?.name ?? resourceId} for ${total}.`, 'neutral');
    get().save();
  },

  sell(resourceId, quantity) {
    const { game } = get();
    const m = game.market[resourceId];
    const held = game.player.inventory[resourceId] ?? 0;
    if (!m || quantity <= 0 || held < quantity) {
      get().pushToast('You do not have that to sell.', 'bad');
      return;
    }

    const perks = activePerks(game.npcs);
    const unit = sellPrice(m, perks, resourceId);
    const total = unit * quantity;

    const next: GameState = {
      ...game,
      player: {
        ...game.player,
        currencies: { ...game.player.currencies, copper: game.player.currencies.copper + total },
        inventory: { ...game.player.inventory, [resourceId]: held - quantity },
      },
      market: applyPlayerTrade(game.market, resourceId, quantity, 'sell'),
    };

    set({ game: next });
    get().pushToast(`Sold ${quantity} for ${total} copper.`, 'good');
    get().save();
  },

  consume(resourceId) {
    const { game } = get();
    const held = game.player.inventory[resourceId] ?? 0;
    if (held <= 0) return;

    const resource = RESOURCES[resourceId];
    if (!resource) return;

    // Food answers hunger; medicine answers health. Water does a little of both.
    const hungerRelief =
      resource.category === 'survival' ? (resourceId === 'water' ? 8 : 26) : resource.category === 'food' ? 20 : 0;
    const healthGain = resourceId === 'medicine' ? 40 : resource.category === 'food' ? 4 : 0;
    const energyGain = resourceId === 'water' ? 8 : 0;

    if (hungerRelief === 0 && healthGain === 0 && energyGain === 0) {
      get().pushToast('That is not something you can eat.', 'bad');
      return;
    }

    const v = game.player.vitals;
    const next: GameState = {
      ...game,
      player: {
        ...game.player,
        vitals: {
          ...v,
          hunger: Math.max(0, v.hunger - hungerRelief),
          health: Math.min(100, v.health + healthGain),
          energy: Math.min(v.maxEnergy, v.energy + energyGain),
        },
        inventory: { ...game.player.inventory, [resourceId]: held - 1 },
      },
    };

    set({ game: next });
    get().pushToast(`You take the ${resource.name.toLowerCase()}.`, 'good');
    get().save();
  },

  /* ---------------------------------------------------------------- */
  petitionEstate() {
    const { game } = get();
    const verdict = canPromoteEstate(game.player, game.factions);

    if (!verdict.eligible) {
      get().pushToast(verdict.reasons[0] ?? 'Not yet.', 'bad');
      return;
    }

    const player = promoteEstate(game.player);
    set({ game: { ...game, player } });
    get().pushToast(`You are received as ${player.title}.`, 'good');
    get().save();
  },

  /* ---------------------------------------------------------------- */
  summon(banner, count) {
    const { game, ui } = get();
    const cost = pullCost(banner, count);

    if (game.player.currencies.fateCrystals < cost) {
      get().pushToast(`Requires ${cost} Fate Crystals.`, 'bad');
      return;
    }

    const pity = game.gacha.pity[banner.type];
    const rng = createRng(`${game.seed}:gacha:${game.gacha.lifetimePulls}`);

    const outcome = resolveMultiPull(
      { banner, pity, obtained: game.gacha.obtained, rng },
      count,
    );

    // Duplicate companions become Resonance, which raises her affection cap.
    const npcs = { ...game.npcs };
    for (const result of outcome.results) {
      if (result.entry.kind !== 'companion') continue;
      const npc = npcs[result.entry.id];
      if (!npc) continue;

      npcs[result.entry.id] = result.duplicate
        ? {
            ...npc,
            relationship: {
              ...npc.relationship,
              resonance: Math.min(3, npc.relationship.resonance + 1),
            },
          }
        : { ...npc, recruited: true };
    }

    const newCompanions = outcome.results
      .filter((r) => r.entry.kind === 'companion' && !r.duplicate)
      .map((r) => r.entry.id);

    const retinue = [...new Set([...game.retinue, ...newCompanions])];

    const next: GameState = {
      ...game,
      player: {
        ...game.player,
        currencies: {
          ...game.player.currencies,
          fateCrystals: game.player.currencies.fateCrystals - cost,
        },
      },
      npcs,
      retinue,
      gacha: {
        ...game.gacha,
        pity: { ...game.gacha.pity, [banner.type]: outcome.pity },
        obtained: outcome.obtained,
        lifetimePulls: game.gacha.lifetimePulls + count,
      },
    };

    set({ game: next, ui: { ...ui, lastPullResults: outcome.results } });

    const ssrCount = outcome.results.filter((r) => r.entry.rarity === 'SSR').length;
    if (ssrCount > 0) {
      get().pushToast(`${ssrCount} answered the call.`, 'good');
    }
    get().save();
  },
}));

/* ------------------------------------------------------------------ *
 * Selectors — derived state lives here, never in components.
 * ------------------------------------------------------------------ */

export const selectActiveNpc = (s: GameStore) => s.game.npcs[s.game.activeCompanionId];
export const selectActiveNpcDef = (s: GameStore) => NPCS_BY_ID[s.game.activeCompanionId];
export const selectPerks = (s: GameStore) => activePerks(s.game.npcs);
export const selectDigest = (s: GameStore): DigestEntry[] => s.game.lastDigest;

export const selectBountyRate = (s: GameStore) =>
  perkMultiplier(activePerks(s.game.npcs), 'bounty_rate');
