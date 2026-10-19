import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import { diagonalisationPowerEntry } from './diagonalisation-power-entry';
import { eigenDecoupledSystemState } from './eigen-decoupled-system-state';
import { migrationShareAfterYears } from './migration-share-after-years';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

type Mat = number[][];
const mul = (a: Mat, b: Mat): Mat =>
  a.map((row) =>
    (b[0] ?? []).map((_, j) => row.reduce((s, x, k) => s + x * (b[k]?.[j] ?? 0), 0) + 0),
  );
const apply = (a: Mat, x: number[]) =>
  a.map((row) => row.reduce((s, v, k) => s + v * (x[k] ?? 0), 0) + 0);

/**
 * The matrix with eigenvectors v₁, v₂ (columns of p) and eigenvalues λ₁, λ₂, rebuilt by solving
 * A·[v₁ v₂] = [λ₁v₁ λ₂v₂] with Cramer's rule: no use of the generator's helpers.
 */
function matrixFromEigen(p: Mat, l1: number, l2: number): Mat {
  const v1 = [p[0]?.[0] ?? 0, p[1]?.[0] ?? 0];
  const v2 = [p[0]?.[1] ?? 0, p[1]?.[1] ?? 0];
  const det = (v1[0] ?? 0) * (v2[1] ?? 0) - (v2[0] ?? 0) * (v1[1] ?? 0);
  // Row r of A is the (α, β) with α·v₁[0] + β·v₁[1] = λ₁v₁[r] and α·v₂[0] + β·v₂[1] = λ₂v₂[r].
  return [0, 1].map((r) => {
    const t1 = l1 * (v1[r] ?? 0);
    const t2 = l2 * (v2[r] ?? 0);
    const alpha = (t1 * (v2[1] ?? 0) - t2 * (v1[1] ?? 0)) / det;
    const beta = ((v1[0] ?? 0) * t2 - (v2[0] ?? 0) * t1) / det;
    return [alpha + 0, beta + 0];
  });
}

const power = (a: Mat, n: number) => {
  let r: Mat = [
    [1, 0],
    [0, 1],
  ];
  for (let k = 0; k < n; k++) r = mul(r, a);
  return r;
};

describe('diagonalisation-power-entry', () => {
  it('agrees with A multiplied by itself n times, and A has the stated eigenpairs', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(diagonalisationPowerEntry, seed);
        const [l1, l2] = p.lambda;
        const a = matrixFromEigen(p.p, l1, l2);
        for (const x of a.flat()) expect(Number.isInteger(x) && Math.abs(x) <= 12).toBe(true);
        expect(a[0]?.[1] !== 0 || a[1]?.[0] !== 0).toBe(true);
        // Av = λv for both columns of P.
        expect(apply(a, [p.p[0][0], p.p[1][0]])).toEqual([l1 * p.p[0][0] + 0, l1 * p.p[1][0] + 0]);
        expect(apply(a, [p.p[0][1], p.p[1][1]])).toEqual([l2 * p.p[0][1] + 0, l2 * p.p[1][1] + 0]);
        expect(l1).not.toBe(l2);
        expect(p.n >= 3 && p.n <= 6).toBe(true);
        const value = numericValue(answer);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBe(power(a, p.n)[p.i]?.[p.j]);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA203: A = (4, −1; 2, 1), A⁵ = (454, −211; 422, −179)', () => {
    const base = {
      p: [
        [1, 1],
        [2, 1],
      ] as [[number, number], [number, number]],
      lambda: [2, 3] as [number, number],
      n: 5,
    };
    const entries = ([0, 1] as const).flatMap((i) =>
      ([0, 1] as const).map((j) =>
        numericValue(diagonalisationPowerEntry.answer({ ...base, i, j })),
      ),
    );
    expect(entries).toEqual([454, -211, 422, -179]);
    expect(diagonalisationPowerEntry.stem({ ...base, i: 0, j: 1 })).toContain(
      '\\begin{pmatrix} 4 & -1 \\\\ 2 & 1 \\end{pmatrix}',
    );
    // a₁₂⁵ = −1, 5·a₁₂ = −5, (D⁵)₁₂ = 0, (P⁻¹D⁵P)₁₂ = 211.
    expect(
      diagonalisationPowerEntry.distractors({ ...base, i: 0, j: 1 }).map((d) => d.value),
    ).toEqual([-1, -5, 0, 211]);
  });
});

describe('eigen-decoupled-system-state', () => {
  it('agrees with stepping x_{t+1} = Ax_t forward t times', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(eigenDecoupledSystemState, seed);
        const [l1, l2] = p.lambda;
        const a = matrixFromEigen(p.p, l1, l2);
        for (const x of a.flat()) expect(Number.isInteger(x) && Math.abs(x) <= 12).toBe(true);
        let x = apply(p.p, p.c);
        for (const v of x) expect(v !== 0 && Math.abs(v) <= 20).toBe(true);
        for (let s = 0; s < p.t; s++) x = apply(a, x);
        const value = numericValue(answer);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBe(x[p.k]);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });
});

describe('migration-share-after-years', () => {
  it('agrees with moving the two populations year by year', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(migrationShareAfterYears, seed);
        const a = p.a / 100;
        const b = p.b / 100;
        let city = p.s0;
        let country = 100 - p.s0;
        for (let y = 0; y < p.n; y++) {
          [city, country] = [(1 - a) * city + b * country, a * city + (1 - b) * country];
        }
        expect(Math.abs(city + country - 100)).toBeLessThan(1e-9);
        const value = numericValue(answer);
        expect(Math.abs(value - city)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(Math.abs(value * 100 - Math.round(value * 100))).toBeLessThan(1e-6);
        expect(value > 0 && value < 100).toBe(true);
        // λ₂ = 1 − a − b stays between 0.1 and 0.9, and the start is not yet the long run.
        expect(p.a + p.b).toBeGreaterThanOrEqual(10);
        expect(p.a + p.b).toBeLessThanOrEqual(90);
        expect(Math.abs(value - (100 * p.b) / (p.a + p.b))).toBeGreaterThanOrEqual(1);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA203: a = 10 %, b = 20 %, 40 % in the city, 5 years → 62.18 %', () => {
    const p = { a: 10, b: 20, s0: 40, n: 5 };
    expect(numericValue(migrationShareAfterYears.answer(p))).toBe(62.18);
    expect(migrationShareAfterYears.steps(p)[0]?.result).toBeCloseTo(0.7, 12);
    expect(migrationShareAfterYears.distractors(p).map((d) => d.value)).toEqual([
      66.67, 34.45, 6.72, 48,
    ]);
  });
});
