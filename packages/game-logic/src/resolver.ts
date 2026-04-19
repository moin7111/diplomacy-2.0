/**
 * @file resolver.ts
 * @description Diplomacy order resolution engine implementing the Guess Algorithm
 * from DATC v3.0 section 5.F. This is the core adjudication engine that
 * determines the outcome of all orders in a movement phase.
 *
 * Algorithm reference: https://webdiplomacy.net/doc/DATC_v3_0.html#5
 *
 * Rule preferences follow DATC recommendations:
 * - Multi-route convoy: all routes must be disrupted (post-1971)
 * - Convoy paradox: Szykman rule
 * - Convoy to adjacent: 2000/2023 rules (intent via own fleet)
 * - Support cut via convoy on self: support NOT cut (creator's ruling)
 */

import type { Order } from './types/order';
import type { Unit } from './types/unit';
import type { Territory } from './types/territory';
import type { ResolutionResult, MoveResult, HoldResult, SupportResult, DislodgedUnit, BounceResult } from './types/resolution';
import { territoryMap, areAdjacent, areAdjacentForFleet } from './territories';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface InternalOrder {
  idx: number;
  unit: Unit;
  order: Order;
  /** The effective order type after legality pre-processing */
  effectiveType: Order['type'];
  /** Is this order legal (not ignored)? */
  legal: boolean;
  // Guess algorithm state
  resolved: boolean;
  resolution: boolean;
  visited: boolean;
}

// ---------------------------------------------------------------------------
// Helper: extract base territory ID from coast-qualified ID
// ---------------------------------------------------------------------------

function baseId(id: string): string {
  return id.split('-')[0];
}

// ---------------------------------------------------------------------------
// The Resolver class — encapsulates all resolution state
// ---------------------------------------------------------------------------

class DiplomacyResolver {
  private orders: InternalOrder[] = [];
  private unitByTerritory: Map<string, Unit> = new Map();
  private orderByTerritory: Map<string, number> = new Map(); // territory → order index
  private tMap: Record<string, Territory>;

  // Guess algorithm globals
  private cycle: number[] = [];
  private recursionHits = 0;
  private guessBased = false;

  constructor(
    rawOrders: Order[],
    units: Unit[],
    _territories: readonly Territory[],
  ) {
    this.tMap = territoryMap;

    // Build unit lookup
    for (const u of units) {
      this.unitByTerritory.set(u.territory, u);
    }

    // Pre-process orders: match to units, check legality
    this.preprocessOrders(rawOrders, units);
  }

  // =========================================================================
  // PRE-PROCESSING
  // =========================================================================

  private preprocessOrders(rawOrders: Order[], units: Unit[]): void {
    const assignedTerritories = new Set<string>();

    // Process submitted orders
    for (const order of rawOrders) {
      const terr = baseId(order.unit);
      const unit = this.unitByTerritory.get(terr);

      // Skip if no unit at this territory
      if (!unit) continue;

      // Skip if nation mismatch (ordering foreign unit)
      if (order.nation && order.nation !== unit.nation) continue;

      // Skip duplicate orders for same territory
      if (assignedTerritories.has(terr)) continue;
      assignedTerritories.add(terr);

      const legal = this.isLegalOrder(order, unit);
      const idx = this.orders.length;

      this.orders.push({
        idx,
        unit,
        order,
        effectiveType: legal ? order.type : 'hold',
        legal,
        resolved: false,
        resolution: false,
        visited: false,
      });

      this.orderByTerritory.set(terr, idx);
    }

    // Assign default hold orders to unordered units
    for (const unit of units) {
      if (!assignedTerritories.has(unit.territory)) {
        const idx = this.orders.length;
        const holdOrder: Order = { unit: unit.territory, type: 'hold' };
        this.orders.push({
          idx,
          unit,
          order: holdOrder,
          effectiveType: 'hold',
          legal: true,
          resolved: false,
          resolution: false,
          visited: false,
        });
        this.orderByTerritory.set(unit.territory, idx);
        assignedTerritories.add(unit.territory);
      }
    }
  }

