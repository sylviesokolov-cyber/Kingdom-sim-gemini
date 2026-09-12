import type { CareerTrialDefinition } from '../../types';

/**
 * The rank trials — the reason a career rank means something.
 *
 * Every rank in `CAREER_DEFINITIONS` names a trial id. Until now none of them
 * existed, so `canAdvanceCareer` refused every advancement forever and the
 * estate ladder stalled at Peasant behind its rank-2 requirement. These are
 * those trials.
 *
 * Three design rules hold across the whole set:
 *
 * 1. **Not purchasable.** A trial reads attributes, bonds, estate and flags.
 *    Copper is at most a fee, never the qualification (PROGRESSION.md §3).
 * 2. **Bonds are the lever.** From rank 3 up, every trial names a woman whose
 *    trust you need. The people who run an institution decide who rises in it
 *    — that is pillar 2 of the project stated as a gate.
 * 3. **The two axes pull each other up.** Rank 2 wants Peasant, rank 3 wants
 *    Villager, rank 4 wants Burgher, rank 5 wants Gentry — and those estates
 *    in turn want ranks 2, 3, 4 and 5. Neither ladder climbs alone.
 */
export const CAREER_TRIALS: CareerTrialDefinition[] = [
  /* ================================================================ *
   * Clergy — Church of Sol. Piety, then the charm to be believed.
   * ================================================================ */
  {
    id: 'trial_clergy_1',
    track: 'clergy',
    rank: 1,
    title: 'The Vigil of Ashes',
    description:
      'Beatrix gives you a candle and the night shift in the almshouse. Sit with the dying until dawn; say nothing you do not mean.',
    examinerNpcId: 'beatrix',
    requires: { attribute: { piety: 10 } },
    cost: { energy: -20 },
    rewards: {
      standingPoints: 30,
      attributes: { piety: 1 },
      factions: [{ factionId: 'church', opinion: 4 }, { factionId: 'commons', opinion: 2 }],
      npc: [{ npcId: 'beatrix', trust: 4, respect: 3 }],
      setFlags: ['clergy.took_the_vigil'],
    },
    outcome: 'You are marked with ash at sunrise. Acolyte is not a rank so much as a promise the Church intends to hold you to.',
  },
  {
    id: 'trial_clergy_2',
    track: 'clergy',
    rank: 2,
    title: 'The Alms Round',
    description:
      'Carry the alms into the Ashes yourself, without the guard Beatrix is obliged to offer you. The refugees must see the Church come unarmed.',
    examinerNpcId: 'beatrix',
    requires: { estate: 'Peasant', attribute: { piety: 14, charm: 11 } },
    cost: { energy: -28, copper: -60 },
    rewards: {
      standingPoints: 60,
      xp: 40,
      guildMarks: 4,
      attributes: { piety: 1, charm: 1 },
      factions: [
        { factionId: 'church', opinion: 5 },
        { factionId: 'refugees', opinion: 6 },
        { factionId: 'syndicate', opinion: -3 },
      ],
      npc: [{ npcId: 'beatrix', trust: 5, affection: 3 }],
      kingdom: { welfare: 2 },
      setFlags: ['clergy.walked_the_ashes'],
    },
    outcome: 'You come back with an empty basket and a torn sleeve. Beatrix notices the sleeve and says nothing about it for three days.',
  },
  {
    id: 'trial_clergy_3',
    track: 'clergy',
    rank: 3,
    title: 'The Sermon on Water',
    description:
      'Preach on the aqueduct — the real one, the one the court would rather no one counted. Beatrix will not tell you whether to soften it.',
    examinerNpcId: 'beatrix',
    requires: {
      estate: 'Villager',
      attribute: { piety: 19, charm: 15 },
      bond: [{ npcId: 'beatrix', minTrust: 35 }],
    },
    cost: { energy: -35 },
    rewards: {
      standingPoints: 110,
      xp: 90,
      guildMarks: 8,
      attributes: { piety: 2, authority: 1 },
      factions: [
        { factionId: 'church', opinion: 7 },
        { factionId: 'commons', opinion: 6 },
        { factionId: 'crown', opinion: -4 },
        { factionId: 'nobility', opinion: -3 },
      ],
      npc: [{ npcId: 'beatrix', trust: 7, respect: 5 }, { npcId: 'mira', affection: 4, trust: 3 }],
      setFlags: ['clergy.preached_on_water', 'crown.marked_a_loud_priest'],
    },
    outcome: 'Priest of Sol. Half the nave weeps and a clerk in the third row writes your name down.',
  },
  {
    id: 'trial_clergy_4',
    track: 'clergy',
    rank: 4,
    title: 'The Audit of the Reliquary',
    description:
      'Someone has been selling the cathedral’s silver. Beatrix hands you the ledgers and asks you to find the name — knowing it may be one she loves.',
    examinerNpcId: 'beatrix',
    requires: {
      estate: 'Burgher',
      attribute: { piety: 25, charm: 19, cunning: 14 },
      bond: [{ npcId: 'beatrix', minTrust: 50 }],
    },
    cost: { energy: -45 },
    rewards: {
      standingPoints: 220,
      xp: 180,
      guildMarks: 16,
      attributes: { piety: 2, cunning: 1 },
      factions: [
        { factionId: 'church', opinion: 8 },
        { factionId: 'syndicate', opinion: -8 },
      ],
      npc: [{ npcId: 'beatrix', trust: 9, respect: 7 }, { npcId: 'vesper', resentment: 6 }],
      setFlags: ['clergy.found_the_reliquary_thief'],
    },
    outcome: 'Canon of the Cathedral. You gave her the name. She read it twice and then put it in the fire, and neither of you has mentioned it since.',
  },
  {
    id: 'trial_clergy_5',
    track: 'clergy',
    rank: 5,
    title: 'The Investiture',
    description:
      'The mitre is voted, not given. Beatrix will speak for you; the chapter will decide whether a man who arrived with the refugees may wear it.',
    examinerNpcId: 'beatrix',
    requires: {
      estate: 'Gentry',
      day: { min: 90 },
      attribute: { piety: 31, charm: 24, authority: 20 },
      bond: [{ npcId: 'beatrix', minTrust: 65 }],
      flags: { all: ['clergy.preached_on_water'] },
    },
    cost: { energy: -55, copper: -2000 },
    rewards: {
      standingPoints: 450,
      xp: 400,
      guildMarks: 30,
      attributes: { piety: 3, authority: 2 },
      factions: [
        { factionId: 'church', opinion: 10 },
        { factionId: 'commons', opinion: 6 },
        { factionId: 'syndicate', opinion: -6 },
      ],
      npc: [{ npcId: 'beatrix', trust: 10, affection: 6, respect: 8 }],
      setFlags: ['clergy.bishop', 'throne.anointed_route_open'],
    },
    outcome: 'Bishop of Valenreach. Beatrix sets the mitre on you herself, and her hands are not steady.',
  },

  /* ================================================================ *
   * Merchant — the Guilds. Cunning, and the charm to close.
   * ================================================================ */
  {
    id: 'trial_merchant_1',
    track: 'merchant',
    rank: 1,
    title: 'The Float',
    description:
      'Rin fronts you forty copper and a crate of nothing special. Come back at dusk with more than you left with, and be able to say how.',
    examinerNpcId: 'rin',
    requires: { attribute: { cunning: 10 } },
    cost: { energy: -20, copper: -40 },
    rewards: {
      copper: 95,
      standingPoints: 30,
      attributes: { cunning: 1 },
      guildMarks: 2,
      factions: [{ factionId: 'guilds', opinion: 4 }],
      npc: [{ npcId: 'rin', trust: 4, affection: 3 }],
      setFlags: ['merchant.made_the_float'],
    },
    outcome: 'Hawker. Rin counts it twice, keeps her forty, and tells you the second count was the test.',
  },
  {
    id: 'trial_merchant_2',
    track: 'merchant',
    rank: 2,
    title: 'The Short Weight',
    description:
      'A factor on the west row is shaving measures. Prove it on the floor, in front of witnesses, without getting yourself barred.',
    examinerNpcId: 'rin',
    requires: { estate: 'Peasant', attribute: { cunning: 14, charm: 11 } },
    cost: { energy: -28 },
    rewards: {
      copper: 180,
      standingPoints: 60,
      xp: 40,
      guildMarks: 5,
      attributes: { cunning: 1, charm: 1 },
      factions: [{ factionId: 'guilds', opinion: 6 }, { factionId: 'commons', opinion: 3 }],
      npc: [{ npcId: 'rin', trust: 5, respect: 4 }],
      setFlags: ['merchant.broke_the_short_weight'],
    },
    outcome: 'Trader. The scales go to the guild court and your name goes onto the floor roll.',
  },
  {
    id: 'trial_merchant_3',
    track: 'merchant',
    rank: 3,
    title: 'The Weaverlane Contract',
    description:
      'Sylvie needs dye at a price that does not exist yet. Build the route that makes it exist, and hold the margin when the Bourse tries to take it back.',
    examinerNpcId: 'sylvie',
    requires: {
      estate: 'Villager',
      attribute: { cunning: 19, charm: 15 },
      bond: [{ npcId: 'sylvie', minTrust: 35 }],
    },
    cost: { energy: -35, copper: -600 },
    rewards: {
      copper: 1600,
      standingPoints: 110,
      xp: 90,
      guildMarks: 10,
      attributes: { cunning: 2, charm: 1 },
      factions: [{ factionId: 'guilds', opinion: 7 }],
      npc: [{ npcId: 'sylvie', trust: 7, affection: 5 }, { npcId: 'rin', respect: 4 }],
      setFlags: ['merchant.holds_a_dye_route'],
    },
    outcome: 'Factor of the Bourse. Sylvie signs it without reading it, which from her is not carelessness.',
  },
  {
    id: 'trial_merchant_4',
    track: 'merchant',
    rank: 4,
    title: 'The Consortium Seat',
    description:
      'Silas puts your name to the Consortium. Four of the seven owe you nothing; Rin can tell you which of the four can be moved, and how.',
    examinerNpcId: 'silas',
    requires: {
      estate: 'Burgher',
      attribute: { cunning: 25, charm: 20, authority: 15 },
      bond: [{ npcId: 'rin', minTrust: 50 }],
    },
    cost: { energy: -45, copper: -3500 },
    rewards: {
      standingPoints: 220,
      xp: 180,
      guildMarks: 20,
      attributes: { cunning: 2, authority: 1 },
      factions: [{ factionId: 'guilds', opinion: 9 }, { factionId: 'nobility', opinion: 3 }],
      npc: [{ npcId: 'rin', trust: 8, affection: 5 }, { npcId: 'silas', trust: 6, respect: 6 }],
      setFlags: ['merchant.holds_consortium_seat'],
    },
    outcome: 'Merchant of the Consortium. You are handed a chair, a vote, and the enmity of whoever wanted the chair.',
  },
  {
    id: 'trial_merchant_5',
    track: 'merchant',
    rank: 5,
    title: 'The Corner',
    description:
      'Take a staple off the market and give it back at your price — and be standing when the Crown asks who did it. Silas has done this once. He will not do it again.',
    examinerNpcId: 'silas',
    requires: {
      estate: 'Gentry',
      day: { min: 90 },
      attribute: { cunning: 31, charm: 24, authority: 20 },
      bond: [{ npcId: 'rin', minTrust: 65 }],
      flags: { all: ['merchant.holds_consortium_seat'] },
    },
    cost: { energy: -55, copper: -18000 },
    rewards: {
      copper: 42000,
      standingPoints: 450,
      xp: 400,
      guildMarks: 36,
      attributes: { cunning: 3, authority: 2 },
      factions: [
        { factionId: 'guilds', opinion: 10 },
        { factionId: 'crown', opinion: -5 },
        { factionId: 'commons', opinion: -6 },
      ],
      npc: [{ npcId: 'rin', trust: 10, affection: 7 }],
      setFlags: ['merchant.magnate', 'throne.magnate_route_open'],
    },
    outcome: 'Magnate. The Bourse closes an hour early and nobody says why. Rin finds you afterwards and does not congratulate you, which is its own kind of congratulation.',
  },

  /* ================================================================ *
   * Martial — the Military. Might, and the authority to be followed.
   * ================================================================ */
  {
    id: 'trial_martial_1',
    track: 'martial',
    rank: 1,
    title: 'The Muster',
    description:
      'Claire runs the levy intake. Stand the line, take the stick, and do not put your hands up when it comes down.',
    examinerNpcId: 'claire',
    requires: { attribute: { might: 10 } },
    cost: { energy: -22, health: -6 },
    rewards: {
      standingPoints: 30,
      attributes: { might: 1 },
      factions: [{ factionId: 'military', opinion: 4 }],
      npc: [{ npcId: 'claire', trust: 4, respect: 4 }],
      setFlags: ['martial.stood_the_muster'],
    },
    outcome: 'Levy of the Ninth. Claire looks at the bruise and says it is the right shape, which is apparently praise.',
  },
  {
    id: 'trial_martial_2',
    track: 'martial',
    rank: 2,
    title: 'The Night Wall',
    description:
      'A full watch on the north wall in the cold, alone, and an honest report in the morning — including the hour you did not hear anything because you were asleep.',
    examinerNpcId: 'valerius',
    requires: { estate: 'Peasant', attribute: { might: 14, authority: 11 } },
    cost: { energy: -30, health: -4 },
    rewards: {
      standingPoints: 60,
      xp: 40,
      guildMarks: 5,
      attributes: { might: 1, authority: 1 },
      factions: [{ factionId: 'military', opinion: 6 }, { factionId: 'crown', opinion: 2 }],
      npc: [{ npcId: 'valerius', trust: 6, respect: 5 }, { npcId: 'claire', affection: 2 }],
      setFlags: ['martial.honest_watch_report'],
    },
    outcome: 'Man-at-Arms. Valerius reads the part about the sleeping twice and signs it anyway.',
  },
  {
    id: 'trial_martial_3',
    track: 'martial',
    rank: 3,
    title: 'The Catacomb Sweep',
    description:
      'Claire takes a file of eight into the tunnels under the Ashes. She wants you at the front, and she wants all eight back.',
    examinerNpcId: 'claire',
    requires: {
      estate: 'Villager',
      attribute: { might: 19, authority: 15 },
      bond: [{ npcId: 'claire', minTrust: 35 }],
    },
    cost: { energy: -38, health: -10 },
    rewards: {
      standingPoints: 110,
      xp: 90,
      guildMarks: 10,
      attributes: { might: 2, authority: 1 },
      factions: [
        { factionId: 'military', opinion: 8 },
        { factionId: 'commons', opinion: 4 },
        { factionId: 'syndicate', opinion: -7 },
      ],
      npc: [{ npcId: 'claire', trust: 8, respect: 6, affection: 4 }, { npcId: 'vesper', resentment: 5 }],
      setFlags: ['martial.led_the_sweep'],
    },
    outcome: 'Sergeant of the Ninth. All eight came back. Claire counts them out loud at the tunnel mouth, twice, and then walks off before anyone can see her face.',
  },
  {
    id: 'trial_martial_4',
    track: 'martial',
    rank: 4,
    title: 'The Vigil of Arms',
    description:
      'A night at the altar with your sword, and in the morning Valerius asks one question in front of the whole garrison: what the sword is for.',
    examinerNpcId: 'valerius',
    requires: {
      estate: 'Burgher',
      attribute: { might: 25, authority: 20, piety: 14 },
      bond: [{ npcId: 'claire', minTrust: 50 }],
    },
    cost: { energy: -48, copper: -2500 },
    rewards: {
      standingPoints: 220,
      xp: 180,
      guildMarks: 20,
      attributes: { might: 2, authority: 2 },
      factions: [
        { factionId: 'military', opinion: 9 },
        { factionId: 'nobility', opinion: 5 },
        { factionId: 'church', opinion: 4 },
      ],
      npc: [{ npcId: 'claire', trust: 8, affection: 6 }, { npcId: 'valerius', respect: 8 }],
      setFlags: ['martial.knighted'],
    },
    outcome: 'Knight of Valenreach. You gave an answer that was not the one in the manual, and Valerius let it stand.',
  },
  {
    id: 'trial_martial_5',
    track: 'martial',
    rank: 5,
    title: 'The Field Command',
    description:
      'The garrison will follow a Marshal it chose. Take the muster field, take the companies through a live problem, and let them decide in the open whether you are it.',
    examinerNpcId: 'claire',
    requires: {
      estate: 'Gentry',
      day: { min: 90 },
      attribute: { might: 31, authority: 26 },
      bond: [{ npcId: 'claire', minTrust: 65 }],
      flags: { all: ['martial.knighted'] },
    },
    cost: { energy: -60, health: -12, copper: -6000 },
    rewards: {
      standingPoints: 450,
      xp: 400,
      guildMarks: 36,
      attributes: { might: 3, authority: 3 },
      factions: [
        { factionId: 'military', opinion: 10, power: 4 },
        { factionId: 'crown', opinion: -3 },
        { factionId: 'nobility', opinion: 4 },
      ],
      npc: [{ npcId: 'claire', trust: 10, affection: 8, respect: 10 }],
      setFlags: ['martial.marshal', 'throne.marshal_route_open'],
    },
    outcome: 'Marshal of Valenreach. Nine hundred people shout one syllable at the same time, and it is your name.',
  },

  /* ================================================================ *
   * Court — the Crown. Authority, and the patience for paper.
   * ================================================================ */
  {
    id: 'trial_court_1',
    track: 'court',
    rank: 1,
    title: 'The Fair Hand',
    description:
      'Elare sets you a page of the water ledger to copy. The test is not the hand. The test is whether you copy the error or correct it without being asked.',
    examinerNpcId: 'elare',
    requires: { attribute: { authority: 10 } },
    cost: { energy: -18 },
    rewards: {
      standingPoints: 30,
      attributes: { authority: 1, cunning: 1 },
      factions: [{ factionId: 'crown', opinion: 4 }],
      npc: [{ npcId: 'elare', trust: 5, respect: 4 }],
      setFlags: ['court.corrected_the_ledger'],
    },
    outcome: 'Clerk of the Chancery. You corrected it. Elare had put it there on purpose, and now she knows what you are.',
  },
  {
    id: 'trial_court_2',
    track: 'court',
    rank: 2,
    title: 'The Petition Docket',
    description:
      'Forty petitions, one morning, and a Chamberlain who wants them sorted by whose they are rather than what they say. Sort them your way and defend it.',
    examinerNpcId: 'elare',
    requires: { estate: 'Peasant', attribute: { authority: 14, cunning: 12 } },
    cost: { energy: -26 },
    rewards: {
      standingPoints: 60,
      xp: 40,
      guildMarks: 5,
      attributes: { authority: 1, charm: 1 },
      factions: [
        { factionId: 'crown', opinion: 5 },
        { factionId: 'commons', opinion: 4 },
        { factionId: 'nobility', opinion: -3 },
      ],
      npc: [{ npcId: 'elare', trust: 6, affection: 3 }],
      setFlags: ['court.sorted_by_need'],
    },
    outcome: 'Steward. Three noble petitions went to the bottom of the pile, and somebody upstairs has already asked who you are.',
  },
  {
    id: 'trial_court_3',
    track: 'court',
    rank: 3,
    title: 'The Household Key',
    description:
      'Seraphine runs the royal household and trusts no one with its keys. Spend a week proving that the King’s table can be cheaper without anyone at it noticing.',
    examinerNpcId: 'seraphine',
    requires: {
      estate: 'Villager',
      attribute: { authority: 19, charm: 16 },
      bond: [{ npcId: 'seraphine', minTrust: 35 }],
    },
    cost: { energy: -36, copper: -500 },
    rewards: {
      standingPoints: 110,
      xp: 90,
      guildMarks: 12,
      attributes: { authority: 2, charm: 1 },
      factions: [{ factionId: 'crown', opinion: 8 }, { factionId: 'nobility', opinion: 3 }],
      npc: [{ npcId: 'seraphine', trust: 8, respect: 6 }, { npcId: 'elare', affection: 3 }],
      setFlags: ['court.holds_household_key'],
    },
    outcome: 'Chamberlain. Seraphine gives you a key on a plain ring and tells you exactly one door it does not open.',
  },
  {
    id: 'trial_court_4',
    track: 'court',
    rank: 4,
    title: 'The Drafted Decree',
    description:
      'Write a decree the King will sign, the Guilds will swallow, and the Nobility cannot quite refuse. You will read it aloud in council yourself.',
    examinerNpcId: 'seraphine',
    requires: {
      estate: 'Burgher',
      attribute: { authority: 25, charm: 20, cunning: 18 },
      bond: [{ npcId: 'seraphine', minTrust: 50 }],
    },
    cost: { energy: -46 },
    rewards: {
      standingPoints: 220,
      xp: 180,
      guildMarks: 22,
      attributes: { authority: 3, charm: 1 },
      factions: [
        { factionId: 'crown', opinion: 9 },
        { factionId: 'guilds', opinion: 3 },
        { factionId: 'nobility', opinion: -4 },
      ],
      npc: [{ npcId: 'seraphine', trust: 9, affection: 5, respect: 7 }],
      setFlags: ['court.drafted_a_decree'],
    },
    outcome: 'Minister of the Crown. Aldric signs it without looking up. Seraphine looks up.',
  },
  {
    id: 'trial_court_5',
    track: 'court',
    rank: 5,
    title: 'The Seal',
    description:
      'The Chancellor’s seal is held, not awarded. Seraphine can put it in your hand; whether the council lets you keep it is a separate week entirely.',
    examinerNpcId: 'seraphine',
    requires: {
      estate: 'Gentry',
      day: { min: 90 },
      attribute: { authority: 32, charm: 25, cunning: 22 },
      bond: [{ npcId: 'seraphine', minTrust: 65 }],
      flags: { all: ['court.drafted_a_decree'] },
    },
    cost: { energy: -58, copper: -8000 },
    rewards: {
      standingPoints: 450,
      xp: 400,
      guildMarks: 38,
      attributes: { authority: 3, charm: 2 },
      factions: [
        { factionId: 'crown', opinion: 10, power: 3 },
        { factionId: 'nobility', opinion: -5 },
      ],
      npc: [{ npcId: 'seraphine', trust: 10, affection: 8, respect: 9 }],
      setFlags: ['court.chancellor', 'throne.heir_route_open'],
    },
    outcome: 'Chancellor of Valenreach. The seal is heavier than it looks and Seraphine keeps her hand under yours a moment longer than the ceremony requires.',
  },

  /* ================================================================ *
   * Shadow — the Syndicate. Cunning, nerve, and a growing bounty.
   * ================================================================ */
  {
    id: 'trial_shadow_1',
    track: 'shadow',
    rank: 1,
    title: 'The Clean Lift',
    description:
      'Vesper names a purse, a street and an hour. Take it without a hand on anyone and without the Watch writing anything down.',
    examinerNpcId: 'vesper',
    requires: { attribute: { cunning: 10 } },
    cost: { energy: -18 },
    rewards: {
      copper: 120,
      standingPoints: 20,
      bounty: 4,
      attributes: { cunning: 1 },
      factions: [{ factionId: 'syndicate', opinion: 5 }, { factionId: 'church', opinion: -2 }],
      npc: [{ npcId: 'vesper', trust: 4, affection: 3 }],
      setFlags: ['shadow.first_lift'],
    },
    outcome: 'Cutpurse. Vesper takes half, which she explains is the tax on being taught.',
  },
  {
    id: 'trial_shadow_2',
    track: 'shadow',
    rank: 2,
    title: 'The Customs Run',
    description:
      'A crate off the Wharfs and under the wall before the tide turns. Bran will not help you and will not stop you, and that is the arrangement.',
    examinerNpcId: 'vesper',
    requires: { estate: 'Peasant', attribute: { cunning: 15, might: 11 } },
    cost: { energy: -30 },
    rewards: {
      copper: 320,
      standingPoints: 45,
      xp: 40,
      guildMarks: 5,
      bounty: 8,
      attributes: { cunning: 1, might: 1 },
      factions: [
        { factionId: 'syndicate', opinion: 7 },
        { factionId: 'crown', opinion: -3 },
        { factionId: 'church', opinion: -3 },
      ],
      npc: [{ npcId: 'vesper', trust: 5, respect: 4 }, { npcId: 'bran', trust: 2 }],
      setFlags: ['shadow.ran_the_customs_line'],
    },
    outcome: 'Runner. The crate is somebody’s medicine and somebody else’s crime, and the Wharfs never decided which mattered.',
  },
  {
    id: 'trial_shadow_3',
    track: 'shadow',
    rank: 3,
    title: 'The First Dossier',
    description:
      'Vesper wants leverage on a man in the Crown Quarter. Not a threat — a folder. Find what he does on the nights he says he is at prayer.',
    examinerNpcId: 'vesper',
    requires: {
      estate: 'Villager',
      attribute: { cunning: 20, charm: 15 },
      bond: [{ npcId: 'vesper', minTrust: 35 }],
    },
    cost: { energy: -36, copper: -400 },
    rewards: {
      copper: 900,
      standingPoints: 90,
      xp: 90,
      guildMarks: 12,
      bounty: 12,
      attributes: { cunning: 2, charm: 1 },
      factions: [
        { factionId: 'syndicate', opinion: 8 },
        { factionId: 'crown', opinion: -5 },
        { factionId: 'church', opinion: -4 },
      ],
      npc: [{ npcId: 'vesper', trust: 8, affection: 5 }],
      setFlags: ['shadow.dossier_1', 'shadow.knows_a_crown_secret'],
    },
    outcome: 'Fixer. The folder is thin and it is enough. Vesper reads it by candle and says, quietly, that you are going to be a problem.',
  },
  {
    id: 'trial_shadow_4',
    track: 'shadow',
    rank: 4,
    title: 'The Quiet Succession',
    description:
      'An underboss on the river side has grown careless. Vesper wants his people, not his blood — take the crew without a body, or do not come back at all.',
    examinerNpcId: 'vesper',
    requires: {
      estate: 'Burgher',
      attribute: { cunning: 26, might: 18, charm: 20 },
      bond: [{ npcId: 'vesper', minTrust: 50 }],
      flags: { all: ['shadow.dossier_1'] },
    },
    cost: { energy: -48, health: -8, copper: -3000 },
    rewards: {
      copper: 6000,
      standingPoints: 180,
      xp: 180,
      guildMarks: 22,
      bounty: 22,
      attributes: { cunning: 3, might: 1 },
      factions: [
        { factionId: 'syndicate', opinion: 10, power: 3 },
        { factionId: 'military', opinion: -6 },
        { factionId: 'church', opinion: -5 },
      ],
      npc: [{ npcId: 'vesper', trust: 9, affection: 7, respect: 8 }],
      setFlags: ['shadow.dossier_2', 'shadow.took_a_crew'],
    },
    outcome: 'Underboss. Nobody died, which in the Catacomb Quarter is the kind of thing people remember longer than a killing.',
  },
  {
    id: 'trial_shadow_5',
    track: 'shadow',
    rank: 5,
    title: 'The Third Folder',
    description:
      'Vesper gives you the Syndicate the only way it can be given: she puts her own dossier in your hands and tells you to use it on her if you ever need to.',
    examinerNpcId: 'vesper',
    requires: {
      estate: 'Gentry',
      day: { min: 90 },
      attribute: { cunning: 33, charm: 26, might: 22 },
      bond: [{ npcId: 'vesper', minTrust: 70 }],
      flags: { all: ['shadow.dossier_2'] },
    },
    cost: { energy: -58, copper: -12000 },
    rewards: {
      copper: 20000,
      standingPoints: 380,
      xp: 400,
      guildMarks: 38,
      bounty: 30,
      attributes: { cunning: 3, charm: 2 },
      factions: [
        { factionId: 'syndicate', opinion: 10, power: 6 },
        { factionId: 'crown', opinion: -6 },
        { factionId: 'church', opinion: -8 },
        { factionId: 'military', opinion: -5 },
      ],
      npc: [{ npcId: 'vesper', trust: 10, affection: 9, desire: 6 }],
      setFlags: ['shadow.kingpin', 'shadow.dossier_3', 'throne.kingpin_route_open'],
    },
    outcome: 'Kingpin of the Nightshade. She does not look away while she hands it over, and that is the whole ceremony.',
  },

  /* ================================================================ *
   * Scholar — no faction floor, and no patron to smooth it either.
   * ================================================================ */
  {
    id: 'trial_scholar_1',
    track: 'scholar',
    rank: 1,
    title: 'The Named Hundred',
    description:
      'Lyra walks the Thornwood verges with you and asks for a hundred plants by name — the proper name and the old women’s name, and which of the two will kill you.',
    examinerNpcId: 'lyra',
    requires: { attribute: { cunning: 10 } },
    cost: { energy: -16 },
    rewards: {
      standingPoints: 25,
      attributes: { cunning: 1, piety: 1 },
      items: [{ resourceId: 'herbs', amount: 3 }],
      npc: [{ npcId: 'lyra', trust: 5, affection: 4 }],
      setFlags: ['scholar.named_the_hundred'],
    },
    outcome: 'Student. You get eighty-one. Lyra says the nineteen you missed are the nineteen that matter and starts again tomorrow.',
  },
  {
    id: 'trial_scholar_2',
    track: 'scholar',
    rank: 2,
    title: 'The Fever Ward',
    description:
      'Elena hands you a ward of eleven and a tincture she is not certain about. Keep a record honest enough to be useful if it fails.',
    examinerNpcId: 'elena',
    requires: { estate: 'Peasant', attribute: { cunning: 14, piety: 12 } },
    cost: { energy: -28, health: -5 },
    rewards: {
      standingPoints: 55,
      xp: 40,
      guildMarks: 5,
      attributes: { cunning: 1, piety: 1 },
      factions: [{ factionId: 'church', opinion: 4 }, { factionId: 'commons', opinion: 4 }],
      npc: [{ npcId: 'elena', trust: 6, respect: 5 }],
      kingdom: { welfare: 2 },
      setFlags: ['scholar.kept_the_fever_record'],
    },
    outcome: 'Adept. Nine of eleven. Elena writes the two names in the front of the book rather than the back.',
  },
  {
    id: 'trial_scholar_3',
    track: 'scholar',
    rank: 3,
    title: 'The Sluice Calculation',
    description:
      'Work out what the Grand Aqueduct actually delivers, against what the ledgers say it delivers. Mira will open the upper works for you. Nobody has asked her in three years.',
    examinerNpcId: 'elena',
    requires: {
      estate: 'Villager',
      attribute: { cunning: 20, piety: 14 },
      bond: [{ npcId: 'mira', minTrust: 35 }],
    },
    cost: { energy: -36 },
    rewards: {
      standingPoints: 100,
      xp: 90,
      guildMarks: 12,
      attributes: { cunning: 3 },
      factions: [{ factionId: 'commons', opinion: 5 }, { factionId: 'crown', opinion: -2 }],
      npc: [{ npcId: 'mira', trust: 8, affection: 6 }, { npcId: 'elena', respect: 5 }],
      setFlags: ['scholar.measured_the_aqueduct', 'drought.numbers_do_not_add_up'],
    },
    outcome: 'Savant. The numbers do not add up, and they have not added up since the year of the Red Drought. Mira already knew. She wanted someone else to write it down.',
  },
  {
    id: 'trial_scholar_4',
    track: 'scholar',
    rank: 4,
    title: 'The Closed Stack',
    description:
      'Elare can admit one person to the sealed archive. Give her a question worth the risk, and be ready for the answer to be about you.',
    examinerNpcId: 'elare',
    requires: {
      estate: 'Burgher',
      attribute: { cunning: 26, authority: 16 },
      bond: [{ npcId: 'elare', minTrust: 50 }],
      flags: { all: ['scholar.measured_the_aqueduct'] },
    },
    cost: { energy: -44, copper: -1500 },
    rewards: {
      standingPoints: 200,
      xp: 180,
      guildMarks: 22,
      attributes: { cunning: 3, authority: 1 },
      factions: [{ factionId: 'crown', opinion: 3 }],
      npc: [{ npcId: 'elare', trust: 9, affection: 6 }],
      setFlags: ['scholar.entered_the_closed_stack', 'mystery.sluice_order_exists'],
    },
    outcome: 'Magister. There is a sluice order from the year of the drought, signed, and the signature has been scraped. Elare has known about the scrape for two years and has told no one.',
  },
  {
    id: 'trial_scholar_5',
    track: 'scholar',
    rank: 5,
    title: 'The Defence',
    description:
      'Publish what the archive holds and defend it in open hall against the men it accuses. Elare cannot protect you once you begin.',
    examinerNpcId: 'elare',
    requires: {
      estate: 'Gentry',
      day: { min: 90 },
      attribute: { cunning: 33, authority: 24, piety: 18 },
      bond: [{ npcId: 'elare', minTrust: 65 }],
      flags: { all: ['scholar.entered_the_closed_stack'] },
    },
    cost: { energy: -56, copper: -5000 },
    rewards: {
      standingPoints: 420,
      xp: 400,
      guildMarks: 36,
      attributes: { cunning: 3, authority: 2, piety: 1 },
      factions: [
        { factionId: 'commons', opinion: 8 },
        { factionId: 'refugees', opinion: 8 },
        { factionId: 'nobility', opinion: -8 },
        { factionId: 'crown', opinion: -4 },
      ],
      npc: [{ npcId: 'elare', trust: 10, affection: 8, respect: 9 }, { npcId: 'mira', affection: 6, trust: 5 }],
      setFlags: ['scholar.archmagister', 'mystery.drought_published'],
    },
    outcome: 'Archmagister. You said it out loud with the Duke in the third row, and the hall was very quiet, and now it cannot be unsaid.',
  },
];

export const TRIALS_BY_ID: Record<string, CareerTrialDefinition> = Object.fromEntries(
  CAREER_TRIALS.map((t) => [t.id, t]),
);

/** The trial that admits the player to `rank` on `track`, if one is authored. */
export function trialFor(track: CareerTrialDefinition['track'], rank: number): CareerTrialDefinition | undefined {
  return CAREER_TRIALS.find((t) => t.track === track && t.rank === rank);
}
