import { useMemo, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Gift,
  Heart,
  HeartHandshake,
  Mail,
  MessageCircle,
  ScrollText,
  Shirt,
  Sparkles,
  UserRound,
  Users,
  Volume2,
} from 'lucide-react';
import { useGameStore } from '../../state/store';
import { NPCS_BY_ID } from '../../content/npcs';
import { BANNERS } from '../../content/gacha';
import { RESOURCES } from '../../content/resources';
import { bondTier, deriveMood, selectDialogue } from '../../engine/relationships';
import { CharacterArt } from '../ui/CharacterArt';

const FALLBACK_BG = 'characters/backgrounds/main_screen_background.jpg';

export function HomeScreen() {
  const game = useGameStore((s) => s.game);
  const talkTo = useGameStore((s) => s.talkTo);
  const giftTo = useGameStore((s) => s.giftTo);
  const assist = useGameStore((s) => s.assist);
  const setActiveCompanion = useGameStore((s) => s.setActiveCompanion);
  const setScreen = useGameStore((s) => s.setScreen);
  const pushToast = useGameStore((s) => s.pushToast);

  const [line, setLine] = useState<string | null>(null);
  const [showGifts, setShowGifts] = useState(false);
  const [showRetinue, setShowRetinue] = useState(false);

  const npcId = game.activeCompanionId;
  const def = NPCS_BY_ID[npcId];
  const npc = game.npcs[npcId];

  const mood = useMemo(() => (npc ? deriveMood(npc) : 'Content'), [npc]);
  const tier = useMemo(() => (npc ? bondTier(npc.relationship) : 'Stranger'), [npc]);

  if (!def || !npc) return null;

  const banner = BANNERS[0];
  const spoken = line ?? def.dialogue.greetings[0];

  const cycleLine = () => {
    const pool = def.dialogue.greetings;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setLine(next === spoken && pool.length > 1 ? pool[(pool.indexOf(next) + 1) % pool.length] : next);
  };

  const onTalk = () => {
    talkTo(npcId);
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

  const matters = buildMatters(game);

  return (
    <section className="home">
      <div
        className="home-bg"
        style={{ backgroundImage: `url(${def.backgroundUrl ?? FALLBACK_BG})` }}
      />
      <div className="home-vignette" />

      <aside className="side-rail">
        <RailButton icon={<Mail size={17} />} label="Mail" onClick={() => pushToast('No new mail.')} />
        <RailButton
          icon={<ScrollText size={17} />}
          label="Quests"
          dot
          onClick={() => pushToast('The quest log opens in a later chapter.')}
        />
        <RailButton
          icon={<Sparkles size={17} />}
          label="Events"
          onClick={() => pushToast('No events are running.')}
        />
        <RailButton icon={<Bell size={17} />} label="Notice" onClick={() => pushToast('Nothing posted.')} />
      </aside>

      <div className="location-label">
        Valenreach · {def.district.replace(/_/g, ' ')} · {game.clock.phase}
      </div>

      <div className="stage">
        <CharacterArt
          npc={def}
          className="stage-art"
          onClick={cycleLine}
          alt={`${def.name}, ${def.title}`}
        />
      </div>

      <div className="home-stack">
        <button className="dialogue" onClick={cycleLine}>
          <div className="dialogue-name">
            <span>{def.name}</span>
            <span className="dialogue-mood">{mood}</span>
          </div>
          <p>{spoken}</p>
        </button>

        <div className="home-stack-row">
          <button className="banner-card" onClick={() => setScreen('summon')}>
            <span className="banner-card-art">
              <img src={banner.artUrl} alt="" />
            </span>
            <div>
              <b>{banner.name}</b>
              <small>SSR Rate Up</small>
              <em>{banner.featuredId ? NPCS_BY_ID[banner.featuredId]?.name : 'Standing call'}</em>
            </div>
          </button>

          <div className="matters">
            <div className="matters-title">
              <span>Today's Matters</span>
              <ChevronRight size={13} />
            </div>
            {matters.map((m) => (
              <button key={m.text} className={`matter ${m.tone}`} onClick={() => setScreen(m.screen)}>
                <span className="matter-dot" />
                <span>{m.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="companion">
        <div className="companion-head">
          <div className={`companion-portrait rarity-${def.rarity}`}>
            <CharacterArt npc={def} alt="" />
          </div>
          <div className="companion-id">
            <h2>{def.name}</h2>
            <p>{def.title}</p>
          </div>
          <span className={`rarity-pip ${def.rarity}`}>{def.rarity}</span>
        </div>

        <div className="affection-row">
          <span className="affection-heart">
            <Heart size={14} fill="currentColor" />
            {Math.floor(npc.relationship.affection)}
          </span>
          <div className="bar bar-rose">
            <i style={{ width: `${npc.relationship.affection}%` }} />
          </div>
          <small>{tier}</small>
        </div>

        <div className="affection-row">
          <span className="label" style={{ width: 38 }}>
            Trust
          </span>
          <div className="bar bar-gold">
            <i style={{ width: `${npc.relationship.trust}%` }} />
          </div>
          <small>{Math.floor(npc.relationship.trust)}</small>
        </div>

        <div className="trait-row">
          {def.traits.slice(0, 4).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>

        <div className="companion-quote">“{selectDialogue(def, 'personal', mood)}”</div>

        <div className="companion-actions">
          <button className="btn btn-ghost btn-sm" onClick={onTalk}>
            <MessageCircle size={13} />
            Talk
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowGifts(true)}>
            <Gift size={13} />
            Gift
          </button>
          <button className="btn btn-rose btn-sm" onClick={() => assist(npcId)}>
            <HeartHandshake size={13} />
            Assist
          </button>
        </div>

        <div className="companion-links">
          <button className="link-btn" onClick={() => setScreen('characters')}>
            <UserRound size={12} /> Profile
          </button>
          <button className="link-btn" onClick={() => pushToast('Outfits arrive with the wardrobe system.')}>
            <Shirt size={12} /> Outfits
          </button>
          <button className="link-btn" onClick={() => pushToast('Bond stories are being written.')}>
            <Heart size={12} /> Bond Story
          </button>
          <button className="link-btn" onClick={() => pushToast('She has no voice yet.')}>
            <Volume2 size={12} /> Voice
          </button>
        </div>

        <div className="retinue-head">
          <span className="label">Retinue</span>
          <span className="numeral" style={{ fontSize: 11 }}>
            {game.retinue.indexOf(npcId) + 1}/{game.retinue.length}
          </span>
        </div>
        <div className="retinue-strip">
          {game.retinue.slice(0, 5).map((id) => {
            const rd = NPCS_BY_ID[id];
            const rs = game.npcs[id];
            if (!rd || !rs) return null;
            const ill = rs.condition.status !== 'Healthy';
            return (
              <button
                key={id}
                className={`retinue-avatar ${id === npcId ? 'selected' : ''} ${ill ? 'ill' : ''}`}
                onClick={() => setActiveCompanion(id)}
                aria-label={rd.name}
                title={ill ? `${rd.name} — ${rs.condition.status}` : rd.name}
              >
                <CharacterArt npc={rd} alt="" />
              </button>
            );
          })}
          <button className="retinue-avatar" onClick={() => setShowRetinue(true)} aria-label="All companions">
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--gold-400)',
              }}
            >
              <Users size={15} />
            </span>
          </button>
        </div>
      </aside>

      {showGifts && (
        <div className="modal-backdrop" onClick={() => setShowGifts(false)}>
          <div className="modal panel-solid" style={{ padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--gold-200)', marginBottom: 4 }}>Give {def.name} something</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0 }}>
              She is fond of {def.favoriteGifts.map((g) => RESOURCES[g]?.name ?? g).join(', ').toLowerCase()}.
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
                          giftTo(npcId, id);
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

      {showRetinue && (
        <div className="modal-backdrop" onClick={() => setShowRetinue(false)}>
          <div className="modal panel-solid" style={{ padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--gold-200)', marginBottom: 10 }}>Your Retinue</h3>
            <div className="scroll-y" style={{ maxHeight: '52vh' }}>
              <div className="roster">
                {game.retinue.map((id) => {
                  const rd = NPCS_BY_ID[id];
                  const rs = game.npcs[id];
                  if (!rd || !rs) return null;
                  return (
                    <button
                      key={id}
                      className={`roster-card rarity-${rd.rarity}`}
                      onClick={() => {
                        setActiveCompanion(id);
                        setShowRetinue(false);
                      }}
                    >
                      <CharacterArt npc={rd} alt="" />
                      <div className="roster-card-top">
                        <span className={`rarity-pip ${rd.rarity}`}>{rd.rarity}</span>
                      </div>
                      <div className="roster-card-info">
                        <b>{rd.name}</b>
                        <small>{rd.title}</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function RailButton({
  icon,
  label,
  dot,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  dot?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="rail-btn" onClick={onClick}>
      {dot && <span className="rail-dot" />}
      {icon}
      <span>{label}</span>
    </button>
  );
}

/**
 * The three daily bullets. These read live state, so they tell the player
 * what actually needs attention rather than showing fixed flavor text.
 */
function buildMatters(game: ReturnType<typeof useGameStore.getState>['game']) {
  const matters: { text: string; tone: 'good' | 'bad' | 'neutral'; screen: 'kingdom' | 'market' | 'characters' | 'work' }[] =
    [];

  const ill = Object.values(game.npcs).filter(
    (n) => n.condition.status !== 'Healthy' && n.condition.status !== 'Deceased',
  );
  if (ill.length > 0) {
    const name = NPCS_BY_ID[ill[0].id]?.name ?? ill[0].id;
    matters.push({
      text: ill.length === 1 ? `${name} is unwell.` : `${name} and ${ill.length - 1} others are unwell.`,
      tone: 'bad',
      screen: 'characters',
    });
  }

  const scarce = Object.values(game.market)
    .filter((m) => m.supplyBand === 'Critically Scarce' || m.supplyBand === 'Scarce')
    .sort((a, b) => a.daysOfCover - b.daysOfCover)[0];
  if (scarce) {
    const r = RESOURCES[scarce.resourceId];
    matters.push({
      text: `${r?.name ?? scarce.resourceId} is ${scarce.supplyBand.toLowerCase()}.`,
      tone: 'bad',
      screen: 'market',
    });
  }

  if (game.kingdom.unrest > 55) {
    matters.push({ text: 'The districts are restless.', tone: 'bad', screen: 'kingdom' });
  }

  while (matters.length < 3) {
    if (!matters.some((m) => m.screen === 'work')) {
      matters.push({ text: 'There is work to be had.', tone: 'neutral', screen: 'work' });
    } else if (!matters.some((m) => m.screen === 'kingdom')) {
      matters.push({
        text: `The granary holds ${Math.floor(game.market.grain?.daysOfCover ?? 0)} days.`,
        tone: 'neutral',
        screen: 'kingdom',
      });
    } else {
      matters.push({ text: 'The market is open.', tone: 'neutral', screen: 'market' });
    }
  }

  return matters.slice(0, 3);
}
