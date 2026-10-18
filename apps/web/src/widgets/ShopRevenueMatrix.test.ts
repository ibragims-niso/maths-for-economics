import { describe, expect, it } from 'vitest';
import { revenueAtCoffeePrice, revenueVector, SALES } from './ShopRevenueMatrix';

describe('ShopRevenueMatrix maths', () => {
  it('matches worked example 1 in LA102 (Qp = (205, 310) at prices 2, 3, 5)', () => {
    expect(revenueVector(SALES, [2, 3, 5])).toEqual([205, 310]);
    // A 10 % rise in every price scales the revenue vector by 1.1.
    const raised = revenueVector(SALES, [2.2, 3.3, 5.5]);
    expect(raised[0]).toBeCloseTo(225.5, 9);
    expect(raised[1]).toBeCloseTo(341, 9);
  });

  it('gives the columns of QP in worked example 2 (both price lists)', () => {
    expect(revenueVector(SALES, [2, 3, 5])).toEqual([205, 310]);
    expect(revenueVector(SALES, [3, 3, 4])).toEqual([235, 320]);
  });

  it('a one-unit rise in the coffee price adds the coffee column of Q', () => {
    for (const bread of [0, 2, 6]) {
      for (const coffee of [0, 5, 9]) {
        expect(
          revenueAtCoffeePrice(0, bread, coffee + 1) - revenueAtCoffeePrice(0, bread, coffee),
        ).toBe(10);
        expect(
          revenueAtCoffeePrice(1, bread, coffee + 1) - revenueAtCoffeePrice(1, bread, coffee),
        ).toBe(20);
      }
    }
    expect(revenueAtCoffeePrice(0, 2, 6)).toBe(215);
    expect(revenueAtCoffeePrice(1, 2, 6)).toBe(330);
  });

  it('is linear in the prices: Q(p + r) = Qp + Qr', () => {
    const p = [2, 3, 5];
    const r = [1.5, 0, 2];
    const sum = revenueVector(SALES, [3.5, 3, 7]);
    const parts = revenueVector(SALES, p).map((x, k) => x + (revenueVector(SALES, r)[k] ?? 0));
    expect(sum).toEqual(parts);
  });
});
