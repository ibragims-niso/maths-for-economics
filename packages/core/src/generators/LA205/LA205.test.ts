import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { fundamentalSolutionsCount, rankOf } from './fundamental-solutions-count';
import { tradeBalanceTwoCountries } from './trade-balance-two-countries';
import { incomeRatios, tradeModelThreeCountries } from './trade-model-three-countries';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

/** Rank by floating-point elimination with partial pivoting: a second route to the rank. */
function floatRank(rows: number[][]) {
  const m = rows.map((r) => r.map(Number));
  const n = m[0]?.length ?? 0;
  let rank = 0;
  for (let col = 0; col < n && rank < m.length; col++) {
    let best = rank;
    for (let i = rank + 1; i < m.length; i++)
      if (Math.abs(m[i]?.[col] ?? 0) > Math.abs(m[best]?.[col] ?? 0)) best = i;
    if (Math.abs(m[best]?.[col] ?? 0) < 1e-9) continue;
    [m[rank], m[best]] = [m[best] as number[], m[rank] as number[]];
    const top = m[rank] as number[];
    for (let i = rank + 1; i < m.length; i++) {
      const r = m[i] as number[];
      const f = (r[col] ?? 0) / (top[col] ?? 1);
      for (let j = 0; j < n; j++) r[j] = (r[j] ?? 0) - f * (top[j] ?? 0);
    }
    rank++;
  }
  return rank;
}

describe('fundamental-solutions-count', () => {
  it('equals the number of unknowns minus a rank found by a second elimination', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(fundamentalSolutionsCount, seed);
        const n = p.rows[0]?.length ?? 0;
        expect(floatRank(p.rows)).toBe(p.rank);
        expect(value).toBe(n - floatRank(p.rows));
        // A non-trivial solution exists: fewer independent equations than unknowns.
        expect(value).toBeGreaterThanOrEqual(1);
        expect(p.rows.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces LA205 Example 1 (3 equations, 4 unknowns, rank 2: two basic solutions)', () => {
    const rows = [
      [1, 2, -1, 1],
      [2, 4, -1, 3],
      [1, 2, 1, 3],
    ];
    expect(rankOf(rows)).toBe(2);
    expect(fundamentalSolutionsCount.answer({ rows, rank: 2 })).toMatchObject({ value: 2 });
    // The two basic solutions of the example really solve every equation.
    for (const v of [
      [-2, 1, 0, 0],
      [-2, 0, -1, 1],
    ])
      for (const r of rows) expect(r.reduce((s, c, j) => s + c * (v[j] ?? 0), 0)).toBe(0);
  });
});

describe('trade-balance-two-countries', () => {
  it('makes each country’s sales equal its income', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(tradeBalanceTwoCountries, seed);
        const a = p.a / 100;
        const b = p.b / 100;
        const sales1 = (1 - a) * p.x1 + b * value;
        const sales2 = a * p.x1 + (1 - b) * value;
        expect(Math.abs(sales1 - p.x1)).toBeLessThan(0.01);
        expect(Math.abs(sales2 - value)).toBeLessThan(0.01);
      }),
      RUNS,
    );
  });

  it('offers the flipped ratio, equal incomes and the home shares', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        expect(codes(solve(tradeBalanceTwoCountries, seed).distractors)).toEqual([
          'EQUAL_INCOMES',
          'RATIO_FLIPPED',
          'USED_HOME_SHARES',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces LA205 Example 2 (30 % and 20 %, x₁ = 200: x₂ = 300)', () => {
    expect(tradeBalanceTwoCountries.answer({ a: 30, b: 20, x1: 200 })).toMatchObject({
      value: 300,
    });
  });
});

describe('trade-model-three-countries', () => {
  it('has columns adding up to 1 and an income vector that power iteration also finds', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(tradeModelThreeCountries, seed);
        const A = p.tenths.map((r) => r.map((t) => t / 10));
        for (let j = 0; j < 3; j++) {
          expect(A.reduce((s, r) => s + (r[j] ?? 0), 0)).toBeCloseTo(1, 12);
        }
        // Repeated spending rounds A·x settle on the balanced income shares (eigenvalue 1).
        let x = [1, 1, 1];
        for (let k = 0; k < 400; k++)
          x = A.map((r) => r.reduce((s, c, j) => s + c * (x[j] ?? 0), 0));
        const ratio = (x[2] ?? 0) / (x[0] ?? 1);
        expect(Math.abs(p.x1 * ratio - value)).toBeLessThanOrEqual(0.005 + 1e-6);
        // And the answer really balances trade.
        const v = incomeRatios(p);
        const income = v.map((c) => (p.x1 * c) / v[0]);
        const sales = A.map((r) => r.reduce((s, c, j) => s + c * (income[j] ?? 0), 0));
        for (let i = 0; i < 3; i++)
          expect(Math.abs((sales[i] ?? 0) - (income[i] ?? 0))).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('reproduces LA205 Example 3 (ratios 19 : 24 : 21, x₁ = 190: x₃ = 210)', () => {
    const p = {
      tenths: [
        [4, 3, 2],
        [3, 5, 3],
        [3, 2, 5],
      ],
      x1: 190,
    };
    expect(incomeRatios(p)).toEqual([19, 24, 21]);
    expect(tradeModelThreeCountries.answer(p)).toMatchObject({ value: 210 });
  });
});
