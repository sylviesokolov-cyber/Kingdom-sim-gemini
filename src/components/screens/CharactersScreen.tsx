import { useState } from 'react';
import {
  BookOpen,
  Gift,
  Heart,
  Images,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Shield,
  Shirt,
  Sparkles,
  User,
  Volume2,
} from 'lucide-react';
import { useGameStore } from '../../state/store';
import { NPC_DEFINITIONS, NPCS_BY_ID } from '../../content/npcs';
import { RESOURCES } from '../../content/resources';
import { perksForNpc } from '../../content/bonds/perks';
import {
  activePerks,
  affectionCap,
  bondTier,
  deriveMood,
  selectDialogue,
  tierIndex,
} from '../../engine/relationships';
import { CharacterArt } from '../ui/CharacterArt';

/**
 * The Bonds tab — the character interactions system.
 *
 * A full-bleed hero screen: the companion fills the stage, and every
 * interaction (Talk, Gift, Bond, the profile sheet, and the still-stubbed
 * Intimacy / Bond Story / Outfits / Voice / Gallery) is overlaid directly on
 * her art, matching the reference character-card UI rather than a roster
 * grid with a modal behind it. The roster and full relationship-dimension
 * detail are one tap away instead of the default view. See
 * docs/systems/BONDS.md.
 */
