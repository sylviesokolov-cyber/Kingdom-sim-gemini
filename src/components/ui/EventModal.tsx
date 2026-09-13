import { selectPendingEvent, useGameStore } from '../../state/store';
import { choiceAvailability } from '../../engine/events';
import { NPCS_BY_ID } from '../../content/npcs';
import { CharacterArt } from './CharacterArt';

/**
 * The world asking the player a question.
 *
 * Two states in one modal: the scene with its choices, and then the outcome of
 * the choice taken. There is no close button on the scene — an event is
 * answered, not dismissed, because a question the player can wave away is not
 * a decision. The outcome panel is dismissable, since by then the state has
 * already changed.
 *
 * Locked choices are shown rather than hidden, with the reason they are locked:
 * "Costs 350 copper; you have 94" is characterising information about the
 * situation, and `evaluatePrerequisite` returns reasons instead of booleans
 * specifically so this component can say them.
 */
export function EventModal() {
  const event = useGameStore(selectPendingEvent);
  const game = useGameStore((s) => s.game);
  const outcome = useGameStore((s) => s.ui.eventOutcome);
  const answerEvent = useGameStore((s) => s.answerEvent);
  const dismissOutcome = useGameStore((s) => s.dismissEventOutcome);

  if (outcome) {
    return (
      <div className="modal-backdrop">
        <div className="modal panel-solid event-modal" onClick={(e) => e.stopPropagation()}>
          <span className="label">What came of it</span>
          <p className="event-outcome">{outcome}</p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={dismissOutcome}>
            Go on
          </button>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const speaker = event.speakerNpcId ? NPCS_BY_ID[event.speakerNpcId] : undefined;
  const speakerName = speaker?.name ?? event.speakerName;

  return (
    <div className="modal-backdrop">
      <div className="modal panel-solid event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-head">
          {speaker && (
            <div className="event-portrait">
              <CharacterArt npc={speaker} alt={speaker.name} />
            </div>
          )}
          <div className="event-head-text">
            <span className={`label event-tone ${event.tone}`}>{event.tone}</span>
            <h3 className="event-title">{event.title}</h3>
            {speakerName && <span className="event-speaker">{speakerName}</span>}
          </div>
        </div>

        <div className="scroll-y event-body">
          <p className="event-description">{event.description}</p>

          <div className="event-choices">
            {event.choices.map((choice) => {
              const availability = choiceAvailability(choice, game);
              const blocker = availability.failures[0];

              return (
                <button
                  key={choice.id}
                  className={`event-choice ${availability.met ? '' : 'locked'}`}
                  disabled={!availability.met}
                  onClick={() => answerEvent(event.id, choice.id)}
                >
                  <span className="event-choice-text">{choice.text}</span>
                  {choice.consequenceHint && (
                    <span className="event-choice-hint">{choice.consequenceHint}</span>
                  )}
                  {blocker && (
                    <span className="event-choice-locked">
                      {blocker.requirement} — {blocker.actual}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
