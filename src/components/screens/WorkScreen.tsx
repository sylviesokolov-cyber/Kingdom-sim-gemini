import { useMemo, useState } from 'react';
import { Coins, Zap } from 'lucide-react';
import { useGameStore } from '../../state/store';
import { JOBS } from '../../content/jobs';
import { NPCS_BY_ID } from '../../content/npcs';
import { CAREER_LIST } from '../../content/progression';
import { canPromoteEstate } from '../../engine/progression';
import { evaluatePrerequisite } from '../../engine/prerequisites';
import { ScreenFrame } from '../layout/ScreenFrame';
import { CareerTrackList } from '../ui/CareerTrackList';
import type { CareerTrack } from '../../types';

export function WorkScreen() {
  const game = useGameStore((s) => s.game);
  const workJob = useGameStore((s) => s.workJob);
  const petitionEstate = useGameStore((s) => s.petitionEstate);
  const [track, setTrack] = useState<CareerTrack | 'all'>('all');

  const jobs = useMemo(
    () => JOBS.filter((j) => track === 'all' || j.track === track),
    [track],
  );

  const estateVerdict = canPromoteEstate(game.player, game.factions);

  return (
    <ScreenFrame
      title="The Work Hall"
      subtitle="What you do with a day is what you become."
      background="characters/backgrounds/blacksmith_background.webp"
    >
      <div className="screen-cols cols-2-narrow">
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: 8 }}>
          <div className="track-filter">
            <button
              className={`btn btn-sm ${track === 'all' ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setTrack('all')}
            >
              All
            </button>
            {CAREER_LIST.map((c) => (
              <button
                key={c.id}
                className={`btn btn-sm ${track === c.id ? 'btn-gold' : 'btn-ghost'}`}
                onClick={() => setTrack(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="scroll-y" style={{ flex: 1, minHeight: 0 }}>
            <div className="row-list">
              {jobs.length === 0 && <div className="empty">No work on this track yet.</div>}
              {jobs.map((job) => {
                const prereq = evaluatePrerequisite(job.requires, game);
                const affordable = game.player.vitals.energy >= job.energyCost;
                const supervisor = job.supervisorNpcId ? NPCS_BY_ID[job.supervisorNpcId] : undefined;

                return (
                  <button
                    key={job.id}
                    className={`row ${!prereq.met ? 'locked' : ''}`}
                    disabled={!prereq.met || !affordable}
                    onClick={() => workJob(job.id)}
                  >
                    <div className="row-main">
                      <div className="row-title">{job.title}</div>
                      <div className="row-sub">{job.description}</div>
                      <div className="row-meta">
                        {supervisor && <span className="tag">{supervisor.name}</span>}
                        {job.track && <span className="tag">{CAREER_LIST.find((c) => c.id === job.track)?.name}</span>}
                        {!prereq.met && (
                          <span className="cost bad">{prereq.failures[0]?.requirement}</span>
                        )}
                      </div>
                    </div>
                    <div className="row-aside">
                      <span className={`cost ${affordable ? '' : 'bad'}`}>
                        <Zap size={11} /> {job.energyCost}
                      </span>
                      <span className="cost good">
                        <Coins size={11} /> {job.rewards.copper ?? 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="scroll-y" style={{ minHeight: 0 }}>
          <div className="panel" style={{ padding: 12, marginBottom: 10 }}>
            <div className="label">Social Estate</div>
            <h3 style={{ color: 'var(--gold-200)', fontSize: 17, marginTop: 2 }}>
              {game.player.estate}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 8px' }}>
              {game.player.title}
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={petitionEstate}
              disabled={!estateVerdict.eligible}
            >
              Petition for advancement
            </button>
            {!estateVerdict.eligible && (
              <ul className="req-list">
                {estateVerdict.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel" style={{ padding: 12 }}>
            <div className="label" style={{ marginBottom: 6 }}>
              Career Tracks
            </div>
            <CareerTrackList game={game} />
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
