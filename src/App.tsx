import { useMemo, useState } from 'react';
import { useGameStore } from './state/store';
import { HeaderHud } from './components/layout/HeaderHud';
import { Dock } from './components/layout/Dock';
import { HomeScreen } from './components/screens/HomeScreen';
import { KingdomScreen } from './components/screens/KingdomScreen';
import { CharactersScreen } from './components/screens/CharactersScreen';
import { WorkScreen } from './components/screens/WorkScreen';
import { MarketScreen } from './components/screens/MarketScreen';
import { SummonScreen } from './components/screens/SummonScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { ScreenFrame } from './components/layout/ScreenFrame';
import { DigestModal } from './components/ui/DigestModal';

/**
 * The app shell. This component routes and renders — it holds no game rules.
 * Every state transition goes through a store action, and every store action
 * delegates to the engine.
 */
export default function App() {
  const screen = useGameStore((s) => s.ui.screen);
  const toasts = useGameStore((s) => s.ui.toasts);
  const showDigest = useGameStore((s) => s.ui.showDigest);
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const resetGame = useGameStore((s) => s.resetGame);

  const [showSettings, setShowSettings] = useState(false);

  const alerts = useMemo(
    () => ({
      characters: Object.values(game.npcs).some(
        (n) => n.condition.status !== 'Healthy' && n.condition.status !== 'Deceased',
      ),
      market: Object.values(game.market).some((m) => m.supplyBand === 'Critically Scarce'),
      kingdom: game.kingdom.unrest > 60,
    }),
    [game.npcs, game.market, game.kingdom.unrest],
  );

  return (
    <div className="app-shell">
      <div className="app-stage">
        <div className="rotate-notice">
          <h2>Turn your device</h2>
          <p>Valenreach is played in landscape. Rotate to enter the kingdom.</p>
        </div>

        <HeaderHud game={game} onOpenSettings={() => setShowSettings(true)} />

        {screen === 'home' && <HomeScreen />}
        {screen === 'kingdom' && <KingdomScreen />}
        {screen === 'characters' && <CharactersScreen />}
        {screen === 'work' && <WorkScreen />}
        {screen === 'market' && <MarketScreen />}
        {screen === 'summon' && <SummonScreen />}
        {screen === 'inventory' && <InventoryScreen />}
        {screen === 'council' && (
          <ScreenFrame
            title="The Council Chamber"
            subtitle="Empty benches, for now."
            background="/characters/backgrounds/consort_background.webp"
          >
            <div className="empty">
              <span>You have no standing to be heard here.</span>
              <span>Petitions, decrees and votes arrive with the political engine.</span>
            </div>
          </ScreenFrame>
        )}

        {screen !== 'home' && <div className="dock-spacer" />}

        <Dock screen={screen} onNavigate={setScreen} onAdvanceDay={advanceDay} alerts={alerts} />

        <div className="toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.tone}`}>
              {t.message}
            </div>
          ))}
        </div>

        {showDigest && <DigestModal />}

        {showSettings && (
          <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
            <div
              className="modal panel-solid"
              style={{ padding: 18, maxWidth: 420 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: 'var(--gold-200)' }}>Settings</h3>
              <p style={{ fontSize: 14, color: 'var(--parchment)' }}>
                Valenreach saves automatically to this device. Seed {game.seed} — the same seed
                replays the same kingdom.
              </p>
              <button
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
              <button
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: 6, borderColor: 'rgba(179,58,58,.5)' }}
                onClick={() => {
                  if (confirm('Abandon this kingdom and begin again? This cannot be undone.')) {
                    resetGame();
                    setShowSettings(false);
                  }
                }}
              >
                Begin a new kingdom
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
