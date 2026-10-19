import { describe, expect, it } from 'vitest';
import {
  adjustmentRate,
  directionMark,
  equilibriumPrice,
  excessDemand,
  halfLife,
  priceAt,
  priceSpeed,
  startStory,
} from './PriceAdjustmentPath';

describe('PriceAdjustmentPath', () => {
  it('reproduces DY03 Example 2 (D = 100 − 2p, S = 10 + 3p, λ = 0.1, p(0) = 30)', () => {
    expect(equilibriumPrice()).toBe(18);
    expect(excessDemand(18)).toBe(0);
    expect(adjustmentRate(0.1)).toBeCloseTo(0.5, 12);
    expect(priceSpeed(0.1, 30)).toBeCloseTo(-6, 12);
    expect(priceAt(0.1, 30, 5)).toBeCloseTo(18.99, 2);
    expect(halfLife(0.1)).toBeCloseTo(1.39, 2);
    expect(priceAt(0.1, 30, halfLife(0.1))).toBeCloseTo(24, 9);
    expect(startStory(0.1, 30)).toContain('excess supply of 60');
  });

  it('solves dp/dt = λ(D − S): small Euler steps follow p(t)', () => {
    for (const lambda of [0.02, 0.1, 0.24, 0.4]) {
      for (const start of [2, 18, 30, 40]) {
        let p = start;
        const h = 0.0005;
        for (let k = 0; k < 5 / h; k++) p += h * priceSpeed(lambda, p);
        expect(p).toBeCloseTo(priceAt(lambda, start, 5), 2);
        // The gap halves after one half-life, from any start.
        const gap = start - 18;
        expect(priceAt(lambda, start, halfLife(lambda)) - 18).toBeCloseTo(gap / 2, 9);
      }
    }
  });

  it('draws direction marks with the slope of the equation and the same length on screen', () => {
    for (const p of [6, 18, 30]) {
      const [[t0, p0], [t1, p1]] = directionMark(0.1, 5, p);
      expect((p1 - p0) / (t1 - t0)).toBeCloseTo(priceSpeed(0.1, p), 9);
      expect(Math.hypot((t1 - t0) * 26.6, (p1 - p0) * 4.35)).toBeCloseTo(14, 9);
    }
    expect(startStory(0.1, 18)).toContain('stays');
    expect(startStory(0.1, 10)).toContain('pushes the price up');
  });
});
