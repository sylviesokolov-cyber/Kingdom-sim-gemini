import { useState } from 'react';
import { Gem, Gift, Scroll, ScrollText, Shirt } from 'lucide-react';
import { useGameStore } from '../../state/store';
import { BANNERS } from '../../content/gacha';
import { NPCS_BY_ID } from '../../content/npcs';
import { pullCost, pullsUntilGuarantee, ssrRateAt } from '../../engine/gacha';
import { HARD_PITY } from '../../types';
import { ScreenFrame } from '../layout/ScreenFrame';

export function SummonScreen() {
  const game = useGameStore((s) => s.game);
  const results = useGameStore((s) => s.ui.lastPullResults);
  const summon = useGameStore((s) => s.summon);
  const [index, setIndex] = useState(0);
  const [showRates, setShowRates] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);

  const pull = (count: number) => {
    summon(banner, count);
    setRevealOpen(true);
  };

  const banner = BANNERS[index];
  const pity = game.gacha.pity[banner.type];
  const crystals = game.player.currencies.fateCrystals;

  const featured = banner.featuredId ? NPCS_BY_ID[banner.featuredId] : undefined;

  return (
    <ScreenFrame
      title="Summon"
      subtitle="Fate Crystals are earned, never bought."
      background="characters/backgrounds/sorceress_background.webp"
      aside={
        <div className="currency currency-crystal" style={{ fontSize: 14 }}>
          <Gem size={15} />
          <span className="numeral">{Math.floor(crystals).toLocaleString()}</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10, minHeight: 0 }}>
        <div className="banner-tabs">
          {BANNERS.map((b, i) => (
            <button
              key={b.id}
              className={`btn btn-sm ${i === index ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setIndex(i)}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div className="banner-stage">
          {banner.artUrl && <img src={banner.artUrl} alt="" />}
          <div className="banner-stage-info">
            <h2>{banner.name}</h2>
            <p>{banner.description}</p>
            {featured && (
              <div className="trait-row" style={{ marginTop: 8 }}>
                <span className="tag">Featured · {featured.name}</span>
                {pity.guaranteedFeatured && <span className="tag">Next SSR guaranteed</span>}
              </div>
            )}

            <div className="pity-row">
              <span className="label">Pity</span>
              <div className="bar bar-gold" style={{ width: 140 }}>
                <i style={{ width: `${(pity.sinceSsr / HARD_PITY) * 100}%` }} />
              </div>
              <span className="numeral" style={{ fontSize: 11 }}>
                {pity.sinceSsr}/{HARD_PITY}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRates(true)}>
                Rates
              </button>
            </div>
            <div className="label" style={{ marginTop: 4 }}>
              {pullsUntilGuarantee(pity)} pulls to a guaranteed SSR ·{' '}
              {(ssrRateAt(pity.sinceSsr) * 100).toFixed(1)}% on the next
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexShrink: 0 }}>
          <button
            className="btn btn-ghost btn-lg"
            disabled={crystals < pullCost(banner, 1)}
            onClick={() => pull(1)}
          >
            Summon ×1 · {pullCost(banner, 1)}
          </button>
          <button
            className="btn btn-gold btn-lg"
            disabled={crystals < pullCost(banner, 10)}
            onClick={() => pull(10)}
          >
            Summon ×10 · {pullCost(banner, 10)}
          </button>
        </div>
      </div>

      {results && results.length > 0 && revealOpen && (
        <div className="modal-backdrop" onClick={() => setRevealOpen(false)}>
          <div
            className="modal panel-solid pull-reveal"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h3 style={{ color: 'var(--gold-200)' }}>The call is answered</h3>
              <span className="label">{results.length} summoned</span>
            </div>

            <div className="pull-results">
              {results.map((r, i) => (
                <div
                  key={`${r.entry.id}-${i}`}
                  className={`pull-card rarity-${r.entry.rarity}`}
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  {r.entry.imageUrl ? (
                    <img src={r.entry.imageUrl} alt="" />
                  ) : (
                    <span className="pull-card-kind">
                      {r.entry.kind === 'charter' ? (
                        <ScrollText size={18} />
                      ) : r.entry.kind === 'outfit' ? (
                        <Shirt size={18} />
                      ) : r.entry.kind === 'gift' ? (
                        <Gift size={18} />
                      ) : (
                        <Scroll size={18} />
                      )}
                    </span>
                  )}
                  {r.duplicate && <span className="dupe-flag">+RES</span>}
                  <div className="pull-card-label">{r.entry.name}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={() => setRevealOpen(false)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {showRates && (
        <div className="modal-backdrop" onClick={() => setShowRates(false)}>
          <div
            className="modal panel-solid"
            style={{ padding: 18, maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--gold-200)' }}>Rates</h3>
            <p style={{ fontSize: 14, color: 'var(--parchment)' }}>
              These are the real numbers the summon uses. Nothing is hidden, and the reveal
              animation never implies a rarity the result is not.
            </p>
            <ul className="req-list" style={{ fontSize: 14 }}>
              <li>SSR — 1.6% base rate</li>
              <li>Soft pity begins at pull 61, rising 6% per pull</li>
              <li>SSR guaranteed at pull {HARD_PITY}</li>
              <li>At least one SR in every block of ten</li>
              {banner.featuredId && <li>Half of all SSRs are the featured companion</li>}
              {banner.featuredId && <li>Losing that coin flip guarantees her on the next SSR</li>}
              <li>Pity carries across banners and never resets when one ends</li>
              <li>Duplicate companions become Resonance, raising her affection ceiling</li>
            </ul>
          </div>
        </div>
      )}
    </ScreenFrame>
  );
}
