import { describe, expect, it } from 'vitest';
import { frameFor, partialSum, seriesLimit } from './GeometricPartialSums';

describe('GeometricPartialSums maths', () => {
  it('matches the default view and the Try it check in C117 (x = 0.8, n = 10)', () => {
    expect(partialSum(0.8, 10)).toBeCloseTo(4.463129, 6);
    expect(seriesLimit(0.8)).toBeCloseTo(5, 12);
    expect(5 - partialSum(0.8, 10)).toBeCloseTo(0.536871, 6);
  });

  it('agrees with the closed form Sₙ = (1 − xⁿ)/(1 − x) and the gap xⁿ/(1 − x)', () => {
    for (const x of [-0.95, -0.5, 0.25, 0.6, 0.9]) {
      for (const n of [1, 5, 17, 30]) {
        expect(partialSum(x, n)).toBeCloseTo((1 - x ** n) / (1 - x), 10);
        expect((seriesLimit(x) ?? 0) - partialSum(x, n)).toBeCloseTo(x ** n / (1 - x), 10);
      }
    }
  });

  it('has a limit only for |x| < 1, and diverging partial sums otherwise', () => {
    expect(seriesLimit(1)).toBeNull();
    expect(seriesLimit(-1)).toBeNull();
    expect(seriesLimit(1.2)).toBeNull();
    expect(partialSum(1, 30)).toBe(30);
    expect([1, 2, 3, 4].map((n) => partialSum(-1, n))).toEqual([1, 0, 1, 0]);
    expect(partialSum(1.2, 30)).toBeCloseTo((1.2 ** 30 - 1) / 0.2, 6);
  });

  it('gives the 1/(1 − x) = Σ xⁿ link used for present values: x = 1/1.04 sums to 26', () => {
    // 1 + 1/1.04 + 1/1.04² + … = 1.04/0.04, the value of 1 a year for ever with the first today.
    expect(seriesLimit(1 / 1.04)).toBeCloseTo(26, 10);
  });

  it('keeps every partial sum and the limit inside the frame over the slider range', () => {
    for (let i = 0; i <= 48; i++) {
      const x = Math.round((-1.2 + i * 0.05) * 100) / 100;
      const f = frameFor(x);
      for (let n = 1; n <= 30; n++) {
        const s = partialSum(x, n);
        expect(Number.isFinite(s)).toBe(true);
        expect(s).toBeLessThanOrEqual(f.yMax);
        expect(s).toBeGreaterThanOrEqual(f.yMin);
      }
      const limit = seriesLimit(x);
      if (limit !== null) expect(limit).toBeLessThan(f.yMax);
    }
  });
});
