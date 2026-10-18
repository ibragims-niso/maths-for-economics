import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cubicCostInflectionOutput } from './cubic-cost-inflection-output';
import { peakMarginalProduct } from './peak-marginal-product';
import { secondDerivativeAtPoint } from './second-derivative-at-point';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/**
 * Second derivative by a central second difference, (f(x+h) − 2f(x) + f(x−h))/h²: a numerical
 * route that uses only values of f, independent of any differentiation rule.
 */
const numericSecond = (f: (x: number) => number, x: number, h = 1e-3) =>
  (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);

describe('second-derivative-at-point', () => {
  it('matches the numerical second difference of the function itself', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(secondDerivativeAtPoint, seed);
        if (p.kind === 'cost') {
          const C = (q: number) => p.fixedCost + p.a * q - p.b * q * q + p.c * q ** 3;
          expect(Math.abs(value - numericSecond(C, p.q0))).toBeLessThan(1e-3);
        } else {
          const Q = (L: number) => p.A * L ** (p.n / p.d);
          const L0 = p.r ** p.d;
          expect(Math.abs(value - numericSecond(Q, L0))).toBeLessThan(1e-3 * Math.max(1, -value));
        }
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive MC, falling MP, at most 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(secondDerivativeAtPoint, seed);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        if (p.kind === 'cost') {
          // Marginal cost stays positive at every output from 0 to 100.
          let lowest = Number.POSITIVE_INFINITY;
          for (let q = 0; q <= 100; q += 0.5) {
            lowest = Math.min(lowest, p.a - 2 * p.b * q + 3 * p.c * q * q);
          }
          expect(lowest).toBeGreaterThan(0);
          expect(p.q0).toBeGreaterThan(0);
        } else {
          // Diminishing marginal returns: Q″ < 0 for 0 < α < 1, and the numbers stay readable.
          expect(p.n).toBeLessThan(p.d);
          expect(value).toBeLessThanOrEqual(-0.05);
          expect(Number.isInteger(p.A)).toBe(true);
          expect(p.A).toBeGreaterThanOrEqual(10);
          expect(p.A).toBeLessThanOrEqual(600);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C108 (Q = 40√L at L = 4)', () => {
    const p = { kind: 'production', A: 40, n: 1, d: 2, r: 2 } as const;
    expect(secondDerivativeAtPoint.answer(p)).toMatchObject({ kind: 'numeric', value: -1.25 });
    const codes = secondDerivativeAtPoint.distractors(p);
    expect(codes).toContainEqual({ value: 10, mistakeCode: 'FIRST_DERIVATIVE' });
    expect(codes).toContainEqual({ value: 1.25, mistakeCode: 'SIGN' });
  });

  it('gives C″(5) = −3 for the cost curve of worked example 2', () => {
    const p = { kind: 'cost', fixedCost: 200, a: 36, b: 3, c: 0.1, q0: 5 } as const;
    expect(secondDerivativeAtPoint.answer(p)).toMatchObject({ kind: 'numeric', value: -3 });
  });
});

describe('cubic-cost-inflection-output', () => {
  it('is where marginal cost is lowest, found by scanning outputs', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cubicCostInflectionOutput, seed);
        const MC = (q: number) => p.a - 2 * p.b * q + 3 * p.c * q * q;
        let best = 0;
        for (let q = 0; q <= 100; q += 0.25) if (MC(q) < MC(best)) best = q;
        expect(Math.abs(best - value)).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('is where the cost curve turns from concave to convex (sign of the second difference)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cubicCostInflectionOutput, seed);
        const C = (q: number) => p.fixedCost + p.a * q - p.b * q * q + p.c * q ** 3;
        expect(numericSecond(C, value - 1)).toBeLessThan(0);
        expect(numericSecond(C, value + 1)).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: whole output, positive marginal cost, short coefficients', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(cubicCostInflectionOutput, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.a - 2 * p.b * value + 3 * p.c * value * value).toBeGreaterThan(0);
        expect(twoDecimals(p.b)).toBe(true);
        expect(distractors.length).toBe(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C108 (C = 200 + 36Q − 3Q² + 0.1Q³)', () => {
    const p = { fixedCost: 200, a: 36, b: 3, c: 0.1, best: 10 };
    expect(cubicCostInflectionOutput.answer(p)).toMatchObject({ kind: 'numeric', value: 10 });
  });
});

describe('peak-marginal-product', () => {
  it('is the steepest numerical slope of output over a fine grid of labour', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(peakMarginalProduct, seed);
        const Q = (L: number) => p.a * L * L - p.b * L ** 3;
        const h = 1e-4;
        let top = Number.NEGATIVE_INFINITY;
        let at = 0;
        for (let L = 0; L <= 2 * p.onset; L += 0.25) {
          const mp = (Q(L + h) - Q(L - h)) / (2 * h);
          if (mp > top) [top, at] = [mp, L];
        }
        expect(Math.abs(at - p.onset)).toBeLessThan(1e-9);
        expect(Math.abs(top - value)).toBeLessThan(1e-3 * Math.max(1, value));
      }),
      RUNS,
    );
  });

  it('is convex before the onset and concave after it, and output still rises up to 2L*', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(peakMarginalProduct, seed);
        const Q = (L: number) => p.a * L * L - p.b * L ** 3;
        // Convex: the chord from 0 to L* lies above the graph; concave: from L* to 2L* it lies below.
        expect((Q(0) + Q(p.onset)) / 2).toBeGreaterThan(Q(p.onset / 2));
        expect((Q(p.onset) + Q(2 * p.onset)) / 2).toBeLessThan(Q(1.5 * p.onset));
        expect(Q(2 * p.onset)).toBeGreaterThan(Q(2 * p.onset - 1));
        expect(value).toBeGreaterThan(0);
        expect(twoDecimals(value)).toBe(true);
        expect(twoDecimals(p.a)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C108 (Q = 6L² − 0.1L³)', () => {
    const p = { a: 6, b: 0.1, onset: 20 };
    expect(peakMarginalProduct.answer(p)).toMatchObject({ kind: 'numeric', value: 120 });
    expect(peakMarginalProduct.distractors(p)).toEqual([
      { value: 20, mistakeCode: 'LABOUR_NOT_MP' },
      { value: 1600, mistakeCode: 'OUTPUT_NOT_MP' },
      { value: 80, mistakeCode: 'AVERAGE_NOT_MARGINAL' },
    ]);
  });
});
