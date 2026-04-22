/**
 * Territory types in Diplomacy.
 *
 * - `land`   : Inland territory — only armies may enter
 * - `coast`  : Coastal territory — armies and fleets may enter
 * - `sea`    : Open sea — only fleets may enter
 */
export type TerritoryType = 'land' | 'coast' | 'sea';

/**
 * Coasts that require disambiguation for fleets.
 * Only relevant for dual-coast territories:
 *   Bulgaria (bul), St. Petersburg (stp), Spain (spa).
 */
export type CoastSpecifier = 'nc' | 'sc' | 'ec';

/**
 * A single territory on the Diplomacy board.
 */
export interface Territory {
  /** Short identifier used in orders (e.g. ``'lon'``, ``'par'``, ``'bul'``) */
  readonly id: string;

  /** Full English display name */
  readonly name: string;

  /** Geographic type — determines which unit types may occupy this territory */
  readonly type: TerritoryType;

  /** Whether this territory is a supply centre (Versorgungszentrum) */
  readonly isSupplyCenter: boolean;

  /**
   * Territories adjacent for movement purposes.
   *
   * - For standard territories: a flat array of neighbour IDs.
   * - For dual-coast territories the **default** adjacency list includes all
   *   land/sea neighbours that are reachable without specifying a coast.
   *   Fleets must use the specialised `coastAdjacencies` map instead.
   */
  readonly adjacencies: readonly string[];

  /**
   * Coast-specific adjacency lists.  Only present on dual-coast territories
   * (``bul``, ``stp``, ``spa``).
   *
   * Key   : one of ``'nc'``, ``'sc'``, ``'ec'``
   * Value : the sea/coast territories a fleet can reach from that coast
   */
  readonly coastAdjacencies?: Readonly<Partial<Record<CoastSpecifier, readonly string[]>>>;

  /**
   * Marks canal territories where a fleet may pass through as if the two
   * bodies of water it connects were directly adjacent.
   * Applies to Kiel (kie) and Constantinople (con).
   */
  readonly isCanal?: boolean;

  /**
   * The nation that starts the game owning this supply centre.
   * ``null`` for neutral supply centres; ``undefined`` for non-supply-centre territories.
   */
  readonly homeNation?: string | null;
}
