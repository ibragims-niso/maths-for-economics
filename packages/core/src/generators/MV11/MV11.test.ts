import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cobbDouglasConditionalLabour } from './cobb-douglas-conditional-labour';
import { cobbDouglasMinimumCost } from './cobb-douglas-minimum-cost';
import { costFunctionOutputScaling } from './cost-function-output-scaling';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode);
const isWhole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/**
 * The cheapest way to make Q with Q = A·K^α·L^β, found by searching along the isoquant
 * K(L) = (Q/(A·L^β))^(1/α) without any calculus. Cost is convex in ln L, so a ternary search
 * over ln L finds the minimum.
 */
function searchMinimum(A: number, a: number, b: number, w: number, r: number, Q: number) {
  const cost = (x: number) => {
    const L = Math.exp(x);
    return w * L + r * (Q / (A * L ** b)) ** (1 / a);
  };
  let lo = -30;
  let hi = 40;
  for (let k = 0; k < 160; k++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (cost(m1) < cost(m2)) hi = m2;
    else lo = m1;
  }
  const x = (lo + hi) / 2;
  return { L: Math.exp(x), cost: cost(x) };
}

describe('cobb-douglas-conditional-labour', () => {
  it('is the cheapest point on the isoquant (search over L) and meets the target', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cobbDouglasConditionalLabour, seed);
        const a = p.i / p.d;
        const b = p.j / p.d;
        expect(p.A * p.K ** a * p.L ** b).toBeCloseTo(p.Q, 6);
        const best = searchMinimum(p.A, a, b, p.w, p.r, p.Q);
        expect(Math.abs(best.L - value) / value).toBeLessThan(1e-6);
        expect(p.w * p.L + p.r * p.K).toBeCloseTo(best.cost, 4);
        // Neighbours on the isoquant cost more.
        const costAt = (L: number) => p.w * L + p.r * (p.Q / (p.A * L ** b)) ** (1 / a);
        expect(costAt(value * 0.99)).toBeGreaterThan(costAt(value));
        expect(costAt(value * 1.01)).toBeGreaterThan(costAt(value));
      }),
      RUNS,
    );
  });

  it('satisfies MRTS = w/r in whole numbers, with sensible prices and inputs', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(cobbDouglasConditionalLabour, seed);
        // (β/α)·(K/L) = w/r  ⇔  j·K·r = i·L·w.
        expect(p.j * p.K * p.r).toBe(p.i * p.L * p.w);
        expect(value).toBe(p.L);
        expect(isWhole(value)).toBe(true);
        expect(isWhole(p.K)).toBe(true);
        expect(Math.min(p.L, p.K)).toBeGreaterThanOrEqual(2);
        expect(Math.max(p.L, p.K)).toBeLessThanOrEqual(5000);
        expect(Math.max(p.w, p.r)).toBeLessThanOrEqual(150);
        expect(Math.min(p.w, p.r)).toBeGreaterThanOrEqual(1);
        expect(p.i === p.j && p.d === 2).toBe(false);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
        for (const c of codes(distractors))
          expect([
            'INVERTED_PRICE_RATIO',
            'EQUAL_EXPONENTS',
            'SWAPPED_EXPONENTS',
            'FORGOT_COEFFICIENT',
          ]).toContain(c);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (Q = 5K^(1/3)L^(2/3), w = 16, r = 1, Q̄ = 1000)', () => {
    const p = { A: 5, i: 1, j: 2, d: 3, w: 16, r: 1, Q: 1000, L: 100, K: 800, m: 2, n: 1 };
    expect(cobbDouglasConditionalLabour.answer(p)).toMatchObject({ kind: 'numeric', value: 100 });
    expect(cobbDouglasConditionalLabour.distractors(p).map((d) => d.value)).toEqual([
      634.96, 79.37, 63, 500,
    ]);
  });
});

