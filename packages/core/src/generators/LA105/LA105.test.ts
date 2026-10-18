import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import { equilibriumPricesInverse } from './equilibrium-prices-inverse';
import { inverse2x2Entry } from './inverse-2x2-entry';
import { inverse3x3CofactorEntry } from './inverse-3x3-cofactor-entry';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

const decimalsAtMost = (x: number, d: number) =>
  Math.abs(Math.round(x * 10 ** d) - x * 10 ** d) < 1e-6;

/** The inverse by Gauss–Jordan elimination on [A | I], with row swaps; a different route from cofactors. */
function gaussJordan(A: number[][]): number[][] {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...row.map((_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++)
      if (Math.abs(M[r]?.[c] ?? 0) > Math.abs(M[pivot]?.[c] ?? 0)) pivot = r;
    [M[c], M[pivot]] = [M[pivot] ?? [], M[c] ?? []];
    const lead = M[c]?.[c] ?? 0;
    if (Math.abs(lead) < 1e-12) throw new Error('singular');
    M[c] = (M[c] ?? []).map((x) => x / lead);
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r]?.[c] ?? 0;
      M[r] = (M[r] ?? []).map((x, j) => x - f * (M[c]?.[j] ?? 0));
    }
  }
  return M.map((row) => row.slice(n));
}

const multiply = (A: number[][], B: number[][]) =>
  A.map((row) => (B[0] ?? []).map((_, j) => row.reduce((s, a, k) => s + a * (B[k]?.[j] ?? 0), 0)));

describe('inverse-2x2-entry', () => {
  it('matches the Gauss–Jordan inverse, which really undoes A', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(inverse2x2Entry, seed);
        const A = [
          [p.a, p.b],
          [p.c, p.d],
        ];
        const X = gaussJordan(A);
        // X is the inverse: A X = I.
        multiply(A, X).forEach((row, i) => {
          row.forEach((x, j) => {
            expect(x).toBeCloseTo(i === j ? 1 : 0, 9);
          });
        });
        const value = numericValue(answer);
        expect(Math.abs(value - (X[p.row - 1]?.[p.col - 1] ?? Number.NaN))).toBeLessThan(1e-9);
        expect(decimalsAtMost(value, 2)).toBe(true);
        for (const x of [p.a, p.b, p.c, p.d]) {
          expect(Number.isInteger(x) && x !== 0 && Math.abs(x) <= 9).toBe(true);
        }
        expect([-5, -4, -2, -1, 1, 2, 4, 5]).toContain(p.a * p.d - p.b * p.c);
        expect(distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA105: A = (3 −1; −1 2) has A⁻¹ = (0.4 0.2; 0.2 0.6)', () => {
    const base = { a: 3, b: -1, c: -1, d: 2 };
    const entries = [
      [1, 1, 0.4],
      [1, 2, 0.2],
      [2, 1, 0.2],
      [2, 2, 0.6],
    ];
    for (const [row, col, value] of entries) {
      const p = { ...base, row: row ?? 1, col: col ?? 1 };
      expect(numericValue(inverse2x2Entry.answer(p))).toBe(value);
    }
    const p = { ...base, row: 1, col: 1 };
    expect(inverse2x2Entry.steps(p)[0]?.result).toBe(5);
    expect(inverse2x2Entry.distractors(p).map((d) => [d.mistakeCode, d.value])).toEqual([
      ['NO_DIVIDE_DET', 2],
      ['NO_DIAGONAL_SWAP', 0.6],
      ['RECIPROCAL_ENTRY', 0.33],
    ]);
  });
});

