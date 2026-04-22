import { Unit } from './types/unit';
import { getTerritory } from './territories';

// Internal type for starting definitions
type StartDef = { territory: string; type: 'army' | 'fleet'; coast?: 'nc' | 'sc' | 'ec' };

/**
 * Starting units mapping by nation.
 */
const STARTING_POSITIONS: Record<string, StartDef[]> = {
  'England': [
    { territory: 'lon', type: 'fleet' },
    { territory: 'edi', type: 'fleet' },
    { territory: 'lvp', type: 'army' },
  ],
  'France': [
    { territory: 'par', type: 'army' },
    { territory: 'mar', type: 'army' },
    { territory: 'bre', type: 'fleet' },
  ],
  'Germany': [
    { territory: 'ber', type: 'army' },
    { territory: 'mun', type: 'army' },
    { territory: 'kie', type: 'fleet' },
  ],
  'Austria-Hungary': [
    { territory: 'vie', type: 'army' },
    { territory: 'bud', type: 'army' },
    { territory: 'tri', type: 'fleet' },
  ],
  'Italy': [
    { territory: 'rom', type: 'army' },
    { territory: 'ven', type: 'army' },
    { territory: 'nap', type: 'fleet' },
  ],
  'Russia': [
    { territory: 'mos', type: 'army' },
    { territory: 'war', type: 'army' },
    { territory: 'sev', type: 'fleet' },
    { territory: 'stp', type: 'fleet', coast: 'sc' },
  ],
  'Turkey': [
    { territory: 'con', type: 'army' },
    { territory: 'smy', type: 'army' },
    { territory: 'ank', type: 'fleet' },
  ],
};

/**
 * Validates a single unit's constraints (e.g., armies on land/coast, fleets on coast/sea).
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateUnitPlacement(unit: Pick<Unit, 'type' | 'territory' | 'coast'>): { valid: boolean; error?: string } {
  try {
    const t = getTerritory(unit.territory);
    
    if (unit.type === 'army') {
      if (t.type === 'sea') {
        return { valid: false, error: `Army cannot be placed on sea territory ${unit.territory}` };
      }
      if (unit.coast) {
        return { valid: false, error: `Army cannot have a coast specifier (${unit.coast})` };
      }
    } else if (unit.type === 'fleet') {
      if (t.type === 'land') {
        return { valid: false, error: `Fleet cannot be placed on land territory ${unit.territory}` };
      }
      if (t.coastAdjacencies) {
        if (!unit.coast) {
          return { valid: false, error: `Fleet in dual-coast territory ${unit.territory} must specify a coast` };
        }
        if (!(unit.coast in t.coastAdjacencies)) {
          return { valid: false, error: `Invalid coast '${unit.coast}' for territory ${unit.territory}` };
        }
      } else if (unit.coast) {
        return { valid: false, error: `Fleet in single-coast territory ${unit.territory} cannot specify a coast` };
      }
    }
    
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: e.message || 'Invalid territory' };
  }
}

/**
 * Gets the standard starting units for a given nation.
 */
export function getStartingUnits(nation: string): Unit[] {
  const defs = STARTING_POSITIONS[nation];
  if (!defs) {
    throw new Error(`Unknown nation: ${nation}`);
  }
  
  return defs.map(def => {
    const id = `${nation.substring(0, 3).toLowerCase()}-${def.type === 'army' ? 'a' : 'f'}-${def.territory}${def.coast ? '-' + def.coast : ''}`;
    return {
      id,
      type: def.type,
      nation,
      territory: def.territory,
      coast: def.coast,
    };
  });
}

/**
 * Returns all starting units for all 7 standard nations.
 */
export function getAllStartingUnits(): Unit[] {
  return Object.keys(STARTING_POSITIONS).flatMap(getStartingUnits);
}
