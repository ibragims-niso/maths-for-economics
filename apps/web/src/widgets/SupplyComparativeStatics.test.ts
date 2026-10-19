import { describe, expect, it } from 'vitest';
import {
  bestOutput,
  maxProfit,
  profit,
  START_PRICE,
  secondDerivative,
  supplySlope,
} from './SupplyComparativeStatics';

/** The best output at price p, by brute force over q in steps of 0.001. */
function bruteBest(p: number) {
  let top = Number.NEGATIVE_INFINITY;
  let arg = 0;
  for (let i = 0; i <= 40000; i++) {
    const v = profit(i / 1000, p);
    if (v > top) {
      top = v;
      arg = i / 1000;
    }
  }
  return { q: arg, value: top };
}

describe('SupplyComparativeStatics maths', () => {
  it('matches worked example 1 in OP04 (C = 100 + q³/30, p = 40: q* = 20, dq*/dp = 0.25)', () => {
    expect(START_PRICE).toBe(40);
    expect(bestOutput(40)).toBe(20);
    expect(secondDerivative(40)).toBe(-4);
    expect(supplySlope(40)).toBe(0.25);
    expect(maxProfit(40)).toBeCloseTo(433.33, 2);
    expect(bestOutput(41)).toBeCloseTo(20.248, 3);
    // The second check in the Try it text: p = 22.5.
    expect(bestOutput(22.5)).toBe(15);
    expect(supplySlope(22.5)).toBeCloseTo(0.333, 3);
  });

  it('the best output is the brute-force maximum and its slope is −π_qp/π_qq, for every slider price', () => {
    for (let p = 20; p <= 60; p += 0.5) {
      const brute = bruteBest(p);
      expect(Math.abs(brute.q - bestOutput(p))).toBeLessThan(2e-3);
      expect(Math.abs(brute.value - maxProfit(p))).toBeLessThan(1e-4);
      const h = 1e-4;
      const numeric = (bestOutput(p + h) - bestOutput(p - h)) / (2 * h);
      expect(supplySlope(p)).toBeCloseTo(numeric, 6);
      // The peak and the supply curve stay inside the two frames.
      expect(maxProfit(p)).toBeGreaterThan(-200);
      expect(maxProfit(p)).toBeLessThan(1000);
      expect(bestOutput(p)).toBeLessThan(30);
    }
  });
});