describe('equilibrium-prices-inverse', () => {
  it('gives a price that clears every market, from an A⁻¹ shown exactly', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, stem } = makeProblem(equilibriumPricesInverse, seed);
        const n = p.A.length;
        expect([2, 3]).toContain(n);
        const b = p.A.map((row) => row.reduce((s, a, j) => s + a * (p.prices[j] ?? 0), 0));
        // Solving A x = b by elimination recovers the drawn prices, so the answer clears the markets.
        const x = gaussJordan(p.A).map((row) => row.reduce((s, a, j) => s + a * (b[j] ?? 0), 0));
        x.forEach((xi, i) => {
          expect(xi).toBeCloseTo(p.prices[i] ?? Number.NaN, 9);
        });
        expect(numericValue(answer)).toBe(p.prices[p.k]);
        // Positive whole prices and positive right-hand sides.
        for (const price of p.prices) expect(Number.isInteger(price) && price >= 5).toBe(true);
        for (const bi of b) expect(bi).toBeGreaterThanOrEqual(5);
        // Stable model: positive own effects, cross effects ≤ 0, rows add up to more than 0.
        p.A.forEach((row, i) => {
          row.forEach((a, j) => {
            expect(i === j ? a > 0 : a <= 0).toBe(true);
          });
          expect(row.reduce((s, a) => s + a, 0)).toBeGreaterThan(0);
        });
        // The inverse in the stem is exact to 2 decimals and has no negative entries.
        for (const row of gaussJordan(p.A))
          for (const v of row) {
            expect(decimalsAtMost(v, 2)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(-1e-12);
          }
        expect(stem).toContain('A^{-1} =');
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA105: b = (40, 30) gives prices (22, 26)', () => {
    const A = [
      [3, -1],
      [-1, 2],
    ];
    const p = { A, prices: [22, 26], k: 0 };
    expect(numericValue(equilibriumPricesInverse.answer(p))).toBe(22);
    expect(equilibriumPricesInverse.stem(p)).toContain(
      '\\begin{pmatrix} 40 \\\\ 30 \\end{pmatrix}',
    );
    expect(equilibriumPricesInverse.stem(p)).toContain(
      '\\begin{pmatrix} 0.4 & 0.2 \\\\ 0.2 & 0.6 \\end{pmatrix}',
    );
    // A⁻¹ is symmetric here, so the wrong order happens to give the right price and is dropped.
    expect(equilibriumPricesInverse.distractors(p).map((d) => [d.mistakeCode, d.value])).toEqual([
      ['USED_A', 90],
      ['IGNORED_OTHER_MARKET', 13.33],
    ]);
  });
});

describe('inverse-3x3-cofactor-entry', () => {
  it('matches the Gauss–Jordan inverse at an off-diagonal entry', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(inverse3x3CofactorEntry, seed);
        const X = gaussJordan(p.A);
        const value = numericValue(answer);
        expect(Math.abs(value - (X[p.i]?.[p.j] ?? Number.NaN))).toBeLessThan(1e-9);
        expect(decimalsAtMost(value, 2)).toBe(true);
        expect(value).not.toBe(0);
        expect(p.i).not.toBe(p.j);
        for (const row of p.A)
          for (const a of row) expect(Number.isInteger(a) && a >= -3 && a <= 5).toBe(true);
        expect(distractors.map((d) => d.mistakeCode)).toContain('TRANSPOSED');
        // Forgetting to transpose gives the entry of the transposed position of A⁻¹.
        const transposed = distractors.find((d) => d.mistakeCode === 'TRANSPOSED')?.value;
        expect(Math.abs((transposed ?? Number.NaN) - (X[p.j]?.[p.i] ?? 0))).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in LA105: (A⁻¹)₁₂ = C₂₁ / det A = 2/4 = 0.5', () => {
    const p = {
      A: [
        [2, -1, 0],
        [-1, 2, -1],
        [0, -1, 2],
      ],
      i: 0,
      j: 1,
    };
    expect(numericValue(inverse3x3CofactorEntry.answer(p))).toBe(0.5);
    expect(inverse3x3CofactorEntry.steps(p).map((s) => s.result)).toEqual([4, 2, 0.5]);
  });
});
