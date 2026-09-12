import { useMemo, useState } from 'react';
import { ChevronRight, Eye, EyeOff, TrendingDown, Users } from 'lucide-react';
import {
  IconBell,
  IconCrown,
  IconHeart,
  IconMail,
  IconScroll,
  IconSparkle,
} from '../ui/GameIcon';
import { useGameStore } from '../../state/store';
import type { LiveEventDefinition } from '../../types';
import { canPromoteEstate, getEstateTier } from '../../engine/progression';
import { ESTATE_LADDER, estateIndex } from '../../content/progression';
import { activeEvents, daysRemaining } from '../../content/events';

/** Home's backdrop. One fixed painted scene — see the folder the owner
 *  pointed to (public/backgrounds/). A background selector (single image or
 *  carousel) is planned to slot in here; this constant is the only thing it
 *  needs to replace. */
const HOME_BACKGROUND = 'backgrounds/home_dusk_gold.jpg';

interface Props {
  /** When true, all Home chrome (HUD, dock, rail, quest card, panel) is hidden — art only. */
  hideUI: boolean;
  onToggleHideUI: () => void;
}

/**
 * Home — the main menu.
 *
 * Kept deliberately spare, on the owner's direct instruction after an
 * earlier pass got too text-heavy: one background image, the HUD and dock
 * (both rendered by the app shell, not here), a small utility rail, a
 * single card naming the one thing that actually matters today, and a
 * slim right-side panel surfacing what needs attention. None of it should
 * compete with the art — the panel and rail stay small and translucent,
 * and the hide-UI button lets the player drop all of it to look at the
 * background alone.
 *
 * Bonding still carries no presence here — Talk/Gift/Bond stay in the Bonds
 * tab, reached like any other tab, not surfaced on this screen.
 */
export function HomeScreen({ hideUI, onToggleHideUI }: Props) {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);
  const pushToast = useGameStore((s) => s.pushToast);
  const interactedToday = useGameStore((s) => s.ui.interactedToday);

  const [showEvents, setShowEvents] = useState(false);

  const day = game.clock.day;
  const live = useMemo(() => activeEvents(day), [day]);

  const roster = useMemo(() => Object.values(game.npcs), [game.npcs]);
  const recruited = useMemo(() => roster.filter((n) => n.recruited), [roster]);
  const ailing = recruited.filter(
    (n) => n.condition.status !== 'Healthy' && n.condition.status !== 'Deceased',
  ).length;
  const unvisited = recruited.filter((n) => !interactedToday.includes(n.id)).length;
  const scarce = Object.values(game.market).filter(
    (m) => m.supplyBand === 'Critically Scarce',
  ).length;
  const unrestHigh = game.kingdom.unrest > 60;

  const tier = getEstateTier(game.player.estate);
  const nextTier = ESTATE_LADDER[estateIndex(game.player.estate) + 1];
  const verdict = nextTier ? canPromoteEstate(game.player, game.factions) : null;
  const quest = nextTier
    ? verdict!.eligible
      ? `Ready to petition for ${nextTier.title}.`
      : verdict!.reasons[0]
    : 'You hold the throne. Valenreach is yours to keep.';

  const openEvent = (event: LiveEventDefinition) => {
    setShowEvents(false);
    setScreen(event.screen);
  };

  const panelItems: { icon: React.ReactNode; text: string; onClick: () => void }[] = [];
  if (live.length > 0) {
    panelItems.push({
      icon: <IconSparkle size={14} tone="gold" />,
      text: `${live.length} event${live.length === 1 ? '' : 's'} running`,
      onClick: () => setShowEvents(true),
    });
  }
  if (unvisited > 0) {
    panelItems.push({
      icon: <IconHeart size={14} tone="rose" />,
      text: `${unvisited} companion${unvisited === 1 ? '' : 's'} await you`,
      onClick: () => setScreen('characters'),
    });
  }
  if (ailing > 0) {
    panelItems.push({
      icon: <Users size={13} />,
      text: `${ailing} companion${ailing === 1 ? '' : 's'} need care`,
      onClick: () => setScreen('characters'),
    });
  }
  if (scarce > 0) {
    panelItems.push({
      icon: <TrendingDown size={13} />,
      text: `${scarce} good${scarce === 1 ? '' : 's'} critically scarce`,
      onClick: () => setScreen('market'),
    });
  }
  if (unrestHigh) {
    panelItems.push({
      icon: <IconBell size={14} tone="gold" />,
      text: 'Unrest is rising in the kingdom',
      onClick: () => setScreen('kingdom'),
    });
  }

  return (
    <section className="home">
      <div className="scene-bg" style={{ backgroundImage: `url(${HOME_BACKGROUND})` }} />
      <div className="scene-vignette" />

      <button
        className="home-hide-toggle"
        onClick={onToggleHideUI}
        title={hideUI ? 'Show interface' : 'Hide interface'}
        aria-label={hideUI ? 'Show interface' : 'Hide interface'}
      >
        {hideUI ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>

      {!hideUI && (
        <>
          <aside className="side-rail">
            <RailButton icon={<IconMail size={19} tone="parchment" />} label="Mail" onClick={() => pushToast('No new mail.')} />
            <RailButton
              icon={<IconScroll size={19} tone="parchment" />}
              label="Quests"
              onClick={() => pushToast('The quest log opens in a later chapter.')}
            />
            <RailButton
              icon={<IconSparkle size={19} tone="gold" />}
              label="Events"
              dot={live.length > 0}
              onClick={() => setShowEvents(true)}
            />
            <RailButton icon={<IconBell size={19} tone="parchment" />} label="Notice" onClick={() => pushToast('Nothing posted.')} />
          </aside>

          <button
            className="home-quest"
            onClick={() => setScreen(nextTier ? 'work' : 'kingdom')}
            title={nextTier ? `Petition for ${nextTier.title} on the Work screen` : 'Open the Kingdom screen'}
          >
            <IconCrown size={19} tone="gold" />
            <div className="home-quest-body">
              <span className="home-quest-eyebrow">
                Day {day} · {tier.title}
              </span>
              <span className="home-quest-text">{quest}</span>
            </div>
            <ChevronRight size={14} className="row-chevron" />
          </button>

          {panelItems.length > 0 && (
            <aside className="home-panel">
              <div className="home-panel-head">Today</div>
              {panelItems.map((item, i) => (
                <button key={i} className="home-panel-row" onClick={item.onClick}>
                  {item.icon}
                  <span>{item.text}</span>
                </button>
              ))}
            </aside>
          )}
        </>
      )}

      {showEvents && (
        <div className="modal-backdrop" onClick={() => setShowEvents(false)}>
          <div className="modal panel-solid home-events-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Events</h3>
            {live.length === 0 ? (
              <div className="empty">
                <span>Nothing is running in Valenreach today.</span>
              </div>
            ) : (
              <div className="row-list">
                {live.map((e) => (
                  <button key={e.id} className="row" onClick={() => openEvent(e)}>
                    <div className="row-main">
                      <div className="row-title">
                        {e.name}
                        <span className={`event-tag event-tag-${e.tone}`}>{e.tag}</span>
                      </div>
                      <div className="row-sub">
                        {daysRemaining(e, day) > 900
                          ? 'Standing'
                          : `${daysRemaining(e, day)} day${daysRemaining(e, day) === 1 ? '' : 's'} left`}
                        {' · '}
                        {e.blurb}
                      </div>
                    </div>
                    <ChevronRight size={14} className="row-chevron" />
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowEvents(false)}>
              Close
            </button>
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
