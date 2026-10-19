import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { lpDualPriceThreeMachines } from './lp-dual-price-three-machines';
import { lpDualProfitChange } from './lp-dual-profit-change';
import { lpDualShadowPrice } from './lp-dual-shadow-price';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

type Row = { a: number; b: number; c: number };

/**
 * The maximum of p·x + q·y over {x, y ≥ 0, every row}, found the long way, without the
 * generators' helpers: every pair of boundary lines solved by elimination, best feasible point.
 */
function maxProfit(rows: Row[], p: number, q: number): number {
  const lines = [{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }, ...rows];
  let best = -Infinity;
  for (const [i, u] of lines.entries()) {
    for (const v of lines.slice(i + 1)) {
      const det = u.a * v.b - u.b * v.a;
      if (Math.abs(det) < 1e-12) continue;
      const x = (u.c * v.b - u.b * v.c) / det;
      const y = (u.a * v.c - u.c * v.a) / det;
      const fits = rows.every((r) => r.a * x + r.b * y <= r.c + 1e-9);
      if (x >= -1e-9 && y >= -1e-9 && fits) best = Math.max(best, p * x + q * y);
    }
  }
  return best;
}

/** Profit gained per extra hour of row i, by re-solving the LP with h more hours (h small). */
function marginalValue(rows: Row[], i: number, p: number, q: number, h = 1e-2): number {
  const more = rows.map((r, n) => (n === i ? { ...r, c: r.c + h } : r));
  return (maxProfit(more, p, q) - maxProfit(rows, p, q)) / h;
}

/** Dual feasibility: each product's hours valued at the prices are worth at least its profit. */
function dualFeasible(rows: Row[], prices: number[], p: number, q: number): boolean {
  const vx = rows.reduce((s, r, n) => s + r.a * (prices[n] ?? 0), 0);
  const vy = rows.reduce((s, r, n) => s + r.b * (prices[n] ?? 0), 0);
  return prices.every((y) => y >= -1e-6) && vx >= p - 1e-6 && vy >= q - 1e-6;
}

const decimalsOk = (v: number, d: number) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

describe('lp-dual-shadow-price', { timeout: SLOW }, () => {
  it('equals the profit gained per extra hour when the LP is solved again', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lpDualShadowPrice, seed);
        const rows = [...p.machines];
        expect(Math.abs(marginalValue(rows, p.asked, p.p, p.q) - value)).toBeLessThanOrEqual(
          0.005 + 1e-6,
        );
        expect(maxProfit(rows, p.p, p.q)).toBeCloseTo(p.p * p.x + p.q * p.y, 9);
      }),
      RUNS,
    );
  });

  it('gives dual prices that are feasible and match the maximum profit (strong duality)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(lpDualShadowPrice, seed);
        const rows = [...p.machines];
        const prices = [0, 1].map((i) => marginalValue(rows, i, p.p, p.q));
        expect(dualFeasible(rows, prices, p.p, p.q)).toBe(true);
        const dual = rows.reduce((s, r, n) => s + r.c * (prices[n] ?? 0), 0);
        expect(dual).toBeCloseTo(maxProfit(rows, p.p, p.q), 3);
      }),
      RUNS,
    );
  });

  it('uses whole positive inputs, a 2-decimal answer and at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(lpDualShadowPrice, seed);
        expect(decimalsOk(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
        for (const r of p.machines)
          for (const n of [r.a, r.b, r.c]) {
            expect(Number.isInteger(n)).toBe(true);
            expect(n).toBeGreaterThan(0);
          }
        for (const n of [p.p, p.q, p.x, p.y]) expect(n).toBeGreaterThan(0);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in OP03 (the bakery: oven 20, staff 10)', () => {
    const params = {
      machines: [
        { a: 1, b: 1, c: 40 },
        { a: 1, b: 2, c: 50 },
      ] as [Row, Row],
      p: 30,
      q: 40,
      x: 30,
      y: 10,
      asked: 0 as const,
    };
    expect(lpDualShadowPrice.answer(params)).toMatchObject({ value: 20 });
    expect(lpDualShadowPrice.answer({ ...params, asked: 1 })).toMatchObject({ value: 10 });
  });
});

