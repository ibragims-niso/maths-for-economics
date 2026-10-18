import { describe, expect, it } from 'vitest';
import { approxError, logTaylor, logValue, signed } from './TaylorLogApproximation';

describe('TaylorLogApproximation maths', () => {
  it('matches worked example 3 in C111 (ln 1.1 and its Taylor polynomials)', () => {
    expect(logValue(0.1)).toBeCloseTo(0.0953102, 7);
    expect(logTaylor(0.1, 1)).toBeCloseTo(0.1, 12);
    expect(logTaylor(0.1, 2)).toBeCloseTo(0.095, 12);
    expect(logTaylor(0.1, 3)).toBeCloseTo(0.0953333, 7);
    expect(approxError(0.1, 1)).toBeCloseTo(0.0046898, 7);
    expect(approxError(0.1, 2)).toBeCloseTo(-0.0003102, 7);
    expect(approxError(0.1, 3)).toBeCloseTo(0.0000232, 7);
  });

  it('builds the polynomial from the derivatives of ln(1 + x) at 0: 0, 1, −1, 2', () => {
    // f⁽ᵏ⁾(0)/k! for k = 1, 2, 3 are 1, −1/2, 1/3.
    for (const h of [-0.4, -0.1, 0.05, 0.3, 0.8]) {
      expect(logTaylor(h, 3)).toBeCloseTo(h - h ** 2 / 2 + h ** 3 / 3, 12);
    }
  });

  it('has errors that shrink like h² (linear) and h³ (quadratic)', () => {
    // Halving h divides the linear error by about 4 and the quadratic error by about 8.
    expect(approxError(0.1, 1) / approxError(0.05, 1)).toBeCloseTo(4, 0);
    expect(approxError(0.1, 2) / approxError(0.05, 2)).toBeCloseTo(8, 0);
    for (const h of [0.01, 0.02, 0.05]) {
      expect(approxError(h, 1) / (h * h)).toBeCloseTo(0.5, 1);
      expect(-approxError(h, 2) / h ** 3).toBeCloseTo(1 / 3, 1);
    }
  });

  it('keeps every value finite on the slider range, with the tangent always on or above the curve', () => {
    for (let i = 0; i <= 30; i++) {
      const h = -0.5 + i * 0.05;
      expect(Number.isFinite(logValue(h))).toBe(true);
      expect(approxError(h, 1)).toBeGreaterThanOrEqual(-1e-12);
    }
  });

  it('writes errors with their sign', () => {
    expect([0.0046898, -0.0003102, 0].map(signed)).toEqual(['+0.0047', '−0.0003', '0']);
  });
});
