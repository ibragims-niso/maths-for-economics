import { describe, expect, it } from 'vitest';
import {
  criticalValue,
  describeTest,
  pValueOf,
  rejects,
  upperQuantile,
} from './HypothesisTestExplorer';
import { normalDensity } from './NormalAreaExplorer';

/** Area under the standard normal density from z to z + 12, by the trapezium rule. */
function tailArea(z: number): number {
  const n = 40000;
  const h = 12 / n;
  let s = (normalDensity(z, 0, 1) + normalDensity(z + 12, 0, 1)) / 2;
  for (let i = 1; i < n; i++) s += normalDensity(z + i * h, 0, 1);
  return s * h;
}

describe('hypothesis-test-explorer', () => {
  it('gives the table critical values', () => {
    expect(criticalValue(5, false)).toBeCloseTo(1.645, 3);
    expect(criticalValue(5, true)).toBeCloseTo(1.96, 3);
    expect(criticalValue(1, false)).toBeCloseTo(2.326, 3);
    expect(criticalValue(1, true)).toBeCloseTo(2.576, 3);
    expect(criticalValue(10, false)).toBeCloseTo(1.282, 3);
    expect(criticalValue(10, true)).toBeCloseTo(1.645, 3);
  });

  it('puts exactly α in the rejection region (checked by integrating the density)', () => {
    for (const alpha of [1, 2.5, 5, 7.5, 10]) {
      expect(tailArea(criticalValue(alpha, false))).toBeCloseTo(alpha / 100, 7);
      expect(2 * tailArea(criticalValue(alpha, true))).toBeCloseTo(alpha / 100, 7);
    }
    expect(tailArea(upperQuantile(0.3))).toBeCloseTo(0.3, 7);
  });

  it('reproduces the p-values of worked examples 1 and 2 and the Try it text', () => {
    expect(pValueOf(1.8, false)).toBeCloseTo(0.0359, 4);
    expect(pValueOf(1.8, true)).toBeCloseTo(0.0719, 4);
    expect(pValueOf(2, false)).toBeCloseTo(0.0228, 4);
    expect(pValueOf(-1.8, true)).toBeCloseTo(pValueOf(1.8, true), 12);
    expect(pValueOf(-1, false)).toBeCloseTo(0.8413, 4);
    expect(pValueOf(1.8, false)).toBeCloseTo(tailArea(1.8), 7);
  });

  it('rejects exactly when z is beyond the critical value', () => {
    expect(rejects(1.8, 5, false)).toBe(true);
    expect(rejects(1.8, 5, true)).toBe(false);
    expect(rejects(1.8, 10, true)).toBe(true);
    expect(rejects(2, 1, false)).toBe(false);
    for (const alpha of [1, 5, 10]) {
      for (const two of [false, true]) {
        const c = criticalValue(alpha, two);
        expect(rejects(c + 0.01, alpha, two)).toBe(true);
        expect(rejects(c - 0.01, alpha, two)).toBe(false);
        if (two) expect(rejects(-c - 0.01, alpha, two)).toBe(true);
      }
    }
  });

  it('explains the decision in the caption', () => {
    const one = describeTest(5, 1.8, false);
    expect(one).toContain('z above 1.645');
    expect(one).toContain('0.0359');
    expect(one).toContain('reject H₀.');
    const two = describeTest(5, 1.8, true);
    expect(two).toContain('below −1.96 or above 1.96');
    expect(two).toContain('0.0719');
    expect(two).toContain('do not reject H₀');
    expect(two).toContain('does not prove H₀');
  });
});
