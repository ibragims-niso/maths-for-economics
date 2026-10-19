import { describe, expect, it } from 'vitest';
import { describeOutlier, meanOf, medianOf, sampleSd, wagesWith } from './WageOutlierDots';

describe('WageOutlierDots', () => {
  it('reproduces ST101 Example 1: manager paid 3600 gives mean 1250, median 980', () => {
    const xs = wagesWith(3600);
    expect(xs).toHaveLength(9);
    expect(meanOf(xs)).toBe(1250);
    expect(medianOf(xs)).toBe(980);
    expect(sampleSd(xs)).toBeCloseTo(885.72, 2);
  });

  it('with the manager paid 1200 the mean falls to 983.33 and the median stays 980', () => {
    const xs = wagesWith(1200);
    expect(meanOf(xs)).toBeCloseTo(983.33, 2);
    expect(medianOf(xs)).toBe(980);
    expect(sampleSd(xs)).toBeCloseTo(120.42, 2);
  });

  it('on every slider position the median is fixed while the mean and s keep rising', () => {
    let lastMean = 0;
    let lastSd = 0;
    for (let pay = 1200; pay <= 6000; pay += 100) {
      const xs = wagesWith(pay);
      expect(medianOf(xs)).toBe(980);
      // The mean moves by one ninth of every change in the manager's pay.
      expect(meanOf(xs)).toBeCloseTo((7650 + pay) / 9, 9);
      expect(meanOf(xs)).toBeGreaterThan(lastMean);
      expect(sampleSd(xs)).toBeGreaterThan(lastSd);
      lastMean = meanOf(xs);
      lastSd = sampleSd(xs);
    }
  });

  it('s matches the shortcut (Σx² − n·x̄²)/(n − 1)', () => {
    for (const pay of [1200, 3600, 6000]) {
      const xs = wagesWith(pay);
      const n = xs.length;
      const shortcut = (xs.reduce((s, x) => s + x * x, 0) - n * meanOf(xs) ** 2) / (n - 1);
      expect(sampleSd(xs) ** 2).toBeCloseTo(shortcut, 6);
    }
  });

  it('the caption counts the employees below the mean', () => {
    expect(describeOutlier(3600)).toContain('8 of the 9 employees');
    expect(describeOutlier(1200)).toMatch(/almost agree/);
  });
});
