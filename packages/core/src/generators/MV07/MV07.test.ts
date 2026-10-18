import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { hessianDeterminantTwoGoods } from './hessian-determinant-two-goods';
import { priceDiscriminationTwoMarkets } from './price-discrimination-two-markets';
import { profitAt, type QuadraticProfit } from './two-goods';
import { twoProductOptimalOutput } from './two-product-optimal-output';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const numericAnswer = <P>(gen: Generator<P>, p: P) => {
  const a = gen.answer(p);
  if (a.kind !== 'numeric') throw new Error('numeric expected');
  return a.value;
};

/** Numeric Hessian of f at (x, y) by central differences (no use of the formulas). */
function numericHessian(f: (x: number, y: number) => number, x: number, y: number) {
  const h = 0.5;
  const fxx = (f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h * h);
  const fyy = (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h);
  const fxy = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h);
  return { fxx, fyy, fxy, det: fxx * fyy - fxy * fxy };
}

const NEIGHBOURS = [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => [i, j] as const));

describe('two-product-optimal-output', () => {
  it('beats every neighbouring output pair, and the gradient is zero there', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(twoProductOptimalOutput, seed);
        const f = (x: number, y: number) => profitAt(p, x, y);
        const best = f(p.q1, p.q2);
        for (const [i, j] of NEIGHBOURS) {
          if (i !== 0 || j !== 0) expect(f(p.q1 + i, p.q2 + j)).toBeLessThan(best);
        }
        const h = 1e-3;
        expect(Math.abs((f(p.q1 + h, p.q2) - f(p.q1 - h, p.q2)) / (2 * h))).toBeLessThan(1e-6);
        expect(Math.abs((f(p.q1, p.q2 + h) - f(p.q1, p.q2 - h)) / (2 * h))).toBeLessThan(1e-6);
        expect(value).toBe(p.ask === 1 ? p.q1 : p.q2);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(p.a).toBeGreaterThan(0);
        expect(p.b).toBeGreaterThan(0);
        expect(numericHessian(f, p.q1, p.q2).det).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces MV07 Example 1 (Q₁ = 10, Q₂ = 8)', () => {
    const base = { a: 56, b: 68, c: 2, d: 3, e: 2, fixedCost: 200, q1: 10, q2: 8 };
    expect(numericAnswer(twoProductOptimalOutput, { ...base, ask: 1 as const })).toBe(10);
    expect(numericAnswer(twoProductOptimalOutput, { ...base, ask: 2 as const })).toBe(8);
    expect(profitAt(base, 10, 8)).toBe(352);
    const codes = twoProductOptimalOutput.distractors({ ...base, ask: 1 });
    expect(codes).toContainEqual({ value: 14, mistakeCode: 'IGNORED_CROSS_TERM' });
  });
});

describe('hessian-determinant-two-goods', () => {
  it('equals the determinant of the numeric Hessian at any point', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(hessianDeterminantTwoGoods, seed);
        const f = (x: number, y: number) => profitAt(p as QuadraticProfit, x, y);
        for (const [x, y] of [
          [0, 0],
          [7, 3],
          [25, 40],
        ] as const) {
          expect(numericHessian(f, x, y).det).toBeCloseTo(value, 6);
        }
        expect(Number.isInteger(value) && value !== 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('a negative D really is a saddle: profit rises one way and falls another', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(hessianDeterminantTwoGoods, seed);
        if (value > 0) return;
        // The change in profit along a direction (u, v) from any point has quadratic part
        // −(c u² + e u v + d v²); a saddle has directions of both signs.
        const q = (u: number, v: number) => -(p.c * u * u + p.e * u * v + p.d * v * v);
        const values = Array.from({ length: 72 }, (_, i) => {
          const t = (i * Math.PI) / 36;
          return q(Math.cos(t), Math.sin(t));
        });
        expect(Math.max(...values)).toBeGreaterThan(0);
        expect(Math.min(...values)).toBeLessThan(0);
      }),
      RUNS,
    );
  });
});

describe('price-discrimination-two-markets', () => {
  it('the quantities beat their neighbours and the price is above marginal cost', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(priceDiscriminationTwoMarkets, seed);
        const k = p.k2 / 2;
        const profit = (x: number, y: number) =>
          (p.alpha1 - p.beta1 * x) * x +
          (p.alpha2 - p.beta2 * y) * y -
          p.fixedCost -
          p.m * (x + y) -
          k * (x + y) ** 2;
        const best = profit(p.q1, p.q2);
        for (const [i, j] of NEIGHBOURS) {
          if (i !== 0 || j !== 0) expect(profit(p.q1 + i, p.q2 + j)).toBeLessThan(best);
        }
        // MR in each market equals the shared MC.
        const mc = p.m + 2 * k * (p.q1 + p.q2);
        expect(p.alpha1 - 2 * p.beta1 * p.q1).toBe(mc);
        expect(p.alpha2 - 2 * p.beta2 * p.q2).toBe(mc);
        const own = p.ask === 1 ? p.alpha1 - p.beta1 * p.q1 : p.alpha2 - p.beta2 * p.q2;
        expect(value).toBe(own);
        expect(value).toBeGreaterThan(mc);
        expect(Number.isInteger(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces MV07 Example 2 (P₁ = 90, P₂ = 75)', () => {
    const base = {
      alpha1: 120,
      beta1: 3,
      alpha2: 90,
      beta2: 1,
      fixedCost: 500,
      m: 10,
      k2: 2,
      q1: 10,
      q2: 15,
    };
    expect(numericAnswer(priceDiscriminationTwoMarkets, { ...base, ask: 1 as const })).toBe(90);
    expect(numericAnswer(priceDiscriminationTwoMarkets, { ...base, ask: 2 as const })).toBe(75);
  });
});
