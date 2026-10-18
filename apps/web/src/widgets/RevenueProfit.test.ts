import { describe, expect, it } from 'vitest';
import { profit, profitTop, revenue, revenueTop } from './RevenueProfit';

describe('RevenueProfit', () => {
  it('reproduces F06 Example 3: P = 120 − 3Q, C = 400 + 30Q', () => {
    expect(revenueTop(120, 3)).toEqual({ q: 20, p: 60, value: 1200 });
    expect(profitTop(120, 3, 30, 400)).toEqual({ q: 15, p: 75, value: 275 });
    expect(profit(120, 3, 30, 400, 20)).toBe(200);
  });

  it('reproduces F06 Example 1: P = 60 − 2Q peaks at Q = 15 with R = 450', () => {
    expect(revenueTop(60, 2)).toEqual({ q: 15, p: 30, value: 450 });
    expect(revenue(60, 2, 10)).toBe(400);
    expect(revenue(60, 2, 20)).toBe(400);
  });

  it('finds the true tops: no nearby quantity does better', () => {
    for (const v of [0, 15, 30, 60]) {
      for (const fixed of [0, 400, 800]) {
        const top = profitTop(120, 3, v, fixed);
        for (const dq of [-1, -0.1, 0.1, 1]) {
          expect(profit(120, 3, v, fixed, top.q + dq)).toBeLessThan(top.value);
        }
        expect(top.p).toBeCloseTo((120 + v) / 2, 10);
        // a fixed cost lowers the top, it does not move it sideways
        expect(top.q).toBe(profitTop(120, 3, v, 0).q);
        expect(top.value).toBeCloseTo(profitTop(120, 3, v, 0).value - fixed, 10);
      }
    }
  });
});
