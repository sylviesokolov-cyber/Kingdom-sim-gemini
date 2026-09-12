import type { GameState } from '../../types';
import { getEstateTier } from '../../engine/progression';
import { ESTATE_LADDER, CAREER_DEFINITIONS, rankName } from '../../content/progression';
import { estateIndex } from '../../content/progression';
import {
  IconBolt,
  IconCloudRain,
  IconCoin,
  IconCrown,
  IconGear,
  IconGem,
  IconHeart,
  IconMoon,
  IconScroll,
  IconSnowflake,
  IconSun,
} from '../ui/GameIcon';

interface Props {
  game: GameState;
  onOpenSettings: () => void;
}

const WEATHER_ICON = {
  Clear: IconSun,
  Overcast: IconMoon,
  Rain: IconCloudRain,
  Storm: IconCloudRain,
  Drought: IconSun,
  Frost: IconSnowflake,
  Snow: IconSnowflake,
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

  const WeatherIcon = WEATHER_ICON[clock.weather] ?? IconSun;

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
          <IconCrown size={20} tone="gold" />
          <span className="hud-level-badge" title={`Level ${player.level}`}>
            {player.level}
          </span>
        </div>
        <div className="hud-player-id">
          <div className="hud-name">{player.name}</div>
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
          icon={<IconBolt size={21} tone="jade" />}
          value={`${Math.round(player.vitals.energy)}/${player.vitals.maxEnergy}`}
          tone="energy"
        />
        <Currency icon={<IconCoin size={21} tone="gold" />} value={short(player.currencies.copper)} tone="gold" />
        <Currency
          icon={<IconScroll size={21} tone="parchment" />}
          value={short(player.currencies.guildMarks)}
          tone="parchment"
        />
        <Currency
          icon={<IconGem size={21} tone="crystal" />}
          value={short(player.currencies.fateCrystals)}
          tone="crystal"
        />
        <Currency icon={<IconHeart size={21} tone="rose" />} value={short(player.currencies.bondHearts)} tone="rose" />
      </div>

      <div className="hud-right">
        <div className="hud-clock">
          <WeatherIcon size={22} tone="gold" />
          <div>
            <div className="hud-day">Day {clock.day}</div>
            <div className="label">
              {clock.season} · {clock.weather}
            </div>
          </div>
        </div>
        <button className="hud-icon-btn" onClick={onOpenSettings} aria-label="Settings">
          <IconGear size={19} tone="parchment" />
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
      <span className="currency-icon">{icon}</span>
      <span className="numeral">{value}</span>
    </div>
  );
}
