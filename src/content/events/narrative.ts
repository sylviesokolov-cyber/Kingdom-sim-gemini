import type { EventDefinition } from '../../types';

/**
 * The narrative event roster — the world interrupting the player to ask a
 * question.
 *
 * Four authoring rules, all of them load-bearing (GAME_DESIGN_ANALYSIS §4.2):
 *
 * 1. **The prerequisite is the premise.** An event is not "a merchant
 *    arrives"; it is Rin in your doorway about the dye contract, and it is
 *    eligible exactly when that is true. If you find yourself writing a
 *    generic event and then bolting a `requires` onto it, write a different
 *    event.
 * 2. **A named person is attached to every decision.** The numbers move
 *    because Caren decided something, never because a meter ticked.
 * 3. **Every choice writes a flag.** `<domain>.<subject>_<verb>`, per
 *    STORY.md §3. Flags are the story's memory and they are free; a choice
 *    that leaves no trace is a button.
 * 4. **The best consequences are late.** `Effect.scheduled` fires a follow-up
 *    event on a future day. What you decided three weeks ago should be able
 *    to come and find you.
 *
 * Standing is deliberately the most common reward here. Jobs are the only
 * meaningful source of standing in the game and they have sharply diminishing
 * returns, which makes the estate ladder crawl; public acts with witnesses are
 * the designed second source. See DEVELOPMENT_STATUS "Known issues".
 *
 * Every event must offer at least one choice with no `requires` — an event
 * whose options are all locked is a dead end, and `eligibleEvents` filters it
 * out rather than trapping the player.
 */
