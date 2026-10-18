import { describe, expect, it } from 'vitest';
import { marginalCost, slopeOfCost, totalCost } from './AntiderivativeFamily';

describe('AntiderivativeFamily maths', () => {
  it('matches worked example 1 in C112 (F = 500: C(10) = 1000, MC(10) = 90)', () => {
    expect(totalCost(0, 500)).toBe(500);
    expect(totalCost(10, 500)).toBeCloseTo(1000, 9);
    expect(marginalCost(10)).toBeCloseTo(90, 9);
    expect(totalCost(20, 500)).toBeCloseTo(2500, 9);
  });

  it('gives every curve of the family the slope MC(q) at every q', () => {
    for (const f of [0, 250, 500, 750, 1000]) {
      for (const q of [0, 3, 10, 14.5, 20]) {
        expect(slopeOfCost(q, f)).toBeCloseTo(marginalCost(q), 5);
      }
    }
  });

  it('shifts the whole curve by the change in the fixed cost', () => {
    for (const q of [0, 5, 10, 20]) {
      expect(totalCost(q, 800) - totalCost(q, 300)).toBeCloseTo(500, 9);
    }
  });

  it('accumulates marginal cost: C(q) − F is the area under MC from 0 to q', () => {
    // Midpoint sums with many thin slices converge on the area under MC.
    const n = 20000;
    const q = 10;
    let area = 0;
    for (let i = 0; i < n; i++) area += marginalCost(((i + 0.5) * q) / n) * (q / n);
    expect(totalCost(q, 0)).toBeCloseTo(area, 4);
  });

  it('keeps the curves inside the graph on the slider range', () => {
    expect(totalCost(20, 1000)).toBeLessThanOrEqual(3200);
  });
});
