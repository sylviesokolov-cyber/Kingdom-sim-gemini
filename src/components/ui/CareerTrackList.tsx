import { CAREER_LIST, rankName } from '../../content/progression';
import { canAdvanceCareer, effectiveCareerCap } from '../../engine/progression';
import type { GameState } from '../../types';

/**
 * The six career tracks with rank name and XP-to-next-rank bar. Shared by
 * the Work screen (where it sits beside the job list) and the Character
 * screen (where it's one section of the full player sheet) — same data,
 * same read-only presentation, so it lives in one place.
 */
export function CareerTrackList({ game }: { game: GameState }) {
  return (
    <>
      {CAREER_LIST.map((c) => {
        const career = game.player.careers[c.id];
        const cap = effectiveCareerCap(game.player, c.id);
        const verdict = canAdvanceCareer(game.player, c.id, game.factions);
        const nextXp = c.xpThresholds[Math.min(4, career.rank)];
        const capped = career.rank >= cap;

        return (
          <div key={c.id} className="track-row">
            <div className="track-row-head">
              <span className="row-title">{c.name}</span>
              <span className="label">
                {career.rank > 0 ? rankName(c.id, career.rank) : 'Untracked'}
                {capped && cap < 5 ? ' · capped' : ''}
              </span>
            </div>
            <div className="bar bar-gold">
              <i style={{ width: `${Math.min(100, (career.xp / nextXp) * 100)}%` }} />
            </div>
            {capped && cap < 5 && (
              <div className="cost bad" style={{ marginTop: 3 }}>
                {verdict.reasons[0]}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
