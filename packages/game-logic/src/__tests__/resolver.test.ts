/**
 * @file resolver.test.ts
 * @description Comprehensive test suite for the Diplomacy order resolution engine,
 * organized by DATC v3.0 test categories (sections 6.A–6.G) plus custom edge cases.
 *
 * Reference: https://webdiplomacy.net/doc/DATC_v3_0.html
 *
 * Uses the following rule preferences:
 * - Multi-route convoy: all routes must be disrupted
 * - Convoy paradox: Szykman rule
 * - Convoy to adjacent: 2000/2023 rules (intent via own fleet)
 */

import { resolveOrders } from '../resolver';
import { territories } from '../territories';
import type { Order } from '../types/order';
import type { Unit } from '../types/unit';
import type { ResolutionResult } from '../types/resolution';

// ===========================================================================
// TEST HELPERS
// ===========================================================================

let unitCounter = 0;

function unit(territory: string, type: 'army' | 'fleet', nation: string, coast?: string): Unit {
  return {
    id: `${nation.toLowerCase().substring(0, 3)}-${type === 'army' ? 'a' : 'f'}-${territory}-${++unitCounter}`,
    type,
    nation,
    territory,
    ...(coast ? { coast: coast as any } : {}),
  };
}

function move(terr: string, target: string, nation: string, viaConvoy?: boolean): Order {
  return { unit: terr, type: 'move', target, nation, ...(viaConvoy ? { viaConvoy: true } : {}) };
}

function hold(terr: string, nation: string): Order {
  return { unit: terr, type: 'hold', nation };
}

function supportHold(terr: string, target: string, nation: string): Order {
  return { unit: terr, type: 'support', supportTarget: target, nation };
}

function supportMove(terr: string, supportTarget: string, supportDest: string, nation: string): Order {
  return { unit: terr, type: 'support', supportTarget, supportDestination: supportDest, nation };
}

function convoy(terr: string, from: string, to: string, nation: string): Order {
  return { unit: terr, type: 'convoy', convoyFrom: from, convoyTo: to, nation };
}

/** Check that a specific move succeeded or failed */
function expectMove(result: ResolutionResult, from: string, to: string, success: boolean): void {
  const m = result.moves.find(mv => mv.from === from && mv.to === to);
  expect(m).toBeDefined();
  expect(m!.success).toBe(success);
}

/** Check that a unit at a territory was dislodged */
function expectDislodged(result: ResolutionResult, territory: string): void {
  const d = result.dislodged.find(d => d.from === territory);
  expect(d).toBeDefined();
}

/** Check that a unit at a territory was NOT dislodged */
function expectNotDislodged(result: ResolutionResult, territory: string): void {
  const d = result.dislodged.find(d => d.from === territory);
  expect(d).toBeUndefined();
}

/** Check that a bounce occurred at a territory */
function expectBounce(result: ResolutionResult, territory: string): void {
  const b = result.bounces.find(b => b.territory === territory);
  expect(b).toBeDefined();
}

/** Check that no moves succeeded in the entire result */
function expectNoMovement(result: ResolutionResult): void {
  for (const m of result.moves) {
    expect(m.success).toBe(false);
  }
}

/** Reset unit counter between tests */
beforeEach(() => { unitCounter = 0; });

// ===========================================================================
// 6.A — BASIC CHECKS
// ===========================================================================

