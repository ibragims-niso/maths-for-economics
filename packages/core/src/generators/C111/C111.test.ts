import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { type ApproxFn, value } from './approx-functions';
import { compoundGrowthQuadraticApproximation } from './compound-growth-quadratic-approximation';
import { linearApproximationEstimate } from './linear-approximation-estimate';
import { quadraticApproximationEstimate } from './quadratic-approximation-estimate';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most `d` decimal places. */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** First and second derivatives from difference quotients (first principles), not from formulas. */
const d1 = (f: (x: number) => number, x: number, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
const d2 = (f: (x: number) => number, x: number, h = 1e-3) =>
  (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);

const f = (fn: ApproxFn) => (x: number) => value(fn, x);

describe('linear-approximation-estimate', () => {
  it('equals f(a) + f′(a)h with the slope found from a difference quotient', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: ans } = solve(linearApproximationEstimate, seed);
        const fx = f(p.fn);
        expect(Math.abs(ans - (fx(p.a) + d1(fx, p.a) * p.h))).toBeLessThan(0.00006);
        expect(hasDecimals(ans, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('is close to the true value, with an error about ½|f″(a)|h²', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: ans } = solve(linearApproximationEstimate, seed);
        const fx = f(p.fn);
        const err = Math.abs(ans - fx(p.a + p.h));
        // The error is close to the size of the next Taylor term (within 50 %, plus rounding).
        const next = 0.5 * Math.abs(d2(fx, p.a)) * p.h ** 2;
        expect(err).toBeLessThan(1.5 * next + 0.00006);
        expect(err).toBeGreaterThan(0.5 * next - 0.00006);
        // A nice point and a small step: roots and logs of positive numbers only, step at most
        // 15 % of a (or 0.2 for ln and exp).
        if (p.fn !== 'exp') expect(p.a + p.h).toBeGreaterThan(0);
        expect(Math.abs(p.h)).toBeLessThanOrEqual(Math.max(0.2, 0.15 * p.a) + 1e-9);
        expect(p.h).not.toBe(0);
      }),
      RUNS,
    );
  });

  it('asks about the number a + h exactly as the stem prints it', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const pr = makeProblem(linearApproximationEstimate, seed);
        const p = pr.params;
        const shown = /estimate \$(?:\\sqrt(?:\[3\])?\{|\\ln\(|e\^\{)(-?[\d.]+)/.exec(pr.stem)?.[1];
        expect(Number(shown)).toBeCloseTo(p.a + p.h, 9);
      }),
      RUNS,
    );
  });

  it('returns at least three named mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { distractors } = solve(linearApproximationEstimate, seed);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        for (const d of distractors) {
          expect(['VALUE_ONLY', 'CHANGE_ONLY', 'SLOPE_AT_NEW_POINT', 'EXACT_VALUE']).toContain(
            d.mistakeCode,
          );
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C111 (√104 ≈ 10.2, so 10√104 ≈ 102)', () => {
    const p = { fn: 'sqrt', a: 100, h: 4 } as const;
    expect(linearApproximationEstimate.answer(p)).toMatchObject({ kind: 'numeric', value: 10.2 });
    expect(10 * value('sqrt', 104)).toBeCloseTo(101.9804, 4);
  });

  it('reproduces the ln(1 + r) ≈ r rule of Example 3 (ln 1.1 ≈ 0.1)', () => {
    const p = { fn: 'ln', a: 1, h: 0.1 } as const;
    expect(linearApproximationEstimate.answer(p)).toMatchObject({ value: 0.1 });
  });
});

describe('compound-growth-quadratic-approximation', () => {
  it('equals P(g(0) + g′(0)r + ½g″(0)r²) with derivatives of g(r) = (1 + r)ⁿ found numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: ans } = solve(compoundGrowthQuadraticApproximation, seed);
        const g = (r: number) => (1 + r) ** p.years;
        const r = p.rate / 100;
        const viaSlopes = p.principal * (g(0) + d1(g, 0) * r + 0.5 * d2(g, 0, 1e-3) * r * r);
        expect(Math.abs(ans - viaSlopes)).toBeLessThan(0.05);
        expect(hasDecimals(ans, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('matches the first three terms of the year-by-year expansion and stays below the true amount', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: ans } = solve(compoundGrowthQuadraticApproximation, seed);
        const r = p.rate / 100;
        // Count pairs of years directly: interest from year i earns interest in year j > i.
        let pairs = 0;
        for (let i = 1; i <= p.years; i++) for (let j = i + 1; j <= p.years; j++) pairs++;
        expect(ans).toBeCloseTo(p.principal * (1 + p.years * r + pairs * r * r), 6);
        // Grow the deposit year by year: every left-out term is positive, so the estimate is lower.
        let balance = p.principal;
        for (let y = 0; y < p.years; y++) balance *= 1 + r;
        expect(ans).toBeLessThanOrEqual(balance + 1e-9);
        expect(ans).toBeGreaterThan(p.principal * (1 + p.years * r));
        expect(p.principal).toBeGreaterThan(0);
        expect(p.rate * p.years).toBeLessThanOrEqual(60);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C111 (2000 at 4 % for 6 years ≈ 2528)', () => {
    const p = { principal: 2000, rate: 4, years: 6 };
    expect(compoundGrowthQuadraticApproximation.answer(p)).toMatchObject({ value: 2528 });
    expect(compoundGrowthQuadraticApproximation.distractors(p).map((d) => d.value)).toEqual([
      2480, 2576, 2537.6, 2530.64,
    ]);
  });
});

describe('quadratic-approximation-estimate', () => {
  it('equals f(a) + f′(a)h + ½f″(a)h² with both derivatives found numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: ans } = solve(quadraticApproximationEstimate, seed);
        const fx = f(p.fn);
        const viaSlopes = fx(p.a) + d1(fx, p.a) * p.h + 0.5 * d2(fx, p.a) * p.h ** 2;
        expect(Math.abs(ans - viaSlopes)).toBeLessThan(0.0001);
        expect(hasDecimals(ans, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('beats the tangent line: closer to the true value than f(a) + f′(a)h', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: ans } = solve(quadraticApproximationEstimate, seed);
        const fx = f(p.fn);
        const truth = fx(p.a + p.h);
        const linear = fx(p.a) + d1(fx, p.a) * p.h;
        expect(Math.abs(ans - truth)).toBeLessThan(Math.abs(linear - truth));
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in C111 (ln 1.1 ≈ 0.1 − 0.005 = 0.095)', () => {
    const p = { fn: 'ln', a: 1, h: 0.1 } as const;
    expect(quadraticApproximationEstimate.answer(p)).toMatchObject({ value: 0.095 });
    expect(quadraticApproximationEstimate.distractors(p).map((d) => d.mistakeCode)).toEqual([
      'LINEAR_ONLY',
      'FORGOT_HALF',
      'SECOND_ORDER_SIGN',
      'FORGOT_SQUARE',
    ]);
  });
});
