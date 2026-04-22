/**
 * @file victory.ts
 * @description Victory condition check for Diplomacy.
 *
 * Standard Diplomacy victory condition:
 *   - A player who controls 18 or more of the 34 supply centres wins the game
 *     (solo victory).
 *   - If no player controls 18+ SCs, the game continues.
 *   - In certain variants, players may agree to a draw, but this module only
 *     checks the mechanical solo victory condition.
 */

import type { VictoryResult } from './types/victory';

/** The number of supply centres required for a solo victory */
export const VICTORY_SC_THRESHOLD = 18;

/** The total number of supply centres on the board */
export const TOTAL_SUPPLY_CENTRES = 34;

/**
 * Checks whether any nation has achieved a solo victory.
 *
 * @param controlledSCsPerNation  Record mapping nation name → array of SC territory IDs
 * @returns                       VictoryResult with winner info or null winner if no victor
 */
export function checkVictory(
  controlledSCsPerNation: Record<string, string[]>,
): VictoryResult {
  const scCounts: Record<string, number> = {};
  let winner: string | null = null;
  let winnerSCCount = 0;

  for (const [nation, scs] of Object.entries(controlledSCsPerNation)) {
    const count = scs.length;
    scCounts[nation] = count;

    if (count >= VICTORY_SC_THRESHOLD) {
      // If multiple nations somehow exceed 18 (shouldn't happen in standard play),
      // the one with more SCs wins. If equal, both are reported but in practice
      // this is impossible in a correctly adjudicated game.
      if (winner === null || count > winnerSCCount) {
        winner = nation;
        winnerSCCount = count;
      }
    }
  }

  return {
    gameOver: winner !== null,
    winner,
    winnerSCCount: winner !== null ? winnerSCCount : 0,
    scCounts,
  };
}
