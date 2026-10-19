import { describe, expect, it } from 'vitest';
import {
  between,
  endpoints,
  insideCount,
  PATHS,
  STEPS,
  TOSSES,
  verticalFrame,
  walkMean,
  walkPath,
  walkSd,
  walkVariance,
} from './RandomWalkFan';

const C = (n: number, r: number) => {
  let c = 1;
  for (let i = 1; i <= r; i++) c = (c * (n - r + i)) / i;
  return c;
};

describe('RandomWalkFan', () => {
  it('reproduces SP03 Examples 1 and 2 (p = ½: SD 10 after 100 steps; p = 0.6: mean 20, SD 9.80)', () => {
    expect(walkMean(100, 0.5)).toBe(0);
    expect(walkVariance(8, 0.5)).toBeCloseTo(8, 12);
    expect(walkSd(100, 0.5)).toBeCloseTo(10, 12);
    expect(walkSd(25, 0.5)).toBeCloseTo(5, 12);
    expect(walkMean(100, 0.6)).toBeCloseTo(20, 9);
    expect(walkVariance(100, 0.6)).toBeCloseTo(96, 9);
    expect(walkSd(100, 0.6)).toBeCloseTo(9.8, 2);
    expect(walkMean(400, 0.6)).toBeCloseTo(80, 9);
    expect(walkSd(400, 0.6)).toBeCloseTo(19.6, 2);
  });

  it('shows the counts the Try it text quotes', () => {
    expect(insideCount(100, 0.5)).toBe(10);
    expect(insideCount(25, 0.5)).toBe(9);
    expect(insideCount(100, 0.6)).toBe(10);
  });

  it('agrees with the binomial: mean and variance of n(2p − 1) and 4np(1 − p) from the distribution', () => {
    for (const n of [1, 4, 25, 100]) {
      for (const p of [0.3, 0.45, 0.5, 0.6, 0.7]) {
        let m = 0;
        let m2 = 0;
        for (let u = 0; u <= n; u++) {
          const prob = C(n, u) * p ** u * (1 - p) ** (n - u);
          const level = 2 * u - n;
          m += prob * level;
          m2 += prob * level * level;
        }
        expect(walkMean(n, p)).toBeCloseTo(m, 8);
        expect(walkVariance(n, p)).toBeCloseTo(m2 - m * m, 8);
      }
    }
  });

  it('builds each path from the fixed tosses, one step of ±1 at a time', () => {
    expect(TOSSES.length).toBe(PATHS);
    for (let i = 0; i < PATHS; i++) {
      for (const p of [0.3, 0.5, 0.7]) {
        const path = walkPath(i, p);
        expect(path.length).toBe(STEPS + 1);
        expect(path[0]).toBe(0);
        path.slice(1).forEach((s, t) => {
          const up = (TOSSES[i]?.[t] ?? 1) < p;
          expect(s - (path[t] ?? 0)).toBe(up ? 1 : -1);
        });
        // A higher p never lowers a path: the same tosses, more of them count as ups.
        const higher = walkPath(i, p + 0.05);
        path.forEach((s, t) => {
          expect(higher[t] ?? 0).toBeGreaterThanOrEqual(s);
        });
      }
    }
    // The tosses look like uniform numbers: mean near ½.
    const all = TOSSES.flat();
    expect(Math.abs(all.reduce((a, b) => a + b, 0) / all.length - 0.5)).toBeLessThan(0.03);
  });

  it('only ends on levels with the parity of n', () => {
    for (const n of [1, 7, 50, 100]) {
      for (const s of endpoints(n, 0.5)) expect(Math.abs(s - n) % 2).toBe(0);
    }
  });

  it('joins steps with straight lines and frames every path and the band', () => {
    const path = walkPath(0, 0.5);
    expect(between(path, 7)).toBe(path[7]);
    expect(between(path, 7.5)).toBeCloseTo(((path[7] ?? 0) + (path[8] ?? 0)) / 2, 12);
    for (let k = 0; k <= 8; k++) {
      const p = 0.3 + 0.05 * k;
      const { yMin, yMax, ticks } = verticalFrame(p);
      for (let i = 0; i < PATHS; i++) {
        const w = walkPath(i, p);
        expect(Math.min(...w)).toBeGreaterThanOrEqual(yMin);
        expect(Math.max(...w)).toBeLessThanOrEqual(yMax);
      }
      expect(walkMean(STEPS, p) + 2 * walkSd(STEPS, p)).toBeLessThanOrEqual(yMax);
      expect(walkMean(STEPS, p) - 2 * walkSd(STEPS, p)).toBeGreaterThanOrEqual(yMin);
      expect(ticks.length).toBeLessThanOrEqual(7);
    }
  });
});