describe('cobb-douglas-minimum-cost', () => {
  it('equals the lowest cost found by searching along the isoquant', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cobbDouglasMinimumCost, seed);
        const best = searchMinimum(p.A, p.i / p.d, p.j / p.d, p.w, p.r, p.Q);
        const target = p.ask === 'total' ? best.cost : best.cost / p.Q;
        expect(Math.abs(value - target)).toBeLessThanOrEqual(1e-4);
      }),
      RUNS,
    );
  });

  it('gives labour the cost share β/(α + β), in readable numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(cobbDouglasMinimumCost, seed);
        const C = p.w * p.L + p.r * p.K;
        // wL/C = j/(i + j) in whole numbers.
        expect(p.w * p.L * (p.i + p.j)).toBe(p.j * C);
        if (p.ask === 'total') expect(isWhole(value)).toBe(true);
        else {
          expect(twoDecimals(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0.5);
        }
        expect(C).toBeLessThanOrEqual(200000);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
        for (const c of codes(distractors))
          expect([
            'EQUAL_INPUTS',
            'LABOUR_COST_ONLY',
            'INVERTED_PRICE_RATIO',
            'TOTAL_NOT_AVERAGE',
          ]).toContain(c);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (minimum cost 2400, average cost 2.4)', () => {
    const base = { A: 5, i: 1, j: 2, d: 3, w: 16, r: 1, Q: 1000, L: 100, K: 800, m: 2, n: 1 };
    const total = { ...base, ask: 'total' as const };
    expect(cobbDouglasMinimumCost.answer(total)).toMatchObject({ value: 2400 });
    // Equal inputs: L = K = 200 costs 17·200; only the wage bill: 1600.
    expect(cobbDouglasMinimumCost.distractors(total).map((d) => d.value)).toEqual([
      3400, 1600, 10179.21,
    ]);
    expect(cobbDouglasMinimumCost.answer({ ...base, ask: 'average' })).toMatchObject({
      value: 2.4,
    });
  });
});

describe('cost-function-output-scaling', () => {
  it('matches the ratio of two searched minimum costs (w = 3, r = 5, any A)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costFunctionOutputScaling, seed);
        const a = p.a / 100;
        const b = p.b / 100;
        const c1 = searchMinimum(p.A, a, b, 3, 5, p.Q1).cost;
        const c2 = searchMinimum(p.A, a, b, 3, 5, p.Q2).cost;
        const predicted = (p.C1 * (p.pc / 100) * c2) / c1;
        expect(Math.abs(predicted - value) / value).toBeLessThan(1e-6);
        // The tabulated factor is t^(1/(α + β)).
        expect((p.Q2 / p.Q1) ** (1 / (a + b))).toBeCloseTo(p.fn / p.fd, 9);
      }),
      RUNS,
    );
  });

  it('gives a whole cost, never under constant returns, with sensible numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(costFunctionOutputScaling, seed);
        expect(isWhole(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(100);
        expect(value).toBeLessThanOrEqual(1_000_000);
        expect(p.a + p.b).not.toBe(100);
        expect(isWhole(p.Q1) && isWhole(p.Q2)).toBe(true);
        expect(Math.min(p.Q1, p.Q2)).toBeGreaterThanOrEqual(10);
        expect(p.Q1).not.toBe(p.Q2);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (Q = 2K^0.25L^0.25: cost 100 at Q = 10, 400 at Q = 20)', () => {
    const p = { A: 2, a: 25, b: 25, Q1: 10, C1: 100, Q2: 20, tn: 2, td: 1, fn: 4, fd: 1, pc: 100 };
    expect(costFunctionOutputScaling.answer(p)).toMatchObject({ kind: 'numeric', value: 400 });
    expect(costFunctionOutputScaling.distractors(p).map((d) => d.value)).toEqual([200, 141.42]);
    // Both input prices doubled as well: 800.
    expect(costFunctionOutputScaling.answer({ ...p, pc: 200 })).toMatchObject({ value: 800 });
  });
});
