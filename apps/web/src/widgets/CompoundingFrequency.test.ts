import { describe, expect, it } from 'vitest';
import { compoundingFrame, continuousEarPercent, earPercent } from './CompoundingFrequency';

describe('compounding-frequency', () => {
  it('matches the worked examples and the intuition list in FM02', () => {
    expect(earPercent(18, 12)).toBeCloseTo(19.56, 2); // Example 1: 1.5 % a month
    expect(earPercent(12, 12)).toBeCloseTo(12.68, 2); // Example 3: lender X
    expect(earPercent(10, 1)).toBeCloseTo(10, 10);
    expect(earPercent(10, 2)).toBeCloseTo(10.25, 10);
    expect(earPercent(10, 4)).toBeCloseTo(10.38, 2);
    expect(continuousEarPercent(10)).toBeCloseTo(10.517, 3);
    expect(continuousEarPercent(5)).toBeCloseTo(5.13, 2); // Example 2
  });

  it('rises with m, by less each time, and stays under the continuous ceiling', () => {
    for (const r of [1, 5, 18, 30]) {
      let prevGain = Number.POSITIVE_INFINITY;
      for (let m = 1; m < 400; m++) {
        const gain = earPercent(r, m + 1) - earPercent(r, m);
        expect(gain).toBeGreaterThan(0);
        expect(gain).toBeLessThan(prevGain);
        expect(earPercent(r, m + 1)).toBeLessThan(continuousEarPercent(r));
        prevGain = gain;
      }
    }
  });

  it('keeps the curve inside the graph window for every slider value', () => {
    for (let r = 1; r <= 30; r += 0.5) {
      const f = compoundingFrame(r);
      for (let m = 1; m <= 24; m++) {
        expect(earPercent(r, m)).toBeGreaterThanOrEqual(f.yMin);
        expect(earPercent(r, m)).toBeLessThanOrEqual(f.yMax);
      }
      expect(continuousEarPercent(r)).toBeLessThan(f.yMax);
    }
  });
});
