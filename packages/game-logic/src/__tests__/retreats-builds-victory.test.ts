/**
 * @file retreats-builds-victory.test.ts
 *
 * Tests for G5 (Retreat Phase), G6 (Build/Adjustment Phase), G11 (Victory).
 * Minimum 40 tests covering all edge cases.
 */

import { getRetreatOptions, resolveRetreats } from '../retreats';
import { calculateBuilds, validateBuildOrder, resolveBuilds } from '../builds';
import { checkVictory, VICTORY_SC_THRESHOLD, TOTAL_SUPPLY_CENTRES } from '../victory';
import type { Unit } from '../types/unit';
import type { ResolutionResult } from '../types/resolution';
import type { RetreatOrder } from '../types/retreat';
import type { BuildOrder, BuildCalculation } from '../types/build';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUnit(
  nation: string,
  type: 'army' | 'fleet',
  territory: string,
  coast?: 'nc' | 'sc' | 'ec',
): Unit {
  const id = `${nation.substring(0, 3).toLowerCase()}-${type === 'army' ? 'a' : 'f'}-${territory}`;
  return { id, type, nation, territory, coast };
}

/** Minimal empty resolution result */
function emptyResult(): ResolutionResult {
  return { moves: [], holds: [], supports: [], dislodged: [], bounces: [] };
}

// =========================================================================
// G5 — RETREAT PHASE
// =========================================================================

