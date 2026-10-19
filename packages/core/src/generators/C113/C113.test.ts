import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { accumulatedExponentialFlow } from './accumulated-exponential-flow';
import { averagePriceOverPeriod } from './average-price-over-period';
import { costIncreaseFromMarginalCost } from './cost-increase-from-marginal-cost';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** Midpoint Riemann sum with n strips: the definition of the integral, no antiderivative. */
const riemann = (f: (x: number) => number, lo: number, hi: number, n = 2000) => {
  const h = (hi - lo) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += f(lo + (i + 0.5) * h);
  return sum * h;
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode);

describe('cost-increase-from-marginal-cost', () => {
  it('equals a fine Riemann sum of marginal cost from a to b', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costIncreaseFromMarginalCost, seed);
        const mc = (q: number) => p.c + p.d * q + p.e * q * q;
        // The midpoint rule errs by e(b − a)³/(12n²) for a quadratic: far below a cent here.
        expect(Math.abs(value - riemann(mc, p.a, p.b))).toBeLessThan(0.005);
      }),
      RUNS,
    );
  });

  it('equals the sum of the exact costs of each extra unit, C(q + 1) − C(q)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costIncreaseFromMarginalCost, seed);
        // Any total cost with this MC, with an arbitrary fixed cost that must cancel.
        const C = (q: number) => 777 + p.c * q + (p.d / 2) * q ** 2 + (p.e / 3) * q ** 3;
        let sum = 0;
        for (let q = p.a; q < p.b; q++) sum += C(q + 1) - C(q);
        expect(Math.abs(value - sum)).toBeLessThan(0.005);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: rising output, positive MC, at most 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(costIncreaseFromMarginalCost, seed);
        expect(p.b).toBeGreaterThan(p.a);
        expect(p.a).toBeGreaterThanOrEqual(2);
        for (let q = p.a; q <= p.b; q++) expect(p.c + p.d * q + p.e * q * q).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(0);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        expect(codes(distractors)).toContain('ONLY_UPPER_LIMIT');
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (MC = 10 + 0.4q + 0.03q² from 10 to 20)', () => {
    const p = { c: 10, d: 0.4, e: 0.03, a: 10, b: 20 };
    expect(costIncreaseFromMarginalCost.answer(p)).toMatchObject({ kind: 'numeric', value: 230 });
    const byCode = Object.fromEntries(
      costIncreaseFromMarginalCost.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ ONLY_UPPER_LIMIT: 360, MC_DIFFERENCE: 13, NO_DIVIDE_POWER: 430 });
  });
});

describe('accumulated-exponential-flow', () => {
  it('equals a fine Riemann sum of the flow between the two dates', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(accumulatedExponentialFlow, seed);
        const flow = (t: number) => p.A * Math.exp(p.k * t);
        expect(Math.abs(value - riemann(flow, p.t1, p.t2))).toBeLessThan(0.01);
      }),
      RUNS,
    );
  });

  it('matches a year-by-year stock simulation with small time steps', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(accumulatedExponentialFlow, seed);
        // Add the flow over steps of 1/1000 year using the trapezium rule.
        const steps = (p.t2 - p.t1) * 1000;
        const dt = 1 / 1000;
        let stock = 0;
        for (let i = 0; i < steps; i++) {
          const t = p.t1 + i * dt;
          stock += ((p.A * Math.exp(p.k * t) + p.A * Math.exp(p.k * (t + dt))) / 2) * dt;
        }
        // The answer is rounded to the cent; the simulation agrees to within that and 0.001 %.
        expect(Math.abs(value - stock)).toBeLessThan(0.005 + value * 1e-5);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive total between the constant-flow bounds', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(accumulatedExponentialFlow, seed);
        const start = p.A * Math.exp(p.k * p.t1);
        const end = p.A * Math.exp(p.k * p.t2);
        const length = p.t2 - p.t1;
        expect(value).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(Math.min(start, end) * length);
        expect(value).toBeLessThan(Math.max(start, end) * length);
        expect(p.t2 - p.t1).toBeGreaterThanOrEqual(3);
        expect(twoDecimals(value)).toBe(true);
        // A/k is a short decimal, so the antiderivative step reads cleanly.
        expect(twoDecimals(p.A / p.k)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        expect(codes(distractors)).toContain('EXP_NO_DIVIDE_K');
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (I = 60e^(0.05t) over 10 years)', () => {
    const p = { setting: 'investment' as const, A: 60, k: 0.05, t1: 0, t2: 10 };
    const answer = accumulatedExponentialFlow.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBeCloseTo(778.47, 2);
    const byCode = Object.fromEntries(
      accumulatedExponentialFlow.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.CONSTANT_FLOW).toBe(600);
    expect(byCode.ONLY_UPPER_LIMIT).toBeCloseTo(1978.47, 2);
  });
});

describe('average-price-over-period', () => {
  it('times the length of the period equals a fine Riemann sum of the price', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(averagePriceOverPeriod, seed);
        const price = (t: number) => p.a + p.b * t + p.c * t * t;
        const area = riemann(price, p.t1, p.t2);
        expect(Math.abs(value - area / (p.t2 - p.t1))).toBeLessThan(0.005);
      }),
      RUNS,
    );
  });

  it('is the mean of many evenly spaced prices in the period', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(averagePriceOverPeriod, seed);
        const n = 3000;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          const t = p.t1 + ((i + 0.5) * (p.t2 - p.t1)) / n;
          sum += p.a + p.b * t + p.c * t * t;
        }
        expect(Math.abs(value - sum / n)).toBeLessThan(0.005);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive prices all year, at most 2 decimals, a later start', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(averagePriceOverPeriod, seed);
        for (let t = 0; t <= 12; t += 0.5) expect(p.a + p.b * t + p.c * t * t).toBeGreaterThan(0);
        expect(p.t1).toBeGreaterThanOrEqual(1);
        expect(p.t2).toBeLessThanOrEqual(12);
        expect(p.t2 - p.t1).toBeGreaterThanOrEqual(3);
        expect(value).toBeGreaterThan(0);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        expect(codes(distractors)).toContain('TOTAL_NOT_AVERAGE');
      }),
      RUNS,
    );
  });
});
