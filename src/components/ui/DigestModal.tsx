import { useGameStore } from '../../state/store';

/**
 * What changed overnight, and why. This is stage 16 of the pipeline made
 * visible — if the player cannot see why bread doubled in price, the
 * simulation has failed regardless of how correct it is.
 */
export function DigestModal() {
  const digest = useGameStore((s) => s.game.lastDigest);
  const day = useGameStore((s) => s.game.clock.day);
  const season = useGameStore((s) => s.game.clock.season);
  const weather = useGameStore((s) => s.game.clock.weather);
  const dismiss = useGameStore((s) => s.dismissDigest);

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="modal panel-solid" style={{ padding: 18 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ color: 'var(--gold-200)', fontSize: 20 }}>Day {day}</h3>
          <span className="label">
            {season} · {weather}
          </span>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2, fontStyle: 'italic' }}>
          What the night brought.
        </p>

        <div className="scroll-y digest-list" style={{ marginTop: 10 }}>
          {digest.length === 0 ? (
            <div className="empty">A quiet night. Nothing moved.</div>
          ) : (
            digest.map((entry, i) => (
              <div key={i} className={`digest-line ${entry.tone}`}>
                <span className="digest-stage">{entry.stage}</span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={dismiss}>
          Begin the day
        </button>
      </div>
    </div>
  );
}
