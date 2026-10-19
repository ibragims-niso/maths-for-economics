import { describe, expect, it } from 'vitest';
import {
  demandPrice,
  demandQ,
  equilibriumPrice,
  iftSlope,
  resolvedChange,
  supplyQ,
} from './IncomeShiftEquilibrium';

describe('IncomeShiftEquilibrium maths', () => {
  it('matches worked example 2 in MV05 (p* = 12, q* = 60, dp*/dI = 0.25, re-solved 0.248)', () => {
    expect(equilibriumPrice(10, 4)).toBeCloseTo(12, 12);
    expect(demandQ(12, 10)).toBe(60);
    expect(supplyQ(12, 4)).toBe(60);
    expect(iftSlope(10, 4)).toBeCloseTo(0.25, 12);
    expect(resolvedChange(10, 4)).toBeCloseTo(0.248, 3);
    expect(equilibriumPrice(11, 4)).toBeCloseTo(-4 + Math.sqrt(264), 12);
  });

  it('clears the market and agrees with a difference quotient over the slider range', () => {
    for (let income = 0; income <= 30; income += 5) {
      for (let e = 1; e <= 10; e += 1.5) {
        const p = equilibriumPrice(income, e);
        expect(p).toBeGreaterThan(0);
        expect(demandQ(p, income)).toBeCloseTo(supplyQ(p, e), 9);
        expect(demandPrice(supplyQ(p, e), income)).toBeCloseTo(p, 9);
        const h = 1e-5;
        const numeric =
          (equilibriumPrice(income + h, e) - equilibriumPrice(income - h, e)) / (2 * h);
        expect(iftSlope(income, e)).toBeCloseTo(numeric, 6);
        // p*(I) is concave, so the change over a whole unit is a little below the slope.
        expect(resolvedChange(income, e)).toBeLessThan(iftSlope(income, e));
        expect(resolvedChange(income, e)).toBeGreaterThan(0.95 * iftSlope(income, e));
      }
    }
  });

  it('keeps the equilibrium inside the graph and falls as supply gets more responsive', () => {
    for (let income = 0; income <= 30; income += 1) {
      for (let e = 1; e < 10; e += 0.5) {
        const p = equilibriumPrice(income, e);
        expect(p).toBeLessThan(24);
        expect(supplyQ(p, e)).toBeLessThan(160);
        expect(iftSlope(income, e + 0.5)).toBeLessThan(iftSlope(income, e));
      }
    }
  });
});
