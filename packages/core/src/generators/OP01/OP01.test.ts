import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { capacityMultiplierTwoProducts } from './capacity-multiplier-two-products';
import { quasilinearDemandCorner } from './quasilinear-demand-corner';
import { rationingQuotaOtherGood } from './rationing-quota-other-good';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

/** The maximiser of a concave function on [lo, hi], by ternary search (no formulas used). */
function argmax(f: (x: number) => number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  for (let i = 0; i < 100; i++) {
    const m1 = a + (b - a) / 3;
    const m2 = b - (b - a) / 3;
    if (f(m1) < f(m2)) a = m1;
    else b = m2;
  }
  return (a + b) / 2;
}

const decimalsOk = (v: number, d: number) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

describe('quasilinear-demand-corner', () => {
  it('matches a direct search along the budget line, corners included', () => {
    let corners = 0;
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(quasilinearDemandCorner, seed);
        // Utility rises with y, so the whole budget is spent: y = M − p·x, with 0 < x ≤ M/p.
        const u = (x: number) => p.a * Math.log(x) + (p.income - p.p * x);
        const best = argmax(u, 1e-9, p.income / p.p);
        expect(Math.abs(best - value)).toBeLessThan(1e-4);
        if (p.income - p.p * value < 1e-9) corners++;
      }),
      RUNS,
    );
    expect(corners).toBeGreaterThan(300);
    expect(corners).toBeLessThan(700);
  });

  it('satisfies the Kuhn–Tucker conditions at the answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: x } = solve(quasilinearDemandCorner, seed);
        const y = p.income - p.p * x;
        // λ from ∂L/∂x = a/x − pλ = 0 (x > 0); then ∂L/∂y = 1 − λ ≤ 0 and y·(1 − λ) = 0.
        const lambda = p.a / (p.p * x);
        expect(x).toBeGreaterThan(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(lambda).toBeGreaterThan(0);
        expect(1 - lambda).toBeLessThanOrEqual(1e-12);
        expect(Math.abs(y * (1 - lambda))).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('uses whole positive numbers and offers at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(quasilinearDemandCorner, seed);
        expect(Number.isInteger(value)).toBe(true);
        for (const n of [p.a, p.p, p.income]) {
          expect(Number.isInteger(n)).toBe(true);
          expect(n).toBeGreaterThan(0);
        }
        expect(p.income).not.toBe(p.a);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in OP01 (U = 24 ln x + y, price 4: x = 4 at income 16, 6 at 60)', () => {
    expect(quasilinearDemandCorner.answer({ a: 24, p: 4, income: 16 })).toMatchObject({
      value: 4,
    });
    expect(quasilinearDemandCorner.answer({ a: 24, p: 4, income: 60 })).toMatchObject({
      value: 6,
    });
  });
});

describe('rationing-quota-other-good', () => {
  it('matches a direct search over the x the ration allows', () => {
    let binding = 0;
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(rationingQuotaOtherGood, seed);
        const yOf = (x: number) => (p.income - p.px * x) / p.py;
        // ln U = a ln x + b ln y has the same maximiser and is concave along the budget line.
        const lnU = (x: number) => p.a * Math.log(x) + p.b * Math.log(yOf(x));
        const top = Math.min(p.quota, p.income / p.px);
        const x = argmax(lnU, 1e-9, top);
        expect(Math.abs(yOf(x) - value)).toBeLessThan(1e-4);
        if (Math.abs(x - p.quota) < 1e-6) binding++;
      }),
      RUNS,
    );
    expect(binding).toBeGreaterThan(500);
    expect(binding).toBeLessThan(850);
  });

  it('spends the whole income and respects the quota', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: y } = solve(rationingQuotaOtherGood, seed);
        const x = (p.income - p.py * y) / p.px;
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThanOrEqual(p.quota + 1e-9);
        expect(y).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('has a 2-decimal answer, whole positive inputs and at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(rationingQuotaOtherGood, seed);
        expect(decimalsOk(value, 2)).toBe(true);
        for (const n of [p.a, p.b, p.px, p.py, p.income, p.quota]) {
          expect(Number.isInteger(n)).toBe(true);
          expect(n).toBeGreaterThan(0);
        }
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in OP01 (U = xy, income 120, prices 3 and 2: y = 37.5 or 30)', () => {
    const base = { a: 1, b: 1, px: 3, py: 2, income: 120 };
    expect(rationingQuotaOtherGood.answer({ ...base, quota: 15 })).toMatchObject({ value: 37.5 });
    expect(rationingQuotaOtherGood.answer({ ...base, quota: 25 })).toMatchObject({ value: 30 });
  });
});

describe('capacity-multiplier-two-products', () => {
  /** Maximum profit with capacity k, searching over q1 with the best feasible q2 for each. */
  function maxProfit(p: { m1: number; b1: number; m2: number; b2: number }, k: number) {
    const best2 = (q1: number) => {
      const room = k - q1;
      const q2 = argmax((q) => p.m2 * q - p.b2 * q * q, 0, room);
      return p.m1 * q1 - p.b1 * q1 * q1 + p.m2 * q2 - p.b2 * q2 * q2;
    };
    return best2(argmax(best2, 0, k));
  }

  it('equals the rise in maximum profit per extra unit of capacity', () => {
    let slack = 0;
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(capacityMultiplierTwoProducts, seed);
        const h = 0.01;
        const slope = (maxProfit(p, p.capacity + h) - maxProfit(p, p.capacity - h)) / (2 * h);
        expect(Math.abs(slope - value)).toBeLessThan(1e-3);
        if (value === 0) slack++;
      }),
      { numRuns: 300 },
    );
    expect(slack).toBeGreaterThan(40);
  });

  it('satisfies the Kuhn–Tucker conditions: λ ≥ 0, feasible, complementary slackness', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value: lambda } = solve(capacityMultiplierTwoProducts, seed);
        const q1 = (p.m1 - lambda) / (2 * p.b1);
        const q2 = (p.m2 - lambda) / (2 * p.b2);
        expect(lambda).toBeGreaterThanOrEqual(0);
        expect(q1).toBeGreaterThan(0);
        expect(q2).toBeGreaterThan(0);
        expect(q1 + q2).toBeLessThanOrEqual(p.capacity + 1e-9);
        expect(Math.abs(lambda * (p.capacity - q1 - q2))).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('has a whole-number answer, readable free outputs and at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(capacityMultiplierTwoProducts, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(decimalsOk(p.m1 / (2 * p.b1), 2)).toBe(true);
        expect(decimalsOk(p.m2 / (2 * p.b2), 2)).toBe(true);
        for (const n of [p.m1, p.b1, p.m2, p.b2, p.capacity]) {
          expect(Number.isInteger(n)).toBe(true);
          expect(n).toBeGreaterThan(0);
        }
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in OP01 (bakery: λ = 10 at 35 batches, 0 at 45)', () => {
    const base = { m1: 50, b1: 1, m2: 70, b2: 2 };
    expect(capacityMultiplierTwoProducts.answer({ ...base, capacity: 35 })).toMatchObject({
      value: 10,
    });
    expect(capacityMultiplierTwoProducts.answer({ ...base, capacity: 45 })).toMatchObject({
      value: 0,
    });
    expect(maxProfit(base, 35)).toBeCloseTo(1200, 6);
  });
});
