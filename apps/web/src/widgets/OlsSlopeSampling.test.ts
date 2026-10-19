import { describe, expect, it } from 'vitest';
import { probText } from './NormalAreaExplorer';
import {
  BETA1,
  describeSampling,
  range95,
  START,
  slopeSe,
  wrongSignProbability,
} from './OlsSlopeSampling';

/** Seeded uniform numbers (mulberry32), so the simulation is the same on every run. */
function uniform(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('ols-slope-sampling', () => {
  it('reproduces worked example 1 of EM02 (σ = 6, n = 25, SD 2: SE 0.6)', () => {
    const se = slopeSe(START.sigma, START.n, START.sdX);
    expect(se).toBeCloseTo(0.6, 12);
    // σ²/Σ(x − x̄)² with Σ(x − x̄)² = 25 × 2² = 100.
    expect(se ** 2).toBeCloseTo(36 / 100, 12);
    const [lo, hi] = range95(BETA1, se);
    expect(lo).toBeCloseTo(0.324, 12);
    expect(hi).toBeCloseTo(2.676, 12);
    expect(wrongSignProbability(BETA1, se)).toBeCloseTo(0.00621, 5);
    // Four times the workers halve the SE (Example 1, last step).
    expect(slopeSe(6, 100, 2)).toBeCloseTo(0.3, 12);
  });

  it('gives the values quoted in the Try it text', () => {
    expect(range95(BETA1, slopeSe(6, 100, 2)).map((v) => Number(v.toFixed(2)))).toEqual([
      0.91, 2.09,
    ]);
    expect(probText(wrongSignProbability(BETA1, slopeSe(6, 100, 2)))).toBe('< 0.0001');
    expect(slopeSe(6, 25, 4)).toBeCloseTo(0.3, 12);
    expect(slopeSe(3, 25, 2)).toBeCloseTo(0.3, 12);
    expect(slopeSe(12, 10, 1)).toBeCloseTo(3.795, 3);
    expect(probText(wrongSignProbability(BETA1, slopeSe(12, 10, 1)))).toBe('0.3463');
  });

  it('agrees with a simulation of many samples', () => {
    // 20 workers, half with 11 and half with 15 years of education: SD exactly 2.
    const xs = Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? 11 : 15));
    const xbar = 13;
    const sxx = xs.reduce((s, x) => s + (x - xbar) ** 2, 0);
    expect(sxx).toBe(20 * 4);
    const next = uniform(2026);
    const normal = () => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
    const reps = 4000;
    const slopes: number[] = [];
    for (let r = 0; r < reps; r++) {
      const ys = xs.map((x) => 4 + BETA1 * x + 6 * normal());
      const ybar = ys.reduce((a, b) => a + b, 0) / ys.length;
      slopes.push(xs.reduce((s, x, i) => s + (x - xbar) * ((ys[i] ?? 0) - ybar), 0) / sxx);
    }
    const mean = slopes.reduce((a, b) => a + b, 0) / reps;
    const sd = Math.sqrt(slopes.reduce((s, b) => s + (b - mean) ** 2, 0) / (reps - 1));
    const se = slopeSe(6, 20, 2);
    expect(Math.abs(mean - BETA1)).toBeLessThan(0.05);
    expect(Math.abs(sd / se - 1)).toBeLessThan(0.05);
    const wrong = slopes.filter((b) => b < 0).length / reps;
    expect(Math.abs(wrong - wrongSignProbability(BETA1, se))).toBeLessThan(0.006);
  });

  it('explains the curve in the caption with the current numbers', () => {
    const start = describeSampling(6, 25, 2);
    expect(start).toContain('SE(b₁) = σ/√(n·SD²) = 6/√(25 × 2²) = 0.6');
    expect(start).toContain('between 0.32 and 2.68');
    expect(start).toContain('a share of 0.0062');
    expect(start).toContain('This is the starting case of Example 1.');
    const big = describeSampling(6, 100, 2);
    expect(big).toContain('a share < 0.0001');
    expect(big).toContain('green dashed curve is the starting case');
    expect(describeSampling(12, 10, 1)).toContain('= 3.795');
  });
});
