/**
 * @file territories.ts
 * @description Complete Diplomacy board — all 70 territories with their
 *   adjacency relationships, including dual-coast rules for Bulgaria,
 *   St. Petersburg and Spain, and canal rules for Kiel and Constantinople.
 *
 * Adjacency data is sourced from the standard Diplomacy rulebook (Allan B.
 * Calhamer, 1959) and cross-referenced against the Backstabbr / Webdiplomacy
 * open-source implementations.
 *
 * Territory IDs follow the standard 3-letter abbreviation used universally in
 * Diplomacy tooling.
 *
 * ### Dual-coast territories
 * Armies treat dual-coast territories as single territories; fleets must
 * specify which coast they are on.  The `coastAdjacencies` field lists the
 * sea neighbours reachable from each named coast.
 *
 * | Territory         | ID  | Coasts            |
 * |-------------------|-----|-------------------|
 * | Bulgaria          | bul | nc (Black Sea), sc (Aegean / Greece) |
 * | St. Petersburg    | stp | nc (Barents / Norwegian), sc (Gulf of Bothnia / Finland / Livonia) |
 * | Spain             | spa | nc (Mid-Atlantic / Gascony), sc (Mid-Atlantic / Gulf of Lyon / Western Med) |
 *
 * ### Canal territories
 * | Territory       | ID  | Connects              |
 * |-----------------|-----|-----------------------|
 * | Kiel            | kie | Baltic ↔ Helgoland Bight |
 * | Constantinople  | con | Black Sea ↔ Aegean    |
 */

import type { Territory } from './types/territory';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function t(
  id: string,
  name: string,
  type: Territory['type'],
  isSupplyCenter: boolean,
  adjacencies: string[],
  opts: {
    coastAdjacencies?: Territory['coastAdjacencies'];
    isCanal?: boolean;
    homeNation?: string | null;
  } = {}
): Territory {
  return Object.freeze({
    id,
    name,
    type,
    isSupplyCenter,
    adjacencies: Object.freeze(adjacencies),
    ...(opts.coastAdjacencies !== undefined && {
      coastAdjacencies: Object.freeze(opts.coastAdjacencies),
    }),
    ...(opts.isCanal !== undefined && { isCanal: opts.isCanal }),
    ...(opts.homeNation !== undefined && { homeNation: opts.homeNation }),
  });
}

// ---------------------------------------------------------------------------
// Territory definitions — grouped by region for readability
// ---------------------------------------------------------------------------