describe('G5 — Retreat Phase: getRetreatOptions', () => {
  test('dislodged army has adjacent unoccupied territories as retreat options', () => {
    const dislodged = makeUnit('Germany', 'army', 'mun');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'mun', attacker: 'fra-a-bur' }],
      moves: [{ unit: 'fra-a-bur', from: 'bur', to: 'mun', success: true, viaConvoy: false }],
    };
    // mun is adj to: boh, bur, kie, ruh, sil, tyr
    // bur is attacker origin → excluded
    const units = [makeUnit('France', 'army', 'mun')]; // occupier after move
    const options = getRetreatOptions(dislodged, result, units);

    expect(options).not.toContain('bur'); // attacker origin
    expect(options).not.toContain('mun'); // occupied by attacker
    expect(options).toContain('boh');
    expect(options).toContain('tyr');
    expect(options).toContain('sil');
    expect(options).toContain('kie');
    expect(options).toContain('ruh');
  });

  test('cannot retreat to a territory where a bounce occurred', () => {
    const dislodged = makeUnit('Austria-Hungary', 'army', 'vie');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'vie', attacker: 'ita-a-tyr' }],
      moves: [{ unit: 'ita-a-tyr', from: 'tyr', to: 'vie', success: true, viaConvoy: false }],
      bounces: [{ territory: 'boh', contestants: ['gal', 'sil'] }],
    };
    const units = [makeUnit('Italy', 'army', 'vie')];
    const options = getRetreatOptions(dislodged, result, units);

    expect(options).not.toContain('tyr'); // attacker origin
    expect(options).not.toContain('boh'); // bounce territory
    expect(options).toContain('bud');
    expect(options).toContain('gal');
  });

  test('cannot retreat to an occupied territory', () => {
    const dislodged = makeUnit('Germany', 'army', 'kie');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'kie', attacker: 'rus-a-ber' }],
      moves: [{ unit: 'rus-a-ber', from: 'ber', to: 'kie', success: true, viaConvoy: false }],
    };
    // hol is occupied by another unit
    const units = [
      makeUnit('Russia', 'army', 'kie'),
      makeUnit('France', 'army', 'hol'),
      makeUnit('Germany', 'army', 'ruh'),
    ];
    const options = getRetreatOptions(dislodged, result, units);

    expect(options).not.toContain('ber'); // attacker origin
    expect(options).not.toContain('hol'); // occupied
    expect(options).not.toContain('ruh'); // occupied
    expect(options).toContain('mun');
    expect(options).toContain('den');
  });

  test('army cannot retreat to sea territory', () => {
    const dislodged = makeUnit('England', 'army', 'lvp');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'lvp', attacker: 'fra-a-wal' }],
      moves: [{ unit: 'fra-a-wal', from: 'wal', to: 'lvp', success: true, viaConvoy: false }],
    };
    const units = [makeUnit('France', 'army', 'lvp')];
    const options = getRetreatOptions(dislodged, result, units);

    // lvp adj: cly, edi, iri, nao, wal, yor
    // wal = attacker origin, iri and nao = sea (army can't go), lvp = occupied
    expect(options).not.toContain('wal');
    expect(options).not.toContain('iri');
    expect(options).not.toContain('nao');
    expect(options).toContain('cly');
    expect(options).toContain('edi');
    expect(options).toContain('yor');
  });

  test('fleet cannot retreat to land territory', () => {
    const dislodged = makeUnit('France', 'fleet', 'bre');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'bre', attacker: 'eng-f-eng' }],
      moves: [{ unit: 'eng-f-eng', from: 'eng', to: 'bre', success: true, viaConvoy: false }],
    };
    const units = [makeUnit('England', 'fleet', 'bre')];
    const options = getRetreatOptions(dislodged, result, units);

    // bre adj: eng, gas, mao, par, pic
    // eng = attacker origin, par = land (fleet can't go)
    expect(options).not.toContain('eng');
    expect(options).not.toContain('par');
    expect(options).toContain('mao');
    expect(options).toContain('gas');
    expect(options).toContain('pic');
  });

  test('no retreat options returns empty array', () => {
    const dislodged = makeUnit('Turkey', 'fleet', 'con');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'con', attacker: 'rus-f-bla' }],
      moves: [{ unit: 'rus-f-bla', from: 'bla', to: 'con', success: true, viaConvoy: false }],
    };
    // All adjacent coast/sea territories occupied or blocked
    const units = [
      makeUnit('Russia', 'fleet', 'con'),
      makeUnit('Russia', 'fleet', 'aeg'),
      makeUnit('Greece', 'army', 'bul'),
      makeUnit('Turkey', 'army', 'ank'),
      makeUnit('Turkey', 'army', 'smy'),
    ];
    const options = getRetreatOptions(dislodged, result, units);

    // bla=attacker, aeg/ank/smy/bul=occupied → no valid retreat
    expect(options).toEqual([]);
  });

  test('retreat accounts for successful incoming moves occupying target', () => {
    const dislodged = makeUnit('Germany', 'army', 'mun');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'mun', attacker: 'fra-a-bur' }],
      moves: [
        { unit: 'fra-a-bur', from: 'bur', to: 'mun', success: true, viaConvoy: false },
        { unit: 'rus-a-war', from: 'war', to: 'sil', success: true, viaConvoy: false },
      ],
    };
    const units = [makeUnit('France', 'army', 'mun')];
    const options = getRetreatOptions(dislodged, result, units);

    // sil should be considered occupied because of the successful move
    expect(options).not.toContain('sil');
    expect(options).not.toContain('bur'); // attacker origin
  });
});

