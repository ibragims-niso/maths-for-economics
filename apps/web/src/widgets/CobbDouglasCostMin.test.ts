import { describe, expect, it } from 'vitest';
import {
  BETA,
  capitalPerWorker,
  curveEnd,
  isocostK,
  isoquantK,
  isoquantL,
  minCost,
  optimum,
  output,
  RENT,
} from './CobbDouglasCostMin';

describe('CobbDouglasCostMin maths', () => {
  it('matches worked example 1 in MV11 (w = 16, Q̄ = 1000: L* = 100, K* = 800, C = 2400)', () => {
    const best = optimum(16, 1000);
    expect(best.L).toBeCloseTo(100, 9);
    expect(best.K).toBeCloseTo(800, 9);
    expect(minCost(16, 1000)).toBeCloseTo(2400, 9);
    expect(capitalPerWorker(16)).toBeCloseTo(8, 12);
  });

  it('matches worked example 3 in MV11 (w = 20: L* = 92.83, K* = 928.32, C = 2784.95)', () => {
    const best = optimum(20, 1000);
    expect(best.L).toBeCloseTo(92.832, 3);
    expect(best.K).toBeCloseTo(928.318, 3);
    expect(minCost(20, 1000)).toBeCloseTo(2784.95, 2);
    // Short run with K fixed at 800: L stays 100 and the bill is 2800, more than the long run.
    expect(20 * 100 + RENT * 800).toBeGreaterThan(minCost(20, 1000));
  });

  it('meets the target, beats nearby points on the isoquant, and keeps labour at 2/3 of cost', () => {
    for (let w = 6; w <= 32; w++) {
      for (let Q = 500; Q <= 1500; Q += 100) {
        const best = optimum(w, Q);
        const C = minCost(w, Q);
        expect(output(best.K, best.L)).toBeCloseTo(Q, 6);
        expect((w * best.L) / C).toBeCloseTo(BETA, 9);
        for (const f of [0.9, 0.99, 1.01, 1.1]) {
          const L = best.L * f;
          expect(w * L + RENT * isoquantK(Q, L)).toBeGreaterThan(C);
        }
        // The isocost line through the optimum passes through the dot.
        expect(isocostK(C, w, best.L)).toBeCloseTo(best.K, 6);
        // Constant returns: average cost does not depend on Q̄.
        expect(C / Q).toBeCloseTo(minCost(w, 1000) / 1000, 9);
        // The drawn part of the isoquant always reaches the dot.
        expect(curveEnd((K) => isoquantL(Q, K))).toBeGreaterThanOrEqual(best.L);
        expect(best.K).toBeLessThanOrEqual(2200);
      }
    }
  });

  it('inverts the isoquant correctly', () => {
    expect(isoquantL(1000, isoquantK(1000, 150))).toBeCloseTo(150, 9);
  });
});
