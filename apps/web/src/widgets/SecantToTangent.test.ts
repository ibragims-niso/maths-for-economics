import { describe, expect, it } from 'vitest';
import { cost, secantSlope, tangentSlope } from './SecantToTangent';

describe('SecantToTangent maths', () => {
  it('matches worked examples 1 and 2 in C102 (C = 200 + 10Q + Q²)', () => {
    expect(cost(10)).toBe(400);
    expect(cost(20)).toBe(800);
    // Example 1: average rate of change from Q = 10 to Q = 20.
    expect(secantSlope(10, 10)).toBeCloseTo(40, 9);
    // Example 2: the difference quotient is 30 + h, with limit 30.
    for (const h of [1, 0.1, 0.01]) expect(secantSlope(10, h)).toBeCloseTo(30 + h, 9);
    expect(tangentSlope(10)).toBe(30);
  });

  it('secant slopes approach the tangent slope as h shrinks, at every output', () => {
    for (const q0 of [2, 7, 15, 20]) {
      expect(Math.abs(secantSlope(q0, 1e-6) - tangentSlope(q0))).toBeLessThan(1e-4);
      expect(secantSlope(q0, 5) - tangentSlope(q0)).toBeCloseTo(5, 9);
    }
  });

  it('the tangent slope agrees with a numerical derivative of the cost function', () => {
    for (const q0 of [3, 12, 19]) {
      const numeric = (cost(q0 + 1e-5) - cost(q0 - 1e-5)) / 2e-5;
      expect(tangentSlope(q0)).toBeCloseTo(numeric, 4);
    }
  });
});
