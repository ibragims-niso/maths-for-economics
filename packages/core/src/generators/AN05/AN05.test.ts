import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { banachIterationsNeeded } from './banach-iterations-needed';
import { cournotBestResponseFixedPoint } from './cournot-best-response-fixed-point';
import { linearContractionFixedPoint } from './linear-contraction-fixed-point';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** At most `d` decimals, allowing for floating-point noise. */
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

/** Equal after rounding to 2 decimals. */
const near = (rounded: number, exact: number) => Math.abs(rounded - exact) <= 0.005 + 1e-9;

describe('linear-contraction-fixed-point', () => {
  it('is where the iteration settles from the given start, and the rule leaves it unchanged', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(linearContractionFixedPoint, seed);
        // Run the rule many times from x₀ (no formula for the fixed point is used).
        let x = p.x0;
        for (let t = 0; t < 1500; t++) x = p.a + p.k * x;
        expect(Math.abs(x - value)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Substituting back: f(x*) − x* = (1 − k)(x_exact − x*) is tiny.
        expect(Math.abs(p.a + p.k * value - value)).toBeLessThanOrEqual((1 - p.k) * 0.005 + 1e-9);
        // A contraction, positive and readable numbers.
        expect(Math.abs(p.k)).toBeLessThan(1);
        expect(p.k).not.toBe(0);
        expect(value).toBeGreaterThan(0);
        expect(p.x0).toBeGreaterThan(0);
        expect(p.a).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(hasDecimals(p.k, 2)).toBe(true);
        expect(Number.isInteger(p.x0)).toBe(true);
        if (p.context === 'capital') expect(p.k + p.delta).toBeCloseTo(1, 12);
      }),
      RUNS,
    );
  });

  it('tags the mistakes with the right values', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, distractors } = solve(linearContractionFixedPoint, seed);
        const d = byCode(distractors);
        if (d.INTERCEPT_ONLY !== undefined) expect(d.INTERCEPT_ONLY).toBe(p.a);
        if (d.SIGN_OF_K !== undefined) expect(near(d.SIGN_OF_K, p.a / (1 + p.k))).toBe(true);
        if (d.ONE_ITERATION !== undefined)
          expect(near(d.ONE_ITERATION, p.a + p.k * p.x0)).toBe(true);
        if (d.DIVIDED_BY_K !== undefined) expect(near(d.DIVIDED_BY_K, p.a / p.k)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in AN05 (p ↦ 6 − 0.5p from p₀ = 1: p* = 4)', () => {
    const p = { context: 'price', a: 6, k: -0.5, delta: 0, x0: 1 } as const;
    expect(linearContractionFixedPoint.answer(p)).toMatchObject({ kind: 'numeric', value: 4 });
    expect(byCode(linearContractionFixedPoint.distractors(p))).toEqual({
      INTERCEPT_ONLY: 6,
      SIGN_OF_K: 12,
      ONE_ITERATION: 5.5,
    });
  });
});

describe('banach-iterations-needed', () => {
  it('agrees with the logarithm formula and the bound is met at n but not at n − 1', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(banachIterationsNeeded, seed);
        const byLogs = Math.ceil(Math.log((p.eps * (1 - p.k)) / p.d) / Math.log(p.k));
        expect(value).toBe(byLogs);
        expect((p.k ** value / (1 - p.k)) * p.d).toBeLessThanOrEqual(p.eps);
        expect((p.k ** (value - 1) / (1 - p.k)) * p.d).toBeGreaterThan(p.eps);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(3);
        expect(p.k).toBeGreaterThan(0);
        expect(p.k).toBeLessThan(1);
        expect(p.d).toBeGreaterThan(1);
      }),
      RUNS,
    );
  });

  it('is sharp: on the map x ↦ kx the actual error after n rounds is exactly the bound', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(banachIterationsNeeded, seed);
        // Start where the first step has size d; the fixed point is 0.
        let x = p.d / (1 - p.k);
        expect(Math.abs(p.k * x - x)).toBeCloseTo(p.d, 9);
        let first = -1;
        for (let n = 0; n <= 400; n++) {
          if (Math.abs(x) <= p.eps) {
            first = n;
            break;
          }
          x *= p.k;
        }
        expect(first).toBe(value);
      }),
      RUNS,
    );
  });

  it('tags the mistakes with the right values', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(banachIterationsNeeded, seed);
        const d = byCode(distractors);
        const ceilLog = (target: number) =>
          Math.max(0, Math.ceil(Math.log(target) / Math.log(p.k)));
        if (d.ROUNDED_DOWN !== undefined) expect(d.ROUNDED_DOWN).toBe(value - 1);
        if (d.FORGOT_FACTOR !== undefined) expect(d.FORGOT_FACTOR).toBe(ceilLog(p.eps / p.d));
        if (d.IGNORED_FIRST_STEP !== undefined)
          expect(d.IGNORED_FIRST_STEP).toBe(ceilLog(p.eps * (1 - p.k)));
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in AN05 (β = 0.9, d = 20, ε = 0.05: n = 79)', () => {
    const p = { context: 'value', k: 0.9, d: 20, eps: 0.05 } as const;
    expect(banachIterationsNeeded.answer(p)).toMatchObject({ kind: 'numeric', value: 79 });
    expect(byCode(banachIterationsNeeded.distractors(p))).toEqual({
      ROUNDED_DOWN: 78,
      FORGOT_FACTOR: 57,
      IGNORED_FIRST_STEP: 51,
    });
  });
});

