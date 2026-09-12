import type { FactionId } from './core';

export interface FactionRelation {
  factionId: FactionId;
  /** -100 hostile to +100 allied. */
  standing: number;
}

export interface RedLine {
  id: string;
  description: string;
  /** Opinion penalty applied when this line is crossed. */
  penalty: number;
}

export interface FactionDefinition {
  id: FactionId;
  name: string;
  description: string;
  /** What they are trying to achieve, shown in the council screen. */
  wants: string;
  /** NPC id of the faction leader, if one exists. The commons have none. */
  leaderNpcId?: string;
  relations: FactionRelation[];
  redLines: RedLine[];
  color: string;
}

/** An unmet demand generated from kingdom state, not authored. */
export interface FactionNeed {
  id: string;
  description: string;
  /** 0-100. High urgency needs drive faction events. */
  urgency: number;
}

export interface FactionState {
  id: FactionId;
  /** How they feel about the player, 0-100. */
  opinion: number;
  /** How much they can actually do about it, 0-100. */
  power: number;
  /** Internal cohesion. Low stability splinters the faction. */
  stability: number;
  needs: FactionNeed[];
  /** Day a faction crisis began, if one is active. */
  crisisStartedDay?: number;
}

/** A change to faction state produced by a player action or event. */
export interface FactionImpact {
  factionId: FactionId;
  opinion?: number;
  power?: number;
  stability?: number;
}