  /**
   * Determines if an order is legal (i.e., should not be completely ignored).
   * Illegal orders are converted to hold during pre-processing.
   */
  private isLegalOrder(order: Order, unit: Unit): boolean {
    switch (order.type) {
      case 'hold':
        return true;

      case 'move': {
        if (!order.target) return false;
        const targetBase = baseId(order.target);
        const target = this.tMap[targetBase];
        if (!target) return false;

        // Move to self
        if (targetBase === unit.territory) return false;

        // Army to sea
        if (unit.type === 'army' && target.type === 'sea') return false;

        // Fleet to land
        if (unit.type === 'fleet' && target.type === 'land') return false;

        // Fleet adjacency check
        if (unit.type === 'fleet') {
          const fromLoc = unit.coast ? `${unit.territory}-${unit.coast}` : unit.territory;
          return areAdjacentForFleet(fromLoc, order.target);
        }

        // Army: adjacent is always legal
        if (areAdjacent(unit.territory, targetBase)) return true;

        // Army non-adjacent: legal only if convoy route could exist
        // (both origin and target must be coastal, and there must be
        // at least one fleet ordered to convoy this army)
        const fromT = this.tMap[unit.territory];
        if (fromT.type !== 'coast' || target.type !== 'coast') return false;

        // Check if any fleet has been ordered to convoy this army
        // We check this lazily — just check if origin & dest are coastal.
        // The actual convoy path validation happens during resolution.
        return true;
      }

      case 'support': {
        if (!order.supportTarget) return false;
        const stBase = baseId(order.supportTarget);
        if (!this.tMap[stBase]) return false;

        // Support targeting own territory is illegal (6.D.34)
        if (stBase === unit.territory) return false;

        if (order.supportDestination) {
          // Support-move: supporter must be able to reach the destination
          const sdBase = baseId(order.supportDestination);
          if (!this.tMap[sdBase]) return false;
          // Supporting into own territory is illegal
          if (sdBase === unit.territory) return false;

          if (unit.type === 'fleet') {
            const fromLoc = unit.coast ? `${unit.territory}-${unit.coast}` : unit.territory;
            return areAdjacentForFleet(fromLoc, order.supportDestination);
          } else {
            // Army can't support into sea
            const sdT = this.tMap[sdBase];
            if (sdT.type === 'sea') return false;
            return areAdjacent(unit.territory, sdBase);
          }
        } else {
          // Support-hold: supporter must be adjacent to the target
          if (unit.type === 'fleet') {
            const fromLoc = unit.coast ? `${unit.territory}-${unit.coast}` : unit.territory;
            return areAdjacentForFleet(fromLoc, order.supportTarget);
          } else {
            const stT = this.tMap[stBase];
            if (stT.type === 'sea') return false;
            return areAdjacent(unit.territory, stBase);
          }
        }
      }

      case 'convoy': {
        if (!order.convoyFrom || !order.convoyTo) return false;
        if (unit.type !== 'fleet') return false;
        const locT = this.tMap[unit.territory];
        if (locT.type !== 'sea') return false;
        return true;
      }
    }
    return false;
  }

  // =========================================================================
  // RESOLUTION ALGORITHM (DATC 5.F — Guess Algorithm)
  // =========================================================================

  resolveAll(): void {
    for (let i = 0; i < this.orders.length; i++) {
      this.resolve(i);
    }
  }

