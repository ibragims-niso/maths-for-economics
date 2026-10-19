import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { adjustedRSquared } from './adjusted-r-squared';
import { olsCoefficientTwoRegressors } from './ols-coefficient-two-regressors';
import { xtxEntryFromData } from './xtx-entry-from-data';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

type M = number[][];
const transpose = (a: M): M => (a[0] ?? []).map((_, j) => a.map((row) => row[j] ?? 0));
const mult = (a: M, b: M): M =>
  a.map((row) => (b[0] ?? []).map((_, j) => row.reduce((s, v, k) => s + v * (b[k]?.[j] ?? 0), 0)));
const det3 = (m: M) => {
  const e = (i: number, j: number) => m[i]?.[j] ?? 0;
  return (
    e(0, 0) * (e(1, 1) * e(2, 2) - e(1, 2) * e(2, 1)) -
    e(0, 1) * (e(1, 0) * e(2, 2) - e(1, 2) * e(2, 0)) +
    e(0, 2) * (e(1, 0) * e(2, 1) - e(1, 1) * e(2, 0))
  );
};

/** The entry asked for, read off XᵀX or Xᵀy built by plain matrix multiplication (1-based). */
const ENTRY = {
  'sum-x1': ['xtx', 1, 2],
  'sq-x1': ['xtx', 2, 2],
  'sq-x2': ['xtx', 3, 3],
  cross: ['xtx', 2, 3],
  xy1: ['xty', 2, 1],
  xy2: ['xty', 3, 1],
} as const;

function moments(x1s: number[], x2s: number[], ys: number[]) {
  const X = x1s.map((x, i) => [1, x, x2s[i] ?? 0]);
  const Xt = transpose(X);
  return {
    xtx: mult(Xt, X),
    xty: mult(
      Xt,
      ys.map((y) => [y]),
    ),
  };
}

