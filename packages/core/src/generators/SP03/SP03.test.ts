import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { brownianDriftLevelProbability } from './brownian-drift-level-probability';
import { randomWalkLevelProbability } from './random-walk-level-probability';
import { squareRootTimeRisk } from './square-root-time-risk';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const byCode = (ds: { value: number; mistakeCode: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** Counts the ±1 paths of length n that end at k by running through all 2ⁿ of them. */
function pathsEndingAt(n: number, k: number): number {
  let count = 0;
  for (let mask = 0; mask < 2 ** n; mask++) {
    let level = 0;
    for (let i = 0; i < n; i++) level += (mask >> i) & 1 ? 1 : -1;
    if (level === k) count++;
  }
  return count;
}

/** P(a < N(m, s²) < b) by Simpson's rule on the density, without any cdf formula. */
function normalArea(m: number, s: number, a: number, b: number): number {
  const f = (x: number) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  const steps = 4000;
  const h = (b - a) / steps;
  let sum = f(a) + f(b);
  for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return (sum * h) / 3;
}

describe('square-root-time-risk', () => {
  it('equals the square root of the summed daily variances', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(squareRootTimeRisk, seed);
        let variance = 0;
        for (let day = 0; day < p.days; day++) variance += p.daily ** 2;
        expect(Math.abs(value - Math.sqrt(variance))).toBeLessThanOrEqual(0.005 + 1e-9);
        // Spread grows more slowly than time: between the daily figure and T times it.
        expect(value).toBeGreaterThan(p.daily);
        expect(value).toBeLessThan(p.daily * p.days);
      }),
      RUNS,
    );
  });

  it('uses positive daily figures with at most 2 decimals and a 2-decimal answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(squareRootTimeRisk, seed);
        expect(p.daily).toBeGreaterThan(0);
        expect(hasAtMostDecimals(p.daily, 2)).toBe(true);
        expect(p.days).toBeGreaterThanOrEqual(5);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in SP03 (1-day VaR 4 million, 10 days)', () => {
    const p = { context: 'var', daily: 4, days: 10 } as const;
    expect(squareRootTimeRisk.answer(p)).toMatchObject({ value: 12.65 });
    expect(byCode(squareRootTimeRisk.distractors(p))).toEqual({
      LINEAR_TIME: 40,
      DIVIDED_BY_ROOT: 1.26,
      VARIANCE_NOT_SD: 160,
    });
  });
});

describe('random-walk-level-probability', () => {
  it('matches a count of all 2ⁿ paths that end at the level', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(randomWalkLevelProbability, seed);
        const exact = pathsEndingAt(p.n, p.k) / 2 ** p.n;
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.00005 + 1e-9);
        expect(value).toBeGreaterThanOrEqual(0.01);
      }),
      RUNS,
    );
  });

  it('asks only about reachable levels, with a 4-decimal answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(randomWalkLevelProbability, seed);
        expect(p.n).toBeGreaterThanOrEqual(4);
        expect(p.n).toBeLessThanOrEqual(12);
        expect(Math.abs(p.k)).toBeLessThanOrEqual(p.n);
        expect(Math.abs(p.n - p.k) % 2).toBe(0);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        // Symmetry: the level −k is exactly as likely as k.
        expect(randomWalkLevelProbability.answer({ ...p, k: -p.k })).toMatchObject({ value });
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in SP03 (8 days, 2 above the start)', () => {
    const p = { context: 'share', n: 8, k: 2 } as const;
    expect(randomWalkLevelProbability.answer(p)).toMatchObject({ value: 0.2188 });
    expect(byCode(randomWalkLevelProbability.distractors(p))).toEqual({
      LEVEL_AS_UPS: 0.1094,
      ONE_PATH: 0.0039,
      EQUAL_LEVELS: 0.1111,
    });
    expect(randomWalkLevelProbability.answer({ ...p, k: 0 })).toMatchObject({ value: 0.2734 });
  });
});

describe('brownian-drift-level-probability', () => {
  it('agrees with the area under the N(x₀ + μT, σ²T) density, found by Simpson’s rule', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(brownianDriftLevelProbability, seed);
        const m = p.start + p.drift * p.horizon;
        const s = p.vol * Math.sqrt(p.horizon);
        const exact = p.above
          ? normalArea(m, s, p.level, m + 12 * s)
          : normalArea(m, s, m - 12 * s, p.level);
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.00005 + 1e-6);
      }),
      RUNS,
    );
  });

  it('puts z on the 0.01 grid with a whole-number level and a sensible model', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(brownianDriftLevelProbability, seed);
        const s = p.vol * Math.sqrt(p.horizon);
        expect(Number.isInteger(s)).toBe(true);
        expect(Number.isInteger(p.level)).toBe(true);
        const z100 = ((p.level - p.start - p.drift * p.horizon) * 100) / s;
        expect(Math.abs(z100 - Math.round(z100))).toBeLessThan(1e-9);
        expect(Math.abs(z100)).toBeLessThanOrEqual(250);
        expect(p.drift).not.toBe(0);
        expect(p.vol).toBeGreaterThan(0);
        if (p.context === 'cash') {
          expect(p.start).toBeGreaterThan(0);
          expect(p.level).toBeGreaterThan(0);
        } else expect(p.start).toBe(0);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in SP03 (R(t) = 6t + 20W(t), above 0 after 4 years)', () => {
    const p = {
      context: 'logReturn',
      start: 0,
      drift: 6,
      vol: 20,
      horizon: 4,
      level: 0,
      above: true,
    } as const;
    expect(brownianDriftLevelProbability.answer(p)).toMatchObject({ value: 0.7257 });
    expect(byCode(brownianDriftLevelProbability.distractors(p))).toEqual({
      NO_DRIFT: 0.5,
      LINEAR_TIME: 0.6179,
      WRONG_TAIL: 0.2743,
    });
  });
});
