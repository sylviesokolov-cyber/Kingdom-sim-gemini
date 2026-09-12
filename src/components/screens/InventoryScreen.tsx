import { useGameStore } from '../../state/store';
import { RESOURCES } from '../../content/resources';
import { ScreenFrame } from '../layout/ScreenFrame';

export function InventoryScreen() {
  const game = useGameStore((s) => s.game);
  const consume = useGameStore((s) => s.consume);

  const held = Object.entries(game.player.inventory).filter(([, qty]) => qty > 0);
  const v = game.player.vitals;

  return (
    <ScreenFrame
      title="Your Pack"
      subtitle="Everything you own, and what it will do for you."
      background="/characters/backgrounds/bathhouse_lady_background.webp"
      aside={
        <div style={{ display: 'flex', gap: 14 }}>
          <Vital label="Energy" value={v.energy} max={v.maxEnergy} bar="gold" />
          <Vital label="Health" value={v.health} max={100} bar="jade" />
          <Vital label="Hunger" value={v.hunger} max={100} bar="blood" />
        </div>
      }
    >
      <div className="scroll-y" style={{ height: '100%' }}>
        {held.length === 0 ? (
          <div className="empty">
            <span>You carry nothing.</span>
            <span>Work pays in goods as often as coin.</span>
          </div>
        ) : (
          <div className="row-list">
            {held.map(([id, qty]) => {
              const r = RESOURCES[id];
              const edible =
                r && (r.category === 'survival' || r.category === 'food' || id === 'medicine');
              return (
                <div key={id} className="row">
                  <div className="row-main">
                    <div className="row-title">{r?.name ?? id}</div>
                    <div className="row-sub">{r?.description}</div>
                  </div>
                  <div className="row-aside">
                    <span className="numeral">×{qty}</span>
                  </div>
                  {edible && (
                    <button className="btn btn-ghost btn-sm" onClick={() => consume(id)}>
                      {id === 'medicine' ? 'Take' : 'Eat'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ScreenFrame>
  );
}

function Vital({
  label,
  value,
  max,
  bar,
}: {
  label: string;
  value: number;
  max: number;
  bar: string;
}) {
  return (
    <div style={{ minWidth: 78 }}>
      <div className="label">
        {label} {Math.round(value)}/{max}
      </div>
      <div className={`bar bar-${bar}`} style={{ marginTop: 3 }}>
        <i style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
