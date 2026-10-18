import { describe, expect, it } from 'vitest';
import { describeSlope, marginalProfit, profit, tangentAt } from './ProfitHillTangent';

describe('ProfitHillTangent', () => {
  it('reproduces C109 Example 1: the maximum profit is 1000 at Q = 30, where the slope is 0', () => {
    expect(profit(30)).toBe(1000);
    expect(marginalProfit(30)).toBe(0);
    expect(describeSlope(30)).toContain('top of the hill');
  });

  it('finds the same maximum by trying every output from 0 to 60', () => {
    let best = 0;
    for (let q = 0; q <= 60; q++) if (profit(q) > profit(best)) best = q;
    expect(best).toBe(30);
  });

  it('marginal profit is the slope of the profit curve (numeric derivative)', () => {
    const h = 1e-4;
    for (let q = 0; q <= 60; q += 2.5) {
      const slope = (profit(q + h) - profit(q - h)) / (2 * h);
      expect(marginalProfit(q)).toBeCloseTo(slope, 5);
    }
  });

  it('the tangent touches the curve at the point and lies above the hill elsewhere', () => {
    for (const q0 of [0, 12, 20, 30, 47, 60]) {
      const line = tangentAt(q0);
      expect(line(q0)).toBeCloseTo(profit(q0), 9);
      for (const d of [-12, -5, 3, 12]) expect(line(q0 + d)).toBeGreaterThan(profit(q0 + d));
    }
  });

  it('tells the student which way to move', () => {
    expect(describeSlope(20)).toContain('about 40');
    expect(describeSlope(20)).toContain('producing more');
    expect(describeSlope(45)).toContain('producing less');
  });
});
