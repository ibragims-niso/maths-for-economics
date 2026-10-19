import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { gradientAscentStepTwoInputs } from './gradient-ascent-step-two-inputs';
import { gradientDescentLargestStableStep } from './gradient-descent-largest-stable-step';
import { newtonStepProfitCubicCost } from './newton-step-profit-cubic-cost';

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

/** At most `decimals` decimal places (up to floating-point noise). */
const hasDecimals = (x: number, decimals: number) =>
  Math.abs(x * 10 ** decimals - Math.round(x * 10 ** decimals)) < 1e-6;

describe('gradient-ascent-step-two-inputs', () => {
  it('moves by α times a numerically differentiated gradient, and profit rises', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(gradientAscentStepTwoInputs, seed);
        const profit = (l: number, k: number) =>
          p.a * l + p.b * k - p.c * l * l - p.d * k * k - p.e * l * k - p.fixedCost;
        const h = 1e-3;
        const gl = (profit(p.l0 + h, p.k0) - profit(p.l0 - h, p.k0)) / (2 * h);
        const gk = (profit(p.l0, p.k0 + h) - profit(p.l0, p.k0 - h)) / (2 * h);
        const l1 = p.l0 + p.alpha * gl;
        const k1 = p.k0 + p.alpha * gk;
        expect(Math.abs(value - (p.ask === 1 ? l1 : k1))).toBeLessThan(1e-6);
        // A small enough step uphill raises profit.
        expect(profit(l1, k1)).toBeGreaterThan(profit(p.l0, p.k0));
        expect(l1).toBeGreaterThan(0);
        expect(k1).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
        // The profit is a hill: concave with its top at positive inputs.
        expect(4 * p.c * p.d - p.e * p.e).toBeGreaterThan(0);
        expect(p.a).toBeGreaterThan(0);
        expect(p.b).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces NM02 Example 1 (from (5, 5) with α = 0.1 to (8, 7))', () => {
    const base = { a: 60, b: 60, c: 2, d: 3, e: 2, fixedCost: 200, l0: 5, k0: 5, alpha: 0.1 };
    expect(numericAnswer(gradientAscentStepTwoInputs, { ...base, ask: 1 as const })).toBe(8);
    expect(numericAnswer(gradientAscentStepTwoInputs, { ...base, ask: 2 as const })).toBe(7);
    // A second step from (8, 7) gives (9.4, 7.2).
    const second = { ...base, l0: 8, k0: 7 };
    expect(numericAnswer(gradientAscentStepTwoInputs, { ...second, ask: 1 as const })).toBe(9.4);
    expect(numericAnswer(gradientAscentStepTwoInputs, { ...second, ask: 2 as const })).toBe(7.2);
  });
});

describe('newton-step-profit-cubic-cost', () => {
  it('matches a Newton step built from numerical derivatives and jumps past the top', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(newtonStepProfitCubicCost, seed);
        const profit = (q: number) => p.A * q - p.B * q * q - p.C * q ** 3 - p.fixedCost;
        const h = 1e-3;
        const d1 = (q: number) => (profit(q + h) - profit(q - h)) / (2 * h);
        const d2 = (profit(p.q0 + h) - 2 * profit(p.q0) + profit(p.q0 - h)) / (h * h);
        const q1 = p.q0 - d1(p.q0) / d2;
        expect(Math.abs(value - q1)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(hasDecimals(value, 2)).toBe(true);
        // The true top by bisection on π′ (which falls for q > 0): q₀ < q* ≤ q₁.
        let lo = 0;
        let hi = 100;
        for (let i = 0; i < 80; i++) {
          const mid = (lo + hi) / 2;
          if (d1(mid) > 0) lo = mid;
          else hi = mid;
        }
        expect(p.q0).toBeLessThan(lo);
        expect(lo).toBeLessThanOrEqual(q1 + 1e-6);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });
});

describe('gradient-descent-largest-stable-step', () => {
  it('descent just below the bound converges and just above it blows up', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(gradientDescentLargestStableStep, seed);
        // Distance from the bottom, δ ↦ δ − αHδ with H = [[2c, e], [e, 2d]].
        const run = (alpha: number) => {
          let x = 1;
          let y = Math.SQRT2;
          for (let i = 0; i < 2000; i++) {
            const gx = 2 * p.c * x + p.e * y;
            const gy = p.e * x + 2 * p.d * y;
            x -= alpha * gx;
            y -= alpha * gy;
          }
          return Math.hypot(x, y);
        };
        expect(run(0.98 * value)).toBeLessThan(1e-6);
        expect(run(1.02 * value)).toBeGreaterThan(1e6);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(value).toBeGreaterThan(0);
        // A proper bowl: the Hessian is positive definite.
        expect(p.c).toBeGreaterThan(0);
        expect(4 * p.c * p.d - p.e * p.e).toBeGreaterThan(0);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('gives 0.1 for the least-squares fit of NM02 Example 2 (Hessian 10 and 20 on the diagonal)', () => {
    const p = { c: 5, d: 10, e: 0, g: 160, h: 38, k: 1318 };
    expect(numericAnswer(gradientDescentLargestStableStep, p)).toBe(0.1);
  });
});
