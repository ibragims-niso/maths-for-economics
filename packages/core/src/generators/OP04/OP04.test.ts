import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { comparativeStaticsOneChoice } from './comparative-statics-one-choice';
import { monopolyTaxPriceChange } from './monopoly-tax-price-change';
import { slutskyEquationCobbDouglas } from './slutsky-equation-cobb-douglas';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** The maximiser of a single-peaked function on [lo, hi], by ternary search. */
function argmax(fn: (x: number) => number, lo: number, hi: number) {
  let a = lo;
  let b = hi;
  for (let k = 0; k < 200; k++) {
    const m1 = a + (b - a) / 3;
    const m2 = b - (b - a) / 3;
    if (fn(m1) < fn(m2)) a = m1;
    else b = m2;
  }
  return (a + b) / 2;
}

describe('comparative-statics-one-choice', () => {
  /** Profit as a function of the choice x and the parameter θ (price or wage). */
  const profit =
    (p: { kind: 'output' | 'labour'; F: number; k: number; B: number }) =>
    (x: number, theta: number) =>
      p.kind === 'output' ? theta * x - p.F - x ** 3 / p.k : p.B * Math.sqrt(x) - theta * x;

  it('matches the slope of the best choice found by search at nearby parameter values', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(comparativeStaticsOneChoice, seed);
        const f = profit(p);
        const best = (theta: number) => argmax((x) => f(x, theta), 1e-6, 10 * p.x);
        expect(Math.abs(best(p.theta) - p.x)).toBeLessThan(1e-5 * p.x + 1e-6);
        const h = 1e-3 * p.theta;
        const slope = (best(p.theta + h) - best(p.theta - h)) / (2 * h);
        // The answer is rounded to 2 decimals.
        expect(Math.abs(slope - value)).toBeLessThanOrEqual(0.005 + 1e-4 * Math.abs(slope));
      }),
      RUNS,
    );
  });

  it('has a whole best choice, a positive maximum profit, the right sign and 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(comparativeStaticsOneChoice, seed);
        const f = profit(p);
        expect(Number.isInteger(p.x)).toBe(true);
        expect(Number.isInteger(p.theta)).toBe(true);
        expect(p.theta).toBeGreaterThan(0);
        expect(f(p.x, p.theta)).toBeGreaterThan(0);
        // A supply curve slopes up and a labour demand slopes down.
        if (p.kind === 'output') expect(value).toBeGreaterThan(0);
        else expect(value).toBeLessThan(0);
        expect(twoDecimals(value)).toBe(true);
        expect(codes(distractors)).toEqual(['INVERTED_RATIO', 'SIGN', 'VALUE_NOT_CHOICE']);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (C = 100 + q³/30, p = 40): dq*/dp = 0.25', () => {
    const p = { kind: 'output' as const, F: 100, k: 30, B: 0, theta: 40, x: 20 };
    expect(comparativeStaticsOneChoice.answer(p)).toMatchObject({ kind: 'numeric', value: 0.25 });
    expect(comparativeStaticsOneChoice.distractors(p).map((d) => d.value)).toEqual([-0.25, 4, 20]);
  });
});

describe('monopoly-tax-price-change', () => {
  it('equals the change in the profit-maximising price found by search at both taxes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(monopolyTaxPriceChange, seed);
        const priceAt = (t: number) => {
          const q = argmax(
            (x) => (p.a - p.b * x) * x - p.c * x - p.d * x * x - t * x,
            0,
            p.a / p.b,
          );
          return { q, P: p.a - p.b * q };
        };
        const before = priceAt(p.t0);
        const after = priceAt(p.t0 + p.dt);
        expect(Math.abs(before.q - p.q0)).toBeLessThan(1e-4);
        expect(after.q).toBeGreaterThan(1);
        expect(Math.abs(after.P - before.P - value)).toBeLessThan(1e-4);
      }),
      RUNS,
    );
  });

  it('gives a price rise smaller than the tax rise, in readable numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(monopolyTaxPriceChange, seed);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.dt);
        expect(twoDecimals(value)).toBe(true);
        expect(Number.isInteger(p.a)).toBe(true);
        expect(p.a - p.b * p.q0).toBeGreaterThan(p.c);
        const expected = ['FULL_PASS_THROUGH', 'QUANTITY_NOT_PRICE', 'SIGN'];
        if (p.d !== 0) expected.push('CONSTANT_COST_RULE');
        expect(codes(distractors)).toEqual(expected.sort());
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (P = 120 − 2q, C = 20q + q², t: 10 → 16): ΔP = 2', () => {
    const p = { a: 120, b: 2, c: 20, d: 1, t0: 10, dt: 6, q0: 15 };
    expect(monopolyTaxPriceChange.answer(p)).toMatchObject({ kind: 'numeric', value: 2 });
    expect(monopolyTaxPriceChange.distractors(p).map((d) => d.value)).toEqual([6, 3, -1, -2]);
  });
});

