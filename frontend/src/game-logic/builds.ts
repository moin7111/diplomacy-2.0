/**
 * @file builds.ts
 * @description Build/adjustment phase (Winter) resolution for Diplomacy.
 *
 * After the Fall movement and retreat phases, each nation compares its number
 * of controlled supply centres to its number of units on the board:
 *   - More SCs than units → may BUILD new units on unoccupied home SCs
 *   - Fewer SCs than units → must DISBAND excess units
 *   - Equal → no adjustment needed
 *
 * Build rules:
 *   - Armies may be built on any home SC that is land or coast type
 *   - Fleets may be built on any home SC that is coast or sea type
 *   - The home SC must be currently unoccupied by ANY unit (friend or foe)
 *   - The nation must still control the home SC
 *   - Fleets on dual-coast home SCs must specify a coast
 */

import type { Unit } from './types/unit';
import type { BuildOrder, BuildCalculation, BuildResult } from './types/build';
import { getTerritory, getHomeSupplyCenters } from './territories';

/**
 * Calculates how many units a nation may build or must disband.
 *
 * @param nation        The nation name (e.g. 'England')
 * @param controlledSCs Array of territory IDs of supply centres this nation controls
 * @param units         All of this nation's units currently on the board
 * @param allUnits      ALL units on the board (all nations) — needed to check occupancy
 * @returns             BuildCalculation with diff and available home SCs
 */
export function calculateBuilds(
  nation: string,
  controlledSCs: string[],
  units: Unit[],
  allUnits: Unit[],
): BuildCalculation {
  const homeSCs = getHomeSupplyCenters(nation).map((t) => t.id);

  // Home SCs that are controlled AND unoccupied by any unit
  const occupiedTerritories = new Set(allUnits.map((u) => u.territory));
  const controlledSet = new Set(controlledSCs);

  const availableHomeSCs = homeSCs.filter(
    (sc) => controlledSet.has(sc) && !occupiedTerritories.has(sc),
  );

  const diff = controlledSCs.length - units.length;

  return {
    nation,
    homeSCs,
    controlledSCs,
    currentUnitCount: units.length,
    diff,
    availableHomeSCs,
  };
}

/**
 * Validates a single build order.
 *
 * @param order           The build order to validate
 * @param nation          The nation issuing the order
 * @param availableHomeSCs Home SCs available for building (unoccupied, controlled)
 * @param units           This nation's current units (for disband validation)
 * @returns               { valid: true } or { valid: false, reason: string }
 */
export function validateBuildOrder(
  order: BuildOrder,
  nation: string,
  availableHomeSCs: string[],
  units: Unit[],
): { valid: boolean; reason?: string } {
  if (order.nation !== nation) {
    return { valid: false, reason: 'Order nation does not match' };
  }

  if (order.type === 'build') {
    // Must build on an available home SC
    if (!availableHomeSCs.includes(order.territory)) {
      return {
        valid: false,
        reason: `${order.territory} is not an available home supply centre for ${nation}`,
      };
    }

    if (!order.unitType) {
      return { valid: false, reason: 'Build order must specify a unit type' };
    }

    const territory = getTerritory(order.territory);

    // Validate unit type placement
    if (order.unitType === 'army') {
      if (territory.type === 'sea') {
        return { valid: false, reason: 'Cannot build army on sea territory' };
      }
      if (order.coast) {
        return { valid: false, reason: 'Army cannot have a coast specifier' };
      }
    } else if (order.unitType === 'fleet') {
      if (territory.type === 'land') {
        return { valid: false, reason: 'Cannot build fleet on land territory' };
      }
      // Dual-coast territories require a coast specifier
      if (territory.coastAdjacencies) {
        if (!order.coast) {
          return {
            valid: false,
            reason: `Fleet on dual-coast territory ${order.territory} must specify a coast`,
          };
        }
        if (!(order.coast in territory.coastAdjacencies)) {
          return {
            valid: false,
            reason: `Invalid coast '${order.coast}' for territory ${order.territory}`,
          };
        }
      } else if (order.coast) {
        return {
          valid: false,
          reason: `Territory ${order.territory} is not a dual-coast territory`,
        };
      }
    }

    return { valid: true };
  }

  if (order.type === 'disband') {
    // Must disband one of the nation's own units
    const unitAtTerritory = units.find(
      (u) => u.territory === order.territory && u.nation === nation,
    );
    if (!unitAtTerritory) {
      return {
        valid: false,
        reason: `No ${nation} unit at ${order.territory} to disband`,
      };
    }
    return { valid: true };
  }

  return { valid: false, reason: `Unknown order type: ${(order as any).type}` };
}

