import { describe, expect, it } from 'vitest';
import { BEST, contour, describeGradient, gradient, hessian, profit } from './TwoProductProfitMap';

describe('TwoProductProfitMap', () => {
  it('reproduces MV07 Example 1: maximum profit 352 at (10, 8), where the gradient is zero', () => {
    expect(profit(10, 8)).toBe(352);
    expect(gradient(10, 8)).toEqual([0, 0]);
    expect(BEST).toEqual([10, 8]);
    expect(hessian.det).toBe(20);
    expect(hessian.p11).toBe(-4);
    expect(describeGradient(10, 8)).toContain('top of the hill');
  });

  it('finds the same maximum by trying every half-unit output pair', () => {
    let best: [number, number] = [0, 0];
    for (let x = 0; x <= 20; x += 0.5) {
      for (let y = 0; y <= 13; y += 0.5) {
        if (profit(x, y) > profit(best[0], best[1])) best = [x, y];
      }
    }
    expect(best).toEqual([10, 8]);
  });

  it('the gradient matches numeric partial derivatives', () => {
    const h = 1e-4;
    for (const [x, y] of [
      [0, 0],
      [4, 4],
      [15, 2],
      [20, 13],
    ] as const) {
      const [g1, g2] = gradient(x, y);
      expect(g1).toBeCloseTo((profit(x + h, y) - profit(x - h, y)) / (2 * h), 5);
      expect(g2).toBeCloseTo((profit(x, y + h) - profit(x, y - h)) / (2 * h), 5);
    }
    expect(gradient(4, 4)).toEqual([32, 36]);
    expect(profit(4, 4)).toBe(184);
  });

  it('every point of a contour has the contour’s profit', () => {
    for (const level of [340, 300, 200, 100]) {
      const c = contour(level);
      if (!c) throw new Error('contour expected');
      for (let i = 0; i <= 20; i++) {
        const x = c.from + ((c.to - c.from) * i) / 20;
        expect(profit(x, c.upper(x))).toBeCloseTo(level, 6);
        expect(profit(x, c.lower(x))).toBeCloseTo(level, 6);
      }
    }
    expect(contour(400)).toBeNull();
  });

  it('tells the student which way to move', () => {
    expect(describeGradient(4, 4)).toContain('more Q₁ raises profit');
    expect(describeGradient(20, 13)).toContain('less Q₂ raises profit');
  });
});
