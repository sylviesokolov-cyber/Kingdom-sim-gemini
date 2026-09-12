import { describe, expect, it } from 'vitest';
import { createNewGame, SAVE_VERSION } from '../src/content/initialState';
import { migrateSave, serializeSave } from '../src/state/save';
import { simulateDay } from '../src/engine/simulation';
import { NPC_DEFINITIONS } from '../src/content/npcs';

describe('save round-trip', () => {
  it('survives serialize -> migrate unchanged', () => {
    const state = createNewGame(1234);
    const restored = migrateSave(JSON.parse(serializeSave(state)));
    expect(restored).toEqual(state);
  });

  it('survives a round trip after many days of play', () => {
    let state = createNewGame(99);
    for (let i = 0; i < 60; i += 1) state = simulateDay(state).state;

    const restored = migrateSave(JSON.parse(serializeSave(state)));
    expect(restored).toEqual(state);
  });

  it('preserves progress rather than resetting it', () => {
    const state = createNewGame(5);
    state.player.currencies.copper = 9999;
    state.player.estate = 'Burgher';
    state.player.careers.merchant.rank = 3;
    state.npcs.caren.relationship.affection = 72;
    state.clock.day = 143;

    const restored = migrateSave(JSON.parse(serializeSave(state)))!;
    expect(restored.player.currencies.copper).toBe(9999);
    expect(restored.player.estate).toBe('Burgher');
    expect(restored.player.careers.merchant.rank).toBe(3);
    expect(restored.npcs.caren.relationship.affection).toBe(72);
    expect(restored.clock.day).toBe(143);
  });
});

describe('migration of imperfect saves', () => {
  it('fills in fields a legacy save never had', () => {
    const legacy = {
      seed: 42,
      clock: { day: 12 },
      player: { name: 'Aron', currencies: { copper: 500 } },
    };

    const restored = migrateSave(legacy)!;
    expect(restored.player.name).toBe('Aron');
    expect(restored.player.currencies.copper).toBe(500);
    // Fields the legacy save lacked come from a fresh game.
    expect(restored.player.currencies.fateCrystals).toBeGreaterThanOrEqual(0);
    expect(restored.player.attributes.charm).toBeGreaterThan(0);
    expect(restored.clock.day).toBe(12);
    expect(restored.clock.season).toBeDefined();
  });

  it('adopts characters added since the save was written', () => {
    const state = createNewGame(7);
    const trimmed = JSON.parse(serializeSave(state));
    delete trimmed.npcs.elare;

    const restored = migrateSave(trimmed)!;
    // Every roster character must be present, even one the save predates.
    for (const def of NPC_DEFINITIONS) {
      expect(restored.npcs[def.id], `missing ${def.id}`).toBeDefined();
    }
  });

  it('drops a retinue entry for a character that no longer exists', () => {
    const state = createNewGame(7);
    const raw = JSON.parse(serializeSave(state));
    raw.retinue = ['caren', 'a_character_that_was_cut'];

    const restored = migrateSave(raw)!;
    expect(restored.retinue).toEqual(['caren']);
  });

  it('falls back to a valid active companion if the saved one is gone', () => {
    const state = createNewGame(7);
    const raw = JSON.parse(serializeSave(state));
    raw.activeCompanionId = 'someone_removed';

    const restored = migrateSave(raw)!;
    expect(restored.npcs[restored.activeCompanionId]).toBeDefined();
  });

  it('rejects garbage rather than producing a broken game', () => {
    expect(migrateSave(null)).toBeNull();
    expect(migrateSave('not a save')).toBeNull();
    expect(migrateSave(42)).toBeNull();
  });

  it('always stamps the current save version', () => {
    const restored = migrateSave({ version: 0, seed: 1 })!;
    expect(restored.version).toBe(SAVE_VERSION);
  });

  it('ignores a stray homeSceneIndex left over from a removed feature', () => {
    // A v2 save briefly carried a Home-backdrop picker that was reverted
    // before it shipped past this repo's own sessions. A save carrying the
    // field must still load cleanly with the field simply dropped.
    const state = createNewGame(11);
    const raw = JSON.parse(serializeSave(state));
    raw.version = 2;
    raw.homeSceneIndex = 2;
    raw.player.currencies.copper = 4242;

    const restored = migrateSave(raw)!;
    expect(restored.version).toBe(SAVE_VERSION);
    expect((restored as unknown as Record<string, unknown>).homeSceneIndex).toBeUndefined();
    // The rest of the save is untouched — dropping a field is not a reset.
    expect(restored.player.currencies.copper).toBe(4242);
  });
});
