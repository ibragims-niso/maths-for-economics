import { describe, expect, it } from 'vitest';
import { bondPrice, currentYield, priceStatus } from './BondPriceYield';

describe('BondPriceYield maths', () => {
  it('matches worked example 2 in FM07 (5 % coupon, 10 years, yield 6 %)', () => {
    expect(bondPrice(0.05, 0.06, 10, 1000)).toBeCloseTo(926.4, 2);
    expect(bondPrice(0.05, 0.06)).toBeCloseTo(92.64, 2);
    expect(currentYield(0.05, 92.64) * 100).toBeCloseTo(5.4, 2);
    expect(priceStatus(0.05, 0.06)).toBe('discount');
  });

  it('matches worked example 3 in FM07 (yield 7 % and 5 %)', () => {
    expect(bondPrice(0.05, 0.07, 10, 1000)).toBeCloseTo(859.53, 2);
    expect(bondPrice(0.05, 0.05, 10, 1000)).toBeCloseTo(1000, 9);
    expect(bondPrice(0.05, 0.06, 2, 1000)).toBeCloseTo(981.67, 2);
  });

  it('equals the sum of the cash flows discounted one by one', () => {
    for (const [c, y] of [
      [0, 0.01],
      [0.035, 0.0825],
      [0.12, 0.15],
    ] as const) {
      let sum = 0;
      for (let k = 1; k <= 10; k++) sum += (c * 100 + (k === 10 ? 100 : 0)) / (1 + y) ** k;
      expect(bondPrice(c, y)).toBeCloseTo(sum, 9);
    }
    expect(bondPrice(0.05, 0)).toBe(150);
  });

  it('falls as the yield rises, is at par when they are equal, and is convex', () => {
    expect(bondPrice(0.08, 0.08)).toBeCloseTo(100, 9);
    expect(priceStatus(0.08, 0.08)).toBe('par');
    expect(priceStatus(0.08, 0.05)).toBe('premium');
    for (let y = 0.02; y < 0.15; y += 0.01) {
      expect(bondPrice(0.05, y)).toBeLessThan(bondPrice(0.05, y - 0.01));
      const gain = bondPrice(0.05, y - 0.01) - bondPrice(0.05, y);
      const loss = bondPrice(0.05, y) - bondPrice(0.05, y + 0.01);
      expect(gain).toBeGreaterThan(loss);
    }
  });
});
