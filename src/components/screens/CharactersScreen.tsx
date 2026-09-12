import { useState } from 'react';
import { Heart, Shield, Sparkles } from 'lucide-react';
import { useGameStore } from '../../state/store';
import { NPC_DEFINITIONS, NPCS_BY_ID } from '../../content/npcs';
import { perksForNpc } from '../../content/bonds/perks';
import { activePerks, bondTier, deriveMood, tierIndex } from '../../engine/relationships';
import { ScreenFrame } from '../layout/ScreenFrame';
import { CharacterArt } from '../ui/CharacterArt';

export function CharactersScreen() {
  const game = useGameStore((s) => s.game);
  const setActiveCompanion = useGameStore((s) => s.setActiveCompanion);
  const setScreen = useGameStore((s) => s.setScreen);
  const [selected, setSelected] = useState<string | null>(null);

  const active = activePerks(game.npcs);
  const roster = NPC_DEFINITIONS.filter((d) => game.npcs[d.id]);

  const detailDef = selected ? NPCS_BY_ID[selected] : null;
  const detailState = selected ? game.npcs[selected] : null;

  return (
    <ScreenFrame
      title="The Retinue"
      subtitle={`${game.retinue.length} of ${roster.length} stand with you.`}
      background="characters/backgrounds/queen_background.webp"
    >
      <div className="scroll-y" style={{ height: '100%' }}>
        <div className="roster">
          {roster.map((def) => {
            const state = game.npcs[def.id];
            const tier = bondTier(state.relationship);
            const ill = state.condition.status !== 'Healthy';
            const inRetinue = game.retinue.includes(def.id);

            return (
              <button
                key={def.id}
                className={`roster-card rarity-${def.rarity}`}
                onClick={() => setSelected(def.id)}
                style={{ opacity: inRetinue ? 1 : 0.55 }}
              >
                <CharacterArt npc={def} alt={def.name} />
                <div className="roster-card-top">
                  <span className={`rarity-pip ${def.rarity}`}>{def.rarity}</span>
                  {ill && <span className="status-pip">{state.condition.status}</span>}
                </div>
                <div className="roster-card-info">
                  <b>{def.name}</b>
                  <small>{def.title}</small>
                  {def.bondable && (
                    <div className="affection-row" style={{ marginTop: 4 }}>
                      <Heart size={10} style={{ color: 'var(--rose-500)' }} fill="currentColor" />
                      <div className="bar bar-rose" style={{ height: 4 }}>
                        <i style={{ width: `${state.relationship.affection}%` }} />
                      </div>
                      <small style={{ fontSize: 8 }}>{tier}</small>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {detailDef && detailState && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="modal panel-solid"
            style={{ padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail">
              <div className={`detail-art rarity-${detailDef.rarity}`}>
                <CharacterArt npc={detailDef} alt={detailDef.name} />
              </div>

              <div className="detail-body scroll-y">
                <div className="detail-head">
                  <div>
                    <h2 style={{ color: 'var(--gold-200)', fontSize: 22 }}>{detailDef.name}</h2>
                    <p style={{ margin: '2px 0 0', color: 'var(--parchment)', fontSize: 14 }}>
                      {detailDef.title}
                    </p>
                    <p style={{ margin: '1px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                      {detailDef.role}
                    </p>
                  </div>
                  <span className={`rarity-pip ${detailDef.rarity}`}>{detailDef.rarity}</span>
                </div>

                <div className="trait-row" style={{ margin: '8px 0' }}>
                  {detailDef.traits.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                  <span className="tag">{deriveMood(detailState)}</span>
                </div>

                {detailDef.bondable && (
                  <div className="dim-grid">
                    <Dim label="Affection" value={detailState.relationship.affection} bar="rose" />
                    <Dim label="Trust" value={detailState.relationship.trust} bar="gold" />
                    <Dim label="Respect" value={detailState.relationship.respect} bar="gold" />
                    <Dim label="Desire" value={detailState.relationship.desire} bar="rose" />
                    <Dim label="Resentment" value={detailState.relationship.resentment} bar="blood" />
                    <Dim label="Jealousy" value={detailState.relationship.jealousy} bar="blood" />
                  </div>
                )}

                <div className="detail-section">
                  <div className="label">Condition</div>
                  <p>
                    {detailState.condition.status} · {Math.round(detailState.condition.health)} health
                    {detailState.condition.status !== 'Healthy' &&
                      ` · ${detailState.condition.daysInStatus} days`}
                  </p>
                </div>

                <div className="detail-section">
                  <div className="label">She runs</div>
                  <p>
                    {detailDef.facility.replace(/_/g, ' ')} — {detailDef.managedResource}
                  </p>
                </div>

                <div className="detail-section">
                  <div className="label">What she wants</div>
                  <p>{detailDef.interior.want}</p>
                </div>

                <div className="detail-section">
                  <div className="label">What she fears</div>
                  <p>{detailDef.interior.fear}</p>
                </div>

                {detailDef.bondable && (
                  <div className="detail-section">
                    <div className="label">What her bond grants</div>
                    {perksForNpc(detailDef.id).map((perk) => {
                      const unlocked = active.some((p) => p.id === perk.id);
                      const reached =
                        perk.tier !== undefined &&
                        tierIndex(bondTier(detailState.relationship)) >= tierIndex(perk.tier);
                      return (
                        <div key={perk.id} className={`perk ${unlocked ? 'on' : ''}`}>
                          <div className="perk-head">
                            {unlocked ? <Sparkles size={12} /> : <Shield size={12} />}
                            <b>{perk.name}</b>
                            <span className="label">{perk.tier}</span>
                          </div>
                          <p>{perk.description}</p>
                          {reached && !unlocked && (
                            <span className="cost bad">Suspended — she is not doing you favours.</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="detail-section">
                  <div className="label">What she thinks of the others</div>
                  {detailDef.opinions.map((o) => (
                    <p key={o.npcId} style={{ marginBottom: 4 }}>
                      <b style={{ color: 'var(--gold-200)' }}>{NPCS_BY_ID[o.npcId]?.name ?? o.npcId}</b>
                      {' — '}
                      <span className={o.opinion === 'ally' ? 'cost good' : o.opinion === 'neutral' ? '' : 'cost bad'}>
                        {o.opinion}
                      </span>
                      . {o.reason}
                    </p>
                  ))}
                </div>

                {detailState.memories.length > 0 && (
                  <div className="detail-section">
                    <div className="label">What she remembers</div>
                    {detailState.memories
                      .slice(-5)
                      .reverse()
                      .map((m, i) => (
                        <p key={i} style={{ marginBottom: 2 }}>
                          Day {m.day} — {m.summary}
                        </p>
                      ))}
                  </div>
                )}

                {game.retinue.includes(detailDef.id) && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 10 }}
                    onClick={() => {
                      setActiveCompanion(detailDef.id);
                      setSelected(null);
                      setScreen('home');
                    }}
                  >
                    Attend her
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ScreenFrame>
  );
}

function Dim({ label, value, bar }: { label: string; value: number; bar: string }) {
  return (
    <div className="dim">
      <div className="dim-head">
        <span className="label">{label}</span>
        <span className="numeral" style={{ fontSize: 11 }}>
          {Math.floor(value)}
        </span>
      </div>
      <div className={`bar bar-${bar}`}>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