export function CharactersScreen() {
  const game = useGameStore((s) => s.game);
  const talkTo = useGameStore((s) => s.talkTo);
  const giftTo = useGameStore((s) => s.giftTo);
  const assist = useGameStore((s) => s.assist);
  const setActiveCompanion = useGameStore((s) => s.setActiveCompanion);

  const [activeId, setActiveId] = useState(game.activeCompanionId);
  const [line, setLine] = useState<string | null>(null);
  const [showRoster, setShowRoster] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGifts, setShowGifts] = useState(false);

  const active = activePerks(game.npcs);
  const roster = NPC_DEFINITIONS.filter((d) => game.npcs[d.id]);

  const def = NPCS_BY_ID[activeId];
  const state = game.npcs[activeId];
  if (!def || !state) return null;

  const mood = deriveMood(state);
  const tier = bondTier(state.relationship);
  const cap = affectionCap(state.relationship, false);

  const pick = (id: string) => {
    setActiveId(id);
    setLine(null);
    setShowRoster(false);
  };

  const onTalk = () => {
    talkTo(activeId);
    setLine(selectDialogue(def, 'personal', mood));
  };

  // Giftable = anything in the player's inventory, favorites surfaced first.
  const giftable = Object.entries(game.player.inventory)
    .filter(([, qty]) => qty > 0)
    .sort(([a], [b]) => {
      const aFav = def.favoriteGifts.includes(a) ? 0 : 1;
      const bFav = def.favoriteGifts.includes(b) ? 0 : 1;
      return aFav - bFav;
    });

  return (
    <section className="screen bond-hero">
      {def.backgroundUrl && (
        <div className="scene-bg" style={{ backgroundImage: `url(${def.backgroundUrl})` }} />
      )}
      <div className="scene-vignette" />

      <div className="stage bond-stage">
        <div className="l2d-anchor">
          <CharacterArt npc={def} className="stage-art" alt={`${def.name}, ${def.title}`} />
        </div>
      </div>

      <div className="bond-head">
        <h1>{def.name}</h1>
        <p className="bond-subtitle">
          {def.title} · {mood}
        </p>

        {def.bondable && (
          <div className="bond-tier-row">
            <Heart size={14} fill="currentColor" />
            <span className="bond-tier-num">{tierIndex(tier) + 1}</span>
            <div className="bar bar-rose">
              <i style={{ width: `${(state.relationship.affection / cap) * 100}%` }} />
            </div>
            <span className="bond-tier-cap">
              {Math.floor(state.relationship.affection)}/{cap}
            </span>
          </div>
        )}

        <div className="trait-row">
          {def.traits.slice(0, 3).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      {def.bondable && (
        <div className="bond-foot">
          <div className="bond-quote">“{line ?? selectDialogue(def, 'personal', mood)}”</div>
          <div className="bond-actions">
            <button className="btn btn-ghost btn-sm" onClick={onTalk}>
              <MessageCircle size={13} />
              Talk
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowGifts(true)}>
              <Gift size={13} />
              Gift
            </button>
            <button className="btn btn-rose btn-sm" onClick={() => assist(def.id)}>
              <Heart size={13} />
              Bond
            </button>
          </div>
        </div>
      )}

      <nav className="bond-rail">
        <BondRailButton icon={<User size={16} />} label="Profile" onClick={() => setShowProfile(true)} />
        <BondRailButton icon={<Shirt size={16} />} label="Outfits" disabled title="Outfits arrive with the wardrobe system." />
        <BondRailButton icon={<BookOpen size={16} />} label="Bond Story" disabled title="Bond stories are being written." />
        <BondRailButton icon={<Moon size={16} />} label="Intimacy" disabled title="Intimacy scenes arrive with her questline." />
        <BondRailButton icon={<Images size={16} />} label="Gallery" disabled title="The intimacy gallery unlocks with her story." />
        <BondRailButton icon={<Volume2 size={16} />} label="Voice" disabled title="She has no voice yet." />
        <BondRailButton icon={<MoreHorizontal size={16} />} label="More" disabled title="More options arrive later." />
      </nav>

      <div className="stage-controls">
        <button className="hud-icon-btn" onClick={() => setShowRoster(true)} aria-label="Choose a companion">
          <Images size={14} />
        </button>
        <div className="retinue-strip">
          {game.retinue.map((id) => {
            const rd = NPCS_BY_ID[id];
            const rs = game.npcs[id];
            if (!rd || !rs) return null;
            const ill = rs.condition.status !== 'Healthy';
            return (
              <button
                key={id}
                className={`retinue-avatar ${id === activeId ? 'selected' : ''} ${ill ? 'ill' : ''}`}
                onClick={() => pick(id)}
                aria-label={rd.name}
                title={ill ? `${rd.name} — ${rs.condition.status}` : rd.name}
              >
                <CharacterArt npc={rd} alt="" />
              </button>
            );
          })}
        </div>
      </div>

      {showProfile && (
        <div className="modal-backdrop" onClick={() => setShowProfile(false)}>
          <div className="modal panel-solid scroll-y" style={{ padding: 16, maxHeight: '82vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="detail-section">
              <div className="label">Condition</div>
              <p>
                {state.condition.status} · {Math.round(state.condition.health)} health
                {state.condition.status !== 'Healthy' && ` · ${state.condition.daysInStatus} days`}
              </p>
            </div>

            <div className="detail-section">
              <div className="label">She runs</div>
              <p>
                {def.facility.replace(/_/g, ' ')} — {def.managedResource}
              </p>
            </div>

            <div className="detail-section">
              <div className="label">What she wants</div>
              <p>{def.interior.want}</p>
            </div>

            <div className="detail-section">
              <div className="label">What she fears</div>
              <p>{def.interior.fear}</p>
            </div>

            {def.bondable && (
              <>
                <div className="dim-grid">
                  <Dim label="Trust" value={state.relationship.trust} bar="gold" />
                  <Dim label="Respect" value={state.relationship.respect} bar="gold" />
                  <Dim label="Desire" value={state.relationship.desire} bar="rose" />
                  <Dim label="Resentment" value={state.relationship.resentment} bar="blood" />
                  <Dim label="Jealousy" value={state.relationship.jealousy} bar="blood" />
                </div>

                <div className="detail-section">
                  <div className="label">What her bond grants</div>
                  {perksForNpc(def.id).map((perk) => {
                    const unlocked = active.some((p) => p.id === perk.id);
                    const reached =
                      perk.tier !== undefined && tierIndex(bondTier(state.relationship)) >= tierIndex(perk.tier);
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
              </>
            )}

            <div className="detail-section">
              <div className="label">What she thinks of the others</div>
              {def.opinions.map((o) => (
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

            {state.memories.length > 0 && (
              <div className="detail-section">
                <div className="label">What she remembers</div>
                {state.memories
                  .slice(-5)
                  .reverse()
                  .map((m, i) => (
                    <p key={i} style={{ marginBottom: 2 }}>
                      Day {m.day} — {m.summary}
                    </p>
                  ))}
              </div>
            )}

            {game.retinue.includes(def.id) && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => {
                  setActiveCompanion(def.id);
                  setShowProfile(false);
                }}
              >
                Bring her to your chambers
              </button>
            )}
          </div>
        </div>
      )}

      {showRoster && (
        <div className="modal-backdrop" onClick={() => setShowRoster(false)}>
          <div className="modal panel-solid scroll-y" style={{ padding: 12, maxHeight: '82vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="roster">
              {roster.map((d) => {
                const rs = game.npcs[d.id];
                const ill = rs.condition.status !== 'Healthy';
                const inRetinue = game.retinue.includes(d.id);
                return (
                  <button
                    key={d.id}
                    className={`roster-card rarity-${d.rarity}`}
                    onClick={() => pick(d.id)}
                    style={{ opacity: inRetinue ? 1 : 0.55 }}
                  >
                    <CharacterArt npc={d} alt={d.name} />
                    <div className="roster-card-top">
                      <span className={`rarity-pip ${d.rarity}`}>{d.rarity}</span>
                      {ill && <span className="status-pip">{rs.condition.status}</span>}
                    </div>
                    <div className="roster-card-info">
                      <b>{d.name}</b>
                      <small>{d.title}</small>
                      {d.bondable && (
                        <div className="affection-row" style={{ marginTop: 4 }}>
                          <Heart size={10} style={{ color: 'var(--rose-500)' }} fill="currentColor" />
                          <div className="bar bar-rose" style={{ height: 4 }}>
                            <i style={{ width: `${rs.relationship.affection}%` }} />
                          </div>
                          <small style={{ fontSize: 8 }}>{bondTier(rs.relationship)}</small>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showGifts && (
        <div className="modal-backdrop" onClick={() => setShowGifts(false)}>
          <div className="modal panel-solid" style={{ padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--gold-200)', marginBottom: 4 }}>Give {def.name} something</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0 }}>
              She is fond of{' '}
              {def.favoriteGifts.map((g) => RESOURCES[g]?.name ?? g).join(', ').toLowerCase()}.
            </p>
            {giftable.length === 0 ? (
              <div className="empty">You have nothing to give.</div>
            ) : (
              <div className="scroll-y" style={{ maxHeight: '46vh' }}>
                <div className="row-list">
                  {giftable.map(([id, qty]) => {
                    const r = RESOURCES[id];
                    const fav = def.favoriteGifts.includes(id);
                    const hated = def.hatedGifts.includes(id);
                    return (
                      <button
                        key={id}
                        className="row"
                        onClick={() => {
                          giftTo(activeId, id);
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
    </section>
  );
}

function BondRailButton({
  icon,
  label,
  onClick,
  disabled,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      className="bond-rail-btn"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
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
