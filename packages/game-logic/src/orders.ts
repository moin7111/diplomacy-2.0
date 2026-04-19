import { Order } from './types/order';
import { Unit } from './types/unit';
import { Territory } from './types/territory';
import { areAdjacent, areAdjacentForFleet, territoryMap } from './territories';

/**
 * Parses a string input into an Order object.
 * 
 * Supported formats:
 * - A VIE H, A VIE HOLD, A VIE
 * - A VIE - BUD, A VIE TO BUD
 * - A VIE S A BUD - SER, A VIE SUPPORT A BUD - SER
 * - A VIE S A BUD, A VIE SUPPORT A BUD
 * - F LON C A YOR - NWY, F LON CONVOY A YOR - NWY
 */
export function parseOrder(input: string): Order {
  const norm = input.trim().toUpperCase();

  let m: RegExpMatchArray | null = null;

  // Support Move
  // e.g. A VIE S A BUD - SER
  if ((m = norm.match(/^(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)\s*(?:S|SUPPORT)\s*(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)\s*(?:-|TO)\s*(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)$/))) {
    return {
      unit: m[1].toLowerCase(),
      type: 'support',
      supportTarget: m[2].toLowerCase(),
      supportDestination: m[3].toLowerCase()
    };
  }

  // Support Hold
  // e.g. A VIE S A BUD
  if ((m = norm.match(/^(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)\s*(?:S|SUPPORT)\s*(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)$/))) {
    return {
      unit: m[1].toLowerCase(),
      type: 'support',
      supportTarget: m[2].toLowerCase()
    };
  }

  // Convoy
  // e.g. F LON C A YOR - NWY
  if ((m = norm.match(/^(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)\s*(?:C|CONVOY)\s*(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)\s*(?:-|TO)\s*(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)$/))) {
    return {
      unit: m[1].toLowerCase(),
      type: 'convoy',
      convoyFrom: m[2].toLowerCase(),
      convoyTo: m[3].toLowerCase()
    };
  }

  // Move
  // e.g. A VIE - BUD or A NWY - SWE VIA CONVOY
  if ((m = norm.match(/^(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)\s*(?:-|TO)\s*(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)(?:\s+VIA\s+(?:CONVOY|C))?$/))) {
    const hasViaConvoy = /VIA\s+(?:CONVOY|C)\s*$/i.test(norm);
    return {
      unit: m[1].toLowerCase(),
      type: 'move',
      target: m[2].toLowerCase(),
      ...(hasViaConvoy && { viaConvoy: true }),
    };
  }

  // Hold
  // e.g. A VIE H or just A VIE
  if ((m = norm.match(/^(?:A|F)?\s*([A-Z]{3}(?:-(?:NC|SC|EC))?)(?:\s+(?:H|HOLD))?$/))) {
    return {
      unit: m[1].toLowerCase(),
      type: 'hold'
    };
  }

  throw new Error(`Failed to parse order: ${input}`);
}

/**
 * Helper to find a unit from the unit list by its territory or ID.
 */
function findUnit(unitRef: string, units: Unit[]): Unit | undefined {
  return units.find(u => {
    const locWithCoast = u.coast ? `${u.territory}-${u.coast}` : u.territory;
    return u.id === unitRef || u.territory === unitRef || locWithCoast === unitRef;
  });
}

function getBaseTerritoryId(id: string): string {
  return id.split('-')[0];
}

/**
 * Validates a parsed order against the current units and territories.
 */
