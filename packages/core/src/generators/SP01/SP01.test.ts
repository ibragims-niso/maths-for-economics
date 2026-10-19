import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { markovLongRunShareThreeState } from './markov-long-run-share-three-state';
import { markovLongRunShareTwoState } from './markov-long-run-share-two-state';
import { markovShareAfterSteps } from './markov-share-after-steps';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, steps: pr.steps };
};

/** True when x has at most d decimal places. */
const decimals = (x: number, d: number) => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** A row vector times a matrix, by loops (written independently of the generators' helpers). */
function step(v: number[], m: number[][]): number[] {
  const out = v.map(() => 0);
  for (let i = 0; i < v.length; i++) {
    for (let j = 0; j < v.length; j++) out[j] = (out[j] ?? 0) + (v[i] ?? 0) * (m[i]?.[j] ?? 0);
  }
  return out;
}

/** Long-run distribution by running the chain for many periods from equal shares. */
function runLong(m: number[][], periods = 5000): number[] {
  let v = m.map(() => 1 / m.length);
  for (let t = 0; t < periods; t++) v = step(v, m);
  return v;
}

const isStochastic = (m: number[][]) =>
  m.every(
    (r) => r.every((x) => x >= 0 && x <= 1) && Math.abs(r.reduce((s, x) => s + x, 0) - 1) < 1e-12,
  );

describe('markov-share-after-steps', () => {
  /** Adds up the probability of every path from a start state to state j, one path at a time. */
  function byPaths(start: number[], m: number[][], n: number, j: number): number {
    const size = start.length;
    let total = 0;
    const walk = (state: number, left: number, prob: number) => {
      if (left === 0) {
        if (state === j) total += prob;
        return;
      }
      for (let next = 0; next < size; next++) walk(next, left - 1, prob * (m[state]?.[next] ?? 0));
    };
    for (let s = 0; s < size; s++) walk(s, n, start[s] ?? 0);
    return total;
  }

  it('equals the sum over all paths of the start share times the chances along the path', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(markovShareAfterSteps, seed);
        const m = p.matrix.map((r) => r.map((x) => x / 100));
        const start = p.start.map((x) => x / 100);
        const exact = byPaths(start, m, p.n, p.j - 1);
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.00005 + 1e-9);
        expect(decimals(value, 4)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
      }),
      RUNS,
    );
  });

  it('uses a valid transition matrix and starting distribution; distractors as described', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, distractors } = solve(markovShareAfterSteps, seed);
        const m = p.matrix.map((r) => r.map((x) => x / 100));
        expect(isStochastic(m)).toBe(true);
        expect(m.every((r) => r.every((x) => x > 0))).toBe(true);
        expect(p.start.reduce((s, x) => s + x, 0)).toBe(100);
        expect(p.start.every((x) => Number.isInteger(x) && x > 0)).toBe(true);
        expect(p.matrix.length === 3 ? p.n === 2 : [2, 3].includes(p.n)).toBe(true);
        const start = p.start.map((x) => x / 100);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        expect(distractors.length).toBe(3);
        expect(
          Math.abs((byCode.ONE_STEP ?? 0) - (step(start, m)[p.j - 1] ?? Number.NaN)),
        ).toBeLessThanOrEqual(0.00005 + 1e-9);
        // The matrix on the left of a column vector: (Pⁿ π₀ᵀ)ⱼ.
        let col = start;
        for (let t = 0; t < p.n; t++)
          col = m.map((r) => r.reduce((s, x, i) => s + x * (col[i] ?? 0), 0));
        expect(
          Math.abs((byCode.WRONG_SIDE ?? 0) - (col[p.j - 1] ?? Number.NaN)),
        ).toBeLessThanOrEqual(0.00005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('reproduces SP01 Example 1 (unemployment 20 % → 13.6 % after two quarters)', () => {
    const p = {
      context: 'jobs' as const,
      matrix: [
        [96, 4],
        [36, 64],
      ],
      start: [80, 20],
      n: 2 as const,
      j: 2,
    };
    expect(markovShareAfterSteps.answer(p)).toMatchObject({ kind: 'numeric', value: 0.136 });
    const codes = Object.fromEntries(
      markovShareAfterSteps.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({ ONE_STEP: 0.16, WRONG_SIDE: 0.5456, ENTRY_POWER: 0.0832 });
  });
});

