import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { f, globalExtremumClosedInterval } from './global-extremum-closed-interval';
import { inflectionTime, logisticInflectionTime } from './logistic-inflection-time';
import { intercept, obliqueAsymptoteIntercept } from './oblique-asymptote-intercept';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

describe('oblique-asymptote-intercept', () => {
  it('the gap between the curve and y = aq + m vanishes for large q', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(obliqueAsymptoteIntercept, seed);
        const u = (q: number) => (p.a * q * q + p.b * q + p.c) / (q + p.d);
        // u(q) − a q at a large q, without using the formula for m.
        expect(Math.abs(u(1e7) - p.a * 1e7 - value)).toBeLessThan(1e-3);
        expect(Number.isInteger(value)).toBe(true);
        // And the curve does not lie on the line: the gap is non-zero at q = 10.
        expect(Math.abs(u(10) - p.a * 10 - value)).toBeGreaterThan(1e-6);
      }),
      RUNS,
    );
  });

  it('offers the unshifted b, the sign slip and the slope', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        expect(codes(solve(obliqueAsymptoteIntercept, seed).distractors)).toEqual([
          'FORGOT_SHIFT',
          'SIGN_SLIP',
          'SLOPE_NOT_INTERCEPT',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces C121 Example 1 ((2q² + 3q + 5)/(q + 1) has asymptote y = 2q + 1)', () => {
    expect(intercept({ a: 2, b: 3, c: 5, d: 1 })).toBe(1);
  });
});

describe('logistic-inflection-time', () => {
  it('is where a numerical second derivative changes sign and the growth rate peaks', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(logisticInflectionTime, seed);
        const k = p.kHundredths / 100;
        const S = (t: number) => p.M / (1 + p.A * Math.exp(-k * t));
        const slope = (t: number, h = 1e-4) => (S(t + h) - S(t - h)) / (2 * h);
        const t0 = inflectionTime(p);
        expect(slope(t0)).toBeGreaterThan(slope(t0 - 0.5));
        expect(slope(t0)).toBeGreaterThan(slope(t0 + 0.5));
        expect(Math.abs(S(t0) - p.M / 2)).toBeLessThan(1e-9);
        // The fastest growth is M·k/4.
        expect(Math.abs(slope(t0) - (p.M * k) / 4)).toBeLessThan(1e-5);
        expect(Math.abs(value - t0)).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('reproduces C121 Example 2 (S = 100/(1 + 49e^(−0.5t)): t = 7.78)', () => {
    expect(logisticInflectionTime.answer({ M: 100, A: 49, kHundredths: 50 })).toMatchObject({
      value: 7.78,
    });
  });
});

describe('global-extremum-closed-interval', () => {
  it('matches a fine grid search over the interval', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(globalExtremumClosedInterval, seed);
        let best = p.kind === 'max' ? -Infinity : Infinity;
        const n = 4000;
        for (let i = 0; i <= n; i++) {
          const x = -p.left + ((p.right + p.left) * i) / n;
          const v = f(p, x);
          best = p.kind === 'max' ? Math.max(best, v) : Math.min(best, v);
        }
        // The grid contains the ends; critical points ±s are hit to within the grid step.
        expect(Math.abs(best - value)).toBeLessThan(0.05);
        expect(p.left).toBeGreaterThan(p.s);
        expect(p.right).toBeGreaterThan(p.s);
      }),
      RUNS,
    );
  });

  it('offers at least two of the four slips', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { distractors } = solve(globalExtremumClosedInterval, seed);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of distractors)
          expect(['LOCAL_ONLY', 'ENDPOINT_ONLY', 'MAX_MIN_SWAPPED', 'INFLECTION_POINT']).toContain(
            d.mistakeCode,
          );
      }),
      RUNS,
    );
  });

  it('reproduces C121 Example 3 (x³ − 12x + 5 on [−3, 5]: max 70, min −11)', () => {
    const base = { s: 2, h: 5, left: 3, right: 5 };
    expect(globalExtremumClosedInterval.answer({ ...base, kind: 'max' })).toMatchObject({
      value: 70,
    });
    expect(globalExtremumClosedInterval.answer({ ...base, kind: 'min' })).toMatchObject({
      value: -11,
    });
  });
});
