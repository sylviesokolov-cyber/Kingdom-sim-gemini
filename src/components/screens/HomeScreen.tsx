import { useMemo, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Gem,
  HeartHandshake,
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
import type { LiveEventDefinition } from '../../types';
import { NPCS_BY_ID } from '../../content/npcs';
import { RESOURCES } from '../../content/resources';
import { BANNERS } from '../../content/gacha';
import { activeEvents, daysRemaining, eventAt } from '../../content/events';

/**
 * Home — the throne room, and the player's command center.
 *
 * The main game is a kingdom simulator: peasant to king. Home's whole job is
 * to say what the kingdom needs today and get the player into the screen
 * that handles it — it carries no companion art or portraits. Bonding is a
 * real but separate system that lives entirely in the Bonds tab; Home only
 * ever links to it the same way it links to Work or the Bourse.
 *
 * This is the second time Home has been built this way. An earlier session
 * put a full-bleed companion render on stage here (matching the layout of a
 * gacha-game home screen); the owner corrected that twice, and the current
 * source of truth (CLAUDE.md, docs/UI_DESIGN_SYSTEM.md §3) is explicit that
 * Home carries no character art, portraits, or bonding concept at all. Do
 * not reintroduce it.
 */
export function HomeScreen() {
  const game = useGameStore((s) => s.game);
  const setScreen = useGameStore((s) => s.setScreen);
  const pushToast = useGameStore((s) => s.pushToast);
  const eventIndex = useGameStore((s) => s.ui.homeEventIndex);
  const setEventIndex = useGameStore((s) => s.setHomeEventIndex);

  const [showEvents, setShowEvents] = useState(false);

  const day = game.clock.day;
  const actions = useMemo(() => buildDayActions(game), [game]);
  const live = useMemo(() => activeEvents(day), [day]);
  const banner = eventAt(day, eventIndex);
  const k = game.kingdom;

  const openEvent = (event: LiveEventDefinition) => {
    setShowEvents(false);
    setScreen(event.screen);
  };

  return (
    <section className="home">
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

      <div className="home-main">
        <div className="home-head">
          <span className="label">Valenreach · Day {game.clock.day}</span>
          <h2>Good morning, {game.player.name}.</h2>
        </div>

        <div className="stat-grid home-vitals">
          <KingdomStat label="Population" value={k.population.toLocaleString()} />
          <KingdomStat label="Welfare" value={Math.round(k.welfare)} bad={k.welfare < 40} />
          <KingdomStat label="Unrest" value={Math.round(k.unrest)} bad={k.unrest > 55} />
          <KingdomStat label="Treasury" value={`${Math.round(k.treasury).toLocaleString()}g`} />
        </div>

        {banner && (
          <button className="event-ticker" onClick={() => openEvent(banner)}>
            <Sparkles size={14} />
            <div className="event-ticker-body">
              <span className="event-ticker-name">{banner.name}</span>
              <span className="event-ticker-meta">
                <span className={`event-tag event-tag-${banner.tone}`}>{banner.tag}</span>
                {daysRemaining(banner, day) > 900
                  ? 'Standing'
                  : `${daysRemaining(banner, day)} day${daysRemaining(banner, day) === 1 ? '' : 's'} left`}
              </span>
            </div>
            {live.length > 1 && (
              <span className="event-ticker-dots">
                {live.map((e, i) => (
                  <span
                    key={e.id}
                    className={`event-dot ${e.id === banner.id ? 'selected' : ''}`}
                    role="button"
                    aria-label={e.name}
                    title={e.name}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setEventIndex(i);
                    }}
                  />
                ))}
              </span>
            )}
            <ChevronRight size={14} className="row-chevron" />
          </button>
        )}

        <div className="row-list scroll-y home-actions-list">
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
      </div>

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

function KingdomStat({ label, value, bad }: { label: string; value: string | number; bad?: boolean }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className={`stat-value ${bad ? 'bad' : ''}`}>{value}</div>
    </div>
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
 * flavor text — this is Home's whole job, so it has to actually tell the
 * player something true about where they should spend the day.
 */
function buildDayActions(game: ReturnType<typeof useGameStore.getState>['game']): DayAction[] {
  const ill = Object.values(game.npcs).filter(
    (n) => n.condition.status !== 'Healthy' && n.condition.status !== 'Deceased',
  );
  const scarce = Object.values(game.market)
    .filter((m) => m.supplyBand === 'Critically Scarce' || m.supplyBand === 'Scarce')
    .sort((a, b) => a.daysOfCover - b.daysOfCover)[0];
  const gachaBanner = BANNERS[0];
  const pity = game.gacha.pity[gachaBanner.type];

  return [
    {
      id: 'kingdom',
      label: 'Valenreach',
      Icon: Map,
      screen: 'kingdom',
      tone: game.kingdom.unrest > 55 ? 'bad' : 'neutral',
      sub: `Welfare ${Math.round(game.kingdom.welfare)} · Unrest ${Math.round(game.kingdom.unrest)}.`,
    },
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
      id: 'council',
      label: 'The Council Chamber',
      Icon: Scale,
      screen: 'council',
      tone: 'neutral',
      sub: 'No petitions await the crown yet.',
    },
    {
      id: 'summon',
      label: gachaBanner.name,
      Icon: Gem,
      screen: 'summon',
      tone: 'neutral',
      sub: `${Math.floor(game.player.currencies.fateCrystals).toLocaleString()} crystals · pity ${pity.sinceSsr}/80`,
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
          : `${game.retinue.length} companions bonded.`,
    },
  ];
}