describe('G5 — Retreat Phase: resolveRetreats', () => {
  test('successful retreat relocates unit', () => {
    const dislodged = makeUnit('Germany', 'army', 'mun');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'mun', attacker: 'fra-a-bur' }],
      moves: [{ unit: 'fra-a-bur', from: 'bur', to: 'mun', success: true, viaConvoy: false }],
    };
    const currentUnits = [makeUnit('France', 'army', 'mun')];
    const orders: RetreatOrder[] = [{ unit: 'mun', target: 'boh' }];

    const retreatResult = resolveRetreats(orders, [dislodged], result, currentUnits);

    expect(retreatResult.relocated).toHaveLength(1);
    expect(retreatResult.relocated[0].to).toBe('boh');
    expect(retreatResult.destroyed).toHaveLength(0);
  });

  test('unit with no retreat order is destroyed', () => {
    const dislodged = makeUnit('Austria-Hungary', 'army', 'vie');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'vie', attacker: 'ita-a-tyr' }],
      moves: [{ unit: 'ita-a-tyr', from: 'tyr', to: 'vie', success: true, viaConvoy: false }],
    };
    const currentUnits = [makeUnit('Italy', 'army', 'vie')];

    const retreatResult = resolveRetreats([], [dislodged], result, currentUnits);

    expect(retreatResult.destroyed).toContain('vie');
    expect(retreatResult.relocated).toHaveLength(0);
  });

  test('explicit disband destroys unit', () => {
    const dislodged = makeUnit('Germany', 'army', 'mun');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'mun', attacker: 'fra-a-bur' }],
      moves: [{ unit: 'fra-a-bur', from: 'bur', to: 'mun', success: true, viaConvoy: false }],
    };
    const currentUnits = [makeUnit('France', 'army', 'mun')];
    const orders: RetreatOrder[] = [{ unit: 'mun', target: 'disband' }];

    const retreatResult = resolveRetreats(orders, [dislodged], result, currentUnits);

    expect(retreatResult.destroyed).toContain('mun');
    expect(retreatResult.retreats[0].reason).toBe('disbanded');
  });

  test('retreat to invalid destination destroys unit', () => {
    const dislodged = makeUnit('Germany', 'army', 'mun');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [{ unit: dislodged.id, from: 'mun', attacker: 'fra-a-bur' }],
      moves: [{ unit: 'fra-a-bur', from: 'bur', to: 'mun', success: true, viaConvoy: false }],
    };
    const currentUnits = [makeUnit('France', 'army', 'mun')];
    // bur is attacker origin → invalid
    const orders: RetreatOrder[] = [{ unit: 'mun', target: 'bur' }];

    const retreatResult = resolveRetreats(orders, [dislodged], result, currentUnits);

    expect(retreatResult.destroyed).toContain('mun');
    expect(retreatResult.retreats[0].reason).toBe('invalid_destination');
  });

  test('two units retreating to same territory → both destroyed (standoff)', () => {
    const dislodgedA = makeUnit('Germany', 'army', 'mun');
    const dislodgedB = makeUnit('Austria-Hungary', 'army', 'tyr');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [
        { unit: dislodgedA.id, from: 'mun', attacker: 'fra-a-bur' },
        { unit: dislodgedB.id, from: 'tyr', attacker: 'ita-a-ven' },
      ],
      moves: [
        { unit: 'fra-a-bur', from: 'bur', to: 'mun', success: true, viaConvoy: false },
        { unit: 'ita-a-ven', from: 'ven', to: 'tyr', success: true, viaConvoy: false },
      ],
    };
    const currentUnits = [
      makeUnit('France', 'army', 'mun'),
      makeUnit('Italy', 'army', 'tyr'),
    ];
    // Both try to retreat to boh
    const orders: RetreatOrder[] = [
      { unit: 'mun', target: 'boh' },
      { unit: 'tyr', target: 'boh' },
    ];

    const retreatResult = resolveRetreats(orders, [dislodgedA, dislodgedB], result, currentUnits);

    expect(retreatResult.destroyed).toContain('mun');
    expect(retreatResult.destroyed).toContain('tyr');
    expect(retreatResult.relocated).toHaveLength(0);
    const outcomes = retreatResult.retreats.filter((r) => r.reason === 'destroyed_standoff');
    expect(outcomes).toHaveLength(2);
  });

  test('mixed retreats: one succeeds, one fails, one disbanded', () => {
    const dA = makeUnit('Germany', 'army', 'mun');
    const dB = makeUnit('Austria-Hungary', 'army', 'vie');
    const dC = makeUnit('Italy', 'army', 'ven');
    const result: ResolutionResult = {
      ...emptyResult(),
      dislodged: [
        { unit: dA.id, from: 'mun', attacker: 'fra-a-bur' },
        { unit: dB.id, from: 'vie', attacker: 'rus-a-gal' },
        { unit: dC.id, from: 'ven', attacker: 'aut-a-tri' },
      ],
      moves: [
        { unit: 'fra-a-bur', from: 'bur', to: 'mun', success: true, viaConvoy: false },
        { unit: 'rus-a-gal', from: 'gal', to: 'vie', success: true, viaConvoy: false },
        { unit: 'aut-a-tri', from: 'tri', to: 'ven', success: true, viaConvoy: false },
      ],
    };
    const currentUnits = [
      makeUnit('France', 'army', 'mun'),
      makeUnit('Russia', 'army', 'vie'),
      makeUnit('Austria-Hungary', 'army', 'ven'),
    ];
    const orders: RetreatOrder[] = [
      { unit: 'mun', target: 'boh' },    // valid
      { unit: 'vie', target: 'gal' },    // invalid: attacker origin
      { unit: 'ven', target: 'disband' }, // disband
    ];

    const retreatResult = resolveRetreats(orders, [dA, dB, dC], result, currentUnits);

    expect(retreatResult.relocated).toHaveLength(1);
    expect(retreatResult.relocated[0].to).toBe('boh');
    expect(retreatResult.destroyed).toContain('vie');
    expect(retreatResult.destroyed).toContain('ven');
  });
});

