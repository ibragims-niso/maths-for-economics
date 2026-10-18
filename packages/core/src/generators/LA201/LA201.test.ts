import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import { dependenceParameterK } from './dependence-parameter-k';
import { matrixRankElimination } from './matrix-rank-elimination';
import { replicatePayoffCoordinates } from './replicate-payoff-coordinates';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

/** Sarrus' rule for a 3×3 matrix given by its rows. */
const det3 = (m: number[][]) => {
  const e = (i: number, j: number) => m[i]?.[j] ?? 0;
  return (
    e(0, 0) * e(1, 1) * e(2, 2) +
    e(0, 1) * e(1, 2) * e(2, 0) +
    e(0, 2) * e(1, 0) * e(2, 1) -
    e(0, 2) * e(1, 1) * e(2, 0) -
    e(0, 0) * e(1, 2) * e(2, 1) -
    e(0, 1) * e(1, 0) * e(2, 2)
  );
};

/** All k-element subsets of 0..n−1. */
const subsets = (n: number, k: number): number[][] => {
  if (k === 0) return [[]];
  if (n < k) return [];
  return [...subsets(n - 1, k), ...subsets(n - 1, k - 1).map((s) => [...s, n - 1])];
};

/** The rank as the size of the largest non-zero minor: no elimination involved. */
const rankByMinors = (rows: number[][]) => {
  const m = rows.length;
  const n = rows[0]?.length ?? 0;
  const minor = (r: number[], c: number[]) => {
    const sub = r.map((i) => c.map((j) => rows[i]?.[j] ?? 0));
    if (r.length === 1) return sub[0]?.[0] ?? 0;
    if (r.length === 2)
      return (sub[0]?.[0] ?? 0) * (sub[1]?.[1] ?? 0) - (sub[0]?.[1] ?? 0) * (sub[1]?.[0] ?? 0);
    return det3(sub);
  };
  for (let k = Math.min(m, n); k >= 1; k--) {
    for (const r of subsets(m, k)) for (const c of subsets(n, k)) if (minor(r, c) !== 0) return k;
  }
  return 0;
};

describe('replicate-payoff-coordinates', () => {
  it('matches the only whole-number holding (found by search) that rebuilds the payoff', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(replicatePayoffCoordinates, seed);
        const x = [p.c[0] * p.a[0] + p.c[1] * p.b[0], p.c[0] * p.a[1] + p.c[1] * p.b[1]];
        const found: [number, number][] = [];
        for (let c1 = -20; c1 <= 20; c1++) {
          for (let c2 = -20; c2 <= 20; c2++) {
            if (c1 * p.a[0] + c2 * p.b[0] === x[0] && c1 * p.a[1] + c2 * p.b[1] === x[1])
              found.push([c1, c2]);
          }
        }
        expect(found).toHaveLength(1);
        expect(numericValue(answer)).toBe(found[0]?.[p.which]);
        expect(p.a[0] * p.b[1] - p.b[0] * p.a[1]).not.toBe(0);
        for (const v of [...p.a, ...p.b, ...p.c]) expect(Number.isInteger(v) && v >= 1).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA201: A = (2, 1), B = (3, 4), x = (13, 14) gives c = (2, 3)', () => {
    const pair = (x: number, y: number): [number, number] => [x, y];
    const params = { a: pair(2, 1), b: pair(3, 4), c: pair(2, 3), which: 0 as const };
    expect(numericValue(replicatePayoffCoordinates.answer(params))).toBe(2);
    expect(numericValue(replicatePayoffCoordinates.answer({ ...params, which: 1 }))).toBe(3);
    expect(replicatePayoffCoordinates.steps(params)[0]?.result).toBe(5);
    expect(replicatePayoffCoordinates.distractors(params).map((d) => d.value)).toEqual([
      13, 68, 7.6, 18.8,
    ]);
  });
});

describe('matrix-rank-elimination', () => {
  it('agrees with the size of the largest non-zero minor', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(matrixRankElimination, seed);
        const r = numericValue(answer);
        expect(r).toBe(rankByMinors(p.rows));
        expect([1, 2, 3]).toContain(r);
        expect(p.rows).toHaveLength(3);
        const cols = p.rows[0]?.length ?? 0;
        expect([3, 4]).toContain(cols);
        if (r > 1) expect(cols).toBe(4);
        for (const row of p.rows) {
          expect(row).toHaveLength(cols);
          expect(row.some((x) => x !== 0)).toBe(true);
          for (const x of row) expect(Number.isInteger(x) && Math.abs(x) <= 12).toBe(true);
        }
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        if (r === 3) {
          // The trap: two rows whose first two entries are proportional.
          const trap = subsets(3, 2).some(([i = 0, j = 0]) => {
            const a = p.rows[i] ?? [];
            const b = p.rows[j] ?? [];
            return (a[0] ?? 0) * (b[1] ?? 0) === (a[1] ?? 0) * (b[0] ?? 0);
          });
          expect(trap).toBe(true);
        }
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA201: the augmented matrix of the three-market model has rank 2', () => {
    const p = {
      rows: [
        [2, -1, 0, 4],
        [-1, 2, -1, 3],
        [1, 1, -1, 7],
      ],
    };
    expect(numericValue(matrixRankElimination.answer(p))).toBe(2);
    const steps = matrixRankElimination.steps(p);
    expect(steps).toHaveLength(3);
    expect(steps[0]?.latex).toContain('R_2 \\to 2R_2 + R_1');
    expect(steps[0]?.latex).toContain('R_3 \\to 2R_3 - R_1');
    expect(steps[1]?.latex).toContain('R_3 \\to R_3 - R_2');
    expect(matrixRankElimination.distractors(p).map((d) => d.value)).toEqual([3, 4]);
  });
});

describe('dependence-parameter-k', () => {
  it('makes the determinant zero at k, and only at k', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer } = makeProblem(dependenceParameterK, seed);
        const k = numericValue(answer);
        const withK = (value: number) =>
          [0, 1, 2].map((r) => [p.u[r] ?? 0, p.v[r] ?? 0, r === p.row ? value : (p.w[r] ?? 0)]);
        expect(det3(withK(k))).toBe(0);
        // The determinant is linear in k with a non-zero slope, so neighbours are not zero.
        expect(det3(withK(k + 1))).not.toBe(0);
        expect(det3(withK(k - 1)) + det3(withK(k + 1))).toBe(0);
        expect(Number.isInteger(k) && k !== 0 && Math.abs(k) <= 20).toBe(true);
        // u and v alone are independent, so w is then a combination of them.
        expect(rankByMinors(withK(k))).toBe(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in LA201: A = (1, 1, 1), B = (1, 2, 4), C = (3, 5, k) gives k = 9', () => {
    const p = { u: [1, 1, 1], v: [1, 2, 4], w: [3, 5, 9], row: 2 };
    expect(numericValue(dependenceParameterK.answer(p))).toBe(9);
    expect(dependenceParameterK.steps(p)[2]?.latex).toContain('k - 9');
    expect(dependenceParameterK.distractors(p).map((d) => d.value)).toEqual([-9, 12, -21]);
  });
});