  /**
   * Generic resolve function implementing the guess algorithm.
   * Returns true if the order succeeds, false if it fails.
   */
  private resolve(idx: number): boolean {
    const o = this.orders[idx];

    if (o.resolved || this.cycle.includes(idx)) {
      if (this.cycle.includes(idx)) {
        this.guessBased = true;
      }
      return o.resolution;
    }

    if (o.visited) {
      // Cyclic dependency detected
      this.cycle.push(idx);
      this.guessBased = true;
      this.recursionHits++;
      return o.resolution;
    }

    o.visited = true;
    const oldCycleLen = this.cycle.length;
    const oldGuessBased = this.guessBased;
    this.guessBased = false;
    const oldRecursionHits = this.recursionHits;

    // Initial guess: order fails
    o.resolution = false;
    const firstResult = this.adjudicate(idx);

    if (!this.guessBased) {
      // No cyclic dependency — take this result
      this.guessBased = oldGuessBased;
      o.resolution = firstResult;
      o.resolved = true;
      o.visited = false;
      return firstResult;
    }

    if (this.cycle.includes(idx)) {
      this.recursionHits--;

      if (this.recursionHits === oldRecursionHits) {
        // We're the ancestor of the whole cycle — try opposite guess
        const cycleOrders = this.cycle.splice(oldCycleLen);

        o.resolution = true; // Opposite guess
        const secondResult = this.adjudicate(idx);

        if (firstResult === secondResult) {
          // Single resolution despite cycle
          this.cycle.splice(oldCycleLen);
          this.guessBased = oldGuessBased;
          o.resolution = firstResult;
          o.resolved = true;
          o.visited = false;
          return firstResult;
        }

        // Two different results — apply backup rule
        // Re-collect cycle orders (second adjudicate may have added to cycle)
        const allCycleOrders = [...new Set([...cycleOrders, ...this.cycle.splice(oldCycleLen)])];
        if (!allCycleOrders.includes(idx)) allCycleOrders.push(idx);

        this.backupRule(allCycleOrders);
        this.guessBased = oldGuessBased;
        o.visited = false;

        // Re-resolve after backup rule
        return this.resolve(idx);
      }
    }

    // Returning from recursion where a cycle was detected, but
    // this order is not the ancestor of the whole cycle
    if (!this.cycle.includes(idx)) {
      this.cycle.push(idx);
    }
    o.resolution = firstResult;
    o.visited = false;
    return firstResult;
  }

  // =========================================================================
  // ADJUDICATION — delegates to type-specific adjudicators
  // =========================================================================

  private adjudicate(idx: number): boolean {
    const o = this.orders[idx];

    // Illegal orders always fail (they're treated as hold, which always "succeeds"
    // in the sense that the unit holds, but the original order fails)
    if (!o.legal) return false;

    switch (o.effectiveType) {
      case 'hold': return false; // A hold order doesn't "succeed" in resolution terms; it just is.
      case 'move': return this.adjudicateMove(idx);
      case 'support': return this.adjudicateSupport(idx);
      case 'convoy': return this.adjudicateConvoy(idx);
    }
    return false;
  }

  // =========================================================================
  // MOVE adjudication (DATC 5.B.1)
  // =========================================================================

  private adjudicateMove(idx: number): boolean {
    const o = this.orders[idx];
    const target = baseId(o.order.target!);

    const atkStr = this.attackStrength(idx);
    if (atkStr === 0) return false;

    // Check for head-to-head battle
    const h2hIdx = this.getHeadToHeadOpponent(idx);

    if (h2hIdx !== -1) {
      // Head-to-head: must beat DEFEND strength of opponent
      const defStr = this.defendStrength(h2hIdx);
      if (atkStr <= defStr) return false;
    } else {
      // Normal move: must beat HOLD strength of destination
      const holdStr = this.holdStrength(target);
      if (atkStr <= holdStr) return false;
    }

    // Must beat PREVENT strength of all competitors for the same destination
    const competitors = this.getCompetitors(idx);
    for (const compIdx of competitors) {
      const prevStr = this.preventStrength(compIdx);
      if (atkStr <= prevStr) return false;
    }

    return true;
  }

  // =========================================================================
  // SUPPORT adjudication (DATC 5.B.2)
  // =========================================================================

