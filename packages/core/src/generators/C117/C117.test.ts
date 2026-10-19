import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { infiniteGeometricSeriesSum } from './infinite-geometric-series-sum';
import { maclaurinPartialSumEstimate, pointOf } from './maclaurin-partial-sum-estimate';
import { powerSeriesRadius } from './power-series-radius';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

/** True when x has at most `d` decimal places (up to floating-point noise). */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('infinite-geometric-series-sum', () => {
  it('equals the series added term by term until the terms are negligible', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(infiniteGeometricSeriesSum, seed);
        // Add the payments (or monthly sales) one by one, discounting year by year.
        let sum = 0;
        let term = p.amount;
        const factor = p.kind === 'rent' ? 1 / (1 + p.rate / 100) : p.share;
        if (p.start === 1) term *= factor;
        for (let t = 0; t < 20000 && term > 1e-9; t++) {
          sum += term;
          term *= factor;
        }
        expect(Math.abs(value - sum)).toBeLessThan(0.006);
        expect(value).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        // A rent's present value is a whole number: C/r, plus C if a payment is due today.
        if (p.kind === 'rent') expect(Number.isInteger(value)).toBe(true);
        expect(factor).toBeLessThan(1);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('draws both stories and both starting points', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const { p } = solve(infiniteGeometricSeriesSum, seed);
      seen.add(`${p.kind}${p.start}`);
    }
    expect([...seen].sort()).toEqual(['fade0', 'fade1', 'rent0', 'rent1']);
  });

  it('reproduces worked example 1 in C117 (rent 6000 for ever at 4 %: 150,000)', () => {
    const p = { kind: 'rent', amount: 6000, rate: 4, share: 0, start: 1 } as const;
    expect(infiniteGeometricSeriesSum.answer(p)).toMatchObject({ value: 150000 });
    expect(infiniteGeometricSeriesSum.distractors(p).map((d) => d.value)).toEqual([
      156000, 5769.23, 2941.18,
    ]);
  });
});

describe('maclaurin-partial-sum-estimate', () => {
  it('equals the Taylor polynomial built from numerical derivatives at 0', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(maclaurinPartialSumEstimate, seed);
        const x = pointOf(p);
        // Derivatives at 0 by first principles from the function itself, not from known formulas.
        const f = p.fn === 'exp' ? Math.exp : (t: number) => Math.log(1 + t);
        const h = 0.01;
        const d = [
          f(0),
          (f(h) - f(-h)) / (2 * h),
          (f(h) - 2 * f(0) + f(-h)) / h ** 2,
          (f(2 * h) - 2 * f(h) + 2 * f(-h) - f(-2 * h)) / (2 * h ** 3),
          (f(2 * h) - 4 * f(h) + 6 * f(0) - 4 * f(-h) + f(-2 * h)) / h ** 4,
        ];
        const first = p.fn === 'exp' ? 0 : 1;
        let poly = 0;
        let fact = 1;
        for (let k = 0; k < first + p.terms; k++) {
          if (k > 0) fact *= k;
          if (k >= first) poly += ((d[k] ?? 0) * x ** k) / fact;
        }
        expect(Math.abs(value - poly)).toBeLessThan(0.0006);
        expect(hasDecimals(value, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('is within the size of the first term left out (plus rounding) of the true value', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(maclaurinPartialSumEstimate, seed);
        const x = pointOf(p);
        const truth = p.fn === 'exp' ? Math.exp(x) : Math.log(1 + x);
        const n = p.terms;
        let fact = 1;
        for (let k = 2; k <= n; k++) fact *= k;
        // eˣ: Lagrange remainder ≤ e^max(x,0)·|x|ⁿ/n!; ln(1 + x), 0 < x < 1: alternating series bound.
        const bound =
          p.fn === 'exp'
            ? (Math.exp(Math.max(x, 0)) * Math.abs(x) ** n) / fact
            : x ** (n + 1) / (n + 1);
        expect(Math.abs(value - truth)).toBeLessThanOrEqual(bound + 0.00005);
        expect(Math.abs(x)).toBeGreaterThan(0);
        expect(Math.abs(x)).toBeLessThanOrEqual(1);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        // The stem asks about the same point the answer uses.
        const shown =
          p.fn === 'exp' ? `e^{${Number(x.toFixed(2))}}` : `\\ln(${Number((1 + x).toFixed(2))})`;
        expect(stem).toContain(shown);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C117 (three terms for ln 1.06: 0.058272 ≈ 0.0583)', () => {
    const p = { fn: 'ln', rate: 6, years: 1, sign: 1, terms: 3 } as const;
    expect(maclaurinPartialSumEstimate.answer(p)).toMatchObject({ value: 0.0583 });
  });
});

describe('power-series-radius', () => {
  /** log |aₙ| of the coefficient of (x − c)ⁿ, with x²ⁿ counted as (x²)ⁿ for the even form. */
  const logCoefficient = (p: { form: string; k: number; p: number }, n: number) => {
    if (p.form === 'shrinking') return p.p * Math.log(n) - n * Math.log(p.k);
    if (p.form === 'growing') return n * Math.log(p.k) - p.p * Math.log(n);
    return p.p * Math.log(n) - n * Math.log(p.k);
  };

  it('agrees with the root test on the coefficients, |aₙ|^(−1/n) for large n', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(powerSeriesRadius, seed);
        const n = 1e7;
        let R = Math.exp(-logCoefficient(p, n) / n);
        if (p.form === 'even') R = Math.sqrt(R); // the series is in x², so |x|² < R
        expect(Math.abs(R - value)).toBeLessThan(0.001);
        expect(value).toBeGreaterThan(0);
        expect(hasDecimals(value, 3)).toBe(true);
      }),
      RUNS,
    );
  });

  it('has terms that die out just inside R and blow up just outside', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: R, distractors } = solve(powerSeriesRadius, seed);
        const n = 5000;
        const logTerm = (dist: number) =>
          logCoefficient(p, n) + n * (p.form === 'even' ? 2 : 1) * Math.log(dist);
        expect(logTerm(0.95 * R)).toBeLessThan(-20);
        expect(logTerm(1.05 * R)).toBeGreaterThan(20);
        expect(distractors.length).toBe(2);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });
});
