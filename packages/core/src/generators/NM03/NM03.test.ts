import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { inverseTransformExponentialDraw } from './inverse-transform-exponential-draw';
import { monteCarloDrawsForTargetSe } from './monte-carlo-draws-for-target-se';
import { monteCarloProbabilityLimit } from './monte-carlo-probability-limit';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** At most `d` decimals, allowing for floating-point noise. */
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

describe('monte-carlo-draws-for-target-se', () => {
  it('is the smallest whole N with SE₀²·N₀/N ≤ d², found in whole numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(monteCarloDrawsForTargetSe, seed);
        // Work in thousandths so every quantity is a whole number and comparisons are exact.
        const se = Math.round(p.pilotSe * 1000);
        const d = Math.round(p.target * 1000);
        expect(Math.abs(se - p.pilotSe * 1000)).toBeLessThan(1e-6);
        const variance = se * se * p.pilot; // s² in millionths, from s = SE₀·√N₀
        const smallest = Math.ceil(variance / (d * d));
        expect(value).toBe(smallest);
        expect(variance).toBeLessThanOrEqual(d * d * value);
        expect(variance).toBeGreaterThan(d * d * (value - 1));
      }),
      RUNS,
    );
  });

  it('uses a square pilot size, a readable ratio and a small standard error', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(monteCarloDrawsForTargetSe, seed);
        expect(Number.isInteger(Math.sqrt(p.pilot))).toBe(true);
        expect(p.pilot).toBeGreaterThanOrEqual(400);
        expect(Math.abs(p.pilotSe - p.ratio * p.target)).toBeLessThan(1e-9);
        expect(p.target).toBeGreaterThan(0);
        expect(p.pilotSe).toBeLessThanOrEqual(p.estimate / 4);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(p.pilot);
        expect(value).toBeLessThanOrEqual(1_000_000);
        // A linear rule (SE ∝ 1/N) always asks for fewer draws than the true 1/√N rule.
        expect(byCode(distractors).SE_LINEAR_IN_N).toBeLessThan(value);
      }),
      RUNS,
    );
  });

  it('quadruples the draws to halve the standard error', () => {
    const p = {
      context: 'npv',
      pilot: 400,
      estimate: 88,
      pilotSe: 8.8,
      target: 4.4,
      ratio: 2,
    } as const;
    expect(monteCarloDrawsForTargetSe.answer(p)).toMatchObject({ value: 1600 });
    expect(byCode(monteCarloDrawsForTargetSe.distractors(p))).toEqual({
      SE_LINEAR_IN_N: 800,
      SE_AS_SD: 4,
    });
  });
});

describe('inverse-transform-exponential-draw', () => {
  it('gives the x with F(x) = u, found by bisection on the distribution function', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(inverseTransformExponentialDraw, seed);
        const F = (x: number) => 1 - Math.exp(-x / p.mean);
        let lo = 0;
        let hi = 100 * p.mean;
        for (let k = 0; k < 100; k++) {
          const m = (lo + hi) / 2;
          if (F(m) < p.u) lo = m;
          else hi = m;
        }
        expect(Math.abs(value - lo)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('puts draws above the median exactly when u > ½, and ln u gives the mirror value', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(inverseTransformExponentialDraw, seed);
        const median = p.mean * Math.LN2;
        expect(value > median).toBe(p.u > 0.5);
        // −m·ln u is the draw for 1 − u, the mirror image of u.
        const mirror = byCode(distractors).LN_U_NOT_ONE_MINUS_U ?? Number.NaN;
        expect(Math.abs(1 - Math.exp(-mirror / p.mean) - (1 - p.u))).toBeLessThan(0.01);
        expect(p.u).toBeGreaterThan(0);
        expect(p.u).toBeLessThan(1);
        expect(hasDecimals(p.u, 3)).toBe(true);
        expect(p.mean).toBeGreaterThan(0);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in NM03 (mean 8 years, u = 0.30)', () => {
    const p = { context: 'default', mean: 8, u: 0.3 } as const;
    expect(inverseTransformExponentialDraw.answer(p)).toMatchObject({ value: 2.85 });
    expect(byCode(inverseTransformExponentialDraw.distractors(p))).toEqual({
      LN_U_NOT_ONE_MINUS_U: 9.63,
      RATE_FOR_MEAN: 0.04,
      DROPPED_MINUS: -2.85,
    });
  });
});

describe('monte-carlo-probability-limit', () => {
  it('matches the mean and spread of the simulated 0/1 outcomes themselves', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(monteCarloProbabilityLimit, seed);
        // Rebuild the N outcomes (1 = the event happened) and average them directly.
        const outcomes = Array.from({ length: p.scenarios }, (_, i): number =>
          i < p.hits ? 1 : 0,
        );
        const mean = outcomes.reduce((a, b) => a + b, 0) / p.scenarios;
        const variance = outcomes.reduce((a, b) => a + (b - mean) ** 2, 0) / p.scenarios;
        const se = Math.sqrt(variance / p.scenarios);
        const exact = mean + (p.side === 'upper' ? 1.96 : -1.96) * se;
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.00005 + 1e-12);
        expect(hasDecimals(value, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps the estimate and the limit sensible probabilities', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(monteCarloProbabilityLimit, seed);
        const ph = p.hits / p.scenarios;
        expect(hasDecimals(ph, 4)).toBe(true);
        expect(p.hits).toBeGreaterThanOrEqual(10);
        expect(ph).toBeLessThanOrEqual(1 / 3);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        if (p.side === 'upper') expect(value).toBeGreaterThan(ph);
        else expect(value).toBeLessThan(ph);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in NM03 (74 breaches in 2000 scenarios, upper limit)', () => {
    const p = { context: 'bank', scenarios: 2000, hits: 74, side: 'upper' } as const;
    expect(monteCarloProbabilityLimit.answer(p)).toMatchObject({ value: 0.0453 });
    expect(byCode(monteCarloProbabilityLimit.distractors(p))).toEqual({
      NO_SQUARE_ROOT: 0.037,
      FORGOT_Z: 0.0412,
      SD_NOT_SE: 0.407,
    });
  });
});
