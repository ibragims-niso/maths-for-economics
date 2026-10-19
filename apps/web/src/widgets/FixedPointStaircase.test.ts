import { describe, expect, it } from 'vitest';
import {
  fixedPoint,
  isContraction,
  iterates,
  mapsIntoItself,
  mapValue,
  staircase,
} from './FixedPointStaircase';

describe('FixedPointStaircase', () => {
  it('reproduces AN05 Example 1 (f(p) = 6 − 0.5p from p₀ = 1)', () => {
    const xs = iterates(6, -0.5, 1);
    expect(xs.slice(0, 4)).toEqual([1, 5.5, 3.25, 4.375]);
    expect(fixedPoint(6, -0.5)).toEqual({ kind: 'one', x: 4 });
    expect(isContraction(-0.5)).toBe(true);
    expect(mapsIntoItself(6, -0.5)).toBe(true);
    // x₁₀ = 4 − 3·0.5¹⁰ = 3.99707…
    expect(xs[10]).toBeCloseTo(4 - 3 * 0.5 ** 10, 12);
    expect(xs[10]).toBeCloseTo(3.997, 3);
  });

  it('finds the crossing with the 45° line and follows x* + (x₀ − x*)kⁿ', () => {
    for (let k = -1.2; k <= 1.2 + 1e-9; k += 0.05) {
      for (const a of [0, 2.5, 6, 10]) {
        const fp = fixedPoint(a, k);
        if (Math.abs(k - 1) < 1e-9) {
          expect(fp.kind).toBe(a === 0 ? 'all' : 'none');
          continue;
        }
        if (fp.kind !== 'one') throw new Error('one fixed point expected');
        expect(mapValue(a, k, fp.x)).toBeCloseTo(fp.x, 9);
        for (const x0 of [0, 3, 10]) {
          iterates(a, k, x0).forEach((x, n) => {
            expect(x).toBeCloseTo(fp.x + (x0 - fp.x) * k ** n, 6);
          });
        }
      }
    }
  });

  it('converges exactly when |k| < 1, and the error shrinks by |k| each step', () => {
    expect(isContraction(0.95)).toBe(true);
    expect(isContraction(-1)).toBe(false);
    expect(isContraction(1.2)).toBe(false);
    const xs = iterates(6, 0.5, 0, 40);
    expect(xs[40]).toBeCloseTo(12, 9);
    // |k| = 1: the staircase cycles between two values.
    expect(iterates(10, -1, 2, 4)).toEqual([2, 8, 2, 8, 2]);
    // |k| > 1: f(x) = 1.2x runs away from its fixed point 0.
    const away = iterates(0, 1.2, 1, 10);
    expect(away[10]).toBeCloseTo(1.2 ** 10, 9);
    expect(Math.abs(away[10] ?? 0)).toBeGreaterThan(Math.abs(away[0] ?? 0));
  });

  it('checks Brouwer’s condition on [0, 10] and draws a staircase that ends on the 45° line', () => {
    expect(mapsIntoItself(10, -1)).toBe(true);
    expect(mapsIntoItself(6, 0.5)).toBe(false);
    expect(mapsIntoItself(2, 0.8)).toBe(true);
    const legs = staircase(iterates(6, -0.5, 1));
    expect(legs).toHaveLength(20);
    expect(legs[0]).toMatchObject({ from: [1, 0], to: [1, 5.5] });
    expect(legs[1]).toMatchObject({ from: [1, 5.5], to: [5.5, 5.5] });
    const end = legs[legs.length - 1];
    expect(end?.to[0]).toBe(end?.to[1]);
    // An exploding path stops being drawn once it is far away.
    expect(staircase(iterates(10, 1.2, 10)).length).toBeLessThan(20);
  });
});
