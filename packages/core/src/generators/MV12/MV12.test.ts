import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { hotellingProfitPriceSlope } from './hotelling-profit-price-slope';
import { roysIdentityDemand } from './roys-identity-demand';
import { shephardLabourDemand } from './shephard-labour-demand';

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
  return { x: (a + b) / 2, value: fn((a + b) / 2) };
}

describe('hotelling-profit-price-slope', () => {
  it('is the slope of maximum profit in the price (maximum found by search)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(hotellingProfitPriceSlope, seed);
        const best = (price: number) =>
          peak((q) => price * q - p.F - p.c * q * q, 0, 10 * p.q).value;
        const h = 0.01;
        const slope = (best(p.p + h) - best(p.p - h)) / (2 * h);
        expect(Math.abs(slope - value)).toBeLessThanOrEqual(1e-4);
      }),
      RUNS,
    );
  });

  it('has a whole best output, a positive maximum profit and sensible prices', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(hotellingProfitPriceSlope, seed);
        const profit = (q: number) => p.p * q - p.F - p.c * q * q;
        expect(Number.isInteger(value)).toBe(true);
        expect(Number.isInteger(p.p)).toBe(true);
        expect(profit(value)).toBeGreaterThan(profit(value - 1));
        expect(profit(value)).toBeGreaterThan(profit(value + 1));
        expect(profit(value)).toBeGreaterThan(0);
        expect(p.p).toBeGreaterThan(0);
        expect(p.p).toBeLessThanOrEqual(300);
        expect(p.F % 10).toBe(0);
        expect(codes(distractors)).toEqual([
          'GAVE_MAX_PROFIT',
          'PRICE_AS_ANSWER',
          'SLOPE_OF_OUTPUT',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (C = 100 + 2q², p = 40): dπ*/dp = 10', () => {
    const p = { F: 100, c: 2, p: 40, q: 10 };
    expect(hotellingProfitPriceSlope.answer(p)).toMatchObject({ kind: 'numeric', value: 10 });
    expect(hotellingProfitPriceSlope.distractors(p).map((d) => d.value)).toEqual([100, 0.25, 40]);
  });
});

describe('shephard-labour-demand', () => {
  it('is the slope of the cost function in the wage, and the inputs use up the cost', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(shephardLabourDemand, seed);
        const beta = p.i / p.d;
        const C = (w: number, r: number) => p.k * w ** beta * r ** (1 - beta) * p.Q ** p.gamma;
        const h = 1e-4;
        const L = (C(p.w + h, p.r) - C(p.w - h, p.r)) / (2 * h);
        const K = (C(p.w, p.r + h) - C(p.w, p.r - h)) / (2 * h);
        expect(Math.abs(L - value)).toBeLessThanOrEqual(1e-3 + 1e-6 * value);
        // wL* + rK* = C, because the cost function is homogeneous of degree 1 in w and r.
        expect(Math.abs(p.w * L + p.r * K - C(p.w, p.r))).toBeLessThanOrEqual(1e-6 * C(p.w, p.r));
      }),
      RUNS,
    );
  });

  it('gives readable labour demands at sensible prices', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(shephardLabourDemand, seed);
        expect(twoDecimals(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(Math.min(p.w, p.r)).toBeGreaterThanOrEqual(2);
        expect(Math.max(p.w, p.r)).toBeLessThanOrEqual(250);
        expect(p.i).toBeLessThan(p.d);
        expect(codes(distractors)).toEqual([
          'FORGOT_DIVIDE_BY_PRICE',
          'FORGOT_EXPONENT',
          'GAVE_COST',
          'GAVE_OTHER_INPUT',
        ]);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (C = 2√(wr)·Q², w = 16, r = 4, Q = 10): L* = 50', () => {
    const p = { k: 2, i: 1, d: 2, gamma: 2 as const, m: 2, n: 1, s: 4, w: 16, r: 4, Q: 10 };
    expect(shephardLabourDemand.answer(p)).toMatchObject({ kind: 'numeric', value: 50 });
    expect(shephardLabourDemand.distractors(p).map((d) => d.value)).toEqual([1600, 100, 800, 200]);
  });
});

describe('roys-identity-demand', () => {
  it('matches the best bundle of U = x^a·y^b found by search on the budget line', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(roysIdentityDemand, seed);
        const best = peak(
          (x) => p.a * Math.log(x) + p.b * Math.log((p.M - p.px * x) / p.py),
          1e-9,
          p.M / p.px - 1e-9,
        );
        expect(Math.abs(best.x - value)).toBeLessThanOrEqual(1e-4);
      }),
      RUNS,
    );
  });

  it('equals −(∂V/∂p_x)/(∂V/∂M) by numerical differentiation, whatever the constant A', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(roysIdentityDemand, seed);
        const A = 3.7;
        // Work with ln V, whose derivatives have the same ratio as those of V.
        const lnV = (px: number, M: number) =>
          Math.log(A) + (p.a + p.b) * Math.log(M) - p.a * Math.log(px) - p.b * Math.log(p.py);
        const h = 1e-5;
        const dpx = (lnV(p.px + h, p.M) - lnV(p.px - h, p.M)) / (2 * h);
        const dM = (lnV(p.px, p.M + h) - lnV(p.px, p.M - h)) / (2 * h);
        expect(Math.abs(-dpx / dM - value)).toBeLessThanOrEqual(1e-4 * value);
        expect(Number.isInteger(value)).toBe(true);
        expect(Number.isInteger(p.M)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.px * value).toBeLessThan(p.M);
        expect(codes(distractors)).toEqual([
          'INCOME_POWER',
          'OTHER_GOOD',
          'ROY_INVERTED',
          'ROY_SIGN',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (U = xy, p_x = 4, p_y = 1, M = 360): x = 45', () => {
    const p = { a: 1, b: 1, px: 4, py: 1, M: 360, x: 45 };
    expect(roysIdentityDemand.answer(p)).toMatchObject({ kind: 'numeric', value: 45 });
    expect(roysIdentityDemand.distractors(p).map((d) => d.value)).toEqual([-45, 0.0222, 180, 90]);
  });
});
