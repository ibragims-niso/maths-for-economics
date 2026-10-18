import { describe, expect, it } from 'vitest';
import {
  describeMarginalRevenue,
  marginalRevenue,
  oneMoreUnit,
  price,
  revenue,
} from './MarginalRevenueLines';

describe('MarginalRevenueLines', () => {
  it('reproduces C106 Example 2: at Q = 20, P = 80, MR = 40, R = 1600, and unit 21 adds 38', () => {
    expect(price(20)).toBe(80);
    expect(marginalRevenue(20)).toBe(40);
    expect(revenue(20)).toBe(1600);
    expect(oneMoreUnit(20)).toEqual({ newPrice: 78, priceCut: 40, change: 38 });
    expect(revenue(21) - revenue(20)).toBe(38);
  });

  it('MR is the slope of revenue (numeric derivative) and lies below the price for Q > 0', () => {
    const h = 1e-4;
    for (let q = 0; q <= 55; q += 2.5) {
      const slope = (revenue(q + h) - revenue(q - h)) / (2 * h);
      expect(marginalRevenue(q)).toBeCloseTo(slope, 5);
      if (q > 0) expect(marginalRevenue(q)).toBeLessThan(price(q));
    }
  });

  it('MR is twice as steep as demand and reaches 0 at Q = 30, where revenue peaks', () => {
    expect(marginalRevenue(0)).toBe(price(0));
    expect(marginalRevenue(10) - marginalRevenue(11)).toBe(2 * (price(10) - price(11)));
    expect(marginalRevenue(30)).toBe(0);
    let best = 0;
    for (let q = 0; q <= 60; q++) if (revenue(q) > revenue(best)) best = q;
    expect(best).toBe(30);
    expect(describeMarginalRevenue(30)).toContain('peak');
  });

  it('the exact one-unit change splits into the new unit’s price minus the price cut', () => {
    for (let q = 0; q <= 55; q++) {
      const { newPrice, priceCut, change } = oneMoreUnit(q);
      expect(change).toBe(revenue(q + 1) - revenue(q));
      expect(change).toBe(newPrice - priceCut);
    }
  });

  it('tells the student what the sign of MR means', () => {
    expect(describeMarginalRevenue(20)).toContain('a loss of 40');
    expect(describeMarginalRevenue(20)).toContain('still raises revenue');
    expect(describeMarginalRevenue(45)).toContain('lowers revenue');
    expect(describeMarginalRevenue(0)).toContain('no earlier units');
  });
});