export const NARRATIVE_EVENTS: EventDefinition[] = [
  /* ================================================================ *
   * Act 1 — the Ashes. Low bars, no estate requirement, day-gated so
   * a new player meets the system in their first week.
   * ================================================================ */

  {
    id: 'ashes_bread_queue',
    title: 'The Queue at Sol Almshouse',
    description:
      'The line for the almshouse dole runs the length of Cinder Row and has stopped moving. At the front, a woman in priestess white is arguing with her own sister of the order about how thin to cut the loaves. Beatrix sees you, and does not stop arguing.',
    tone: 'warning',
    speakerNpcId: 'beatrix',
    speakerName: 'Beatrix',
    requires: { day: { min: 3 }, kingdom: { welfare: { max: 62 } } },
    weight: 10,
    repeatable: false,
    choices: [
      {
        id: 'work_the_line',
        text: 'Take the knife and cut the loaves yourself.',
        consequenceHint: 'Costs the rest of your afternoon. People will see you do it.',
        outcome:
          'You cut two hundred loaves into four hundred and hand out every one. Beatrix watches you do it without saying a word, which from her is a great deal of saying.',
        effects: {
          energy: -20,
          standingPoints: 22,
          npc: [{ npcId: 'beatrix', affection: 4, trust: 5 }],
          factions: [
            { factionId: 'church', opinion: 3 },
            { factionId: 'commons', opinion: 2 },
          ],
          kingdom: { welfare: 1 },
          setFlags: ['ashes.served_the_dole'],
        },
      },
      {
        id: 'buy_the_shortfall',
        text: 'Buy the shortfall out of your own purse.',
        consequenceHint: 'Ninety copper. The queue moves today and remembers who paid.',
        requires: { copper: 90 },
        outcome:
          'You pay the baker on Cinder Row directly and the queue moves. Beatrix asks where a man like you found ninety copper. You notice she does not give it back.',
        effects: {
          copper: -90,
          standingPoints: 30,
          npc: [{ npcId: 'beatrix', affection: 6, trust: 3 }],
          factions: [
            { factionId: 'church', opinion: 4 },
            { factionId: 'commons', opinion: 4 },
          ],
          kingdom: { welfare: 2 },
          setFlags: ['ashes.paid_the_dole'],
        },
      },
      {
        id: 'walk_on',
        text: 'Walk on. It is not your queue.',
        outcome:
          'You walk on. Behind you the argument stops, which is worse than it continuing. Someone in the line says something about the sort of man who has somewhere else to be.',
        effects: {
          factions: [{ factionId: 'commons', opinion: -2 }],
          setFlags: ['ashes.walked_past_the_dole'],
        },
      },
    ],
  },

  {
    id: 'rin_dye_contract',
    title: 'The Dye Contract',
    description:
      'Rin has not been paid for the Weaverlane dye contract, and she is standing in your doorway rather than Silas\'s because Silas has a door that locks. She wants a witness on the Bourse floor tomorrow. She is very clear that a witness is not the same thing as a friend.',
    tone: 'intrigue',
    speakerNpcId: 'rin',
    speakerName: 'Rin',
    requires: { day: { min: 5 } },
    weight: 9,
    repeatable: false,
    choices: [
      {
        id: 'witness',
        text: 'Stand on the floor and say what you saw.',
        consequenceHint: 'The Consortium will remember your face. So will she.',
        outcome:
          'You say it plainly, in front of forty traders. Silas pays her within the hour and does not look at you once. Rin buys you a drink you did not ask for and tells you that you have just made an enemy worth having.',
        effects: {
          standingPoints: 26,
          npc: [
            { npcId: 'rin', affection: 6, trust: 8 },
            { npcId: 'silas', respect: 3, resentment: 10 },
          ],
          factions: [
            { factionId: 'guilds', opinion: -4 },
            { factionId: 'commons', opinion: 3 },
          ],
          careerXp: [{ track: 'merchant', amount: 40 }],
          setFlags: ['rin.witnessed_for_her', 'guilds.crossed_silas'],
        },
      },
      {
        id: 'broker_it',
        text: 'Take it to Silas privately instead.',
        consequenceHint: 'Quieter. She may not thank you for quiet.',
        requires: { attribute: { cunning: 12 } },
        outcome:
          'You find Silas before the bell and put it to him as a matter of the Consortium\'s good name. He pays. Rin gets her money and a lesson she did not want about how things get done, and she is not sure whether to be grateful.',
        effects: {
          copper: 40,
          standingPoints: 14,
          npc: [
            { npcId: 'rin', affection: 2, trust: -2, respect: 5 },
            { npcId: 'silas', affection: 3, trust: 4 },
          ],
          factions: [{ factionId: 'guilds', opinion: 4 }],
          careerXp: [{ track: 'merchant', amount: 55 }],
          setFlags: ['rin.brokered_quietly', 'guilds.owed_by_silas'],
        },
      },
      {
        id: 'decline',
        text: 'Tell her you cannot afford to be seen in this.',
        outcome:
          'She nods as though she had already written it down. "No. You can\'t. I shouldn\'t have asked a man with nothing to lose to risk it." That lands harder than she meant it to, and she leaves before you can answer.',
        effects: {
          npc: [{ npcId: 'rin', affection: -3, respect: -4 }],
          setFlags: ['rin.refused_the_floor'],
        },
      },
    ],
  },

  {
    id: 'bran_off_the_books',
    title: 'A Berth That Is Not on the Manifest',
    description:
      'Old Bran wants four hours of your back on the night tide, unloading a hull that is not on the harbour manifest. He does not say what is in it. He does say that his sons used to do this work, and that he would rather pay a stranger than ask them again.',
    tone: 'intrigue',
    speakerNpcId: 'bran',
    speakerName: 'Old Bran',
    requires: { day: { min: 4 }, kingdom: { security: { max: 70 } } },
    weight: 8,
    repeatable: true,
    cooldownDays: 14,
    choices: [
      {
        id: 'work_the_tide',
        text: 'Work the tide and ask nothing.',
        consequenceHint: 'Good copper. A little of it sticks to you.',
        outcome:
          'Crates of something oiled and heavy, and a purse at dawn. Bran counts it into your hand coin by coin so you both know exactly what was agreed. On the walk home you understand why he would rather it was not his sons.',
        effects: {
          energy: -22,
          copper: 120,
          bounty: 3,
          standingPoints: 6,
          npc: [{ npcId: 'bran', affection: 5, trust: 6 }],
          factions: [{ factionId: 'syndicate', opinion: 3 }],
          careerXp: [{ track: 'shadow', amount: 45 }],
          setFlags: ['wharf.worked_the_night_tide'],
        },
      },
      {
        id: 'ask_what_is_in_it',
        text: 'Ask what is in the crates first.',
        outcome:
          'He tells you. Arms, in a year when nobody has ordered arms. Then he tells you he wishes you had not asked, because now you are a man who knows, and there is no wage that covers that.',
        effects: {
          energy: -22,
          copper: 80,
          bounty: 3,
          npc: [{ npcId: 'bran', trust: 10, respect: 6 }],
          careerXp: [{ track: 'shadow', amount: 30 }],
          setFlags: ['wharf.saw_the_arms_shipment', 'mystery.arms_moving_early'],
        },
      },
      {
        id: 'refuse_the_tide',
        text: 'Refuse. You have enough trouble.',
        outcome:
          'Bran takes it without offence. "Aye. Sensible." He looks out at the water for a while. "Sensible is a thing a man can afford once he has something. You will let me know when you do."',
        effects: { setFlags: ['wharf.refused_the_night_tide'] },
      },
    ],
  },

  {
    id: 'caren_short_ration',
    title: 'The Short Ration',
    description:
      'Caren has a sack that is not in the silo ledger and a list of four families in the Ashes. She does not explain and she does not apologise. "You can carry it or you can report it. I am not going to insult either of us by pretending there is a third thing."',
    tone: 'warning',
    speakerNpcId: 'caren',
    speakerName: 'Caren',
    requires: { day: { min: 7 }, bond: [{ npcId: 'caren', minTrust: 24 }] },
    weight: 9,
    repeatable: false,
    choices: [
      {
        id: 'carry_it',
        text: 'Carry the sack.',
        consequenceHint: 'You become part of a forgery that has run for three years.',
        outcome:
          'Four doors, four sacks, no names spoken. On the way back she says, without looking at you, that she has done this every winter since she was fifteen and you are the first person who has helped rather than found out.',
        effects: {
          energy: -18,
          standingPoints: 12,
          bounty: 2,
          npc: [{ npcId: 'caren', affection: 8, trust: 14, desire: 4 }],
          factions: [{ factionId: 'refugees', opinion: 5 }],
          kingdom: { welfare: 1 },
          setFlags: ['caren.knows_you_can_keep_quiet', 'caren.complicit_in_the_skim'],
        },
      },
      {
        id: 'report_it',
        text: 'Tell her the ledgers have to be honest.',
        consequenceHint: 'The Crown pays for honesty about grain. She will not forgive it.',
        outcome:
          'You say it and she listens to the whole of it before she answers. "Yes. They do." Then she puts the sack back. Somewhere in the Ashes four families do not eat tonight, and she makes sure you know the number.',
        effects: {
          standingPoints: 18,
          npc: [{ npcId: 'caren', affection: -12, trust: -18, resentment: 20 }],
          factions: [
            { factionId: 'crown', opinion: 5 },
            { factionId: 'refugees', opinion: -6 },
          ],
          setFlags: ['caren.reported_the_skim'],
        },
      },
      {
        id: 'say_nothing',
        text: 'Say nothing either way and walk away.',
        outcome:
          '"That is the third thing," she says. "I did say there wasn\'t one." She carries the sack herself, which takes her twice as long and costs her a night\'s sleep, and she never mentions it again.',
        effects: {
          npc: [{ npcId: 'caren', affection: -4, respect: -6 }],
          setFlags: ['caren.looked_away_from_the_skim'],
        },
      },
    ],
  },

  /* ================================================================ *
   * The simulation asking the question. These fire off kingdom state,
   * so the economy finally produces decisions instead of only numbers.
   * ================================================================ */

  {
    id: 'cistern_queue_turns',
    title: 'The Third Cistern',
    description:
      'The queue at the third cistern has stopped being a queue. Mira has shut the gate to ration what is left and is standing in front of it herself, which Valerius calls brave and means something else by. His guardsmen are twenty paces back with their hands visible.',
    tone: 'disaster',
    speakerNpcId: 'mira',
    speakerName: 'Mira',
    requires: { kingdom: { unrest: { min: 55 } } },
    weight: 12,
    repeatable: true,
    cooldownDays: 28,
    choices: [
      {
        id: 'stand_with_mira',
        text: 'Stand at the gate with her and talk the queue down.',
        consequenceHint: 'If it goes wrong you are the nearest thing to hand.',
        outcome:
          'You get four hours of names and cups and nobody through the gate who has not waited their turn. It holds. Mira says afterwards that it held because there were two of them, and that she has been one of them for three years.',
        effects: {
          energy: -25,
          standingPoints: 34,
          npc: [{ npcId: 'mira', affection: 7, trust: 10, respect: 8 }],
          kingdom: { unrest: -7, welfare: 1 },
          factions: [
            { factionId: 'commons', opinion: 5 },
            { factionId: 'military', opinion: 2 },
          ],
          setFlags: ['cistern.held_the_gate'],
        },
      },
      {
        id: 'send_for_the_guard',
        text: 'Tell Valerius to move his men in now.',
        consequenceHint: 'It ends today. It ends the way that sort of thing ends.',
        outcome:
          'The Ninth clears Cistern Row in eleven minutes and the water is rationed properly by evening. Two people are carried out. Valerius thanks you for the decision, which is his way of noting that it was yours.',
        effects: {
          standingPoints: 16,
          npc: [
            { npcId: 'valerius', respect: 8, trust: 4 },
            { npcId: 'mira', affection: -8, resentment: 12 },
          ],
          kingdom: { unrest: -12, security: 3, welfare: -3 },
          factions: [
            { factionId: 'military', opinion: 6 },
            { factionId: 'commons', opinion: -8 },
            { factionId: 'crown', opinion: 3 },
          ],
          setFlags: ['cistern.called_the_guard'],
        },
      },
      {
        id: 'open_the_gate',
        text: 'Open the gate. Let them drink.',
        outcome:
          'The queue takes what it can carry in about nine minutes. For one evening nobody in the Ashes is thirsty. Mira does not argue with you in front of them, and then does, at length, in private, with figures.',
        effects: {
          standingPoints: 20,
          npc: [{ npcId: 'mira', affection: -5, trust: -8, respect: -4 }],
          kingdom: { unrest: -9, welfare: 2 },
          factions: [
            { factionId: 'commons', opinion: 8 },
            { factionId: 'crown', opinion: -4 },
          ],
          items: [{ resourceId: 'water', amount: -4 }],
          setFlags: ['cistern.opened_the_gate'],
        },
      },
    ],
  },

  {
    id: 'grain_cornered',
    title: 'Somebody Is Buying Grain',
    description:
      'Grain has not simply risen; it has been bought. Rin can show you the pattern in an afternoon of ledgers — small lots, many names, one rhythm. She is showing you because she has already worked out that she can either report it or profit from it, and she does not trust herself to choose alone.',
    tone: 'intrigue',
    speakerNpcId: 'rin',
    speakerName: 'Rin',
    requires: { day: { min: 12 }, kingdom: { welfare: { max: 55 } } },
    weight: 10,
    repeatable: true,
    cooldownDays: 30,
    choices: [
      {
        id: 'publish_it',
        text: 'Put the pattern in front of the Bourse.',
        consequenceHint: 'The price breaks. So does somebody\'s arrangement.',
        outcome:
          'You read the lots aloud in order and the floor works it out before you finish. Grain breaks by a fifth inside the hour. Somewhere a factor is writing a letter about you to a man whose name is not on any of the lots.',
        effects: {
          standingPoints: 30,
          npc: [{ npcId: 'rin', affection: 5, trust: 10, respect: 8 }],
          kingdom: { welfare: 2, prosperity: -1 },
          factions: [
            { factionId: 'commons', opinion: 6 },
            { factionId: 'guilds', opinion: -5 },
            { factionId: 'nobility', opinion: -4 },
          ],
          careerXp: [{ track: 'merchant', amount: 70 }],
          setFlags: ['grain.published_the_corner', 'mystery.someone_is_buying_the_valley'],
          scheduled: [{ inDays: 12, eventId: 'factor_asks_after_you' }],
        },
      },
      {
        id: 'ride_it',
        text: 'Buy in behind them and sell at the top.',
        consequenceHint: 'It is the correct trade. It is a famine.',
        requires: { copper: 300 },
        outcome:
          'You are right about the top to within two days, which is better than most men manage. The copper is real and so is the bread nobody in the Ashes bought that week. Rin takes her share and does not spend it.',
        effects: {
          copper: 520,
          standingPoints: 4,
          npc: [{ npcId: 'rin', affection: 3, trust: -6, resentment: 8 }],
          kingdom: { welfare: -3 },
          factions: [{ factionId: 'guilds', opinion: 5 }],
          careerXp: [{ track: 'merchant', amount: 90 }],
          setFlags: ['grain.rode_the_corner'],
        },
      },
      {
        id: 'take_it_to_caren',
        text: 'Take the ledgers to Caren at the silos.',
        outcome:
          'Caren reads for two hours without speaking and then says a date out loud — a date three years ago, when the same rhythm ran through the same lots. She keeps the papers. You are fairly sure she should not have them.',
        effects: {
          standingPoints: 14,
          npc: [
            { npcId: 'caren', trust: 10, respect: 6 },
            { npcId: 'rin', trust: 3 },
          ],
          setFlags: ['grain.showed_caren_the_ledgers', 'mystery.someone_is_buying_the_valley'],
        },
      },
    ],
  },

  {
    id: 'fever_in_the_ashes',
    title: 'A Fever With a Shape',
    description:
      'Elena has eleven cases in Cinder Row with the same presentation and the same three days of onset, and the word she is not saying in front of the ward is Ague. She needs medicine, a quarantine order, or someone willing to stand next to her while she says the word out loud.',
    tone: 'disaster',
    speakerNpcId: 'elena',
    speakerName: 'Elena',
    requires: { kingdom: { publicHealth: { max: 48 } } },
    weight: 11,
    repeatable: true,
    cooldownDays: 30,
    choices: [
      {
        id: 'give_medicine',
        text: 'Give her every dose of medicine you carry.',
        consequenceHint: 'Requires 3 medicine. It buys her the ward.',
        requires: { inventory: [{ resourceId: 'medicine', min: 3 }] },
        outcome:
          'Eleven cases, three doses, and a triage she makes in front of you so that you have to watch her make it. Nine live. She writes the other two into the ledger by name, which she tells you is the entire job.',
        effects: {
          items: [{ resourceId: 'medicine', amount: -3 }],
          standingPoints: 28,
          npc: [{ npcId: 'elena', affection: 8, trust: 10 }],
          kingdom: { publicHealth: 4, welfare: 1 },
          factions: [{ factionId: 'commons', opinion: 5 }],
          setFlags: ['ague.supplied_the_ward'],
        },
      },
      {
        id: 'say_the_word',
        text: 'Stand beside her while she names it publicly.',
        consequenceHint: 'Naming a plague closes a district. The Consortium will feel that.',
        outcome:
          'She says "Purple Ague" to the district warden with you at her shoulder, and Cinder Row is sealed by nightfall. It works — the count stops at nineteen. The Bourse loses a week of trade and knows precisely who to thank.',
        effects: {
          standingPoints: 32,
          npc: [{ npcId: 'elena', affection: 6, trust: 14, respect: 10 }],
          kingdom: { publicHealth: 6, prosperity: -2, unrest: 3 },
          factions: [
            { factionId: 'church', opinion: 3 },
            { factionId: 'guilds', opinion: -6 },
            { factionId: 'commons', opinion: 4 },
          ],
          careerXp: [{ track: 'scholar', amount: 50 }],
          setFlags: ['ague.named_it_publicly'],
        },
      },
      {
        id: 'keep_it_quiet',
        text: 'Tell her to treat it quietly and not to use the word.',
        outcome:
          'She agrees, because you are right about what the word would cost, and she has agreed to something like this before and it is the thing she cannot forgive herself for. The count does not stop at nineteen.',
        effects: {
          copper: 60,
          npc: [{ npcId: 'elena', affection: -6, trust: -10, resentment: 14 }],
          kingdom: { publicHealth: -3 },
          factions: [{ factionId: 'guilds', opinion: 4 }],
          setFlags: ['ague.kept_it_quiet'],
          scheduled: [{ inDays: 9, eventId: 'ague_returns' }],
        },
      },
    ],
  },

  {
    id: 'weaverlane_winter_vote',
    title: 'A Vote She Loses By One',
    description:
      'Sylvie has four hundred weavers, a winter she can see coming, and a guild vote tomorrow on whether Weaverlane buys wool forward at a price that will look insane until about the second week of Frost. She has counted the floor twice. She is one short.',
    tone: 'political',
    speakerNpcId: 'sylvie',
    speakerName: 'Sylvie',
    requires: { day: { min: 20 } },
    weight: 8,
    repeatable: false,
    choices: [
      {
        id: 'find_the_vote',
        text: 'Find her the vote.',
        consequenceHint: 'Someone on that floor wants something. Find out what.',
        requires: { attribute: { cunning: 14 } },
        outcome:
          'It takes a day and a half and turns out to be a debt owed to a man in Emberworks who would rather it were owed to him by Sylvie. The motion carries, twenty-one to twenty. Weaverlane has wool.',
        effects: {
          energy: -20,
          standingPoints: 28,
          npc: [
            { npcId: 'sylvie', affection: 8, trust: 12, respect: 10 },
            { npcId: 'torvin', trust: 4 },
          ],
          factions: [{ factionId: 'guilds', opinion: 6 }],
          careerXp: [{ track: 'court', amount: 60 }],
          kingdom: { prosperity: 2 },
          setFlags: ['weaverlane.carried_the_wool_vote'],
        },
      },
      {
        id: 'fund_it_yourself',
        text: 'Buy the wool yourself and sell it to her at cost.',
        consequenceHint: '400 copper, and the guild owes it to you rather than to itself.',
        requires: { copper: 400 },
        outcome:
          'The motion fails and it does not matter, because the wool is already in a warehouse with your name on the receipt. Sylvie is grateful and faintly insulted, and tells you the guild will remember that it was rescued from outside.',
        effects: {
          copper: -400,
          standingPoints: 20,
          npc: [{ npcId: 'sylvie', affection: 5, trust: 6, respect: -3 }],
          factions: [{ factionId: 'guilds', opinion: 3 }],
          careerXp: [{ track: 'merchant', amount: 70 }],
          kingdom: { prosperity: 2 },
          setFlags: ['weaverlane.bought_the_wool_yourself'],
        },
      },
      {
        id: 'let_it_fail',
        text: 'Tell her the floor is the floor.',
        outcome:
          '"It is," she agrees. "It is exactly the floor." The motion fails by one. In the second week of Frost, Weaverlane buys wool at four times the price and lays off sixty, and Sylvie does not once say that she told you so.',
        effects: {
          npc: [{ npcId: 'sylvie', affection: -4, respect: -5 }],
          setFlags: ['weaverlane.lost_the_wool_vote'],
          scheduled: [{ inDays: 18, eventId: 'weaverlane_layoffs' }],
        },
      },
    ],
  },

  {
    id: 'granary_audit',
    title: 'An Audit With a Name On It',
    description:
      'A clerk in Ashgrave livery is at the silos with an order to count the reserve, and Caren is being extremely helpful in the way that takes four times as long. She catches your eye once. The count, if it is honest, will be short by exactly what she has been giving away.',
    tone: 'political',
    speakerNpcId: 'caren',
    speakerName: 'Caren',
    requires: { day: { min: 25 }, bond: [{ npcId: 'caren', minTrust: 30 }] },
    weight: 9,
    repeatable: false,
    choices: [
      {
        id: 'cover_the_count',
        text: 'Buy grain and make the count come out right.',
        consequenceHint: 'Requires 12 grain. Nobody will ever know you did it. That is the point.',
        requires: { inventory: [{ resourceId: 'grain', min: 12 }] },
        outcome:
          'Twelve sacks into the third silo before dawn and the count balances to the bushel. The clerk goes away satisfied. Caren does not thank you, because thanking you would be admitting there was something to cover, and you both understand the arrangement now.',
        effects: {
          items: [{ resourceId: 'grain', amount: -12 }],
          standingPoints: 10,
          npc: [{ npcId: 'caren', affection: 12, trust: 20, desire: 8 }],
          setFlags: ['caren.covered_the_audit', 'nobility.ashgrave_counted_the_grain'],
        },
      },
      {
        id: 'delay_the_clerk',
        text: 'Keep the clerk busy and let her fix the books.',
        consequenceHint: 'She is a poor forger in a hurry. It might not hold.',
        outcome:
          'You ask the clerk a great many sincere questions about bushel measure. Caren forges four pages in ninety minutes and they are not her best work. The count passes. The pages exist, in Ashgrave\'s archive, with her hand on them.',
        effects: {
          energy: -12,
          standingPoints: 8,
          npc: [{ npcId: 'caren', affection: 8, trust: 12 }],
          setFlags: ['caren.forged_under_audit', 'nobility.ashgrave_counted_the_grain'],
          scheduled: [{ inDays: 21, eventId: 'the_forged_pages' }],
        },
      },
      {
        id: 'let_it_count',
        text: 'Let the count be what it is.',
        outcome:
          'The count is short by eleven bushels. The clerk writes the number down, and the number is small enough that nothing happens today and large enough that it is now written down somewhere with her name against it.',
        effects: {
          npc: [{ npcId: 'caren', affection: -8, trust: -12, resentment: 10 }],
          factions: [{ factionId: 'nobility', opinion: 3 }],
          setFlags: ['caren.audit_came_up_short', 'nobility.ashgrave_counted_the_grain'],
        },
      },
    ],
  },

  /* ================================================================ *
   * Bond-gated. These are what "bonds are power" means mechanically:
   * the scene does not exist until she trusts you.
   * ================================================================ */

  {
    id: 'mira_asks_you_to_look',
    title: 'The Upper Sluices',
    description:
      'Mira takes you up past the third cistern to a gate nobody uses and shows you the seals. They are scored — not weathered, scored, from the inside. She has known for three years. You are the first person she has shown, and she is visibly weighing whether that was a mistake.',
    tone: 'intrigue',
    speakerNpcId: 'mira',
    speakerName: 'Mira',
    requires: { bond: [{ npcId: 'mira', minTrust: 38 }], flags: { none: ['mystery.saw_the_sluices'] } },
    weight: 10,
    repeatable: false,
    choices: [
      {
        id: 'help_her_prove_it',
        text: 'Tell her you will help her prove it.',
        consequenceHint: 'Her predecessor was found in the catacombs with his notes missing.',
        outcome:
          'She lets out a breath she has been holding since before you met her. Then she becomes extremely practical about it, which is how you learn how frightened she has been: she has had the next eleven steps planned for years and nobody to take the first one with.',
        effects: {
          standingPoints: 12,
          npc: [{ npcId: 'mira', affection: 10, trust: 18, desire: 6 }],
          careerXp: [{ track: 'scholar', amount: 60 }],
          setFlags: ['mystery.saw_the_sluices', 'mira.investigating_together'],
          scheduled: [{ inDays: 14, eventId: 'sluice_order_retaliation' }],
        },
      },
      {
        id: 'tell_her_to_stop',
        text: 'Tell her to put it down and stay alive.',
        outcome:
          '"That is the sensible thing," she says, and does not put it down, and you both know it. What changes is that she stops telling you about it, which she believes is a kindness and is in fact how people end up in catacombs alone.',
        effects: {
          npc: [{ npcId: 'mira', affection: 3, trust: -6 }],
          setFlags: ['mystery.saw_the_sluices', 'mira.told_her_to_stop'],
        },
      },
      {
        id: 'ask_who_sealed_it',
        text: 'Ask her whose seal is on the order.',
        consequenceHint: 'She has the original. She has never shown anyone the seal.',
        requires: { bond: [{ npcId: 'mira', minTrust: 55 }] },
        outcome:
          'She does not answer for a long time. Then she says that she will show you, but not here, and not until you have told her honestly what you were doing three years ago — and she watches your face when she says it, because she has already noticed that you cannot remember.',
        effects: {
          npc: [{ npcId: 'mira', trust: 12, desire: 8 }],
          setFlags: ['mystery.saw_the_sluices', 'mystery.the_seal_has_a_name', 'mira.investigating_together'],
          scheduled: [{ inDays: 10, eventId: 'sluice_order_retaliation' }],
        },
      },
    ],
  },

  {
    id: 'vesper_offers_a_name',
    title: 'A Name, and What It Costs',
    description:
      'Vesper has been pulling on the capital that bought the outer valley, and she has arrived somewhere she does not like: the money went out through the Syndicate before she inherited it. She will give you the name. She wants to know what you will do with a thing that makes her an accessory.',
    tone: 'intrigue',
    speakerNpcId: 'vesper',
    speakerName: 'Vesper',
    requires: { bond: [{ npcId: 'vesper', minTrust: 40 }], day: { min: 30 } },
    weight: 9,
    repeatable: false,
    choices: [
      {
        id: 'take_the_name',
        text: 'Take the name and keep her out of it.',
        outcome:
          'She tells you and then tells you the three ways it can be traced back to her, so that you are holding her life as well as the name. "Now we are the same kind of careful," she says, and she means it as an intimacy, because for her it is one.',
        effects: {
          standingPoints: 16,
          npc: [{ npcId: 'vesper', affection: 10, trust: 16, desire: 10 }],
          factions: [{ factionId: 'syndicate', opinion: 5 }],
          careerXp: [{ track: 'shadow', amount: 70 }],
          setFlags: ['mystery.has_the_financier_name', 'vesper.protected_her'],
        },
      },
      {
        id: 'sell_the_name',
        text: 'Tell her a name like that should be sold, not spent.',
        consequenceHint: 'She will agree. She will also never tell you anything again.',
        outcome:
          'She agrees immediately and cheerfully and names a buyer, and the copper is genuinely excellent. Somewhere in the transaction she stops treating you as a person she tells things to and starts treating you as a counterparty, and she is much better at that.',
        effects: {
          copper: 600,
          standingPoints: 6,
          npc: [{ npcId: 'vesper', affection: -4, trust: -14, respect: 6 }],
          factions: [{ factionId: 'syndicate', opinion: 3 }],
          careerXp: [{ track: 'shadow', amount: 50 }],
          setFlags: ['mystery.sold_the_financier_name', 'vesper.became_a_counterparty'],
        },
      },
      {
        id: 'ask_if_she_spent_it',
        text: 'Ask her whether she has been spending that money.',
        consequenceHint: 'It is the question she is afraid of. Asking it is not free.',
        outcome:
          'She goes very still. "Yes." Nothing else for a while. "Every day for four years, on people who eat because of it." She does not ask you to absolve her and would think less of you if you tried.',
        effects: {
          npc: [{ npcId: 'vesper', affection: 4, trust: 10, resentment: 6, desire: 4 }],
          setFlags: ['mystery.has_the_financier_name', 'vesper.admitted_the_money'],
        },
      },
    ],
  },

  {
    id: 'claire_ninth_unpaid',
    title: 'The Ninth Is Not Paid',
    description:
      'The Ninth Company is six weeks in arrears and Claire has been covering the shortfall out of her own pay for four of them. Two of her sergeants have started talking about what a company does when the Crown does not pay it. She has come to you rather than to Valerius, which tells you what she thinks of the answer she would get.',
    tone: 'warning',
    speakerNpcId: 'claire',
    speakerName: 'Claire',
    requires: { bond: [{ npcId: 'claire', minTrust: 28 }], day: { min: 15 } },
    weight: 9,
    repeatable: false,
    choices: [
      {
        id: 'pay_the_ninth',
        text: 'Pay the arrears yourself.',
        consequenceHint: '350 copper. A company that has been paid by a private man is a private man\'s company.',
        requires: { copper: 350 },
        outcome:
          'You put it in her hand and she puts it straight into the pay chest without counting it, which is the only way she could accept it. The Ninth is paid. Every one of them knows by whom, and Claire knows that they know.',
        effects: {
          copper: -350,
          standingPoints: 34,
          npc: [{ npcId: 'claire', affection: 10, trust: 16, respect: 8 }],
          factions: [
            { factionId: 'military', opinion: 8 },
            { factionId: 'crown', opinion: -2 },
          ],
          careerXp: [{ track: 'martial', amount: 70 }],
          kingdom: { security: 3, unrest: -3 },
          setFlags: ['claire.paid_the_ninth', 'military.owes_you_personally'],
        },
      },
      {
        id: 'take_it_to_court',
        text: "Take the arrears to the Crown's clerks and make noise.",
        consequenceHint: 'Slow, correct, and it makes an enemy of a man with a ledger.',
        outcome:
          'Eleven days, four offices and one very public reading of the garrison charter later, the Ninth is paid by warrant. The clerk who signed it will remember the afternoon you made him do it in front of people.',
        effects: {
          energy: -15,
          standingPoints: 24,
          npc: [{ npcId: 'claire', affection: 6, trust: 10, respect: 12 }],
          factions: [
            { factionId: 'military', opinion: 6 },
            { factionId: 'crown', opinion: -5 },
          ],
          careerXp: [{ track: 'court', amount: 80 }],
          kingdom: { security: 2 },
          setFlags: ['claire.forced_the_warrant', 'crown.embarrassed_the_clerks'],
        },
      },
      {
        id: 'tell_her_to_hold',
        text: 'Tell her to hold the company together another month.',
        outcome:
          'She will. That is the problem with asking her — she will always say yes to holding something together. It costs her another month\'s pay and both sergeants, who take twelve men with them to a captain who does pay.',
        effects: {
          npc: [{ npcId: 'claire', affection: -5, trust: -6 }],
          kingdom: { security: -4, unrest: 2 },
          factions: [{ factionId: 'syndicate', opinion: 3 }],
          setFlags: ['claire.held_the_ninth_alone'],
        },
      },
    ],
  },

  {
    id: 'elare_archive_request',
    title: 'The Index Nobody Ordered',
    description:
      'Elare has been building an index of every document touching the Red Drought, on her own time, in a hand deliberately unlike her own. She has had a verbal instruction — not written, never written — to stop. She would like to know whether there is any point continuing, and she is asking you because you are not anybody.',
    tone: 'intrigue',
    speakerNpcId: 'elare',
    speakerName: 'Elare',
    requires: { bond: [{ npcId: 'elare', minTrust: 32 }], day: { min: 22 } },
    weight: 8,
    repeatable: false,
    choices: [
      {
        id: 'copy_it_out',
        text: 'Help her copy the index out of the Archive.',
        consequenceHint: 'Two nights of work and a copy that exists somewhere the Archive is not.',
        outcome:
          'Two nights by one candle, and at the end of it there are two indexes, one of which cannot be ordered destroyed because nobody in authority knows it exists. She asks you to keep it. She does not want to know where.',
        effects: {
          energy: -24,
          standingPoints: 18,
          npc: [{ npcId: 'elare', affection: 8, trust: 16, desire: 5 }],
          careerXp: [{ track: 'scholar', amount: 80 }],
          setFlags: ['mystery.holds_the_drought_index', 'elare.copied_the_index'],
        },
      },
      {
        id: 'find_who_ordered_it',
        text: 'Find out who gave her the instruction.',
        requires: { attribute: { cunning: 18 } },
        outcome:
          'It came down through three mouths from a steward of the Ashgrave household, and the third mouth is frightened enough to tell you so for nothing. Elare writes the chain into the index itself, which is either brave or the end of her.',
        effects: {
          standingPoints: 20,
          npc: [{ npcId: 'elare', affection: 6, trust: 12, respect: 10 }],
          careerXp: [{ track: 'shadow', amount: 50 }],
          setFlags: ['mystery.ashgrave_ordered_the_silence', 'elare.named_the_instruction'],
          scheduled: [{ inDays: 16, eventId: 'the_archive_fire' }],
        },
      },
      {
        id: 'tell_her_to_stop_indexing',
        text: 'Tell her to obey the instruction.',
        outcome:
          'She says "Yes" in the voice of someone filing something, and stops. It is the thing she is most afraid of herself for being capable of, and you are the one who asked her to do it.',
        effects: {
          npc: [{ npcId: 'elare', affection: -6, trust: -10, resentment: 12 }],
          setFlags: ['elare.stopped_the_index'],
        },
      },
    ],
  },

  {
    id: 'lyra_the_timber_survey',
    title: 'Surveyors in the Thornwood',
    description:
      'There are men with chains measuring out the Thornwood for timber, and Lyra has three years of catalogue and about four hundred species that are not written down anywhere else. She is not asking you to stop them. She is asking you to help her finish before they start.',
    tone: 'warning',
    speakerNpcId: 'lyra',
    speakerName: 'Lyra',
    requires: { bond: [{ npcId: 'lyra', minTrust: 26 }], day: { min: 18 } },
    weight: 8,
    repeatable: false,
    choices: [
      {
        id: 'catalogue_with_her',
        text: 'Spend the week in the Thornwood with her.',
        consequenceHint: 'A hard week. The catalogue survives whatever happens to the wood.',
        outcome:
          'Six days of cold hands and Latin you do not understand and her explaining every one of them anyway. The survey comes in on the seventh. The catalogue is finished, and she is different afterwards — lighter, and much less careful around you.',
        effects: {
          energy: -30,
          standingPoints: 16,
          npc: [{ npcId: 'lyra', affection: 12, trust: 14, desire: 8 }],
          items: [{ resourceId: 'herbs', amount: 6 }],
          careerXp: [{ track: 'scholar', amount: 90 }],
          setFlags: ['lyra.finished_the_catalogue'],
        },
      },
      {
        id: 'buy_the_survey_off',
        text: 'Find out who commissioned the survey and buy them off.',
        consequenceHint: '250 copper into the right hand delays it a season.',
        requires: { copper: 250 },
        outcome:
          'The commission traces to a factor buying timber rights ahead of an order nobody has placed yet, and he is very happy to be delayed for a season at that price. Lyra keeps her wood. You keep the detail about the order nobody placed.',
        effects: {
          copper: -250,
          standingPoints: 12,
          npc: [{ npcId: 'lyra', affection: 8, trust: 8 }],
          careerXp: [{ track: 'merchant', amount: 50 }],
          setFlags: ['lyra.delayed_the_survey', 'mystery.someone_is_buying_the_valley'],
        },
      },
      {
        id: 'let_them_cut',
        text: 'Tell her the kingdom needs the timber.',
        outcome:
          'It does. She knows it does; she is the one who told you what the winter needs. She says "Yes, of course" and goes back up the hill alone to save what she can of four hundred species in the time she has left.',
        effects: {
          kingdom: { prosperity: 2 },
          npc: [{ npcId: 'lyra', affection: -6, trust: -5 }],
          factions: [{ factionId: 'guilds', opinion: 3 }],
          setFlags: ['lyra.lost_the_thornwood'],
        },
      },
    ],
  },

  /* ================================================================ *
   * Career and estate gated — the tracks producing scenes of their own.
   * ================================================================ */

  {
    id: 'silas_offers_a_seat',
    title: 'A Seat at a Table',
    description:
      'Silas has noticed you. He would like you at the Consortium\'s second table — not the board, the table that prepares what the board votes on, which he explains is where decisions are actually made by people who are not important enough to be blamed for them.',
    tone: 'political',
    speakerNpcId: 'silas',
    speakerName: 'Guildmaster Silas',
    requires: { career: [{ track: 'merchant', minRank: 2 }] },
    weight: 9,
    repeatable: false,
    choices: [
      {
        id: 'take_the_seat',
        text: 'Take the seat.',
        outcome:
          'You sit at the second table and within a month you are drafting the grain motions that the board passes without reading. Silas was telling the truth about where decisions are made, and about who is not important enough to be blamed.',
        effects: {
          standingPoints: 40,
          guildMarks: 30,
          npc: [{ npcId: 'silas', affection: 6, trust: 8 }],
          factions: [{ factionId: 'guilds', opinion: 8 }],
          careerXp: [{ track: 'merchant', amount: 120 }],
          setFlags: ['guilds.sits_at_the_second_table'],
        },
      },
      {
        id: 'take_it_and_tell_rin',
        text: 'Take it, and tell Rin everything that is said there.',
        consequenceHint: 'She has wanted a board seat her whole career and has never been allowed one.',
        requires: { bond: [{ npcId: 'rin', minTrust: 35 }] },
        outcome:
          'You take the seat and Rin gets the minutes within the hour, every time. She is a far better analyst of that room than you are, and inside two months the two of you are running a position at the second table that Silas thinks is his.',
        effects: {
          standingPoints: 36,
          guildMarks: 30,
          npc: [
            { npcId: 'rin', affection: 10, trust: 16, respect: 12 },
            { npcId: 'silas', trust: 4 },
          ],
          factions: [{ factionId: 'guilds', opinion: 6 }],
          careerXp: [{ track: 'merchant', amount: 110 }],
          setFlags: ['guilds.sits_at_the_second_table', 'rin.reads_the_minutes'],
        },
      },
      {
        id: 'refuse_the_seat',
        text: 'Refuse. You would rather not be that useful to him.',
        outcome:
          '"A pity," he says, and means it, and you can see him adjust his estimate of you upward and his estimate of your prospects downward in the same movement. It is the first time he has taken you seriously.',
        effects: {
          standingPoints: 8,
          npc: [{ npcId: 'silas', respect: 10, resentment: 5 }],
          setFlags: ['guilds.refused_the_second_table'],
        },
      },
    ],
  },

  {
    id: 'valerius_the_muster',
    title: 'A Muster in a Year Without a War',
    description:
      'Valerius has an order to muster two extra companies and a garrison budget that does not cover the two he has. He wants to know whether you will stand up at the session and say the second part out loud, because he cannot, and because somebody arming a city in a quiet year is a fact worth someone noticing.',
    tone: 'political',
    speakerNpcId: 'valerius',
    speakerName: 'Commander Valerius',
    requires: { career: [{ track: 'martial', minRank: 2 }] },
    weight: 9,
    repeatable: false,
    choices: [
      {
        id: 'say_it_at_session',
        text: 'Say it at the session.',
        outcome:
          'You read the budget and the muster order out consecutively and let the room do the arithmetic. Nothing is decided. But the question has been asked in a chamber with a minute-taker, which is the entire point, and Valerius buys you a drink afterwards in a very public room.',
        effects: {
          standingPoints: 38,
          npc: [{ npcId: 'valerius', affection: 5, trust: 12, respect: 10 }],
          factions: [
            { factionId: 'military', opinion: 6 },
            { factionId: 'nobility', opinion: -5 },
          ],
          careerXp: [
            { track: 'martial', amount: 90 },
            { track: 'court', amount: 40 },
          ],
          setFlags: ['military.questioned_the_muster', 'mystery.arms_moving_early'],
        },
      },
      {
        id: 'find_who_pays',
        text: 'Find out who is paying for the extra companies instead.',
        consequenceHint: 'Quieter, and a better answer.',
        requires: { attribute: { cunning: 16 } },
        outcome:
          'The money is not the Crown\'s. It routes through a guild factor and it has the same rhythm as the grain lots — small amounts, many names, one hand. Valerius looks at what you bring him for a long time and then locks it in his own desk.',
        effects: {
          standingPoints: 22,
          npc: [{ npcId: 'valerius', trust: 14, respect: 8 }],
          careerXp: [
            { track: 'martial', amount: 60 },
            { track: 'shadow', amount: 50 },
          ],
          setFlags: ['mystery.arms_paid_privately', 'mystery.someone_is_buying_the_valley'],
        },
      },
      {
        id: 'muster_them',
        text: 'Just muster them. Two companies is two companies.',
        outcome:
          'You muster them, and they are good, and the city is measurably safer for it. Valerius says nothing at all about where the pay is coming from, and neither do you, and that silence is now a thing the two of you share.',
        effects: {
          standingPoints: 24,
          npc: [{ npcId: 'valerius', affection: 4, respect: 6, trust: -4 }],
          kingdom: { security: 6, unrest: -2 },
          factions: [{ factionId: 'military', opinion: 7 }],
          careerXp: [{ track: 'martial', amount: 80 }],
          setFlags: ['military.mustered_without_asking'],
        },
      },
    ],
  },

  {
    id: 'seraphine_a_use_for_you',
    title: 'The Household Has Noticed',
    description:
      'A summons on household paper, and Seraphine receiving you in a room chosen to make the point that she could have chosen a better one. The King is dying slowly. She is assembling people who will be useful afterwards, and she would like to establish what you cost.',
    tone: 'political',
    speakerNpcId: 'seraphine',
    speakerName: 'Seraphine',
    requires: { estate: 'Burgher' },
    weight: 10,
    repeatable: false,
    choices: [
      {
        id: 'name_a_price',
        text: 'Name a price.',
        consequenceHint: 'She respects a price. She does not respect a man who does not know his.',
        outcome:
          'You name one and it is slightly too high, which she notices and pays anyway, because the number was never the transaction. You are now on a list in a locked drawer, and you will not find out what the list is for until it matters.',
        effects: {
          copper: 400,
          standingPoints: 30,
          npc: [{ npcId: 'seraphine', affection: 4, respect: 10, trust: 6 }],
          factions: [{ factionId: 'crown', opinion: 6 }],
          careerXp: [{ track: 'court', amount: 100 }],
          setFlags: ['court.on_seraphines_list'],
        },
      },
      {
        id: 'ask_what_she_fears',
        text: 'Ask her what happens to her when the King dies.',
        consequenceHint: 'Nobody asks her that.',
        requires: { attribute: { charm: 16 } },
        outcome:
          'The room goes quiet in a way that is not about you. "A convent, or a marriage to whoever wins. I have not decided which I would refuse harder." Then she changes the subject entirely, and afterwards she is in your corner in a way that is never written down.',
        effects: {
          standingPoints: 20,
          npc: [{ npcId: 'seraphine', affection: 12, trust: 14, desire: 6 }],
          factions: [{ factionId: 'crown', opinion: 4 }],
          careerXp: [{ track: 'court', amount: 80 }],
          setFlags: ['court.on_seraphines_list', 'seraphine.told_you_the_stakes'],
        },
      },
      {
        id: 'decline_the_household',
        text: 'Tell her you are not for sale to the household.',
        outcome:
          '"Everyone is for sale to the household. You are merely not for sale today." She has you shown out courteously, and she is not remotely offended, and she writes something down after you leave.',
        effects: {
          npc: [{ npcId: 'seraphine', respect: 6 }],
          factions: [{ factionId: 'crown', opinion: -3 }],
          setFlags: ['court.refused_the_household'],
        },
      },
    ],
  },

  {
    id: 'torvin_watered_ore',
    title: 'Ore That Has Been Watered',
    description:
      'Torvin puts two ingots in front of you and asks which is which. They look identical. One of them is what the Emberworks is being sold as iron by a chain of three middlemen, and he has been quietly making worse tools out of it for a year and taking the blame for the tools.',
    tone: 'warning',
    speakerNpcId: 'torvin',
    speakerName: 'Master Torvin',
    requires: { day: { min: 16 }, career: [{ track: 'merchant', minRank: 1 }] },
    weight: 7,
    repeatable: false,
    choices: [
      {
        id: 'break_the_chain',
        text: 'Go up the chain and find the source.',
        consequenceHint: 'Three middlemen, and one of them will not want to be found.',
        outcome:
          'Two of the three are simply lazy. The third is buying good ore, selling it on somewhere else entirely, and backfilling the Emberworks with slag. Torvin puts him out of business by lunchtime and hands you a set of tools he made properly.',
        effects: {
          energy: -18,
          standingPoints: 22,
          items: [{ resourceId: 'tools', amount: 3 }],
          npc: [{ npcId: 'torvin', affection: 8, trust: 12, respect: 8 }],
          factions: [{ factionId: 'guilds', opinion: 4 }],
          careerXp: [{ track: 'merchant', amount: 70 }],
          kingdom: { prosperity: 2 },
          setFlags: ['emberworks.broke_the_ore_chain'],
        },
      },
      {
        id: 'ask_where_the_good_ore_went',
        text: 'Ask where the good ore has been going instead.',
        outcome:
          'Out of the valley, in quantity, to a buyer who pays in advance and does not want a receipt. Torvin says the word "arms" without any particular emphasis and then refuses to say it again.',
        effects: {
          standingPoints: 10,
          npc: [{ npcId: 'torvin', trust: 10 }],
          careerXp: [{ track: 'scholar', amount: 40 }],
          setFlags: ['mystery.arms_moving_early', 'emberworks.traced_the_good_ore'],
        },
      },
      {
        id: 'buy_the_bad_ore',
        text: 'Offer to take the watered ore off him at a discount.',
        consequenceHint: 'It is worth something to somebody. It is not worth what you will tell them.',
        outcome:
          'He sells it to you cheap and with visible disappointment, and you move it on within the week at a price the buyer will discover the truth about eventually. The copper is good. Torvin does not show you his work again.',
        effects: {
          copper: 260,
          items: [{ resourceId: 'iron_ore', amount: 4 }],
          bounty: 4,
          npc: [{ npcId: 'torvin', affection: -6, respect: -8 }],
          careerXp: [{ track: 'shadow', amount: 40 }],
          setFlags: ['emberworks.traded_the_watered_ore'],
        },
      },
    ],
  },

  /* ================================================================ *
   * Delayed consequences. These are never ambient — each requires a
   * flag only its originating choice sets, so they arrive only when
   * scheduled, and they arrive whether or not today is convenient.
   * ================================================================ */

  {
    id: 'sluice_order_retaliation',
    title: 'Someone Has Been in Her Rooms',
    description:
      'Mira\'s rooms at Springhead have been gone through — carefully, by someone who wanted her to know. Nothing is missing, because the thing they were looking for has never been in her rooms. She is calmer about it than you are, which is the frightening part.',
    tone: 'disaster',
    speakerNpcId: 'mira',
    speakerName: 'Mira',
    requires: { flags: { all: ['mystery.saw_the_sluices'] } },
    weight: 1,
    repeatable: false,
    scheduledOnly: true,
    choices: [
      {
        id: 'move_her',
        text: 'Get her out of Springhead tonight.',
        consequenceHint: 'She will not want to leave the aqueduct unattended. Insist.',
        outcome:
          'It takes an argument and most of the night, but she sleeps somewhere nobody has an address for. The aqueduct runs unattended for two days and nothing breaks, which she finds more unsettling than the search.',
        effects: {
          energy: -20,
          standingPoints: 14,
          npc: [{ npcId: 'mira', affection: 10, trust: 14, desire: 8 }],
          setFlags: ['mira.moved_to_safety'],
        },
      },
      {
        id: 'set_a_watch',
        text: 'Have the Ninth put a quiet watch on Springhead.',
        requires: { bond: [{ npcId: 'claire', minTrust: 30 }] },
        outcome:
          'Claire puts two of her own on it off the books and asks you exactly one question about why, and accepts the answer you give her, which is not the whole one. Nobody comes back. That is not the same as nobody watching.',
        effects: {
          standingPoints: 18,
          npc: [
            { npcId: 'mira', affection: 6, trust: 10 },
            { npcId: 'claire', trust: 8, resentment: 4 },
          ],
          kingdom: { security: 1 },
          setFlags: ['mira.under_guard', 'claire.asked_no_questions'],
        },
      },
      {
        id: 'let_her_handle_it',
        text: 'Let her handle it her own way.',
        outcome:
          'She handles it. She has been handling it for three years. What she does not do, from that night onward, is tell you the next thing she finds — which is precisely what she did to the man who held the post before her.',
        effects: {
          npc: [{ npcId: 'mira', affection: -6, trust: -12 }],
          clearFlags: ['mira.investigating_together'],
          setFlags: ['mira.handling_it_alone'],
        },
      },
    ],
  },

  {
    id: 'factor_asks_after_you',
    title: 'A Factor Has Been Asking',
    description:
      'Rin passes it along the way she passes along a price: a factor nobody can place has been asking on the floor who read the grain lots aloud. Not angrily. Methodically, the way a man builds a file.',
    tone: 'warning',
    speakerNpcId: 'rin',
    speakerName: 'Rin',
    requires: { flags: { all: ['grain.published_the_corner'] } },
    weight: 1,
    repeatable: false,
    scheduledOnly: true,
    choices: [
      {
        id: 'find_him_first',
        text: 'Find out who he files to.',
        requires: { attribute: { cunning: 14 } },
        outcome:
          'Three days of patient drinking with clerks and you have a household, though not a name: Ashgrave livery, paid through a guild intermediary, which is the same shape as everything else you have found this season.',
        effects: {
          standingPoints: 18,
          careerXp: [{ track: 'shadow', amount: 60 }],
          setFlags: ['mystery.ashgrave_has_a_file_on_you'],
        },
      },
      {
        id: 'go_quiet',
        text: 'Stop reading things aloud on the Bourse floor for a while.',
        outcome:
          'You go quiet and the asking stops within a fortnight, which tells you it was about the reading rather than about you. Rin notes the change in you and does not say whether she approves.',
        effects: {
          npc: [{ npcId: 'rin', respect: -4 }],
          setFlags: ['grain.went_quiet_after_the_corner'],
        },
      },
      {
        id: 'read_more_aloud',
        text: 'Read the next set of lots aloud, louder.',
        outcome:
          'You do it again, with the timber rights and the outer-valley deeds alongside the grain, and the floor is very quiet by the end. Whoever the factor files to now has a file with a great deal in it.',
        effects: {
          standingPoints: 28,
          factions: [
            { factionId: 'commons', opinion: 5 },
            { factionId: 'nobility', opinion: -6 },
          ],
          npc: [{ npcId: 'rin', affection: 5, respect: 10 }],
          careerXp: [{ track: 'merchant', amount: 60 }],
          setFlags: ['mystery.ashgrave_has_a_file_on_you', 'grain.read_them_all_aloud'],
        },
      },
    ],
  },

  {
    id: 'ague_returns',
    title: 'It Did Not Stop at Nineteen',
    description:
      'Elena does not come to find you this time. You hear it from the district warden: sixty-one cases across three streets, and the apothecary has been at the ward for four days without going home. The word is being used now. It is being used everywhere.',
    tone: 'disaster',
    speakerNpcId: 'elena',
    speakerName: 'Elena',
    requires: { flags: { all: ['ague.kept_it_quiet'] } },
    weight: 1,
    repeatable: false,
    scheduledOnly: true,
    choices: [
      {
        id: 'go_to_the_ward',
        text: 'Go to the ward and do whatever she says for as long as she says it.',
        outcome:
          'Nine days. You carry, boil, burn, and hold people down. She does not mention the earlier conversation once, which is not forgiveness, but on the ninth day she falls asleep sitting against you and that is something.',
        effects: {
          energy: -40,
          health: -10,
          standingPoints: 30,
          npc: [{ npcId: 'elena', affection: 8, trust: 6, resentment: -8 }],
          kingdom: { publicHealth: 3, welfare: -2 },
          factions: [{ factionId: 'commons', opinion: 6 }],
          setFlags: ['ague.worked_the_second_wave'],
        },
      },
      {
        id: 'fund_the_ward',
        text: 'Buy the ward everything it needs and stay out of it.',
        consequenceHint: '500 copper. It is the more useful thing and the smaller one.',
        requires: { copper: 500 },
        outcome:
          'Medicine, fuel, linen, and two more hands paid for a fortnight. It measurably works. Elena sends a note of three words thanking you for the supplies, and there is no fourth word about anything else.',
        effects: {
          copper: -500,
          standingPoints: 20,
          npc: [{ npcId: 'elena', trust: 4 }],
          kingdom: { publicHealth: 5 },
          factions: [{ factionId: 'commons', opinion: 3 }],
          setFlags: ['ague.funded_the_second_wave'],
        },
      },
      {
        id: 'stay_away',
        text: 'Stay away from Cinder Row until it burns out.',
        outcome:
          'It burns out in five weeks and takes a hundred and forty people with it. You are not one of them. Elena survives, and the next time you are in a room together she is perfectly civil, and that is all she is.',
        effects: {
          npc: [{ npcId: 'elena', affection: -14, trust: -16, resentment: 20 }],
          kingdom: { publicHealth: -6, welfare: -4, unrest: 4 },
          factions: [{ factionId: 'commons', opinion: -6 }],
          setFlags: ['ague.stayed_away'],
        },
      },
    ],
  },

  {
    id: 'the_forged_pages',
    title: 'Four Pages in the Wrong Hand',
    description:
      'The four pages Caren forged under audit have surfaced — not in a court, which would be survivable, but in a polite letter to her from a steward of the Ashgrave household observing that the hand on page three differs from the hand on page two, and enquiring after her health.',
    tone: 'political',
    speakerNpcId: 'caren',
    speakerName: 'Caren',
    requires: { flags: { all: ['caren.forged_under_audit'] } },
    weight: 1,
    repeatable: false,
    scheduledOnly: true,
    choices: [
      {
        id: 'take_the_blame',
        text: 'Say the hand on page three is yours.',
        consequenceHint: 'It is a crime against the reserve. You would be the one holding it.',
        outcome:
          'You write to the steward and say you assisted with the count and made the entries. It is believed, because a man with nothing is a much more convenient culprit than a granary overseer. The letters to Caren stop.',
        effects: {
          bounty: 25,
          standingPoints: 10,
          npc: [{ npcId: 'caren', affection: 16, trust: 25, desire: 12 }],
          factions: [{ factionId: 'nobility', opinion: -6 }],
          setFlags: ['caren.took_the_blame_for_her'],
        },
      },
      {
        id: 'buy_the_steward',
        text: 'Find out what the steward wants.',
        requires: { copper: 450 },
        outcome:
          'He wants four hundred and fifty copper, which is a relief, and he wants it every season, which is not. The letters stop. The arrangement does not, and now the household has a hook in the granary and knows it.',
        effects: {
          copper: -450,
          npc: [{ npcId: 'caren', affection: 6, trust: 8 }],
          setFlags: ['nobility.paying_the_steward', 'caren.bought_the_steward_off'],
        },
      },
      {
        id: 'let_her_answer',
        text: 'Let her answer it herself.',
        outcome:
          'She answers it herself, coldly and well, and it holds for now. She also understands exactly what you did not do, and files it with the other things she has learned about what people will and will not carry for her.',
        effects: {
          npc: [{ npcId: 'caren', affection: -10, trust: -16, resentment: 15 }],
          setFlags: ['caren.answered_the_steward_alone'],
        },
      },
    ],
  },

  {
    id: 'the_archive_fire',
    title: 'A Small Fire in the Archive',
    description:
      'A lamp fell in the Royal Archive, in the Drought stacks, at night, in a room with no lamps in it. Elare is standing in ash to the ankle holding the corner of an index that no longer has a middle, and she has not said anything for some time.',
    tone: 'disaster',
    speakerNpcId: 'elare',
    speakerName: 'Elare',
    requires: { flags: { all: ['elare.named_the_instruction'] } },
    weight: 1,
    repeatable: false,
    scheduledOnly: true,
    choices: [
      {
        id: 'produce_the_copy',
        text: 'Tell her you have the copy.',
        consequenceHint: 'Only true if you helped her copy it out.',
        requires: { flags: { all: ['mystery.holds_the_drought_index'] } },
        outcome:
          'She looks at you for a full ten seconds and then sits down in the ash and laughs, which is not a sound you have heard her make. The index survives. It now exists only outside the Archive, which changes what it is for.',
        effects: {
          standingPoints: 24,
          npc: [{ npcId: 'elare', affection: 14, trust: 20, desire: 10 }],
          careerXp: [{ track: 'scholar', amount: 100 }],
          setFlags: ['mystery.index_survived_the_fire'],
        },
      },
      {
        id: 'rebuild_it',
        text: 'Start rebuilding it with her from the surviving stacks.',
        outcome:
          'Weeks of it, and what you get back is maybe two-thirds and none of the chain of instruction. She keeps working anyway. Somewhere in the second week she stops treating the rebuild as a task and starts treating it as a grudge.',
        effects: {
          energy: -30,
          standingPoints: 16,
          npc: [{ npcId: 'elare', affection: 8, trust: 12, respect: 6 }],
          careerXp: [{ track: 'scholar', amount: 70 }],
          setFlags: ['mystery.index_partly_rebuilt'],
        },
      },
      {
        id: 'tell_her_it_is_over',
        text: 'Tell her this is the message and she should read it.',
        outcome:
          'She reads it. She is not a fool and she has a mother in the city. The Drought stacks are quietly reordered over the following month in a way that makes them very difficult to search, and she is promoted in the spring.',
        effects: {
          npc: [{ npcId: 'elare', affection: -4, trust: -8, resentment: 10 }],
          setFlags: ['mystery.index_abandoned'],
        },
      },
    ],
  },

  {
    id: 'weaverlane_layoffs',
    title: 'Sixty Looms Stopped',
    description:
      'Weaverlane bought wool at four times the price in the second week of Frost, exactly as Sylvie said it would, and has laid off sixty. They are in the street outside the guildhall, and she is out there with them rather than inside where it is warm.',
    tone: 'disaster',
    speakerNpcId: 'sylvie',
    speakerName: 'Sylvie',
    requires: { flags: { all: ['weaverlane.lost_the_wool_vote'] } },
    weight: 1,
    repeatable: false,
    scheduledOnly: true,
    choices: [
      {
        id: 'hire_them',
        text: 'Put your own copper behind sixty weavers for the winter.',
        consequenceHint: '600 copper. It is most of what you have and it is sixty households.',
        requires: { copper: 600 },
        outcome:
          'Sixty people work the winter on your money at work that barely covers itself. It is a poor trade and an enormous number of people know your name by Spring. Sylvie tells you it was sentimental and does not let go of your arm while she says it.',
        effects: {
          copper: -600,
          standingPoints: 45,
          npc: [{ npcId: 'sylvie', affection: 14, trust: 18, desire: 8 }],
          kingdom: { welfare: 3, unrest: -4 },
          factions: [
            { factionId: 'commons', opinion: 8 },
            { factionId: 'guilds', opinion: 4 },
          ],
          setFlags: ['weaverlane.carried_the_sixty'],
        },
      },
      {
        id: 'stand_in_the_street',
        text: 'Stand in the street with them.',
        outcome:
          'You have nothing to give them and you stand there anyway, for two days, in the cold, which changes nothing about the looms and is noticed by every single person in Weaverlane.',
        effects: {
          energy: -20,
          standingPoints: 22,
          npc: [{ npcId: 'sylvie', affection: 8, trust: 8 }],
          factions: [{ factionId: 'commons', opinion: 5 }],
          kingdom: { unrest: -1 },
          setFlags: ['weaverlane.stood_in_the_street'],
        },
      },
      {
        id: 'nothing_to_be_done',
        text: 'There is nothing to be done about a vote that was lost.',
        outcome:
          'There is not. Sixty looms stay stopped through Frost and about half those households leave the city by Spring. Sylvie remains perfectly friendly with you, which is somehow the worst available outcome.',
        effects: {
          kingdom: { welfare: -3, unrest: 3 },
          npc: [{ npcId: 'sylvie', affection: -8, respect: -10 }],
          factions: [{ factionId: 'commons', opinion: -4 }],
          setFlags: ['weaverlane.let_the_sixty_go'],
        },
      },
    ],
  },
];

export const NARRATIVE_EVENTS_BY_ID: Record<string, EventDefinition> = Object.fromEntries(
  NARRATIVE_EVENTS.map((event) => [event.id, event]),
);
