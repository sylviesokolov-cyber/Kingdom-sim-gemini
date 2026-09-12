import { Coins, Gem, Heart, Scroll, Settings, Sun, Moon, CloudRain, Snowflake, Zap } from 'lucide-react';
import type { GameState } from '../../types';
import { getEstateTier } from '../../engine/progression';
import { ESTATE_LADDER, CAREER_DEFINITIONS, rankName } from '../../content/progression';
import { estateIndex } from '../../content/progression';

interface Props {
  game: GameState;
  onOpenSettings: () => void;
}

const WEATHER_ICON = {
  Clear: Sun,
  Overcast: Moon,
  Rain: CloudRain,
  Storm: CloudRain,
  Drought: Sun,
  Frost: Snowflake,
  Snow: Snowflake,
} as const;

function short(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  return Math.round(n).toLocaleString();
}

export function HeaderHud({ game, onOpenSettings }: Props) {
  const { player, clock } = game;
  const next = ESTATE_LADDER[estateIndex(player.estate) + 1];
  const tier = getEstateTier(player.estate);
  const progress = next
    ? Math.min(100, (player.standingPoints / next.standingRequired) * 100)
    : 100;

  const WeatherIcon = WEATHER_ICON[clock.weather] ?? Sun;

  const topCareer = Object.values(player.careers)
    .filter((c) => c.rank > 0)
    .sort((a, b) => b.rank - a.rank)[0];
  const roleLabel = topCareer
    ? `${tier.title} · ${rankName(topCareer.track, topCareer.rank)} (${CAREER_DEFINITIONS[topCareer.track].name})`
    : tier.title;

  return (
    <header className="hud">
      <div className="hud-player">
        <div className="hud-avatar">
          <Scroll size={18} />
        </div>
        <div className="hud-player-id">
          <div className="hud-name">
            {player.name}
            <span className="label"> Lv.{player.level}</span>
          </div>
          <div className="hud-estate" title={player.estate}>
            {roleLabel}
          </div>
          <div className="bar bar-gold hud-progress">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="hud-currencies">
        <Currency
          icon={<Zap size={13} />}
          value={`${Math.round(player.vitals.energy)}/${player.vitals.maxEnergy}`}
          tone="energy"
        />
        <Currency icon={<Coins size={13} />} value={short(player.currencies.copper)} tone="gold" />
        <Currency icon={<Scroll size={13} />} value={short(player.currencies.guildMarks)} tone="parchment" />
        <Currency icon={<Gem size={13} />} value={short(player.currencies.fateCrystals)} tone="crystal" />
        <Currency icon={<Heart size={13} />} value={short(player.currencies.bondHearts)} tone="rose" />
      </div>

      <div className="hud-right">
        <div className="hud-clock">
          <WeatherIcon size={14} />
          <div>
            <div className="hud-day">Day {clock.day}</div>
            <div className="label">
              {clock.season} · {clock.weather}
            </div>
          </div>
        </div>
        <button className="hud-icon-btn" onClick={onOpenSettings} aria-label="Settings">
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}

function Currency({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  tone: string;
}) {
  return (
    <div className={`currency currency-${tone}`}>
      {icon}
      <span className="numeral">{value}</span>
    </div>
  );
}
