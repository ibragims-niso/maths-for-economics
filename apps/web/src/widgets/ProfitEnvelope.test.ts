import { describe, expect, it } from 'vitest';
import {
  bestOutput,
  FROZEN_OUTPUTS,
  frozenProfit,
  maxProfit,
  numericalSlope,
} from './ProfitEnvelope';

/** The best profit at price p, by brute force over output in steps of 0.001. */
function bruteMax(p: number) {
  let top = Number.NEGATIVE_INFINITY;
  for (let i = 0; i <= 40000; i++) top = Math.max(top, frozenProfit(i / 1000, p));
  return top;
}

describe('ProfitEnvelope maths', () => {
  it('matches worked example 1 in MV12 (C = 100 + 2q², p = 40: q* = 10, π* = 100, slope 10)', () => {
    expect(bestOutput(40)).toBe(10);
    expect(maxProfit(40)).toBe(100);
    expect(numericalSlope(40)).toBeCloseTo(10, 9);
    expect(maxProfit(41)).toBeCloseTo(110.125, 12);
    expect(frozenProfit(10, 41)).toBe(110);
    // The checks in the Try it text: p = 20 and p = 60.
    expect(bestOutput(20)).toBe(5);
    expect(bestOutput(60)).toBe(15);
    expect(maxProfit(20)).toBe(-50);
    expect(maxProfit(60)).toBe(350);
  });

  it('π*(p) is the maximum profit and its slope is q*, for every slider price', () => {
    for (let p = 20; p <= 60; p++) {
      expect(Math.abs(bruteMax(p) - maxProfit(p))).toBeLessThan(1e-4);
      expect(numericalSlope(p)).toBeCloseTo(bestOutput(p), 8);
      expect(maxProfit(p)).toBeGreaterThanOrEqual(-150);
      expect(maxProfit(p)).toBeLessThanOrEqual(450);
    }
  });

  it('every frozen-output line lies below the envelope and touches it at p = 4q', () => {
    for (const q of FROZEN_OUTPUTS) {
      expect(frozenProfit(q, 4 * q)).toBeCloseTo(maxProfit(4 * q), 12);
      for (let p = 10; p <= 72; p += 0.5) {
        expect(frozenProfit(q, p)).toBeLessThanOrEqual(maxProfit(p) + 1e-9);
      }
    }
  });
});
