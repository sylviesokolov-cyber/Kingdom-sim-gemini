import type { DistrictId, FactionId, Rarity } from './core';

export type NpcStatus =
  | 'Healthy'
  | 'Fatigued'
  | 'Sick'
  | 'Injured'
  | 'Critical'
  | 'Imprisoned'
  | 'Missing'
  | 'Deceased';

/** Derived every frame from condition + relationship + memory. Never stored. */
export type Mood = 'Content' | 'Warm' | 'Tired' | 'Worried' | 'Hurt' | 'Cold' | 'Jealous' | 'Elated';

export type BondTier = 'Stranger' | 'Acquainted' | 'Warm' | 'Close' | 'Devoted' | 'Sworn';

export type Opinion = 'ally' | 'neutral' | 'rival' | 'nemesis';

/** How one NPC feels about another, and why. The reason is shown in her dialogue. */
export interface NpcOpinion {
  npcId: string;
  opinion: Opinion;
  reason: string;
}

/**
 * The five relationship dimensions. Affection alone is a slot machine; these
 * together let a companion adore the player and still refuse him.
 */
export interface Relationship {
  affection: number;
  trust: number;
  respect: number;
  desire: number;
  resentment: number;
  /** Rises when the player advances a bond with one of her rivals. */
  jealousy: number;
  /** Gacha duplicates / questline completion. Raises the affection cap. */
  resonance: number;
}

/** An append-only record of something the player did that she remembers. */
export interface NpcMemory {
  day: number;
  kind: 'kindness' | 'betrayal' | 'promise' | 'promise_broken' | 'gift' | 'neglect' | 'rescue' | 'exploitation';
  summary: string;
  /** How strongly this colors her mood, 0-100. Decays for minor entries. */
  weight: number;
}

export interface NpcCondition {
  health: number;
  maxHealth: number;
  energy: number;
  status: NpcStatus;
  illness?: string;
  /** Consecutive days in the current non-Healthy status. */
  daysInStatus: number;
  /** Resource id that cures her current illness, if any. */
  requiredTreatment?: string;
}

/** Dialogue variants keyed by mood, with a required default. */
export interface DialogueSet {
  default: string;
  byMood?: Partial<Record<Mood, string>>;
}

export interface NpcDialogue {
  greetings: string[];
  work: DialogueSet;
  personal: DialogueSet;
  rumor: DialogueSet;
  plea?: DialogueSet;
}

/** The interior life that makes her a person rather than a resource button. */
export interface NpcInterior {
  /** A goal she pursues independently of the player. */
  want: string;
  /** What would break her. Read by crisis and confrontation events. */
  fear: string;
  /** Discoverable, with consequences for knowing and for telling. */
  secret: string;
  /** What already happened to her. Shapes her voice. */
  wound: string;
}

/** Static authored definition of a character. Content data — no logic. */
export interface NpcDefinition {
  id: string;
  name: string;
  title: string;
  role: string;
  district: DistrictId;
  /** Facility id whose output she governs. */
  facility: string;
  faction: FactionId;
  rarity: Rarity;

  portraitUrl: string;
  stageUrl?: string;
  backgroundUrl?: string;
  themeColor: string;

  /** Displayed as the companion-panel tags, and read by the engine. */
  traits: string[];
  interior: NpcInterior;

  /** Resource id whose facility she governs. Output lives on the resource. */
  managedResource: string;

  dialogue: NpcDialogue;
  favoriteGifts: string[];
  hatedGifts: string[];
  opinions: NpcOpinion[];

  /** Is she romanceable, or a world figure only? */
  bondable: boolean;
  /** Starting relationship values, if she does not begin as a stranger. */
  initialRelationship?: Partial<Relationship>;
  initialCondition?: Partial<NpcCondition>;
}

/** Runtime state for one NPC. Persisted in saves. */
export interface NpcState {
  id: string;
  condition: NpcCondition;
  relationship: Relationship;
  memories: NpcMemory[];
  /** Temporary multiplier on her facility output for today only. */
  efficiencyModifier: number;
  /** Is she currently in the player's active retinue? */
  recruited: boolean;
}

/** A definition joined with its runtime state, for convenience in the UI. */
export interface Npc extends NpcDefinition {
  state: NpcState;
}
