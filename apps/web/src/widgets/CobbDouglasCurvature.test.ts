import { describe, expect, it } from 'vitest';
import {
  chordOnIsoquant,
  concavity,
  DIAGONAL,
  hessianAtOne,
  isoquantL,
  niceMax,
  output,
  scaleSum,
} from './CobbDouglasCurvature';

describe('CobbDouglasCurvature', () => {
  it('reproduces MV06 Example 2: Q = 10K^0.3 L^0.5 has D = 3 at (1, 1); with b = 0.8, D = −2.4', () => {
    const h = hessianAtOne(0.3, 0.5);
    expect(h.kk).toBeCloseTo(-2.1, 12);
    expect(h.ll).toBeCloseTo(-2.5, 12);
    expect(h.kl).toBeCloseTo(1.5, 12);
    expect(h.det).toBeCloseTo(3, 12);
    expect(hessianAtOne(0.3, 0.8).det).toBeCloseTo(-2.4, 12);
    expect(concavity(0.3, 0.5)).toBe('yes');
    expect(concavity(0.3, 0.8)).toBe('no');
  });

  it('D at (1, 1) equals A²ab(1 − a − b) and matches a numeric Hessian', () => {
    const h = 1e-4;
    for (const [a, b] of [
      [0.3, 0.5],
      [0.6, 0.7],
      [0.25, 0.75],
      [0.9, 0.9],
    ] as const) {
      const f = (K: number, L: number) => output(a, b, K, L);
      const fkk = (f(1 + h, 1) - 2 * f(1, 1) + f(1 - h, 1)) / (h * h);
      const fll = (f(1, 1 + h) - 2 * f(1, 1) + f(1, 1 - h)) / (h * h);
      const fkl =
        (f(1 + h, 1 + h) - f(1 + h, 1 - h) - f(1 - h, 1 + h) + f(1 - h, 1 - h)) / (4 * h * h);
      const det = hessianAtOne(a, b).det;
      expect(det).toBeCloseTo(100 * a * b * (1 - a - b), 9);
      expect(Math.abs(fkk * fll - fkl * fkl - det)).toBeLessThan(1e-3);
    }
  });

  it('the verdict follows the slider steps exactly, including a + b = 1', () => {
    expect(scaleSum(0.3, 0.7)).toBe(1);
    expect(concavity(0.3, 0.7)).toBe('yes, just');
    expect(concavity(0.45, 0.6)).toBe('no');
    expect(concavity(0.1, 0.1)).toBe('yes');
  });

  it('the isoquants pass through the diagonal points, and the chord between two mixes produces more', () => {
    for (const [a, b] of [
      [0.3, 0.5],
      [0.8, 0.9],
      [0.1, 0.9],
      [0.9, 0.1],
    ] as const) {
      for (const t of DIAGONAL) expect(isoquantL(a, b, output(a, b, t, t))(t)).toBeCloseTo(t, 9);
      const level = output(a, b, 5, 5);
      const [p, q] = chordOnIsoquant(a, b);
      expect(output(a, b, ...p)).toBeCloseTo(level, 9);
      expect(output(a, b, ...q)).toBeCloseTo(level, 9);
      // Both ends lie inside the drawn square, and every inner point of the chord beats the level.
      for (const v of [...p, ...q]) expect(v > 0 && v <= 10).toBe(true);
      for (let s = 0.1; s < 0.95; s += 0.1) {
        const K = s * p[0] + (1 - s) * q[0];
        const L = s * p[1] + (1 - s) * q[1];
        expect(output(a, b, K, L)).toBeGreaterThan(level);
      }
    }
  });

  it('rounds axis limits up', () => {
    expect(niceMax(63.1)).toBe(70);
    expect(niceMax(15.8)).toBe(20);
    expect(niceMax(631)).toBe(700);
    expect(niceMax(100)).toBe(100);
  });
});
