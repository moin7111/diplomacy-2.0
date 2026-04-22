import { getStartingUnits, getAllStartingUnits, validateUnitPlacement } from '../units';

describe('Unit logic', () => {
  describe('Starting Units', () => {
    test('getAllStartingUnits returns exactly 22 units for 7 nations', () => {
      const units = getAllStartingUnits();
      expect(units.length).toBe(22); // 3 units per nation, except Russia which has 4
    });

    test('getStartingUnits throws on invalid nation', () => {
      expect(() => getStartingUnits('Atlantis')).toThrow();
    });

    test('getStartingUnits returns 3 units for England', () => {
      const eng = getStartingUnits('England');
      expect(eng.length).toBe(3);
      expect(eng.some(u => u.territory === 'lon' && u.type === 'fleet')).toBe(true);
      expect(eng.some(u => u.territory === 'edi' && u.type === 'fleet')).toBe(true);
      expect(eng.some(u => u.territory === 'lvp' && u.type === 'army')).toBe(true);
    });

    test('getStartingUnits returns 4 units for Russia', () => {
      const rus = getStartingUnits('Russia');
      expect(rus.length).toBe(4);
      expect(rus.some(u => u.territory === 'stp' && u.type === 'fleet' && u.coast === 'sc')).toBe(true);
      expect(rus.some(u => u.territory === 'sev' && u.type === 'fleet')).toBe(true);
      expect(rus.some(u => u.territory === 'war' && u.type === 'army')).toBe(true);
      expect(rus.some(u => u.territory === 'mos' && u.type === 'army')).toBe(true);
    });
  });

  describe('Unit Placement Validation', () => {
    test('army on land is valid', () => {
      const result = validateUnitPlacement({ type: 'army', territory: 'par' });
      expect(result.valid).toBe(true);
    });

    test('army on coast is valid', () => {
      const result = validateUnitPlacement({ type: 'army', territory: 'bul' });
      expect(result.valid).toBe(true);
    });

    test('army on sea is invalid', () => {
      const result = validateUnitPlacement({ type: 'army', territory: 'nth' });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/cannot be placed on sea territory/);
    });

    test('army with coast specifier is invalid', () => {
      const result = validateUnitPlacement({ type: 'army', territory: 'bul', coast: 'nc' });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/cannot have a coast specifier/);
    });

    test('fleet on sea is valid', () => {
      const result = validateUnitPlacement({ type: 'fleet', territory: 'nth' });
      expect(result.valid).toBe(true);
    });

    test('fleet on non-dual coast is valid', () => {
      const result = validateUnitPlacement({ type: 'fleet', territory: 'lon' });
      expect(result.valid).toBe(true);
    });

    test('fleet on land is invalid', () => {
      const result = validateUnitPlacement({ type: 'fleet', territory: 'par' });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/cannot be placed on land territory/);
    });

    test('fleet on dual-coast territory without specifier is invalid', () => {
      const result = validateUnitPlacement({ type: 'fleet', territory: 'bul' });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/must specify a coast/);
    });

    test('fleet on dual-coast territory with valid specifier is valid', () => {
      const result = validateUnitPlacement({ type: 'fleet', territory: 'bul', coast: 'sc' });
      expect(result.valid).toBe(true);
    });

    test('fleet on dual-coast territory with invalid specifier is invalid', () => {
      const result = validateUnitPlacement({ type: 'fleet', territory: 'bul', coast: 'ec' as any });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Invalid coast/);
    });

    test('fleet on single-coast territory with specifier is invalid', () => {
      const result = validateUnitPlacement({ type: 'fleet', territory: 'lon', coast: 'sc' as any });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/cannot specify a coast/);
    });

    test('invalid territory id fails', () => {
      const result = validateUnitPlacement({ type: 'army', territory: 'foo' });
      expect(result.valid).toBe(false);
    });
  });
});