  private adjudicateSupport(idx: number): boolean {
    const o = this.orders[idx];

    // Check if support matches
    if (!this.isSupportMatching(idx)) return false;

    // Support is cut if attacked by a unit moving to the supporter's territory
    const supporterTerritory = o.unit.territory;

    for (let i = 0; i < this.orders.length; i++) {
      if (i === idx) continue;
      const attacker = this.orders[i];
      if (attacker.effectiveType !== 'move') continue;
      if (!attacker.legal) continue;
      if (baseId(attacker.order.target!) !== supporterTerritory) continue;

      // Same nationality cannot cut support
      if (attacker.unit.nation === o.unit.nation) continue;

      // The destination of the supported unit must NOT be the area
      // where the attacker came from (defender can't cut support for
      // attack on itself — DATC 5.B.2, test 6.D.15)
      if (o.order.supportDestination) {
        // Support-move: check if supported destination is attacker's origin
        if (baseId(o.order.supportDestination) === attacker.unit.territory) continue;
      } else {
        // Support-hold: check if supported target is attacker's origin
        // Wait: for support-hold, the "destination of the supported unit"
        // doesn't apply in the same way. The supported unit is holding at
        // supportTarget. The attacker is coming from their territory.
        // Support-hold doesn't have a "destination". The rule is about
        // "the destination of the supported unit" — for hold, there's no
        // destination, so this exception doesn't apply.
        // Actually... looking at DATC more carefully: "The destination of
        // the supported unit is not the area of the unit attacking the support"
        // For support-hold, the "destination" is the territory where the
        // supported unit is (it's not moving). So if the attacker comes
        // from that territory... that's an unusual case. Let's follow the
        // standard interpretation: this exception only applies to support-move.
      }

      // Check if the attacker has a valid path
      if (!this.hasPath(i)) continue;

      // Support is cut!
      return false;
    }

    // Check if supporter is dislodged (second condition for support cut)
    // A successful move to the supporter's territory by any unit
    for (let i = 0; i < this.orders.length; i++) {
      if (i === idx) continue;
      const attacker = this.orders[i];
      if (attacker.effectiveType !== 'move') continue;
      if (!attacker.legal) continue;
      if (baseId(attacker.order.target!) !== supporterTerritory) continue;

      if (this.resolve(i)) {
        // Supporter is dislodged — support fails
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if a support order matches the actual orders of the supported unit.
   */
  private isSupportMatching(idx: number): boolean {
    const o = this.orders[idx];
    const stBase = baseId(o.order.supportTarget!);
    const supportedIdx = this.orderByTerritory.get(stBase);

    if (supportedIdx === undefined) return false;
    const supported = this.orders[supportedIdx];

    if (o.order.supportDestination) {
      // Support-move: supported unit must have a matching legal move order
      if (supported.effectiveType !== 'move') return false;
      if (!supported.legal) return false;
      const sdBase = baseId(o.order.supportDestination);
      const actualTarget = baseId(supported.order.target!);
      return sdBase === actualTarget;
    } else {
      // Support-hold: supported unit must NOT have a move order
      // (it can have hold, support, or convoy — anything non-move)
      return supported.effectiveType !== 'move';
    }
  }

  // =========================================================================
  // CONVOY adjudication (DATC 5.B.3)
  // =========================================================================

  private adjudicateConvoy(idx: number): boolean {
    const o = this.orders[idx];

    // Check if this convoy matches an actual army move
    if (!this.isConvoyMatching(idx)) return false;

    // Convoy succeeds if the fleet is not dislodged
    for (let i = 0; i < this.orders.length; i++) {
      if (i === idx) continue;
      const attacker = this.orders[i];
      if (attacker.effectiveType !== 'move') continue;
      if (!attacker.legal) continue;
      if (baseId(attacker.order.target!) !== o.unit.territory) continue;

      // Use adjudicate instead of resolve to avoid cycle issues (DATC 5.D hack)
      if (this.resolve(i)) {
        return false; // Fleet is dislodged, convoy fails
      }
    }

    return true;
  }

  private isConvoyMatching(idx: number): boolean {
    const o = this.orders[idx];
    const fromBase = baseId(o.order.convoyFrom!);
    const toBase = baseId(o.order.convoyTo!);

    // Find the army at convoyFrom
    const armyIdx = this.orderByTerritory.get(fromBase);
    if (armyIdx === undefined) return false;

    const army = this.orders[armyIdx];
    if (army.unit.type !== 'army') return false;
    if (army.effectiveType !== 'move') return false;
    if (!army.legal) return false;
    if (baseId(army.order.target!) !== toBase) return false;

    return true;
  }

  // =========================================================================
  // STRENGTH CALCULATIONS (DATC 5.B)
  // =========================================================================

  /**
   * ATTACK STRENGTH (DATC 5.B.8)
   *
   * - If PATH fails: 0
   * - If destination empty or (no h2h and unit moves away successfully): 1 + supports
   * - If destination has unit of same nationality: 0
   * - Otherwise: 1 + supports from different nationality than destination unit
   */
  private attackStrength(idx: number): number {
    const o = this.orders[idx];
    const target = baseId(o.order.target!);

    // PATH check
    if (!this.hasPath(idx)) return 0;

    // Check destination
    const destUnit = this.unitByTerritory.get(target);
    const destOrderIdx = this.orderByTerritory.get(target);

    const h2hIdx = this.getHeadToHeadOpponent(idx);
    const isHeadToHead = h2hIdx !== -1;

    if (!destUnit) {
      // Destination is empty: 1 + all successful supports
      return 1 + this.countMoveSupports(idx);
    }

    if (!isHeadToHead && destOrderIdx !== undefined) {
      const destOrder = this.orders[destOrderIdx];
      if (destOrder.effectiveType === 'move' && destOrder.legal) {
        // Unit at destination is trying to move
        if (this.resolve(destOrderIdx)) {
          // Unit successfully moves away: destination is effectively empty
          return 1 + this.countMoveSupports(idx);
        }
      }
    }

    // Destination has a unit that stays
    if (destUnit.nation === o.unit.nation) {
      // Same nationality — cannot attack own unit
      return 0;
    }

    // Different nationality — count only supports from nations different than defender
    return 1 + this.countMoveSupportsDifferentNation(idx, destUnit.nation);
  }

  /**
   * HOLD STRENGTH (DATC 5.B.5)
   *
   * - Empty: 0
   * - Unit with successful move: 0
   * - Unit with failed move: 1
   * - Otherwise: 1 + successful hold supports
   */
  private holdStrength(territory: string): number {
    const unit = this.unitByTerritory.get(territory);
    if (!unit) return 0;

    const orderIdx = this.orderByTerritory.get(territory);
    if (orderIdx === undefined) return 1; // Unit with no order holds with strength 1

    const o = this.orders[orderIdx];

    if (o.effectiveType === 'move' && o.legal) {
      // Unit is trying to move
      if (this.resolve(orderIdx)) return 0; // Successfully moves away
      return 1; // Failed move — bare defense, no support
    }

    // Unit is holding/supporting/convoying — can receive hold support
    return 1 + this.countHoldSupports(territory);
  }

  /**
   * DEFEND STRENGTH (DATC 5.B.7)
   * Used only in head-to-head battles.
   * 1 + successful move supports
   */
  private defendStrength(idx: number): number {
    return 1 + this.countMoveSupports(idx);
  }

  /**
   * PREVENT STRENGTH (DATC 5.B.6)
   *
   * - If in head-to-head and opposing unit moves successfully: 0
   * - Otherwise: 1 + successful move supports
   */
  private preventStrength(idx: number): number {
    // DATC 5.B.6: If the path of the unit is not correct → 0
    if (!this.hasPath(idx)) return 0;

    const h2hIdx = this.getHeadToHeadOpponent(idx);

    if (h2hIdx !== -1) {
      // In a head-to-head battle
      if (this.resolve(h2hIdx)) {
        // Opposing unit succeeds — prevent strength is 0
        return 0;
      }
    }

    return 1 + this.countMoveSupports(idx);
  }

  // =========================================================================
  // SUPPORT COUNTING
  // =========================================================================

  /**
   * Count successful move supports for a move order (all nations).
   */
  private countMoveSupports(moveIdx: number): number {
    const moveOrder = this.orders[moveIdx];
    const moveTarget = baseId(moveOrder.order.target!);
    let count = 0;

    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      if (o.effectiveType !== 'support') continue;
      if (!o.legal) continue;
      if (!o.order.supportDestination) continue;

      // Support must match: supporting unit at supportTarget to move to supportDestination
      if (baseId(o.order.supportTarget!) !== moveOrder.unit.territory) continue;
      if (baseId(o.order.supportDestination) !== moveTarget) continue;

      // Support must succeed
      if (this.resolve(i)) count++;
    }

    return count;
  }

  /**
   * Count successful move supports excluding supports from a specific nation.
   * Used for attack strength when attacking a unit of different nationality.
   */
  private countMoveSupportsDifferentNation(moveIdx: number, excludeNation: string): number {
    const moveOrder = this.orders[moveIdx];
    const moveTarget = baseId(moveOrder.order.target!);
    let count = 0;

    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      if (o.effectiveType !== 'support') continue;
      if (!o.legal) continue;
      if (!o.order.supportDestination) continue;

      // Exclude supports from the defending unit's nation
      if (o.unit.nation === excludeNation) continue;

      if (baseId(o.order.supportTarget!) !== moveOrder.unit.territory) continue;
      if (baseId(o.order.supportDestination) !== moveTarget) continue;

      if (this.resolve(i)) count++;
    }

    return count;
  }

  /**
   * Count successful hold supports for a unit in a territory.
   */
  private countHoldSupports(territory: string): number {
    let count = 0;

    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      if (o.effectiveType !== 'support') continue;
      if (!o.legal) continue;
      if (o.order.supportDestination) continue; // Must be support-hold, not support-move

      if (baseId(o.order.supportTarget!) !== territory) continue;

      // Self-support not allowed (6.A.8)
      if (o.unit.territory === territory) continue;

      if (this.resolve(i)) count++;
    }

    return count;
  }