export function validateOrder(
  order: Order,
  units: Unit[],
  territories: readonly Territory[] // Provided for dependency injection, though we also use territoryMap
): { valid: boolean; error?: string } {
  void territories; // Make TS happy about unused parameter
  try {
    const actingUnit = findUnit(order.unit, units);
    if (!actingUnit) {
      return { valid: false, error: `Unit not found for reference: ${order.unit}` };
    }
    
    // Construct the territory reference (including coast if applicable) for adjacency checks
    const actingLoc = actingUnit.coast ? `${actingUnit.territory}-${actingUnit.coast}` : actingUnit.territory;

    switch (order.type) {
      case 'hold':
        // Hold is always valid if the unit exists
        return { valid: true };

      case 'move': {
        if (!order.target) return { valid: false, error: "Move order missing target" };
        const targetBase = getBaseTerritoryId(order.target);
        const tTarget = territoryMap[targetBase];
        if (!tTarget) return { valid: false, error: `Invalid target territory: ${order.target}` };

        if (actingUnit.type === 'fleet') {
          if (!areAdjacentForFleet(actingLoc, order.target)) {
            return { valid: false, error: `Target ${order.target} is unreachable for fleet at ${actingLoc}` };
          }
        } else {
          // Army
          if (tTarget.type === 'sea') {
            return { valid: false, error: `Army cannot move to sea territory ${order.target}` };
          }
          if (areAdjacent(actingUnit.territory, targetBase)) {
            return { valid: true };
          }
          // If not adjacent, it could be a convoy. Convoy requires both territories to be coastals
          const tFrom = territoryMap[actingUnit.territory];
          if (tFrom.type === 'coast' && tTarget.type === 'coast') {
            return { valid: true }; // Possible convoy, actual path resolution happens during order resolution
          }
          return { valid: false, error: `Target ${order.target} is unreachable for army at ${actingUnit.territory}` };
        }
        return { valid: true };
      }

      case 'support': {
        if (!order.supportTarget) return { valid: false, error: "Support order missing supportTarget" };
        const stBase = getBaseTerritoryId(order.supportTarget);
        if (!territoryMap[stBase]) return { valid: false, error: `Invalid support target: ${order.supportTarget}` };

        if (order.supportDestination) {
          // Supporting Move
          const sdBase = getBaseTerritoryId(order.supportDestination);
          if (!territoryMap[sdBase]) return { valid: false, error: `Invalid support destination: ${order.supportDestination}` };
          
          if (actingUnit.type === 'fleet') {
            if (!areAdjacentForFleet(actingLoc, order.supportDestination)) {
              return { valid: false, error: `Cannot support into ${order.supportDestination} - fleet cannot move there` };
            }
          } else {
            if (!areAdjacent(actingUnit.territory, sdBase)) {
              return { valid: false, error: `Cannot support into ${order.supportDestination} - army cannot move there` };
            }
          }
        } else {
          // Supporting Hold
          if (actingUnit.type === 'fleet') {
            if (!areAdjacentForFleet(actingLoc, order.supportTarget)) {
              return { valid: false, error: `Cannot support ${order.supportTarget} - fleet cannot move there` };
            }
          } else {
            if (!areAdjacent(actingUnit.territory, stBase)) {
              return { valid: false, error: `Cannot support ${order.supportTarget} - army cannot move there` };
            }
          }
        }
        return { valid: true };
      }

      case 'convoy': {
        if (!order.convoyFrom || !order.convoyTo) {
          return { valid: false, error: "Convoy order missing from or to target" };
        }
        if (actingUnit.type !== 'fleet') {
          return { valid: false, error: `Only fleets can convoy` };
        }
        const tLoc = territoryMap[actingUnit.territory];
        if (tLoc.type !== 'sea') {
          return { valid: false, error: `Only fleets at sea can convoy` };
        }
        
        const cfBase = getBaseTerritoryId(order.convoyFrom);
        const ctBase = getBaseTerritoryId(order.convoyTo);
        const tFrom = territoryMap[cfBase];
        const tTo = territoryMap[ctBase];

        if (!tFrom || tFrom.type !== 'coast') return { valid: false, error: `Convoy origin must be a coastal territory` };
        if (!tTo || tTo.type !== 'coast') return { valid: false, error: `Convoy destination must be a coastal territory` };

        return { valid: true };
      }
    }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Validation error' };
  }
}
