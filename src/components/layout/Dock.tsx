import {
  Backpack,
  Castle,
  Gem,
  HeartHandshake,
  Map,
  Scale,
  ShoppingBag,
  Sunrise,
  Swords,
} from 'lucide-react';
import type { ScreenId } from '../../state/store';

const TABS: { id: ScreenId; label: string; Icon: typeof Castle }[] = [
  { id: 'home', label: 'Home', Icon: Castle },
  { id: 'kingdom', label: 'Kingdom', Icon: Map },
  { id: 'characters', label: 'Bonds', Icon: HeartHandshake },
  { id: 'work', label: 'Work', Icon: Swords },
  { id: 'market', label: 'Market', Icon: ShoppingBag },
  { id: 'council', label: 'Council', Icon: Scale },
  { id: 'summon', label: 'Summon', Icon: Gem },
  { id: 'inventory', label: 'Pack', Icon: Backpack },
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
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-lg next-day" onClick={onAdvanceDay}>
        <Sunrise size={16} />
        Next Day
      </button>
    </nav>
  );
}
