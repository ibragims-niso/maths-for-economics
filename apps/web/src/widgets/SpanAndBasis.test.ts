import { describe, expect, it } from 'vitest';
import { coordinatesIn, det2, rank2 } from './SpanAndBasis';

describe('SpanAndBasis maths (LA201)', () => {
  it('finds the determinant and rank of Example 1: a = (2, 1), b = (3, 4)', () => {
    expect(det2([2, 1], [3, 4])).toBe(5);
    expect(rank2([2, 1], [3, 4])).toBe(2);
  });

  it('gives det 0 and rank 1 when b lines up with a, as in the Try it check b = (4, 2)', () => {
    expect(det2([2, 1], [4, 2])).toBe(0);
    expect(rank2([2, 1], [4, 2])).toBe(1);
    expect(rank2([2, 1], [-1, -0.5])).toBe(1);
    expect(rank2([2, 1], [0, 0])).toBe(1);
    expect(rank2([0, 0], [0, 0])).toBe(0);
  });

  it('finds the coordinates of x = (13, 14) in the basis {a, b}: 2 units of A and 3 of B', () => {
    const c = coordinatesIn([2, 1], [3, 4], [13, 14]);
    expect(c?.[0]).toBeCloseTo(2, 12);
    expect(c?.[1]).toBeCloseTo(3, 12);
    expect(coordinatesIn([2, 1], [4, 2], [13, 14])).toBeNull();
    // Rebuilding x from its coordinates gives x back, for any basis.
    for (const b of [
      [3, 4],
      [-1, 2],
      [0.5, -3],
    ] as [number, number][]) {
      const [c1, c2] = coordinatesIn([2, 1], b, [7, -5]) ?? [Number.NaN, Number.NaN];
      expect(c1 * 2 + c2 * b[0]).toBeCloseTo(7, 10);
      expect(c1 * 1 + c2 * b[1]).toBeCloseTo(-5, 10);
    }
  });
});