describe('lp-dual-profit-change', { timeout: SLOW }, () => {
  it('equals the rise in maximum profit when the LP is solved again with the extra hours', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lpDualProfitChange, seed);
        const rows = [...p.machines];
        const more = rows.map((r, n) => (n === p.asked ? { ...r, c: r.c + p.extra } : r));
        expect(maxProfit(more, p.p, p.q) - maxProfit(rows, p.p, p.q)).toBeCloseTo(value, 6);
      }),
      RUNS,
    );
  });

  it('stays within the range: both machines are still fully used after the extra hours', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(lpDualProfitChange, seed);
        const rows = p.machines.map((r, n) => (n === p.asked ? { ...r, c: r.c + p.extra } : r));
        const [k, l] = rows as [Row, Row];
        const det = k.a * l.b - l.a * k.b;
        const x = (k.c * l.b - l.c * k.b) / det;
        const y = (k.a * l.c - l.a * k.c) / det;
        expect(x).toBeGreaterThan(0);
        expect(y).toBeGreaterThan(0);
        expect(p.p * x + p.q * y).toBeCloseTo(maxProfit(rows, p.p, p.q), 6);
      }),
      RUNS,
    );
  });

  it('uses whole numbers and offers at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(lpDualProfitChange, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        for (const n of [p.p, p.q, p.x, p.y, p.extra, ...p.prices]) {
          expect(Number.isInteger(n)).toBe(true);
          expect(n).toBeGreaterThan(0);
        }
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces the bakery: 5 more oven hours add 5 × 20 = 100', () => {
    const params = {
      machines: [
        { a: 1, b: 1, c: 40 },
        { a: 1, b: 2, c: 50 },
      ] as [Row, Row],
      p: 30,
      q: 40,
      x: 30,
      y: 10,
      prices: [20, 10] as [number, number],
      asked: 0 as const,
      extra: 5,
    };
    expect(lpDualProfitChange.answer(params)).toMatchObject({ value: 100 });
    expect(maxProfit([{ a: 1, b: 1, c: 45 }, params.machines[1]], 30, 40)).toBe(1400);
  });
});

describe('lp-dual-price-three-machines', { timeout: SLOW }, () => {
  it('equals the profit gained per extra hour of the named machine', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lpDualPriceThreeMachines, seed);
        const rows = [...p.machines];
        expect(Math.abs(marginalValue(rows, p.asked, p.p, p.q) - value)).toBeLessThanOrEqual(
          0.005 + 1e-6,
        );
      }),
      RUNS,
    );
  });

  it('obeys complementary slackness: the machine with spare hours has price 0', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(lpDualPriceThreeMachines, seed);
        const rows = [...p.machines];
        const prices = [0, 1, 2].map((i) => marginalValue(rows, i, p.p, p.q));
        expect(prices.filter((y) => Math.abs(y) < 1e-6)).toHaveLength(1);
        expect(dualFeasible(rows, prices, p.p, p.q)).toBe(true);
        const dual = rows.reduce((s, r, n) => s + r.c * (prices[n] ?? 0), 0);
        expect(dual).toBeCloseTo(maxProfit(rows, p.p, p.q), 3);
      }),
      RUNS,
    );
  });

  it('has a 2-decimal answer, asks about each machine and offers at least two wrong answers', () => {
    const asked = new Set<number>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(lpDualPriceThreeMachines, seed);
        asked.add(p.asked);
        expect(decimalsOk(value, 2)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
    expect(asked.size).toBe(3);
  });

  it('reproduces Example 2 in OP03 (the OP02 workshop: cutting 10, assembly 10, finishing 0)', () => {
    const base = {
      machines: [
        { a: 2, b: 1, c: 40 },
        { a: 1, b: 1, c: 24 },
        { a: 1, b: 3, c: 60 },
      ] as [Row, Row, Row],
      p: 30,
      q: 20,
      first: [16, 8] as [number, number],
      second: [6, 18] as [number, number],
    };
    const price = (asked: 0 | 1 | 2) => lpDualPriceThreeMachines.answer({ ...base, asked });
    expect(price(0)).toMatchObject({ value: 10 });
    expect(price(1)).toMatchObject({ value: 10 });
    expect(price(2)).toMatchObject({ value: 0 });
  });
});