// =========================================================================
// G6 — BUILD / ADJUSTMENT PHASE
// =========================================================================

describe('G6 — Build Phase: calculateBuilds', () => {
  test('nation with more SCs than units has positive diff', () => {
    const units = [makeUnit('England', 'fleet', 'lon')];
    const allUnits = [...units];
    const calc = calculateBuilds('England', ['lon', 'edi', 'lvp'], units, allUnits);

    expect(calc.diff).toBe(2); // 3 SCs - 1 unit
    expect(calc.availableHomeSCs).toContain('edi');
    expect(calc.availableHomeSCs).toContain('lvp');
    expect(calc.availableHomeSCs).not.toContain('lon'); // occupied
  });

  test('nation with fewer SCs than units has negative diff', () => {
    const units = [
      makeUnit('France', 'army', 'par'),
      makeUnit('France', 'army', 'bur'),
      makeUnit('France', 'fleet', 'mao'),
    ];
    const allUnits = [...units];
    const calc = calculateBuilds('France', ['par'], units, allUnits);

    expect(calc.diff).toBe(-2); // 1 SC - 3 units
  });

  test('nation with equal SCs and units has zero diff', () => {
    const units = [
      makeUnit('Germany', 'army', 'ber'),
      makeUnit('Germany', 'army', 'mun'),
      makeUnit('Germany', 'fleet', 'kie'),
    ];
    const allUnits = [...units];
    const calc = calculateBuilds('Germany', ['ber', 'mun', 'kie'], units, allUnits);

    expect(calc.diff).toBe(0);
  });

  test('home SC occupied by foreign unit is not available for builds', () => {
    const engUnits = [makeUnit('England', 'fleet', 'nth')];
    const allUnits = [
      ...engUnits,
      makeUnit('France', 'army', 'lvp'), // enemy on English home SC
    ];
    const calc = calculateBuilds('England', ['lon', 'edi', 'lvp'], engUnits, allUnits);

    expect(calc.diff).toBe(2); // 3 SCs - 1 unit
    expect(calc.availableHomeSCs).toContain('lon');
    expect(calc.availableHomeSCs).toContain('edi');
    expect(calc.availableHomeSCs).not.toContain('lvp'); // occupied by France
  });

  test('home SC not currently controlled is not available for builds', () => {
    const units = [makeUnit('England', 'fleet', 'nth')];
    const allUnits = [...units];
    // England controls lon and edi, but NOT lvp (lost it)
    const calc = calculateBuilds('England', ['lon', 'edi'], units, allUnits);

    expect(calc.availableHomeSCs).not.toContain('lvp');
    expect(calc.availableHomeSCs).toContain('lon');
    expect(calc.availableHomeSCs).toContain('edi');
  });

  test('home SC occupied by own unit is not available for builds', () => {
    const units = [
      makeUnit('Germany', 'army', 'ber'),
      makeUnit('Germany', 'army', 'mun'),
    ];
    const allUnits = [...units];
    // Germany controls all 3 home SCs + 1 extra, has 2 units → diff = 2
    const calc = calculateBuilds('Germany', ['ber', 'mun', 'kie', 'hol'], units, allUnits);

    expect(calc.diff).toBe(2);
    // ber and mun are occupied by own units
    expect(calc.availableHomeSCs).toEqual(['kie']);
  });
});

