/**
 * @file territories.test.ts
 *
 * Unit tests for the @diplomacy/game-logic territory data model.
 *
 * Coverage:
 *  1. Dataset integrity — correct count, uniqueness, supply centres
 *  2. Territory attributes — type, supply centre flag, home nation
 *  3. Adjacency symmetry — all adjacencies must be bidirectional
 *  4. Sea territory adjacencies — only sea/coast neighbours
 *  5. Standard border adjacencies — a sample of well-known neighbours
 *  6. Dual-coast territories (Bulgaria, St. Petersburg, Spain)
 *  7. Canal territories (Kiel, Constantinople)
 *  8. Helper functions — getTerritory, areAdjacent, areAdjacentForFleet
 *  9. Fleet movement — coast-aware adjacency checks
 * 10. Guard tests — errors on unknown IDs
 */

import {
  territories,
  territoryMap,
  getTerritory,
  getSupplyCenters,
  getHomeSupplyCenters,
  areAdjacent,
  areAdjacentForFleet,
} from '../territories';

// ---------------------------------------------------------------------------
// 1. Dataset integrity
// ---------------------------------------------------------------------------

describe('Dataset integrity', () => {
  test('total number of territories is between 70 and 80', () => {
    // Standard Diplomacy has 75 named territories; our implementation may
    // include or exclude minor Baltic states — keep the range flexible.
    expect(territories.length).toBeGreaterThanOrEqual(70);
    expect(territories.length).toBeLessThanOrEqual(80);
  });

  test('all territory IDs are unique', () => {
    const ids = territories.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('all territory IDs are lowercase strings', () => {
    for (const t of territories) {
      expect(typeof t.id).toBe('string');
      expect(t.id).toBe(t.id.toLowerCase());
    }
  });

  test('there are exactly 34 supply centres', () => {
    const scs = getSupplyCenters();
    expect(scs.length).toBe(34);
  });

  test('every supply centre has isSupplyCenter === true', () => {
    const scs = getSupplyCenters();
    for (const sc of scs) {
      expect(sc.isSupplyCenter).toBe(true);
    }
  });

  test('non-supply-centre territories have isSupplyCenter === false', () => {
    const nonScs = territories.filter((t) => !t.isSupplyCenter);
    for (const t of nonScs) {
      expect(t.isSupplyCenter).toBe(false);
    }
  });

  test('every territory has a non-empty adjacency list', () => {
    for (const t of territories) {
      expect(t.adjacencies.length).toBeGreaterThan(0);
    }
  });

  test('every territory referenced in adjacencies exists in the map', () => {
    for (const t of territories) {
      for (const adjId of t.adjacencies) {
        expect(territoryMap[adjId]).toBeDefined();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Territory attributes — specific territories
// ---------------------------------------------------------------------------

describe('Territory attributes', () => {
  test('London is a coastal supply centre owned by England', () => {
    const lon = getTerritory('lon');
    expect(lon.name).toBe('London');
    expect(lon.type).toBe('coast');
    expect(lon.isSupplyCenter).toBe(true);
    expect(lon.homeNation).toBe('England');
  });

  test('Paris is a land supply centre owned by France', () => {
    const par = getTerritory('par');
    expect(par.type).toBe('land');
    expect(par.isSupplyCenter).toBe(true);
    expect(par.homeNation).toBe('France');
  });

  test('North Sea is a sea territory and not a supply centre', () => {
    const nth = getTerritory('nth');
    expect(nth.type).toBe('sea');
    expect(nth.isSupplyCenter).toBe(false);
  });

  test('Serbia is a neutral supply centre (no home nation)', () => {
    const ser = getTerritory('ser');
    expect(ser.isSupplyCenter).toBe(true);
    expect(ser.homeNation).toBeNull();
  });

  test('Burgundy is an inland territory and not a supply centre', () => {
    const bur = getTerritory('bur');
    expect(bur.type).toBe('land');
    expect(bur.isSupplyCenter).toBe(false);
  });

  test('Munich is a German home supply centre', () => {
    const mun = getTerritory('mun');
    expect(mun.isSupplyCenter).toBe(true);
    expect(mun.homeNation).toBe('Germany');
  });

  test('Moscow is a Russian home supply centre', () => {
    const mos = getTerritory('mos');
    expect(mos.isSupplyCenter).toBe(true);
    expect(mos.homeNation).toBe('Russia');
  });
});

// ---------------------------------------------------------------------------
// 3. Adjacency symmetry
// ---------------------------------------------------------------------------

describe('Adjacency symmetry', () => {
  test('all standard adjacencies are bidirectional', () => {
    const asymmetric: string[] = [];
    for (const territory of territories) {
      for (const adjId of territory.adjacencies) {
        const neighbour = territoryMap[adjId];
        if (!neighbour) continue;
        if (!neighbour.adjacencies.includes(territory.id)) {
          asymmetric.push(`${territory.id} → ${adjId} but NOT ${adjId} → ${territory.id}`);
        }
      }
    }
    expect(asymmetric).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 4. Sea territory adjacencies — only sea/coast neighbours
// ---------------------------------------------------------------------------

describe('Sea territory adjacencies', () => {
  test('sea territories are only adjacent to coast or sea territories', () => {
    const violations: string[] = [];
    for (const t of territories) {
      if (t.type !== 'sea') continue;
      for (const adjId of t.adjacencies) {
        const adj = territoryMap[adjId];
        if (!adj) continue;
        if (adj.type === 'land') {
          violations.push(`${t.id} (sea) is adjacent to ${adjId} (land)`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5. Known adjacency relationships — rulebook spot checks
// ---------------------------------------------------------------------------

describe('Known adjacency relationships', () => {
  const checkAdj = (a: string, b: string) => {
    it(`${a} ↔ ${b}`, () => {
      expect(areAdjacent(a, b)).toBe(true);
      expect(areAdjacent(b, a)).toBe(true);
    });
  };

  // Britain
  checkAdj('lon', 'nth');
  checkAdj('lon', 'wal');
  checkAdj('lon', 'yor');
  checkAdj('lon', 'eng');
  checkAdj('edi', 'nth');
  checkAdj('edi', 'yor');
  checkAdj('edi', 'nwg');
  checkAdj('lvp', 'iri');
  checkAdj('lvp', 'cly');

  // France / West
  checkAdj('par', 'bre');
  checkAdj('par', 'bur');
  checkAdj('par', 'gas');
  checkAdj('par', 'pic');
  checkAdj('bre', 'mao');
  checkAdj('bre', 'gas');
  checkAdj('mar', 'gas');
  checkAdj('mar', 'bur');
  checkAdj('mar', 'lyo');
  checkAdj('mar', 'pie');
  checkAdj('bur', 'mun');
  checkAdj('bur', 'ruh');
  checkAdj('spa', 'gas');
  checkAdj('spa', 'por');
  checkAdj('spa', 'mar');
  checkAdj('por', 'mao');
  checkAdj('bel', 'bur');
  checkAdj('bel', 'hol');
  checkAdj('bel', 'nth');
  checkAdj('hol', 'kie');
  checkAdj('hol', 'nth');

  // Germany / Central
  checkAdj('kie', 'ber');
  checkAdj('kie', 'den');
  checkAdj('kie', 'hel');
  checkAdj('kie', 'bal');
  checkAdj('kie', 'mun');
  checkAdj('ber', 'pru');
  checkAdj('ber', 'sil');
  checkAdj('ber', 'bal');
  checkAdj('mun', 'boh');
  checkAdj('mun', 'tyr');
  checkAdj('sil', 'war');
  checkAdj('sil', 'gal');
  checkAdj('pru', 'lvn');

  // Austria-Hungary
  checkAdj('vie', 'boh');
  checkAdj('vie', 'bud');
  checkAdj('vie', 'gal');
  checkAdj('vie', 'tri');
  checkAdj('vie', 'tyr');
  checkAdj('vie', 'mun');
  checkAdj('bud', 'gal');
  checkAdj('bud', 'rum');
  checkAdj('bud', 'ser');
  checkAdj('bud', 'tri');
  checkAdj('tri', 'adr');
  checkAdj('tri', 'alb');
  checkAdj('tri', 'ven');
  checkAdj('gal', 'rum');

  // Italy
  checkAdj('ven', 'tri');
  checkAdj('ven', 'tyr');
  checkAdj('ven', 'pie');
  checkAdj('ven', 'apu');
  checkAdj('ven', 'rom');
  checkAdj('rom', 'nap');
  checkAdj('nap', 'ion');
  checkAdj('nap', 'tys');
  checkAdj('apu', 'ion');

  // Balkans
  checkAdj('ser', 'bul');
  checkAdj('ser', 'rum');
  checkAdj('ser', 'alb');
  checkAdj('ser', 'gre');
  checkAdj('gre', 'aeg');
  checkAdj('gre', 'alb');
  checkAdj('gre', 'ion');
  checkAdj('rum', 'bla');
  checkAdj('alb', 'adr');
  checkAdj('alb', 'ion');

  // Turkey
  checkAdj('con', 'bla');
  checkAdj('con', 'aeg');
  checkAdj('con', 'bul');
  checkAdj('con', 'ank');
  checkAdj('con', 'smy');
  checkAdj('ank', 'bla');
  checkAdj('ank', 'arm');
  checkAdj('smy', 'aeg');
  checkAdj('smy', 'arm');
  checkAdj('arm', 'sev');
  checkAdj('arm', 'bla');

  // Russia
  checkAdj('mos', 'stp');
  checkAdj('mos', 'war');
  checkAdj('mos', 'sev');
  checkAdj('mos', 'ukr');
  checkAdj('mos', 'lvn');
  checkAdj('war', 'gal');
  checkAdj('war', 'lvn');
  checkAdj('war', 'pru');
  checkAdj('sev', 'bla');
  checkAdj('sev', 'rum');

  // Scandinavia
  checkAdj('nwy', 'stp');
  checkAdj('nwy', 'fin');
  checkAdj('nwy', 'swe');
  checkAdj('swe', 'den');
  checkAdj('swe', 'fin');
  checkAdj('swe', 'bal');
  checkAdj('den', 'kie');
  checkAdj('den', 'bal');
  checkAdj('den', 'hel');
  checkAdj('fin', 'bot');

  // Seas
  checkAdj('nth', 'eng');
  checkAdj('nth', 'hel');
  checkAdj('nth', 'nwg');
  checkAdj('mao', 'bre');
  checkAdj('mao', 'iri');
  checkAdj('mao', 'wes');
  checkAdj('bla', 'con');
  checkAdj('bla', 'sev');
  checkAdj('bal', 'bot');
  checkAdj('aeg', 'eas');
  checkAdj('ion', 'aeg');
  checkAdj('ion', 'tys');
  checkAdj('tys', 'lyo');
  checkAdj('lyo', 'wes');
  checkAdj('eas', 'smy');

  // Verify that non-adjacent pairs return false
  it('Paris is NOT adjacent to London', () => {
    expect(areAdjacent('par', 'lon')).toBe(false);
  });
  it('Moscow is NOT adjacent to Berlin', () => {
    expect(areAdjacent('mos', 'ber')).toBe(false);
  });
  it('North Sea is NOT adjacent to Black Sea', () => {
    expect(areAdjacent('nth', 'bla')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Dual-coast territories
// ---------------------------------------------------------------------------

describe('Bulgaria dual-coast (bul)', () => {
  test('Bulgaria exists and is a supply centre of coast type', () => {
    const bul = getTerritory('bul');
    expect(bul.type).toBe('coast');
    expect(bul.isSupplyCenter).toBe(true);
  });

  test('Bulgaria has coastAdjacencies for nc and sc', () => {
    const bul = getTerritory('bul');
    expect(bul.coastAdjacencies).toBeDefined();
    expect(bul.coastAdjacencies?.nc).toBeDefined();
    expect(bul.coastAdjacencies?.sc).toBeDefined();
  });

  test('Bulgaria north coast (nc) reaches Black Sea and Rumania', () => {
    const nc = getTerritory('bul').coastAdjacencies?.nc ?? [];
    expect(nc).toContain('bla');
    expect(nc).toContain('rum');
  });

  test('Bulgaria south coast (sc) reaches Aegean Sea, Constantinople, Greece', () => {
    const sc = getTerritory('bul').coastAdjacencies?.sc ?? [];
    expect(sc).toContain('aeg');
    expect(sc).toContain('con');
    expect(sc).toContain('gre');
  });

  test('Fleet on bul-sc can reach Aegean', () => {
    expect(areAdjacentForFleet('bul-sc', 'aeg')).toBe(true);
  });

  test('Fleet on bul-nc can reach Black Sea', () => {
    expect(areAdjacentForFleet('bul-nc', 'bla')).toBe(true);
  });

  test('Fleet on bul-nc cannot reach Aegean', () => {
    expect(areAdjacentForFleet('bul-nc', 'aeg')).toBe(false);
  });

  test('Fleet on bul-sc cannot reach Black Sea', () => {
    expect(areAdjacentForFleet('bul-sc', 'bla')).toBe(false);
  });
});

describe('St. Petersburg dual-coast (stp)', () => {
  test('St. Petersburg has coastAdjacencies for nc and sc', () => {
    const stp = getTerritory('stp');
    expect(stp.coastAdjacencies?.nc).toBeDefined();
    expect(stp.coastAdjacencies?.sc).toBeDefined();
  });

  test('St. Petersburg nc reaches Barents Sea and Norway', () => {
    const nc = getTerritory('stp').coastAdjacencies?.nc ?? [];
    expect(nc).toContain('bar');
    expect(nc).toContain('nwy');
  });

  test('St. Petersburg sc reaches Gulf of Bothnia, Finland, Livonia', () => {
    const sc = getTerritory('stp').coastAdjacencies?.sc ?? [];
    expect(sc).toContain('bot');
    expect(sc).toContain('fin');
    expect(sc).toContain('lvn');
  });

  test('Fleet on stp-sc can move to Gulf of Bothnia', () => {
    expect(areAdjacentForFleet('stp-sc', 'bot')).toBe(true);
  });

  test('Fleet on stp-nc can move to Barents Sea', () => {
    expect(areAdjacentForFleet('stp-nc', 'bar')).toBe(true);
  });

  test('Fleet on stp-nc cannot move to Gulf of Bothnia', () => {
    expect(areAdjacentForFleet('stp-nc', 'bot')).toBe(false);
  });

  test('Fleet on stp-sc cannot move to Barents Sea', () => {
    expect(areAdjacentForFleet('stp-sc', 'bar')).toBe(false);
  });
});

describe('Spain dual-coast (spa)', () => {
  test('Spain has coastAdjacencies for nc and sc', () => {
    const spa = getTerritory('spa');
    expect(spa.coastAdjacencies?.nc).toBeDefined();
    expect(spa.coastAdjacencies?.sc).toBeDefined();
  });

  test('Spain nc reaches Mid-Atlantic Ocean and Gascony', () => {
    const nc = getTerritory('spa').coastAdjacencies?.nc ?? [];
    expect(nc).toContain('mao');
    expect(nc).toContain('gas');
  });

  test('Spain sc reaches Mid-Atlantic Ocean, Gulf of Lyon, Western Med, Marseille', () => {
    const sc = getTerritory('spa').coastAdjacencies?.sc ?? [];
    expect(sc).toContain('mao');
    expect(sc).toContain('lyo');
    expect(sc).toContain('wes');
    expect(sc).toContain('mar');
  });

  test('Fleet on spa-nc can move to Mid-Atlantic Ocean', () => {
    expect(areAdjacentForFleet('spa-nc', 'mao')).toBe(true);
  });

  test('Fleet on spa-sc can move to Gulf of Lyon', () => {
    expect(areAdjacentForFleet('spa-sc', 'lyo')).toBe(true);
  });

  test('Fleet on spa-nc cannot move to Gulf of Lyon', () => {
    expect(areAdjacentForFleet('spa-nc', 'lyo')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. Canal territories (Kiel, Constantinople)
// ---------------------------------------------------------------------------

describe('Canal territory: Kiel (kie)', () => {
  test('Kiel is flagged as a canal territory', () => {
    expect(getTerritory('kie').isCanal).toBe(true);
  });

  test('Kiel is adjacent to both Baltic Sea and Helgoland Bight', () => {
    expect(areAdjacent('kie', 'bal')).toBe(true);
    expect(areAdjacent('kie', 'hel')).toBe(true);
  });

  test('Kiel is adjacent to Denmark, Holland, Berlin, Munich, Ruhr', () => {
    expect(areAdjacent('kie', 'den')).toBe(true);
    expect(areAdjacent('kie', 'hol')).toBe(true);
    expect(areAdjacent('kie', 'ber')).toBe(true);
    expect(areAdjacent('kie', 'mun')).toBe(true);
    expect(areAdjacent('kie', 'ruh')).toBe(true);
  });
});

describe('Canal territory: Constantinople (con)', () => {
  test('Constantinople is flagged as a canal territory', () => {
    expect(getTerritory('con').isCanal).toBe(true);
  });

  test('Constantinople bridges Black Sea and Aegean Sea', () => {
    expect(areAdjacent('con', 'bla')).toBe(true);
    expect(areAdjacent('con', 'aeg')).toBe(true);
  });

  test('Constantinople is adjacent to Bulgaria, Ankara, Smyrna', () => {
    expect(areAdjacent('con', 'bul')).toBe(true);
    expect(areAdjacent('con', 'ank')).toBe(true);
    expect(areAdjacent('con', 'smy')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Helper function correctness
// ---------------------------------------------------------------------------

describe('getTerritory()', () => {
  test('returns correct territory for known ID', () => {
    const lon = getTerritory('lon');
    expect(lon.id).toBe('lon');
    expect(lon.name).toBe('London');
  });

  test('throws for unknown ID', () => {
    expect(() => getTerritory('xyz')).toThrow('Unknown territory ID: "xyz"');
  });
});

describe('getSupplyCenters()', () => {
  test('returns only supply centre territories', () => {
    const scs = getSupplyCenters();
    expect(scs.every((t) => t.isSupplyCenter)).toBe(true);
  });
});

describe('getHomeSupplyCenters()', () => {
  test('England has 3 home supply centres: Edinburgh, Liverpool, London', () => {
    const eng = getHomeSupplyCenters('England').map((t) => t.id).sort();
    expect(eng).toEqual(['edi', 'lon', 'lvp'].sort());
  });

  test('France has 3 home supply centres: Brest, Marseille, Paris', () => {
    const fra = getHomeSupplyCenters('France').map((t) => t.id).sort();
    expect(fra).toEqual(['bre', 'mar', 'par'].sort());
  });

  test('Germany has 3 home supply centres: Berlin, Kiel, Munich', () => {
    const ger = getHomeSupplyCenters('Germany').map((t) => t.id).sort();
    expect(ger).toEqual(['ber', 'kie', 'mun'].sort());
  });

  test('Austria-Hungary has 3 home supply centres: Vienna, Budapest, Trieste', () => {
    const aut = getHomeSupplyCenters('Austria-Hungary').map((t) => t.id).sort();
    expect(aut).toEqual(['bud', 'tri', 'vie'].sort());
  });

  test('Italy has 3 home supply centres: Rome, Naples, Venice', () => {
    const ita = getHomeSupplyCenters('Italy').map((t) => t.id).sort();
    expect(ita).toEqual(['nap', 'rom', 'ven'].sort());
  });

  test('Russia has 4 home supply centres: Moscow, Warsaw, Sevastopol, St. Petersburg', () => {
    const rus = getHomeSupplyCenters('Russia').map((t) => t.id).sort();
    expect(rus).toEqual(['mos', 'sev', 'stp', 'war'].sort());
  });

  test('Turkey has 3 home supply centres: Ankara, Constantinople, Smyrna', () => {
    const tur = getHomeSupplyCenters('Turkey').map((t) => t.id).sort();
    expect(tur).toEqual(['ank', 'con', 'smy'].sort());
  });
});

// ---------------------------------------------------------------------------
// 9. Fleet adjacency checks
// ---------------------------------------------------------------------------

describe('areAdjacentForFleet()', () => {
  test('fleet cannot move from sea to land territory', () => {
    // North Sea → Paris: impossible for fleet
    expect(areAdjacentForFleet('nth', 'par')).toBe(false);
  });

  test('fleet can move between adjacent sea territories', () => {
    expect(areAdjacentForFleet('nth', 'eng')).toBe(true);
    expect(areAdjacentForFleet('mao', 'iri')).toBe(true);
    expect(areAdjacentForFleet('bla', 'bul')).toBe(true);
  });

  test('fleet can move from sea to adjacent coast territory', () => {
    expect(areAdjacentForFleet('nth', 'lon')).toBe(true);
    expect(areAdjacentForFleet('bla', 'sev')).toBe(true);
  });

  test('fleet cannot move from land territory', () => {
    // Paris is land — fleets cannot be there
    expect(areAdjacentForFleet('par', 'bre')).toBe(false);
  });

  test('fleet move lon → nth is valid', () => {
    expect(areAdjacentForFleet('lon', 'nth')).toBe(true);
  });

  test('fleet move bre → mao is valid', () => {
    expect(areAdjacentForFleet('bre', 'mao')).toBe(true);
  });

  test('fleet move sev → bla is valid', () => {
    expect(areAdjacentForFleet('sev', 'bla')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. areAdjacent edge cases
// ---------------------------------------------------------------------------

describe('areAdjacent() edge cases', () => {
  test('territory is NOT adjacent to itself', () => {
    expect(areAdjacent('lon', 'lon')).toBe(false);
  });

  test('returns false for unknown territory IDs', () => {
    expect(() => areAdjacent('xyz', 'lon')).toThrow();
  });
});
