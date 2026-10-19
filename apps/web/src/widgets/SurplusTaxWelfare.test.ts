import { describe, expect, it } from 'vitest';
import { demandPrice, supplyPrice, welfare } from './SurplusTaxWelfare';

/** Midpoint-rule integral, independent of the triangle formulas in the widget. */
const integrate = (f: (x: number) => number, from: number, to: number, n = 4000) => {
  const h = (to - from) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += f(from + (i + 0.5) * h);
  return sum * h;
};

describe('SurplusTaxWelfare', () => {
  it('reproduces C114 Example 1: Q* = 30, P* = 40, CS = 900, PS = 450 with no tax', () => {
    const w = welfare(0);
    expect(w.quantity).toBe(30);
    expect(w.buyers).toBe(40);
    expect(w.consumer).toBe(900);
    expect(w.producer).toBe(450);
    expect(w.deadweight).toBe(0);
  });

  it('reproduces C114 Example 2: a tax of 18 gives CS 576, PS 288, revenue 432, DWL 54', () => {
    const w = welfare(18);
    expect(w.quantity).toBe(24);
    expect(w.buyers).toBe(52);
    expect(w.sellers).toBe(34);
    expect(w.consumer).toBe(576);
    expect(w.producer).toBe(288);
    expect(w.revenue).toBe(432);
    expect(w.deadweight).toBe(54);
  });

  it('matches the integrals CS = ∫D − PbQ, PS = PsQ − ∫S, DWL = ∫(D − S) over the lost units', () => {
    for (let t = 0; t <= 60; t += 3) {
      const w = welfare(t);
      const q = w.quantity;
      expect(w.consumer).toBeCloseTo(integrate(demandPrice, 0, q) - w.buyers * q, 6);
      expect(w.producer).toBeCloseTo(w.sellers * q - integrate(supplyPrice, 0, q), 6);
      const lost = integrate((x) => demandPrice(x) - supplyPrice(x), q, 30);
      expect(w.deadweight).toBeCloseTo(lost, 6);
    }
  });

  it('keeps CS + PS + revenue + DWL equal to the untaxed total, 1350, at every tax', () => {
    for (let t = 0; t <= 60; t += 1.5) {
      const w = welfare(t);
      expect(w.consumer + w.producer + w.revenue + w.deadweight).toBeCloseTo(1350, 9);
      expect(w.sellers).toBeGreaterThan(0);
      expect(w.quantity).toBeGreaterThan(0);
    }
  });
});
