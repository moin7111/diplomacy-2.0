/**
 * @file retreat.ts
 * @description Type definitions for the Diplomacy retreat phase.
 */

import type { CoastSpecifier } from './territory';

/** A retreat order issued by a player for a dislodged unit */
export interface RetreatOrder {
  /** Territory the dislodged unit is currently in */
  unit: string;
  /** Territory the unit is retreating to, or 'disband' to remove the unit */
  target: string;
  /** Coast specifier for fleets retreating to dual-coast territories */
  coast?: CoastSpecifier;
}

/** Outcome of a single retreat attempt */
export interface RetreatOutcome {
  /** Territory the dislodged unit retreated from */
  unit: string;
  /** Territory the unit retreated to (undefined if destroyed) */
  to?: string;
  /** Whether the retreat succeeded */
  success: boolean;
  /** Reason for failure if unsuccessful */
  reason?: 'destroyed_standoff' | 'destroyed_no_order' | 'invalid_destination' | 'disbanded';
}

/** Complete result of retreat resolution */
export interface RetreatResult {
  /** All retreat outcomes */
  retreats: RetreatOutcome[];
  /** Units that were destroyed (failed retreat or disbanded) */
  destroyed: string[];
  /** Units that successfully relocated */
  relocated: { unit: string; from: string; to: string }[];
}