  // =========================================================================
  // PATH CHECKING (DATC 5.B.4)
  // =========================================================================

  /**
   * Checks if a move order has a valid path to its destination.
   * Direct moves always have a path. Convoy moves need an unbroken chain.
   */
  private hasPath(idx: number): boolean {
    const o = this.orders[idx];
    if (o.effectiveType !== 'move') return false;
    const target = baseId(o.order.target!);

    // Fleet moves are always direct
    if (o.unit.type === 'fleet') return true; // Adjacency already checked in legality

    // Army: check if direct move is possible
    const isDirect = areAdjacent(o.unit.territory, target);
    const isConvoy = this.shouldUseConvoy(idx);

    if (isConvoy) {
      return this.hasConvoyPath(o.unit.territory, target);
    }

    return isDirect;
  }

  /**
   * Determines if a move should use convoy route.
   * Following DATC 2000/2023 rules for adjacent convoy:
   * - Explicit "via convoy" → always convoy
   * - Non-adjacent → always convoy (no land route possible)
   * - Adjacent + own fleet ordered to convoy → convoy
   * - Adjacent + no own fleet → land route
   */
  private shouldUseConvoy(idx: number): boolean {
    const o = this.orders[idx];
    const target = baseId(o.order.target!);

    // Only armies can be convoyed
    if (o.unit.type !== 'army') return false;

    // Explicit "via convoy" flag
    if (o.order.viaConvoy) return true;

    // Not adjacent → must use convoy
    if (!areAdjacent(o.unit.territory, target)) return true;

    // Adjacent: check if there's a fleet of the same nation ordered to convoy this army
    for (let i = 0; i < this.orders.length; i++) {
      const co = this.orders[i];
      if (co.effectiveType !== 'convoy') continue;
      if (!co.legal) continue;
      if (co.unit.nation !== o.unit.nation) continue;
      if (baseId(co.order.convoyFrom!) !== o.unit.territory) continue;
      if (baseId(co.order.convoyTo!) !== target) continue;
      return true;
    }

    return false;
  }

