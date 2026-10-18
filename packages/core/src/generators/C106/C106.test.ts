import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { costOfOneMoreUnit } from './cost-of-one-more-unit';
import { marginalProfitAtOutput } from './marginal-profit-at-output';
import { marginalRevenueLinearDemand } from './marginal-revenue-linear-demand';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** Central-difference estimate of f′(x): a numerical route, independent of any formula. */
const numericSlope = (f: (x: number) => number, x: number, h = 1e-4) =>
  (f(x + h) - f(x - h)) / (2 * h);

/** Simpson's rule for the integral of f from lo to hi. */
const integrate = (f: (x: number) => number, lo: number, hi: number, n = 100) => {
  const h = (hi - lo) / n;
  let sum = f(lo) + f(hi);
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(lo + i * h);
  return (sum * h) / 3;
};

describe('marginal-revenue-linear-demand', () => {
  it('equals the numerical slope of revenue P(Q)·Q at Q₀', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(marginalRevenueLinearDemand, seed);
        const R = (q: number) => (p.a - p.b * q) * q;
        expect(Math.abs(value - numericSlope(R, p.q0))).toBeLessThan(1e-4);
      }),
      RUNS,
    );
  });

  it('is the new unit’s price minus the price cut on the earlier units, on average over ±1 unit', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(marginalRevenueLinearDemand, seed);
        const R = (q: number) => (p.a - p.b * q) * q;
        // Revenue is quadratic, so the centred one-unit change equals the derivative exactly.
        expect(Math.abs((R(p.q0 + 1) - R(p.q0 - 1)) / 2 - value)).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive price above a positive MR, at most 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(marginalRevenueLinearDemand, seed);
        const price = p.a - p.b * p.q0;
        expect(value).toBeGreaterThan(0);
        expect(price).toBeGreaterThan(value);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C106 (P = 120 − 2Q at Q = 20)', () => {
    const p = { good: 'phone cases a week', a: 120, b: 2, q0: 20 };
    expect(marginalRevenueLinearDemand.answer(p)).toMatchObject({ kind: 'numeric', value: 40 });
  });
});

describe('cost-of-one-more-unit', () => {
  const costFn = (p: { fixedCost: number; c: number; s: number; d: number }) => (q: number) =>
    p.fixedCost + p.c * q + p.s * q * q + p.d * q * q * q;

  it('equals the area under the marginal-cost curve from Q₀ to Q₀ + 1', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costOfOneMoreUnit, seed);
        const C = costFn(p);
        const area = integrate((q) => numericSlope(C, q), p.q0, p.q0 + 1);
        expect(Math.abs(value - area)).toBeLessThan(0.005);
      }),
      RUNS,
    );
  });

  it('differs from the marginal-cost estimate C′(Q₀) by about C″/2 + C‴/6', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costOfOneMoreUnit, seed);
        const C = costFn(p);
        const h = 0.01;
        const second = (C(p.q0 + h) - 2 * C(p.q0) + C(p.q0 - h)) / (h * h);
        const third = 6 * p.d;
        const estimate = numericSlope(C, p.q0);
        expect(Math.abs(value - estimate - (second / 2 + third / 6))).toBeLessThan(0.01);
        // The gap is visible, so the estimate is a real distractor.
        expect(Math.abs(value - estimate)).toBeGreaterThan(0.25);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: marginal cost positive at every output, at most 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(costOfOneMoreUnit, seed);
        const C = costFn(p);
        for (let q = 0; q <= 2 * p.q0; q += 0.5) expect(numericSlope(C, q)).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(0);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C106 (C = 60 + 8Q + 0.5Q², from 10 to 11 batches)', () => {
    const p = { fixedCost: 60, c: 8, s: 0.5, d: 0, q0: 10 };
    expect(costOfOneMoreUnit.answer(p)).toMatchObject({ kind: 'numeric', value: 18.5 });
    const marginal = costOfOneMoreUnit
      .distractors(p)
      .find((d) => d.mistakeCode === 'MARGINAL_FOR_EXACT');
    expect(marginal?.value).toBe(18);
  });
});

describe('marginal-profit-at-output', () => {
  const profitFn =
    (p: { a: number; b: number; fixedCost: number; c: number; d: number }) => (q: number) =>
      (p.a - p.b * q) * q - p.fixedCost - p.c * q - p.d * q * q;

  it('equals the numerical slope of profit at Q₀, and its sign says which way profit moves', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(marginalProfitAtOutput, seed);
        const profit = profitFn(p);
        expect(Math.abs(value - numericSlope(profit, p.q0))).toBeLessThan(1e-4);
        // Profit is quadratic, so the centred one-unit change equals the derivative exactly.
        expect(Math.abs((profit(p.q0 + 1) - profit(p.q0 - 1)) / 2 - value)).toBeLessThan(1e-9);
        const nudge = profit(p.q0 + 0.01) - profit(p.q0);
        expect(Math.sign(nudge)).toBe(Math.sign(value));
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive price, a whole non-zero answer, several distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(marginalProfitAtOutput, seed);
        expect(p.a - p.b * p.q0).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(2);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C106 (P = 120 − 2Q, MC = 30, at Q = 20)', () => {
    const p = { a: 120, b: 2, fixedCost: 500, c: 30, d: 0, q0: 20 };
    expect(marginalProfitAtOutput.answer(p)).toMatchObject({ kind: 'numeric', value: 10 });
  });
});
