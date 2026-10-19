import { describe, expect, it } from 'vitest';
import {
  estimateChange,
  exactChange,
  multiplier,
  PRICE_Y,
  valueFunction,
} from './ShadowPriceValueFunction';

/** The best x·y on the budget line, by brute force over x. */
function bestUtility(px: number, M: number) {
  let top = 0;
  for (let i = 1; i < 4000; i++) {
    const x = (M / px) * (i / 4000);
    top = Math.max(top, (x * (M - px * x)) / PRICE_Y);
  }
  return top;
}

describe('ShadowPriceValueFunction maths', () => {
  it('matches worked example 1 in MV09 (5x + 10y = 600: V = 1,800, λ = 6, 60 vs 60.5)', () => {
    expect(valueFunction(5, 600)).toBeCloseTo(1800, 12);
    expect(multiplier(5, 600)).toBeCloseTo(6, 12);
    expect(estimateChange(5, 600, 10)).toBeCloseTo(60, 12);
    expect(exactChange(5, 600, 10)).toBeCloseTo(60.5, 12);
    // The default view: ΔM = 100 gives 600 against 650.
    expect(estimateChange(5, 600, 100)).toBeCloseTo(600, 12);
    expect(exactChange(5, 600, 100)).toBeCloseTo(650, 12);
  });

  it('V(M) is the maximum utility and λ is its slope, for every slider setting', () => {
    for (let px = 5; px <= 12; px++) {
      for (let M = 200; M <= 700; M += 50) {
        expect(Math.abs(bestUtility(px, M) - valueFunction(px, M))).toBeLessThan(1e-3);
        const h = 0.001;
        const slope = (valueFunction(px, M + h) - valueFunction(px, M - h)) / (2 * h);
        expect(slope).toBeCloseTo(multiplier(px, M), 6);
        // λ = U_x/p_x at the best bundle y* = M/(2·p_y).
        expect(multiplier(px, M)).toBeCloseTo(M / (2 * PRICE_Y) / px, 12);
      }
    }
  });

  it('the exact rise exceeds the estimate by ΔM²/(4·p_x·p_y), and the curve stays in the frame', () => {
    for (let px = 5; px <= 12; px++) {
      for (let M = 200; M <= 700; M += 50) {
        for (let dM = 0; dM <= 300; dM += 10) {
          const gap = exactChange(px, M, dM) - estimateChange(px, M, dM);
          expect(gap).toBeCloseTo((dM * dM) / (4 * px * PRICE_Y), 9);
          expect(valueFunction(px, M + dM)).toBeLessThanOrEqual(5300);
          expect(M + dM).toBeLessThanOrEqual(1050);
        }
      }
    }
  });
});