describe('G6 — Build Phase: validateBuildOrder', () => {
  test('valid army build on unoccupied home SC', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'Germany', territory: 'ber', unitType: 'army',
    };
    const result = validateBuildOrder(order, 'Germany', ['ber', 'kie'], []);
    expect(result.valid).toBe(true);
  });

  test('valid fleet build on coastal home SC', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'England', territory: 'lon', unitType: 'fleet',
    };
    const result = validateBuildOrder(order, 'England', ['lon', 'edi'], []);
    expect(result.valid).toBe(true);
  });

  test('fleet build on dual-coast territory requires coast specifier', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'Russia', territory: 'stp', unitType: 'fleet',
    };
    const result = validateBuildOrder(order, 'Russia', ['stp'], []);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('coast');
  });

  test('fleet build on dual-coast territory with valid coast succeeds', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'Russia', territory: 'stp', unitType: 'fleet', coast: 'nc',
    };
    const result = validateBuildOrder(order, 'Russia', ['stp'], []);
    expect(result.valid).toBe(true);
  });

  test('cannot build army on sea territory', () => {
    // This is hypothetical since no home SC is a sea territory,
    // but tests the validation logic
    const order: BuildOrder = {
      type: 'build', nation: 'England', territory: 'nth', unitType: 'army',
    };
    const result = validateBuildOrder(order, 'England', ['nth'], []);
    expect(result.valid).toBe(false);
  });

  test('cannot build fleet on inland territory', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'France', territory: 'par', unitType: 'fleet',
    };
    const result = validateBuildOrder(order, 'France', ['par'], []);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('land');
  });

  test('cannot build on territory not in available home SCs', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'Germany', territory: 'hol', unitType: 'army',
    };
    const result = validateBuildOrder(order, 'Germany', ['ber', 'kie'], []);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not an available home supply centre');
  });

  test('build order must specify unit type', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'Germany', territory: 'ber',
    };
    const result = validateBuildOrder(order, 'Germany', ['ber'], []);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('unit type');
  });

  test('wrong nation rejected', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'France', territory: 'ber', unitType: 'army',
    };
    const result = validateBuildOrder(order, 'Germany', ['ber'], []);
    expect(result.valid).toBe(false);
  });

  test('valid disband order', () => {
    const units = [makeUnit('France', 'army', 'par')];
    const order: BuildOrder = {
      type: 'disband', nation: 'France', territory: 'par',
    };
    const result = validateBuildOrder(order, 'France', [], units);
    expect(result.valid).toBe(true);
  });

  test('cannot disband unit that does not exist', () => {
    const units = [makeUnit('France', 'army', 'par')];
    const order: BuildOrder = {
      type: 'disband', nation: 'France', territory: 'bre',
    };
    const result = validateBuildOrder(order, 'France', [], units);
    expect(result.valid).toBe(false);
  });

  test('army cannot have coast specifier in build', () => {
    const order: BuildOrder = {
      type: 'build', nation: 'Russia', territory: 'stp', unitType: 'army', coast: 'nc',
    };
    const result = validateBuildOrder(order, 'Russia', ['stp'], []);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('coast');
  });
});

