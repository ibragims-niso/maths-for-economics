import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { capitalStockFromInvestment } from './capital-stock-from-investment';
import { priceFromMarginalRevenue } from './price-from-marginal-revenue';
import { totalCostFromMarginalCost } from './total-cost-from-marginal-cost';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, steps: pr.steps };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** Simpson's rule for the integral of f from lo to hi: a numerical route, independent of any antiderivative. */
const integrate = (f: (x: number) => number, lo: number, hi: number, n = 200) => {
  const h = (hi - lo) / n;
  let sum = f(lo) + f(hi);
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(lo + i * h);
  return (sum * h) / 3;
};

/** Central-difference estimate of f′(x). */
const numericSlope = (f: (x: number) => number, x: number, h = 1e-4) =>
  (f(x + h) - f(x - h)) / (2 * h);

describe('total-cost-from-marginal-cost', () => {
  it('equals the fixed cost plus the marginal cost accumulated from 0 to q₀', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(totalCostFromMarginalCost, seed);
        const mc = (q: number) => p.a + p.b * q + p.c * q * q;
        expect(Math.abs(value - (p.fixedCost + integrate(mc, 0, p.q0)))).toBeLessThan(0.006);
      }),
      RUNS,
    );
  });

  it('adding unit costs one at a time (MC at each unit midpoint) lands close to the answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(totalCostFromMarginalCost, seed);
        const mc = (q: number) => p.a + p.b * q + p.c * q * q;
        let total = p.fixedCost;
        for (let u = 0; u < p.q0; u++) total += mc(u + 0.5);
        // The midpoint sum misses only the curvature of MC: c/12 per unit.
        expect(Math.abs(value - total - (p.c / 12) * p.q0)).toBeLessThan(0.006);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive costs, at most 2 decimals, the fixed-cost slip offered', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(totalCostFromMarginalCost, seed);
        expect(value).toBeGreaterThan(p.fixedCost);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        const noFixed = distractors.find((d) => d.mistakeCode === 'FORGOT_CONSTANT');
        expect(Math.abs((noFixed?.value ?? 0) + p.fixedCost - value)).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C112 (MC = 20 + 4q + 0.3q², F = 500, q = 10)', () => {
    const p = { a: 20, b: 4, c: 0.3, fixedCost: 500, q0: 10 };
    expect(totalCostFromMarginalCost.answer(p)).toMatchObject({ kind: 'numeric', value: 1000 });
    const codes = Object.fromEntries(
      totalCostFromMarginalCost.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({ FORGOT_CONSTANT: 500, NO_DIVIDE_POWER: 1400, DIFFERENTIATED: 10 });
  });
});

describe('price-from-marginal-revenue', () => {
  it('times Q₀ equals the area under MR from 0 to Q₀', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(priceFromMarginalRevenue, seed);
        const mr = (q: number) => p.alpha - p.beta * q;
        expect(Math.abs(value * p.q0 - integrate(mr, 0, p.q0))).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('lies on a demand line whose revenue has slope MR at Q₀', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(priceFromMarginalRevenue, seed);
        // Demand through (Q₀, P) with intercept alpha: P(Q) = alpha − sQ.
        const s = (p.alpha - value) / p.q0;
        const revenue = (q: number) => (p.alpha - s * q) * q;
        expect(Math.abs(numericSlope(revenue, p.q0) - (p.alpha - p.beta * p.q0))).toBeLessThan(
          1e-5,
        );
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: price above a positive MR, at most 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(priceFromMarginalRevenue, seed);
        const mr = p.alpha - p.beta * p.q0;
        expect(mr).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(mr);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBe(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C112 (MR = 120 − 4Q at Q = 20)', () => {
    const p = { good: 'phone cases a week', alpha: 120, beta: 4, q0: 20 };
    expect(priceFromMarginalRevenue.answer(p)).toMatchObject({ kind: 'numeric', value: 80 });
    const values = priceFromMarginalRevenue.distractors(p).map((d) => d.value);
    expect(values).toEqual([40, 1600]);
  });
});

describe('capital-stock-from-investment', () => {
  it('equals K(0) plus net investment accumulated over the years', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(capitalStockFromInvestment, seed);
        const inv = (t: number) => p.A * Math.exp(p.k * t);
        expect(Math.abs(value - (p.k0 + integrate(inv, 0, p.years, 1000)))).toBeLessThan(0.006);
      }),
      RUNS,
    );
  });

  it('matches a month-by-month simulation of the capital stock to within 0.1 %', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(capitalStockFromInvestment, seed);
        let capital = p.k0;
        const dt = 1 / 12;
        for (let m = 0; m < p.years * 12; m++) capital += p.A * Math.exp(p.k * (m + 0.5) * dt) * dt;
        expect(Math.abs(value - capital) / value).toBeLessThan(0.001);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: capital grows, at most 2 decimals, several distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(capitalStockFromInvestment, seed);
        expect(value).toBeGreaterThan(p.k0 + p.A * p.years);
        expect(p.k * p.years).toBeLessThanOrEqual(1.5);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C112 (I = 200e^(0.05t), K(0) = 5000, 10 years)', () => {
    const p = { A: 200, k: 0.05, k0: 5000, years: 10 };
    expect(capitalStockFromInvestment.answer(p)).toMatchObject({
      kind: 'numeric',
      value: 7594.89,
    });
    const wrong = capitalStockFromInvestment
      .distractors(p)
      .find((d) => d.mistakeCode === 'WRONG_CONSTANT');
    expect(wrong?.value).toBe(11594.89);
  });
});
