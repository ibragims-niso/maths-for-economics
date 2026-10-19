import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { complementsPriceElasticity } from './complements-price-elasticity';
import { perfectComplementsDemand } from './perfect-complements-demand';
import { slutskySubstitutionIncomeEffect } from './slutsky-substitution-income-effect';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const isWhole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** The x where a·x = b·y on the budget line, found by bisection (a·x rises, b·y falls along it). */
function kinkX(a: number, b: number, px: number, py: number, M: number) {
  let lo = 0;
  let hi = M / px;
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2;
    if (a * mid < (b * (M - px * mid)) / py) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The best x on a budget line, by golden-section search of a single-peaked utility. */
function bestOnLine(u: (x: number) => number, xMax: number) {
  let lo = 0;
  let hi = xMax;
  const g = (Math.sqrt(5) - 1) / 2;
  for (let k = 0; k < 200; k++) {
    const m1 = hi - g * (hi - lo);
    const m2 = lo + g * (hi - lo);
    if (u(m1) < u(m2)) lo = m1;
    else hi = m2;
  }
  return (lo + hi) / 2;
}

describe('perfect-complements-demand', () => {
  it('gives the bundle with the highest min(ax, by) on the budget line (grid search)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(perfectComplementsDemand, seed);
        const u = (x: number) => Math.min(p.a * x, (p.b * (p.M - p.px * x)) / p.py);
        const best = u(p.x);
        const xMax = p.M / p.px;
        let top = -Infinity;
        for (let i = 0; i <= 400; i++) top = Math.max(top, u((xMax * i) / 400));
        expect(top).toBeLessThanOrEqual(best + 1e-9);
        expect(u(p.x - 0.01)).toBeLessThan(best);
        expect(u(p.x + 0.01)).toBeLessThan(best);
        expect(value).toBe(p.ask === 'x' ? p.x : p.y);
      }),
      RUNS,
    );
  });

  it('wastes nothing, spends the whole budget and uses whole, sensible numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(perfectComplementsDemand, seed);
        expect(p.a * p.x).toBe(p.b * p.y);
        expect(p.px * p.x + p.py * p.y).toBe(p.M);
        expect(isWhole(value)).toBe(true);
        expect(Math.min(p.x, p.y)).toBeGreaterThanOrEqual(2);
        expect(p.M).toBeLessThanOrEqual(3000);
        expect(Math.min(p.px, p.py)).toBeGreaterThanOrEqual(2);
        expect(p.a).not.toBe(p.b);
        expect(codes(distractors)).toEqual([
          'ALL_ON_ONE_GOOD',
          'HALF_BUDGET_SPLIT',
          'INVERTED_PROPORTION',
          'ONE_FOR_ONE',
        ]);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (U = min(40x, y), p_x = 30, p_y = 1.5, M = 900)', () => {
    const p = { a: 40, b: 1, px: 30, py: 1.5, M: 900, x: 10, y: 400, ask: 'x' as const };
    expect(perfectComplementsDemand.answer(p)).toMatchObject({ kind: 'numeric', value: 10 });
    expect(perfectComplementsDemand.answer({ ...p, ask: 'y' })).toMatchObject({ value: 400 });
    expect(kinkX(40, 1, 30, 1.5, 900)).toBeCloseTo(10, 9);
    // With fuel at 2.25 the family hires the car for 7.5 days.
    expect(kinkX(40, 1, 30, 2.25, 900)).toBeCloseTo(7.5, 9);
  });
});