const TERRITORIES: Territory[] = [
  // =========================================================================
  // GREAT BRITAIN
  // =========================================================================
  t('cly', 'Clyde', 'coast', false, ['edi', 'lvp', 'nao', 'nwg']),
  t('edi', 'Edinburgh', 'coast', true, ['cly', 'lvp', 'nth', 'nwg', 'yor'], {
    homeNation: 'England',
  }),
  t('lvp', 'Liverpool', 'coast', true, ['cly', 'edi', 'iri', 'nao', 'wal', 'yor'], {
    homeNation: 'England',
  }),
  t('wal', 'Wales', 'coast', false, ['eng', 'iri', 'lon', 'lvp', 'nth', 'yor']),
  t('lon', 'London', 'coast', true, ['eng', 'nth', 'wal', 'yor'], {
    homeNation: 'England',
  }),
  t('yor', 'Yorkshire', 'coast', false, ['edi', 'lon', 'lvp', 'nth', 'wal']),

  // =========================================================================
  // WESTERN EUROPE
  // =========================================================================
  t('bre', 'Brest', 'coast', true, ['eng', 'gas', 'mao', 'par', 'pic'], {
    homeNation: 'France',
  }),
  t('par', 'Paris', 'land', true, ['bre', 'bur', 'gas', 'pic'], {
    homeNation: 'France',
  }),
  t('pic', 'Picardy', 'coast', false, ['bel', 'bre', 'bur', 'eng', 'par']),
  t('bur', 'Burgundy', 'land', false, ['bel', 'gas', 'mun', 'mar', 'par', 'pic', 'ruh']),
  t('gas', 'Gascony', 'coast', false, ['bre', 'bur', 'mar', 'mao', 'par', 'spa']),
  t('mar', 'Marseille', 'coast', true, ['bur', 'gas', 'lyo', 'pie', 'spa'], {
    homeNation: 'France',
  }),
  t('spa', 'Spain', 'coast', true, ['gas', 'lyo', 'mao', 'mar', 'por', 'wes'], {
    homeNation: null,
    coastAdjacencies: {
      nc: ['gas', 'mao'],
      sc: ['gas', 'lyo', 'mao', 'mar', 'wes'],
    },
  }),
  t('por', 'Portugal', 'coast', true, ['mao', 'spa'], {
    homeNation: null,
  }),
  t('bel', 'Belgium', 'coast', true, ['bur', 'eng', 'hol', 'nth', 'pic', 'ruh'], {
    homeNation: null,
  }),
  t('hol', 'Holland', 'coast', true, ['bel', 'hel', 'kie', 'nth', 'ruh'], {
    homeNation: null,
  }),
  t('ruh', 'Ruhr', 'land', false, ['bel', 'bur', 'hol', 'kie', 'mun']),

  // =========================================================================
  // GERMANY / CENTRAL EUROPE
  // =========================================================================
  t('kie', 'Kiel', 'coast', true, ['bal', 'ber', 'den', 'hel', 'hol', 'mun', 'ruh'], {
    homeNation: 'Germany',
    isCanal: true,
  }),
  t('ber', 'Berlin', 'coast', true, ['bal', 'kie', 'mun', 'pru', 'sil'], {
    homeNation: 'Germany',
  }),
  t('mun', 'Munich', 'land', true, ['ber', 'boh', 'bur', 'kie', 'ruh', 'sil', 'tyr', 'vie'], {
    homeNation: 'Germany',
  }),
  t('sil', 'Silesia', 'land', false, ['ber', 'boh', 'gal', 'mun', 'pru', 'war']),
  t('pru', 'Prussia', 'coast', false, ['bal', 'ber', 'lvn', 'sil', 'war']),
  t('boh', 'Bohemia', 'land', false, ['gal', 'mun', 'sil', 'tyr', 'vie']),
  t('tyr', 'Tyrolia', 'land', false, ['boh', 'mun', 'pie', 'tri', 'ven', 'vie']),

  // =========================================================================
  // AUSTRIA-HUNGARY
  // =========================================================================
  t('vie', 'Vienna', 'land', true, ['boh', 'bud', 'gal', 'mun', 'tri', 'tyr'], {
    homeNation: 'Austria-Hungary',
  }),
  t('bud', 'Budapest', 'land', true, ['gal', 'rum', 'ser', 'tri', 'vie'], {
    homeNation: 'Austria-Hungary',
  }),
  t('tri', 'Trieste', 'coast', true, ['adr', 'alb', 'bud', 'ser', 'tyr', 'ven', 'vie'], {
    homeNation: 'Austria-Hungary',
  }),
  t('gal', 'Galicia', 'land', false, ['boh', 'bud', 'rum', 'sil', 'ukr', 'vie', 'war']),

  // =========================================================================
  // ITALY
  // =========================================================================
  t('ven', 'Venice', 'coast', true, ['adr', 'apu', 'pie', 'rom', 'tri', 'tus', 'tyr'], {
    homeNation: 'Italy',
  }),
  t('pie', 'Piedmont', 'coast', false, ['lyo', 'mar', 'tus', 'tyr', 'ven']),
  t('tus', 'Tuscany', 'coast', false, ['lyo', 'pie', 'rom', 'tys', 'ven']),
  t('rom', 'Rome', 'coast', true, ['apu', 'nap', 'tus', 'tys', 'ven'], {
    homeNation: 'Italy',
  }),
  t('apu', 'Apulia', 'coast', false, ['adr', 'ion', 'nap', 'rom', 'ven']),
  t('nap', 'Naples', 'coast', true, ['apu', 'ion', 'rom', 'tys'], {
    homeNation: 'Italy',
  }),

  // =========================================================================
  // BALKANS
  // =========================================================================
  t('ser', 'Serbia', 'land', true, ['alb', 'bud', 'bul', 'gre', 'rum', 'tri'], {
    homeNation: null,
  }),
  t('alb', 'Albania', 'coast', false, ['adr', 'gre', 'ion', 'ser', 'tri']),
  t('gre', 'Greece', 'coast', true, ['aeg', 'alb', 'bul', 'ion', 'ser'], {
    homeNation: null,
  }),
  t('rum', 'Rumania', 'coast', true, ['bla', 'bud', 'bul', 'gal', 'ser', 'sev', 'ukr'], {
    homeNation: null,
  }),
  t('bul', 'Bulgaria', 'coast', true, ['aeg', 'bla', 'con', 'gre', 'rum', 'ser'], {
    homeNation: null,
    coastAdjacencies: {
      nc: ['bla', 'rum'],
      sc: ['aeg', 'con', 'gre'],
    },
  }),

  // =========================================================================
  // OTTOMAN EMPIRE / TURKEY
  // =========================================================================
  t('con', 'Constantinople', 'coast', true, ['aeg', 'bla', 'bul', 'ank', 'smy'], {
    homeNation: 'Turkey',
    isCanal: true,
  }),
  t('ank', 'Ankara', 'coast', true, ['arm', 'bla', 'con', 'smy'], {
    homeNation: 'Turkey',
  }),

  t('smy', 'Smyrna', 'coast', true, ['aeg', 'ank', 'arm', 'con', 'eas', 'syr'], {
    homeNation: 'Turkey',
  }),
  t('arm', 'Armenia', 'coast', false, ['ank', 'bla', 'eas', 'sev', 'smy', 'syr']),
  t('syr', 'Syria', 'coast', false, ['arm', 'eas', 'smy']),

  // =========================================================================
  // RUSSIA
  // =========================================================================
  t('stp', 'St. Petersburg', 'coast', true, ['bar', 'bot', 'fin', 'lvn', 'mos', 'nwy'], {
    homeNation: 'Russia',
    coastAdjacencies: {
      nc: ['bar', 'nwy'],
      sc: ['bot', 'fin', 'lvn'],
    },
  }),
  t('mos', 'Moscow', 'land', true, ['lvn', 'sev', 'stp', 'ukr', 'war'], {
    homeNation: 'Russia',
  }),
  t('war', 'Warsaw', 'land', true, ['gal', 'lvn', 'mos', 'pru', 'sil', 'ukr'], {
    homeNation: 'Russia',
  }),
  t('sev', 'Sevastopol', 'coast', true, ['arm', 'bla', 'mos', 'rum', 'ukr'], {
    homeNation: 'Russia',
  }),
  t('ukr', 'Ukraine', 'land', false, ['gal', 'mos', 'rum', 'sev', 'war']),
  t('lvn', 'Livonia', 'coast', false, ['bal', 'bot', 'mos', 'pru', 'stp', 'war']),
  t('fin', 'Finland', 'coast', false, ['bot', 'nwy', 'stp', 'swe']),

  // =========================================================================
  // SCANDINAVIA
  // =========================================================================
  t('nwy', 'Norway', 'coast', true, ['bar', 'fin', 'nth', 'nwg', 'ska', 'stp', 'swe'], {
    homeNation: null,
  }),
  t('swe', 'Sweden', 'coast', true, ['bal', 'bot', 'den', 'fin', 'nwy', 'ska'], {
    homeNation: null,
  }),
  t('den', 'Denmark', 'coast', true, ['bal', 'hel', 'kie', 'nth', 'ska', 'swe'], {
    homeNation: null,
  }),

  // =========================================================================
  // SEA TERRITORIES
  // =========================================================================
  // North Atlantic
  t('nao', 'North Atlantic Ocean', 'sea', false, ['cly', 'iri', 'lvp', 'mao', 'nwg']),
  t('bar', 'Barents Sea', 'sea', false, ['nwg', 'nwy', 'stp']),
  t('nwg', 'Norwegian Sea', 'sea', false, ['bar', 'cly', 'edi', 'nao', 'nth', 'nwy']),

  // North Sea area
  t('nth', 'North Sea', 'sea', false, [
    'bel', 'den', 'edi', 'eng', 'hel', 'hol', 'lon', 'nwg', 'nwy', 'ska', 'wal', 'yor',
  ]),
  t('ska', 'Skagerrak', 'sea', false, ['den', 'nth', 'nwy', 'swe']),
  t('hel', 'Helgoland Bight', 'sea', false, ['den', 'hol', 'kie', 'nth']),
  t('eng', 'English Channel', 'sea', false, ['bel', 'bre', 'iri', 'lon', 'mao', 'nth', 'pic', 'wal']),
  t('iri', 'Irish Sea', 'sea', false, ['eng', 'lvp', 'mao', 'nao', 'wal']),

  // Atlantic / Mediterranean
  t('mao', 'Mid-Atlantic Ocean', 'sea', false, [
    'bre', 'eng', 'gas', 'iri', 'nao', 'naf', 'por', 'spa', 'wes',
  ]),
  t('wes', 'Western Mediterranean', 'sea', false, ['lyo', 'mao', 'naf', 'spa', 'tun', 'tys']),
  t('lyo', 'Gulf of Lyon', 'sea', false, ['mar', 'pie', 'spa', 'tus', 'tys', 'wes']),
  t('tys', 'Tyrrhenian Sea', 'sea', false, ['ion', 'lyo', 'naf', 'nap', 'rom', 'tun', 'tus', 'wes']),
  t('ion', 'Ionian Sea', 'sea', false, ['adr', 'aeg', 'alb', 'apu', 'eas', 'gre', 'nap', 'tun', 'tys']),
  t('adr', 'Adriatic Sea', 'sea', false, ['alb', 'apu', 'ion', 'tri', 'ven']),
  t('aeg', 'Aegean Sea', 'sea', false, ['bul', 'con', 'eas', 'gre', 'ion', 'smy']),
  t('eas', 'Eastern Mediterranean', 'sea', false, ['aeg', 'arm', 'ion', 'smy', 'syr']),

  // Black Sea
  t('bla', 'Black Sea', 'sea', false, ['ank', 'arm', 'bul', 'con', 'rum', 'sev']),

  // Baltic / Gulf of Bothnia
  t('bal', 'Baltic Sea', 'sea', false, ['ber', 'den', 'bot', 'kie', 'lvn', 'pru', 'swe']),
  t('bot', 'Gulf of Bothnia', 'sea', false, ['bal', 'fin', 'lvn', 'stp', 'swe']),

  // =========================================================================
  // NORTH AFRICA / MIDDLE EAST
  // =========================================================================
  t('naf', 'North Africa', 'coast', false, ['mao', 'tun', 'tys', 'wes']),
  t('tun', 'Tunisia', 'coast', true, ['ion', 'naf', 'tys', 'wes'], {
    homeNation: null,
  }),


];

