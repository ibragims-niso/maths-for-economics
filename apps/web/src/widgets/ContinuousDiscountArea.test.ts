import { describe, expect, it } from 'vitest';
import { perpetualValue, shareCaptured, streamValue } from './ContinuousDiscountArea';

describe('ContinuousDiscountArea maths', () => {
  it('matches worked examples 1 and 2 in C116 (rent of 12000 a year at 6 %)', () => {
    expect(streamValue(12000, 0.06, 15)).toBeCloseTo(118686.07, 2);
    expect(perpetualValue(12000, 0.06)).toBeCloseTo(200000, 9);
    expect(shareCaptured(0.06, 15)).toBeCloseTo(0.5934, 4);
    expect(streamValue(12000, 0.06, 50)).toBeCloseTo(190042.59, 2);
    // 90 % of the perpetual value comes from the first ln(10)/r = 38.38 years.
    expect(shareCaptured(0.06, Math.log(10) / 0.06)).toBeCloseTo(0.9, 12);
  });

  it('equals the discounted income added up in small slices', () => {
    for (const [r, T] of [
      [0.01, 1],
      [0.065, 17],
      [0.15, 80],
    ] as const) {
      const n = 20000;
      const h = T / n;
      let sum = 0;
      for (let i = 0; i < n; i++) sum += 12000 * Math.exp(-r * (i + 0.5) * h) * h;
      expect(streamValue(12000, r, T)).toBeCloseTo(sum, 2);
    }
  });

  it('is the perpetual value times the share captured, and approaches A/r from below', () => {
    expect(streamValue(12000, 0.04, 20)).toBeCloseTo(
      perpetualValue(12000, 0.04) * shareCaptured(0.04, 20),
      9,
    );
    expect(streamValue(12000, 0.15, 80)).toBeLessThan(perpetualValue(12000, 0.15));
    expect(streamValue(12000, 0.15, 80) / perpetualValue(12000, 0.15)).toBeGreaterThan(0.999);
  });
});
