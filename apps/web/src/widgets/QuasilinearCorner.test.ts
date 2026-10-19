import { describe, expect, it } from 'vitest';
import { bindingLabel, indifferenceY, quasilinearOptimum, utility } from './QuasilinearCorner';

describe('QuasilinearCorner maths', () => {
  it('matches worked example 1 in OP01 (U = 24 ln x + y, p = 4)', () => {
    // Income 16: corner, x = 4, y = 0, λ = 1.5.
    expect(quasilinearOptimum(24, 4, 16)).toEqual({ x: 4, y: 0, lambda: 1.5, corner: true });
    // Income 60: interior, x = 6, y = 36, λ = 1.
    expect(quasilinearOptimum(24, 4, 60)).toEqual({ x: 6, y: 36, lambda: 1, corner: false });
    expect(bindingLabel(24, 16)).toBe('budget and y ≥ 0');
    expect(bindingLabel(24, 60)).toBe('budget only');
  });

  it('beats every other bundle on the budget line over the slider range', () => {
    for (let income = 4; income <= 48; income += 2) {
      for (let p = 2; p <= 8; p += 0.5) {
        const best = quasilinearOptimum(24, p, income);
        expect(best.x * p + best.y).toBeCloseTo(income, 9);
        expect(best.y).toBeGreaterThanOrEqual(0);
        const top = utility(24, best.x, best.y);
        for (let i = 1; i <= 200; i++) {
          const x = (income / p) * (i / 200);
          expect(utility(24, x, income - p * x)).toBeLessThanOrEqual(top + 1e-9);
        }
      }
    }
  });

  it('meets the Kuhn–Tucker conditions: λ ≥ 1, 1 − λ ≤ 0 and y·(1 − λ) = 0', () => {
    for (const [p, income] of [
      [4, 16],
      [4, 24],
      [2.5, 70],
      [8, 4],
    ] as const) {
      const { y, lambda } = quasilinearOptimum(24, p, income);
      expect(lambda).toBeGreaterThanOrEqual(1);
      expect(Math.abs(y * (1 - lambda))).toBeLessThan(1e-12);
    }
  });

  it('draws the indifference curve through the best bundle', () => {
    const best = quasilinearOptimum(24, 4, 60);
    const u = utility(24, best.x, best.y);
    expect(indifferenceY(24, u)(best.x)).toBeCloseTo(36, 12);
  });
});
