import { describe, expect, it } from 'vitest';
import {
  cappedBound,
  chebyshevBound,
  describePooling,
  erfc,
  normalApprox,
  normalTwoSidedTail,
  policiesNeeded,
  varianceOfAverage,
} from './ChebyshevPooling';

/** erf by its power series (fine for |x| ≤ 4), an independent check of the fitted erfc. */
function erfSeries(x: number): number {
  let sum = 0;
  let term = x;
  for (let n = 0; n < 200; n++) {
    sum += term / (2 * n + 1);
    term *= (-x * x) / (n + 1);
  }
  return (2 / Math.sqrt(Math.PI)) * sum;
}

describe('ChebyshevPooling maths', () => {
  it('shows worked example 2 in ST206 at the start (n = 2500, ε = 60)', () => {
    expect(varianceOfAverage(2500)).toBeCloseTo(900, 9);
    expect(Math.sqrt(varianceOfAverage(2500))).toBeCloseTo(30, 9);
    expect(chebyshevBound(2500, 60)).toBeCloseTo(0.25, 12);
    expect(normalApprox(2500, 60)).toBeCloseTo(0.0455, 4);
    expect(policiesNeeded(60, 0.05)).toBe(12500);
    expect(chebyshevBound(12500, 60)).toBeCloseTo(0.05, 12);
    // One policy alone: the bound is 625, which says nothing.
    expect(chebyshevBound(1, 60)).toBeCloseTo(625, 9);
  });

  it('agrees with the normal facts used in the topic (68 %, 95 %, 99.7 %)', () => {
    expect(1 - normalTwoSidedTail(1)).toBeCloseTo(0.6827, 4);
    expect(1 - normalTwoSidedTail(1.5)).toBeCloseTo(0.8664, 4);
    expect(1 - normalTwoSidedTail(2)).toBeCloseTo(0.9545, 4);
    expect(1 - normalTwoSidedTail(3)).toBeCloseTo(0.9973, 4);
    expect(normalTwoSidedTail(1.96)).toBeCloseTo(0.05, 4);
    for (let x = 0; x <= 4; x += 0.25) {
      expect(Math.abs(erfc(x) - (1 - erfSeries(x)))).toBeLessThan(1e-7);
    }
  });

  it('never lets the normal approximation exceed the Chebyshev bound, for every slider position', () => {
    for (let n = 100; n <= 15000; n += 100) {
      for (let eps = 20; eps <= 150; eps += 5) {
        const b = chebyshevBound(n, eps);
        const z = normalApprox(n, eps);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(Math.min(1, b) + 1e-12);
        const capped = cappedBound(n, eps);
        if (b <= 1) expect(capped).toBe(b);
        else expect(Number.isNaN(capped)).toBe(true);
        expect(describePooling(n, eps).length).toBeGreaterThan(0);
      }
    }
  });

  it('halves the bound when n doubles, and quarters it when ε doubles', () => {
    expect(chebyshevBound(5000, 60) / chebyshevBound(2500, 60)).toBeCloseTo(0.5, 12);
    expect(chebyshevBound(2500, 120) / chebyshevBound(2500, 60)).toBeCloseTo(0.25, 12);
    // The standard deviation of the average falls like 1/√n: four times the policies, half the sd.
    expect(Math.sqrt(varianceOfAverage(10000)) / Math.sqrt(varianceOfAverage(2500))).toBeCloseTo(
      0.5,
      12,
    );
  });

  it('finds the smallest n with σ²/(nε²) ≤ α', () => {
    for (const [eps, alpha] of [
      [60, 0.05],
      [45, 0.1],
      [70, 0.02],
      [25, 0.2],
    ] as const) {
      const n = policiesNeeded(eps, alpha);
      expect(chebyshevBound(n, eps)).toBeLessThanOrEqual(alpha + 1e-12);
      expect(chebyshevBound(n - 1, eps)).toBeGreaterThan(alpha);
    }
  });

  it('describes the start and both ends of the sliders', () => {
    expect(describePooling(2500, 60)).toContain('at least 0.75');
    expect(describePooling(2500, 60)).toContain('12,500');
    expect(describePooling(100, 20)).toContain('tells you nothing');
    expect(describePooling(15000, 150)).toContain('2,000');
  });
});