describe('xtx-entry-from-data', () => {
  it('equals the entry of XᵀX or Xᵀy computed by matrix multiplication', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(xtxEntryFromData, seed);
        const n = p.ys.length;
        expect([4, 5]).toContain(n);
        const all = [...p.x1s, ...p.x2s, ...p.ys];
        expect(all.every((v) => Number.isInteger(v) && v >= 0)).toBe(true);
        expect(Math.min(...p.ys)).toBeGreaterThanOrEqual(1);
        const { xtx, xty } = moments(p.x1s, p.x2s, p.ys);
        // XᵀX is symmetric, with n in the corner, and X has full column rank.
        expect(xtx[0]?.[0]).toBe(n);
        expect(xtx[1]?.[2]).toBe(xtx[2]?.[1]);
        expect(det3(xtx)).not.toBe(0);
        const [which, i, j] = ENTRY[p.kind];
        const expected = which === 'xtx' ? xtx[i - 1]?.[j - 1] : xty[i - 1]?.[j - 1];
        expect(value).toBe(expected);
        expect(Number.isInteger(value)).toBe(true);
        // The stem names the entry that was computed.
        const name =
          which === 'xty' ? `(X^\\top y)_{${i}}` : p.swapped ? `_{${j}${i}}` : `_{${i}${j}}`;
        expect(stem).toContain(name);
        // Distractors: always "product of sums"; at least two in all.
        expect(codes(distractors)).toContain('PRODUCT_OF_SUMS');
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of distractors) expect(hasDecimals(d.value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('asks for every kind of entry', () => {
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) kinds.add(solve(xtxEntryFromData, seed).p.kind);
    expect(kinds.size).toBe(6);
  });

  it('reproduces worked example 2 in EM01 (six workers: Σx₁x₂ = 456, Σx₁y = 1212)', () => {
    const base = {
      context: 'wages' as const,
      x1s: [14, 16, 18, 10, 12, 14],
      x2s: [2, 2, 2, 10, 10, 10],
      ys: [11.5, 16, 17.5, 10.5, 12, 16.5],
      swapped: false,
    };
    const value = (kind: keyof typeof ENTRY) => {
      const a = xtxEntryFromData.answer({ ...base, kind });
      return a.kind === 'numeric' ? a.value : Number.NaN;
    };
    expect(value('sum-x1')).toBe(84);
    expect(value('sq-x1')).toBe(1216);
    expect(value('sq-x2')).toBe(312);
    expect(value('cross')).toBe(456);
    expect(value('xy1')).toBe(1212);
    expect(value('xy2')).toBe(480);
    const byCode = Object.fromEntries(
      xtxEntryFromData.distractors({ ...base, kind: 'cross' }).map((d) => [d.mistakeCode, d.value]),
    );
    // Σx₁·Σx₂ = 84 × 36, and the centred sum Σ(x₁ − x̄₁)(x₂ − x̄₂) = −48.
    expect(byCode).toEqual({ PRODUCT_OF_SUMS: 3024, USED_DEVIATIONS: -48 });
  });
});

describe('ols-coefficient-two-regressors', () => {
  it('solves the normal equations (checked by elimination and by minimising the SSR)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(olsCoefficientTwoRegressors, seed);
        // Read X̃ᵀy back from the stem's numbers via M·b, then solve M·b = g by elimination.
        const g1 = p.a * p.b1 + p.c * p.b2;
        const g2 = p.c * p.b1 + p.d * p.b2;
        expect(hasDecimals(g1, 0)).toBe(true);
        expect(hasDecimals(g2, 0)).toBe(true);
        const f = p.c / p.a;
        const sol2 = (g2 - f * g1) / (p.d - f * p.c);
        const sol1 = (g1 - p.c * sol2) / p.a;
        const solution = p.j === 1 ? sol1 : sol2;
        expect(Math.abs(value - solution)).toBeLessThan(1e-9);
        expect(hasDecimals(value, 1)).toBe(true);
        // SSR(b) = bᵀMb − 2bᵀg + const is smallest at the solution.
        const ssr = (x: number, y: number) =>
          p.a * x * x + 2 * p.c * x * y + p.d * y * y - 2 * (x * g1 + y * g2);
        const best = ssr(sol1, sol2);
        for (const [dx, dy] of [
          [0.01, 0],
          [-0.01, 0],
          [0, 0.01],
          [0, -0.01],
          [0.01, -0.01],
        ] as const) {
          expect(ssr(sol1 + dx, sol2 + dy)).toBeGreaterThan(best);
        }
        // A genuine two-regressor problem: correlated, but far from perfectly.
        const corr = Math.abs(p.c) / Math.sqrt(p.a * p.d);
        expect(corr).toBeGreaterThanOrEqual(0.2);
        expect(corr).toBeLessThanOrEqual(0.8);
        expect(p.a).toBeGreaterThan(0);
        expect(p.d).toBeGreaterThan(0);
        expect(stem).toContain(`b_${p.j}`);
        // Economic signs: demand falls with price and rises with income; the rest rise.
        if (p.context === 'demand') {
          expect(p.b1).toBeLessThan(0);
          expect(p.b2).toBeGreaterThan(0);
        } else {
          expect(p.b1).toBeGreaterThan(0);
          expect(p.b2).toBeGreaterThan(0);
        }
        expect(codes(distractors)).toEqual([
          'NO_DIAGONAL_SWAP',
          'NO_INVERSE',
          'NO_SIGN_CHANGE',
          'OMITTED_REGRESSOR',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in EM01 (b₁ = 1.5 on education; simple slope 0.9)', () => {
    const p = { context: 'wages' as const, a: 40, c: -48, d: 96, b1: 1.5, b2: 0.5, j: 1 as const };
    expect(olsCoefficientTwoRegressors.stem(p)).toContain('\\begin{pmatrix} 36 \\\\ -24');
    expect(olsCoefficientTwoRegressors.answer(p)).toMatchObject({ value: 1.5 });
    expect(olsCoefficientTwoRegressors.steps(p).map((s) => s.result)).toEqual([
      undefined,
      1536,
      undefined,
      1.5,
    ]);
    expect(olsCoefficientTwoRegressors.answer({ ...p, j: 2 })).toMatchObject({ value: 0.5 });
    const byCode = Object.fromEntries(
      olsCoefficientTwoRegressors.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      OMITTED_REGRESSOR: 0.9,
      NO_INVERSE: 2592,
      NO_SIGN_CHANGE: 3,
      NO_DIAGONAL_SWAP: 0.19,
    });
  });
});

describe('adjusted-r-squared', () => {
  it('equals 1 − [SSR/(n − k)]/[SST/(n − 1)] and lies below R²', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(adjustedRSquared, seed);
        const ssr = p.sst * (1 - p.r2);
        expect(hasDecimals(ssr, 0)).toBe(true);
        const k = p.m + 1;
        const s2 = ssr / (p.n - k);
        const total = p.sst / (p.n - 1);
        expect(Math.abs(value - (1 - s2 / total))).toBeLessThanOrEqual(0.0005 + 1e-9);
        expect(hasDecimals(value, 3)).toBe(true);
        expect(value).toBeLessThan(p.r2);
        expect(value).toBeGreaterThan(0);
        expect(p.n - k).toBeGreaterThanOrEqual(5);
        expect(p.m).toBeGreaterThanOrEqual(2);
        expect(codes(distractors)).toEqual([
          'DF_NO_INTERCEPT',
          'DF_RATIO_INVERTED',
          'NO_ADJUSTMENT',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in EM01 (SSR = 3, SST = 45, n = 6, k = 3: 0.889)', () => {
    const p = { context: 'wages' as const, n: 6, m: 2, sst: 45, r2: 1 - 3 / 45 };
    expect(adjustedRSquared.stem(p)).toContain('\\text{SSR} = 3$');
    expect(adjustedRSquared.answer(p)).toMatchObject({ value: 0.889 });
    const byCode = Object.fromEntries(
      adjustedRSquared.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      NO_ADJUSTMENT: 0.933,
      DF_NO_INTERCEPT: 0.917,
      DF_RATIO_INVERTED: 0.96,
    });
  });
});
