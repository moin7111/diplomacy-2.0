/**
 * Diplomacy Order Type.
 */
export type OrderType = 'hold' | 'move' | 'support' | 'convoy';

/**
 * Parsed Diplomacy Order.
 */
export interface Order {
  /** Unit identifier (e.g., unit ID or territory ID where the unit is located) */
  unit: string;
  
  /** Type of order */
  type: OrderType;
  
  /** Target territory identifier (for 'move') */
  target?: string;
  
  /** The territory of the unit being supported (for 'support') */
  supportTarget?: string;
  
  /** The destination territory of the unit being supported (for 'support move') */
  supportDestination?: string;
  
  /** The territory of the army being convoyed (for 'convoy') */
  convoyFrom?: string;
  
  /** The destination territory of the army being convoyed (for 'convoy') */
  convoyTo?: string;

  /** Whether this move explicitly uses a convoy route ('A NWY - SWE VIA CONVOY') */
  viaConvoy?: boolean;

  /** The nation issuing this order (used for ownership validation during resolution) */
  nation?: string;
}
