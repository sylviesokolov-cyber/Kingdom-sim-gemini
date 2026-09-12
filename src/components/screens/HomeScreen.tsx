import { useMemo, useState } from 'react';
import { Bell, ChevronRight, Crown, Mail, ScrollText, Sparkles } from 'lucide-react';
import { useGameStore } from '../../state/store';
import type { LiveEventDefinition } from '../../types';
import { canPromoteEstate, getEstateTier } from '../../engine/progression';
import { ESTATE_LADDER, estateIndex } from '../../content/progression';
import { activeEvents, daysRemaining } from '../../content/events';

/** Home's backdrop. One fixed painted scene — see the folder the owner
 *  pointed to (public/backgrounds/). No picker, no cycling: one image. */
const HOME_BACKGROUND = 'backgrounds/home_dusk_gold.jpg';

/**
 * Home — the main menu.
 *
 * Kept deliberately spare, on the owner's direct instruction after an
 * earlier pass got too text-heavy: one background image, the HUD and dock
 * (both rendered by the app shell, not here), a small utility rail, and a
 * single card naming the one thing that actually matters today — the
 * player's next step toward their next estate. Nothing else competes with
 * the art for attention.
 *
 * Bonding still carries no presence here — Talk/Gift/Bond stay in the Bonds
 * tab, reached like any other tab, not surfaced on this screen.
 */
export function HomeScreen() {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);
  const pushToast = useGameStore((s) => s.pushToast);

  const [showEvents, setShowEvents] = useState(false);

  const day = game.clock.day;
  const live = useMemo(() => activeEvents(day), [day]);

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

  return (
    <section className="home">
      <div className="scene-bg" style={{ backgroundImage: `url(${HOME_BACKGROUND})` }} />
      <div className="scene-vignette" />

      <aside className="side-rail">
        <RailButton icon={<Mail size={17} />} label="Mail" onClick={() => pushToast('No new mail.')} />
        <RailButton
          icon={<ScrollText size={17} />}
          label="Quests"
          onClick={() => pushToast('The quest log opens in a later chapter.')}
        />
        <RailButton
          icon={<Sparkles size={17} />}
          label="Events"
          dot={live.length > 0}
          onClick={() => setShowEvents(true)}
        />
        <RailButton icon={<Bell size={17} />} label="Notice" onClick={() => pushToast('Nothing posted.')} />
      </aside>

      <button
        className="home-quest"
        onClick={() => setScreen(nextTier ? 'work' : 'kingdom')}
        title={nextTier ? `Petition for ${nextTier.title} on the Work screen` : 'Open the Kingdom screen'}
      >
        <Crown size={16} />
        <div className="home-quest-body">
          <span className="home-quest-eyebrow">
            Day {day} · {tier.title}
          </span>
          <span className="home-quest-text">{quest}</span>
        </div>
        <ChevronRight size={14} className="row-chevron" />
      </button>

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
