import { useState } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useGameStore } from '../../state/store';
import { RESOURCE_LIST } from '../../content/resources';
import { buyPrice, sellPrice } from '../../engine/economy';
import { activePerks } from '../../engine/relationships';
import { ScreenFrame } from '../layout/ScreenFrame';
import type { SupplyBand, Trend } from '../../types';

const BAND_TONE: Record<SupplyBand, string> = {
  'Critically Scarce': 'bad',
  Scarce: 'bad',
  Normal: '',
  Abundant: 'good',
  Surplus: 'good',
};

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up') return <ArrowUp size={11} />;
  if (trend === 'down') return <ArrowDown size={11} />;
  return <Minus size={11} />;
}

export function MarketScreen() {
  const game = useGameStore((s) => s.game);
  const buy = useGameStore((s) => s.buy);
  const sell = useGameStore((s) => s.sell);
  const [qty, setQty] = useState(1);

  const perks = activePerks(game.npcs);
  const hasTrader = perks.some((p) => p.kind === 'market_buy_multiplier');

  return (
    <ScreenFrame
      title="The Bourse"
      subtitle={
        hasTrader
          ? 'Your contracts are quoted below the floor rate.'
          : 'Prices are what the floor says they are.'
      }
      background="/characters/backgrounds/duchess_background.webp"
      aside={
        <div className="qty-picker">
          <span className="label">Lot</span>
          {[1, 5, 25].map((n) => (
            <button
              key={n}
              className={`btn btn-sm ${qty === n ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setQty(n)}
            >
              ×{n}
            </button>
          ))}
        </div>
      }
    >
      <div className="scroll-y" style={{ height: '100%' }}>
        <div className="row-list">
          {RESOURCE_LIST.map((resource) => {
            const m = game.market[resource.id];
            if (!m) return null;

            const held = game.player.inventory[resource.id] ?? 0;
            const unitBuy = buyPrice(m, perks, resource.id);
            const unitSell = sellPrice(m, perks, resource.id);
            const canBuy = game.player.currencies.copper >= unitBuy * qty && m.stored >= qty;
            const canSell = held >= qty;

            return (
              <div key={resource.id} className="row">
                <div className="row-main">
                  <div className="row-title">{resource.name}</div>
                  <div className="row-sub">
                    <span className={`cost ${BAND_TONE[m.supplyBand]}`}>{m.supplyBand}</span>
                    {' · '}
                    {m.daysOfCover < 99 ? `${m.daysOfCover.toFixed(1)} days of cover` : 'ample'}
                    {held > 0 && ` · you hold ${held}`}
                  </div>
                </div>

                <div className="row-aside" style={{ alignItems: 'flex-end', minWidth: 64 }}>
                  <span className={`cost ${m.trend === 'up' ? 'bad' : m.trend === 'down' ? 'good' : ''}`}>
                    <TrendIcon trend={m.trend} />
                    {unitBuy}
                  </span>
                  <span className="label">sell {unitSell}</span>
                </div>

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={!canBuy}
                    onClick={() => buy(resource.id, qty)}
                  >
                    Buy
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={!canSell}
                    onClick={() => sell(resource.id, qty)}
                  >
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScreenFrame>
  );
}
