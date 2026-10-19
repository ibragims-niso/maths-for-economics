import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cobwebPriceAfterPeriods } from './cobweb-price-after-periods';
import { debtRatioSteadyState } from './debt-ratio-steady-state';
import { differenceEquationValueAfterT } from './difference-equation-value-after-t';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

/** True when x has at most d decimal places (up to floating-point noise). */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

// Every answer is re-derived by running the equation forward one period at a time (or by
// clearing the market numerically), not by the closed-form solutions the generators use.
describe('difference-equation-value-after-t', () => {
  it('equals the equation iterated t times from y(0), between y(0) and y*', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(differenceEquationValueAfterT, seed);
        const a = p.aPct / 100;
        const b = (p.steady * (100 - p.aPct)) / 100;
        expect(Number.isInteger(b) && b > 0).toBe(true);
        // y* really is a fixed point: a·y* + b = y*.
        expect(Math.abs(a * p.steady + b - p.steady)).toBeLessThan(1e-9);
        let y = p.start;
        let before = y;
        for (let k = 0; k < p.t; k++) {
          before = y;
          y = a * y + b;
        }
        expect(Math.abs(value - y)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        // 0 < a < 1: the path moves monotonically from y(0) towards y* without passing it.
        expect(a > 0 && a < 1).toBe(true);
        expect(value).toBeGreaterThan(Math.min(p.start, p.steady));
        expect(value).toBeLessThan(Math.max(p.start, p.steady));
        expect(p.start).toBeGreaterThan(0);
        expect(p.t >= 3 && p.t <= 8).toBe(true);
        expect(codes(distractors)).toEqual([
          'IGNORED_CONSTANT',
          'ONE_PERIOD_SHORT',
          'STEADY_STATE_ONLY',
        ]);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        expect(Math.abs((byCode.ONE_PERIOD_SHORT ?? 0) - before)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(byCode.STEADY_STATE_ONLY).toBe(p.steady);
      }),
      RUNS,
    );
  });

  it('reproduces DY01 Example 1 (Y = 0.8Y + 200 from 800: Y5 = 934.46)', () => {
    const p = { context: 'income' as const, aPct: 80, steady: 1000, start: 800, t: 5 };
    const answer = differenceEquationValueAfterT.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(934.46);
    expect(differenceEquationValueAfterT.steps(p)[0]?.result).toBe(1000);
    expect(differenceEquationValueAfterT.stem(p)).toContain('Y_{t+1} = 0.8\\,Y_t + 200');
  });
});

describe('debt-ratio-steady-state', () => {
  it('is where the debt ratio settles after running the equation for a long time', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(debtRatioSteadyState, seed);
        const a = (1 + p.r / 100) / (1 + p.g / 100);
        expect(a).toBeLessThan(1);
        let d = p.start;
        for (let year = 0; year < 20000; year++) d = a * d + p.deficit;
        expect(Math.abs(value - d)).toBeLessThanOrEqual(0.005 + 1e-6);
        // Substituting back: d* = a·d* + p.
        expect(Math.abs(a * value + p.deficit - value)).toBeLessThan(0.01);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value >= 25 && value <= 250).toBe(true);
        expect(p.r).toBeGreaterThanOrEqual(1);
        expect(p.g - p.r >= 0.5 && p.g - p.r <= 4).toBe(true);
        expect(Number.isInteger(2 * p.r) && Number.isInteger(2 * p.g)).toBe(true);
        expect(codes(distractors)).toEqual(['APPROX_FACTOR', 'DENOMINATOR_SIGN', 'REARRANGE_SIGN']);
      }),
      RUNS,
    );
  });

  it('reproduces DY01 Example 3 (r = 3 %, g = 5 %, deficit 2 %: d* = 105)', () => {
    const p = { r: 3, g: 5, deficit: 2, start: 60 };
    const answer = debtRatioSteadyState.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(105);
  });
});

describe('cobweb-price-after-periods', () => {
  /** The price that clears the market, found by bisection: demand α − βP equals the harvest. */
  function clearingPrice(alpha: number, beta: number, harvest: number): number {
    let lo = -1000;
    let hi = 1000;
    for (let k = 0; k < 80; k++) {
      const mid = (lo + hi) / 2;
      if (alpha - beta * mid > harvest) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  it('equals the market cleared year by year, with positive prices and quantities', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(cobwebPriceAfterPeriods, seed);
        let price = p.start;
        for (let t = 1; t <= p.n; t++) {
          const harvest = p.gamma + p.delta * price;
          expect(harvest).toBeGreaterThan(0);
          price = clearingPrice(p.alpha, p.beta, harvest);
          expect(price).toBeGreaterThan(0);
        }
        expect(Math.abs(value - price)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(hasDecimals(value, 2)).toBe(true);
        expect([2, 3]).toContain(p.n);
        expect(p.delta).not.toBe(p.beta);
        expect(p.delta / p.beta).toBeLessThanOrEqual(1.5);
        // The steady state is the static equilibrium: demand equals supply at one price.
        const star = clearingPrice(
          p.alpha,
          p.beta,
          p.gamma + p.delta * ((p.alpha - p.gamma) / (p.beta + p.delta)),
        );
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        expect(Math.abs((byCode.STEADY_STATE_ONLY ?? 0) - star)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(codes(distractors)).toEqual([
          'ONE_PERIOD_SHORT',
          'STEADY_STATE_ONLY',
          'SUPPLY_SIGN',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DY01 Example 2 (Q = 100 − 2P, supply 30 + 1.5P(t − 1), P0 = 28: P3 = 16.63)', () => {
    const p = { alpha: 100, beta: 2, gamma: 30, delta: 1.5, start: 28, good: 'potatoes', n: 3 };
    const answer = cobwebPriceAfterPeriods.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(16.63);
    expect(cobwebPriceAfterPeriods.steps(p)[1]?.result).toBe(20);
  });
});
