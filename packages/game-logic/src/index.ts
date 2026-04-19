/**
 * @file index.ts
 * @description Public API for @diplomacy/game-logic
 */

export type { Territory, TerritoryType, CoastSpecifier } from './types/territory';
export type { Unit } from './types/unit';
export type { Order, OrderType } from './types/order';
export type {
  ResolutionResult,
  MoveResult,
  HoldResult,
  SupportResult,
  DislodgedUnit,
  BounceResult,
} from './types/resolution';

export {
  territories,
  territoryMap,
  getTerritory,
  getSupplyCenters,
  getHomeSupplyCenters,
  areAdjacent,
} from './territories';

export {
  getStartingUnits,
  getAllStartingUnits,
  validateUnitPlacement,
} from './units';

export {
  parseOrder,
  validateOrder,
} from './orders';

export {
  resolveOrders,
} from './resolver';
