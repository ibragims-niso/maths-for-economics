import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { matrixChainPlantCost } from './matrix-chain-plant-cost';
import { matrixProductRevenueEntry } from './matrix-product-revenue-entry';
import { transitionMatrixTwoStep } from './transition-matrix-two-step';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

type M = readonly (readonly number[])[];

/** Matrix product by the triple loop, written independently of the generators' helpers. */
function multiply(a: M, b: M): number[][] {
  const n = b.length;
  if ((a[0]?.length ?? 0) !== n) throw new Error('sizes do not match');
  return a.map((ra) =>
    (b[0] ?? []).map((_, j) => {
      let s = 0;
      for (let k = 0; k < n; k++) s += (ra[k] ?? 0) * (b[k]?.[j] ?? 0);
      return s;
    }),
  );
}

const transpose = (a: M): number[][] => (a[0] ?? []).map((_, j) => a.map((r) => r[j] ?? 0));
const at = (a: M, i: number, j: number) => a[i - 1]?.[j - 1] ?? Number.NaN;
/** True when x has at most d decimal places. */
const decimals = (x: number, d: number) => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('matrix-product-revenue-entry', () => {
  it('equals the entry of QP, and of (PᵀQᵀ)ᵀ, computed by loops', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(matrixProductRevenueEntry, seed);
        const qp = multiply(p.q, p.p);
        expect(qp.length).toBe(2);
        expect(qp[0]?.length).toBe(2);
        expect(value).toBe(at(qp, p.i, p.j));
        // (QP)ᵀ = PᵀQᵀ: the same number sits at (j, i) of the transposed product.
        expect(value).toBe(at(multiply(transpose(p.p), transpose(p.q)), p.j, p.i));
      }),
      RUNS,
    );
  });

  it('is a shop’s revenue: quantity × price summed over the goods; distractors as described', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(matrixProductRevenueEntry, seed);
        let revenue = 0;
        for (let good = 1; good <= 3; good++) revenue += at(p.q, p.i, good) * at(p.p, good, p.j);
        expect(value).toBe(revenue);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        for (const r of p.q) for (const x of r) expect(x >= 5 && x <= 60 && x % 5 === 0).toBe(true);
        for (const r of p.p) for (const x of r) expect(Number.isInteger(x) && x >= 1).toBe(true);
        const pq = multiply(p.p, p.q);
        expect(pq.length).toBe(3);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        expect(byCode.ORDER_SWAPPED).toBe(at(pq, p.i, p.j));
        if (p.i !== p.j) expect(byCode.INDICES_SWAPPED).toBe(at(multiply(p.q, p.p), p.j, p.i));
        expect(distractors.length).toBe(p.i === p.j ? 2 : 3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in LA102 ((QP)₁₂ = 235)', () => {
    const p = {
      goods: 0,
      q: [
        [40, 25, 10],
        [30, 50, 20],
      ],
      p: [
        [2, 3],
        [3, 3],
        [5, 4],
      ],
      i: 1,
      j: 2,
    } as const;
    expect(matrixProductRevenueEntry.answer(p)).toMatchObject({ kind: 'numeric', value: 235 });
    const codes = Object.fromEntries(
      matrixProductRevenueEntry.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({ INDICES_SWAPPED: 310, ORDER_SWAPPED: 200, TOTALS_MULTIPLIED: 750 });
  });
});

describe('transition-matrix-two-step', () => {
  const matrix = (p: { out: number; back: number }) => [
    [1 - p.out / 100, p.out / 100],
    [p.back / 100, 1 - p.back / 100],
  ];

  it('equals the share in state j after pushing everyone from state i through T twice', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(transitionMatrixTwoStep, seed);
        const t = matrix(p);
        // Start with everyone in state i and move them one period at a time.
        let shares = [p.i === 1 ? 1 : 0, p.i === 2 ? 1 : 0];
        for (let step = 0; step < 2; step++) {
          shares = [0, 1].map((to) =>
            [0, 1].reduce((s, from) => s + (shares[from] ?? 0) * (t[from]?.[to] ?? 0), 0),
          );
        }
        expect(Math.abs(value - (shares[p.j - 1] ?? Number.NaN))).toBeLessThan(1e-9);
        // The shares still add up to 1: nobody disappears.
        expect((shares[0] ?? 0) + (shares[1] ?? 0)).toBeCloseTo(1, 12);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: a proper transition matrix and an exact 4-decimal answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(transitionMatrixTwoStep, seed);
        expect(p.out).toBeGreaterThan(0);
        expect(p.back).toBeGreaterThan(0);
        expect(p.out).toBeLessThan(100);
        expect(p.back).toBeLessThan(100);
        expect(p.out).not.toBe(p.back);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(decimals(value, 4)).toBe(true);
        expect(distractors.length).toBe(p.i === p.j ? 3 : 4);
        for (const d of distractors) expect(decimals(d.value, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in LA102 (employed now, unemployed in two years: 0.15)', () => {
    const p = { context: 'jobs', out: 10, back: 40, i: 1, j: 2 } as const;
    expect(transitionMatrixTwoStep.answer(p)).toMatchObject({ kind: 'numeric', value: 0.15 });
    const codes = Object.fromEntries(
      transitionMatrixTwoStep.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({ ROW_BY_ROW: 0.42, ONE_PATH: 0.09, ENTRY_SQUARED: 0.01, ONE_STEP: 0.1 });
  });
});

describe('matrix-chain-plant-cost', () => {
  it('equals the i-th entry of (XR)w, and the double sum over products and inputs', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(matrixChainPlantCost, seed);
        // Associativity: group the other way, plant input needs XR first, then prices.
        const xr = multiply(p.x, p.r);
        const needs = xr[p.i - 1] ?? [];
        const viaNeeds = needs.reduce((s, n, l) => s + n * (p.w[l] ?? 0), 0);
        expect(value).toBe(viaNeeds);
        let brute = 0;
        for (let k = 1; k <= 2; k++)
          for (let l = 1; l <= 3; l++) brute += at(p.x, p.i, k) * at(p.r, k, l) * (p.w[l - 1] ?? 0);
        expect(value).toBe(brute);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive whole inputs, outputs, prices and cost', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(matrixChainPlantCost, seed);
        for (const m of [p.r, p.x]) {
          for (const r of m) for (const x of r) expect(Number.isInteger(x) && x > 0).toBe(true);
        }
        for (const x of p.w) expect(Number.isInteger(x) && x > 0).toBe(true);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'COLUMN_FOR_ROW',
          'TOTALS_MULTIPLIED',
        ]);
      }),
      RUNS,
    );
  });
});
