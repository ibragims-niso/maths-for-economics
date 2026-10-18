import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cramerIncomeModel } from './cramer-income-model';
import { cramerTwoMarketPrice } from './cramer-two-market-price';
import { determinant3x3Cofactor } from './determinant-3x3-cofactor';
import type { Matrix3 } from './matrix';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const numericAnswer = <P>(gen: Generator<P>, p: P) => {
  const a = gen.answer(p);
  if (a.kind !== 'numeric') throw new Error('numeric expected');
  return a.value;
};

/** The determinant as the signed sum over all 6 permutations (Leibniz), not by cofactors. */
function leibniz(m: Matrix3): number {
  const perms: [number, number, number, number][] = [
    [0, 1, 2, 1],
    [1, 2, 0, 1],
    [2, 0, 1, 1],
    [2, 1, 0, -1],
    [0, 2, 1, -1],
    [1, 0, 2, -1],
  ];
  return perms.reduce(
    (s, [i, j, k, sign]) => s + sign * (m[0][i] ?? 0) * (m[1][j] ?? 0) * (m[2][k] ?? 0),
    0,
  );
}

/** Gaussian elimination with row swaps: det = ± product of the pivots. */
function eliminationDet(m: Matrix3): number {
  const a = m.map((r) => [...r]);
  let det = 1;
  for (let c = 0; c < 3; c++) {
    let pivot = c;
    for (let r = c + 1; r < 3; r++) {
      if (Math.abs(a[r]?.[c] ?? 0) > Math.abs(a[pivot]?.[c] ?? 0)) pivot = r;
    }
    const pr = a[pivot] as number[];
    if (pr[c] === 0) return 0;
    if (pivot !== c) {
      a[pivot] = a[c] as number[];
      a[c] = pr;
      det = -det;
    }
    const row = a[c] as number[];
    det *= row[c] as number;
    for (let r = c + 1; r < 3; r++) {
      const below = a[r] as number[];
      const f = (below[c] as number) / (row[c] as number);
      for (let k = c; k < 3; k++) below[k] = (below[k] as number) - f * (row[k] as number);
    }
  }
  return det;
}

describe('cramer-income-model', () => {
  it('solves both equations of the model when substituted back', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cramerIncomeModel, seed);
        // Solve by substitution instead: C = a + bY into Y = C + I + G.
        const y = (p.a + p.investment + p.government) / (1 - p.b);
        const c = p.a + p.b * y;
        expect(Math.abs(y - (c + p.investment + p.government))).toBeLessThan(1e-6);
        expect(Math.abs(value - (p.ask === 'Y' ? y : c))).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('gives a whole, positive answer from sensible parameters', () => {
    let askY = 0;
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cramerIncomeModel, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.b).toBeGreaterThan(0.5);
        expect(p.b).toBeLessThan(1);
        for (const x of [p.a, p.investment, p.government]) {
          expect(x).toBeGreaterThan(0);
          expect(x % 10).toBe(0);
        }
        if (p.ask === 'Y') askY++;
      }),
      RUNS,
    );
    // Both unknowns are asked for.
    expect(askY).toBeGreaterThan(300);
    expect(askY).toBeLessThan(700);
  });

  it('reproduces Example 1 in LA104 (C = 50 + 0.8Y, I = 150, G = 200)', () => {
    const p = { a: 50, b: 0.8, investment: 150, government: 200, ask: 'C' as const };
    expect(numericAnswer(cramerIncomeModel, p)).toBe(1650);
    expect(cramerIncomeModel.steps(p).map((s) => s.result)).toEqual([undefined, 0.2, 330, 1650]);
    expect(cramerIncomeModel.distractors(p)).toEqual([
      { value: 2000, mistakeCode: 'WRONG_COLUMN' },
      { value: 330, mistakeCode: 'NOT_DIVIDED' },
      { value: 0.0006, mistakeCode: 'INVERTED_CRAMER' },
      { value: -127.78, mistakeCode: 'DET_ADDED' },
    ]);
    expect(numericAnswer(cramerIncomeModel, { ...p, ask: 'Y' })).toBe(2000);
  });
});