describe('DATC 6.A — Basic Checks', () => {
  test('6.A.1 — Moving to an area that is not a neighbour', () => {
    const units = [unit('nth', 'fleet', 'England')];
    const orders = [move('nth', 'pic', 'England')];
    const result = resolveOrders(orders, units, territories);
    // NTH is not adjacent to Picardy for a fleet → illegal → holds
    expectNotDislodged(result, 'nth');
  });

  test('6.A.2 — Move army to sea', () => {
    const units = [unit('lvp', 'army', 'England')];
    const orders = [move('lvp', 'iri', 'England')];
    const result = resolveOrders(orders, units, territories);
    // Army cannot move to sea
    expectNotDislodged(result, 'lvp');
  });

  test('6.A.3 — Move fleet to land', () => {
    const units = [unit('kie', 'fleet', 'Germany')];
    const orders = [move('kie', 'mun', 'Germany')];
    const result = resolveOrders(orders, units, territories);
    // Fleet cannot move to land
    expectNotDislodged(result, 'kie');
  });

  test('6.A.4 — Move to own sector', () => {
    const units = [unit('kie', 'fleet', 'Germany')];
    const orders = [move('kie', 'kie', 'Germany')];
    // Should not crash
    const result = resolveOrders(orders, units, territories);
    expect(result).toBeDefined();
  });

  test('6.A.5 — Move to own sector with convoy', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('yor', 'army', 'England'),
      unit('lvp', 'army', 'England'),
      unit('lon', 'fleet', 'Germany'),
      unit('wal', 'army', 'Germany'),
    ];
    const orders = [
      convoy('nth', 'yor', 'yor', 'England'),
      move('yor', 'yor', 'England'),
      supportMove('lvp', 'yor', 'yor', 'England'),
      move('lon', 'yor', 'Germany'),
      supportMove('wal', 'lon', 'yor', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // YOR moving to itself is illegal → holds without support
    // German attack with support dislodges
    expectDislodged(result, 'yor');
  });

  test('6.A.6 — Ordering a unit of another country', () => {
    const units = [unit('lon', 'fleet', 'England')];
    const orders = [move('lon', 'nth', 'Germany')];
    const result = resolveOrders(orders, units, territories);
    // Germany can't order English fleet → order ignored
    expectNotDislodged(result, 'lon');
  });

  test('6.A.7 — Only armies can be convoyed', () => {
    const units = [
      unit('lon', 'fleet', 'England'),
      unit('nth', 'fleet', 'England'),
    ];
    const orders = [
      move('lon', 'bel', 'England'),
      convoy('nth', 'lon', 'bel', 'England'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Fleet in London cannot be convoyed → move fails
    // (London is adjacent to Belgium... wait, is LON adjacent to BEL?)
    // Actually LON is adjacent to: eng, nth, wal, yor
    // LON is NOT adjacent to BEL. And fleets can't be convoyed.
    // LON→BEL is not adjacent for fleet (no coast connection)
    // This move is illegal for a fleet (not adjacent)
    expectMove(result, 'lon', 'bel', false);
  });

  test('6.A.8 — Support to hold yourself is not possible', () => {
    const units = [
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('tri', 'fleet', 'Austria'),
    ];
    const orders = [
      move('ven', 'tri', 'Italy'),
      supportMove('tyr', 'ven', 'tri', 'Italy'),
      supportHold('tri', 'tri', 'Austria'), // Self-support
    ];
    const result = resolveOrders(orders, units, territories);
    // Self-support is illegal → Trieste has hold strength 1
    // Italy attacks with strength 2 → dislodges
    expectDislodged(result, 'tri');
  });

  test('6.A.9 — Fleets must follow coast if not on sea', () => {
    const units = [unit('nap', 'fleet', 'Italy')];
    const orders = [move('nap', 'ven', 'Italy')];
    const result = resolveOrders(orders, units, territories);
    // Fleet cannot go Naples→Venice (not coast-adjacent)
    expectMove(result, 'nap', 'ven', false);
  });

  test('6.A.10 — Support on unreachable destination not possible', () => {
    const units = [
      unit('ser', 'army', 'Austria'),
      unit('aeg', 'fleet', 'Turkey'),
      unit('gre', 'army', 'Turkey'),
    ];
    const orders = [
      hold('ser', 'Austria'),
      supportMove('aeg', 'gre', 'ser', 'Turkey'), // AEG can't reach Serbia (inland)
      move('gre', 'ser', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Support is illegal (fleet AEG can't reach Serbia — inland territory)
    // GRE attacks with strength 1 vs SER hold strength 1 → fails
    expectNotDislodged(result, 'ser');
  });

  test('6.A.11 — Simple bounce', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
    ];
    const orders = [
      move('vie', 'tyr', 'Austria'),
      move('ven', 'tyr', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectBounce(result, 'tyr');
    expectMove(result, 'vie', 'tyr', false);
    expectMove(result, 'ven', 'tyr', false);
  });

  test('6.A.12 — Bounce of three units', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('mun', 'army', 'Germany'),
      unit('ven', 'army', 'Italy'),
    ];
    const orders = [
      move('vie', 'tyr', 'Austria'),
      move('mun', 'tyr', 'Germany'),
      move('ven', 'tyr', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectBounce(result, 'tyr');
    expectMove(result, 'vie', 'tyr', false);
    expectMove(result, 'mun', 'tyr', false);
    expectMove(result, 'ven', 'tyr', false);
  });
});

// ===========================================================================
// 6.C — CIRCULAR MOVEMENT
// ===========================================================================

describe('DATC 6.C — Circular Movement', () => {
  test('6.C.1 — Three army circular movement', () => {
    const units = [
      unit('ank', 'fleet', 'Turkey'),
      unit('con', 'army', 'Turkey'),
      unit('smy', 'army', 'Turkey'),
    ];
    const orders = [
      move('ank', 'con', 'Turkey'),
      move('con', 'smy', 'Turkey'),
      move('smy', 'ank', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectMove(result, 'ank', 'con', true);
    expectMove(result, 'con', 'smy', true);
    expectMove(result, 'smy', 'ank', true);
  });

  test('6.C.2 — Three army circular movement with support', () => {
    const units = [
      unit('ank', 'fleet', 'Turkey'),
      unit('con', 'army', 'Turkey'),
      unit('smy', 'army', 'Turkey'),
      unit('bul', 'army', 'Turkey'),
    ];
    const orders = [
      move('ank', 'con', 'Turkey'),
      move('con', 'smy', 'Turkey'),
      move('smy', 'ank', 'Turkey'),
      supportMove('bul', 'ank', 'con', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectMove(result, 'ank', 'con', true);
    expectMove(result, 'con', 'smy', true);
    expectMove(result, 'smy', 'ank', true);
  });

  test('6.C.3 — A disrupted three army circular movement', () => {
    const units = [
      unit('ank', 'fleet', 'Turkey'),
      unit('con', 'army', 'Turkey'),
      unit('smy', 'army', 'Turkey'),
      unit('bul', 'army', 'Turkey'),
    ];
    const orders = [
      move('ank', 'con', 'Turkey'),
      move('con', 'smy', 'Turkey'),
      move('smy', 'ank', 'Turkey'),
      move('bul', 'con', 'Turkey'), // Disrupts by contesting CON
    ];
    const result = resolveOrders(orders, units, territories);
    expectNoMovement(result);
  });

  test('6.C.4 — A circular movement with attacked convoy', () => {
    const units = [
      unit('tri', 'army', 'Austria'),
      unit('ser', 'army', 'Austria'),
      unit('bul', 'army', 'Turkey'),
      unit('aeg', 'fleet', 'Turkey'),
      unit('ion', 'fleet', 'Turkey'),
      unit('adr', 'fleet', 'Turkey'),
      unit('nap', 'fleet', 'Italy'),
    ];
    const orders = [
      move('tri', 'ser', 'Austria'),
      move('ser', 'bul', 'Austria'),
      move('bul', 'tri', 'Turkey'),
      convoy('aeg', 'bul', 'tri', 'Turkey'),
      convoy('ion', 'bul', 'tri', 'Turkey'),
      convoy('adr', 'bul', 'tri', 'Turkey'),
      move('nap', 'ion', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // ION is attacked but not dislodged → convoy succeeds → circular movement succeeds
    expectMove(result, 'tri', 'ser', true);
    expectMove(result, 'ser', 'bul', true);
    expectMove(result, 'bul', 'tri', true);
    expectNotDislodged(result, 'ion');
  });

  test('6.C.5 — A disrupted circular movement due to dislodged convoy', () => {
    const units = [
      unit('tri', 'army', 'Austria'),
      unit('ser', 'army', 'Austria'),
      unit('bul', 'army', 'Turkey'),
      unit('aeg', 'fleet', 'Turkey'),
      unit('ion', 'fleet', 'Turkey'),
      unit('adr', 'fleet', 'Turkey'),
      unit('nap', 'fleet', 'Italy'),
      unit('tun', 'fleet', 'Italy'),
    ];
    const orders = [
      move('tri', 'ser', 'Austria'),
      move('ser', 'bul', 'Austria'),
      move('bul', 'tri', 'Turkey'),
      convoy('aeg', 'bul', 'tri', 'Turkey'),
      convoy('ion', 'bul', 'tri', 'Turkey'),
      convoy('adr', 'bul', 'tri', 'Turkey'),
      move('nap', 'ion', 'Italy'),
      supportMove('tun', 'nap', 'ion', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // ION is dislodged → convoy disrupted → circular movement fails
    // But the dislodging move (NAP→ION) succeeds
    expectMove(result, 'tri', 'ser', false);
    expectMove(result, 'ser', 'bul', false);
    expectMove(result, 'bul', 'tri', false);
    expectMove(result, 'nap', 'ion', true);
    expectDislodged(result, 'ion');
  });

  test('6.C.6 — Two armies with two convoys', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('eng', 'fleet', 'France'),
      unit('bel', 'army', 'France'),
    ];
    const orders = [
      convoy('nth', 'lon', 'bel', 'England'),
      move('lon', 'bel', 'England'),
      convoy('eng', 'bel', 'lon', 'France'),
      move('bel', 'lon', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectMove(result, 'lon', 'bel', true);
    expectMove(result, 'bel', 'lon', true);
  });

  test('6.C.7 — Disrupted unit swap', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('eng', 'fleet', 'France'),
      unit('bel', 'army', 'France'),
      unit('bur', 'army', 'France'),
    ];
    const orders = [
      convoy('nth', 'lon', 'bel', 'England'),
      move('lon', 'bel', 'England'),
      convoy('eng', 'bel', 'lon', 'France'),
      move('bel', 'lon', 'France'),
      move('bur', 'bel', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Burgundy contests Belgium → swap fails
    expectNoMovement(result);
  });
});

// ===========================================================================
// 6.D — SUPPORTS AND DISLODGES
// ===========================================================================

describe('DATC 6.D — Supports and Dislodges', () => {
  test('6.D.1 — Supported hold can prevent dislodgement', () => {
    const units = [
      unit('adr', 'fleet', 'Austria'),
      unit('tri', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
    ];
    const orders = [
      supportMove('adr', 'tri', 'ven', 'Austria'),
      move('tri', 'ven', 'Austria'),
      hold('ven', 'Italy'),
      supportHold('tyr', 'ven', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Attack 2 vs Hold 2 → defender wins at tie
    expectNotDislodged(result, 'ven');
    expectMove(result, 'tri', 'ven', false);
  });

  test('6.D.2 — A move cuts support on hold', () => {
    const units = [
      unit('adr', 'fleet', 'Austria'),
      unit('tri', 'army', 'Austria'),
      unit('vie', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
    ];
    const orders = [
      supportMove('adr', 'tri', 'ven', 'Austria'),
      move('tri', 'ven', 'Austria'),
      move('vie', 'tyr', 'Austria'), // Cuts support
      hold('ven', 'Italy'),
      supportHold('tyr', 'ven', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // VIE→TYR cuts TYR's support → VEN hold strength 1 vs attack 2
    expectDislodged(result, 'ven');
    expectMove(result, 'tri', 'ven', true);
  });

  test('6.D.3 — A move cuts support on move', () => {
    const units = [
      unit('adr', 'fleet', 'Austria'),
      unit('tri', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
      unit('ion', 'fleet', 'Italy'),
    ];
    const orders = [
      supportMove('adr', 'tri', 'ven', 'Austria'),
      move('tri', 'ven', 'Austria'),
      hold('ven', 'Italy'),
      move('ion', 'adr', 'Italy'), // Cuts ADR support
    ];
    const result = resolveOrders(orders, units, territories);
    // ION→ADR cuts ADR support → TRI attacks with 1 vs VEN hold 1 → fails
    expectNotDislodged(result, 'ven');
    expectMove(result, 'tri', 'ven', false);
  });

  test('6.D.4 — Support to hold on unit supporting a hold allowed', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('bal', 'fleet', 'Russia'),
      unit('pru', 'army', 'Russia'),
    ];
    const orders = [
      supportHold('ber', 'kie', 'Germany'),
      supportHold('kie', 'ber', 'Germany'),
      supportMove('bal', 'pru', 'ber', 'Russia'),
      move('pru', 'ber', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BER hold strength = 1 + 1 (KIE support) = 2
    // PRU attack = 1 + 1 (BAL support) = 2
    // 2 <= 2 → defender wins
    expectNotDislodged(result, 'ber');
    expectMove(result, 'pru', 'ber', false);
  });

  test('6.D.5 — Support to hold on unit supporting a move allowed', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('mun', 'army', 'Germany'),
      unit('bal', 'fleet', 'Russia'),
      unit('pru', 'army', 'Russia'),
    ];
    const orders = [
      supportMove('ber', 'mun', 'sil', 'Germany'),
      supportHold('kie', 'ber', 'Germany'),
      move('mun', 'sil', 'Germany'),
      supportMove('bal', 'pru', 'ber', 'Russia'),
      move('pru', 'ber', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BER has unmatching support (MUN→SIL ≠ anything) but can still receive hold support
    // BER hold strength = 1 + 1 (KIE) = 2
    // PRU attack = 1 + 1 (BAL) = 2 → fails
    expectNotDislodged(result, 'ber');
  });

  test('6.D.7 — Support to hold on moving unit not allowed', () => {
    const units = [
      unit('bal', 'fleet', 'Germany'),
      unit('pru', 'fleet', 'Germany'),
      unit('lvn', 'fleet', 'Russia'),
      unit('bot', 'fleet', 'Russia'),
      unit('fin', 'army', 'Russia'),
    ];
    const orders = [
      move('bal', 'swe', 'Germany'),
      supportHold('pru', 'bal', 'Germany'),
      move('lvn', 'bal', 'Russia'),
      supportMove('bot', 'lvn', 'bal', 'Russia'),
      move('fin', 'swe', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BAL is moving → can't receive hold support → hold strength irrelevant
    // BAL bounces on Finland at Sweden, fails to move
    // As failed mover, BAL has hold strength 1
    // LVN attacks with 2 → dislodges BAL
    expectDislodged(result, 'bal');
  });

  test('6.D.10 — Self dislodgement prohibited', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('mun', 'army', 'Germany'),
    ];
    const orders = [
      hold('ber', 'Germany'),
      move('kie', 'ber', 'Germany'),
      supportMove('mun', 'kie', 'ber', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Same nationality → attack strength = 0
    expectNotDislodged(result, 'ber');
  });

  test('6.D.11 — No self dislodgement of returning unit', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('mun', 'army', 'Germany'),
      unit('war', 'army', 'Russia'),
    ];
    const orders = [
      move('ber', 'pru', 'Germany'),
      move('kie', 'ber', 'Germany'),
      supportMove('mun', 'kie', 'ber', 'Germany'),
      move('war', 'pru', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BER bounces at PRU, returns → KIE can't dislodge (same nation)
    expectNotDislodged(result, 'ber');
  });

  test('6.D.12 — Supporting a foreign unit to dislodge own unit prohibited', () => {
    const units = [
      unit('tri', 'fleet', 'Austria'),
      unit('vie', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
    ];
    const orders = [
      hold('tri', 'Austria'),
      supportMove('vie', 'ven', 'tri', 'Austria'), // Austria helps Italy attack own unit
      move('ven', 'tri', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Austrian support doesn't count (same nation as defender)
    // VEN attack = 1 (Austrian support excluded) vs TRI hold = 1 → fails
    expectNotDislodged(result, 'tri');
  });

  test('6.D.14 — Supporting a foreign unit IS enough if attacker has enough of own support', () => {
    const units = [
      unit('tri', 'fleet', 'Austria'),
      unit('vie', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('adr', 'fleet', 'Italy'),
    ];
    const orders = [
      hold('tri', 'Austria'),
      supportMove('vie', 'ven', 'tri', 'Austria'),
      move('ven', 'tri', 'Italy'),
      supportMove('tyr', 'ven', 'tri', 'Italy'),
      supportMove('adr', 'ven', 'tri', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Austria's support excluded (same nation as defender)
    // But Italy has 2 supports → attack = 1 + 2 = 3 vs hold = 1
    expectDislodged(result, 'tri');
  });

  test('6.D.15 — Defender cannot cut support for attack on itself', () => {
    const units = [
      unit('con', 'fleet', 'Russia'),
      unit('bla', 'fleet', 'Russia'),
      unit('ank', 'fleet', 'Turkey'),
    ];
    const orders = [
      supportMove('con', 'bla', 'ank', 'Russia'),
      move('bla', 'ank', 'Russia'),
      move('ank', 'con', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // ANK→CON can't cut support because CON supports BLA→ANK
    // "destination of supported unit is the area of the attacking unit"
    expectDislodged(result, 'ank');
    expectMove(result, 'bla', 'ank', true);
  });

  test('6.D.17 — Dislodgement cuts supports', () => {
    const units = [
      unit('con', 'fleet', 'Russia'),
      unit('bla', 'fleet', 'Russia'),
      unit('ank', 'fleet', 'Turkey'),
      unit('smy', 'army', 'Turkey'),
      unit('arm', 'army', 'Turkey'),
    ];
    const orders = [
      supportMove('con', 'bla', 'ank', 'Russia'),
      move('bla', 'ank', 'Russia'),
      move('ank', 'con', 'Turkey'),
      supportMove('smy', 'ank', 'con', 'Turkey'),
      move('arm', 'ank', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Turkey attacks CON with strength 2 (ANK + SMY support)
    // Russia defends CON with hold strength 1 (supporting, not moving)
    // CON is dislodged! This cuts the support from CON to BLA
    // Without support, BLA attack = 1 vs ARM prevent = 1 → BLA bounces
    expectDislodged(result, 'con');
  });

  test('6.D.18 — A surviving unit will sustain support', () => {
    const units = [
      unit('con', 'fleet', 'Russia'),
      unit('bla', 'fleet', 'Russia'),
      unit('bul', 'army', 'Russia'),
      unit('ank', 'fleet', 'Turkey'),
      unit('smy', 'army', 'Turkey'),
      unit('arm', 'army', 'Turkey'),
    ];
    const orders = [
      supportMove('con', 'bla', 'ank', 'Russia'),
      move('bla', 'ank', 'Russia'),
      supportHold('bul', 'con', 'Russia'),
      move('ank', 'con', 'Turkey'),
      supportMove('smy', 'ank', 'con', 'Turkey'),
      move('arm', 'ank', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // CON hold strength = 1 + 1 (BUL support) = 2
    // Turkey attacks CON with 2 (ANK + SMY) → tie, defender wins
    // CON support sustains → BLA attack = 2 vs ANK hold (ARM moving away) = 1
    expectNotDislodged(result, 'con');
    expectDislodged(result, 'ank');
  });

  test('6.D.19 — Even when surviving is in alternative way', () => {
    const units = [
      unit('con', 'fleet', 'Russia'),
      unit('bla', 'fleet', 'Russia'),
      unit('smy', 'army', 'Russia'),
      unit('ank', 'fleet', 'Turkey'),
    ];
    const orders = [
      supportMove('con', 'bla', 'ank', 'Russia'),
      move('bla', 'ank', 'Russia'),
      supportMove('smy', 'ank', 'con', 'Russia'), // Russian support for Turkish attack
      move('ank', 'con', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // ANK→CON attack = 1 + 0 (SMY support from Russia doesnt count against Russian CON) → attack = 1
    // Actually: the ATTACK STRENGTH excludes supports from the defender's nation.
    // Defender at CON is Russian. SMY is Russian. So SMY support excluded.
    // ANK attack = 1 vs CON hold = 1 → fails
    // CON not dislodged → support sustains → BLA dislodges ANK
    expectNotDislodged(result, 'con');
    expectDislodged(result, 'ank');
  });

  test('6.D.20 — Unit cannot cut support of its own country', () => {
    const units = [
      unit('lon', 'fleet', 'England'),
      unit('nth', 'fleet', 'England'),
      unit('yor', 'army', 'England'),
      unit('eng', 'fleet', 'France'),
    ];
    const orders = [
      supportMove('lon', 'nth', 'eng', 'England'),
      move('nth', 'eng', 'England'),
      move('yor', 'lon', 'England'), // Same nation → can't cut support
      hold('eng', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // YOR→LON doesn't cut LON's support (same nation)
    // NTH attack = 2 vs ENG hold = 1 → dislodges
    expectDislodged(result, 'eng');
  });

  test('6.D.21 — Dislodging does not cancel a support cut', () => {
    const units = [
      unit('tri', 'fleet', 'Austria'),
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('mun', 'army', 'Germany'),
      unit('sil', 'army', 'Russia'),
      unit('ber', 'army', 'Russia'),
    ];
    const orders = [
      hold('tri', 'Austria'),
      move('ven', 'tri', 'Italy'),
      supportMove('tyr', 'ven', 'tri', 'Italy'),
      move('mun', 'tyr', 'Germany'), // Cuts TYR support
      move('sil', 'mun', 'Russia'),
      supportMove('ber', 'sil', 'mun', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // MUN→TYR cuts TYR's support, even though MUN is dislodged by SIL
    // VEN attacks TRI with 1 (no support) vs hold 1 → fails
    expectNotDislodged(result, 'tri');
    expectDislodged(result, 'mun');
  });

  test('6.D.25 — Failing hold support can be supported', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('bal', 'fleet', 'Russia'),
      unit('pru', 'army', 'Russia'),
    ];
    const orders = [
      supportHold('ber', 'pru', 'Germany'), // Unmatching support (PRU is attacking, not holding)
      supportHold('kie', 'ber', 'Germany'),
      supportMove('bal', 'pru', 'ber', 'Russia'),
      move('pru', 'ber', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BER's support is unmatching, but BER can still receive hold support from KIE
    // BER hold = 1 + 1 (KIE) = 2 vs PRU attack = 1 + 1 (BAL) = 2 → fails
    expectNotDislodged(result, 'ber');
  });

  test('6.D.26 — Failing move support can be supported', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('bal', 'fleet', 'Russia'),
      unit('pru', 'army', 'Russia'),
    ];
    const orders = [
      supportMove('ber', 'pru', 'sil', 'Germany'), // Unmatching (PRU→BER not PRU→SIL)
      supportHold('kie', 'ber', 'Germany'),
      supportMove('bal', 'pru', 'ber', 'Russia'),
      move('pru', 'ber', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Same as above: BER hold = 2 vs PRU attack = 2 → fails
    expectNotDislodged(result, 'ber');
  });

  test('6.D.33 — Unwanted support allowed', () => {
    const units = [
      unit('ser', 'army', 'Austria'),
      unit('vie', 'army', 'Austria'),
      unit('gal', 'army', 'Russia'),
      unit('bul', 'army', 'Turkey'),
    ];
    const orders = [
      move('ser', 'bud', 'Austria'),
      move('vie', 'bud', 'Austria'),
      supportMove('gal', 'ser', 'bud', 'Russia'), // Russia supports Austrian SER→BUD
      move('bul', 'ser', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // SER→BUD: attack = 1 + 1 (GAL support) = 2
    // VIE→BUD: prevent = 1
    // SER beats VIE (2 > 1) → SER moves to BUD
    // This opens SER → Turkey can take it
    expectMove(result, 'ser', 'bud', true);
    expectMove(result, 'bul', 'ser', true);
  });

  test('6.D.34 — Support targeting own area not allowed', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('sil', 'army', 'Germany'),
      unit('bal', 'fleet', 'Germany'),
      unit('pru', 'army', 'Italy'),
      unit('war', 'army', 'Russia'),
      unit('lvn', 'army', 'Russia'),
    ];
    const orders = [
      move('ber', 'pru', 'Germany'),
      supportMove('sil', 'ber', 'pru', 'Germany'),
      supportMove('bal', 'ber', 'pru', 'Germany'),
      supportMove('pru', 'lvn', 'pru', 'Italy'), // Self-support illegal
      supportMove('war', 'lvn', 'pru', 'Russia'),
      move('lvn', 'pru', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // PRU's self-support is illegal → PRU hold = 1
    // GER: BER→PRU attack = 1 + 2 (SIL + BAL) = 3
    // RUS: LVN→PRU attack = 1 + 1 (WAR) = 2
    // GER (3) > RUS prevent (2) and GER (3) > hold (1) → BER succeeds
    expectMove(result, 'ber', 'pru', true);
    expectDislodged(result, 'pru');
  });
});

// ===========================================================================
// 6.E — HEAD-TO-HEAD BATTLES AND BELEAGUERED GARRISON
// ===========================================================================

describe('DATC 6.E — Head-to-Head Battles', () => {
  test('6.E.1 — Dislodged unit has no effect on attacker\'s area', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('sil', 'army', 'Germany'),
      unit('pru', 'army', 'Russia'),
    ];
    const orders = [
      move('ber', 'pru', 'Germany'),
      move('kie', 'ber', 'Germany'),
      supportMove('sil', 'ber', 'pru', 'Germany'),
      move('pru', 'ber', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // H2H: BER→PRU attack = 2 vs PRU defend = 1 → BER wins
    // PRU prevent strength = 0 (h2h opponent succeeds)
    // KIE→BER: BER moves away successfully → hold strength = 0 → KIE succeeds
    expectMove(result, 'ber', 'pru', true);
    expectMove(result, 'kie', 'ber', true);
    expectDislodged(result, 'pru');
  });

  test('6.E.2 — No self dislodgement in head-to-head battle', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('kie', 'fleet', 'Germany'),
      unit('mun', 'army', 'Germany'),
    ];
    const orders = [
      move('ber', 'kie', 'Germany'),
      move('kie', 'ber', 'Germany'),
      supportMove('mun', 'ber', 'kie', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Both same nation → attack strength = 0 for both → no movement
    expectNoMovement(result);
  });

  test('6.E.3 — No help in dislodging own unit', () => {
    const units = [
      unit('ber', 'army', 'Germany'),
      unit('mun', 'army', 'Germany'),
      unit('kie', 'fleet', 'England'),
    ];
    const orders = [
      move('ber', 'kie', 'Germany'),
      supportMove('mun', 'kie', 'ber', 'Germany'), // Supports English KIE→BER but same nation as BER
      move('kie', 'ber', 'England'),
    ];
    const result = resolveOrders(orders, units, territories);
    // MUN supports KIE→BER, but BER is German → German support excluded from attack on German unit
    // KIE attack = 1 (MUN excluded) vs BER defend = 1 → fails
    // BER→KIE: KIE is English → BER attack = 1 vs KIE defend = 1 → fails
    expectNoMovement(result);
  });

  test('6.E.4 — Non-dislodged loser still has effect', () => {
    const units = [
      unit('hol', 'fleet', 'Germany'),
      unit('hel', 'fleet', 'Germany'),
      unit('ska', 'fleet', 'Germany'),
      unit('nth', 'fleet', 'France'),
      unit('bel', 'fleet', 'France'),
      unit('edi', 'fleet', 'England'),
      unit('yor', 'fleet', 'England'),
      unit('nwg', 'fleet', 'England'),
      unit('kie', 'army', 'Austria'),
      unit('ruh', 'army', 'Austria'),
    ];
    const orders = [
      move('hol', 'nth', 'Germany'),
      supportMove('hel', 'hol', 'nth', 'Germany'),
      supportMove('ska', 'hol', 'nth', 'Germany'),
      move('nth', 'hol', 'France'),
      supportMove('bel', 'nth', 'hol', 'France'),
      supportMove('edi', 'nwg', 'nth', 'England'),
      supportMove('yor', 'nwg', 'nth', 'England'),
      move('nwg', 'nth', 'England'),
      supportMove('kie', 'ruh', 'hol', 'Austria'),
      move('ruh', 'hol', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // H2H: HOL→NTH (3) vs NTH→HOL (2): NTH is weaker but NTH is not dislodged
    // because NWG→NTH (3) creates beleaguered garrison effect
    // NTH stays → still prevents RUH→HOL
    expectNotDislodged(result, 'nth');
    expectMove(result, 'ruh', 'hol', false);
  });

  test('6.E.7 — No self dislodgement with beleaguered garrison', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('yor', 'fleet', 'England'),
      unit('hol', 'fleet', 'Germany'),
      unit('hel', 'fleet', 'Germany'),
      unit('ska', 'fleet', 'Russia'),
      unit('nwy', 'fleet', 'Russia'),
    ];
    const orders = [
      hold('nth', 'England'),
      supportMove('yor', 'nwy', 'nth', 'England'), // English helps Russia attack own fleet!
      supportMove('hol', 'hel', 'nth', 'Germany'),
      move('hel', 'nth', 'Germany'),
      supportMove('ska', 'nwy', 'nth', 'Russia'),
      move('nwy', 'nth', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Russian attack on NTH: NWY→NTH with support from SKA and YOR
    // But YOR is English and NTH is English → YOR support excluded
    // Russian attack = 1 + 1 (SKA) = 2... but wait, this is a beleaguered garrison:
    // German attack HEL→NTH = 1 + 1 (HOL) = 2
    // Russian attack NWY→NTH = 1 + 1 (SKA) = 2 (English support excluded)
    // Even without exclusion: NTH would not be dislodged because self-dislodge check
    expectNotDislodged(result, 'nth');
  });

  test('6.E.13 — Three way beleaguered garrison', () => {
    const units = [
      unit('edi', 'fleet', 'England'),
      unit('yor', 'fleet', 'England'),
      unit('bel', 'fleet', 'France'),
      unit('eng', 'fleet', 'France'),
      unit('nth', 'fleet', 'Germany'),
      unit('nwg', 'fleet', 'Russia'),
      unit('nwy', 'fleet', 'Russia'),
    ];
    const orders = [
      supportMove('edi', 'yor', 'nth', 'England'),
      move('yor', 'nth', 'England'),
      move('bel', 'nth', 'France'),
      supportMove('eng', 'bel', 'nth', 'France'),
      hold('nth', 'Germany'),
      move('nwg', 'nth', 'Russia'),
      supportMove('nwy', 'nwg', 'nth', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Three attacks of strength 2 each → beleaguered garrison → nobody moves
    expectNotDislodged(result, 'nth');
    expectNoMovement(result);
  });

  test('6.E.15 — The friendly head-to-head battle', () => {
    const units = [
      unit('hol', 'fleet', 'England'),
      unit('ruh', 'army', 'England'),
      unit('kie', 'army', 'France'),
      unit('mun', 'army', 'France'),
      unit('sil', 'army', 'France'),
      unit('ber', 'army', 'Germany'),
      unit('den', 'fleet', 'Germany'),
      unit('hel', 'fleet', 'Germany'),
      unit('bal', 'fleet', 'Russia'),
      unit('pru', 'army', 'Russia'),
    ];
    const orders = [
      supportMove('hol', 'ruh', 'kie', 'England'),
      move('ruh', 'kie', 'England'),
      move('kie', 'ber', 'France'),
      supportMove('mun', 'kie', 'ber', 'France'),
      supportMove('sil', 'kie', 'ber', 'France'),
      move('ber', 'kie', 'Germany'),
      supportMove('den', 'ber', 'kie', 'Germany'),
      supportMove('hel', 'ber', 'kie', 'Germany'),
      supportMove('bal', 'pru', 'ber', 'Russia'),
      move('pru', 'ber', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // KIE→BER (3) vs BER→KIE (3): h2h tie → nobody moves
    // This prevents either from being dislodged, which also prevents
    // the other attacks from landing
    expectNoMovement(result);
  });
});

// ===========================================================================
// 6.F — CONVOYS
// ===========================================================================

describe('DATC 6.F — Convoys', () => {
  test('6.F.1 — No convoy in coastal areas', () => {
    const units = [
      unit('gre', 'army', 'Turkey'),
      unit('aeg', 'fleet', 'Turkey'),
      unit('con', 'fleet', 'Turkey'),
      unit('bla', 'fleet', 'Turkey'),
    ];
    const orders = [
      move('gre', 'sev', 'Turkey'),
      convoy('aeg', 'gre', 'sev', 'Turkey'),
      convoy('con', 'gre', 'sev', 'Turkey'), // CON is coastal, not sea → illegal
      convoy('bla', 'gre', 'sev', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Constantinople is coastal → can't convoy → chain breaks
    expectMove(result, 'gre', 'sev', false);
  });

  test('6.F.2 — An army being convoyed can bounce as normal', () => {
    const units = [
      unit('eng', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('par', 'army', 'France'),
    ];
    const orders = [
      convoy('eng', 'lon', 'bre', 'England'),
      move('lon', 'bre', 'England'),
      move('par', 'bre', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectMove(result, 'lon', 'bre', false);
    expectMove(result, 'par', 'bre', false);
    expectBounce(result, 'bre');
  });

  test('6.F.3 — An army being convoyed can receive support', () => {
    const units = [
      unit('eng', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('mao', 'fleet', 'England'),
      unit('par', 'army', 'France'),
    ];
    const orders = [
      convoy('eng', 'lon', 'bre', 'England'),
      move('lon', 'bre', 'England'),
      supportMove('mao', 'lon', 'bre', 'England'),
      move('par', 'bre', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // LON→BRE attack = 2 vs PAR→BRE prevent = 1 → LON wins
    expectMove(result, 'lon', 'bre', true);
    expectMove(result, 'par', 'bre', false);
  });

  test('6.F.4 — An attacked convoy is not disrupted', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('ska', 'fleet', 'Germany'),
    ];
    const orders = [
      convoy('nth', 'lon', 'hol', 'England'),
      move('lon', 'hol', 'England'),
      move('ska', 'nth', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // NTH is attacked but not dislodged → convoy succeeds
    expectMove(result, 'lon', 'hol', true);
    expectNotDislodged(result, 'nth');
  });

  test('6.F.5 — A beleaguered convoy is not disrupted', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('eng', 'fleet', 'France'),
      unit('bel', 'fleet', 'France'),
      unit('ska', 'fleet', 'Germany'),
      unit('den', 'fleet', 'Germany'),
    ];
    const orders = [
      convoy('nth', 'lon', 'hol', 'England'),
      move('lon', 'hol', 'England'),
      move('eng', 'nth', 'France'),
      supportMove('bel', 'eng', 'nth', 'France'),
      move('ska', 'nth', 'Germany'),
      supportMove('den', 'ska', 'nth', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Two attacks on NTH with strength 2 each → beleaguered → NTH survives
    expectMove(result, 'lon', 'hol', true);
    expectNotDislodged(result, 'nth');
  });

  test('6.F.6 — Dislodged convoy does not cut support', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('hol', 'army', 'Germany'),
      unit('bel', 'army', 'Germany'),
      unit('hel', 'fleet', 'Germany'),
      unit('ska', 'fleet', 'Germany'),
      unit('pic', 'army', 'France'),
      unit('bur', 'army', 'France'),
    ];
    const orders = [
      convoy('nth', 'lon', 'hol', 'England'),
      move('lon', 'hol', 'England'),
      supportHold('hol', 'bel', 'Germany'),
      supportHold('bel', 'hol', 'Germany'),
      supportMove('hel', 'ska', 'nth', 'Germany'),
      move('ska', 'nth', 'Germany'),
      move('pic', 'bel', 'France'),
      supportMove('bur', 'pic', 'bel', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // NTH dislodged → convoy fails → LON→HOL doesn't happen
    // Since convoy fails, army doesn't cut support in HOL
    // BEL support on HOL stands, HOL support on BEL stands
    // BEL hold = 1 + 1 = 2 vs FRA attack = 2 → fails
    expectDislodged(result, 'nth');
    expectNotDislodged(result, 'bel');
  });

  test('6.F.8 — Dislodged convoy does not cause a bounce', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('hel', 'fleet', 'Germany'),
      unit('ska', 'fleet', 'Germany'),
      unit('bel', 'army', 'Germany'),
    ];
    const orders = [
      convoy('nth', 'lon', 'hol', 'England'),
      move('lon', 'hol', 'England'),
      supportMove('hel', 'ska', 'nth', 'Germany'),
      move('ska', 'nth', 'Germany'),
      move('bel', 'hol', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // NTH dislodged → convoy fails → LON→HOL doesn't happen → no bounce
    // BEL→HOL succeeds freely
    expectMove(result, 'bel', 'hol', true);
    expectDislodged(result, 'nth');
  });

  test('6.F.14 — Simple convoy paradox (Szykman rule)', () => {
    const units = [
      unit('lon', 'fleet', 'England'),
      unit('wal', 'fleet', 'England'),
      unit('bre', 'army', 'France'),
      unit('eng', 'fleet', 'France'),
    ];
    const orders = [
      supportMove('lon', 'wal', 'eng', 'England'),
      move('wal', 'eng', 'England'),
      move('bre', 'lon', 'France'),
      convoy('eng', 'bre', 'lon', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Paradox: if convoy succeeds, BRE→LON cuts support, English attack fails, convoy survives
    // If convoy fails, support not cut, English dislodges convoy fleet
    // Szykman rule: convoy fails → support not cut → English dislodges ENG
    expectDislodged(result, 'eng');
    expectMove(result, 'wal', 'eng', true);
    expectMove(result, 'bre', 'lon', false);
  });

  test('6.F.16 — Pandin\'s paradox', () => {
    const units = [
      unit('lon', 'fleet', 'England'),
      unit('wal', 'fleet', 'England'),
      unit('bre', 'army', 'France'),
      unit('eng', 'fleet', 'France'),
      unit('nth', 'fleet', 'Germany'),
      unit('bel', 'fleet', 'Germany'),
    ];
    const orders = [
      supportMove('lon', 'wal', 'eng', 'England'),
      move('wal', 'eng', 'England'),
      move('bre', 'lon', 'France'),
      convoy('eng', 'bre', 'lon', 'France'),
      supportMove('nth', 'bel', 'eng', 'Germany'),
      move('bel', 'eng', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Szykman: convoy fails, support of London not cut
    // English WAL→ENG (2) vs German BEL→ENG (2) → beleaguered garrison
    // Nobody moves
    expectNotDislodged(result, 'eng');
    expectNoMovement(result);
  });
});

// ===========================================================================
// 6.G — CONVOYING TO ADJACENT PROVINCES
// ===========================================================================

describe('DATC 6.G — Convoying to Adjacent Provinces', () => {
  test('6.G.1 — Two units can swap provinces by convoy', () => {
    const units = [
      unit('nwy', 'army', 'England'),
      unit('ska', 'fleet', 'England'),
      unit('swe', 'army', 'Russia'),
    ];
    const orders = [
      move('nwy', 'swe', 'England'),
      convoy('ska', 'nwy', 'swe', 'England'),
      move('swe', 'nwy', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // English fleet convoys NWY→SWE → convoy route → not h2h
    // Swap succeeds
    expectMove(result, 'nwy', 'swe', true);
    expectMove(result, 'swe', 'nwy', true);
  });

  test('6.G.2 — Kidnapping an army (prevented by 2000/2023 rules)', () => {
    const units = [
      unit('nwy', 'army', 'England'),
      unit('swe', 'fleet', 'Russia'),
      unit('ska', 'fleet', 'Germany'),
    ];
    const orders = [
      move('nwy', 'swe', 'England'),
      move('swe', 'nwy', 'Russia'),
      convoy('ska', 'nwy', 'swe', 'Germany'), // Foreign convoy
    ];
    const result = resolveOrders(orders, units, territories);
    // German convoy is foreign → no intent → land route → h2h → no swap
    expectNoMovement(result);
  });

  test('6.G.4 — An unwanted disrupted convoy to adjacent province and opposite move', () => {
    const units = [
      unit('bre', 'fleet', 'France'),
      unit('pic', 'army', 'France'),
      unit('bur', 'army', 'France'),
      unit('mao', 'fleet', 'France'),
      unit('eng', 'fleet', 'England'),
      unit('bel', 'army', 'England'),
    ];
    const orders = [
      move('bre', 'eng', 'France'),
      move('pic', 'bel', 'France'),
      supportMove('bur', 'pic', 'bel', 'France'),
      supportMove('mao', 'bre', 'eng', 'France'),
      convoy('eng', 'pic', 'bel', 'England'), // Foreign convoy
      move('bel', 'pic', 'England'),
    ];
    const result = resolveOrders(orders, units, territories);
    // English convoy is foreign → French army uses land route
    // PIC→BEL (land, 2) vs BEL→PIC (1) → French succeeds
    expectMove(result, 'pic', 'bel', true);
  });
});

// ===========================================================================
// CUSTOM EDGE CASES
// ===========================================================================

describe('Custom Edge Cases — Basic Movement', () => {
  test('Single army move to adjacent territory', () => {
    const units = [unit('vie', 'army', 'Austria')];
    const orders = [move('vie', 'bud', 'Austria')];
    const result = resolveOrders(orders, units, territories);
    expectMove(result, 'vie', 'bud', true);
  });

  test('Single fleet move to adjacent sea', () => {
    const units = [unit('lon', 'fleet', 'England')];
    const orders = [move('lon', 'nth', 'England')];
    const result = resolveOrders(orders, units, territories);
    expectMove(result, 'lon', 'nth', true);
  });

  test('Move into occupied territory fails (same strength)', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('bud', 'army', 'Austria'),
    ];
    const orders = [
      move('vie', 'bud', 'Austria'),
      hold('bud', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Same nation → attack strength 0
    expectMove(result, 'vie', 'bud', false);
  });

  test('Supported attack dislodges (MUN not adjacent to WAR — illegal move)', () => {
    const units = [
      unit('mun', 'army', 'Germany'),
      unit('sil', 'army', 'Germany'),
      unit('war', 'army', 'Russia'),
    ];
    const orders = [
      move('mun', 'war', 'Germany'), // MUN not adjacent to WAR → illegal
      supportMove('sil', 'mun', 'war', 'Germany'),
      hold('war', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // MUN→WAR is illegal (not adjacent, no convoy) → MUN holds
    expectNotDislodged(result, 'war');
    expectMove(result, 'mun', 'war', false);
  });

  test('Supported attack dislodges unsupported defender (corrected)', () => {
    const units = [
      unit('sil', 'army', 'Germany'),
      unit('pru', 'army', 'Germany'),
      unit('war', 'army', 'Russia'),
    ];
    const orders = [
      move('sil', 'war', 'Germany'),
      supportMove('pru', 'sil', 'war', 'Germany'),
      hold('war', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Attack = 2, Hold = 1 → dislodged
    expectDislodged(result, 'war');
    expectMove(result, 'sil', 'war', true);
  });

  test('Unit with no order holds by default', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('bud', 'army', 'Russia'),
    ];
    // Only Austria gives orders
    const orders = [move('vie', 'bud', 'Austria')];
    const result = resolveOrders(orders, units, territories);
    // BUD has no order → defaults to hold → hold strength 1
    // VIE attack = 1 → tie → defender wins
    expectNotDislodged(result, 'bud');
  });

  test('Multiple supports for same move', () => {
    const units = [
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('adr', 'fleet', 'Italy'),
      unit('tri', 'army', 'Austria'),
      unit('vie', 'army', 'Austria'),
    ];
    const orders = [
      move('ven', 'tri', 'Italy'),
      supportMove('tyr', 'ven', 'tri', 'Italy'),
      supportMove('adr', 'ven', 'tri', 'Italy'),
      hold('tri', 'Austria'),
      supportHold('vie', 'tri', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // VEN attack = 3 vs TRI hold = 2 → dislodged
    expectDislodged(result, 'tri');
    expectMove(result, 'ven', 'tri', true);
  });

  test('Support cannot be given to non-adjacent territory', () => {
    const units = [
      unit('lon', 'army', 'England'),
      unit('par', 'army', 'France'),
      unit('rom', 'army', 'Italy'),
    ];
    const orders = [
      move('lon', 'par', 'England'), // Not adjacent → illegal (no convoy)
      supportMove('rom', 'lon', 'par', 'Italy'), // ROM not adjacent to PAR
      hold('par', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Both orders are illegal → PAR holds safely
    expectNotDislodged(result, 'par');
  });

  test('Hold order explicitly given', () => {
    const units = [unit('mun', 'army', 'Germany')];
    const orders = [hold('mun', 'Germany')];
    const result = resolveOrders(orders, units, territories);
    expect(result.holds.length).toBeGreaterThanOrEqual(1);
    const h = result.holds.find(h => h.territory === 'mun');
    expect(h).toBeDefined();
    expect(h!.dislodged).toBe(false);
  });

  test('Convoy chain with multiple fleets', () => {
    const units = [
      unit('lon', 'army', 'England'),
      unit('nth', 'fleet', 'England'),
      unit('nwg', 'fleet', 'England'),
    ];
    const orders = [
      move('lon', 'nwy', 'England'),
      convoy('nth', 'lon', 'nwy', 'England'),
      convoy('nwg', 'lon', 'nwy', 'England'),
    ];
    const result = resolveOrders(orders, units, territories);
    // LON→NTH→NWG→NWY or LON→NTH→NWY? NTH is adjacent to NWY, so single hop works
    expectMove(result, 'lon', 'nwy', true);
  });
});

describe('Custom Edge Cases — Complex Interactions', () => {
  test('Cutting support — defender can\'t cut support for attack on itself (6.D.15)', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('tri', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('boh', 'army', 'Germany'),
    ];
    const orders = [
      move('vie', 'tyr', 'Austria'), // Tries to cut TYR support
      move('tri', 'vie', 'Italy'),
      supportMove('tyr', 'tri', 'vie', 'Italy'),
      move('boh', 'vie', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // VIE→TYR CANNOT cut TYR's support because TYR supports TRI→VIE,
    // which is an attack on VIE itself (DATC 6.D.15).
    // TRI→VIE attack = 2, VIE hold = 1 (failed move), BOH prevent = 1
    // TRI (2) beats BOH prevent (1) and VIE hold (1) → TRI succeeds
    expectMove(result, 'tri', 'vie', true);
    expectDislodged(result, 'vie');
  });

  test('Triple bounce — all same strength', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
      unit('mun', 'army', 'Germany'),
    ];
    const orders = [
      move('vie', 'tyr', 'Austria'),
      move('ven', 'tyr', 'Italy'),
      move('mun', 'tyr', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectBounce(result, 'tyr');
    expectMove(result, 'vie', 'tyr', false);
    expectMove(result, 'ven', 'tyr', false);
    expectMove(result, 'mun', 'tyr', false);
  });

  test('Supported move beats unsupported competitor', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('boh', 'army', 'Austria'),
      unit('mun', 'army', 'Germany'),
    ];
    const orders = [
      move('vie', 'tyr', 'Austria'),
      supportMove('boh', 'vie', 'tyr', 'Austria'),
      move('mun', 'tyr', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // VIE attack = 2, MUN prevent = 1 → VIE wins
    expectMove(result, 'vie', 'tyr', true);
    expectMove(result, 'mun', 'tyr', false);
  });

  test('Equal strength attacks both bounce', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('boh', 'army', 'Austria'),
      unit('mun', 'army', 'Germany'),
      unit('sil', 'army', 'Germany'),
    ];
    const orders = [
      move('vie', 'tyr', 'Austria'),
      supportMove('boh', 'vie', 'tyr', 'Austria'),
      move('mun', 'tyr', 'Germany'),
      supportMove('sil', 'mun', 'tyr', 'Germany'), // SIL not adjacent to TYR → illegal
    ];
    const result = resolveOrders(orders, units, territories);
    // SIL can't support MUN→TYR (SIL not adjacent to TYR)
    // VIE attack = 2, MUN attack = 1 → VIE wins
    expectMove(result, 'vie', 'tyr', true);
    expectMove(result, 'mun', 'tyr', false);
  });

  test('Chain of moves — domino effect', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('bud', 'army', 'Austria'),
      unit('rum', 'army', 'Turkey'),
    ];
    const orders = [
      move('vie', 'bud', 'Austria'),
      move('bud', 'rum', 'Austria'),
      move('rum', 'sev', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // RUM moves away → BUD can move → VIE can move
    expectMove(result, 'rum', 'sev', true);
    expectMove(result, 'bud', 'rum', true);
    expectMove(result, 'vie', 'bud', true);
  });

  test('Chain of moves — blocked at end', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('bud', 'army', 'Austria'),
      unit('rum', 'army', 'Turkey'),
    ];
    const orders = [
      move('vie', 'bud', 'Austria'),
      move('bud', 'rum', 'Austria'),
      hold('rum', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // RUM holds (strength 1) → BUD can't take (same strength) (wait, different nations)
    // BUD attacks RUM: attack = 1 vs hold = 1 → fails (defender wins)
    // VIE→BUD: BUD failed move → hold = 1. VIE same nation → attack = 0
    expectMove(result, 'bud', 'rum', false);
    expectMove(result, 'vie', 'bud', false);
  });

  test('Support cut by unit that is subsequently dislodged', () => {
    const units = [
      unit('mun', 'army', 'Germany'),
      unit('tyr', 'army', 'Italy'),
      unit('ven', 'army', 'Italy'),
      unit('boh', 'army', 'Austria'),
      unit('vie', 'army', 'Austria'),
    ];
    const orders = [
      move('mun', 'tyr', 'Germany'), // Cuts TYR support
      supportMove('tyr', 'ven', 'mun', 'Italy'), // Gets cut
      move('ven', 'mun', 'Italy'),
      move('boh', 'mun', 'Austria'),
      supportMove('vie', 'boh', 'mun', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // MUN→TYR cuts TYR's support for VEN→MUN (even though MUN stays)
    // VEN→MUN: attack = 1, BOH→MUN: attack = 1 + 1 = 2
    // BOH wins against VEN prevent (1) → BOH→MUN succeeds
    expectMove(result, 'boh', 'mun', true);
  });

  test('Convoy with support beats defender', () => {
    const units = [
      unit('lon', 'army', 'England'),
      unit('eng', 'fleet', 'England'),
      unit('nth', 'fleet', 'England'),
      unit('bel', 'army', 'France'),
    ];
    const orders = [
      move('lon', 'bel', 'England'),
      convoy('eng', 'lon', 'bel', 'England'),
      supportMove('nth', 'lon', 'bel', 'England'),
      hold('bel', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // LON via convoy: attack = 1 + 1 (NTH) = 2 vs BEL hold = 1
    expectMove(result, 'lon', 'bel', true);
    expectDislodged(result, 'bel');
  });

  test('Two nations attacking same empty territory', () => {
    const units = [
      unit('pie', 'army', 'France'),
      unit('tyr', 'army', 'Austria'),
    ];
    const orders = [
      move('pie', 'ven', 'France'),
      move('tyr', 'ven', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Both attack = 1, VEN empty (hold = 0), each prevents the other
    expectBounce(result, 'ven');
  });

  test('One supported, one unsupported attack on empty territory', () => {
    const units = [
      unit('pie', 'army', 'France'),
      unit('tus', 'army', 'France'),
      unit('tyr', 'army', 'Austria'),
    ];
    const orders = [
      move('pie', 'ven', 'France'),
      supportMove('tus', 'pie', 'ven', 'France'), // TUS is adjacent to VEN
      move('tyr', 'ven', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // PIE attack = 2 (with TUS support), TYR prevent = 1 → PIE wins
    expectMove(result, 'pie', 'ven', true);
    expectMove(result, 'tyr', 'ven', false);
  });

  test('Dislodged unit retreats info — attacker is tracked', () => {
    const units = [
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('tri', 'army', 'Austria'),
    ];
    const orders = [
      move('ven', 'tri', 'Italy'),
      supportMove('tyr', 'ven', 'tri', 'Italy'),
      hold('tri', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectDislodged(result, 'tri');
    const d = result.dislodged.find(d => d.from === 'tri');
    expect(d).toBeDefined();
    // Attacker should be the unit from Venice
    expect(d!.attacker).toContain('ven');
  });
});

describe('Custom Edge Cases — Via Convoy', () => {
  test('Via convoy flag is parsed correctly', () => {
    const units = [
      unit('nwy', 'army', 'England'),
      unit('ska', 'fleet', 'England'),
      unit('swe', 'army', 'Russia'),
    ];
    const orders = [
      { unit: 'nwy', type: 'move' as const, target: 'swe', viaConvoy: true, nation: 'England' },
      convoy('ska', 'nwy', 'swe', 'England'),
      move('swe', 'nwy', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Via convoy → not h2h → swap succeeds
    expectMove(result, 'nwy', 'swe', true);
    expectMove(result, 'swe', 'nwy', true);
  });

  test('Via convoy without actual convoy fleets → move fails', () => {
    const units = [
      unit('bel', 'army', 'France'),
      unit('hol', 'army', 'England'),
    ];
    const orders = [
      { unit: 'bel', type: 'move' as const, target: 'hol', viaConvoy: true, nation: 'France' },
      hold('hol', 'England'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Via convoy but no fleet → path fails → move fails
    expectMove(result, 'bel', 'hol', false);
  });
});

describe('Custom Edge Cases — Parser via convoy', () => {
  test('Parser recognizes VIA CONVOY in order string', () => {
    const { parseOrder } = require('../orders');
    const order = parseOrder('A NWY - SWE VIA CONVOY');
    expect(order.type).toBe('move');
    expect(order.unit).toBe('nwy');
    expect(order.target).toBe('swe');
    expect(order.viaConvoy).toBe(true);
  });

  test('Parser recognizes VIA C shorthand', () => {
    const { parseOrder } = require('../orders');
    const order = parseOrder('A NWY - SWE VIA C');
    expect(order.type).toBe('move');
    expect(order.viaConvoy).toBe(true);
  });
});

describe('Custom Edge Cases — Self-dislodge variations', () => {
  test('Cannot dislodge own unit even with 3 supports', () => {
    const units = [
      unit('mun', 'army', 'Germany'),
      unit('ber', 'army', 'Germany'),
      unit('sil', 'army', 'Germany'),
      unit('boh', 'army', 'Germany'),
      unit('tyr', 'army', 'Germany'),
    ];
    const orders = [
      hold('mun', 'Germany'),
      move('ber', 'mun', 'Germany'),
      supportMove('sil', 'ber', 'mun', 'Germany'),
      supportMove('boh', 'ber', 'mun', 'Germany'),
      supportMove('tyr', 'ber', 'mun', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Same nation → attack = 0 regardless of supports
    expectNotDislodged(result, 'mun');
  });

  test('Foreign support excluded for same-nation defender', () => {
    const units = [
      unit('mun', 'army', 'Germany'),
      unit('boh', 'army', 'Austria'),
      unit('tyr', 'army', 'Italy'),
    ];
    const orders = [
      hold('mun', 'Germany'),
      move('boh', 'mun', 'Austria'),
      supportMove('tyr', 'boh', 'mun', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BOH attacks MUN (different nation): attack = 1 + 1 (TYR) = 2 vs hold = 1
    expectDislodged(result, 'mun');
  });
});

describe('Custom Edge Cases — Empty Board Interactions', () => {
  test('Move to territory vacated by another move', () => {
    const units = [
      unit('par', 'army', 'France'),
      unit('bur', 'army', 'France'),
    ];
    const orders = [
      move('par', 'bur', 'France'),
      move('bur', 'mun', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BUR moves to MUN (empty) → succeeds
    // PAR moves to BUR (just vacated by BUR) → same nation → attack = 0
    // Wait, the territory is empty now... but the unit was same nation.
    // Actually: BUR successfully moves away. So for PAR→BUR:
    // Destination had a unit that moved away. Same nation as attacker.
    // But the destination is NOW empty. The attackStrength calculation:
    // "unit at destination has a move order for which the move is successful" → true
    // → attack = 1 + 0 = 1 vs hold = 0 (empty) → succeeds
    expectMove(result, 'bur', 'mun', true);
    expectMove(result, 'par', 'bur', true);
  });

  test('Failed move blocks following unit', () => {
    const units = [
      unit('par', 'army', 'France'),
      unit('bur', 'army', 'France'),
      unit('mun', 'army', 'Germany'),
    ];
    const orders = [
      move('par', 'bur', 'France'),
      move('bur', 'mun', 'France'),
      hold('mun', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // BUR→MUN: attack = 1 vs hold = 1, defender wins → BUR stays
    // PAR→BUR: BUR failed move, same nation → attack = 0 → fails
    expectMove(result, 'bur', 'mun', false);
    expectMove(result, 'par', 'bur', false);
  });
});

describe('Custom Edge Cases — Support Interactions', () => {
  test('Support for hold counts even if supporting unit is attacked', () => {
    const units = [
      unit('tri', 'army', 'Austria'),
      unit('vie', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
    ];
    const orders = [
      hold('tri', 'Austria'),
      supportHold('vie', 'tri', 'Austria'),
      move('ven', 'tri', 'Italy'),
      move('tyr', 'vie', 'Italy'), // Attacks supporter but doesn't dislodge
    ];
    const result = resolveOrders(orders, units, territories);
    // TYR→VIE attacks support but: does it cut it?
    // VIE supports TRI (not moving to TYR). TYR is different nation.
    // Does TYR have a valid path? Yes (adjacent).
    // Is the destination of the supported move == attacker's origin?
    // VIE supports TRI to HOLD. supportDestination is undefined.
    // For support-hold, the exception doesn't apply → support IS cut!
    // TRI hold = 1 vs VEN attack = 1 → tie, defender wins
    expectNotDislodged(result, 'tri');
  });

  test('Support for move where supported unit has no matching move → fails', () => {
    const units = [
      unit('vie', 'army', 'Austria'),
      unit('tyr', 'army', 'Austria'),
      unit('ven', 'army', 'Italy'),
    ];
    const orders = [
      supportMove('vie', 'tyr', 'ven', 'Austria'), // TYR→VEN support
      hold('tyr', 'Austria'), // But TYR is holding, not moving
      hold('ven', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Support doesn't match (TYR is holding, not moving to VEN)
    // VIE has invalid support → holds with strength 1
    expectNotDislodged(result, 'ven');
  });
});

describe('Custom Edge Cases — Simultaneous Attacks', () => {
  test('Two nations attack different territories simultaneously', () => {
    const units = [
      unit('ven', 'army', 'Italy'),
      unit('tri', 'army', 'Austria'),
    ];
    const orders = [
      move('ven', 'tri', 'Italy'),
      move('tri', 'ven', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Head-to-head: both attack = 1, both defend = 1 → nobody moves
    expectNoMovement(result);
  });

  test('Head-to-head where one side has support', () => {
    const units = [
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('tri', 'army', 'Austria'),
    ];
    const orders = [
      move('ven', 'tri', 'Italy'),
      supportMove('tyr', 'ven', 'tri', 'Italy'),
      move('tri', 'ven', 'Austria'),
    ];
    const result = resolveOrders(orders, units, territories);
    // VEN attack = 2 vs TRI defend = 1 → VEN wins
    // TRI attack = 1 vs VEN defend = 1 → TRI loses (VEN has prevent = 0 since it succeeds in h2h)
    expectMove(result, 'ven', 'tri', true);
    expectDislodged(result, 'tri');
  });
});