describe('G6 — Build Phase: resolveBuilds', () => {
  test('nation builds units up to diff on available home SCs', () => {
    const calc: BuildCalculation = {
      nation: 'England',
      homeSCs: ['lon', 'edi', 'lvp'],
      controlledSCs: ['lon', 'edi', 'lvp', 'nwy'],
      currentUnitCount: 2,
      diff: 2,
      availableHomeSCs: ['edi', 'lvp'],
    };
    const orders: BuildOrder[] = [
      { type: 'build', nation: 'England', territory: 'edi', unitType: 'fleet' },
      { type: 'build', nation: 'England', territory: 'lvp', unitType: 'army' },
    ];
    const units = [makeUnit('England', 'fleet', 'lon'), makeUnit('England', 'fleet', 'nth')];

    const result = resolveBuilds(orders, [calc], units);

    expect(result.builds).toHaveLength(2);
    expect(result.builds[0]).toEqual({ nation: 'England', territory: 'edi', unitType: 'fleet', coast: undefined });
    expect(result.builds[1]).toEqual({ nation: 'England', territory: 'lvp', unitType: 'army', coast: undefined });
    expect(result.invalid).toHaveLength(0);
  });

  test('excess build orders beyond diff are rejected', () => {
    const calc: BuildCalculation = {
      nation: 'Germany',
      homeSCs: ['ber', 'kie', 'mun'],
      controlledSCs: ['ber', 'kie', 'mun', 'hol'],
      currentUnitCount: 3,
      diff: 1,
      availableHomeSCs: ['ber'],
    };
    const orders: BuildOrder[] = [
      { type: 'build', nation: 'Germany', territory: 'ber', unitType: 'army' },
      { type: 'build', nation: 'Germany', territory: 'kie', unitType: 'fleet' }, // no room
    ];
    const units = [
      makeUnit('Germany', 'army', 'mun'),
      makeUnit('Germany', 'fleet', 'kie'),
      makeUnit('Germany', 'army', 'hol'),
    ];

    const result = resolveBuilds(orders, [calc], units);

    expect(result.builds).toHaveLength(1);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reason).toContain('limit');
  });

  test('disband orders processed correctly', () => {
    const calc: BuildCalculation = {
      nation: 'France',
      homeSCs: ['par', 'bre', 'mar'],
      controlledSCs: ['par'],
      currentUnitCount: 3,
      diff: -2,
      availableHomeSCs: [],
    };
    const units = [
      makeUnit('France', 'army', 'par'),
      makeUnit('France', 'army', 'bur'),
      makeUnit('France', 'fleet', 'mao'),
    ];
    const orders: BuildOrder[] = [
      { type: 'disband', nation: 'France', territory: 'bur' },
      { type: 'disband', nation: 'France', territory: 'mao' },
    ];

    const result = resolveBuilds(orders, [calc], units);

    expect(result.disbands).toHaveLength(2);
    expect(result.disbands.map((d) => d.territory)).toContain('bur');
    expect(result.disbands.map((d) => d.territory)).toContain('mao');
  });

  test('orders for nation with diff=0 are all invalid', () => {
    const calc: BuildCalculation = {
      nation: 'Italy',
      homeSCs: ['rom', 'nap', 'ven'],
      controlledSCs: ['rom', 'nap', 'ven'],
      currentUnitCount: 3,
      diff: 0,
      availableHomeSCs: [],
    };
    const orders: BuildOrder[] = [
      { type: 'build', nation: 'Italy', territory: 'rom', unitType: 'army' },
    ];
    const units = [
      makeUnit('Italy', 'army', 'rom'),
      makeUnit('Italy', 'army', 'ven'),
      makeUnit('Italy', 'fleet', 'nap'),
    ];

    const result = resolveBuilds(orders, [calc], units);

    expect(result.builds).toHaveLength(0);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reason).toContain('No adjustment needed');
  });

  test('cannot build twice on same territory in one phase', () => {
    const calc: BuildCalculation = {
      nation: 'England',
      homeSCs: ['lon', 'edi', 'lvp'],
      controlledSCs: ['lon', 'edi', 'lvp', 'nwy', 'den'],
      currentUnitCount: 2,
      diff: 3,
      availableHomeSCs: ['lon', 'edi', 'lvp'],
    };
    const orders: BuildOrder[] = [
      { type: 'build', nation: 'England', territory: 'lon', unitType: 'fleet' },
      { type: 'build', nation: 'England', territory: 'lon', unitType: 'army' }, // duplicate
      { type: 'build', nation: 'England', territory: 'edi', unitType: 'fleet' },
    ];
    const units = [
      makeUnit('England', 'fleet', 'nwy'),
      makeUnit('England', 'fleet', 'den'),
    ];

    const result = resolveBuilds(orders, [calc], units);

    expect(result.builds).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reason).toContain('already used');
  });
});

