/**
 * @file resolution.ts
 * @description Type definitions for the Diplomacy order resolution result.
 */

/** Outcome of a MOVE order */
export interface MoveResult {
  /** Unit ID */
  unit: string;
  /** Origin territory */
  from: string;
  /** Destination territory */
  to: string;
  /** Whether the move succeeded */
  success: boolean;
  /** Whether this move was via convoy */
  viaConvoy: boolean;
}

/** Outcome of a unit that HOLDs (or supports/convoys while stationary) */
export interface HoldResult {
  /** Unit ID */
  unit: string;
  /** Territory where the unit is */
  territory: string;
  /** Whether the unit was dislodged */
  dislodged: boolean;
}

/** Outcome of a SUPPORT order */
export interface SupportResult {
  /** Unit ID of the supporting unit */
  unit: string;
  /** Territory being supported or destination of supported move */
  target: string;
  /** Whether the support was cut */
  cut: boolean;
}

/** A dislodged unit */
export interface DislodgedUnit {
  /** Unit ID */
  unit: string;
  /** Territory the unit was dislodged from */
  from: string;
  /** Unit ID of the attacker that dislodged this unit */
  attacker: string;
}

/** A failed contest for a territory (standoff) */
export interface BounceResult {
  /** The contested territory */
  territory: string;
  /** Territory IDs of the units that bounced */
  contestants: string[];
}

/**
 * Complete result of order resolution for one movement phase.
 */
export interface ResolutionResult {
  /** All move order outcomes */
  moves: MoveResult[];
  /** All hold/stationary outcomes */
  holds: HoldResult[];
  /** All support order outcomes */
  supports: SupportResult[];
  /** All dislodged units */
  dislodged: DislodgedUnit[];
  /** All bounces (standoffs) */
  bounces: BounceResult[];
}