// ---------------------------------------------------------------------------
// Namespace export helpers
// ---------------------------------------------------------------------------

/** Immutable record of all territories keyed by their ID */
export const territoryMap: Readonly<Record<string, Territory>> = Object.freeze(
  Object.fromEntries(TERRITORIES.map((t) => [t.id, t]))
);

/** Ordered array of all 75 territories */
export const territories: readonly Territory[] = Object.freeze(TERRITORIES);

/**
 * Look up a territory by its ID.
 * Throws if the ID is not found.
 */
export function getTerritory(id: string): Territory {
  const t = territoryMap[id];
  if (!t) {
    throw new Error(`Unknown territory ID: "${id}"`);
  }
  return t;
}

/**
 * Returns all supply centres on the board.
 */
export function getSupplyCenters(): readonly Territory[] {
  return territories.filter((t) => t.isSupplyCenter);
}

/**
 * Returns the home supply centres of the given nation.
 */
export function getHomeSupplyCenters(nation: string): readonly Territory[] {
  return territories.filter((t) => t.isSupplyCenter && t.homeNation === nation);
}

/**
 * Checks whether two territories are adjacent (army movement — ignores coasts).
 */
export function areAdjacent(fromId: string, toId: string): boolean {
  const from = getTerritory(fromId);
  return from.adjacencies.includes(toId);
}

