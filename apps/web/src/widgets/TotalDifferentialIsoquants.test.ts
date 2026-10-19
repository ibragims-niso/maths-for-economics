import { describe, expect, it } from 'vitest';
import {
  approximationError,
  describeError,
  estimate,
  exactChange,
  K0,
  L0,
  marginalProducts,
  output,
} from './TotalDifferentialIsoquants';

describe('TotalDifferentialIsoquants maths (MV03)', () => {
  it('starts at Example 1: Q = 200, MP_K = 6.25, MP_L = 4', () => {
    expect(output(K0, L0)).toBe(200);
    expect(marginalProducts(K0, L0)).toEqual([6.25, 4]);
  });

  it('gives the numbers of Example 1 and of the Try it check', () => {
    expect(estimate(2, -1)).toBe(8.5);
    expect(exactChange(2, -1)).toBeCloseTo(7.846, 3);
    expect(approximationError(2, -1)).toBeCloseTo(-0.654, 3);
    expect(estimate(1, -0.5)).toBe(4.25);
    expect(approximationError(1, -0.5)).toBeCloseTo(-0.167, 3);
    expect(estimate(4, -2)).toBe(17);
    expect(approximationError(4, -2)).toBeCloseTo(-2.524, 3);
    expect(exactChange(8, -10)).toBeCloseTo(-10.26, 2);
    expect(estimate(8, -10)).toBe(10);
  });

  it('agrees with the slope of output along the move (a different route)', () => {
    for (const [dK, dL] of [
      [2, -1],
      [-8, 10],
      [3.5, 6],
    ] as const) {
      const h = 1e-6;
      const slope = (output(K0 + h * dK, L0 + h * dL) - output(K0 - h * dK, L0 - h * dL)) / (2 * h);
      expect(estimate(dK, dL)).toBeCloseTo(slope, 5);
    }
  });

  it('has an error that shrinks like the square of the move', () => {
    for (const [dK, dL] of [
      [2, -1],
      [4, -2],
      [-2, 3],
    ] as const) {
      const ratio = approximationError(dK, dL) / approximationError(dK / 2, dL / 2);
      expect(ratio).toBeGreaterThan(3.5);
      expect(ratio).toBeLessThan(4.5);
    }
  });

  it('describes the size of the error', () => {
    expect(describeError(0, 0)).toMatch(/nothing to estimate/);
    expect(describeError(2, 3)).toMatch(/within 0.05/);
    expect(describeError(2, -1)).toMatch(/close/);
    expect(describeError(8, -10)).toMatch(/more than one unit/);
  });
});
