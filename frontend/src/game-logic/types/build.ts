/**
 * @file build.ts
 * @description Type definitions for the Diplomacy build/adjustment phase (Winter).
 */

import type { CoastSpecifier } from './territory';

/** Result of calculating how many units a nation may build or must disband */
export interface BuildCalculation {
  /** The nation this calculation is for */
  nation: string;
  /** Home supply centres belonging to this nation */
  homeSCs: string[];
  /** All supply centres currently controlled by this nation */
  controlledSCs: string[];
  /** Number of units the nation currently has on the board */
  currentUnitCount: number;
  /** 
   * Difference: controlledSCs.length - currentUnitCount.
   * Positive = the nation may build that many units.
   * Negative = the nation must disband that many units.
   * Zero = no adjustment needed.
   */
  diff: number;
  /** Home SCs that are available for building (unoccupied by any unit) */
  availableHomeSCs: string[];
}

/** A build or disband order */
export interface BuildOrder {
  /** The type of adjustment */
  type: 'build' | 'disband';
  /** The nation issuing the order */
  nation: string;
  /** For build: territory to place the unit. For disband: territory of unit to remove. */
  territory: string;
  /** For build: the type of unit to create */
  unitType?: 'army' | 'fleet';
  /** For build: coast specifier if building a fleet on a dual-coast territory */
  coast?: CoastSpecifier;
}

/** Complete result of the build/adjustment phase */
export interface BuildResult {
  /** Successfully built units */
  builds: { nation: string; territory: string; unitType: 'army' | 'fleet'; coast?: CoastSpecifier }[];
  /** Successfully disbanded units */
  disbands: { nation: string; territory: string }[];
  /** Orders that were invalid or rejected */
  invalid: { order: BuildOrder; reason: string }[];
}
