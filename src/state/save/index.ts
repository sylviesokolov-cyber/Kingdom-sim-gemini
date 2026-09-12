import type { GameState } from '../../types';
import { createNewGame, SAVE_VERSION } from '../../content/initialState';
import { NPC_DEFINITIONS } from '../../content/npcs';
import { RESOURCE_LIST } from '../../content/resources';
import { createInitialFacilities, createInitialDistricts } from '../../content/world';

export const STORAGE_KEY = 'valenreach_save';
export { SAVE_VERSION };

/**
 * Migrate a save of any prior version into the current shape.
 *
 * Destroying a player's progress is a bug, not a shortcut: unknown fields are
 * ignored, missing fields are filled from a fresh game, and content that has
 * been added since the save was written is merged in rather than replacing it.
 */
export function migrateSave(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Partial<GameState> & Record<string, unknown>;
  const fresh = createNewGame(typeof source.seed === 'number' ? source.seed : undefined);

  // --- Clock -------------------------------------------------------
  const clock = {
    ...fresh.clock,
    ...(typeof source.clock === 'object' && source.clock ? source.clock : {}),
  };
  clock.day = Math.max(1, Math.floor(clock.day ?? 1));

  // --- Player ------------------------------------------------------
  const savedPlayer = (source.player ?? {}) as Partial<GameState['player']>;
  const player: GameState['player'] = {
    ...fresh.player,
    ...savedPlayer,
    attributes: { ...fresh.player.attributes, ...(savedPlayer.attributes ?? {}) },
    vitals: { ...fresh.player.vitals, ...(savedPlayer.vitals ?? {}) },
    currencies: { ...fresh.player.currencies, ...(savedPlayer.currencies ?? {}) },
    // Career tracks added after this save was written default to rank 0.
    careers: { ...fresh.player.careers, ...(savedPlayer.careers ?? {}) },
    standing: { ...fresh.player.standing, ...(savedPlayer.standing ?? {}) },
    inventory: { ...(savedPlayer.inventory ?? {}) },
    businesses: savedPlayer.businesses ?? [],
    deeds: savedPlayer.deeds ?? [],
    completedEpisodes: savedPlayer.completedEpisodes ?? [],
    perks: savedPlayer.perks ?? [],
    flags: savedPlayer.flags ?? [],
  };

  // --- NPCs: keep saved progress, adopt newly added characters ------
  const savedNpcs = (source.npcs ?? {}) as Record<string, Partial<GameState['npcs'][string]>>;
  const npcs: GameState['npcs'] = {};
  for (const def of NPC_DEFINITIONS) {
    const base = fresh.npcs[def.id];
    const saved = savedNpcs[def.id];
    npcs[def.id] = saved
      ? {
          ...base,
          ...saved,
          condition: { ...base.condition, ...(saved.condition ?? {}) },
          relationship: { ...base.relationship, ...(saved.relationship ?? {}) },
          memories: saved.memories ?? [],
        }
      : base;
  }

  // --- Market: keep saved prices and stock for known resources ------
  const savedMarket = (source.market ?? {}) as Record<string, Partial<GameState['market'][string]>>;
  const market: GameState['market'] = {};
  for (const resource of RESOURCE_LIST) {
    const base = fresh.market[resource.id];
    const saved = savedMarket[resource.id];
    market[resource.id] = saved ? { ...base, ...saved } : base;
  }

  // --- Factions, districts, facilities ------------------------------
  const factions = { ...fresh.factions, ...((source.factions ?? {}) as GameState['factions']) };
  const districts = { ...createInitialDistricts(), ...((source.districts ?? {}) as GameState['districts']) };

  // Identity (name, district, overseer) always comes from content so a
  // renamed facility updates; level and last-resolved efficiency are player
  // state and are carried across verbatim.
  const freshFacilities = createInitialFacilities();
  const savedFacilities = (source.facilities ?? {}) as Record<
    string,
    Partial<GameState['facilities'][string]>
  >;
  const facilities: GameState['facilities'] = {};
  for (const [id, base] of Object.entries(freshFacilities)) {
    const saved = savedFacilities[id];
    facilities[id] = {
      ...base,
      level: saved?.level ?? base.level,
      efficiency: saved?.efficiency ?? base.efficiency,
    };
  }

  const gacha = {
    ...fresh.gacha,
    ...((source.gacha ?? {}) as GameState['gacha']),
    pity: { ...fresh.gacha.pity, ...(((source.gacha ?? {}) as GameState['gacha']).pity ?? {}) },
  };

  const retinue = Array.isArray(source.retinue) && source.retinue.length > 0
    ? source.retinue.filter((id) => npcs[id] !== undefined)
    : fresh.retinue;

  const activeCompanionId =
    typeof source.activeCompanionId === 'string' && npcs[source.activeCompanionId]
      ? source.activeCompanionId
      : fresh.activeCompanionId;

  // A save from before the scene picker existed simply gets the default scene.
  const homeSceneIndex =
    typeof source.homeSceneIndex === 'number' && Number.isFinite(source.homeSceneIndex)
      ? source.homeSceneIndex
      : fresh.homeSceneIndex;

  return {
    version: SAVE_VERSION,
    seed: typeof source.seed === 'number' ? source.seed : fresh.seed,
    clock,
    player,
    kingdom: { ...fresh.kingdom, ...((source.kingdom ?? {}) as GameState['kingdom']) },
    npcs,
    factions,
    districts,
    facilities,
    market,
    gacha,
    activeCompanionId,
    retinue,
    homeSceneIndex,
    firedEvents: Array.isArray(source.firedEvents) ? source.firedEvents : [],
    scheduled: Array.isArray(source.scheduled) ? source.scheduled : [],
    lastDigest: Array.isArray(source.lastDigest) ? source.lastDigest : [],
    completedQuests: Array.isArray(source.completedQuests) ? source.completedQuests : [],
    gallery: Array.isArray(source.gallery) ? source.gallery : [],
  };
}

export function serializeSave(state: GameState): string {
  return JSON.stringify({ ...state, version: SAVE_VERSION });
}

export function loadSave(): GameState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrateSave(JSON.parse(raw));
  } catch (error) {
    console.error('Failed to read save', error);
    return null;
  }
}

export function writeSave(state: GameState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, serializeSave(state));
  } catch (error) {
    console.error('Failed to write save', error);
  }
}

export function clearSave(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear save', error);
  }
}
