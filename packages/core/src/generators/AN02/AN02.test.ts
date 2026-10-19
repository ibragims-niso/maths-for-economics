import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { epsilonNThreshold } from './epsilon-n-threshold';
import { recursiveRootSequenceLimit } from './recursive-root-sequence-limit';
import { planValue, sequenceSupremum } from './sequence-supremum';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, stem: pr.stem, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('epsilon-n-threshold', () => {
  it('is the first n from which every term is within ε, found by scanning n = 1, 2, 3, …', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(epsilonNThreshold, seed);
        // ε and the sequence as the student sees them.
        const eps = /< ([\d.]+)\$ for every/.exec(stem);
        expect(eps?.[1]).toBeDefined();
        expect(Number(eps?.[1]) * 1000).toBeCloseTo(p.epsK, 9);
        // |pₙ − a| < ε  ⇔  1000·|an + b − a(n + c)| < epsK·(n + c), all in whole numbers.
        const close = (n: number) =>
          1000 * Math.abs(p.a * n + p.b - p.a * (n + p.c)) < p.epsK * (n + p.c);
        let firstOfTail = 1;
        for (let n = 1; n <= value + 200; n++) if (!close(n)) firstOfTail = n + 1;
        expect(value).toBe(firstOfTail);
        expect(close(value)).toBe(true);
        expect(close(value - 1)).toBe(false);
        // The terms themselves are positive and really do approach a.
        for (const n of [1, value, 10 * value]) {
          expect((p.a * n + p.b) / (n + p.c)).toBeGreaterThan(0);
        }
        expect(Math.abs((p.a * 1e9 + p.b) / (1e9 + p.c) - p.a)).toBeLessThan(1e-6);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in AN02 ((2n + 1)/(n + 3), ε = 0.1 gives N = 48)', () => {
    const p = { setting: 'x', a: 2, b: 1, c: 3, epsK: 100 };
    expect(epsilonNThreshold.answer(p)).toMatchObject({ kind: 'numeric', value: 48 });
    expect(epsilonNThreshold.stem(p)).toContain('\\dfrac{2n + 1}{n + 3}');
    const codes = epsilonNThreshold.distractors(p);
    expect(codes).toContainEqual({ value: 47, mistakeCode: 'NON_STRICT' });
    expect(codes).toContainEqual({ value: 51, mistakeCode: 'FORGOT_SHIFT' });
    expect(codes).toContainEqual({ value: 8, mistakeCode: 'DROPPED_CONSTANT' });
  });
});

describe('sequence-supremum', () => {
  it('is an upper bound of the values that no smaller number beats', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(sequenceSupremum, seed);
        const ns = [...Array.from({ length: 500 }, (_, i) => i + 1), 1e4, 1e6, 1e8];
        const terms = ns.map((n) => planValue(p, n));
        const biggest = Math.max(...terms);
        // Upper bound (up to the 2-decimal rounding of the answer) ...
        expect(biggest).toBeLessThanOrEqual(value + 0.005);
        // ... and the least one: some value comes within 0.01 of it.
        expect(value - biggest).toBeLessThan(0.01);
        // Attained exactly when the values fall, i.e. the first one is the largest.
        const attained = terms[0] === biggest;
        expect(attained).toBe(p.q > p.p * p.r);
        if (attained) expect(Math.abs((terms[0] ?? 0) - value)).toBeLessThan(1e-9);
        else expect(terms.every((u) => u < value)).toBe(true);
        expect(terms.every((u) => u > 0)).toBe(true);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(stem.includes('2 decimal places')).toBe(!Number.isInteger(value));
      }),
      RUNS,
    );
  });

  it('gives the attained maximum or the unattained limit for two fixed cases', () => {
    // (3n − 1)/(n + 1) is not allowed (q ≥ 1), so use (3n + 1)/(n + 1): rises to 3, never reaches it.
    expect(sequenceSupremum.answer({ setting: 'x', p: 3, q: 1, r: 1 })).toMatchObject({ value: 3 });
    // (2n + 9)/(n + 1) falls from 5.5 towards 2.
    expect(sequenceSupremum.answer({ setting: 'x', p: 2, q: 9, r: 1 })).toMatchObject({
      value: 5.5,
    });
  });
});

describe('recursive-root-sequence-limit', () => {
  it('is where the iteration settles, approached from below by rising terms', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(recursiveRootSequenceLimit, seed);
        const rule = /\\sqrt\{(\d+) \+ (\d*)x_n\}/.exec(stem);
        const start = /x_1 = (\d+)/.exec(stem);
        if (!rule?.[1] || rule[2] === undefined || !start?.[1])
          throw new Error(`stem not understood: ${stem}`);
        const a = Number(rule[1]);
        const b = rule[2] === '' ? 1 : Number(rule[2]);
        let x = Number(start[1]);
        for (let n = 0; n < 60; n++) {
          const next = Math.sqrt(a + b * x);
          if (n < 3) expect(next).toBeGreaterThan(x);
          expect(next).toBeGreaterThanOrEqual(x);
          expect(next).toBeLessThan(value + 1e-9);
          x = next;
        }
        expect(Math.abs(x - value)).toBeLessThan(1e-9);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(Number(start[1]));
        expect(b).toBe(p.b);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in AN02 (x₁ = 0, xₙ₊₁ = √(2 + xₙ) tends to 2)', () => {
    const p = { L: 2, b: 1, x1: 0 };
    expect(recursiveRootSequenceLimit.stem(p)).toContain('\\sqrt{2 + x_n}');
    expect(recursiveRootSequenceLimit.answer(p)).toMatchObject({ value: 2 });
  });
});
