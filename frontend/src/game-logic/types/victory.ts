/**
 * @file victory.ts
 * @description Type definitions for the Diplomacy victory condition check.
 */

/** Result of a victory condition check */
export interface VictoryResult {
  /** Whether the game has been won */
  gameOver: boolean;
  /** The winning nation (null if no winner yet) */
  winner: string | null;
  /** Number of supply centres the winner controls */
  winnerSCCount: number;
  /** Supply centre counts per nation */
  scCounts: Record<string, number>;
}
