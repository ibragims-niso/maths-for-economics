import { describe, expect, it } from 'vitest';
import {
  bernoulliLogLik,
  endLabel,
  information,
  LR_DROP,
  likelihoodInterval,
  mleShare,
  standardError,
} from './BernoulliLogLikelihood';

describe('BernoulliLogLikelihood maths', () => {
  it('matches the default view and worked example 3 in EM05 (9 defaults among 60 loans)', () => {
    expect(mleShare(9, 60)).toBe(0.15);
    expect(bernoulliLogLik(9, 60, 0.15)).toBeCloseTo(-25.3625, 4);
    expect(bernoulliLogLik(9, 60, 0.05)).toBeCloseTo(-29.5775, 4);
    // LR = 2(ℓ_U − ℓ_R) = 8.43, so p = 0.05 lies 4.22 below the peak: beyond the 1.92 cut-off.
    const lr = 2 * (bernoulliLogLik(9, 60, 0.15) - bernoulliLogLik(9, 60, 0.05));
    expect(lr).toBeCloseTo(8.43, 2);
    expect(information(9, 60)).toBeCloseTo(470.588, 3);
    expect(standardError(9, 60)).toBeCloseTo(0.0461, 4);
    const [lo, hi] = likelihoodInterval(9, 60);
    expect(lo).toBeCloseTo(0.075, 3);
    expect(hi).toBeCloseTo(0.254, 3);
    expect(lo).toBeGreaterThan(0.05);
  });

  it('gives the Try it check: 36 defaults among 240 loans halve the standard error', () => {
    expect(mleShare(36, 240)).toBe(0.15);
    expect(standardError(36, 240)).toBeCloseTo(0.023, 3);
    expect(standardError(36, 240) / standardError(9, 60)).toBeCloseTo(0.5, 12);
    const [lo, hi] = likelihoodInterval(36, 240);
    expect(hi - lo).toBeLessThan(0.5 * (0.254 - 0.075) + 0.01);
  });

  it('peaks at k/n: the numerical derivative is zero there and the curve falls on both sides', () => {
    for (const [k, n] of [
      [1, 10],
      [9, 60],
      [37, 50],
      [120, 240],
    ] as const) {
      const p = mleShare(k, n);
      const h = 1e-6;
      const slope = (bernoulliLogLik(k, n, p + h) - bernoulliLogLik(k, n, p - h)) / (2 * h);
      expect(Math.abs(slope)).toBeLessThan(1e-4);
      for (let q = 0.01; q < 1; q += 0.01) {
        expect(bernoulliLogLik(k, n, q)).toBeLessThanOrEqual(bernoulliLogLik(k, n, p) + 1e-12);
      }
      // SE from the curvature, by a second difference, agrees with √(p̂(1 − p̂)/n).
      const h2 = 1e-4;
      const curv =
        (bernoulliLogLik(k, n, p + h2) -
          2 * bernoulliLogLik(k, n, p) +
          bernoulliLogLik(k, n, p - h2)) /
        (h2 * h2);
      expect(1 / Math.sqrt(-curv)).toBeCloseTo(standardError(k, n), 4);
      expect(information(k, n)).toBeCloseTo(n / (p * (1 - p)), 6);
    }
  });

  it('puts the interval ends 1.92 below the peak, on either side of p̂, for every slider position', () => {
    expect(LR_DROP).toBeCloseTo(1.9205, 4);
    for (let n = 10; n <= 240; n += 5) {
      for (let k = 1; k <= n - 1; k++) {
        const p = mleShare(k, n);
        const top = bernoulliLogLik(k, n, p);
        const [lo, hi] = likelihoodInterval(k, n);
        expect(lo).toBeLessThan(p);
        expect(hi).toBeGreaterThan(p);
        expect(lo).toBeGreaterThan(0);
        expect(hi).toBeLessThan(1);
        expect(bernoulliLogLik(k, n, lo) - top).toBeCloseTo(-LR_DROP, 6);
        expect(bernoulliLogLik(k, n, hi) - top).toBeCloseTo(-LR_DROP, 6);
        expect(Number.isFinite(standardError(k, n))).toBe(true);
      }
    }
  });

  it('treats 0 × ln 0 as 0 at the edges', () => {
    expect(bernoulliLogLik(0, 10, 0)).toBe(0);
    expect(bernoulliLogLik(10, 10, 1)).toBe(0);
    expect(endLabel(0.00017)).toBe('0.0002');
    expect(endLabel(0.0751)).toBe('0.075');
  });
});