describe('cournot-best-response-fixed-point', () => {
  const profit = (price: number, cost: number, q: number) => (price - cost) * q;

  it('is a Nash equilibrium: each output beats nearby outputs against the other', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cournotBestResponseFixedPoint, seed);
        const q1 = value;
        const q2 = (p.A - p.c2 - p.b * q1) / (2 * p.b);
        const pi1 = (x: number) => profit(p.A - p.b * (x + q2), p.c1, x);
        const pi2 = (x: number) => profit(p.A - p.b * (q1 + x), p.c2, x);
        for (const h of [0.01, 0.5, 3]) {
          expect(pi1(q1)).toBeGreaterThan(pi1(q1 + h));
          expect(pi1(q1)).toBeGreaterThan(pi1(q1 - h));
          expect(pi2(q2)).toBeGreaterThan(pi2(q2 + h));
          expect(pi2(q2)).toBeGreaterThan(pi2(q2 - h));
        }
        // Positive outputs, a price above both costs, a whole-number answer.
        const price = p.A - p.b * (q1 + q2);
        expect(q1).toBeGreaterThan(0);
        expect(q2).toBeGreaterThan(0);
        expect(price).toBeGreaterThan(Math.max(p.c1, p.c2));
        expect(Number.isInteger(q1)).toBe(true);
        expect(Number.isInteger(q2)).toBe(true);
        expect(p.c1).not.toBe(p.c2);
      }),
      RUNS,
    );
  });

  it('is where best-response iteration settles from zero output', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cournotBestResponseFixedPoint, seed);
        const br = (cost: number, rival: number) =>
          Math.max(0, (p.A - cost - p.b * rival) / (2 * p.b));
        let q1 = 0;
        for (let t = 0; t < 60; t++) q1 = br(p.c1, br(p.c2, q1));
        expect(Math.abs(q1 - value)).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('tags the mistakes with the right values', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, distractors } = solve(cournotBestResponseFixedPoint, seed);
        const d = byCode(distractors);
        if (d.BEST_RESPONSE_TO_ZERO !== undefined)
          expect(d.BEST_RESPONSE_TO_ZERO).toBeCloseTo((p.A - p.c1) / (2 * p.b), 9);
        if (d.IGNORED_RIVAL_COST !== undefined)
          expect(near(d.IGNORED_RIVAL_COST, (p.A - p.c1) / (3 * p.b))).toBe(true);
        if (d.OTHER_FIRM !== undefined)
          expect(d.OTHER_FIRM).toBeCloseTo((p.A - 2 * p.c2 + p.c1) / (3 * p.b), 2);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in AN05 (P = 100 − Q, costs 10 and 16: q₁* = 32)', () => {
    const p = { A: 100, b: 1, c1: 10, c2: 16 };
    expect(cournotBestResponseFixedPoint.answer(p)).toMatchObject({ kind: 'numeric', value: 32 });
    expect(byCode(cournotBestResponseFixedPoint.distractors(p))).toEqual({
      BEST_RESPONSE_TO_ZERO: 45,
      IGNORED_RIVAL_COST: 30,
      SIGN_OF_K: 19.2,
      OTHER_FIRM: 26,
    });
  });
});