  /**
   * BFS for convoy path: find a chain of sea territories with matching,
   * successful convoy orders from origin to destination.
   */
  private hasConvoyPath(from: string, to: string): boolean {
    // Find all convoy orders matching this army's move
    const convoyFleets: string[] = [];
    const convoyOrderIdx: Map<string, number> = new Map();

    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      if (o.effectiveType !== 'convoy') continue;
      if (!o.legal) continue;
      if (baseId(o.order.convoyFrom!) !== from) continue;
      if (baseId(o.order.convoyTo!) !== to) continue;

      // Fleet must be at sea for convoy
      const fleetT = this.tMap[o.unit.territory];
      if (!fleetT || fleetT.type !== 'sea') continue;

      // Check if convoy succeeds
      if (this.resolve(i)) {
        convoyFleets.push(o.unit.territory);
        convoyOrderIdx.set(o.unit.territory, i);
      }
    }

    if (convoyFleets.length === 0) return false;

    // BFS: can we get from `from` to `to` through successful convoy fleets?
    const visited = new Set<string>();
    const queue: string[] = [];

    // Start: find convoy fleets adjacent to origin
    for (const fleet of convoyFleets) {
      const fromT = this.tMap[from];
      if (fromT && fromT.adjacencies.includes(fleet)) {
        queue.push(fleet);
        visited.add(fleet);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Check if this fleet is adjacent to destination
      const currentT = this.tMap[current];
      if (currentT && currentT.adjacencies.includes(to)) {
        return true;
      }

      // Expand to adjacent convoy fleets
      for (const fleet of convoyFleets) {
        if (visited.has(fleet)) continue;
        if (currentT && currentT.adjacencies.includes(fleet)) {
          visited.add(fleet);
          queue.push(fleet);
        }
      }
    }

    return false;
  }

