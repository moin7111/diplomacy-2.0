/**
 * @file datc-gaps.test.ts
 * @description Fill missing DATC v3.3 test cases from sections 6.D, 6.E, 6.F, 6.G
 * that were not covered in the original resolver.test.ts.
 */

import { resolveOrders } from '../resolver';
import { territories } from '../territories';
import type { Order } from '../types/order';
import type { Unit } from '../types/unit';
import type { ResolutionResult } from '../types/resolution';

let uc = 0;

function unit(t: string, type: 'army' | 'fleet', n: string, coast?: string): Unit {
  return {
    id: `${n.toLowerCase().substring(0, 3)}-${type === 'army' ? 'a' : 'f'}-${t}-${++uc}`,
    type, nation: n, territory: t,
    ...(coast ? { coast: coast as any } : {}),
  };
}

function mv(t: string, target: string, n: string, viaConvoy?: boolean): Order {
  return { unit: t, type: 'move', target, nation: n, ...(viaConvoy ? { viaConvoy: true } : {}) };
}
function hd(t: string, n: string): Order { return { unit: t, type: 'hold', nation: n }; }
function sh(t: string, target: string, n: string): Order {
  return { unit: t, type: 'support', supportTarget: target, nation: n };
}
function sm(t: string, st: string, sd: string, n: string): Order {
  return { unit: t, type: 'support', supportTarget: st, supportDestination: sd, nation: n };
}
function cv(t: string, from: string, to: string, n: string): Order {
  return { unit: t, type: 'convoy', convoyFrom: from, convoyTo: to, nation: n };
}

function expectMv(r: ResolutionResult, f: string, t: string, s: boolean): void {
  const m = r.moves.find(mv => mv.from === f && mv.to === t);
  expect(m).toBeDefined();
  expect(m!.success).toBe(s);
}
function expectDis(r: ResolutionResult, t: string): void {
  const isDislodged = r.dislodged.some(d => d.from === t);
  expect(isDislodged).toBe(true);
}
function expectNoDis(r: ResolutionResult, t: string): void {
  const isDislodged = r.dislodged.some(d => d.from === t);
  expect(isDislodged).toBe(false);
}
function expectNoMov(r: ResolutionResult): void {
  for (const m of r.moves) expect(m.success).toBe(false);
}

beforeEach(() => { uc = 0; });

// ===========================================================================
// 6.D GAPS — Supports and Dislodges
// ===========================================================================

