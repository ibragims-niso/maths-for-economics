import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { ces, cesLimitCobbDouglas } from './ces-limit-cobb-douglas';
import { exactLimit, lhopitalDifferenceOfPowers } from './lhopital-difference-of-powers';
import { averageRate, meanValuePointRootOutput } from './mean-value-point-root-output';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

describe('mean-value-point-root-output', () => {
  it('lies inside the interval, and a numerical slope there equals the chord slope', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(meanValuePointRootOutput, seed);
        const Q = (L: number) => p.k * Math.sqrt(L);
        const a = p.m ** 2;
        const b = p.n ** 2;
        expect(value).toBeGreaterThan(a);
        expect(value).toBeLessThan(b);
        const chord = (Q(b) - Q(a)) / (b - a);
        const h = 1e-5;
        const slope = (Q(value + h) - Q(value - h)) / (2 * h);
        expect(Math.abs(slope - chord)).toBeLessThan(1e-6);
        expect(Math.abs(chord - averageRate(p))).toBeLessThan(1e-12);
        // The marginal product falls, so c is the only such point: slopes at the ends bracket it.
        expect((Q(a + h) - Q(a)) / h).toBeGreaterThan(chord);
        expect((Q(b) - Q(b - h)) / h).toBeLessThan(chord);
      }),
      RUNS,
    );
  });

  it('offers the midpoint, the rate and the unsquared root as distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        expect(codes(solve(meanValuePointRootOutput, seed).distractors)).toEqual([
          'FORGOT_SQUARE',
          'GAVE_RATE',
          'MIDPOINT_RULE',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces C120 Example 1 (Q = 20√L from 4 to 64 hours: c = 25)', () => {
    expect(meanValuePointRootOutput.answer({ k: 20, m: 2, n: 8 })).toMatchObject({ value: 25 });
    expect(averageRate({ k: 20, m: 2, n: 8 })).toBe(2);
  });
});

describe('lhopital-difference-of-powers', () => {
  it('matches the difference quotient at a tiny x', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lhopitalDifferenceOfPowers, seed);
        const a = 1 + p.ra / 100;
        const b = 1 + p.rb / 100;
        const x = 1e-7;
        const quotient = (a ** x - b ** x) / x;
        expect(Math.abs(quotient - exactLimit(p))).toBeLessThan(1e-6);
        expect(Math.abs(value - exactLimit(p))).toBeLessThanOrEqual(0.00005 + 1e-12);
        expect(Math.sign(value)).toBe(Math.sign(p.ra - p.rb));
      }),
      RUNS,
    );
  });

  it('offers the gap without logs, the sign slip and zero', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        expect(codes(solve(lhopitalDifferenceOfPowers, seed).distractors)).toEqual([
          'NO_LOG',
          'SIGN_SLIP',
          'ZERO_OVER_ZERO',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces C120 Example 2 ((1.08ˣ − 1.05ˣ)/x → 0.0282)', () => {
    expect(lhopitalDifferenceOfPowers.answer({ ra: 8, rb: 5 })).toMatchObject({ value: 0.0282 });
  });
});

describe('ces-limit-cobb-douglas', () => {
  it('matches CES output at a tiny ρ on both sides of zero', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cesLimitCobbDouglas, seed);
        for (const rho of [1e-7, -1e-7]) {
          expect(Math.abs(ces(p, rho) - value)).toBeLessThanOrEqual(
            Math.max(0.005, 0.0005 * value),
          );
        }
        // Cobb–Douglas lies between the inputs, below the weighted average (ρ = 1) and above min (ρ → −∞).
        expect(value).toBeGreaterThan(Math.min(p.K, p.L));
        expect(value).toBeLessThan(ces(p, 1));
      }),
      RUNS,
    );
  });

  it('offers the linear average, 1 and the Leontief minimum', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        expect(codes(solve(cesLimitCobbDouglas, seed).distractors)).toEqual([
          'LEONTIEF',
          'LINEAR_AVERAGE',
          'ONE_TO_INFINITY',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces C120 Example 3 (α = 0.5, K = 36, L = 4: the limit is 12)', () => {
    const p = { alphaTenths: 5, K: 36, L: 4 };
    expect(cesLimitCobbDouglas.answer(p)).toMatchObject({ value: 12 });
    expect(cesLimitCobbDouglas.distractors(p).map((d) => d.value)).toEqual([20, 1, 4]);
  });
});
