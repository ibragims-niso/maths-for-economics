import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { shadowPriceIncomeEstimate } from './shadow-price-income-estimate';
import { shadowPriceMarginalCost } from './shadow-price-marginal-cost';
import { shadowPriceWater } from './shadow-price-water';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** The largest value of a single-peaked function on [lo, hi], by ternary search. */
function peak(fn: (x: number) => number, lo: number, hi: number) {
  let a = lo;
  let b = hi;
  for (let k = 0; k < 100; k++) {
    const m1 = a + (b - a) / 3;
    const m2 = b - (b - a) / 3;
    if (fn(m1) < fn(m2)) a = m1;
    else b = m2;
  }
  return fn((a + b) / 2);
}

describe('shadow-price-income-estimate', () => {
  it('is the slope of the value function times ΔM (value function found by search)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(shadowPriceIncomeEstimate, seed);
        // V(m) = the best x·y on the budget line for income m, searched, not from a formula.
        const V = (m: number) => peak((x) => (x * (m - p.px * x)) / p.py, 0, m / p.px);
        const h = 0.01;
        const slope = (V(p.M + h) - V(p.M - h)) / (2 * h);
        expect(Math.abs(slope * p.dM - value)).toBeLessThanOrEqual(0.01);
        // The exact change is a little larger (V is convex in M), by at most ΔM/(2M) in relative terms.
        const exact = V(p.M + p.dM) - V(p.M);
        expect(exact).toBeGreaterThan(value);
        expect(exact / value - 1).toBeLessThanOrEqual(p.dM / (2 * p.M) + 1e-6);
      }),
      RUNS,
    );
  });

  it('uses a whole bundle on the budget, a small rise in income and readable numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(shadowPriceIncomeEstimate, seed);
        expect(p.px * p.x + p.py * p.y).toBe(p.M);
        expect(p.px * p.x).toBe(p.py * p.y);
        expect(Math.min(p.x, p.y)).toBeGreaterThanOrEqual(2);
        expect(p.dM % 5).toBe(0);
        expect(5 * p.dM).toBeLessThanOrEqual(p.M);
        expect(p.M).toBeLessThanOrEqual(1500);
        expect(twoDecimals(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(codes(distractors)).toEqual([
          'AVERAGE_NOT_MARGINAL',
          'DIVIDED_BY_LAMBDA',
          'LAMBDA_ONLY',
          'NEW_LEVEL',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (U = xy, 5x + 10y = 600, income up by 10)', () => {
    const p = { px: 5, py: 10, M: 600, x: 60, y: 30, dM: 10 };
    expect(shadowPriceIncomeEstimate.answer(p)).toMatchObject({ kind: 'numeric', value: 60 });
    expect(shadowPriceIncomeEstimate.distractors(p).map((d) => d.value)).toEqual([
      1860.5, 6, 1.67, 30,
    ]);
  });
});

describe('shadow-price-marginal-cost', () => {
  it('equals the slope of the minimum cost in the output target (cost found by search)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(shadowPriceMarginalCost, seed);
        // Minimum cost of output q: search L along the isoquant K = (q/A)²/L.
        const C = (q: number) =>
          -peak((L) => -(p.w * L + (p.r * (q / p.A) ** 2) / L), 1e-6, 50 * p.L);
        const h = 0.01;
        const slope = (C(p.target + h) - C(p.target - h)) / (2 * h);
        expect(Math.abs(slope - value)).toBeLessThanOrEqual(0.001 * value + 1e-6);
        expect(C(p.target)).toBeCloseTo(p.w * p.L + p.r * p.K, 4);
      }),
      RUNS,
    );
  });

  it('satisfies both first-order conditions with whole inputs and sensible prices', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(shadowPriceMarginalCost, seed);
        expect(p.A * Math.sqrt(p.K * p.L)).toBeCloseTo(p.target, 9);
        const mpL = (p.A / 2) * Math.sqrt(p.K / p.L);
        const mpK = (p.A / 2) * Math.sqrt(p.L / p.K);
        expect(value * mpL).toBeCloseTo(p.w, 9);
        expect(value * mpK).toBeCloseTo(p.r, 9);
        // Constant returns: minimum cost is λ times output.
        expect(value * p.target).toBeCloseTo(p.w * p.L + p.r * p.K, 6);
        expect(twoDecimals(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(50);
        expect(Math.min(p.w, p.r)).toBeGreaterThanOrEqual(2);
        expect(Math.max(p.w, p.r)).toBeLessThanOrEqual(150);
        expect(codes(distractors)).toEqual([
          'CONSTANT_MARGINAL_PRODUCT',
          'DROPPED_HALF',
          'GAVE_OPTIMAL_VALUE',
          'INVERTED_MULTIPLIER',
        ]);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces the MV08 workshop (Q = 4√(KL), w = 16, r = 4, Q̄ = 240): λ = 4', () => {
    const p = { A: 4, w: 16, r: 4, m: 2, n: 1, t: 4, target: 240, L: 30, K: 120 };
    expect(shadowPriceMarginalCost.answer(p)).toMatchObject({ kind: 'numeric', value: 4 });
    expect(shadowPriceMarginalCost.distractors(p).map((d) => d.value)).toEqual([960, 2, 0.25]);
  });
});

describe('shadow-price-water', () => {
  it('is the slope of the maximum revenue in the water supply (revenue found by search)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(shadowPriceWater, seed);
        const V = (W: number) =>
          peak((w1) => p.alpha * Math.sqrt(w1) + p.beta * Math.sqrt(W - w1), 0, W);
        const h = 0.01;
        const slope = (V(p.W + h) - V(p.W - h)) / (2 * h);
        expect(Math.abs(slope - value)).toBeLessThanOrEqual(0.001);
        expect(V(p.W)).toBeCloseTo(p.alpha * Math.sqrt(p.w1) + p.beta * Math.sqrt(p.w2), 6);
      }),
      RUNS,
    );
  });

  it('splits all the water with equal marginal revenue on both fields', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(shadowPriceWater, seed);
        expect(p.w1 + p.w2).toBe(p.W);
        expect(Number.isInteger(p.w1) && Number.isInteger(p.w2)).toBe(true);
        // α/(2√w₁) = β/(2√w₂) = λ, compared in whole numbers: α²·w₂ = β²·w₁.
        expect(p.alpha ** 2 * p.w2).toBe(p.beta ** 2 * p.w1);
        expect(p.alpha / (2 * Math.sqrt(p.w1))).toBeCloseTo(value, 9);
        expect(twoDecimals(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0.25);
        expect(p.W).toBeLessThanOrEqual(3600);
        expect(Math.max(p.alpha, p.beta)).toBeLessThanOrEqual(400);
        expect(codes(distractors)).toEqual([
          'AVERAGE_NOT_MARGINAL',
          'GAVE_OPTIMAL_VALUE',
          'GAVE_QUANTITY',
          'ONE_FIELD_ONLY',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (R = 60√w₁ + 80√w₂, W = 400): λ = 2.5', () => {
    const p = { alpha: 60, beta: 80, s: 100, W: 400, q: 20, w1: 144, w2: 256 };
    expect(shadowPriceWater.answer(p)).toMatchObject({ kind: 'numeric', value: 2.5 });
    expect(shadowPriceWater.distractors(p).map((d) => d.value)).toEqual([5, 144, 2000, 1.5]);
  });
});