/**
 * Resolves all build/disband orders for the Winter adjustment phase.
 *
 * @param orders      Array of build/disband orders from all nations
 * @param buildCalcs  BuildCalculation for each nation (from calculateBuilds)
 * @param units       All units currently on the board (all nations)
 * @returns           BuildResult with successful builds, disbands, and invalid orders
 */
export function resolveBuilds(
  orders: BuildOrder[],
  buildCalcs: BuildCalculation[],
  units: Unit[],
): BuildResult {
  const builds: BuildResult['builds'] = [];
  const disbands: BuildResult['disbands'] = [];
  const invalid: BuildResult['invalid'] = [];

  // Group orders by nation
  const ordersByNation = new Map<string, BuildOrder[]>();
  for (const order of orders) {
    const list = ordersByNation.get(order.nation) ?? [];
    list.push(order);
    ordersByNation.set(order.nation, list);
  }

  // Process each nation's calculation
  for (const calc of buildCalcs) {
    const nationOrders = ordersByNation.get(calc.nation) ?? [];

    if (calc.diff > 0) {
      // Nation may build — process build orders
      const buildOrders = nationOrders.filter((o) => o.type === 'build');
      const maxBuilds = Math.min(calc.diff, calc.availableHomeSCs.length);
      let buildCount = 0;
      const usedTerritories = new Set<string>();

      for (const order of buildOrders) {
        if (buildCount >= maxBuilds) {
          invalid.push({ order, reason: 'Build limit reached' });
          continue;
        }

        if (usedTerritories.has(order.territory)) {
          invalid.push({ order, reason: 'Territory already used for a build this phase' });
          continue;
        }

        // Re-check availability accounting for earlier builds this phase
        const remainingHomeSCs = calc.availableHomeSCs.filter(
          (sc) => !usedTerritories.has(sc),
        );

        const nationUnits = units.filter((u) => u.nation === calc.nation);
        const validation = validateBuildOrder(order, calc.nation, remainingHomeSCs, nationUnits);
        if (!validation.valid) {
          invalid.push({ order, reason: validation.reason! });
          continue;
        }

        builds.push({
          nation: calc.nation,
          territory: order.territory,
          unitType: order.unitType!,
          coast: order.coast,
        });
        usedTerritories.add(order.territory);
        buildCount++;
      }
    } else if (calc.diff < 0) {
      // Nation must disband — process disband orders
      const disbandOrders = nationOrders.filter((o) => o.type === 'disband');
      const requiredDisbands = Math.abs(calc.diff);
      let disbandCount = 0;
      const disbandedTerritories = new Set<string>();

      for (const order of disbandOrders) {
        if (disbandCount >= requiredDisbands) {
          invalid.push({ order, reason: 'Disband limit reached' });
          continue;
        }

        if (disbandedTerritories.has(order.territory)) {
          invalid.push({ order, reason: 'Unit already disbanded' });
          continue;
        }

        const nationUnits = units.filter((u) => u.nation === calc.nation);
        const validation = validateBuildOrder(order, calc.nation, [], nationUnits);
        if (!validation.valid) {
          invalid.push({ order, reason: validation.reason! });
          continue;
        }

        disbands.push({
          nation: calc.nation,
          territory: order.territory,
        });
        disbandedTerritories.add(order.territory);
        disbandCount++;
      }

      // If not enough disbands were ordered, the remaining are civil disorder
      // (In official rules, furthest units from home SCs are disbanded — 
      //  for now we just note the shortfall; the backend can handle auto-disband)
    }
    // diff === 0 → no adjustment needed, any orders are invalid
    else {
      for (const order of nationOrders) {
        invalid.push({ order, reason: 'No adjustment needed for this nation' });
      }
    }
  }

  return { builds, disbands, invalid };
}