  // =========================================================================
  // HEAD-TO-HEAD DETECTION
  // =========================================================================

  /**
   * Returns the index of the head-to-head opponent, or -1 if not in h2h.
   * Two units are in h2h if they move to each other's territories by direct path.
   */
  private getHeadToHeadOpponent(idx: number): number {
    const o = this.orders[idx];
    if (o.effectiveType !== 'move' || !o.legal) return -1;

    const target = baseId(o.order.target!);
    const opponentIdx = this.orderByTerritory.get(target);
    if (opponentIdx === undefined) return -1;

    const opponent = this.orders[opponentIdx];
    if (opponent.effectiveType !== 'move' || !opponent.legal) return -1;

    // Opponent must be moving to our territory
    if (baseId(opponent.order.target!) !== o.unit.territory) return -1;

    // Neither unit should be using convoy route for it to be h2h
    if (this.shouldUseConvoy(idx)) return -1;
    if (this.shouldUseConvoy(opponentIdx)) return -1;

    return opponentIdx;
  }

  // =========================================================================
  // COMPETITOR DETECTION
  // =========================================================================

  /**
   * Find all other move orders targeting the same destination.
   */
  private getCompetitors(idx: number): number[] {
    const o = this.orders[idx];
    const target = baseId(o.order.target!);
    const competitors: number[] = [];

    for (let i = 0; i < this.orders.length; i++) {
      if (i === idx) continue;
      const other = this.orders[i];
      if (other.effectiveType !== 'move') continue;
      if (!other.legal) continue;
      if (baseId(other.order.target!) !== target) continue;
      competitors.push(i);
    }

    return competitors;
  }

  // =========================================================================
  // BACKUP RULE (DATC 5.B.9)
  // =========================================================================

  /**
   * Apply backup rule for unresolvable cycles.
   * - If only move orders in cycle → circular movement → all succeed
   * - If any convoy order in cycle → Szykman rule → convoy orders fail
   */
  private backupRule(cycleOrders: number[]): void {
    const hasConvoy = cycleOrders.some(i => this.orders[i].effectiveType === 'convoy');

    if (hasConvoy) {
      // Szykman rule: convoy orders in the cycle fail
      for (const i of cycleOrders) {
        const o = this.orders[i];
        if (o.effectiveType === 'convoy') {
          o.resolved = true;
          o.resolution = false;
        }
      }
    } else {
      // Circular movement: all move orders in the cycle succeed
      for (const i of cycleOrders) {
        const o = this.orders[i];
        if (o.effectiveType === 'move') {
          o.resolved = true;
          o.resolution = true;
        }
      }
    }
  }

  // =========================================================================
  // RESULT COLLECTION
  // =========================================================================

