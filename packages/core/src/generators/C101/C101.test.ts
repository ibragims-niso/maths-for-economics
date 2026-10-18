import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { continuousTariffParameter } from './continuous-tariff-parameter';
import { limitByCancelling } from './limit-by-cancelling';
import { longRunCostRatio } from './long-run-cost-ratio';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, stem: pr.stem };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Turns the LaTeX polynomial shown to the student ("x^2 + 3x - 40") into a function of x. */
function polynomialFromLatex(latex: string): (x: number) => number {
  const js = latex.replace(/\{,\}/g, '').replace(/x\^2/g, 'x**2').replace(/(\d)x/g, '$1*x');
  return new Function('x', `return ${js};`) as (x: number) => number;
}

describe('limit-by-cancelling', () => {
  it('matches the function in the stem evaluated just left and right of the point', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(limitByCancelling, seed);
        const match = /\\frac\{(.+?)\}\{x - (\d+)\}/.exec(stem);
        if (!match?.[1] || !match[2]) throw new Error(`stem not understood: ${stem}`);
        const top = polynomialFromLatex(match[1]);
        const a = Number(match[2]);
        expect(a).toBe(p.a);
        // A genuine 0/0 form: the numerator vanishes at the point.
        expect(top(a)).toBeCloseTo(0, 9);
        const f = (x: number) => top(x) / (x - a);
        const h = 1e-6;
        expect(Math.abs(f(a - h) - value)).toBeLessThan(1e-4);
        expect(Math.abs(f(a + h) - value)).toBeLessThan(1e-4);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).not.toBe(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C101 ((x² + 3x − 40)/(x − 5) as x → 5)', () => {
    const p = { a: 5, b: 8 };
    expect(limitByCancelling.stem(p)).toContain('x^2 + 3x - 40');
    expect(limitByCancelling.answer(p)).toEqual({ kind: 'numeric', value: 13, decimals: 2 });
  });
});

describe('long-run-cost-ratio', () => {
  it('agrees with the cost ratio at a very large output, with positive costs', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(longRunCostRatio, seed);
        const C = (c: { F: number; v: number; w: number }, q: number) =>
          c.F + c.v * q + c.w * q * q;
        for (const q of [0, 1, 10, 100]) {
          expect(C(p.A, q)).toBeGreaterThan(0);
          expect(C(p.B, q)).toBeGreaterThan(0);
        }
        // The ratio settles down: at q = 10⁸ it is within 10⁻⁵ of the limit.
        const big = 1e8;
        expect(Math.abs(C(p.A, big) / C(p.B, big) - value)).toBeLessThan(1e-5);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(value).not.toBe(1);
        expect(stem.includes('2 decimal places')).toBe(!Number.isInteger(value));
      }),
      RUNS,
    );
  });

  it('gives 1.5 for the two firms in the C101 text', () => {
    const p = { A: { F: 900, v: 40, w: 3 }, B: { F: 1600, v: 10, w: 2 } };
    expect(longRunCostRatio.answer(p)).toEqual({ kind: 'numeric', value: 1.5, decimals: 2 });
  });
});

describe('continuous-tariff-parameter', () => {
  it('closes the gap at the threshold, and any other k leaves a jump', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(continuousTariffParameter, seed);
        const bill = (k: number, q: number) =>
          q <= p.threshold ? p.fee + p.price1 * q : k + p.price2 * q;
        const h = 1e-9;
        const gap = (k: number) => bill(k, p.threshold + h) - bill(k, p.threshold);
        expect(Math.abs(gap(value))).toBeLessThan(1e-6);
        expect(Math.abs(gap(value + 1))).toBeGreaterThan(0.99);
        expect(Math.abs(gap(value - 1))).toBeGreaterThan(0.99);
        // A volume discount: cheaper units above the threshold, so k is above the fee.
        expect(p.price2).toBeLessThan(p.price1);
        expect(p.price2).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(p.fee);
        expect(Number.isInteger(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C101 (20 + 4q up to 10 GB, k + 2q above)', () => {
    const setting = { seller: 'A mobile operator', units: 'GB' };
    const p = { setting, fee: 20, price1: 4, price2: 2, threshold: 10 };
    expect(continuousTariffParameter.answer(p)).toEqual({
      kind: 'numeric',
      value: 40,
      decimals: 2,
    });
  });
});
