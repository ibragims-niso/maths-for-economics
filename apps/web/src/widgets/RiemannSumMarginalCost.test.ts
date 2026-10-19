import { describe, expect, it } from 'vitest';
import {
  antiderivative,
  exactIntegral,
  marginalCost,
  riemannSum,
  samplePoints,
} from './RiemannSumMarginalCost';

describe('RiemannSumMarginalCost maths', () => {
  it('matches worked example 1 in C113 (MC from 10 to 20: S₅ = 217.2, S₁₀ = 223.55, exact 230)', () => {
    expect(marginalCost(10)).toBeCloseTo(17, 9);
    expect(antiderivative(20)).toBeCloseTo(360, 9);
    expect(antiderivative(10)).toBeCloseTo(130, 9);
    expect(exactIntegral(10, 20)).toBeCloseTo(230, 9);
    expect(riemannSum(10, 20, 5)).toBeCloseTo(217.2, 9);
    expect(riemannSum(10, 20, 10)).toBeCloseTo(223.55, 9);
  });

  it('shows the numbers the Try it text promises (errors 12.8, 6.45 and about 1.62 at n = 5, 10, 40)', () => {
    expect(exactIntegral(10, 20) - riemannSum(10, 20, 5)).toBeCloseTo(12.8, 9);
    expect(exactIntegral(10, 20) - riemannSum(10, 20, 10)).toBeCloseTo(6.45, 9);
    expect(exactIntegral(10, 20) - riemannSum(10, 20, 40)).toBeCloseTo(1.621875, 9);
  });

  it('uses the left end of each strip', () => {
    expect(samplePoints(10, 20, 4)).toEqual([10, 12.5, 15, 17.5]);
  });

  it('approaches the integral as n grows, from below, because MC rises', () => {
    for (const [a, b] of [
      [0, 30],
      [10, 20],
      [5, 27],
    ] as const) {
      let previous = Number.NEGATIVE_INFINITY;
      for (const n of [1, 2, 5, 10, 25, 50]) {
        const sum = riemannSum(a, b, n);
        expect(sum).toBeLessThan(exactIntegral(a, b));
        expect(sum).toBeGreaterThan(previous);
        previous = sum;
      }
      expect(Math.abs(riemannSum(a, b, 100000) - exactIntegral(a, b))).toBeLessThan(0.01);
    }
  });

  it('agrees with the antiderivative: F′ = MC', () => {
    for (const q of [0, 7, 20, 23.5, 30]) {
      const h = 1e-5;
      expect((antiderivative(q + h) - antiderivative(q - h)) / (2 * h)).toBeCloseTo(
        marginalCost(q),
        5,
      );
    }
  });

  it('flips the sign when the limits are reversed, and gives 0 when they are equal', () => {
    expect(exactIntegral(20, 10)).toBeCloseTo(-230, 9);
    expect(riemannSum(20, 10, 1000)).toBeCloseTo(-230, 0);
    expect(exactIntegral(15, 15)).toBe(0);
    expect(riemannSum(15, 15, 10)).toBe(0);
  });
});