  getResults(): ResolutionResult {
    const moves: MoveResult[] = [];
    const holds: HoldResult[] = [];
    const supports: SupportResult[] = [];
    const dislodged: DislodgedUnit[] = [];
    const bounceMap = new Map<string, string[]>();

    for (const o of this.orders) {
      // If the original order was a move (even if illegal → effectiveType is 'hold'),
      // always report it as a MoveResult so callers can see what was attempted.
      if (o.order.type === 'move' && o.order.target) {
        const target = baseId(o.order.target);
        const success = o.legal && o.resolved && o.resolution;

        moves.push({
          unit: o.unit.id,
          from: o.unit.territory,
          to: target,
          success,
          viaConvoy: o.legal ? this.shouldUseConvoy(o.idx) : false,
        });

        if (!success) {
          // Failed move: track for bounce detection (only for legal moves)
          if (o.legal) {
            if (!bounceMap.has(target)) bounceMap.set(target, []);
            bounceMap.get(target)!.push(o.unit.territory);
          }

          // Check if unit was dislodged while failing to move
          if (this.isUnitDislodged(o.unit.territory)) {
            dislodged.push({
              unit: o.unit.id,
              from: o.unit.territory,
              attacker: this.getDislodger(o.unit.territory),
            });
          }
        }
        continue;
      }

      switch (o.effectiveType) {

        case 'hold': {
          const isDislodged = this.isUnitDislodged(o.unit.territory);
          holds.push({
            unit: o.unit.id,
            territory: o.unit.territory,
            dislodged: isDislodged,
          });
          if (isDislodged) {
            dislodged.push({
              unit: o.unit.id,
              from: o.unit.territory,
              attacker: this.getDislodger(o.unit.territory),
            });
          }
          break;
        }

        case 'support': {
          const cut = !(o.resolved && o.resolution);
          supports.push({
            unit: o.unit.id,
            target: o.order.supportDestination
              ? baseId(o.order.supportDestination)
              : baseId(o.order.supportTarget!),
            cut: !o.legal || cut,
          });

          // Check if supporter was dislodged
          if (this.isUnitDislodged(o.unit.territory)) {
            dislodged.push({
              unit: o.unit.id,
              from: o.unit.territory,
              attacker: this.getDislodger(o.unit.territory),
            });
          }
          break;
        }

        case 'convoy': {
          // Convoy result tracked implicitly; check if fleet dislodged
          if (this.isUnitDislodged(o.unit.territory)) {
            dislodged.push({
              unit: o.unit.id,
              from: o.unit.territory,
              attacker: this.getDislodger(o.unit.territory),
            });
          }
          break;
        }
      }
    }

    // Build bounce results: territories with 2+ failed moves
    const bounces: BounceResult[] = [];
    for (const [territory, contestants] of bounceMap) {
      if (contestants.length >= 2) {
        // Also check that no unit successfully moved there
        const anySuccess = this.orders.some(o =>
          o.effectiveType === 'move' &&
          o.legal &&
          baseId(o.order.target!) === territory &&
          o.resolved && o.resolution
        );
        if (!anySuccess) {
          bounces.push({ territory, contestants });
        }
      }
    }

    return { moves, holds, supports, dislodged, bounces };
  }

  /**
   * Check if a unit at a territory was dislodged (another unit successfully moved there).
   */
  private isUnitDislodged(territory: string): boolean {
    for (const o of this.orders) {
      if (o.effectiveType !== 'move') continue;
      if (!o.legal) continue;
      if (baseId(o.order.target!) !== territory) continue;
      if (o.resolved && o.resolution) return true;
    }
    return false;
  }

  /**
   * Get the ID of the unit that dislodged a unit at the given territory.
   */
  private getDislodger(territory: string): string {
    for (const o of this.orders) {
      if (o.effectiveType !== 'move') continue;
      if (!o.legal) continue;
      if (baseId(o.order.target!) !== territory) continue;
      if (o.resolved && o.resolution) return o.unit.id;
    }
    return '';
  }
}

// ===========================================================================
// PUBLIC API
// ===========================================================================

/**
 * Resolves all orders for a single movement phase.
 *
 * This is the core adjudication function that determines the outcome of all
 * player orders. It implements the Guess Algorithm from DATC v3.0 section 5.F
 * with the following rule preferences:
 *
 * - Multi-route convoy disruption: all routes must be disrupted
 * - Convoy paradox resolution: Szykman rule
 * - Convoy to adjacent province: 2000/2023 rules (intent via own fleet)
 *
 * @param orders - All orders from all players for this movement phase
 * @param units  - Current unit positions on the board
 * @param territories - Territory data (used for adjacency checks)
 * @returns ResolutionResult with the outcome of all orders
 */
export function resolveOrders(
  orders: Order[],
  units: Unit[],
  territories: readonly Territory[],
): ResolutionResult {
  const resolver = new DiplomacyResolver(orders, units, territories);
  resolver.resolveAll();
  return resolver.getResults();
}
