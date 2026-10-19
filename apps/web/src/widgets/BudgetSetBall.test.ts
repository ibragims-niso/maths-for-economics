import { describe, expect, it } from 'vitest';
import {
  bestBundleXY,
  circlePoints,
  distanceToBudgetLine,
  INCOME,
  isCompact,
  largestBallRadius,
  nearestEdge,
  P2,
  positionOf,
} from './BudgetSetBall';

const inS = (p1: number, x: number, y: number) =>
  x >= -1e-9 && y >= -1e-9 && p1 * x + P2 * y <= INCOME + 1e-9;

describe('BudgetSetBall maths', () => {
  it('matches Example 1 in AN04: r = 1.2 at (2, 3) and r = 1 at (1, 3); (4, 3) is a boundary point', () => {
    expect(distanceToBudgetLine(3, 2, 3)).toBeCloseTo(1.2, 12);
    expect(largestBallRadius(3, 2, 3)).toBeCloseTo(1.2, 12);
    expect(nearestEdge(3, 2, 3).edge).toBe('the budget line');
    expect(largestBallRadius(3, 1, 3)).toBe(1);
    expect(nearestEdge(3, 1, 3).edge).toBe('the edge x = 0');
    expect(distanceToBudgetLine(3, 1, 3)).toBeCloseTo(1.8, 12);
    expect(positionOf(3, 4, 3)).toBe('boundary');
    expect(largestBallRadius(3, 4, 3)).toBe(0);
  });

  it('matches Example 2: the best bundle for xy is (4, 3) when p₁ = 3', () => {
    expect(bestBundleXY(3)).toEqual([4, 3]);
    expect(isCompact(3)).toBe(true);
  });

  it('matches the Try it checks: a free good 1 makes S unbounded; (4, 3) is then interior with r = 3', () => {
    expect(isCompact(0)).toBe(false);
    expect(bestBundleXY(0)).toBeNull();
    expect(positionOf(0, 4, 3)).toBe('interior');
    expect(largestBallRadius(0, 4, 3)).toBe(3);
    expect(positionOf(3, 8, 6)).toBe('outside');
    expect(largestBallRadius(3, 8, 6)).toBeNull();
  });

  it('the nearest edge point is at distance r and lies on the boundary', () => {
    for (let p1 = 0; p1 <= 6; p1 += 0.5) {
      for (let x = 0.5; x <= 10; x += 0.5) {
        for (let y = 0.5; y <= 7; y += 0.5) {
          const r = largestBallRadius(p1, x, y);
          if (r === null || r === 0) continue;
          const { point } = nearestEdge(p1, x, y);
          expect(Math.hypot(point[0] - x, point[1] - y)).toBeCloseTo(r, 9);
          // A slightly smaller circle stays in S; a slightly bigger one leaves it.
          expect(circlePoints([x, y], r * 0.999, 360).every(([a, b]) => inS(p1, a, b))).toBe(true);
          expect(circlePoints([x, y], r * 1.01, 360).every(([a, b]) => inS(p1, a, b))).toBe(false);
        }
      }
    }
  });
});
