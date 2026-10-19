import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { presentValueGrowingStream } from './present-value-growing-stream';
import { substitutionTotalFromMarginal } from './substitution-total-from-marginal';
import { totalOutputLogRate } from './total-output-log-rate';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Simpson's rule on the original integrand: a different route from substitution and parts. */
const integrate = (f: (x: number) => number, a: number, b: number, n = 2000) => {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
};

describe('substitution-total-from-marginal', () => {
  it('equals the numerical integral of the marginal function from 0 to b', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(substitutionTotalFromMarginal, seed);
        const marginal =
          p.form === 'root'
            ? (q: number) => p.a * q * Math.sqrt(q * q + p.c)
            : (q: number) => (p.a * q) / (q * q + p.c);
        expect(Math.abs(value - integrate(marginal, 0, p.b))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(p.a).toBeGreaterThan(0);
        expect(p.b).toBeGreaterThan(0);
        expect(p.c).toBeGreaterThan(0);
        expect(value).toBeGreaterThanOrEqual(2);
        if (p.form === 'root') {
          // Both limits of u = Q² + c are perfect squares, so u^(3/2) is a whole number.
          expect(Number.isInteger(Math.sqrt(p.c))).toBe(true);
          expect(Number.isInteger(Math.sqrt(p.b * p.b + p.c))).toBe(true);
        }
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (MC = 6Q√(Q² + 16) from 0 to 3: 122)', () => {
    const p = { form: 'root', a: 6, c: 16, b: 3 } as const;
    expect(substitutionTotalFromMarginal.answer(p)).toMatchObject({ value: 122 });
    const codes = substitutionTotalFromMarginal.distractors(p);
    expect(codes).toContainEqual({ value: 54, mistakeCode: 'FORGOT_LIMITS' });
    expect(codes).toContainEqual({ value: 244, mistakeCode: 'FORGOT_DU_FACTOR' });
  });
});

describe('present-value-growing-stream', () => {
  it('equals the numerically discounted stream and is below the undiscounted total', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(presentValueGrowingStream, seed);
        const r = p.rate / 100;
        const pv = integrate((t) => (p.start + p.growth * t) * Math.exp(-r * t), 0, p.years);
        expect(Math.abs(value - pv)).toBeLessThanOrEqual(0.005 + 1e-6);
        const undiscounted = integrate((t) => p.start + p.growth * t, 0, p.years);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(undiscounted);
        // Each year's income is worth at least its value discounted from the end of the stream.
        expect(value).toBeGreaterThan(undiscounted * Math.exp(-r * p.years));
        expect(p.rate).toBeGreaterThanOrEqual(2);
        expect(p.rate).toBeLessThanOrEqual(12);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (100 + 20t, 5 %, 10 years: 1508.57)', () => {
    const p = { start: 100, growth: 20, rate: 5, years: 10 };
    expect(presentValueGrowingStream.answer(p)).toMatchObject({ value: 1508.57 });
    expect(presentValueGrowingStream.distractors(p)).toContainEqual({
      value: 2000,
      mistakeCode: 'NO_DISCOUNTING',
    });
  });
});

describe('total-output-log-rate', () => {
  it('equals the numerical integral of a·ln(1 + t) from 0 to T', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(totalOutputLogRate, seed);
        const exact = integrate((t) => p.a * Math.log(1 + t), 0, p.years);
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(value).toBeGreaterThan(0);
        // Output rate rises, so the total lies between 0 and T times the final rate.
        expect(value).toBeLessThan(p.years * p.a * Math.log(1 + p.years));
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (40 ln(1 + t) over 9 years: 561.03)', () => {
    expect(totalOutputLogRate.answer({ a: 40, years: 9 })).toMatchObject({ value: 561.03 });
  });
});
