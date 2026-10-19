import { describe, expect, it } from 'vitest';
import {
  ASSEMBLY,
  bestPlan,
  CABINET_PROFIT,
  cutting,
  describeRange,
  FINISHING,
  regionCorners,
  shadowPrice,
  spareHours,
  TABLE_PROFIT,
} from './ShadowPriceHours';

/** The best profit over a fine grid of plans that fit every machine, found by trying them all. */
function gridBest(hours: number): number {
  const limits = [cutting(hours), ASSEMBLY, FINISHING];
  let best = 0;
  for (let x = 0; x <= 30; x += 0.2) {
    for (let y = 0; y <= 30; y += 0.2) {
      if (limits.every((k) => k.a * x + k.b * y <= k.c + 1e-9))
        best = Math.max(best, TABLE_PROFIT * x + CABINET_PROFIT * y);
    }
  }
  return best;
}

describe('ShadowPriceHours', () => {
  it('reproduces Example 2 in OP03: 40 cutting hours, best plan (16, 8), profit 640, price 10', () => {
    expect(bestPlan(40).plan.map((v) => Math.round(v * 1e9) / 1e9)).toEqual([16, 8]);
    expect(bestPlan(40).profit).toBeCloseTo(640, 9);
    expect(shadowPrice(40)).toBeCloseTo(10, 9);
    expect(spareHours(40)).toBeCloseTo(0, 9);
    // 5 extra hours within the range add 5 × 10.
    expect(bestPlan(45).profit).toBeCloseTo(690, 9);
  });

  it('has the slopes 20, 14, 10 and 0 between the kinks at 20, 30 and 48 hours', () => {
    expect(bestPlan(20).profit).toBeCloseTo(400, 9);
    expect(bestPlan(30).profit).toBeCloseTo(540, 9);
    expect(bestPlan(48).profit).toBeCloseTo(720, 9);
    for (const [h, slope] of [
      [10, 20],
      [19, 20],
      [20, 14],
      [29, 14],
      [30, 10],
      [47, 10],
      [48, 0],
      [59, 0],
    ] as const) {
      expect(shadowPrice(h)).toBeCloseTo(slope, 9);
      expect(describeRange(h)).toContain(`${slope}`);
    }
    expect(spareHours(50)).toBeCloseTo(2, 9);
  });

  it('agrees with a brute-force search over plans', () => {
    for (const h of [10, 15, 22, 27, 33, 40, 46, 52, 60]) {
      expect(bestPlan(h).profit).toBeGreaterThanOrEqual(gridBest(h) - 1e-6);
      expect(bestPlan(h).profit - gridBest(h)).toBeLessThan(TABLE_PROFIT * 0.2 + 1e-6);
    }
  });

  it('keeps the corners inside every machine limit', () => {
    for (const h of [10, 25, 40, 60]) {
      for (const [x, y] of regionCorners(h)) {
        for (const k of [cutting(h), ASSEMBLY, FINISHING])
          expect(k.a * x + k.b * y).toBeLessThanOrEqual(k.c + 1e-9);
      }
    }
  });
});
