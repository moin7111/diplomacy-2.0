import type { CoastSpecifier } from './territory';

/**
 * Diplomacy Unit (Army or Fleet).
 */
export interface Unit {
  /** Unique identifier for the unit (e.g., 'eng-f-lon', 'aut-a-vie') */
  id: string;
  
  /** The type of unit: 'army' or 'fleet'. */
  type: 'army' | 'fleet';
  
  /** The nation that controls this unit ('England', 'France', etc.) */
  nation: string;
  
  /** The ID of the territory where this unit is located (e.g., 'vie', 'kie') */
  territory: string;
  
  /** Coast specifier, only applicable if it's a fleet in a dual-coast territory (e.g., 'sc', 'nc') */
  coast?: CoastSpecifier;
}