describe('markov-long-run-share-two-state', () => {
  it('equals the share reached by running the chain for many periods, and balances the flows', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(markovLongRunShareTwoState, seed);
        const P = p.out / 100;
        const Q = p.back / 100;
        const m = [
          [1 - P, P],
          [Q, 1 - Q],
        ];
        const long = runLong(m);
        expect(Math.abs(value - (long[p.j - 1] ?? Number.NaN))).toBeLessThanOrEqual(0.00005 + 1e-9);
        // Substituting back: π₁·p = π₂·q, i.e. the share stays put after one more period.
        const pi1 = Q / (P + Q);
        expect(pi1 * P).toBeCloseTo((1 - pi1) * Q, 12);
        expect(decimals(value, 4)).toBe(true);
        expect(value > 0 && value < 1).toBe(true);
        expect(p.out).not.toBe(p.back);
      }),
      RUNS,
    );
  });

  it('gives the distractors described in the topic', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(markovLongRunShareTwoState, seed);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        if ('FLOWS_REVERSED' in byCode)
          expect(Math.abs((byCode.FLOWS_REVERSED ?? 0) - (1 - value))).toBeLessThanOrEqual(
            0.0001 + 1e-9,
          );
        if ('EQUAL_SHARES' in byCode) expect(byCode.EQUAL_SHARES).toBe(0.5);
        const stay = p.j === 1 ? 1 - p.out / 100 : 1 - p.back / 100;
        if ('STAY_PROBABILITY' in byCode) expect(byCode.STAY_PROBABILITY).toBeCloseTo(stay, 9);
      }),
      RUNS,
    );
  });

  it('reproduces SP01 Example 2 (long-run unemployment 0.04/(0.04 + 0.36) = 0.1)', () => {
    const p = { context: 'jobs' as const, out: 4, back: 36, j: 2 as const };
    expect(markovLongRunShareTwoState.answer(p)).toMatchObject({ kind: 'numeric', value: 0.1 });
    const codes = Object.fromEntries(
      markovLongRunShareTwoState.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({
      FLOWS_REVERSED: 0.9,
      STAY_PROBABILITY: 0.64,
      EQUAL_SHARES: 0.5,
      RATIO_NOT_SHARE: 0.1111,
    });
  });
});

describe('markov-long-run-share-three-state', () => {
  const matrix = (p: { a: number; b: number; c: number; d: number }) =>
    [
      [100 - p.a, p.a, 0],
      [p.b, 100 - p.b - p.c, p.c],
      [0, p.d, 100 - p.d],
    ].map((r) => r.map((x) => x / 100));

  const long3 = (p: { a: number; b: number; c: number; d: number }) =>
    runLong(matrix(p), 5000)[2] ?? 0;

  it('equals the long-run share from running the chain, and π = πP holds for the shares', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(markovLongRunShareThreeState, seed);
        const m = matrix(p);
        expect(isStochastic(m)).toBe(true);
        const long = runLong(m, 20000);
        expect(Math.abs(value - (long[p.k - 1] ?? Number.NaN))).toBeLessThanOrEqual(0.00005 + 1e-9);
        // The long-run vector is unchanged by one more period.
        const again = step(long, m);
        for (let i = 0; i < 3; i++)
          expect(Math.abs((again[i] ?? 0) - (long[i] ?? 0))).toBeLessThan(1e-12);
        expect(decimals(value, 4)).toBe(true);
        expect(value > 0 && value < 1).toBe(true);
        expect(100 - p.b - p.c).toBeGreaterThanOrEqual(50);
      }),
      RUNS,
    );
  });

  it('gives at least three distractors, including equal shares when they differ from the answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { value, distractors } = solve(markovLongRunShareThreeState, seed);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        const equal = distractors.find((d) => d.mistakeCode === 'EQUAL_SHARES');
        // Equal shares is dropped only when it matches the answer or another distractor.
        const clash = [value, ...distractors.filter((d) => d !== equal).map((d) => d.value)].some(
          (x) => Math.abs(x - 0.3333) <= 0.0005 + 1e-9,
        );
        if (!clash) expect(equal?.value).toBe(0.3333);
      }),
      RUNS,
    );
  });

  it('reproduces SP01 Example 3 (loan grades: long-run share of C is 0.25)', () => {
    const p = { context: 'ratings' as const, a: 10, b: 5, c: 10, d: 20, k: 3 as const };
    expect(markovLongRunShareThreeState.answer(p)).toMatchObject({ kind: 'numeric', value: 0.25 });
    const codes = Object.fromEntries(
      markovLongRunShareThreeState.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({
      FLOWS_REVERSED: 0.4,
      NOT_NORMALISED: 1,
      EQUAL_SHARES: 0.3333,
      STAY_PROBABILITY: 0.8,
    });
    expect(long3(p)).toBeCloseTo(0.25, 9);
  });
});
