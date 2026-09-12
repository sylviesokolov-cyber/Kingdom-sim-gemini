import { useMemo, useRef } from 'react';
import {
  Bell,
  ChevronRight,
  EyeOff,
  Gem,
  HeartHandshake,
  Image as ImageIcon,
  Mail,
  Map,
  Scale,
  ScrollText,
  ShoppingBag,
  Sparkles,
  Swords,
} from 'lucide-react';
import { useGameStore } from '../../state/store';
import type { ScreenId } from '../../state/store';
import { NPCS_BY_ID } from '../../content/npcs';
import { RESOURCES } from '../../content/resources';
import { BANNERS } from '../../content/gacha';
import { homeSceneAt } from '../../content/homeScenes';
import { CharacterArt } from '../ui/CharacterArt';

/**
 * Home — the player's own chambers.
 *
 * This screen holds no companion interaction: Talk, Gift, and Assist live in
 * the Bonds tab. Home is a day-action hub with an ambient, idle-animated
 * companion display (see the `.l2d-*` classes in styles/home.css for what
 * "L2D-style" means here — a CSS approximation, since the roster is single
 * flattened portraits rather than rigged, layered art) that the player can
 * pick, over a chambers backdrop the player can also cycle.
 */
export function HomeScreen() {
  const game = useGameStore((s) => s.game);
  const setActiveCompanion = useGameStore((s) => s.setActiveCompanion);
  const setHomeScene = useGameStore((s) => s.setHomeScene);
  const setScreen = useGameStore((s) => s.setScreen);
  const pushToast = useGameStore((s) => s.pushToast);
  const immersive = useGameStore((s) => s.ui.immersive);
  const setImmersive = useGameStore((s) => s.setImmersive);

  const anchorRef = useRef<HTMLDivElement>(null);

  const npcId = game.activeCompanionId;
  const def = NPCS_BY_ID[npcId];
  const scene = homeSceneAt(game.homeSceneIndex);

  const actions = useMemo(() => buildDayActions(game), [game]);

  if (!def) return null;

  const cycleScene = () => setHomeScene(game.homeSceneIndex + 1);

  // Desktop-only ambient parallax toward the pointer. Idle breathing (CSS
  // keyframe, always on) carries the "alive" feeling on touch devices, where
  // a drag-driven tilt would just look like a mistake.
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !anchorRef.current) return;
    const dx = (e.clientX / window.innerWidth - 0.5) * 2;
    const dy = (e.clientY / window.innerHeight - 0.5) * 2;
    anchorRef.current.style.setProperty('--tiltX', `${dx * 6}px`);
    anchorRef.current.style.setProperty('--tiltY', `${dy * 4}px`);
  };

  return (
    <section
      className="home"
      onPointerMove={onPointerMove}
      onClick={() => {
        if (immersive) setImmersive(false);
      }}
    >
      <div className="scene-bg" style={{ backgroundImage: `url(${scene.imageUrl})` }} />
      <div className="scene-vignette" />

      {!immersive && (
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
      )}

      {!immersive && (
        <div className="location-label">
          Valenreach · {scene.name} · Day {game.clock.day}
        </div>
      )}

      {immersive && (
        <button
          className="hud-icon-btn immersive-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setImmersive(false);
          }}
          aria-label="Show the interface"
          title="Show the interface"
        >
          <EyeOff size={14} />
        </button>
      )}

      <div className="stage">
        <div className="l2d-anchor" ref={anchorRef}>
          <CharacterArt npc={def} className="stage-art" alt={`${def.name}, ${def.title}`} />
        </div>
      </div>

      {!immersive && (
        <div className="stage-controls">
          <button
            className="hud-icon-btn"
            onClick={cycleScene}
            aria-label="Change the scene"
            title={`Change the scene (${scene.name})`}
          >
            <ImageIcon size={14} />
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
                  className={`retinue-avatar ${id === npcId ? 'selected' : ''} ${ill ? 'ill' : ''}`}
                  onClick={() => setActiveCompanion(id)}
                  aria-label={`Bring ${rd.name} to your chambers`}
                  title={ill ? `${rd.name} — ${rs.condition.status}` : rd.name}
                >
                  <CharacterArt npc={rd} alt="" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!immersive && (
        <aside className="home-actions">
          <div className="home-actions-head">
            <span className="label">Today, {game.player.name}</span>
            <h2>What will you do?</h2>
          </div>
          <div className="row-list scroll-y" style={{ flex: 1, minHeight: 0 }}>
            {actions.map((a) => (
              <button key={a.id} className="row" onClick={() => setScreen(a.screen)}>
                <span className="row-icon">
                  <a.Icon size={16} />
                </span>
                <div className="row-main">
                  <div className="row-title">{a.label}</div>
                  <div className={`row-sub ${a.tone === 'bad' ? 'bad' : ''}`}>{a.sub}</div>
                </div>
                <ChevronRight size={14} className="row-chevron" />
              </button>
            ))}
          </div>
        </aside>
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

interface DayAction {
  id: string;
  label: string;
  sub: string;
  tone: 'good' | 'bad' | 'neutral';
  screen: ScreenId;
  Icon: typeof Swords;
}

/**
 * The day's actions, with subtitles read from live state rather than fixed
 * flavor text — this is Home's whole job now, so it has to actually tell the
 * player something true about where they should spend the day.
 */
function buildDayActions(game: ReturnType<typeof useGameStore.getState>['game']): DayAction[] {
  const ill = Object.values(game.npcs).filter(
    (n) => n.condition.status !== 'Healthy' && n.condition.status !== 'Deceased',
  );
  const scarce = Object.values(game.market)
    .filter((m) => m.supplyBand === 'Critically Scarce' || m.supplyBand === 'Scarce')
    .sort((a, b) => a.daysOfCover - b.daysOfCover)[0];
  const banner = BANNERS[0];
  const pity = game.gacha.pity[banner.type];

  return [
    {
      id: 'work',
      label: 'The Work Hall',
      Icon: Swords,
      screen: 'work',
      tone: 'neutral',
      sub: `${Math.round(game.player.vitals.energy)}/${game.player.vitals.maxEnergy} energy. Work awaits.`,
    },
    {
      id: 'market',
      label: 'The Bourse',
      Icon: ShoppingBag,
      screen: 'market',
      tone: scarce ? 'bad' : 'neutral',
      sub: scarce
        ? `${RESOURCES[scarce.resourceId]?.name ?? scarce.resourceId} is ${scarce.supplyBand.toLowerCase()}.`
        : 'Prices are holding steady.',
    },
    {
      id: 'characters',
      label: 'Your Retinue',
      Icon: HeartHandshake,
      screen: 'characters',
      tone: ill.length > 0 ? 'bad' : 'neutral',
      sub:
        ill.length > 0
          ? `${NPCS_BY_ID[ill[0].id]?.name ?? ill[0].id}${ill.length > 1 ? ` and ${ill.length - 1} other${ill.length > 2 ? 's' : ''}` : ''} need${ill.length === 1 ? 's' : ''} tending.`
          : `${game.retinue.length} companions await you.`,
    },
    {
      id: 'kingdom',
      label: 'Valenreach',
      Icon: Map,
      screen: 'kingdom',
      tone: game.kingdom.unrest > 55 ? 'bad' : 'neutral',
      sub: `Welfare ${Math.round(game.kingdom.welfare)} · Unrest ${Math.round(game.kingdom.unrest)}.`,
    },
    {
      id: 'summon',
      label: banner.name,
      Icon: Gem,
      screen: 'summon',
      tone: 'neutral',
      sub: `${Math.floor(game.player.currencies.fateCrystals).toLocaleString()} crystals · pity ${pity.sinceSsr}/80`,
    },
    {
      id: 'council',
      label: 'The Council Chamber',
      Icon: Scale,
      screen: 'council',
      tone: 'neutral',
      sub: 'No petitions await the crown yet.',
    },
  ];
}
