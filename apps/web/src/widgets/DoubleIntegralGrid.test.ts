import { describe, expect, it } from 'vitest';
import {
  DEPTH,
  density,
  exactTotal,
  gridCells,
  riemannSum,
  SHADES,
  shadeOf,
} from './DoubleIntegralGrid';

describe('DoubleIntegralGrid', () => {
  it('reproduces MV13 Example 2: exact total 24, the 2 × 2 grid gives 22.875', () => {
    expect(exactTotal(3)).toBe(24);
    expect(riemannSum(3, 2)).toBeCloseTo(22.875, 10);
    expect(exactTotal(3) - riemannSum(3, 2)).toBeCloseTo(1.125, 10);
    // The four cell centres of Example 2 and their densities.
    expect(gridCells(3, 2).map((c) => c.value)).toEqual([1.0625, 2.0625, 5.5625, 6.5625]);
  });

  it('the exact total matches a fine numerical integration (iterated, y inside)', () => {
    for (const a of [1, 1.5, 2.5, 4]) {
      const N = 400;
      let s = 0;
      for (let i = 0; i < N; i++) {
        const x = ((i + 0.5) * a) / N;
        // The inner integral in y of x² + y over [0, 2] is 2x² + 2, by the trapezium rule (exact here).
        s += ((density(x, 0) + density(x, DEPTH)) / 2) * DEPTH * (a / N);
      }
      expect(Math.abs(s - exactTotal(a))).toBeLessThan(1e-4);
    }
  });

  it('the midpoint error is a³/(6n²): it falls to a quarter when n doubles', () => {
    for (const a of [1, 2, 3, 3.5, 4]) {
      for (let n = 1; n <= 12; n++) {
        expect(exactTotal(a) - riemannSum(a, n)).toBeCloseTo(a ** 3 / (6 * n * n), 9);
      }
    }
    const e4 = exactTotal(3) - riemannSum(3, 4);
    const e8 = exactTotal(3) - riemannSum(3, 8);
    expect(e4 / e8).toBeCloseTo(4, 9);
  });

  it('covers the zone with n² cells and shades larger values darker', () => {
    const cells = gridCells(2.5, 6);
    expect(cells).toHaveLength(36);
    const area = cells.reduce((s, c) => s + (c.x1 - c.x0) * (c.y1 - c.y0), 0);
    expect(area).toBeCloseTo(2.5 * DEPTH, 10);
    expect(shadeOf(density(4, 2), 4)).toBe(SHADES);
    expect(shadeOf(0.01, 4)).toBe(1);
    expect(shadeOf(9, 4)).toBeGreaterThan(shadeOf(3, 4));
  });
});
