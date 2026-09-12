import type { ScreenId } from '../../state/store';
import {
  IconBonds,
  IconCastle,
  IconHelm,
  IconMap,
  IconPouch,
  IconSatchel,
  IconScales,
  IconSparkle,
  IconSunrise,
  IconSwords,
} from '../ui/GameIcon';

const TABS: { id: ScreenId; label: string; Icon: typeof IconCastle }[] = [
  { id: 'home', label: 'Home', Icon: IconCastle },
  { id: 'profile', label: 'Character', Icon: IconHelm },
  { id: 'kingdom', label: 'Kingdom', Icon: IconMap },
  { id: 'characters', label: 'Bonds', Icon: IconBonds },
  { id: 'work', label: 'Work', Icon: IconSwords },
  { id: 'market', label: 'Market', Icon: IconPouch },
  { id: 'council', label: 'Council', Icon: IconScales },
  { id: 'summon', label: 'Summon', Icon: IconSparkle },
  { id: 'inventory', label: 'Pack', Icon: IconSatchel },
];

interface Props {
  screen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onAdvanceDay: () => void;
  alerts: Partial<Record<ScreenId, boolean>>;
}

export function Dock({ screen, onNavigate, onAdvanceDay, alerts }: Props) {
  return (
    <nav className="dock">
      <div className="dock-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`dock-tab ${screen === id ? 'selected' : ''}`}
            onClick={() => onNavigate(id)}
          >
            {alerts[id] && <span className="rail-dot" />}
            <Icon size={21} tone={screen === id ? 'gold' : 'bronze'} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-lg next-day" onClick={onAdvanceDay}>
        <IconSunrise size={19} tone="gold" />
        Next Day
      </button>
    </nav>
  );
}
