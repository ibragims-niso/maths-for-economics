import { describe, expect, it } from 'vitest';
import {
  bestLabel,
  describeRounding,
  fits,
  integerOptimum,
  lpOptimum,
  priceOfIntegrality,
  profit,
  regionCorners,
  wholeFleets,
} from './FleetIntegerPlan';

describe('FleetIntegerPlan', () => {
  it('reproduces Example 2 of OP06: LP 31.5 at (1.5, 4.5), best whole fleet 30 at (2, 3)', () => {
    const sorted = [...regionCorners(90)].sort((m, n) => m[0] - n[0] || m[1] - n[1]);
    expect(sorted).toEqual([
      [0, 0],
      [0, 6],
      [1.5, 4.5],
      [3, 0],
    ]);
    expect(lpOptimum(90, 9)).toEqual({ plan: [1.5, 4.5], profit: 31.5 });
    expect(integerOptimum(90, 9)).toEqual({ plans: [[2, 3]], profit: 30 });
    expect(priceOfIntegrality(90, 9)).toBe(1.5);
    // Rounding to (2, 5) breaks both limits; rounding down to (1, 4) earns only 25.
    expect(fits(90, [2, 5], 0)).toBe(false);
    expect(profit(9, [1, 4])).toBe(25);
    expect(describeRounding(90, 9)).toMatch(/\(2, 5\) breaks the budget \(it costs 110\)/);
  });

  it('matches the two branches of Example 2: x ≤ 1 gives 29 at (1, 5), x ≥ 2 gives 30 at (2, 3)', () => {
    const fleets = wholeFleets(90);
    const best = (keep: (x: number) => boolean) =>
      Math.max(...fleets.filter(([x]) => keep(x)).map((f) => profit(9, f)));
    expect(best((x) => x <= 1)).toBe(29);
    expect(best((x) => x >= 2)).toBe(30);
  });

  it('finds the same optima as a fine grid search, for every slider setting', () => {
    for (let budget = 60; budget <= 150; budget += 10) {
      for (let p = 2; p <= 15; p++) {
        let lp = 0;
        for (let x = 0; x <= 6; x += 0.05) {
          for (let y = 0; y <= 6; y += 0.05) {
            if (fits(budget, [x, y], 1e-9)) lp = Math.max(lp, profit(p, [x, y]));
          }
        }
        // The LP corners lie on a 1/30 grid, so the coarse search can only fall a little short.
        expect(lpOptimum(budget, p).profit).toBeGreaterThanOrEqual(lp - 1e-9);
        expect(lpOptimum(budget, p).profit - lp).toBeLessThan(1);
        let whole = 0;
        for (let x = 0; x <= 10; x++) {
          for (let y = 0; y <= 10; y++) {
            if (30 * x + 10 * y <= budget && x + y <= 6) whole = Math.max(whole, profit(p, [x, y]));
          }
        }
        expect(integerOptimum(budget, p).profit).toBe(whole);
        expect(priceOfIntegrality(budget, p)).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it('says when the LP plan is already whole and when rounding is merely feasible', () => {
    expect(lpOptimum(100, 9).plan).toEqual([2, 4]);
    expect(priceOfIntegrality(100, 9)).toBe(0);
    expect(describeRounding(100, 9)).toMatch(/already whole/);
    expect(describeRounding(100, 14)).toMatch(/\(3, 0\) gives a fleet that fits but earns only 42/);
    expect(bestLabel(integerOptimum(150, 4).plans)).toBe('Best whole fleet (5 plans tie)');
  });
});