// =========================================================================
// G11 — VICTORY CONDITION
// =========================================================================

describe('G11 — Victory Condition: checkVictory', () => {
  test('VICTORY_SC_THRESHOLD is 18', () => {
    expect(VICTORY_SC_THRESHOLD).toBe(18);
  });

  test('TOTAL_SUPPLY_CENTRES is 34', () => {
    expect(TOTAL_SUPPLY_CENTRES).toBe(34);
  });

  test('no winner if no nation has 18+ SCs', () => {
    const result = checkVictory({
      England: ['lon', 'edi', 'lvp', 'nwy', 'den'],
      France: ['par', 'bre', 'mar', 'spa', 'por'],
      Germany: ['ber', 'mun', 'kie', 'hol', 'bel'],
      Russia: ['mos', 'war', 'sev', 'stp', 'rum'],
      'Austria-Hungary': ['vie', 'bud', 'tri', 'ser'],
      Italy: ['rom', 'nap', 'ven', 'tun', 'gre'],
      Turkey: ['ank', 'con', 'smy', 'bul'],
    });

    expect(result.gameOver).toBe(false);
    expect(result.winner).toBeNull();
    expect(result.winnerSCCount).toBe(0);
  });

  test('solo victory when a nation reaches exactly 18 SCs', () => {
    const scs = [
      'lon', 'edi', 'lvp', 'nwy', 'den', 'swe',
      'par', 'bre', 'mar', 'spa', 'por', 'bel',
      'hol', 'ber', 'mun', 'kie', 'war', 'stp',
    ]; // 18 SCs
    const result = checkVictory({
      England: scs,
      France: [],
      Germany: [],
    });

    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe('England');
    expect(result.winnerSCCount).toBe(18);
  });

  test('solo victory when a nation exceeds 18 SCs', () => {
    const scs = Array.from({ length: 22 }, (_, i) => `sc${i}`);
    const result = checkVictory({ France: scs, England: ['lon'] });

    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe('France');
    expect(result.winnerSCCount).toBe(22);
  });

  test('nation with 17 SCs does not win', () => {
    const scs = Array.from({ length: 17 }, (_, i) => `sc${i}`);
    const result = checkVictory({ Turkey: scs, Russia: ['mos'] });

    expect(result.gameOver).toBe(false);
    expect(result.winner).toBeNull();
  });

  test('scCounts are accurate for all nations', () => {
    const result = checkVictory({
      England: ['lon', 'edi', 'lvp'],
      France: ['par', 'bre', 'mar', 'spa', 'por'],
      Germany: [],
    });

    expect(result.scCounts.England).toBe(3);
    expect(result.scCounts.France).toBe(5);
    expect(result.scCounts.Germany).toBe(0);
  });

  test('eliminated nation (0 SCs) is reported correctly', () => {
    const scs = Array.from({ length: 18 }, (_, i) => `sc${i}`);
    const result = checkVictory({
      Russia: scs,
      England: [],
      France: [],
      Germany: [],
      'Austria-Hungary': [],
      Italy: [],
      Turkey: [],
    });

    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe('Russia');
    expect(result.scCounts.England).toBe(0);
    expect(result.scCounts.France).toBe(0);
  });

  test('empty input returns no winner', () => {
    const result = checkVictory({});

    expect(result.gameOver).toBe(false);
    expect(result.winner).toBeNull();
    expect(result.winnerSCCount).toBe(0);
  });

  test('single nation with fewer than 18 SCs does not win', () => {
    const result = checkVictory({ Italy: ['rom', 'nap', 'ven'] });

    expect(result.gameOver).toBe(false);
  });
});
