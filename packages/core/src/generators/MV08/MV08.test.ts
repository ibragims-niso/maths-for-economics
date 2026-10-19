import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { lagrangeBudgetGoodQuantity } from './lagrange-budget-good-quantity';
import { lagrangeCostMinInput } from './lagrange-cost-min-input';
import { lagrangeMultiplierUtility } from './lagrange-multiplier-utility';

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

describe('lagrange-budget-good-quantity', () => {
  it('beats every other affordable bundle on the budget line (brute force over x)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lagrangeBudgetGoodQuantity, seed);
        // Log utility ranks bundles as x^a·y^b does and avoids huge powers.
        const logU = (x: number) => p.a * Math.log(x) + p.b * Math.log((p.M - p.px * x) / p.py);
        const best = logU(p.x);
        const xMax = p.M / p.px;
        let top = -Infinity;
        for (let i = 1; i < 200; i++) top = Math.max(top, logU((xMax * i) / 200));
        expect(top).toBeLessThanOrEqual(best + 1e-12);
        expect(logU(p.x - 0.01)).toBeLessThan(best);
        expect(logU(p.x + 0.01)).toBeLessThan(best);
        expect(value).toBe(p.ask === 'x' ? p.x : p.y);
      }),
      RUNS,
    );
  });

  it('spends the whole budget with MRS = price ratio, in whole and sensible numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(lagrangeBudgetGoodQuantity, seed);
        expect(p.px * p.x + p.py * p.y).toBe(p.M);
        // a·y/(b·x) = p_x/p_y, compared in whole numbers: wa·y·p_y = wb·x·p_x.
        const wa = Math.round(p.a * 100);
        const wb = Math.round(p.b * 100);
        expect(wa * p.y * p.py).toBe(wb * p.x * p.px);
        expect(isWhole(value)).toBe(true);
        expect(Math.min(p.x, p.y)).toBeGreaterThanOrEqual(2);
        expect(Math.max(p.x, p.y)).toBeLessThanOrEqual(200);
        expect(p.M).toBeLessThanOrEqual(1500);
        expect(p.px).not.toBe(p.py);
        expect(p.a).not.toBe(p.b);
        expect(codes(distractors)).toEqual([
          'ALL_ON_ONE_GOOD',
          'EQUAL_SPLIT',
          'SWAPPED_EXPONENTS',
          'WRONG_PRICE',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in MV08 (U = x²y, 10x + 15y = 900)', () => {
    const p = { a: 2, b: 1, px: 10, py: 15, M: 900, x: 60, y: 20, ask: 'x' as const };
    expect(lagrangeBudgetGoodQuantity.answer(p)).toMatchObject({ kind: 'numeric', value: 60 });
    expect(lagrangeBudgetGoodQuantity.answer({ ...p, ask: 'y' })).toMatchObject({ value: 20 });
    expect(lagrangeBudgetGoodQuantity.distractors(p).map((d) => d.value)).toEqual([90, 45, 40, 30]);
  });
});

