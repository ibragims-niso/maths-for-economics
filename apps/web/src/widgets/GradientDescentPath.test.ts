import { describe, expect, it } from 'vitest';
import {
  BEST,
  descentPath,
  describeStep,
  gradientS,
  STABLE_LIMIT,
  stepFactors,
  sumSquares,
} from './GradientDescentPath';

describe('GradientDescentPath', () => {
  it('has its least-squares fit at a = 16, b = 1.9 with S = 1.9 (NM02 Example 2)', () => {
    expect(sumSquares(0, 0)).toBe(1318);
    expect(sumSquares(...BEST)).toBeCloseTo(1.9, 10);
    expect(gradientS(...BEST)[0]).toBeCloseTo(0, 10);
    expect(gradientS(...BEST)[1]).toBeCloseTo(0, 10);
    // S = 5(a − 16)² + 10(b − 1.9)² + 1.9 everywhere.
    for (const [a, b] of [
      [3, -1],
      [12.5, 4],
      [20, 0.2],
    ] as const) {
      expect(sumSquares(a, b)).toBeCloseTo(5 * (a - 16) ** 2 + 10 * (b - 1.9) ** 2 + 1.9, 9);
    }
  });

  it('the gradient matches a numerical derivative of S', () => {
    const h = 1e-4;
    const [a, b] = [7, 3];
    const [ga, gb] = gradientS(a, b);
    expect(ga).toBeCloseTo((sumSquares(a + h, b) - sumSquares(a - h, b)) / (2 * h), 5);
    expect(gb).toBeCloseTo((sumSquares(a, b + h) - sumSquares(a, b - h)) / (2 * h), 5);
  });

  it('reproduces the steps of Example 2', () => {
    const slow = descentPath(0.04, 2);
    expect(slow[1]?.[0]).toBeCloseTo(6.4, 10);
    expect(slow[1]?.[1]).toBeCloseTo(1.52, 10);
    expect(slow[2]?.[0]).toBeCloseTo(10.24, 10);
    expect(slow[2]?.[1]).toBeCloseTo(1.824, 10);
    expect(sumSquares(...(slow[2] ?? [0, 0]))).toBeCloseTo(167.85, 2);
    const fast = descentPath(0.11, 3);
    expect(fast[1]?.[1]).toBeCloseTo(4.18, 10);
    expect(fast[2]?.[1]).toBeCloseTo(-0.836, 10);
    expect(fast[3]?.[1]).toBeCloseTo(5.1832, 10);
    expect(stepFactors(0.11)[1]).toBeCloseTo(-1.2, 10);
  });

  it('converges below the limit 0.1 and diverges above it', () => {
    expect(STABLE_LIMIT).toBeCloseTo(0.1, 12);
    const end = (alpha: number) => descentPath(alpha, 60).at(-1) ?? [0, 0];
    const [a1, b1] = end(0.09);
    expect(Math.hypot(a1 - 16, b1 - 1.9)).toBeLessThan(1e-3);
    const [, b2] = end(0.11);
    expect(Math.abs(b2 - 1.9)).toBeGreaterThan(1000);
    const bounce = descentPath(0.1, 4).map(([, b]) => b);
    for (const [i, b] of bounce.entries()) expect(b).toBeCloseTo(i % 2 === 0 ? 0 : 3.8, 9);
  });

  it('describes each regime of the step size', () => {
    expect(describeStep(0.04)).toMatch(/without overshooting/);
    expect(describeStep(0.05)).toMatch(/first step/);
    expect(describeStep(0.08)).toMatch(/zigzag/);
    expect(describeStep(0.1)).toMatch(/for ever/);
    expect(describeStep(0.12)).toMatch(/above the limit/);
  });
});
