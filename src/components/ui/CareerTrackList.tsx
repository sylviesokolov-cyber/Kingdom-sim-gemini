import { CAREER_LIST, rankName } from '../../content/progression';
import { NPCS_BY_ID } from '../../content/npcs';
import { canAdvanceCareer, effectiveCareerCap } from '../../engine/progression';
import { canAttemptTrial, nextTrial } from '../../engine/career';
import type { GameState } from '../../types';

/**
 * The six career tracks with rank name and XP-to-next-rank bar. Shared by
 * the Work screen (where it sits beside the job list) and the Character
 * screen (where it's one section of the full player sheet) — same data,
 * same presentation, so it lives in one place.
 *
 * Pass `onAttemptTrial` to make it actionable: the Work screen hands it the
 * store action and gets the rank trial affordance, the Character screen omits
 * it and stays a read-only sheet.
 */
export function CareerTrackList({
  game,
  onAttemptTrial,
}: {
  game: GameState;
  onAttemptTrial?: (trialId: string) => void;
}) {
  return (
    <>
      {CAREER_LIST.map((c) => {
        const career = game.player.careers[c.id];
        const cap = effectiveCareerCap(game.player, c.id);
        const verdict = canAdvanceCareer(game.player, c.id, game.factions);
        const nextXp = c.xpThresholds[Math.min(4, career.rank)];
        const capped = career.rank >= cap;

        const trial = nextTrial(game.player, c.id);
        // A track you have never touched shows its bar and nothing else — the
        // panel should grow with the player, not present six trials on day one.
        const onThisTrack = career.rank > 0 || career.xp > 0;
        const trialVerdict = trial ? canAttemptTrial(game, trial.id) : undefined;
        const showTrial = Boolean(onAttemptTrial && trial && (onThisTrack || trialVerdict?.eligible));

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

            {showTrial && trial && trialVerdict && (
              <div className="trial-block">
                <div className="trial-head">
                  <span className="trial-title">{trial.title}</span>
                  <span className="label">
                    {NPCS_BY_ID[trial.examinerNpcId]?.name ?? ''} · {rankName(c.id, trial.rank)}
                  </span>
                </div>
                <p className="trial-desc">{trial.description}</p>
                <button
                  className={`btn btn-sm ${trialVerdict.eligible ? 'btn-gold' : 'btn-ghost'}`}
                  style={{ width: '100%' }}
                  disabled={!trialVerdict.eligible}
                  onClick={() => onAttemptTrial?.(trial.id)}
                >
                  {trialVerdict.eligible ? 'Undertake the trial' : 'Not ready'}
                </button>
                {!trialVerdict.eligible && (
                  <ul className="req-list">
                    {trialVerdict.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
