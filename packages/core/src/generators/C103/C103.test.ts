import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { averageCostSlopeQuotientRule } from './average-cost-slope-quotient-rule';
import { marginalCostCubic } from './marginal-cost-cubic';
import { marginalRevenueProductRule } from './marginal-revenue-product-rule';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** The slope of f at x from a symmetric difference quotient (first principles, C102). */
const numericSlope = (f: (x: number) => number, x: number, h = 1e-4) =>
  (f(x + h) - f(x - h)) / (2 * h);

describe('marginal-cost-cubic', () => {
  it('equals the slope of the cost curve found from a difference quotient', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(marginalCostCubic, seed);
        const C = (q: number) => p.fixedCost + p.a * q - p.b * q ** 2 + p.c * q ** 3;
        expect(Math.abs(value - numericSlope(C, p.q))).toBeLessThan(1e-4);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('is a sensible cost function: positive costs and marginal cost rising total cost everywhere', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(marginalCostCubic, seed);
        expect(p.fixedCost).toBeGreaterThan(0);
        expect(p.a).toBeGreaterThan(0);
        expect(p.b).toBeGreaterThan(0);
        expect(p.c).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(0);
        // Total cost rises step by step from 0 to well past the asked output.
        for (let q = 0; q < 2 * p.q; q += 0.5) {
          const C = (x: number) => p.fixedCost + p.a * x - p.b * x ** 2 + p.c * x ** 3;
          expect(C(q + 0.5)).toBeGreaterThan(C(q));
        }
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['AVERAGE_NOT_MARGINAL', 'FORGOT_POWER', 'KEPT_CONSTANT'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C103 (C = 400 + 90q − 3q² + 0.1q³ at q = 10)', () => {
    const p = { fixedCost: 400, a: 90, b: 3, c: 0.1, q: 10 };
    expect(marginalCostCubic.answer(p)).toMatchObject({ kind: 'numeric', value: 60 });
    expect(marginalCostCubic.distractors(p).map((d) => d.value)).toEqual([70, 460, 110]);
  });
});

describe('marginal-revenue-product-rule', () => {
  it('equals the slope of revenue Q · P(Q) found from a difference quotient', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(marginalRevenueProductRule, seed);
        const R = (q: number) => q * (p.alpha - p.beta * q ** p.k);
        expect(Math.abs(value - numericSlope(R, p.q))).toBeLessThan(1e-4);
        expect(Number.isInteger(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive price, marginal revenue below the price', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(marginalRevenueProductRule, seed);
        const price = p.alpha - p.beta * p.q ** p.k;
        expect(price).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(price);
        // Selling one more unit raises revenue by about the marginal revenue.
        const R = (q: number) => q * (p.alpha - p.beta * q ** p.k);
        expect(R(p.q + 0.01) - R(p.q)).toBeCloseTo(value * 0.01, 1);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['FORGOT_POWER', 'PRICE_AS_MR', 'PRODUCT_OF_DERIVATIVES'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C103 (P = 50 − 2√Q at Q = 100)', () => {
    const p = { alpha: 50, beta: 2, k: 0.5, q: 100, mr: 20 } as const;
    expect(marginalRevenueProductRule.answer(p)).toMatchObject({ kind: 'numeric', value: 20 });
    expect(marginalRevenueProductRule.distractors(p).map((d) => d.value)).toEqual([30, -0.1, 10]);
  });
});

describe('average-cost-slope-quotient-rule', () => {
  it('equals the slope of C(Q)/Q found from a difference quotient', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(averageCostSlopeQuotientRule, seed);
        const AC = (q: number) => (p.fixedCost + p.c * q + p.d * q ** 2) / q;
        expect(Math.abs(value - numericSlope(AC, p.q))).toBeLessThan(1e-4);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('has the sign of MC − AC, and average cost really moves that way', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(averageCostSlopeQuotientRule, seed);
        const C = (q: number) => p.fixedCost + p.c * q + p.d * q ** 2;
        const mc = p.c + 2 * p.d * p.q;
        const ac = C(p.q) / p.q;
        expect(value).not.toBe(0);
        expect(Math.sign(value)).toBe(Math.sign(mc - ac));
        const nextAc = C(p.q + 0.01) / (p.q + 0.01);
        expect(Math.sign(nextAc - ac)).toBe(Math.sign(value));
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers and returns all four quotient-rule mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(averageCostSlopeQuotientRule, seed);
        expect(p.fixedCost).toBeGreaterThanOrEqual(100);
        expect(p.fixedCost).toBeLessThanOrEqual(20000);
        expect(Number.isInteger(p.fixedCost)).toBe(true);
        expect(p.q).toBeGreaterThanOrEqual(4);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.1);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['NUMERATOR_ONLY', 'QUOTIENT_OF_DERIVATIVES', 'QUOTIENT_ORDER', 'QUOTIENT_SIGN'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C103 (C = 800 + 20Q + 2Q² at Q = 10)', () => {
    const p = { fixedCost: 800, c: 20, d: 2, q: 10 };
    expect(averageCostSlopeQuotientRule.answer(p)).toMatchObject({ kind: 'numeric', value: -6 });
    expect(averageCostSlopeQuotientRule.answer({ ...p, q: 40 })).toMatchObject({ value: 1.5 });
  });
});
