import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cobbDouglasMarginalProduct } from './cobb-douglas-marginal-product';
import { directionalDerivativeUtility } from './directional-derivative-utility';
import { jointCostPartialMarginalCost } from './joint-cost-partial-marginal-cost';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Central-difference partial derivative: nudge one variable, keep the other fixed. */
const partial = (
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  wrt: 'x' | 'y',
  h = 1e-5,
) => (wrt === 'x' ? (f(x + h, y) - f(x - h, y)) / (2 * h) : (f(x, y + h) - f(x, y - h)) / (2 * h));

describe('cobb-douglas-marginal-product', () => {
  it('equals the numerical partial derivative of A·K^α·L^β with the other input fixed', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(cobbDouglasMarginalProduct, seed);
        const alpha = p.alphaQ / 4;
        const beta = p.betaQ / 4;
        const K = p.kRoot ** p.kPower;
        const L = p.lRoot ** p.lPower;
        const Q = (k: number, l: number) => p.A * k ** alpha * l ** beta;
        const exact = partial(Q, K, L, p.input === 'labour' ? 'y' : 'x', 1e-4);
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-5);
        // The partial elasticity of output with respect to the input is its exponent.
        const level = p.input === 'labour' ? L : K;
        const exponent = p.input === 'labour' ? beta : alpha;
        expect((exact * level) / Q(K, L)).toBeCloseTo(exponent, 5);
        // Readable numbers: whole inputs and output, positive answer, 2 decimals.
        expect(Math.abs(Q(K, L) - Math.round(Q(K, L)))).toBeLessThan(1e-9);
        expect(alpha + beta).toBeLessThanOrEqual(1);
        expect(value).toBeGreaterThan(0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (Q = 4K^0.25 L^0.75 at K = 16, L = 81)', () => {
    const base = { A: 4, alphaQ: 1, betaQ: 3, kRoot: 2, kPower: 4, lRoot: 3, lPower: 4 };
    expect(cobbDouglasMarginalProduct.answer({ ...base, input: 'labour' })).toMatchObject({
      value: 2,
    });
    expect(cobbDouglasMarginalProduct.answer({ ...base, input: 'capital' })).toMatchObject({
      value: 3.38,
    });
  });
});

describe('joint-cost-partial-marginal-cost', () => {
  it('equals the numerical partial derivative of the cost function, and is positive', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(jointCostPartialMarginalCost, seed);
        const C = (x: number, y: number) =>
          p.F + p.a * x * x + p.b * x * y + p.c * y * y + p.d * x + p.e * y;
        expect(Math.abs(value - partial(C, p.x, p.y, p.good))).toBeLessThan(1e-4);
        // Both marginal costs positive: costs rise with each output.
        expect(partial(C, p.x, p.y, 'x')).toBeGreaterThan(0);
        expect(partial(C, p.x, p.y, 'y')).toBeGreaterThan(0);
        // Young's theorem: the mixed partials agree and equal the cross coefficient b.
        const h = 1e-3;
        const cxy =
          (C(p.x + h, p.y + h) - C(p.x + h, p.y - h) - C(p.x - h, p.y + h) + C(p.x - h, p.y - h)) /
          (4 * h * h);
        expect(cxy).toBeCloseTo(p.b, 4);
        expect(Number.isInteger(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (C_x = 80 and C_y = 34 at x = 10, y = 5)', () => {
    const base = { F: 500, a: 3, b: 2, c: 1, d: 10, e: 4, x: 10, y: 5 };
    expect(jointCostPartialMarginalCost.answer({ ...base, good: 'x' })).toMatchObject({
      value: 80,
    });
    expect(jointCostPartialMarginalCost.answer({ ...base, good: 'y' })).toMatchObject({
      value: 34,
    });
  });
});

describe('directional-derivative-utility', () => {
  it('equals the rate of change of utility along a small step in the unit direction', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(directionalDerivativeUtility, seed);
        const U = (x: number, y: number) => x ** p.a * y ** p.b;
        const n = Math.hypot(p.v1, p.v2);
        const [u1, u2] = [p.v1 / n, p.v2 / n];
        const h = 1e-5;
        const along = (U(p.x + h * u1, p.y + h * u2) - U(p.x - h * u1, p.y - h * u2)) / (2 * h);
        expect(Math.abs(value - along)).toBeLessThanOrEqual(0.005 + 1e-5);
        // Never faster than along the gradient: |D_u U| ≤ |∇U|.
        const gx = partial(U, p.x, p.y, 'x');
        const gy = partial(U, p.x, p.y, 'y');
        expect(Math.abs(along)).toBeLessThanOrEqual(Math.hypot(gx, gy) + 1e-6);
        expect(Number.isInteger(n)).toBe(true);
        expect(p.x).toBeGreaterThan(0);
        expect(p.y).toBeGreaterThan(0);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.5);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (U = xy at (4, 6) towards (3, 4): 6.8)', () => {
    const p = { a: 1, b: 1, x: 4, y: 6, v1: 3, v2: 4 };
    expect(directionalDerivativeUtility.answer(p)).toMatchObject({ value: 6.8 });
  });
});
