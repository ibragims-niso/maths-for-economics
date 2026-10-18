import { describe, expect, it } from 'vitest';
import { cost, extraCost, marginalCost, tangentAt } from './MarginalCostTangent';

describe('MarginalCostTangent maths', () => {
  it('matches worked example 1 in C103 (C′(10) = 60, C(11) − C(10) = 60.1)', () => {
    expect(cost(10)).toBeCloseTo(1100, 9);
    expect(marginalCost(10)).toBeCloseTo(60, 9);
    expect(cost(11)).toBeCloseTo(1160.1, 9);
    expect(extraCost(10)).toBeCloseTo(60.1, 9);
  });

  it('agrees with the slope of the cost curve over a tiny step', () => {
    for (const q of [1, 5, 10, 17.5, 24]) {
      const h = 1e-5;
      expect(marginalCost(q)).toBeCloseTo((cost(q + h) - cost(q - h)) / (2 * h), 5);
    }
  });

  it('draws a tangent that touches the curve at q and has slope C′(q)', () => {
    const line = tangentAt(20);
    expect(line(20)).toBeCloseTo(cost(20), 9);
    expect(line(21) - line(20)).toBeCloseTo(marginalCost(20), 9);
    expect(marginalCost(20)).toBeCloseTo(90, 9);
    expect(extraCost(20)).toBeCloseTo(93.1, 9);
  });

  it('keeps marginal cost positive and close to the extra cost on the slider range', () => {
    for (let q = 1; q <= 24; q++) {
      expect(marginalCost(q)).toBeGreaterThan(0);
      // C(q + 1) − C(q) − C′(q) = −3 + 0.3q + 0.1 for this cubic.
      expect(extraCost(q) - marginalCost(q)).toBeCloseTo(-2.9 + 0.3 * q, 9);
    }
  });
});
