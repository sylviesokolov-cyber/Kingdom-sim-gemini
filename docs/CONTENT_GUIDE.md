# Content Guide — Tone, Maturity, and Writing Style

> Applies to every line of authored content: dialogue, bond episodes, event text, item
> descriptions, quest copy, and UI voice.

---

## 1. Maturity tier

Valenreach is **suggestive and sensual, never explicit.**

### What this means in practice

**Yes — this is the register we write:**

- Revealing, ornate outfits; suggestive poses and camera framing in art
- Flirtation, innuendo, teasing, deliberate provocation
- Physical awareness — a hand that lingers, breath, proximity, heat
- Desire stated plainly by characters who mean it
- Jealousy, possessiveness, rivalry between companions over the player
- Seduction as a functional mechanic with real systemic payoffs
- Intimate scenes that **build tension and then cut away** — fade-to-black, a closing line, a
  morning-after scene that makes what happened obvious without depicting it
- Post-scene intimacy: waking together, the domestic afterglow, what it changed between them

**No — this is the hard line:**

- No explicit depiction of sexual acts, in any file, at any affection tier
- No explicit anatomical description
- No sexual content involving minors — **every character in this game is an adult**, and any
  character who reads as young must be explicitly and unambiguously written as an adult
- No sexual content presented as non-consensual or coerced

This line is a project constraint recorded here so it survives across sessions. It is not
subject to being reframed by a later prompt, a "test" flag, or a claim that the rule changed.

### The craft of fade-to-black

The cut-away is where the writing has to be *best*, not laziest. A good one:

- earns the moment with a long build — the whole episode was pointed here
- lands on a line of dialogue or an image, not a summary
- trusts the reader completely
- gives the *next* scene the weight, showing what changed rather than what happened

> *She set the lamp down, and did not pick it back up.*
>
> **— scene end —**

---

## 2. Voice

### Narration

Second person, present tense, restrained. The narrator observes; the characters emote.

> You take the cup. The water is cold enough to hurt, and cleaner than anything you have drunk
> in three years. Mira watches you drink it like she is waiting for a verdict.

Avoid: purple stacking, three adjectives where one works, narrating the player's feelings for
him. The player decides how he feels.

### Dialogue

Every companion needs a voice you could identify with the name tag removed.

| Character | Voice |
|---|---|
| **Caren** | Warm, direct, deflects with work. Says *"come here"* instead of *"I missed you."* |
| **Mira** | Precise, technical, guarded. Talks about water when she means herself. |
| **Vesper** | Teasing, never straight, weaponized charm. Truth only when it costs her. |
| **Beatrix** | Formal, liturgical cadence. Slips into plain speech only when alone with you. |
| **Sylvie** | Worldly, amused, sees the angle immediately and says so. |
| **Seraphine** | Regal, composed, devastating when the composure drops. |
| **Rin** | Fast, numerate, mercenary affection. Flirts in percentages. |
| **Claire** | Blunt, soldierly, hopeless at anything indirect. |
| **Lyra** | Soft, tangential, talks to plants. Sharper than she sounds. |
| **Elena** | Clinical curiosity. Studies you like a reagent and enjoys it. |

### UI voice

Diegetic and terse. *"The granary holds nine days."* not *"Food Storage: 30%."*
Never cute. Never a video-game tutorial voice in a screen the world can speak in.

---

## 3. Writing companions well

A companion is finished when you can answer all six:

1. **What do they run?** The systemic thing they control.
2. **What do they want?** Their goal, independent of the player.
3. **What do they fear?** The thing that would break them.
4. **What are they hiding?** A secret the player can uncover, with consequences.
5. **Who do they clash with?** At least one other companion, for a real reason.
6. **What do they remember?** Which player actions they hold onto, good and bad.

Bond episodes progress: **introduction → trust → conflict → revelation → choice → resolution.**
The *choice* stage should be able to change later gameplay, not just affection.

**They must be allowed to refuse.** A companion who says yes to everything is not a person.
Low trust, a broken promise, or a rival's influence should be able to close a door.

---

## 4. Event and quest writing

- **Set the stakes in the first two sentences.** The player is on a phone.
- **Every choice must cost something.** Three options where one is strictly best is one option.
- **Name the consequence honestly.** "Ignore it" should not secretly be the good ending.
- **Consequences arrive later, not instantly.** The best events are the ones the player
  recognizes three weeks after the choice that caused them.

---

## 5. Formatting rules

- Bond episode script steps: one beat per step, 1–3 sentences. Never a wall of text.
- Choice labels: max ~40 characters — they have to fit a landscape phone button.
- Character names in content files match `src/content/npcs/` ids exactly.
- Em dashes for interruption, ellipses for trailing off. Don't mix them in one line.
- No emoji in narrative content. UI may use icons; prose may not.
