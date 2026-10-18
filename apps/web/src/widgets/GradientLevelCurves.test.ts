import { describe, expect, it } from 'vitest';
import {
  describeDirection,
  directional,
  gradient,
  gradientAngle,
  norm,
  unitAt,
  utility,
} from './GradientLevelCurves';

describe('GradientLevelCurves maths (MV02)', () => {
  it('gives the gradient and its length of Example 3: U = xy at (4, 6)', () => {
    expect(utility(4, 6)).toBe(24);
    expect(gradient(4, 6)).toEqual([6, 4]);
    expect(norm(gradient(4, 6))).toBeCloseTo(Math.sqrt(52), 12);
    expect(norm(gradient(4, 6))).toBeCloseTo(7.21, 2);
    expect(gradientAngle([6, 4])).toBeCloseTo(33.69, 2);
  });

  it('gives the directional derivatives of Example 3 and of the Try it check', () => {
    const g = gradient(4, 6);
    expect(directional(g, [0.6, 0.8])).toBeCloseTo(6.8, 12);
    expect(directional(g, unitAt(0))).toBeCloseTo(6, 12);
    expect(directional(g, unitAt(90))).toBeCloseTo(4, 12);
    // Along the indifference curve, direction (2, −3)/√13, utility does not change.
    expect(directional(g, [2 / Math.sqrt(13), -3 / Math.sqrt(13)])).toBeCloseTo(0, 12);
    // The largest rate is the gradient's length, reached in the gradient's direction.
    const best = Math.max(...Array.from({ length: 360 }, (_, d) => directional(g, unitAt(d))));
    expect(best).toBeLessThanOrEqual(norm(g) + 1e-12);
    expect(best).toBeGreaterThan(7.2);
  });

  it('agrees with a small step along u (a different route)', () => {
    for (const [x, y, deg] of [
      [4, 6, 30],
      [2.5, 7, 200],
      [10, 3, 315],
    ] as const) {
      const u = unitAt(deg);
      const h = 1e-6;
      const step =
        (utility(x + h * u[0], y + h * u[1]) - utility(x - h * u[0], y - h * u[1])) / (2 * h);
      expect(directional(gradient(x, y), u)).toBeCloseTo(step, 6);
    }
  });

  it('describes the direction relative to the gradient', () => {
    const g = gradient(4, 6);
    expect(describeDirection(g, [6 / norm(g), 4 / norm(g)])).toMatch(/as fast as it can here/);
    expect(describeDirection(g, [-6 / norm(g), -4 / norm(g)])).toMatch(/falls as fast/);
    expect(describeDirection(g, [2 / Math.sqrt(13), -3 / Math.sqrt(13)])).toMatch(
      /indifference curve/,
    );
    expect(describeDirection(g, unitAt(0))).toMatch(/rises/);
    expect(describeDirection(g, unitAt(180))).toMatch(/falls\.$/);
  });
});
