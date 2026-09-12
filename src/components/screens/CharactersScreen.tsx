import { useState } from 'react';
import { Gift, Heart, MessageCircle, Shield, Shirt, Sparkles, Volume2 } from 'lucide-react';
import { useGameStore } from '../../state/store';
import { NPC_DEFINITIONS, NPCS_BY_ID } from '../../content/npcs';
import { RESOURCES } from '../../content/resources';
import { perksForNpc } from '../../content/bonds/perks';
import { activePerks, bondTier, deriveMood, selectDialogue, tierIndex } from '../../engine/relationships';
import { ScreenFrame } from '../layout/ScreenFrame';
import { CharacterArt } from '../ui/CharacterArt';

/**
 * The Bonds tab — the character interactions system.
 *
 * Talk, Gift, and Assist live here rather than on Home: Home is a day-action
 * hub with a purely decorative companion display, and this is where a bond
 * actually moves. See docs/systems/BONDS.md.
 */
export function CharactersScreen() {
  const game = useGameStore((s) => s.game);
  const talkTo = useGameStore((s) => s.talkTo);
  const giftTo = useGameStore((s) => s.giftTo);
  const assist = useGameStore((s) => s.assist);
  const setActiveCompanion = useGameStore((s) => s.setActiveCompanion);
  const setScreen = useGameStore((s) => s.setScreen);
  const [selected, setSelected] = useState<string | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [showGifts, setShowGifts] = useState(false);

  const active = activePerks(game.npcs);
  const roster = NPC_DEFINITIONS.filter((d) => game.npcs[d.id]);

  const detailDef = selected ? NPCS_BY_ID[selected] : null;
  const detailState = selected ? game.npcs[selected] : null;
  const mood = detailState ? deriveMood(detailState) : 'Content';

  const openDetail = (id: string) => {
    setSelected(id);
    setLine(null);
  };

  const onTalk = () => {
    if (!selected || !detailDef) return;
    talkTo(selected);
    setLine(selectDialogue(detailDef, 'personal', mood));
  };

  // Giftable = anything in the player's inventory, favorites surfaced first.
  const giftable = detailDef
    ? Object.entries(game.player.inventory)
        .filter(([, qty]) => qty > 0)
        .sort(([a], [b]) => {
          const aFav = detailDef.favoriteGifts.includes(a) ? 0 : 1;
          const bFav = detailDef.favoriteGifts.includes(b) ? 0 : 1;
          return aFav - bFav;
        })
    : [];

  return (
    <ScreenFrame
      title="The Retinue"
      subtitle={`${game.retinue.length} of ${roster.length} stand with you. Talk, gift, and grow closer here.`}
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
                onClick={() => openDetail(def.id)}
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
                  <span className="tag">{mood}</span>
                </div>

                {detailDef.bondable && (
                  <>
                    <div className="affection-row" style={{ marginBottom: 8 }}>
                      <span className="affection-heart">
                        <Heart size={14} fill="currentColor" />
                        {Math.floor(detailState.relationship.affection)}
                      </span>
                      <div className="bar bar-rose">
                        <i style={{ width: `${detailState.relationship.affection}%` }} />
                      </div>
                      <small>{bondTier(detailState.relationship)}</small>
                    </div>

                    <div className="bond-quote">
                      “{line ?? selectDialogue(detailDef, 'personal', mood)}”
                    </div>

                    <div className="bond-actions" style={{ margin: '8px 0' }}>
                      <button className="btn btn-ghost btn-sm" onClick={onTalk}>
                        <MessageCircle size={13} />
                        Talk
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowGifts(true)}>
                        <Gift size={13} />
                        Gift
                      </button>
                      <button className="btn btn-rose btn-sm" onClick={() => assist(detailDef.id)}>
                        <Heart size={13} />
                        Assist
                      </button>
                    </div>

                    <div className="bond-links" style={{ marginBottom: 8 }}>
                      <button className="link-btn" disabled title="Outfits arrive with the wardrobe system.">
                        <Shirt size={12} /> Outfits
                      </button>
                      <button className="link-btn" disabled title="Bond stories are being written.">
                        <Heart size={12} /> Bond Story
                      </button>
                      <button className="link-btn" disabled title="The gallery unlocks with her story.">
                        <Sparkles size={12} /> Gallery
                      </button>
                      <button className="link-btn" disabled title="She has no voice yet.">
                        <Volume2 size={12} /> Voice
                      </button>
                    </div>

                    <div className="dim-grid">
                      <Dim label="Trust" value={detailState.relationship.trust} bar="gold" />
                      <Dim label="Respect" value={detailState.relationship.respect} bar="gold" />
                      <Dim label="Desire" value={detailState.relationship.desire} bar="rose" />
                      <Dim label="Resentment" value={detailState.relationship.resentment} bar="blood" />
                      <Dim label="Jealousy" value={detailState.relationship.jealousy} bar="blood" />
                    </div>
                  </>
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
                    Bring her to your chambers
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showGifts && detailDef && selected && (
        <div className="modal-backdrop" onClick={() => setShowGifts(false)}>
          <div className="modal panel-solid" style={{ padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--gold-200)', marginBottom: 4 }}>Give {detailDef.name} something</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0 }}>
              She is fond of{' '}
              {detailDef.favoriteGifts.map((g) => RESOURCES[g]?.name ?? g).join(', ').toLowerCase()}.
            </p>
            {giftable.length === 0 ? (
              <div className="empty">You have nothing to give.</div>
            ) : (
              <div className="scroll-y" style={{ maxHeight: '46vh' }}>
                <div className="row-list">
                  {giftable.map(([id, qty]) => {
                    const r = RESOURCES[id];
                    const fav = detailDef.favoriteGifts.includes(id);
                    const hated = detailDef.hatedGifts.includes(id);
                    return (
                      <button
                        key={id}
                        className="row"
                        onClick={() => {
                          giftTo(selected, id);
                          setShowGifts(false);
                        }}
                      >
                        <div className="row-main">
                          <div className="row-title">{r?.name ?? id}</div>
                          <div className="row-sub">
                            {fav ? 'She loves these.' : hated ? 'She despises these.' : 'She will accept it.'}
                          </div>
                        </div>
                        <div className="row-aside">
                          <span className="cost">×{qty}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