describe('slutsky-equation-cobb-douglas', () => {
  /** The root of a decreasing function on [lo, hi], by bisection. */
  function root(fn: (x: number) => number, lo: number, hi: number) {
    let a = lo;
    let b = hi;
    for (let k = 0; k < 200; k++) {
      const m = (a + b) / 2;
      if (fn(m) > 0) a = m;
      else b = m;
    }
    return (a + b) / 2;
  }

  /** Best x for U = x^a·y^(1−a): where the slope of a·ln x + (1−a)·ln y along the budget is 0. */
  const demandBySearch = (a: number, M: number, px: number) =>
    root((x) => a / x - ((1 - a) * px) / (M - px * x), 1e-9, M / px - 1e-9);

  it('splits the slope of demand into a compensated slope and the rest, numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(slutskyEquationCobbDouglas, seed);
        const a = p.a100 / 100;
        const x0 = demandBySearch(a, p.M, p.px);
        const u0 = x0 ** a * ((p.M - p.px * x0) / p.py) ** (1 - a);
        // Compensated demand: the cheapest bundle on the indifference curve y = (u0/x^a)^(1/(1−a)).
        // Spending px·x + py·y(x) is falling while px < py·|y'(x)| = py·a·y/((1−a)·x).
        const hicks = (px: number) =>
          root(
            (x) => (p.py * a * (u0 / x ** a) ** (1 / (1 - a))) / ((1 - a) * x) - px,
            1e-6,
            100 * x0,
          );
        expect(Math.abs(hicks(p.px) - x0)).toBeLessThan(1e-6 * x0);
        const h = 1e-3 * p.px;
        const sub = (hicks(p.px + h) - hicks(p.px - h)) / (2 * h);
        const totalSlope =
          (demandBySearch(a, p.M, p.px + h) - demandBySearch(a, p.M, p.px - h)) / (2 * h);
        const expected = p.ask === 'substitution' ? sub : totalSlope - sub;
        expect(Math.abs(expected - value)).toBeLessThanOrEqual(0.005 + 1e-4 * Math.abs(expected));
      }),
      RUNS,
    );
  });

  it('gives negative effects, a whole demand and readable numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(slutskyEquationCobbDouglas, seed);
        const x = ((p.a100 / 100) * p.M) / p.px;
        expect(Math.abs(x - Math.round(x))).toBeLessThan(1e-9);
        expect(x * p.px).toBeLessThan(p.M);
        expect(value).toBeLessThan(0);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        for (const c of ['TOTAL_NOT_SPLIT', 'EFFECT_SIGN']) expect(codes(distractors)).toContain(c);
      }),
      RUNS,
    );
  });

  it('reproduces the Slutsky example in OP04 (U = x^0.3·y^0.7, M = 1000, p_x = 5)', () => {
    const base = { a100: 30, M: 1000, px: 5, py: 2 };
    expect(slutskyEquationCobbDouglas.answer({ ...base, ask: 'substitution' })).toMatchObject({
      value: -8.4,
    });
    expect(slutskyEquationCobbDouglas.answer({ ...base, ask: 'income' })).toMatchObject({
      value: -3.6,
    });
  });
});