/**
 * Checks whether a fleet can move between two territories, taking into account
 * coast specifiers for dual-coast territories.
 *
 * @param fromId   Source territory ID (optionally with coast: ``'bul-sc'``)
 * @param toId     Destination territory ID (optionally with coast: ``'con'``)
 */
export function areAdjacentForFleet(fromId: string, toId: string): boolean {
  const [from, fromCoast] = parseCoastId(fromId);
  const [to] = parseCoastId(toId);

  const fromTerritory = getTerritory(from);
  const toTerritory = getTerritory(to);

  // Fleets cannot enter land-only territories
  if (toTerritory.type === 'land') return false;
  if (fromTerritory.type === 'land') return false;

  // If source has coast-specific adjacencies and a coast is specified, use them
  if (fromCoast && fromTerritory.coastAdjacencies) {
    const coastKey = fromCoast as 'nc' | 'sc' | 'ec';
    const coastNeighbours = fromTerritory.coastAdjacencies[coastKey];
    if (coastNeighbours) {
      // Check if destination (with or without coast) appears in coast neighbours
      return coastNeighbours.some((n) => parseCoastId(n)[0] === to);
    }
  }

  // Fall back to standard adjacency
  return fromTerritory.adjacencies.includes(to);
}

// ---------------------------------------------------------------------------
// Internal utils
// ---------------------------------------------------------------------------

/**
 * Splits a territory+coast string (e.g. ``'bul-sc'``) into ``[id, coast]``.
 */
function parseCoastId(id: string): [string, string | undefined] {
  const parts = id.split('-');
  return [parts[0], parts[1]];
}
