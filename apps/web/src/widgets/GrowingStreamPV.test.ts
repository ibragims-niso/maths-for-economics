import { describe, expect, it } from 'vitest';
import {
  describeStream,
  discountedRate,
  incomeRate,
  streamPresentValue,
  undiscountedTotal,
} from './GrowingStreamPV';

/** Simpson's rule, a check on the parts formula that does not use it. */
const integrate = (f: (t: number) => number, a: number, b: number, n = 2000) => {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
};

describe('growing-stream-present-value', () => {
  it('matches worked example 2 in C115: 100 + 20t at 5 % for 10 years', () => {
    expect(undiscountedTotal(10)).toBe(2000);
    expect(streamPresentValue(5, 10)).toBeCloseTo(1508.57, 2);
    expect(undiscountedTotal(10) - streamPresentValue(5, 10)).toBeCloseTo(491.43, 2);
  });

  it('agrees with numerical integration of the discounted curve', () => {
    for (const rate of [0.5, 5, 9.5, 15]) {
      for (const years of [1, 7, 20]) {
        const numeric = integrate((t) => discountedRate(t, rate), 0, years);
        expect(streamPresentValue(rate, years)).toBeCloseTo(numeric, 6);
        expect(undiscountedTotal(years)).toBeCloseTo(integrate(incomeRate, 0, years), 6);
      }
    }
  });

  it('is not discounted at 0 % and falls as the rate rises', () => {
    expect(streamPresentValue(0, 12)).toBe(undiscountedTotal(12));
    expect(streamPresentValue(6, 12)).toBeLessThan(streamPresentValue(5, 12));
    expect(streamPresentValue(15, 20)).toBeGreaterThan(0);
  });

  it('describes the chosen rate and horizon in words', () => {
    expect(describeStream(5, 10)).toContain('24.6 %');
    expect(describeStream(0, 10)).toContain('0 %');
  });
});
