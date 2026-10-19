import { describe, expect, it } from 'vitest';
import {
  budgetY,
  indifferenceY,
  mrs,
  optimum,
  PRICE_Y,
  utility,
  xWhereY,
} from './LagrangeBudgetTangency';

describe('LagrangeBudgetTangency maths', () => {
  it('matches worked example 1 in MV08 (5x + 10y = 600: best bundle (60, 30), MRS 0.5)', () => {
    const best = optimum(0.5, 5, PRICE_Y, 600);
    expect(best.x).toBeCloseTo(60, 12);
    expect(best.y).toBeCloseTo(30, 12);
    expect(mrs(0.5, best.x, best.y)).toBeCloseTo(5 / PRICE_Y, 12);
    // U = x^0.5·y^0.5 ranks bundles as xy does: √1800.
    expect(utility(0.5, best.x, best.y)).toBeCloseTo(Math.sqrt(1800), 12);
  });

  it('puts the optimum on the budget line with MRS = price ratio, for every slider setting', () => {
    for (let px = 4; px <= 15; px++) {
      for (let M = 200; M <= 800; M += 50) {
        for (let i = 2; i <= 8; i++) {
          const a = i / 10;
          const best = optimum(a, px, PRICE_Y, M);
          expect(px * best.x + PRICE_Y * best.y).toBeCloseTo(M, 9);
          expect(mrs(a, best.x, best.y)).toBeCloseTo(px / PRICE_Y, 9);
          expect(budgetY(px, PRICE_Y, M, best.x)).toBeCloseTo(best.y, 9);
          expect(best.x).toBeLessThanOrEqual(160 + 1e-9);
          expect(best.y).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it('beats every other bundle on the budget line (brute force)', () => {
    for (const [a, px, M] of [
      [0.5, 5, 600],
      [0.3, 12, 450],
      [0.8, 4, 800],
    ] as const) {
      const best = optimum(a, px, PRICE_Y, M);
      const top = utility(a, best.x, best.y);
      for (let x = 0.5; x < M / px; x += 0.5) {
        expect(utility(a, x, budgetY(px, PRICE_Y, M, x))).toBeLessThanOrEqual(top + 1e-9);
      }
    }
  });

  it('draws indifference curves that pass through the optimum and stop at the floor', () => {
    const best = optimum(0.4, 6, PRICE_Y, 500);
    const u = utility(0.4, best.x, best.y);
    expect(indifferenceY(0.4, u, best.x)).toBeCloseTo(best.y, 9);
    expect(indifferenceY(0.4, u, xWhereY(0.4, u, 12))).toBeCloseTo(12, 9);
  });
});