describe('slutsky-substitution-income-effect', () => {
  it('matches a numerical split: best choices and least-cost bundle found by search', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(slutskySubstitutionIncomeEffect, seed);
        const choice = (price: number) => bestOnLine((x) => x * (p.M - price * x), p.M / price);
        const x0 = choice(p.p0);
        const x1 = choice(p.p1);
        // Hicksian demand: the cheapest bundle on the original indifference curve xy = U0.
        const u0 = x0 * ((p.M - p.p0 * x0) / p.py);
        const h = bestOnLine((x) => -(p.p1 * x + (p.py * u0) / x), 10 * p.M);
        const expected = p.ask === 'substitution' ? h - x0 : x1 - h;
        expect(Math.abs(expected - value)).toBeLessThan(1e-4);
        // The parts add up to the total change.
        expect(h - x0 + (x1 - h)).toBeCloseTo(x1 - x0, 9);
      }),
      RUNS,
    );
  });

  it('has the textbook signs and whole, sensible numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(slutskySubstitutionIncomeEffect, seed);
        // Substitution effect against the price change; income effect the same way for a normal good.
        expect(Math.sign(value)).toBe(Math.sign(p.p0 - p.p1));
        expect(isWhole(value)).toBe(true);
        expect(value).not.toBe(0);
        expect(isWhole(p.M / (2 * p.p0))).toBe(true);
        expect(isWhole(p.M / (2 * p.p1))).toBe(true);
        expect(isWhole(p.M / (2 * p.py))).toBe(true);
        expect(Math.min(p.M / (2 * p.p0), p.M / (2 * p.p1))).toBeGreaterThanOrEqual(2);
        expect(Math.max(p.p0, p.p1)).toBeLessThanOrEqual(40);
        expect(p.M).toBeLessThanOrEqual(3000);
        const ratio = Math.max(p.p0, p.p1) / Math.min(p.p0, p.p1);
        expect(ratio).toBeGreaterThanOrEqual(1.5);
        expect(ratio).toBeLessThanOrEqual(4);
        expect(codes(distractors)).toEqual([
          'EFFECT_SIGN',
          'GAVE_NEW_QUANTITY',
          'SWAPPED_EFFECTS',
          'TOTAL_NOT_SPLIT',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (U = xy, M = 360, p_y = 1, p_x from 4 to 9)', () => {
    const p = { p0: 4, p1: 9, py: 1, M: 360, ask: 'substitution' as const };
    expect(slutskySubstitutionIncomeEffect.answer(p)).toMatchObject({ value: -15 });
    expect(slutskySubstitutionIncomeEffect.answer({ ...p, ask: 'income' })).toMatchObject({
      value: -10,
    });
    expect(slutskySubstitutionIncomeEffect.steps(p).map((s) => s.result)).toEqual([
      45, 20, 30, -15,
    ]);
  });
});

describe('complements-price-elasticity', () => {
  it('equals a numerical log-derivative of the demand found by bisection', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(complementsPriceElasticity, seed);
        const x = (px: number, py: number, M: number) => kinkX(p.a, p.b, px, py, M);
        const h = 1e-4;
        const own =
          (Math.log(x(p.px * (1 + h), p.py, p.M)) - Math.log(x(p.px * (1 - h), p.py, p.M))) /
          (Math.log(1 + h) - Math.log(1 - h));
        const cross =
          (Math.log(x(p.px, p.py * (1 + h), p.M)) - Math.log(x(p.px, p.py * (1 - h), p.M))) /
          (Math.log(1 + h) - Math.log(1 - h));
        const income =
          (Math.log(x(p.px, p.py, p.M * (1 + h))) - Math.log(x(p.px, p.py, p.M * (1 - h)))) /
          (Math.log(1 + h) - Math.log(1 - h));
        const numeric = p.ask === 'own' ? own : cross;
        expect(Math.abs(numeric - value)).toBeLessThanOrEqual(0.005 + 1e-6);
        // Demand is homogeneous of degree 0, so the three elasticities add up to 0.
        expect(income).toBeCloseTo(1, 5);
        expect(own + cross + income).toBeCloseTo(0, 5);
      }),
      RUNS,
    );
  });

  it('lies inside (−1, 0) with 2 decimals and the expected distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(complementsPriceElasticity, seed);
        expect(value).toBeGreaterThan(-1);
        expect(value).toBeLessThan(0);
        expect(twoDecimals(value)).toBe(true);
        expect(Math.min(p.px, p.py)).toBeGreaterThanOrEqual(2);
        expect(p.M).toBeGreaterThan(0);
        expect(codes(distractors)).toEqual([
          'COBB_DOUGLAS_ELASTICITY',
          'ELASTICITY_SIGN',
          'INVERTED_ELASTICITY',
          'SWAPPED_ELASTICITY',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (cross-price elasticity −0.67 for cars and fuel)', () => {
    const p = { a: 40, b: 1, px: 30, py: 1.5, M: 900, ask: 'cross' as const };
    expect(complementsPriceElasticity.answer(p)).toMatchObject({ value: -0.67 });
    expect(complementsPriceElasticity.answer({ ...p, ask: 'own' })).toMatchObject({
      value: -0.33,
    });
  });
});