describe('lagrange-cost-min-input', () => {
  it('is the cheapest point on the isoquant (brute force over L)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lagrangeCostMinInput, seed);
        // On the isoquant A·√(KL) = Q̄, K = (Q̄/A)²/L.
        const kOf = (L: number) => (p.target / p.A) ** 2 / L;
        const cost = (L: number) => p.w * L + p.r * kOf(L);
        const best = cost(p.L);
        let lowest = Infinity;
        for (let i = 1; i <= 400; i++) lowest = Math.min(lowest, cost((p.L * i) / 100));
        expect(lowest).toBeGreaterThanOrEqual(best - 1e-9);
        expect(cost(p.L - 0.01)).toBeGreaterThan(best);
        expect(cost(p.L + 0.01)).toBeGreaterThan(best);
        expect(kOf(p.L)).toBeCloseTo(p.K, 9);
        expect(value).toBe(p.ask === 'L' ? p.L : p.K);
      }),
      RUNS,
    );
  });

  it('meets the target exactly with whole, positive inputs and sensible prices', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(lagrangeCostMinInput, seed);
        expect(p.A * Math.sqrt(p.K * p.L)).toBeCloseTo(p.target, 9);
        // MRTS = K/L equals w/r, in whole numbers.
        expect(p.K * p.r).toBe(p.L * p.w);
        expect(isWhole(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(Math.min(p.w, p.r)).toBeGreaterThanOrEqual(2);
        expect(Math.max(p.w, p.r)).toBeLessThanOrEqual(150);
        expect(p.A).toBeGreaterThanOrEqual(2);
        expect(codes(distractors)).toEqual([
          'EQUAL_INPUTS',
          'FORGOT_COEFFICIENT',
          'INVERTED_PRICE_RATIO',
          'MISSED_SQUARE_ROOT',
        ]);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in MV08 (Q = 4√(KL), Q̄ = 240, w = 16, r = 4)', () => {
    const p = { A: 4, w: 16, r: 4, target: 240, L: 30, K: 120, ask: 'L' as const };
    expect(lagrangeCostMinInput.answer(p)).toMatchObject({ kind: 'numeric', value: 30 });
    expect(lagrangeCostMinInput.answer({ ...p, ask: 'K' })).toMatchObject({ value: 120 });
    // Inverting the ratio gives 120, ignoring prices 60, missing the root 15.
    expect(lagrangeCostMinInput.distractors(p).map((d) => d.value)).toEqual([120, 60, 15]);
  });
});

describe('lagrange-multiplier-utility', () => {
  it('equals the rise in maximum utility per extra unit of income (numerical derivative)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lagrangeMultiplierUtility, seed);
        // The best utility for income m, found by searching the budget line for each m.
        const bestUtility = (m: number) => {
          let lo = 0;
          let hi = m / p.px;
          const u = (x: number) => x ** p.a * ((m - p.px * x) / p.py) ** p.b;
          for (let k = 0; k < 200; k++) {
            const m1 = lo + (hi - lo) / 3;
            const m2 = hi - (hi - lo) / 3;
            if (u(m1) < u(m2)) lo = m1;
            else hi = m2;
          }
          return u((lo + hi) / 2);
        };
        const h = 0.01;
        const slope = (bestUtility(p.M + h) - bestUtility(p.M - h)) / (2 * h);
        expect(Math.abs(slope - value)).toBeLessThanOrEqual(0.005 + 1e-6 * value);
      }),
      RUNS,
    );
  });

  it('satisfies both first-order conditions and λ·M = (a + b)·U*', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(lagrangeMultiplierUtility, seed);
        const muX = p.a * p.x ** (p.a - 1) * p.y ** p.b;
        const muY = p.b * p.x ** p.a * p.y ** (p.b - 1);
        expect(muX * p.py).toBe(muY * p.px);
        expect(p.px * p.x + p.py * p.y).toBe(p.M);
        expect(value * p.M).toBeCloseTo((p.a + p.b) * p.x ** p.a * p.y ** p.b, 6);
        expect(twoDecimals(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0.5);
        expect(value).toBeLessThanOrEqual(500);
        expect(codes(distractors)).toEqual([
          'AVERAGE_NOT_MARGINAL',
          'GAVE_QUANTITY',
          'LAMBDA_SIGN',
          'WRONG_PRICE',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked examples 1 and 3 in MV08 (λ = 6 and λ = 240)', () => {
    const ex1 = { a: 1, b: 1, px: 5, py: 10, M: 600, x: 60, y: 30 };
    expect(lagrangeMultiplierUtility.answer(ex1)).toMatchObject({ kind: 'numeric', value: 6 });
    const ex3 = { a: 2, b: 1, px: 10, py: 15, M: 900, x: 60, y: 20 };
    expect(lagrangeMultiplierUtility.answer(ex3)).toMatchObject({ value: 240 });
  });
});
