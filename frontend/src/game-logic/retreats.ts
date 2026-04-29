/**
 * @file retreats.ts
 * @description Retreat phase resolution for Diplomacy.
 *
 * After a movement phase, dislodged units must retreat or be disbanded.
 * A unit may retreat to any adjacent territory that:
 *   1. Is not occupied by another unit
 *   2. Was not the territory from which the attacker came
 *   3. Was not a standoff territory (bounce) during the just-resolved phase
 *   4. Is reachable by the unit type (army: land/coast; fleet: coast/sea)
 *
 * If two or more dislodged units retreat to the same territory, all of them
 * are destroyed (retreat standoff).
 */

import type { Unit } from './types/unit';
import type { ResolutionResult } from './types/resolution';
import type { RetreatOrder, RetreatResult, RetreatOutcome } from './types/retreat';
import { territoryMap, areAdjacentForFleet } from './territories';

/**
 * Computes the valid retreat destinations for a dislodged unit.
 *
 * @param dislodgedUnit   The unit that was dislodged
 * @param result          The resolution result of the movement phase
 * @param units           All units on the board *after* the movement phase
 *                        (successful moves applied, dislodged units excluded)
 * @returns               Array of territory IDs where the unit may retreat to
 */
export function getRetreatOptions(
  dislodgedUnit: Unit,
  result: ResolutionResult,
  units: Unit[],
): string[] {
  const territory = territoryMap[dislodgedUnit.territory];
  if (!territory) return [];

  // Find the dislodge record to determine where the attacker came from
  const dislodgeRecord = result.dislodged.find(
    (d) => d.unit === dislodgedUnit.id || d.from === dislodgedUnit.territory,
  );

  // The attacker's origin territory — cannot retreat there
  let attackerOrigin: string | undefined;
  if (dislodgeRecord) {
    // Find the successful move that resulted in the dislodgement
    const attackerMove = result.moves.find(
      (m) => m.to === dislodgedUnit.territory && m.success,
    );
    if (attackerMove) {
      attackerOrigin = attackerMove.from;
    }
  }

  // Territories with a standoff (bounce) this phase — cannot retreat there
  const bounceSet = new Set(result.bounces.map((b) => b.territory));

  // Territories occupied by units after resolution — cannot retreat there
  const occupiedSet = new Set(units.map((u) => u.territory));

  // Also add territories that have successful incoming moves
  // (those territories will be occupied after the movement phase)
  for (const move of result.moves) {
    if (move.success) {
      occupiedSet.add(move.to);
    }
  }

  // Get all adjacent territories and filter
  const candidates: string[] = [];

  for (const adjId of territory.adjacencies) {
    const adj = territoryMap[adjId];
    if (!adj) continue;

    // 1. Cannot retreat to occupied territory
    if (occupiedSet.has(adjId)) continue;

    // 2. Cannot retreat to the territory the attacker came from
    if (adjId === attackerOrigin) continue;

    // 3. Cannot retreat to a bounce territory
    if (bounceSet.has(adjId)) continue;

    // 4. Unit type must be able to enter the territory
    if (dislodgedUnit.type === 'army') {
      if (adj.type === 'sea') continue;
    } else {
      // Fleet: cannot enter land, and must have valid fleet adjacency
      if (adj.type === 'land') continue;
      const fromId = dislodgedUnit.coast
        ? `${dislodgedUnit.territory}-${dislodgedUnit.coast}`
        : dislodgedUnit.territory;
      if (!areAdjacentForFleet(fromId, adjId)) continue;
    }

    candidates.push(adjId);
  }

  return candidates;
}

/**
 * Resolves all retreat orders for a phase.
 *
 * @param retreatOrders   The retreat (or disband) orders submitted by players
 * @param dislodgedUnits  The units that were dislodged in the movement phase
 * @param result          The resolution result of the movement phase
 * @param currentUnits    All units remaining on the board after successful moves
 * @returns               RetreatResult with outcomes, destroyed, and relocated lists
 */
export function resolveRetreats(
  retreatOrders: RetreatOrder[],
  dislodgedUnits: Unit[],
  result: ResolutionResult,
  currentUnits: Unit[],
): RetreatResult {
  const outcomes: RetreatOutcome[] = [];
  const destroyed: string[] = [];
  const relocated: { unit: string; from: string; to: string }[] = [];

  // Build a map of dislodged units by territory
  const dislodgedMap = new Map<string, Unit>();
  for (const u of dislodgedUnits) {
    dislodgedMap.set(u.territory, u);
  }

  // Build a map of retreat orders by unit territory
  const orderMap = new Map<string, RetreatOrder>();
  for (const order of retreatOrders) {
    orderMap.set(order.unit, order);
  }

  // Phase 1: Validate all retreat orders and collect intended destinations
  const intendedRetreats: { unit: Unit; target: string }[] = [];

  for (const unit of dislodgedUnits) {
    const order = orderMap.get(unit.territory);

    if (!order) {
      // No order → unit is destroyed
      outcomes.push({
        unit: unit.territory,
        success: false,
        reason: 'destroyed_no_order',
      });
      destroyed.push(unit.territory);
      continue;
    }

    // Explicit disband
    if (order.target === 'disband') {
      outcomes.push({
        unit: unit.territory,
        success: false,
        reason: 'disbanded',
      });
      destroyed.push(unit.territory);
      continue;
    }

    // Validate destination
    const validOptions = getRetreatOptions(unit, result, currentUnits);
    if (!validOptions.includes(order.target)) {
      outcomes.push({
        unit: unit.territory,
        success: false,
        reason: 'invalid_destination',
      });
      destroyed.push(unit.territory);
      continue;
    }

    intendedRetreats.push({ unit, target: order.target });
  }

  // Phase 2: Check for retreat standoffs (multiple units retreating to same territory)
  const retreatTargetCount = new Map<string, number>();
  for (const r of intendedRetreats) {
    retreatTargetCount.set(r.target, (retreatTargetCount.get(r.target) ?? 0) + 1);
  }

  for (const r of intendedRetreats) {
    const count = retreatTargetCount.get(r.target) ?? 0;
    if (count > 1) {
      // Standoff → all units retreating there are destroyed
      outcomes.push({
        unit: r.unit.territory,
        success: false,
        reason: 'destroyed_standoff',
      });
      destroyed.push(r.unit.territory);
    } else {
      outcomes.push({
        unit: r.unit.territory,
        to: r.target,
        success: true,
      });
      relocated.push({
        unit: r.unit.territory,
        from: r.unit.territory,
        to: r.target,
      });
    }
  }

  return { retreats: outcomes, destroyed, relocated };
}
