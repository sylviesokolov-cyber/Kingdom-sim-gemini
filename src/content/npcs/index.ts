import type { NpcDefinition } from '../../types';

/**
 * The cast. Every principal companion runs a facility the kingdom needs —
 * which is what makes bonding with her a progression mechanic rather than a
 * side activity. See docs/systems/NPCS.md for the authoring checklist.
 *
 * Portrait assignments reuse the art ported from kingdom-sim. Where a
 * character has no dedicated plate yet, she shares one; replacing these with
 * bespoke art is a Phase 16 task and requires no code change.
 */
export const NPC_DEFINITIONS: NpcDefinition[] = [
  /* ---------------------------------------------------------------- */
  {
    id: 'caren',
    name: 'Caren',
    title: 'Lady of the Harvest',
    role: 'Granary Overseer of the Goldfields',
    district: 'goldfields',
    facility: 'goldfield_silos',
    faction: 'refugees',
    rarity: 'SSR',
    portraitUrl: '/characters/rubia_assassin.png',
    backgroundUrl: '/characters/backgrounds/main_screen_background.jpg',
    themeColor: '#d9a441',
    traits: ['Noble', 'Gentle', 'Devoted', 'Stubborn'],
    interior: {
      want: 'A granary law that puts the reserve beyond any noble\'s reach, including a future king\'s.',
      fear: 'Another Red Drought, and being the one who has to decide which district eats.',
      secret:
        'She has been quietly skimming the reserve for three years to feed the Ashes children, and the ledgers she keeps are forged.',
      wound: 'She was fourteen during the Drought and watched her mother give away her own ration.',
    },
    managedResource: 'grain',
    dialogue: {
      greetings: [
        "You're back already? Hehe. Did you miss me, my lord?",
        'Careful, the floor by the third silo is still soft. Come round this way.',
        'I saved you something. Do not ask what I gave up for it.',
      ],
      work: {
        default: 'Nine days of cover in the silos. Ask me again after the frost and I will say seven.',
        byMood: {
          Worried: 'Six days. I have counted it four times and it is still six days.',
          Elated: 'Twelve days of cover. Twelve. I have not said that number out loud in three years.',
        },
      },
      personal: {
        default: 'Come here. You look like a man who has not sat down since dawn.',
        byMood: {
          Cold: 'I am working. You know where the door is.',
          Hurt: "Don't. Whatever it is you were going to say — not today.",
          Warm: 'Sit with me a moment. The grain is not going anywhere and neither, I hope, are you.',
        },
      },
      rumor: {
        default:
          'Ashgrave\'s factors have been buying grain futures in the outer valley. In spring. Before a harvest anyone has seen.',
      },
      plea: {
        default: 'The children in the Ashes have not eaten properly in four days. I need medicine, not sympathy.',
      },
    },
    favoriteGifts: ['bread', 'fruit', 'cloth'],
    hatedGifts: ['contraband', 'luxuries'],
    opinions: [
      { npcId: 'rin', opinion: 'rival', reason: 'Rin trades grain futures. Caren knows exactly what that does to a city in a famine.' },
      { npcId: 'seraphine', opinion: 'rival', reason: 'She thinks the crown has never once counted the reserve honestly.' },
      { npcId: 'mira', opinion: 'ally', reason: 'Water and grain fail together. They have always warned each other first.' },
      { npcId: 'beatrix', opinion: 'ally', reason: 'The cathedral almshouses take her surplus and ask no questions.' },
    ],
    bondable: true,
    initialRelationship: { affection: 24, trust: 20, respect: 10, desire: 8 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'mira',
    name: 'Mira',
    title: 'The Springtender',
    role: 'Overseer of the Grand Aqueduct',
    district: 'springhead',
    facility: 'grand_aqueduct',
    faction: 'commons',
    rarity: 'SSR',
    portraitUrl: '/characters/justia_paladin.png',
    backgroundUrl: '/characters/backgrounds/healer_background.webp',
    themeColor: '#5fa8c7',
    traits: ['Precise', 'Guarded', 'Relentless'],
    interior: {
      want: 'To prove the Red Drought was engineered, and to survive having proved it.',
      fear: 'That she already has enough evidence, and that saying so aloud is what gets her killed.',
      secret: 'She has the original sluice order. It bears a seal she has not shown to anyone.',
      wound: 'Her predecessor at Springhead was found in the catacombs with his notes missing.',
    },
    managedResource: 'water',
    dialogue: {
      greetings: [
        'Flow is steady at the third cistern. You did not come here to hear that.',
        'Mind the grate. If you fall in I will have to explain it, and I am a poor liar.',
        'You came all the way up the hill. Either something is wrong, or you wanted to.',
      ],
      work: {
        default: 'Upper sluices at four-fifths. The melt is late this year. It is late every year now.',
        byMood: {
          Worried: 'Someone has been at the upper gates again. The seals are scored. That is not weather.',
        },
      },
      personal: {
        default: 'The water does not care who is king. I find that restful. Most people find it bleak.',
        byMood: {
          Warm: 'Stay a while. The cisterns sound like rain from in here, and I sleep badly without it.',
          Hurt: 'I told you something I have told no one. Do not make me regret the arithmetic.',
        },
      },
      rumor: {
        default:
          'Three men came up the service road at night with a surveyor\'s chain. Nobody surveys an aqueduct at night.',
      },
    },
    favoriteGifts: ['tools', 'herbs', 'water'],
    hatedGifts: ['contraband'],
    opinions: [
      { npcId: 'elena', opinion: 'rival', reason: 'Elena signed off on the water as clean during the Drought. Mira has never accepted that finding.' },
      { npcId: 'caren', opinion: 'ally', reason: 'Water and grain fail together. They have always warned each other first.' },
      { npcId: 'vesper', opinion: 'neutral', reason: 'The Syndicate knows things she needs. She dislikes needing them.' },
    ],
    bondable: true,
    initialRelationship: { affection: 12, trust: 8, respect: 14, desire: 4 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'vesper',
    name: 'Vesper',
    title: 'The Shadow Mirage',
    role: 'Underboss of the Nightshade Syndicate',
    district: 'catacombs',
    facility: 'catacomb_market',
    faction: 'syndicate',
    rarity: 'SSR',
    portraitUrl: '/characters/vesper_eclipse.png',
    backgroundUrl: '/characters/backgrounds/dancer_background.webp',
    themeColor: '#8b5cf6',
    traits: ['Playful', 'Mercenary', 'Dangerous', 'Loyal'],
    interior: {
      want: 'To find out who fronted the capital that bought the outer valley — and to bill them for it.',
      fear: 'That the Syndicate she inherited was complicit in the Drought, and that she has been spending that money.',
      secret: 'She murdered her predecessor. He deserved it. She has not decided whether that matters.',
      wound: 'She was sold to the Syndicate at eleven to settle a debt of forty copper.',
    },
    managedResource: 'contraband',
    dialogue: {
      greetings: [
        'Well. The respectable man comes down to the catacombs again. Third time this week, but who is counting.',
        'Careful where you put your hands down here. Some of it bites.',
        'You have that look. The one that means you want something and have not decided how to ask.',
      ],
      work: {
        default: 'Customs took a barge at the Wharfs. An acceptable loss. I chose which barge they took.',
      },
      personal: {
        default: 'Everyone down here wants something from me. You want something too. I just like how you ask.',
        byMood: {
          Jealous: 'Go on, then. She is waiting. I am told she is very devout.',
          Warm: 'Do not look at me like that. I am extremely difficult to embarrass and you are managing it.',
        },
      },
      rumor: {
        default:
          'Old syndicate ledgers, twenty years back, show a loan out to a noble house. The name is burned off. Burned, not cut. Someone was in a hurry.',
      },
    },
    favoriteGifts: ['contraband', 'luxuries', 'medicine'],
    hatedGifts: ['bread'],
    opinions: [
      { npcId: 'beatrix', opinion: 'nemesis', reason: 'The High Priestess has preached her name from the pulpit. Twice.' },
      { npcId: 'claire', opinion: 'rival', reason: 'The ninth company raids her runs. Professionally. She respects it and resents it.' },
      { npcId: 'elare', opinion: 'ally', reason: 'The archive keeper trades her records for silence, and neither has ever broken it.' },
    ],
    bondable: true,
    initialRelationship: { affection: 30, trust: 12, respect: 20, desire: 22 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'beatrix',
    name: 'Beatrix',
    title: 'Voice of the Dawn Sun',
    role: 'High Priestess of the Cathedral of Sol',
    district: 'cathedral_hill',
    facility: 'cathedral_almshouse',
    faction: 'church',
    rarity: 'SSR',
    portraitUrl: '/characters/beatrix_teresse.png',
    backgroundUrl: '/characters/backgrounds/sister_background.webp',
    themeColor: '#e8c86a',
    traits: ['Zealous', 'Formal', 'Compassionate', 'Unbending'],
    interior: {
      want: 'To make the Church feed people rather than merely bless them.',
      fear: 'That she already knows the cathedral is funded by smuggling and has chosen not to look.',
      secret: 'The Cathedral of Sol takes a tithe from the Syndicate. She approved it during the Drought.',
      wound: 'She gave last rites to four hundred people in one season and has never spoken of it since.',
    },
    managedResource: 'medicine',
    dialogue: {
      greetings: [
        'Sol keep you. You have come at the hour of alms, which I choose to find hopeful.',
        'You may sit. The pews are cold and the sermon is over, so you are spared both.',
        'You again. I have begun to expect you, which is its own small sin.',
      ],
      work: {
        default: 'Four hundred took bread at the door this morning. Last spring it was ninety.',
      },
      personal: {
        default: 'I speak for Sol all day. It is a strange relief to speak for myself, even briefly.',
        byMood: {
          Warm: 'When I am with you I am not the Voice of anything. You cannot know what that is worth.',
          Cold: 'The Voice of the Dawn Sun receives petitioners on the hour. Come back then.',
        },
      },
      rumor: {
        default:
          'A noble house has been making large anonymous gifts to the cathedral. Anonymous gifts are never anonymous. They are receipts.',
      },
    },
    favoriteGifts: ['bread', 'medicine', 'cloth'],
    hatedGifts: ['contraband', 'arms'],
    opinions: [
      { npcId: 'vesper', opinion: 'nemesis', reason: 'She has preached against the Syndicate by name, knowing what the cathedral takes from it.' },
      { npcId: 'caren', opinion: 'ally', reason: 'Caren feeds the Ashes and asks the Church for nothing. Beatrix finds that rebuking.' },
      { npcId: 'lyra', opinion: 'ally', reason: 'Thornwood supplies the almshouse herbs at cost, every season, without being asked.' },
    ],
    bondable: true,
    initialRelationship: { affection: 8, trust: 15, respect: 18, desire: 2 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'seraphine',
    name: 'Seraphine',
    title: 'The Loyal Queen',
    role: 'Mistress of the Royal Household',
    district: 'crown_quarter',
    facility: 'royal_household',
    faction: 'crown',
    rarity: 'SSR',
    portraitUrl: '/characters/valerius_sylvia.png',
    backgroundUrl: '/characters/backgrounds/queen_background.webp',
    themeColor: '#b8336a',
    traits: ['Regal', 'Composed', 'Calculating', 'Lonely'],
    interior: {
      want: 'A succession that does not end with Ashgrave on the throne and her in a convent.',
      fear: 'Outliving her usefulness the day Aldric dies.',
      secret: 'The king has been incapable of governing for eight months. She has been signing for him.',
      wound: 'She was married into a crown, not a marriage, at seventeen.',
    },
    managedResource: 'luxuries',
    dialogue: {
      greetings: [
        'You were announced. I chose to allow it. Do not read too much into either fact.',
        'The court is watching. It is always watching. Stand there — the light is better and the sightlines are worse.',
        'You came. I had wagered against it, with myself, for no stakes.',
      ],
      work: {
        default: 'The household runs. It runs because I do not sleep. Those are the same sentence.',
      },
      personal: {
        default: 'Everyone in this palace wants something from the crown. You keep asking about me instead. It is disorienting.',
        byMood: {
          Warm: 'Stay until the candles go. After that the corridors have ears, and I have already been reckless enough.',
        },
      },
      rumor: {
        default:
          'Ashgrave has begun asking after the succession papers directly. He would not do that unless he knew how little time is left.',
      },
    },
    favoriteGifts: ['luxuries', 'cloth', 'fruit'],
    hatedGifts: ['fish', 'iron_ore'],
    opinions: [
      { npcId: 'caren', opinion: 'rival', reason: 'The granary woman keeps forged ledgers and thinks the crown does not know.' },
      { npcId: 'elare', opinion: 'ally', reason: 'The archive keeper has never once repeated what she has read.' },
      { npcId: 'claire', opinion: 'ally', reason: 'The ninth company is the only guard unit she would trust with her back.' },
    ],
    bondable: true,
    initialRelationship: { affection: 4, trust: 4, respect: 6, desire: 2 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'rin',
    name: 'Rin',
    title: 'The Coin Countess',
    role: 'Floor Mistress of the Bourse Exchange',
    district: 'bourse',
    facility: 'bourse_imports',
    faction: 'guilds',
    rarity: 'SR',
    portraitUrl: '/characters/elena_scheherazade.png',
    backgroundUrl: '/characters/backgrounds/duchess_background.webp',
    themeColor: '#3fa796',
    traits: ['Numerate', 'Mercenary', 'Quick', 'Honest about it'],
    interior: {
      want: 'A seat on the consortium board, which has never seated a woman.',
      fear: 'Being right about a famine and profiting from it anyway.',
      secret: 'She brokered the grain futures that Ashgrave used. She did not know what they were for. She knows now.',
      wound: 'Her father lost the family house on a contract he could not read.',
    },
    managedResource: 'luxuries',
    dialogue: {
      greetings: [
        'Grain is up eleven. Water is up four. You are up, I would say, considerably, since we last spoke.',
        'Come to trade or come to look? Both are billable.',
        'You are the only man on this floor who has ever asked what I think rather than what the price is.',
      ],
      work: {
        default: 'Spread is wide today. Wide spread means someone knows something. Usually me.',
      },
      personal: {
        default: 'I flirt in percentages. It is not a defect, it is a specialisation.',
        byMood: {
          Warm: 'For you? Cost. Not a copper of margin. Do not tell anyone, it would ruin me professionally.',
        },
      },
      rumor: {
        default:
          'Someone has been buying grain twelve months forward through four different factors. Four factors means one buyer who does not want to be one buyer.',
      },
    },
    favoriteGifts: ['luxuries', 'tools', 'contraband'],
    hatedGifts: ['herbs'],
    opinions: [
      { npcId: 'caren', opinion: 'rival', reason: 'Caren called her a famine profiteer in front of the exchange floor. It landed because it was true.' },
      { npcId: 'sylvie', opinion: 'ally', reason: 'The guilds vote together or they lose together, and Sylvie understands that.' },
    ],
    bondable: true,
    initialRelationship: { affection: 14, trust: 10, respect: 12, desire: 10 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'sylvie',
    name: 'Sylvie',
    title: 'The Weaver of Sol',
    role: 'Guildmistress of Weaverlane',
    district: 'weaverlane',
    facility: 'weaverlane_looms',
    faction: 'guilds',
    rarity: 'SR',
    portraitUrl: '/characters/beatrix_teresse.png',
    backgroundUrl: '/characters/backgrounds/maid_background.webp',
    themeColor: '#b06a9f',
    traits: ['Worldly', 'Amused', 'Shrewd'],
    interior: {
      want: 'To keep four hundred weavers employed through a winter she can see coming.',
      fear: 'A guild vote she loses by one.',
      secret: 'She knows exactly which noble ordered forty dark silk cloaks last autumn, and for how many men.',
      wound: 'She built the guild from a single loom and has never been allowed to forget where she started.',
    },
    managedResource: 'cloth',
    dialogue: {
      greetings: [
        'Ah — the young man everyone is suddenly asking me about. Sit. Let me look at you properly.',
        'Mind the shuttle. It has taken three fingers off better men than you.',
        'You want something. Good. People who want nothing are impossible to help.',
      ],
      work: {
        default: 'Looms at full. Wool is dear and the winter order book is half empty. Ask me again in a month.',
      },
      personal: {
        default: 'I have seen the angle on every man who walked in that door for thirty years. Yours is refreshingly simple.',
      },
      rumor: {
        default:
          'Forty cloaks. Black silk, unmarked, no house colours. Delivered to a warehouse on the Wharfs and collected by men who did not sign.',
      },
    },
    favoriteGifts: ['cloth', 'luxuries', 'fruit'],
    hatedGifts: ['iron_ore'],
    opinions: [
      { npcId: 'claire', opinion: 'rival', reason: 'The soldier called the guilds parasites to her face. She has not decided if she disagrees.' },
      { npcId: 'rin', opinion: 'ally', reason: 'The guilds vote together or they lose together.' },
    ],
    bondable: true,
    initialRelationship: { affection: 18, trust: 16, respect: 8, desire: 6 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'claire',
    name: 'Claire',
    title: 'Knight of the Ninth',
    role: 'Captain of the Ninth Company',
    district: 'garrison',
    facility: 'garrison_barracks',
    faction: 'military',
    rarity: 'SR',
    portraitUrl: '/characters/justia_paladin.png',
    backgroundUrl: '/characters/backgrounds/knight_background.webp',
    themeColor: '#7a8fa6',
    traits: ['Blunt', 'Soldierly', 'Hopeless at subtlety', 'Steadfast'],
    interior: {
      want: 'The ninth paid on time, once, so she can stop covering the shortfall herself.',
      fear: 'Being ordered to put down a bread riot in the Ashes.',
      secret: 'She has been paying six of her soldiers out of her own inheritance for eleven months.',
      wound: 'She held the river gate during the Drought riots and remembers every face.',
    },
    managedResource: 'arms',
    dialogue: {
      greetings: [
        'You. Good. Hold this — no, like that. Now you look like you belong on a wall.',
        'I have nothing charming to say. I never do. You keep coming back anyway.',
        'Company is at drill. I am not. Take the advantage while it is on offer.',
      ],
      work: {
        default: 'Ninth is at four-fifths strength. Pay is nineteen days late. Morale is a generous word.',
      },
      personal: {
        default: 'I am better at this with a sword in my hand. Ask me something I can answer standing up.',
        byMood: {
          Warm: 'I am bad at this. I want to be clear that I know I am bad at this, and that I am still here.',
        },
      },
      rumor: {
        default:
          'Private levies are drilling on Ashgrave land. Not hunting parties. Formations. Somebody is paying for boots.',
      },
    },
    favoriteGifts: ['arms', 'tools', 'bread'],
    hatedGifts: ['contraband', 'luxuries'],
    opinions: [
      { npcId: 'sylvie', opinion: 'rival', reason: 'She thinks the guilds bleed the garrison budget and say prayers about it.' },
      { npcId: 'vesper', opinion: 'rival', reason: 'She raids the Syndicate runs. Professionally, and with a grudging respect she resents.' },
      { npcId: 'seraphine', opinion: 'ally', reason: 'The queen asked for the ninth by name. Nobody in the palace had ever asked for them at all.' },
    ],
    bondable: true,
    initialRelationship: { affection: 10, trust: 18, respect: 10, desire: 4 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'lyra',
    name: 'Lyra',
    title: 'The Forest Herbalist',
    role: 'Keeper of the Thornwood Herbary',
    district: 'thornwood',
    facility: 'thornwood_herbary',
    faction: 'commons',
    rarity: 'SR',
    portraitUrl: '/characters/elena_scheherazade.png',
    backgroundUrl: '/characters/backgrounds/ranger_background.webp',
    themeColor: '#6b9e5a',
    traits: ['Soft-spoken', 'Tangential', 'Sharper than she sounds'],
    interior: {
      want: 'To catalogue the whole Thornwood before someone clears it for timber.',
      fear: 'Being the one who supplied the poison, whoever ends up using it.',
      secret: 'She has been selling silverleaf to a buyer she has never met, in quantities that are not medicinal.',
      wound: 'Poachers took her teacher\'s hands. The teacher lived.',
    },
    managedResource: 'herbs',
    dialogue: {
      greetings: [
        'Oh — you startled the bees. They will forgive you. They usually do not.',
        'Careful of that one. It looks like feverfew and it very much is not.',
        'You came all this way. The path is terrible. I keep it terrible on purpose.',
      ],
      work: {
        default: 'Silverleaf is early this year. Everything is early. I do not think that is good news.',
      },
      personal: {
        default: 'Plants do not lie to you. They will kill you, but they are honest about it first.',
      },
      rumor: {
        default:
          'Someone has been taking rare reagents out of the Thornwood at night. Not poachers — poachers are loud. These leave the paths tidy.',
      },
    },
    favoriteGifts: ['herbs', 'fruit', 'water'],
    hatedGifts: ['arms'],
    opinions: [
      { npcId: 'elena', opinion: 'ally', reason: 'Elena turns her herbs into cures and credits her by name every time.' },
      { npcId: 'beatrix', opinion: 'ally', reason: 'The almshouse takes her herbs at cost and she has never once been asked to justify a price.' },
    ],
    bondable: true,
    initialRelationship: { affection: 16, trust: 14, respect: 6, desire: 4 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'elena',
    name: 'Elena',
    title: 'The Sage of Elixirs',
    role: 'Chief Apothecary of Valenreach',
    district: 'cathedral_hill',
    facility: 'apothecary_hall',
    faction: 'church',
    rarity: 'SR',
    portraitUrl: '/characters/elena_scheherazade.png',
    backgroundUrl: '/characters/backgrounds/sorceress_background.webp',
    themeColor: '#9b6ec7',
    traits: ['Clinical', 'Curious', 'Detached', 'Guilty'],
    interior: {
      want: 'A cure for the Purple Ague before it comes back, which it will.',
      fear: 'Being asked to certify something false again, and saying yes again.',
      secret: 'She certified the aqueduct water clean during the Drought under pressure from the court. She knew it was not.',
      wound: 'Eleven hundred people died of something she had named and could not treat.',
    },
    managedResource: 'medicine',
    dialogue: {
      greetings: [
        'Hold still. No — genuinely, hold still, you have a rash and I am curious about it.',
        'Sit. Drink that. Do not ask what is in it; the answer will not improve the taste.',
        'You are the only person who visits who is not already dying. It is oddly restful.',
      ],
      work: {
        default: 'Fourteen vials this week. Demand for medicine is the most honest measure of a kingdom there is.',
      },
      personal: {
        default: 'I study you the way I study a reagent. I want to be clear that I enjoy it.',
        byMood: {
          Hurt: 'I signed it. That is the whole answer. I have had three years to find a better one.',
        },
      },
      rumor: {
        default:
          'The Ague did not start in the Ashes. It started at the cisterns. I have the dates. I have always had the dates.',
      },
    },
    favoriteGifts: ['herbs', 'medicine', 'luxuries'],
    hatedGifts: ['fish'],
    opinions: [
      { npcId: 'mira', opinion: 'rival', reason: 'Mira has never forgiven the certification, and Elena has never argued that she should.' },
      { npcId: 'lyra', opinion: 'ally', reason: 'Her supply line and her conscience both run through the Thornwood.' },
    ],
    bondable: true,
    initialRelationship: { affection: 12, trust: 10, respect: 16, desire: 6 },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'elare',
    name: 'Elare',
    title: 'The Archive Keeper',
    role: 'Keeper of the Royal Archive',
    district: 'crown_quarter',
    facility: 'royal_archive',
    faction: 'crown',
    rarity: 'R',
    portraitUrl: '/characters/valerius_sylvia.png',
    backgroundUrl: '/characters/backgrounds/consort_background.webp',
    themeColor: '#c9b28a',
    traits: ['Quiet', 'Exact', 'Discreet'],
    interior: {
      want: 'To finish the Drought index before someone orders it destroyed.',
      fear: 'Being ordered to destroy it and complying.',
      secret: 'She has already copied the sensitive volumes. They are not in the archive.',
      wound: 'She has read what happened to everyone who asked about the sluice order.',
    },
    managedResource: 'cloth',
    dialogue: {
      greetings: [
        'Quietly, please. Not for me — for the paper.',
        'You want a name, a date, or a lineage. It is always one of the three.',
        'You came back. Most people ask once, get frightened, and do not.',
      ],
      work: {
        default: 'Forty volumes indexed. Three thousand to go. I will be dead first and the work will be worth it anyway.',
      },
      personal: {
        default: 'I know more about you than you do. You arrived in the influx. There is a ledger. There is always a ledger.',
      },
      rumor: {
        default:
          'The Drought volumes for that summer are complete except for eleven days in the melt. Eleven days, cut out with a blade.',
      },
    },
    favoriteGifts: ['cloth', 'fruit', 'medicine'],
    hatedGifts: ['arms', 'contraband'],
    opinions: [
      { npcId: 'seraphine', opinion: 'ally', reason: 'The queen has never once asked her to lose a document.' },
      { npcId: 'vesper', opinion: 'ally', reason: 'They trade records for silence, and neither has ever broken it.' },
    ],
    bondable: true,
    initialRelationship: { affection: 6, trust: 12, respect: 4, desire: 2 },
  },

  /* ---------------------------------------------------------------- *
   * World figures — not bondable. They gate careers and drive the plot.
   * ---------------------------------------------------------------- */
  {
    id: 'valerius',
    name: 'Commander Valerius',
    title: 'Shield of the Realm',
    role: 'Captain of the City Guard',
    district: 'garrison',
    facility: 'garrison_walls',
    faction: 'military',
    rarity: 'SR',
    portraitUrl: '/characters/valerius_lathel.png',
    backgroundUrl: '/characters/backgrounds/knight_background.webp',
    themeColor: '#5d6f8a',
    traits: ['Severe', 'Principled', 'Tired'],
    interior: {
      want: 'A garrison budget that survives one council session intact.',
      fear: 'A succession war fought inside his own walls.',
      secret: 'He has refused two direct orders from Ashgrave and logged neither.',
      wound: 'He gave the order to close the river gate during the Drought riots.',
    },
    managedResource: 'arms',
    dialogue: {
      greetings: ['State your business.', 'You again. Be brief, the walls do not inspect themselves.'],
      work: { default: 'Walls hold. Pay does not. Ask the council why, and take a witness.' },
      personal: { default: 'I have no interest in being liked. I have considerable interest in being obeyed.' },
      rumor: { default: 'Private levies on noble land. I have reported it three times. Three times it has been filed.' },
    },
    favoriteGifts: ['arms', 'tools'],
    hatedGifts: ['contraband'],
    opinions: [{ npcId: 'claire', opinion: 'ally', reason: 'The ninth is the only company that has never given him cause.' }],
    bondable: false,
  },

  {
    id: 'silas',
    name: 'Guildmaster Silas',
    title: 'The Golden Scales',
    role: 'President of the Merchant Consortium',
    district: 'bourse',
    facility: 'bourse_imports',
    faction: 'guilds',
    rarity: 'SR',
    portraitUrl: '/characters/silas_olstein.png',
    backgroundUrl: '/characters/backgrounds/blacksmith_background.webp',
    themeColor: '#c2903f',
    traits: ['Genial', 'Ruthless', 'Patient'],
    interior: {
      want: 'A guild monopoly on grain imports written into law.',
      fear: 'A king who can read a contract.',
      secret: 'He brokered the outer valley purchases and took a commission on every one.',
      wound: 'None he would admit to. He considers that an achievement.',
    },
    managedResource: 'luxuries',
    dialogue: {
      greetings: ['Ah! The industrious young man. Sit, sit. Everything is negotiable.'],
      work: { default: 'Trade is excellent. For someone. It is always excellent for someone.' },
      personal: { default: 'I like you. Do not mistake that for an advantage — I like most people I am billing.' },
      rumor: { default: 'The consortium does not discuss its clients. That is precisely why it has them.' },
    },
    favoriteGifts: ['luxuries', 'contraband'],
    hatedGifts: ['bread'],
    opinions: [{ npcId: 'rin', opinion: 'rival', reason: 'She wants his board seat and he has noticed.' }],
    bondable: false,
  },

  {
    id: 'torvin',
    name: 'Master Torvin',
    title: 'The Iron Sovereign',
    role: 'Grand Blacksmith of the Emberworks',
    district: 'emberworks',
    facility: 'great_foundry',
    faction: 'guilds',
    rarity: 'R',
    portraitUrl: '/characters/valerius_lathel.png',
    backgroundUrl: '/characters/backgrounds/blacksmith_background.webp',
    themeColor: '#b5592e',
    traits: ['Gruff', 'Exacting', 'Fair'],
    interior: {
      want: 'Ore that has not been watered down by three middlemen.',
      fear: 'Arming both sides of something.',
      secret: 'He has been filling an arms order with no buyer named on it.',
      wound: 'He forged the gate that was closed during the riots.',
    },
    managedResource: 'tools',
    dialogue: {
      greetings: ['Do not touch anything glowing. Now — what do you need.'],
      work: { default: 'Ore is poor. Tools are good anyway. That difference is thirty years of my life.' },
      personal: { default: 'Talk while I work or do not talk. The anvil is not negotiable.' },
      rumor: { default: 'Large arms order. No house mark, no requisition, paid in advance. I have taken it. I am not proud.' },
    },
    favoriteGifts: ['iron_ore', 'tools', 'bread'],
    hatedGifts: ['luxuries'],
    opinions: [{ npcId: 'claire', opinion: 'ally', reason: 'She pays for the ninth\'s repairs out of her own pocket. He undercharges her for it.' }],
    bondable: false,
  },

  {
    id: 'bran',
    name: 'Old Bran',
    title: 'The Netmaster',
    role: 'Harbor Master of the Wharfs',
    district: 'wharfs',
    facility: 'harbor_fishery',
    faction: 'commons',
    rarity: 'R',
    portraitUrl: '/characters/silas_olstein.png',
    backgroundUrl: '/characters/backgrounds/bathhouse_lady_background.webp',
    themeColor: '#4f7d8c',
    traits: ['Weathered', 'Talkative', 'Watchful'],
    interior: {
      want: 'To die on the water rather than in a bed.',
      fear: 'That his sons are running for the Syndicate.',
      secret: 'His sons are running for the Syndicate. He has known for a year.',
      wound: 'He pulled bodies out of the river for six weeks after the riots.',
    },
    managedResource: 'fish',
    dialogue: {
      greetings: ['Ha! The landsman returns. Mind the ice on the boards.'],
      work: { default: 'Nets are fair. Customs are worse. That is the whole report, every day, for forty years.' },
      personal: { default: 'I have been on this water longer than you have been alive. Ask me anything but that.' },
      rumor: { default: 'Barges coming in at night riding low and leaving empty. Nobody ships nothing at a loss.' },
    },
    favoriteGifts: ['fish', 'bread', 'tools'],
    hatedGifts: ['luxuries'],
    opinions: [{ npcId: 'vesper', opinion: 'rival', reason: 'She has his sons, and they both know it.' }],
    bondable: false,
  },
];

export const NPCS_BY_ID: Record<string, NpcDefinition> = Object.fromEntries(
  NPC_DEFINITIONS.map((npc) => [npc.id, npc]),
);

export function getNpc(id: string): NpcDefinition | undefined {
  return NPCS_BY_ID[id];
}

export const BONDABLE_NPCS: NpcDefinition[] = NPC_DEFINITIONS.filter((npc) => npc.bondable);
