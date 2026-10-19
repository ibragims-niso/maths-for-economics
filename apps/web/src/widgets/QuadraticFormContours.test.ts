import { describe, expect, it } from 'vitest';
import {
  classify,
  contour,
  describeShape,
  eigenvalues,
  eigenvectors,
  insideSpans,
  minors,
  quadForm,
} from './QuadraticFormContours';

const FRAME = { xMin: -4.5, xMax: 4.5, yMin: -3, yMax: 3 };

/** Smallest and largest value of Q on the unit circle, by trying 3,600 angles. */
function circleRange(a: number, b: number, c: number): [number, number] {
  const values = Array.from({ length: 3600 }, (_, k) => {
    const t = (2 * Math.PI * k) / 3600;
    return quadForm(a, b, c, Math.cos(t), Math.sin(t));
  });
  return [Math.min(...values), Math.max(...values)];
}

const GRID = [-5, -3, -2, -0.5, 0, 0.5, 2, 4, 5].flatMap((a) =>
  [-10, -6, -4, -1, 0, 1, 4, 8, 10].flatMap((b) =>
    [-5, -2, -0.5, 0, 0.5, 2, 5].map((c) => [a, b, c] as const),
  ),
);

describe('QuadraticFormContours', () => {
  it('reproduces LA204 Example 1: 2x² + 4xy + 5y² has D₁ = 2, D₂ = 6, eigenvalues 6 and 1', () => {
    expect(minors(2, 4, 5)).toEqual([2, 6]);
    expect(eigenvalues(2, 4, 5)).toEqual([6, 1]);
    expect(classify(2, 4, 5)).toBe('positive definite');
    expect(quadForm(2, 4, 5, 1, 2)).toBe(30);
    expect(quadForm(2, 4, 5, 2, -1)).toBe(5);
    // The eigenvector for 6 points along (1, 2).
    const [v] = eigenvectors(2, 4, 5);
    expect(v[1] / v[0]).toBeCloseTo(2, 12);
  });

  it('matches the numbers quoted in the Try it text', () => {
    expect(minors(2, 8, 5)).toEqual([2, -6]);
    const [l1, l2] = eigenvalues(2, 8, 5);
    expect(l1).toBeCloseTo(7.77, 2);
    expect(l2).toBeCloseTo(-0.77, 2);
    expect(classify(2, 8, 5)).toBe('indefinite');
    expect(minors(2, 4, 2)).toEqual([2, 0]);
    expect(eigenvalues(2, 4, 2)).toEqual([4, 0]);
    expect(classify(2, 4, 2)).toBe('positive semidefinite');
    expect(classify(-2, 4, -5)).toBe('negative definite');
    expect(eigenvalues(-2, 4, -5)).toEqual([-1, -6]);
  });

  it('the eigenvalues are the extremes of Q on the unit circle, and the verdict fits them', () => {
    for (const [a, b, c] of GRID) {
      const [lo, hi] = circleRange(a, b, c);
      const [l1, l2] = eigenvalues(a, b, c);
      expect(Math.abs(l1 - hi)).toBeLessThan(1e-4);
      expect(Math.abs(l2 - lo)).toBeLessThan(1e-4);
      expect(l1 * l2).toBeCloseTo(minors(a, b, c)[1], 9);
      const v = classify(a, b, c);
      if (v === 'positive definite') expect(lo).toBeGreaterThan(0);
      if (v === 'negative definite') expect(hi).toBeLessThan(0);
      if (v === 'indefinite') expect(lo < 0 && hi > 0).toBe(true);
      if (v === 'positive semidefinite') expect(lo > -1e-9 && Math.abs(lo) < 1e-4).toBe(true);
      if (v === 'negative semidefinite') expect(hi < 1e-9 && Math.abs(hi) < 1e-4).toBe(true);
      expect(describeShape(v).length).toBeGreaterThan(20);
    }
  });

  it('every drawn point of a contour has the contour’s height and lies in the frame', () => {
    for (const [a, b, c] of GRID) {
      for (const k of [1, 4, -9, 16]) {
        for (const piece of contour(a, b, c, k, FRAME)) {
          if ('at' in piece) {
            expect(quadForm(a, b, c, piece.at, 1.7)).toBeCloseTo(k, 9);
            continue;
          }
          for (let i = 0; i <= 10; i++) {
            const x = piece.from + ((piece.to - piece.from) * i) / 10;
            const y = piece.fn(x);
            expect(y).toBeGreaterThanOrEqual(FRAME.yMin - 1e-9);
            expect(y).toBeLessThanOrEqual(FRAME.yMax + 1e-9);
            expect(Math.abs(quadForm(a, b, c, x, y) - k)).toBeLessThan(1e-6 * (1 + Math.abs(k)));
          }
        }
      }
    }
  });

  it('a definite form has closed contours only at heights of its own sign', () => {
    expect(contour(2, 4, 5, -1, FRAME)).toEqual([]);
    expect(contour(-2, 4, -5, 1, FRAME)).toEqual([]);
    expect(contour(2, 4, 5, 1, FRAME).length).toBe(2);
  });

  it('cuts a branch where it leaves the frame', () => {
    const spans = insideSpans((x) => x * x, -4, 4, FRAME);
    expect(spans).toHaveLength(1);
    const [s, e] = spans[0] ?? [0, 0];
    expect(s).toBeCloseTo(-Math.sqrt(3), 6);
    expect(e).toBeCloseTo(Math.sqrt(3), 6);
  });
});
