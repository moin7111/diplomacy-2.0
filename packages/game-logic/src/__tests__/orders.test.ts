import { parseOrder, validateOrder } from '../orders';
import { Unit } from '../types/unit';
import { territories } from '../territories';

describe('Orders parsing and validation', () => {
  describe('Parsing', () => {
    describe('Hold Orders', () => {
      test('parses simple hold with H', () => {
        expect(parseOrder('A VIE H')).toEqual({ unit: 'vie', type: 'hold' });
      });
      test('parses simple hold with HOLD', () => {
        expect(parseOrder('F LON HOLD')).toEqual({ unit: 'lon', type: 'hold' });
      });
      test('parses implicit hold', () => {
        expect(parseOrder('A VIE')).toEqual({ unit: 'vie', type: 'hold' });
      });
      test('parses without unit prefix', () => {
        expect(parseOrder('VIE H')).toEqual({ unit: 'vie', type: 'hold' });
      });
      test('parses hold with coast specifier', () => {
        expect(parseOrder('F STP-NC H')).toEqual({ unit: 'stp-nc', type: 'hold' });
      });
      test('parses case insensitive', () => {
        expect(parseOrder('a vIe hOlD')).toEqual({ unit: 'vie', type: 'hold' });
      });
      test('parses extra spaces', () => {
        expect(parseOrder('  A   VIE   H  ')).toEqual({ unit: 'vie', type: 'hold' });
      });
    });

    describe('Move Orders', () => {
      test('parses move with hyphen', () => {
        expect(parseOrder('A VIE - BUD')).toEqual({ unit: 'vie', type: 'move', target: 'bud' });
      });
      test('parses move with TO', () => {
        expect(parseOrder('F LON TO NTH')).toEqual({ unit: 'lon', type: 'move', target: 'nth' });
      });
      test('parses move without unit prefixes', () => {
        expect(parseOrder('VIE - BUD')).toEqual({ unit: 'vie', type: 'move', target: 'bud' });
      });
      test('parses move with coast specifiers on source', () => {
        expect(parseOrder('F STP-SC - BOT')).toEqual({ unit: 'stp-sc', type: 'move', target: 'bot' });
      });
      test('parses move with coast specifiers on target', () => {
        expect(parseOrder('F MAO - SPA-NC')).toEqual({ unit: 'mao', type: 'move', target: 'spa-nc' });
      });
      test('parses case insensitive move', () => {
        expect(parseOrder('a Vie - bUd')).toEqual({ unit: 'vie', type: 'move', target: 'bud' });
      });
      test('parses move with multiple spaces', () => {
        expect(parseOrder('A  VIE  -   BUD')).toEqual({ unit: 'vie', type: 'move', target: 'bud' });
      });
    });

    describe('Support Move Orders', () => {
      test('parses full support move with unit types', () => {
        expect(parseOrder('A VIE S A BUD - SER')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud', supportDestination: 'ser'
        });
      });
      test('parses support move with SUPPORT', () => {
        expect(parseOrder('A VIE SUPPORT A BUD - SER')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud', supportDestination: 'ser'
        });
      });
      test('parses support move without target unit type', () => {
        expect(parseOrder('A VIE S BUD - SER')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud', supportDestination: 'ser'
        });
      });
      test('parses support move with TO', () => {
        expect(parseOrder('A VIE S BUD TO SER')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud', supportDestination: 'ser'
        });
      });
      test('parses support move with coasts', () => {
        expect(parseOrder('F NTH S F NWY - STP-NC')).toEqual({
          unit: 'nth', type: 'support', supportTarget: 'nwy', supportDestination: 'stp-nc'
        });
      });
      test('parses case insensitive support move', () => {
        expect(() => parseOrder('A viE s B我們ud - sEr')).toThrow(); // intentional garbage char check below
        expect(parseOrder('a viE s a bud - Ser')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud', supportDestination: 'ser'
        });
      });
    });

    describe('Support Hold Orders', () => {
      test('parses full support hold', () => {
        expect(parseOrder('A VIE S A BUD')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud'
        });
      });
      test('parses support hold with SUPPORT keyword', () => {
        expect(parseOrder('A VIE SUPPORT A BUD')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud'
        });
      });
      test('parses support hold without target prefix', () => {
        expect(parseOrder('A VIE S BUD')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud'
        });
      });
      test('parses support hold with coasts', () => {
        expect(parseOrder('F NWY S F STP-NC')).toEqual({
          unit: 'nwy', type: 'support', supportTarget: 'stp-nc'
        });
      });
      test('parses case insensitive support hold', () => {
        expect(parseOrder('a viE s Bud')).toEqual({
          unit: 'vie', type: 'support', supportTarget: 'bud'
        });
      });
    });

    describe('Convoy Orders', () => {
      test('parses full convoy', () => {
        expect(parseOrder('F LON C A YOR - NWY')).toEqual({
          unit: 'lon', type: 'convoy', convoyFrom: 'yor', convoyTo: 'nwy'
        });
      });
      test('parses convoy with CONVOY keyword', () => {
        expect(parseOrder('F LON CONVOY A YOR - NWY')).toEqual({
          unit: 'lon', type: 'convoy', convoyFrom: 'yor', convoyTo: 'nwy'
        });
      });
      test('parses convoy without unit types', () => {
        expect(parseOrder('LON C YOR - NWY')).toEqual({
          unit: 'lon', type: 'convoy', convoyFrom: 'yor', convoyTo: 'nwy'
        });
      });
      test('parses convoy with TO', () => {
        expect(parseOrder('F LON C YOR TO NWY')).toEqual({
          unit: 'lon', type: 'convoy', convoyFrom: 'yor', convoyTo: 'nwy'
        });
      });
      test('throws on unparseable garbage inputs', () => {
        expect(() => parseOrder('GARBAGE INPUT')).toThrow();
        expect(() => parseOrder('A VIE S A BUD - SER - FOO')).toThrow();
        expect(() => parseOrder('A VIE C')).toThrow(); // incomplete
      });
    });
  });

  describe('Validation', () => {
    let units: Unit[];

    beforeEach(() => {
      units = [
        { id: 'u1', type: 'army', nation: 'Austria-Hungary', territory: 'vie' },
        { id: 'u2', type: 'army', nation: 'Austria-Hungary', territory: 'bud' },
        { id: 'u3', type: 'fleet', nation: 'England', territory: 'lon' },
        { id: 'u4', type: 'fleet', nation: 'England', territory: 'nth' },
        { id: 'u5', type: 'army', nation: 'England', territory: 'yor' },
        { id: 'u6', type: 'fleet', nation: 'Russia', territory: 'stp', coast: 'sc' },
        { id: 'u7', type: 'fleet', nation: 'Russia', territory: 'sev' }
      ];
    });

    describe('Hold validation', () => {
      test('valid hold', () => {
        const order = parseOrder('A VIE H');
        expect(validateOrder(order, units, territories).valid).toBe(true);
      });
      test('invalid unit reference', () => {
        const order = parseOrder('A PAR H');
        const res = validateOrder(order, units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Unit not found/);
      });
    });

    describe('Move validation', () => {
      test('valid adjacent army move', () => {
        const res = validateOrder(parseOrder('A VIE - BUD'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid non-adjacent army move (land to land)', () => {
        const res = validateOrder(parseOrder('A VIE - PAR'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/unreachable for army/);
      });
      test('valid army move possible via convoy (coast to coast)', () => {
        const res = validateOrder(parseOrder('A YOR - NWY'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid army move to sea', () => {
        const res = validateOrder(parseOrder('A YOR - NTH'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Army cannot move to sea territory/);
      });

      test('valid adjacent fleet move', () => {
        const res = validateOrder(parseOrder('F LON - NTH'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid non-adjacent fleet move', () => {
        const res = validateOrder(parseOrder('F LON - NWY'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/unreachable for fleet/);
      });
      test('invalid fleet move to land', () => {
        const res = validateOrder(parseOrder('F LON - PAR'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/unreachable for fleet/);
      });
      test('valid dual-coast fleet move', () => {
        const res = validateOrder(parseOrder('F STP-SC - BOT'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid dual-coast fleet move', () => {
        const res = validateOrder(parseOrder('F STP-SC - BAR'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/unreachable for fleet/);
      });
      test('invalid target territory', () => {
        const res = validateOrder(parseOrder('A VIE - XXX'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Invalid target territory/);
      });
    });

    describe('Support validation (Hold)', () => {
      test('valid support hold adjacent', () => {
        const res = validateOrder(parseOrder('A VIE S A BUD'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid support hold non-adjacent', () => {
        const res = validateOrder(parseOrder('A VIE S A YOR'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Cannot support yor - army cannot move there/);
      });
      test('valid support hold for fleet', () => {
        const res = validateOrder(parseOrder('F NTH S F LON'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid support hold for fleet (unreachable)', () => {
        const res = validateOrder(parseOrder('F NTH S A BUD'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Cannot support bud - fleet cannot move there/);
      });
      test('invalid support target territory', () => {
        const res = validateOrder(parseOrder('A VIE S A XXX'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Invalid support target/);
      });
    });

    describe('Support validation (Move)', () => {
      test('valid support move adjacent to destination', () => {
        const res = validateOrder(parseOrder('A VIE S A BUD - TRI'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid support move non-adjacent to destination', () => {
        const res = validateOrder(parseOrder('A VIE S A BUD - SER'), units, territories); // vie not adjacent to ser
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Cannot support into ser - army cannot move there/);
      });
      test('valid support move fleet adjacent to destination', () => {
        const res = validateOrder(parseOrder('F LON S F NTH - ENG'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid support move fleet target is land', () => {
        const res = validateOrder(parseOrder('F LON S A YOR - EDI'), units, territories);
        // LON is unreachable for fleet to EDI? LON adj to EDI? no.
        expect(res.valid).toBe(false);
      });
      test('invalid support destination territory', () => {
        const res = validateOrder(parseOrder('A VIE S A BUD - XXX'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Invalid support destination/);
      });
    });

    describe('Convoy validation', () => {
      test('valid convoy order', () => {
        const res = validateOrder(parseOrder('F NTH C A YOR - NWY'), units, territories);
        expect(res.valid).toBe(true);
      });
      test('invalid convoy unit is army', () => {
        const res = validateOrder(parseOrder('A VIE C A BUD - TRI'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Only fleets can convoy/);
      });
      test('invalid convoy fleet is not at sea', () => {
        const res = validateOrder(parseOrder('F LON C A YOR - NWY'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Only fleets at sea can convoy/);
      });
      test('invalid convoy origin is inland', () => {
        const res = validateOrder(parseOrder('F NTH C A VIE - NWY'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Convoy origin must be a coastal territory/);
      });
      test('invalid convoy destination is inland', () => {
        const res = validateOrder(parseOrder('F NTH C A YOR - VIE'), units, territories);
        expect(res.valid).toBe(false);
        expect(res.error).toMatch(/Convoy destination must be a coastal territory/);
      });
    });
  });
});
