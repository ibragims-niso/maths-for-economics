import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { constantReturnsWageBill } from './constant-returns-wage-bill';
import { eulerMarginalProductLabour } from './euler-marginal-product-labour';
import { scaledInputsOutput } from './scaled-inputs-output';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Central-difference partial derivative: nudge one input, keep the other fixed. */
const partial = (
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  wrt: 'x' | 'y',
  h = 1e-4,
) => (wrt === 'x' ? (f(x + h, y) - f(x - h, y)) / (2 * h) : (f(x, y + h) - f(x, y - h)) / (2 * h));

describe('scaled-inputs-output', () => {
  it('equals the current output times the ratio f(tK, tL) / f(K, L) at an arbitrary input mix', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(scaledInputsOutput, seed);
        const term = (c: number, a10: number, b10: number) => (K: number, L: number) =>
          c * K ** (a10 / 10) * L ** (b10 / 10);
        const t1 = term(p.first.c, p.first.a10, p.first.b10);
        const t2 = term(p.second.c, p.second.a10, p.second.b10);
        const f = (K: number, L: number) => t1(K, L) + (p.form === 'sum' ? t2(K, L) : 0);
        // Homogeneity does not depend on where you start: try two unrelated input mixes.
        for (const [K, L] of [
          [7.3, 11.9],
          [40, 2.5],
        ] as const) {
          const ratio = f(p.t * K, p.t * L) / f(K, L);
          expect(Math.abs(value - p.q0 * ratio)).toBeLessThanOrEqual(0.005 + 1e-6);
        }
        // Both terms of a sum have the same degree, and the first term has both inputs.
        expect(p.first.a10).toBeGreaterThan(0);
        expect(p.first.b10).toBeGreaterThan(0);
        if (p.form === 'sum') {
          expect(p.second.a10 + p.second.b10).toBe(p.first.a10 + p.first.b10);
          expect(p.second.a10).not.toBe(p.first.a10);
        }
        expect(value).toBeGreaterThan(p.q0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (Q = 4K^0.3 L^0.9, 500 units, inputs doubled: 1148.70)', () => {
    const p = {
      form: 'product' as const,
      first: { c: 4, a10: 3, b10: 9 },
      second: { c: 1, a10: 0, b10: 12 },
      t: 2,
      q0: 500,
    };
    expect(scaledInputsOutput.answer(p)).toMatchObject({ value: 1148.7 });
    const codes = scaledInputsOutput.distractors(p);
    expect(codes).toContainEqual({ value: 1000, mistakeCode: 'CRS_ASSUMED' });
  });
});

describe('constant-returns-wage-bill', () => {
  it('equals L times the value of the numerical marginal product, and adds up with capital to revenue', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(constantReturnsWageBill, seed);
        const alpha = p.alphaQ / 4;
        const K = p.kRoot ** p.kPower;
        const L = p.lRoot ** p.lPower;
        const Q = (k: number, l: number) => p.A * k ** alpha * l ** (1 - alpha);
        const mpl = partial(Q, K, L, 'y');
        const mpk = partial(Q, K, L, 'x');
        expect(Math.abs(value - p.P * mpl * L)).toBeLessThan(0.01);
        // Product exhaustion: paying both inputs the value of their marginal products uses up revenue.
        expect(p.P * (K * mpk + L * mpl)).toBeCloseTo(p.P * Q(K, L), 3);
        // Readable: whole output, positive answer with at most 2 decimals.
        expect(Math.abs(Q(K, L) - Math.round(Q(K, L)))).toBeLessThan(1e-9);
        expect(value).toBeGreaterThan(0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (Q = 10K^0.25 L^0.75, K = 16, L = 81, P = 2: 810)', () => {
    const p = { A: 10, alphaQ: 1, kRoot: 2, kPower: 4, lRoot: 3, lPower: 4, P: 2 };
    expect(constantReturnsWageBill.answer(p)).toMatchObject({ value: 810 });
  });
});

describe('euler-marginal-product-labour', () => {
  it('equals ∂Q/∂L of a degree-k Cobb–Douglas that matches the given Q and MP_K', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(eulerMarginalProductLabour, seed);
        const k = p.k10 / 10;
        const mpk = p.mpk100 / 100;
        // Build a technology with these numbers: α = K·MP_K/Q, β = k − α, A from Q.
        const alpha = (p.K * mpk) / p.Q;
        const beta = k - alpha;
        expect(alpha).toBeGreaterThan(0);
        expect(beta).toBeGreaterThan(0);
        const A = p.Q / (p.K ** alpha * p.L ** beta);
        const f = (K: number, L: number) => A * K ** alpha * L ** beta;
        expect(f(p.K, p.L)).toBeCloseTo(p.Q, 6);
        expect(partial(f, p.K, p.L, 'x', 1e-3)).toBeCloseTo(mpk, 4);
        // Homogeneous of degree k: doubling the inputs multiplies output by 2^k.
        expect(f(2 * p.K, 2 * p.L) / p.Q).toBeCloseTo(2 ** k, 9);
        const exact = partial(f, p.K, p.L, 'y', 1e-3);
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-5);
        expect(value).toBeGreaterThan(0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(hasAtMostDecimals(mpk, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (degree 1.2, K = 50, L = 200, Q = 1000, MP_K = 6: 4.5)', () => {
    const p = { k10: 12, K: 50, L: 200, Q: 1000, mpk100: 600 };
    expect(eulerMarginalProductLabour.answer(p)).toMatchObject({ value: 4.5 });
    expect(eulerMarginalProductLabour.distractors(p)).toContainEqual({
      value: 3.5,
      mistakeCode: 'FORGOT_DEGREE',
    });
  });
});
