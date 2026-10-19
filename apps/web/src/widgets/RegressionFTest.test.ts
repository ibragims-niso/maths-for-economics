import { describe, expect, it } from 'vitest';
import {
  betaCdf,
  describeFTest,
  fCriticalValue,
  fDensity,
  fTail,
  logGamma,
} from './RegressionFTest';

/** Area under the F(q, v) density from c to ∞ by Simpson's rule, after substituting x = c/u. */
function integratedTail(c: number, q: number, v: number): number {
  const m = 4000;
  const g = (u: number) => (u <= 0 ? 0 : (fDensity(c / u, q, v) * c) / (u * u));
  const h = 1 / m;
  let s = g(0) + g(1);
  for (let i = 1; i < m; i++) s += g(i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** The 5 % critical values printed in the EM03 table (rows n − k, columns q = 1 … 5). */
const TABLE: Record<number, number[]> = {
  10: [4.96, 4.1, 3.71, 3.48, 3.33],
  20: [4.35, 3.49, 3.1, 2.87, 2.71],
  30: [4.17, 3.32, 2.92, 2.69, 2.53],
  40: [4.08, 3.23, 2.84, 2.61, 2.45],
  60: [4.0, 3.15, 2.76, 2.53, 2.37],
  120: [3.92, 3.07, 2.68, 2.45, 2.29],
};

describe('regression-f-test', () => {
  it('computes Γ and the incomplete beta function correctly', () => {
    expect(Math.exp(logGamma(5))).toBeCloseTo(24, 10);
    expect(Math.exp(logGamma(0.5))).toBeCloseTo(Math.sqrt(Math.PI), 12);
    // Beta(1, 1) is uniform and Beta(2, 1) has cdf x².
    expect(betaCdf(0.3, 1, 1)).toBeCloseTo(0.3, 12);
    expect(betaCdf(0.6, 2, 1)).toBeCloseTo(0.36, 12);
  });

  it('gives tail areas that match integration of the F density and the q = 2 closed form', () => {
    for (const q of [1, 2, 3, 5, 6]) {
      for (const v of [10, 25, 40, 120]) {
        for (const f of [0.5, 2, 3.7]) {
          expect(fTail(f, q, v)).toBeCloseTo(integratedTail(f, q, v), 7);
        }
      }
    }
    for (const v of [10, 40]) expect(fTail(3, 2, v)).toBeCloseTo((1 + 6 / v) ** (-v / 2), 12);
  });

  it('reproduces the 5 % table of EM03 and F = t² for one restriction', () => {
    for (const [v, row] of Object.entries(TABLE)) {
      row.forEach((value, i) => {
        expect(fCriticalValue(i + 1, Number(v))).toBeCloseTo(value, 2);
      });
    }
    // Two-sided 5 % t values for 30 and 40 degrees of freedom, squared.
    expect(fCriticalValue(1, 30)).toBeCloseTo(2.042 ** 2, 2);
    expect(fCriticalValue(1, 40)).toBeCloseTo(2.021 ** 2, 2);
  });

  it('reproduces worked example 3 (F = 2 with q = 3 and n − k = 40) and the Try it checks', () => {
    expect(fCriticalValue(3, 40)).toBeCloseTo(2.84, 2);
    expect(fTail(2, 3, 40)).toBeCloseTo(0.1294, 4);
    expect(fTail(3, 3, 40)).toBeLessThan(0.05);
    expect(fTail(2.25, 1, 40)).toBeCloseTo(0.1415, 4);
    expect(fTail(12, 5, 40)).toBeLessThan(0.0001);
  });

  it('explains the decision in the caption', () => {
    const start = describeFTest(3, 40, 2);
    expect(start).toContain('F(3, 40)');
    expect(start).toContain('beyond 2.84');
    expect(start).toContain('0.1294');
    expect(start).toContain('not rejected');
    expect(describeFTest(3, 40, 3)).toContain('H₀ is rejected');
    expect(describeFTest(1, 30, 2)).toContain('2.042');
  });
});
