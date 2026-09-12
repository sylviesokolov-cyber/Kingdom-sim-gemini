import { useGameStore } from '../../state/store';
import { FACTION_LIST } from '../../content/factions';
import { RESOURCE_LIST } from '../../content/resources';
import { NPCS_BY_ID } from '../../content/npcs';
import { FACILITIES } from '../../content/world';
import { ScreenFrame } from '../layout/ScreenFrame';

export function KingdomScreen() {
  const game = useGameStore((s) => s.game);
  const k = game.kingdom;

  const facilities = FACILITIES.map((f) => ({
    def: f,
    state: game.facilities[f.id],
    overseer: NPCS_BY_ID[f.overseerNpcId],
    npc: game.npcs[f.overseerNpcId],
  }))
    .filter((f) => f.state && f.overseer)
    .sort((a, b) => (a.state?.efficiency ?? 1) - (b.state?.efficiency ?? 1));

  return (
    <ScreenFrame
      title="Valenreach"
      subtitle={`${k.population.toLocaleString()} souls, and every one of them downstream of the aqueduct.`}
      background="/characters/backgrounds/royal_silver_hair_throne.webp"
    >
      <div className="screen-cols cols-2">
        <div className="scroll-y" style={{ minHeight: 0 }}>
          <div className="label" style={{ marginBottom: 6 }}>
            Vitals
          </div>
          <div className="stat-grid" style={{ marginBottom: 12 }}>
            <Stat label="Welfare" value={k.welfare} bar="jade" />
            <Stat label="Public Health" value={k.publicHealth} bar="jade" />
            <Stat label="Security" value={k.security} bar="gold" />
            <Stat label="Piety" value={k.piety} bar="gold" />
            <Stat label="Unrest" value={k.unrest} bar="blood" invert />
            <Stat label="Prosperity" value={k.prosperity} bar="jade" />
          </div>

          <div className="label" style={{ marginBottom: 6 }}>
            Treasury
          </div>
          <div className="panel" style={{ padding: 10, marginBottom: 12 }}>
            <div className="stat-value">{Math.round(k.treasury).toLocaleString()} gold</div>
          </div>

          <div className="label" style={{ marginBottom: 6 }}>
            Supply lines
          </div>
          <div className="row-list">
            {RESOURCE_LIST.filter((r) => r.category === 'survival' || r.category === 'medicine').map(
              (r) => {
                const m = game.market[r.id];
                if (!m) return null;
                const bad = m.supplyBand === 'Critically Scarce' || m.supplyBand === 'Scarce';
                return (
                  <div key={r.id} className="row">
                    <div className="row-main">
                      <div className="row-title">{r.name}</div>
                      <div className="row-sub">
                        {Math.round(m.stored).toLocaleString()} {r.unit}s ·{' '}
                        {m.lastProduced.toFixed(0)} made, {m.lastConsumed.toFixed(0)} eaten
                      </div>
                    </div>
                    <div className="row-aside">
                      <span className={`cost ${bad ? 'bad' : 'good'}`}>{m.supplyBand}</span>
                      <span className="label">{m.daysOfCover.toFixed(1)} days</span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="scroll-y" style={{ minHeight: 0 }}>
          <div className="label" style={{ marginBottom: 6 }}>
            Facilities — lowest output first
          </div>
          <div className="row-list" style={{ marginBottom: 12 }}>
            {facilities.slice(0, 8).map((f) => {
              const eff = f.state?.efficiency ?? 1;
              const impaired = eff < 0.8;
              return (
                <div key={f.def.id} className="row">
                  <div className="row-main">
                    <div className="row-title">{f.def.name}</div>
                    <div className="row-sub">
                      {f.overseer?.name}
                      {f.npc && f.npc.condition.status !== 'Healthy' && ` — ${f.npc.condition.status}`}
                    </div>
                  </div>
                  <div className="row-aside">
                    <span className={`cost ${impaired ? 'bad' : 'good'}`}>
                      {Math.round(eff * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="label" style={{ marginBottom: 6 }}>
            The eight interests
          </div>
          <div className="row-list">
            {FACTION_LIST.map((def) => {
              const state = game.factions[def.id];
              if (!state) return null;
              return (
                <div key={def.id} className="row">
                  <div className="row-main">
                    <div className="row-title" style={{ color: def.color }}>
                      {def.name}
                    </div>
                    <div className="row-sub">{def.wants}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <div style={{ flex: 1 }}>
                        <span className="label">Opinion {Math.round(state.opinion)}</span>
                        <div className="bar bar-rose">
                          <i style={{ width: `${state.opinion}%` }} />
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className="label">Power {Math.round(state.power)}</span>
                        <div className="bar bar-gold">
                          <i style={{ width: `${state.power}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

function Stat({
  label,
  value,
  bar,
  invert,
}: {
  label: string;
  value: number;
  bar: string;
  invert?: boolean;
}) {
  const tone = invert ? (value > 60 ? 'bad' : '') : value < 35 ? 'bad' : '';
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className={`stat-value ${tone}`}>{Math.round(value)}</div>
      <div className={`bar bar-${bar}`} style={{ marginTop: 4 }}>
        <i style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
