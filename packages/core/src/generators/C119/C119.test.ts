import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { conjugateLimitAtInfinity } from './conjugate-limit-at-infinity';
import {
  equivalentInfinitesimalsRatio,
  evaluateForm,
  exactLimit,
} from './equivalent-infinitesimals-ratio';
import { exponent, oneToInfinityLimit } from './one-to-infinity-limit';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

describe('conjugate-limit-at-infinity', () => {
  it('matches the gap evaluated at a huge x with the conjugate-free formula', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(conjugateLimitAtInfinity, seed);
        const gap = (x: number) =>
          Math.sqrt(x * x + p.a * x + p.b) - Math.sqrt(x * x + p.c * x + p.d);
        // Direct subtraction is accurate enough at x = 10⁶ (roots near 10⁶, gap of a few units).
        expect(Math.abs(gap(1e6) - value)).toBeLessThan(1e-4);
        expect(Math.abs(gap(1e6) - value)).toBeLessThan(Math.abs(gap(100) - value) + 1e-4);
        expect(Math.abs(value * 2 - Math.round(value * 2))).toBeLessThan(1e-12);
      }),
      RUNS,
    );
  });

  it('offers 0, the missing half and the constant terms', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { distractors } = solve(conjugateLimitAtInfinity, seed);
        expect(codes(distractors)).toEqual([
          'CONSTANT_TERMS',
          'FORGOT_HALF',
          'INFINITY_MINUS_INFINITY',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces C119 Example 1 (√(q² + 10q + 50) − √(q² + 4q + 20) → 3)', () => {
    expect(conjugateLimitAtInfinity.answer({ a: 10, b: 50, c: 4, d: 20 })).toMatchObject({
      value: 3,
    });
  });
});

describe('one-to-infinity-limit', () => {
  it('equals the power evaluated at a huge x through logarithms', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(oneToInfinityLimit, seed);
        // ln of the power: c·x·ln(1 + (a − b)/(x + b)), computed with log1p to keep precision.
        const x = 1e9;
        const lnPower = p.c * x * Math.log1p((p.a - p.b) / (x + p.b));
        expect(Math.abs(Math.exp(lnPower) - value)).toBeLessThanOrEqual(
          Math.max(0.0001, 0.0005 * value),
        );
        expect(exponent(p)).not.toBe(0);
        expect(Math.abs(exponent(p))).toBeLessThanOrEqual(6);
      }),
      RUNS,
    );
  });

  it('offers 1, the dropped factor and the sign slip', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { distractors } = solve(oneToInfinityLimit, seed);
        expect(codes(distractors)).toEqual(['DROPPED_FACTOR', 'ONE_TO_INFINITY', 'SIGN_SLIP']);
      }),
      RUNS,
    );
  });

  it('reproduces C119 Example 2 (((x + 3)/(x − 1))^(2x) → e⁸ = 2980.958)', () => {
    expect(oneToInfinityLimit.answer({ a: 3, b: -1, c: 2 })).toMatchObject({ value: 2980.958 });
  });
});

describe('equivalent-infinitesimals-ratio', () => {
  it('matches the ratio evaluated at a tiny x', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(equivalentInfinitesimalsRatio, seed);
        for (const x of [1e-6, -1e-6]) {
          const ratio = evaluateForm(p.top, p.a * x) / evaluateForm(p.bottom, p.b * x);
          expect(Math.abs(ratio - exactLimit(p))).toBeLessThan(1e-4);
        }
        expect(Math.abs(value - exactLimit(p))).toBeLessThanOrEqual(0.005 + 1e-9);
        // Both parts really are 0 at x = 0.
        expect(evaluateForm(p.top, 0)).toBe(0);
        expect(evaluateForm(p.bottom, 0)).toBe(0);
      }),
      RUNS,
    );
  });

  it('adds the forgotten ½ only for the square root', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, distractors } = solve(equivalentInfinitesimalsRatio, seed);
        const has = distractors.some((d) => d.mistakeCode === 'FORGOT_POWER');
        if (p.top !== 'sqrt') expect(has).toBe(false);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces C119 Example 3 (ln(1 + 3x)/(e^(2x) − 1) → 1.5)', () => {
    expect(
      equivalentInfinitesimalsRatio.answer({ top: 'ln', bottom: 'exp', a: 3, b: 2 }),
    ).toMatchObject({ value: 1.5 });
  });
});