describe('determinant-3x3-cofactor', () => {
  it('agrees with the permutation formula and with Gaussian elimination', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(determinant3x3Cofactor, seed);
        expect(value).toBe(leibniz(p.m));
        expect(Math.abs(value - eliminationDet(p.m))).toBeLessThan(1e-6);
        expect(value).not.toBe(0);
        expect(Number.isInteger(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('obeys the properties: a row swap flips the sign, transposing and adding a row multiple change nothing', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(determinant3x3Cofactor, seed);
        const [r1, r2, r3] = p.m;
        const swapped: Matrix3 = [r2, r1, r3];
        const transposed = [0, 1, 2].map((j) => p.m.map((r) => r[j])) as unknown as Matrix3;
        const added: Matrix3 = [r1, r2, [r3[0] + 2 * r1[0], r3[1] + 2 * r1[1], r3[2] + 2 * r1[2]]];
        expect(numericAnswer(determinant3x3Cofactor, { m: swapped })).toBe(-value);
        expect(numericAnswer(determinant3x3Cofactor, { m: transposed })).toBe(value);
        expect(numericAnswer(determinant3x3Cofactor, { m: added })).toBe(value);
      }),
      RUNS,
    );
  });

  it('keeps entries small and always shows all three mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, problem } = solve(determinant3x3Cofactor, seed);
        p.m.forEach((row, i) => {
          row.forEach((x, j) => {
            expect(Number.isInteger(x)).toBe(true);
            if (i === j) expect(x).toBeGreaterThanOrEqual(1);
            expect(Math.abs(x)).toBeLessThanOrEqual(7);
          });
        });
        expect(problem.distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA104', () => {
    const p = {
      m: [
        [4, -1, -1],
        [-2, 5, -1],
        [-1, -2, 3],
      ] as unknown as Matrix3,
    };
    expect(numericAnswer(determinant3x3Cofactor, p)).toBe(36);
    expect(determinant3x3Cofactor.steps(p).map((s) => s.result)).toEqual([13, -7, 9, 36, 36]);
    expect(determinant3x3Cofactor.distractors(p)).toEqual([
      { value: 50, mistakeCode: 'COFACTOR_SIGN' },
      { value: 74, mistakeCode: 'SARRUS_ADDED' },
      { value: 55, mistakeCode: 'DIAGONALS_ONLY' },
    ]);
  });
});

describe('cramer-two-market-price', () => {
  it('clears both markets at the prices (substitution, not Cramer)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cramerTwoMarketPrice, seed);
        // Eliminate P2 from the second equation instead of using determinants.
        const k1 = p.b1 + p.d1;
        const k2 = p.b2 + p.d2;
        const p1 = ((p.a1 + p.s1) * k2 + p.c1 * (p.a2 + p.s2)) / (k1 * k2 - p.c1 * p.c2);
        const p2 = (p.a2 + p.s2 + p.c2 * p1) / k2;
        expect(Math.abs(value - (p.ask === 1 ? p1 : p2))).toBeLessThan(1e-9);
        const q1d = p.a1 - p.b1 * p1 + p.c1 * p2;
        const q2d = p.a2 + p.c2 * p1 - p.b2 * p2;
        expect(Math.abs(q1d - (p.d1 * p1 - p.s1))).toBeLessThan(1e-9);
        expect(Math.abs(q2d - (p.d2 * p2 - p.s2))).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('gives whole, positive prices and quantities with substitutes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cramerTwoMarketPrice, seed);
        const k2 = p.b2 + p.d2;
        const p1 = p.ask === 1 ? value : (k2 * value - p.a2 - p.s2) / p.c2;
        const p2 = p.ask === 2 ? value : (p.a2 + p.s2 + p.c2 * p1) / k2;
        for (const x of [p1, p2]) {
          expect(Number.isInteger(Math.round(x * 1e9) / 1e9)).toBe(true);
          expect(x).toBeGreaterThanOrEqual(4);
          expect(x).toBeLessThanOrEqual(30);
        }
        expect(p.d1 * p1 - p.s1).toBeGreaterThan(0);
        expect(p.d2 * p2 - p.s2).toBeGreaterThan(0);
        expect(p.a1).toBeGreaterThan(0);
        expect(p.a2).toBeGreaterThan(0);
        expect(p.c1).toBeGreaterThan(0);
        expect(p.c2).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in LA104', () => {
    const p = {
      a1: 12,
      b1: 1,
      c1: 1,
      d1: 2,
      s1: 2,
      a2: 10,
      b2: 1,
      c2: 1,
      d2: 1,
      s2: 2,
      ask: 1 as const,
    };
    expect(numericAnswer(cramerTwoMarketPrice, p)).toBe(8);
    expect(numericAnswer(cramerTwoMarketPrice, { ...p, ask: 2 })).toBe(10);
    expect(cramerTwoMarketPrice.steps(p).map((s) => s.result)).toEqual([
      undefined,
      5,
      40,
      8,
      undefined,
    ]);
    expect(cramerTwoMarketPrice.distractors(p)).toEqual([
      { value: 10, mistakeCode: 'WRONG_COLUMN' },
      { value: 40, mistakeCode: 'NOT_DIVIDED' },
      { value: 0.125, mistakeCode: 'INVERTED_CRAMER' },
      { value: 2.29, mistakeCode: 'DET_ADDED' },
    ]);
  });
});
