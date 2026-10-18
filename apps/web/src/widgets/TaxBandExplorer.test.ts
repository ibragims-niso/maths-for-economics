import { describe, expect, it } from 'vitest';
import { averageRate, bandRate, incomeTax } from './TaxBandExplorer';

describe('TaxBandExplorer', () => {
  it('reproduces F03 example 3: tax 10,800 and an average rate of 20.77 % on 52,000', () => {
    expect(incomeTax(52000)).toBeCloseTo(10800, 6);
    expect(averageRate(52000)).toBeCloseTo(0.2077, 4);
    expect(bandRate(52000)).toBe(0.4);
  });

  it('taxes nothing up to the allowance and has no jumps at the band edges', () => {
    expect(incomeTax(0)).toBe(0);
    expect(incomeTax(10000)).toBe(0);
    expect(averageRate(0)).toBe(0);
    for (const edge of [10000, 40000]) {
      expect(Math.abs(incomeTax(edge + 0.01) - incomeTax(edge))).toBeLessThan(0.01);
    }
    expect(incomeTax(40000)).toBeCloseTo(6000, 6);
  });

  it('matches the tax worked out band by band, and the average stays below the band rate', () => {
    for (let y = 1000; y <= 80000; y += 1000) {
      const basic = Math.max(0, Math.min(y, 40000) - 10000) * 0.2;
      const top = Math.max(0, y - 40000) * 0.4;
      expect(incomeTax(y)).toBeCloseTo(basic + top, 6);
      expect(averageRate(y)).toBeLessThanOrEqual(bandRate(y) + 1e-12);
    }
  });
});
