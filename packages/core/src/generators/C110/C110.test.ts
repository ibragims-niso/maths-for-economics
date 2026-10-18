import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { frontierSlopeImplicit } from './frontier-slope-implicit';
import { indifferenceCurveSlope } from './indifference-curve-slope';
import { isoquantMrts } from './isoquant-mrts';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** The slope of f at x from a symmetric difference quotient. */
const numericSlope = (f: (x: number) => number, x: number, h = 1e-5) =>
  (f(x + h) - f(x - h)) / (2 * h);

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

describe('indifference-curve-slope', () => {
  it('equals the slope of the curve solved explicitly for y, y(x) = (Ū / x^a)^(1/b)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(indifferenceCurveSlope, seed);
        const level = p.x ** p.a * p.y ** p.b;
        const y = (x: number) => (level / x ** p.a) ** (1 / p.b);
        expect(y(p.x)).toBeCloseTo(p.y, 9);
        expect(Math.abs(value - numericSlope(y, p.x))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps utility constant along the tangent to first order, and the curve slopes down', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(indifferenceCurveSlope, seed);
        expect(value).toBeLessThan(0);
        expect(p.x).toBeGreaterThan(0);
        expect(p.y).toBeGreaterThan(0);
        expect(p.a).not.toBe(p.b);
        // Moving along the exact tangent changes utility only by a second-order amount.
        const U = (x: number, y: number) => x ** p.a * y ** p.b;
        const h = 1e-4;
        const exact = -(p.a * p.y) / (p.b * p.x);
        const change = U(p.x + h, p.y + exact * h) - U(p.x, p.y);
        expect(Math.abs(change) / U(p.x, p.y)).toBeLessThan(1e-6);
        expect(codes(distractors)).toEqual(['FORGOT_EXPONENTS', 'INVERTED_RATIO', 'SIGN']);
      }),
      RUNS,
    );
  });

  it('gives −a·y/(b·x) for whole and decimal exponents (fixed numbers)', () => {
    // x²y through (4, 12): dy/dx = −2·12/(1·4) = −6; xy² through (4, 12): −12/(2·4) = −1.5.
    expect(indifferenceCurveSlope.answer({ a: 2, b: 1, x: 4, y: 12 })).toMatchObject({ value: -6 });
    expect(indifferenceCurveSlope.answer({ a: 1, b: 2, x: 4, y: 12 })).toMatchObject({
      value: -1.5,
    });
    expect(indifferenceCurveSlope.answer({ a: 0.3, b: 0.7, x: 14, y: 6 })).toMatchObject({
      value: -0.18,
    });
  });
});

describe('isoquant-mrts', () => {
  it('equals minus the slope of the isoquant solved for K, K(L) = (Q̄ / (A L^α))^(1/β)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(isoquantMrts, seed);
        const qBar = p.A * p.L ** p.alpha * p.K ** p.beta;
        const K = (L: number) => (qBar / (p.A * L ** p.alpha)) ** (1 / p.beta);
        expect(K(p.L)).toBeCloseTo(p.K, 8);
        expect(Math.abs(value + numericSlope(K, p.L))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('is the ratio of marginal products and keeps sensible numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(isoquantMrts, seed);
        const Q = (L: number, K: number) => p.A * L ** p.alpha * K ** p.beta;
        const mpL = numericSlope((L) => Q(L, p.K), p.L);
        const mpK = numericSlope((K) => Q(p.L, K), p.K);
        expect(Math.abs(value - mpL / mpK)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(value).toBeGreaterThanOrEqual(0.2);
        expect(value).toBeLessThanOrEqual(15);
        expect(p.A).toBeGreaterThanOrEqual(2);
        expect(p.alpha).toBeGreaterThan(0);
        expect(p.beta).toBeGreaterThan(0);
        expect(codes(distractors)).toEqual([
          'FORGOT_EXPONENTS',
          'INVERTED_RATIO',
          'SLOPE_NOT_RATE',
          'SWAPPED_EXPONENTS',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C110 (Q = 2L^0.6 K^0.4 at L = 24, K = 40)', () => {
    const p = { A: 2, alpha: 0.6, beta: 0.4, L: 24, K: 40 };
    expect(isoquantMrts.answer(p)).toMatchObject({ kind: 'numeric', value: 2.5 });
    expect(isoquantMrts.distractors(p).map((d) => d.value)).toEqual([-2.5, 0.4, 1.67, 1.11]);
  });
});

describe('frontier-slope-implicit', () => {
  it('equals the slope of the frontier solved for y with the quadratic formula', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(frontierSlopeImplicit, seed);
        const d = p.a * p.x ** 2 + p.b * p.x * p.y + p.c * p.y ** 2;
        // c·y² + (b·x)·y + (a·x² − d) = 0; the positive root is the frontier.
        const y = (x: number) =>
          (-p.b * x + Math.sqrt((p.b * x) ** 2 - 4 * p.c * (p.a * x * x - d))) / (2 * p.c);
        expect(y(p.x)).toBeCloseTo(p.y, 8);
        expect(Math.abs(value - numericSlope(y, p.x))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('is a bounded frontier that slopes down and bends away from the origin', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(frontierSlopeImplicit, seed);
        expect(p.b * p.b).toBeLessThan(4 * p.a * p.c);
        expect(value).toBeLessThan(0);
        const d = p.a * p.x ** 2 + p.b * p.x * p.y + p.c * p.y ** 2;
        expect(d).toBeLessThanOrEqual(20000);
        // Concave: the slope gets steeper as x grows.
        const y = (x: number) =>
          (-p.b * x + Math.sqrt((p.b * x) ** 2 - 4 * p.c * (p.a * x * x - d))) / (2 * p.c);
        expect(numericSlope(y, p.x + 0.5)).toBeLessThan(numericSlope(y, p.x - 0.5));
        expect(codes(distractors)).toEqual([
          'FORGOT_CHAIN',
          'INVERTED_RATIO',
          'MISSED_PRODUCT_RULE',
          'SIGN',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C110 (x² + xy + y² = 1300 at (10, 30) and (30, 10))', () => {
    const p = { a: 1, b: 1, c: 1, x: 10, y: 30 };
    expect(frontierSlopeImplicit.answer(p)).toMatchObject({ kind: 'numeric', value: -0.71 });
    expect(frontierSlopeImplicit.answer({ ...p, x: 30, y: 10 })).toMatchObject({ value: -1.4 });
    expect(frontierSlopeImplicit.stem(p)).toContain('x^2 + xy + y^2 = 1{,}300');
  });
});