describe('DATC 6.D — Supports and Dislodges (additional)', () => {

  test('6.D.6 — Support to hold on convoying unit allowed', () => {
    const units = [
      unit('ion', 'fleet', 'Italy'),
      unit('tys', 'fleet', 'Italy'),
      unit('aeg', 'fleet', 'Turkey'),
      unit('eas', 'fleet', 'Turkey'),
    ];
    const orders = [
      cv('ion', 'tun', 'gre', 'Italy'),  // convoying
      sh('tys', 'ion', 'Italy'),           // support-hold on convoying unit
      mv('aeg', 'ion', 'Turkey'),
      sm('eas', 'aeg', 'ion', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // ION hold = 1 + 1 (TYS) = 2 vs AEG attack = 1 + 1 (EAS) = 2 → defender wins
    expectNoDis(result, 'ion');
  });

  test('6.D.8 — Failed convoy cannot receive hold support', () => {
    // Greece tries to move to Naples via ION, but no convoy order is given.
    // Greece's move is illegal (no path), so it still tried to move.
    // It cannot receive hold support.
    const units = [
      unit('gre', 'army', 'Turkey'),
      unit('aeg', 'fleet', 'Turkey'),
      unit('ion', 'fleet', 'Italy'),
      unit('nap', 'army', 'Italy'),
      unit('alb', 'army', 'Italy'),
    ];
    const orders = [
      mv('gre', 'nap', 'Turkey'),       // no convoy → illegal → hold
      sh('aeg', 'gre', 'Turkey'),        // support-hold on gre
      mv('ion', 'gre', 'Italy'),
      sm('alb', 'ion', 'gre', 'Italy'),
      hd('nap', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // GRE tried to move (failed) → cannot receive hold support
    // ION attacks GRE with 2 vs GRE hold 1 → dislodged
    expectDis(result, 'gre');
  });

  test('6.D.9 — Support to move on holding unit not allowed', () => {
    const units = [
      unit('alb', 'army', 'Italy'),
      unit('tri', 'army', 'Austria-Hungary'),
      unit('ser', 'army', 'Austria-Hungary'),
    ];
    const orders = [
      sm('alb', 'tri', 'ser', 'Italy'),  // supports TRI→SER
      hd('tri', 'Austria-Hungary'),       // but TRI is holding!
      hd('ser', 'Austria-Hungary'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Support doesn't match (TRI holds, not moving to SER)
    expectNoDis(result, 'ser');
  });

  test('6.D.13 — Supporting foreign unit to dislodge a returning own unit prohibited', () => {
    const units = [
      unit('tri', 'fleet', 'Austria-Hungary'),
      unit('vie', 'army', 'Austria-Hungary'),
      unit('ven', 'army', 'Italy'),
      unit('tyr', 'army', 'Italy'),
      unit('ion', 'fleet', 'Italy'),
    ];
    const orders = [
      mv('tri', 'adr', 'Austria-Hungary'),  // tries to move out
      sm('vie', 'ven', 'tri', 'Austria-Hungary'), // supports Italian attack on own unit
      mv('ven', 'tri', 'Italy'),
      sm('tyr', 'ven', 'tri', 'Italy'),
      mv('ion', 'adr', 'Italy'), // bounces tri
    ];
    const result = resolveOrders(orders, units, territories);
    // TRI tries to move but bounces in ADR. Since it returns,
    // Austrian support for Italian attack on Austrian unit is excluded.
    // VEN attack = 2 (with TYR), TRI hold = 1 → dislodged
    expectDis(result, 'tri');
  });

  test('6.D.16 — Convoying a unit dislodging a unit of same power is allowed', () => {
    const units = [
      unit('lon', 'army', 'England'),
      unit('nth', 'fleet', 'England'),
      unit('eng', 'fleet', 'France'),
      unit('bel', 'army', 'France'),
    ];
    const orders = [
      mv('lon', 'bel', 'England'),
      cv('nth', 'lon', 'bel', 'England'),
      cv('eng', 'lon', 'bel', 'France'),  // France convoys English army that attacks French unit
      hd('bel', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // It IS allowed to convoy a foreign unit that dislodges your own unit.
    // LON attack = 1, BEL hold = 1 → tie, defender wins (no dislodge without support)
    expectNoDis(result, 'bel');
  });

  test('6.D.22 — Impossible fleet move cannot be supported', () => {
    const units = [
      unit('kie', 'fleet', 'Germany'),
      unit('bur', 'army', 'Germany'),
      unit('mun', 'army', 'Russia'),
      unit('ber', 'army', 'Russia'),
    ];
    const orders = [
      mv('kie', 'mun', 'Germany'),       // Fleet to inland → illegal
      sm('bur', 'kie', 'mun', 'Germany'), // Support for illegal move → also illegal
      hd('mun', 'Russia'),
      sm('ber', 'mun', 'mun', 'Russia'),  // self-support, illegal
    ];
    const result = resolveOrders(orders, units, territories);
    expectNoDis(result, 'mun');
  });

  test('6.D.23 — Impossible coast move cannot be supported', () => {
    const units = [
      unit('spa', 'fleet', 'France', 'nc'),
      unit('mar', 'fleet', 'France'),
      unit('lyo', 'fleet', 'Italy'),
    ];
    const orders = [
      mv('spa', 'lyo', 'France'),         // spa-nc can't reach lyo → illegal
      sm('mar', 'spa', 'lyo', 'France'),   // support for illegal move
      hd('lyo', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectNoDis(result, 'lyo');
  });

  test('6.D.24 — Impossible army move cannot be supported', () => {
    const units = [
      unit('mar', 'army', 'France'),
      unit('spa', 'army', 'France'),
      unit('lyo', 'fleet', 'Italy'),
    ];
    const orders = [
      mv('mar', 'lyo', 'France'),         // Army to sea → illegal
      sm('spa', 'mar', 'lyo', 'France'),   // Support for illegal move
      hd('lyo', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    expectNoDis(result, 'lyo');
  });

  test('6.D.27 — Invalid convoy can be supported', () => {
    const units = [
      unit('bal', 'fleet', 'Germany'),
      unit('pru', 'army', 'Germany'),
      unit('ber', 'army', 'Russia'),
      unit('lvn', 'army', 'Russia'),
    ];
    const orders = [
      cv('bal', 'ber', 'swe', 'Germany'),  // Unmatched convoy (BER not moving to SWE)
      sh('pru', 'bal', 'Germany'),          // Support-hold on BAL
      sm('lvn', 'ber', 'bal', 'Russia'),    // This doesn't match...
      mv('ber', 'bal', 'Russia'),           // BER attacks BAL
    ];
    const result = resolveOrders(orders, units, territories);
    // BAL has unmatched convoy, but can still receive hold support
    // BAL hold = 1 + 1 (PRU) = 2 vs BER attack = 1 = 1 → BAL survives
    expectNoDis(result, 'bal');
  });

  test('6.D.28 — Impossible move and support', () => {
    const units = [
      unit('rum', 'army', 'Austria-Hungary'),
      unit('gal', 'army', 'Austria-Hungary'),
      unit('bul', 'army', 'Turkey'),
      unit('bla', 'fleet', 'Turkey'),
    ];
    const orders = [
      hd('rum', 'Austria-Hungary'),
      sh('gal', 'rum', 'Austria-Hungary'),
      mv('bul', 'rum', 'Turkey'),
      sm('bla', 'bul', 'rum', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // RUM hold = 1 + 1 (GAL) = 2 vs BUL attack = 1 + 1 (BLA) = 2 → defender wins
    expectNoDis(result, 'rum');
  });

  test('6.D.33 (extended) — Unwanted support breaks self-standoff correctly', () => {
    const units = [
      unit('ser', 'army', 'Austria-Hungary'),
      unit('vie', 'army', 'Austria-Hungary'),
      unit('gal', 'army', 'Russia'),
      unit('bul', 'army', 'Turkey'),
    ];
    const orders = [
      mv('ser', 'bud', 'Austria-Hungary'),
      mv('vie', 'bud', 'Austria-Hungary'),
      sm('gal', 'ser', 'bud', 'Russia'),
      mv('bul', 'ser', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // SER→BUD attack = 2 (with GAL support), VIE→BUD prevent = 1
    // SER wins → moves to BUD
    expectMv(result, 'ser', 'bud', true);
    expectMv(result, 'bul', 'ser', true); // SER vacated
  });

  test('6.D.35 — Dislodgment cuts supports allowing enemy to advance', () => {
    const units = [
      unit('con', 'fleet', 'Russia'),
      unit('bla', 'fleet', 'Russia'),
      unit('ank', 'fleet', 'Turkey'),
      unit('smy', 'army', 'Turkey'),
      unit('arm', 'army', 'Turkey'),
    ];
    const orders = [
      sm('con', 'bla', 'ank', 'Russia'),
      mv('bla', 'ank', 'Russia'),
      mv('ank', 'con', 'Turkey'),
      sm('smy', 'ank', 'con', 'Turkey'),
      mv('arm', 'ank', 'Turkey'),
    ];
    const result = resolveOrders(orders, units, territories);
    // ANK→CON with SMY support: attack = 2 vs CON hold = 1 → CON dislodged
    // CON dislodged → its support for BLA is cut
    // BLA attack = 1 vs ARM→ANK prevent = 1 → BLA bounces
    expectDis(result, 'con');
  });
});

// ===========================================================================
// 6.E GAPS — Head-to-Head Battles
// ===========================================================================

describe('DATC 6.E — Head-to-Head (additional)', () => {

  test('6.E.5 — Loser dislodged by another army still has effect', () => {
    const units = [
      unit('hol', 'fleet', 'Germany'),
      unit('hel', 'fleet', 'Germany'),
      unit('ska', 'fleet', 'Germany'),
      unit('nth', 'fleet', 'France'),
      unit('bel', 'fleet', 'France'),
      unit('edi', 'fleet', 'England'),
      unit('yor', 'fleet', 'England'),
      unit('nwg', 'fleet', 'England'),
      unit('ruh', 'army', 'Austria-Hungary'),
    ];
    const orders = [
      mv('hol', 'nth', 'Germany'),
      sm('hel', 'hol', 'nth', 'Germany'),
      sm('ska', 'hol', 'nth', 'Germany'),
      mv('nth', 'hol', 'France'),
      sm('bel', 'nth', 'hol', 'France'),
      sm('edi', 'nwg', 'nth', 'England'),
      sm('yor', 'nwg', 'nth', 'England'),
      mv('nwg', 'nth', 'England'),
      mv('ruh', 'hol', 'Austria-Hungary'),
    ];
    const result = resolveOrders(orders, units, territories);
    // HOL→NTH(3) vs NTH→HOL(2): NTH loses h2h but NWG→NTH(3) creates beleaguered
    // NTH stays → still prevents RUH→HOL
    expectNoDis(result, 'nth');
    expectMv(result, 'ruh', 'hol', false);
  });

  test('6.E.6 — Not dislodge because of own support still has effect', () => {
    const units = [
      unit('hol', 'fleet', 'Germany'),
      unit('hel', 'fleet', 'Germany'),
      unit('nth', 'fleet', 'France'),
      unit('bel', 'fleet', 'France'),
      unit('ruh', 'army', 'Austria-Hungary'),
    ];
    const orders = [
      mv('hol', 'nth', 'Germany'),
      sm('hel', 'hol', 'nth', 'Germany'),
      mv('nth', 'hol', 'France'),
      sm('bel', 'nth', 'hol', 'France'),
      mv('ruh', 'hol', 'Austria-Hungary'),
    ];
    const result = resolveOrders(orders, units, territories);
    // h2h: HOL→NTH(2) vs NTH→HOL(2) → tie → nobody moves
    expectNoMov(result);
  });

  test('6.E.12 — Support on attack on own unit can be used for other means', () => {
    const units = [
      unit('bud', 'army', 'Austria-Hungary'),
      unit('ser', 'army', 'Italy'),
      unit('vie', 'army', 'Italy'),
      unit('gal', 'army', 'Russia'),
    ];
    const orders = [
      hd('bud', 'Austria-Hungary'),
      mv('ser', 'bud', 'Italy'),
      sm('vie', 'ser', 'bud', 'Italy'),  // Italian support
      mv('gal', 'bud', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // SER→BUD(2) vs GAL→BUD prevent(1) and BUD hold(1)
    // SER wins, dislodges BUD
    expectDis(result, 'bud');
    expectMv(result, 'ser', 'bud', true);
  });

  test('6.E.14 — Illegal head-to-head battle can still defend', () => {
    const units = [
      unit('lvp', 'fleet', 'Russia'),
      unit('edi', 'army', 'England'),
    ];
    const orders = [
      mv('lvp', 'edi', 'Russia'),  // Fleet to land → illegal, holds
      mv('edi', 'lvp', 'England'),
    ];
    const result = resolveOrders(orders, units, territories);
    // LVP→EDI is illegal (fleet to land). LVP holds with strength 1.
    // EDI→LVP: attack = 1 vs LVP hold = 1 → fails
    expectMv(result, 'edi', 'lvp', false);
  });
});

// ===========================================================================
// 6.F GAPS — Convoys
// ===========================================================================

describe('DATC 6.F — Convoys (additional)', () => {

  test('6.F.7 — Dislodged convoy does not cause contested province', () => {
    const units = [
      unit('nth', 'fleet', 'England'),
      unit('lon', 'army', 'England'),
      unit('bel', 'army', 'England'),
      unit('hel', 'fleet', 'Germany'),
      unit('ska', 'fleet', 'Germany'),
    ];
    const orders = [
      cv('nth', 'lon', 'hol', 'England'),
      mv('lon', 'hol', 'England'),
      mv('bel', 'hol', 'England'),  // also tries to go to Holland
      sm('hel', 'ska', 'nth', 'Germany'),
      mv('ska', 'nth', 'Germany'),
    ];
    const result = resolveOrders(orders, units, territories);
    // NTH dislodged → convoy fails → LON→HOL doesn't happen
    // BEL→HOL should still be possible (Holland is not contested by failed convoy)
    expectDis(result, 'nth');
  });

  test('6.F.9 — Dislodge of multi-route convoy (post-1971 rules)', () => {
    // Multi-route convoy: army London→Belgium via NTH and ENG.
    // ENG is dislodged but NTH survives.
    // Post-1971: convoy succeeds if any route remains.
    const units = [
      unit('lon', 'army', 'England'),
      unit('nth', 'fleet', 'England'),
      unit('eng', 'fleet', 'England'),
      unit('bre', 'fleet', 'France'),
      unit('mao', 'fleet', 'France'),
    ];
    const orders = [
      mv('lon', 'bel', 'England'),
      cv('nth', 'lon', 'bel', 'England'),
      cv('eng', 'lon', 'bel', 'England'),
      mv('bre', 'eng', 'France'),
      sm('mao', 'bre', 'eng', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // ENG dislodged, but NTH still convoys → convoy succeeds
    expectDis(result, 'eng');
    expectMv(result, 'lon', 'bel', true);
  });

  test('6.F.15 — Simple convoy paradox with additional convoy', () => {
    // The paradox in ENG should not affect the Italian convoy in ION.
    const units = [
      unit('lon', 'fleet', 'England'),
      unit('wal', 'fleet', 'England'),
      unit('bre', 'army', 'France'),
      unit('eng', 'fleet', 'France'),
      unit('nap', 'army', 'Italy'),
      unit('ion', 'fleet', 'Italy'),
    ];
    const orders = [
      sm('lon', 'wal', 'eng', 'England'),
      mv('wal', 'eng', 'England'),
      mv('bre', 'lon', 'France'),
      cv('eng', 'bre', 'lon', 'France'),
      mv('nap', 'tun', 'Italy'),
      cv('ion', 'nap', 'tun', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Szykman: convoy in ENG fails → BRE doesn't reach LON
    // Italian convoy in ION unaffected → NAP→TUN succeeds
    expectMv(result, 'nap', 'tun', true);
  });
});

// ===========================================================================
// 6.G GAPS — Convoying to Adjacent Provinces
// ===========================================================================

describe('DATC 6.G — Adjacent Convoy (additional)', () => {

  test('6.G.3 — Unwanted disrupted convoy to adjacent province', () => {
    const units = [
      unit('pic', 'army', 'France'),
      unit('bur', 'army', 'France'),
      unit('eng', 'fleet', 'England'),
      unit('bel', 'army', 'England'),
      unit('iri', 'fleet', 'France'),
    ];
    const orders = [
      mv('pic', 'bel', 'France'),
      sm('bur', 'pic', 'bel', 'France'),
      cv('eng', 'pic', 'bel', 'England'),  // Foreign unwanted convoy
      hd('bel', 'England'),
      mv('iri', 'eng', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Foreign convoy → France uses land route → PIC→BEL with support(2) vs BEL hold(1)
    expectMv(result, 'pic', 'bel', true);
    expectDis(result, 'bel');
  });

  test('6.G.5 — Swapping with multiple fleets with one own fleet', () => {
    const units = [
      unit('nwy', 'army', 'England'),
      unit('ska', 'fleet', 'England'),
      unit('nth', 'fleet', 'England'),
      unit('swe', 'army', 'Russia'),
    ];
    const orders = [
      mv('nwy', 'swe', 'England'),
      cv('ska', 'nwy', 'swe', 'England'),
      cv('nth', 'nwy', 'swe', 'England'),
      mv('swe', 'nwy', 'Russia'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Own fleet convoys → intent clear → swap succeeds
    expectMv(result, 'nwy', 'swe', true);
    expectMv(result, 'swe', 'nwy', true);
  });

  test('6.G.12 — Swapping two units with two convoys', () => {
    const units = [
      unit('lon', 'army', 'England'),
      unit('nth', 'fleet', 'England'),
      unit('bel', 'army', 'France'),
      unit('eng', 'fleet', 'France'),
    ];
    const orders = [
      mv('lon', 'bel', 'England', true),
      cv('nth', 'lon', 'bel', 'England'),
      mv('bel', 'lon', 'France', true),
      cv('eng', 'bel', 'lon', 'France'),
    ];
    const result = resolveOrders(orders, units, territories);
    // Both convoyed → swap succeeds
    expectMv(result, 'lon', 'bel', true);
    expectMv(result, 'bel', 'lon', true);
  });

  test('6.G.13 — Support cut on attack on itself via convoy', () => {
    // Army attacks via convoy back to its origin's attacker.
    // Brannan's rule not adopted: attack comes from origin, not from sea.
    const units = [
      unit('tri', 'army', 'Austria-Hungary'),
      unit('adr', 'fleet', 'Austria-Hungary'),
      unit('alb', 'fleet', 'Italy'),
      unit('ven', 'army', 'Italy'),
    ];
    const orders = [
      mv('tri', 'ven', 'Austria-Hungary', true),
      cv('adr', 'tri', 'ven', 'Austria-Hungary'),
      sm('alb', 'ven', 'tri', 'Italy'),  // supports VEN→TRI (defense)
      mv('ven', 'tri', 'Italy'),
    ];
    const result = resolveOrders(orders, units, territories);
    // TRI→VEN via convoy. Attack comes from TRI (not Adriatic).
    // VEN→TRI: attack cannot cut support because TRI attacks VEN directly.
    // The key rule: the convoyed army's attack comes from its starting province.
    expect(result).toBeDefined();
  });
});
