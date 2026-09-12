import { Award, Coins, Flag, Heart, ScrollText, Shield, Skull, Sparkles, Zap } from 'lucide-react';
import { useGameStore } from '../../state/store';
import { getEstateTier } from '../../engine/progression';
import { CAREER_DEFINITIONS, ESTATE_LADDER, estateIndex, rankName } from '../../content/progression';
import { FACTION_LIST } from '../../content/factions';
import { ATTRIBUTES } from '../../types';
import { ScreenFrame } from '../layout/ScreenFrame';
import { CareerTrackList } from '../ui/CareerTrackList';

const ATTRIBUTE_LABELS: Record<(typeof ATTRIBUTES)[number], string> = {
  might: 'Might',
  cunning: 'Cunning',
  authority: 'Authority',
  piety: 'Piety',
  charm: 'Charm',
};

/**
 * The Character tab — a read-only sheet of everything about the player that
 * doesn't fit the HUD: full estate ladder, vitals, attributes, every career
 * track, personal standing with each faction, and perks/deeds/bounty.
 *
 * Deliberately read-only. Petitioning an estate and working a career stay
 * on the Work screen (the place that already takes those actions); this
 * screen exists to see the whole picture at once, not to duplicate action
 * buttons. The career-track list is shared with WorkScreen via
 * `CareerTrackList` rather than repeated here.
 */
export function ProfileScreen() {
  const game = useGameStore((s) => s.game);
  const { player } = game;
  const tier = getEstateTier(player.estate);
  const currentIndex = estateIndex(player.estate);

  const topCareer = Object.values(player.careers)
    .filter((c) => c.rank > 0)
    .sort((a, b) => b.rank - a.rank)[0];

  return (
    <ScreenFrame
      title={player.name}
      subtitle={
        topCareer
          ? `${tier.title} · ${rankName(topCareer.track, topCareer.rank)} of the ${CAREER_DEFINITIONS[topCareer.track].name}`
          : tier.title
      }
      background="characters/backgrounds/consort_background.webp"
    >
      <div className="screen-cols cols-2">
        <div className="scroll-y" style={{ minHeight: 0 }}>
          <div className="label" style={{ marginBottom: 6 }}>
            Estate — {player.standingPoints.toLocaleString()} standing
          </div>
          <div className="estate-ladder">
            {ESTATE_LADDER.map((t, i) => (
              <div
                key={t.estate}
                className={`estate-step ${i === currentIndex ? 'current' : ''} ${i < currentIndex ? 'passed' : ''}`}
              >
                <span className="estate-step-dot" />
                <span className="estate-step-label">{t.estate}</span>
              </div>
            ))}
          </div>

          <div className="label" style={{ margin: '14px 0 6px' }}>
            Vitals
          </div>
          <div className="stat-grid" style={{ marginBottom: 12 }}>
            <Stat
              label="Energy"
              value={player.vitals.energy}
              max={player.vitals.maxEnergy}
              bar="gold"
            />
            <Stat label="Health" value={player.vitals.health} max={100} bar="jade" />
            <Stat label="Hunger" value={player.vitals.hunger} max={100} bar="blood" invert />
          </div>

          <div className="label" style={{ marginBottom: 6 }}>
            Attributes
          </div>
          <div className="stat-grid" style={{ marginBottom: 12 }}>
            {ATTRIBUTES.map((a) => (
              <div key={a} className="stat">
                <div className="label">{ATTRIBUTE_LABELS[a]}</div>
                <div className="stat-value">{player.attributes[a]}</div>
              </div>
            ))}
          </div>

          <div className="label" style={{ marginBottom: 6 }}>
            Coffers
          </div>
          <div className="stat-grid">
            <Stat label="Copper" value={player.currencies.copper} display icon={<Coins size={12} />} />
            <Stat
              label="Guild Marks"
              value={player.currencies.guildMarks}
              display
              icon={<ScrollText size={12} />}
            />
            <Stat
              label="Fate Crystals"
              value={player.currencies.fateCrystals}
              display
              icon={<Sparkles size={12} />}
            />
            <Stat
              label="Bond Hearts"
              value={player.currencies.bondHearts}
              display
              icon={<Heart size={12} />}
            />
          </div>
        </div>

        <div className="scroll-y" style={{ minHeight: 0 }}>
          <div className="label" style={{ marginBottom: 6 }}>
            Career Tracks
          </div>
          <div className="panel" style={{ padding: 12, marginBottom: 12 }}>
            <CareerTrackList game={game} />
          </div>

          <div className="label" style={{ marginBottom: 6 }}>
            Standing with the eight interests
          </div>
          <div className="row-list" style={{ marginBottom: 12 }}>
            {FACTION_LIST.map((def) => (
              <div key={def.id} className="row">
                <div className="row-main">
                  <div className="row-title" style={{ color: def.color }}>
                    {def.name}
                  </div>
                  <div className="bar bar-rose" style={{ marginTop: 4 }}>
                    <i style={{ width: `${Math.max(0, Math.min(100, player.standing[def.id]))}%` }} />
                  </div>
                </div>
                <div className="row-aside">
                  <span className="label">{Math.round(player.standing[def.id])}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="label" style={{ marginBottom: 6 }}>
            Record
          </div>
          <div className="stat-grid" style={{ marginBottom: 12 }}>
            <Stat label="Deeds" value={player.deeds.length} display icon={<Flag size={12} />} />
            <Stat label="Perks" value={player.perks.length} display icon={<Award size={12} />} />
            <Stat
              label="Businesses"
              value={player.businesses.length}
              display
              icon={<Shield size={12} />}
            />
            <Stat
              label="Bounty"
              value={player.bounty}
              display
              icon={<Skull size={12} />}
              tone={player.bounty > 0 ? 'bad' : undefined}
            />
          </div>

          {player.perks.length > 0 && (
            <>
              <div className="label" style={{ marginBottom: 6 }}>
                Active perks
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {player.perks.map((p) => (
                  <span key={p} className="tag">
                    <Zap size={10} /> {p}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ScreenFrame>
  );
}

function Stat({
  label,
  value,
  max,
  bar,
  invert,
  display,
  icon,
  tone,
}: {
  label: string;
  value: number;
  max?: number;
  bar?: string;
  invert?: boolean;
  display?: boolean;
  icon?: React.ReactNode;
  tone?: 'bad';
}) {
  if (display) {
    return (
      <div className="stat">
        <div className="label">{label}</div>
        <div className={`stat-value ${tone ?? ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {icon}
          {Math.round(value).toLocaleString()}
        </div>
      </div>
    );
  }
  const pct = max ? Math.min(100, (value / max) * 100) : value;
  const badTone = invert ? pct > 65 : pct < 35;
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className={`stat-value ${badTone ? 'bad' : ''}`}>
        {Math.round(value)}
        {max ? ` / ${max}` : ''}
      </div>
      <div className={`bar bar-${bar}`} style={{ marginTop: 4 }}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
