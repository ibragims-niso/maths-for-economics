import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { parametricLpOptimalValue } from './parametric-lp-optimal-value';
import { profitCostRatioBestCorner } from './profit-cost-ratio-best-corner';
import { projectSelectionBestNpv } from './project-selection-best-npv';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
/** Searches over 1,000 seeds can pass 5 s on a busy machine. */
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

type Row = { a: number; b: number; c: number };

/** Every whole-number plan (x, y) ≥ 0 that satisfies both ≤ constraints. */
function wholePlans(rows: Row[]): [number, number][] {
  const xMax = Math.floor(Math.min(...rows.map((r) => r.c / r.a)));
  const yMax = Math.floor(Math.min(...rows.map((r) => r.c / r.b)));
  const out: [number, number][] = [];
  for (let x = 0; x <= xMax; x++) {
    for (let y = 0; y <= yMax; y++) {
      if (rows.every((r) => r.a * x + r.b * y <= r.c)) out.push([x, y]);
    }
  }
  return out;
}

/** Corners found the long way: every pair of boundary lines solved, keeping feasible points. */
function vertices(rows: Row[]): [number, number][] {
  const lines = [{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }, ...rows];
  const out: [number, number][] = [];
  for (const [i, u] of lines.entries()) {
    for (const v of lines.slice(i + 1)) {
      const det = u.a * v.b - u.b * v.a;
      if (Math.abs(det) < 1e-12) continue;
      const x = (u.c * v.b - u.b * v.c) / det;
      const y = (u.a * v.c - u.c * v.a) / det;
      if (x >= -1e-9 && y >= -1e-9 && rows.every((r) => r.a * x + r.b * y <= r.c + 1e-9))
        out.push([x + 0, y + 0]);
    }
  }
  return out;
}

const decimalsOf = (v: number) =>
  Number.isInteger(v) ? 0 : (String(v).split('.')[1] ?? '').length;

describe('profit-cost-ratio-best-corner', { timeout: SLOW }, () => {
  it('equals the largest ratio over every whole-number plan in the region', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(profitCostRatioBestCorner, seed);
        const rows = [p.region.first, p.region.second];
        // The corners are whole-number plans, so the best one is among them.
        let best = 0;
        for (const [x, y] of wholePlans(rows)) {
          best = Math.max(best, (p.p * x + p.q * y) / (p.u * x + p.w * y + p.fixed));
        }
        expect(Math.abs(best - value)).toBeLessThanOrEqual(0.005 + 1e-12);
      }),
      RUNS,
    );
  });

  it('lists the true corners, uses positive numbers and offers two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(profitCostRatioBestCorner, seed);
        const rows = [p.region.first, p.region.second];
        const vs = vertices(rows);
        expect(vs).toHaveLength(4);
        for (const [x, y] of vs) expect(problem.stem).toContain(`(${x}, ${y})`);
        expect(decimalsOf(value)).toBeLessThanOrEqual(2);
        expect(value).toBeGreaterThan(0);
        for (const n of [p.p, p.q, p.u, p.w, p.fixed]) expect(n).toBeGreaterThan(0);
        expect(problem.distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'MAX_PROFIT_CORNER',
          'SEPARATE_EXTREMES',
        ]);
        // The plan with the most profit is not the most profitable per unit of cost.
        const profits = vs.map(([x, y]) => p.p * x + p.q * y);
        const [rx, ry] = vs[profits.indexOf(Math.max(...profits))] ?? [0, 0];
        const atRichest = (p.p * rx + p.q * ry) / (p.u * rx + p.w * ry + p.fixed);
        expect(value - atRichest).toBeGreaterThan(0.01);
      }),
      RUNS,
    );
  });

  it('reproduces the profitability example in OP06 (3x + 2y over x + 2y + 10)', () => {
    const params = {
      region: { first: { a: 2, b: 1, c: 50 }, second: { a: 1, b: 2, c: 40 }, x: 20, y: 10 },
      p: 3,
      q: 2,
      u: 1,
      w: 2,
      fixed: 10,
    };
    expect(profitCostRatioBestCorner.answer(params)).toMatchObject({ value: 2.14 });
    expect(profitCostRatioBestCorner.distractors(params).map((d) => d.value)).toEqual([1.6, 8]);
  });
});

describe('project-selection-best-npv', { timeout: SLOW }, () => {
  it('equals the best total NPV found by dynamic programming over the budget', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(projectSelectionBestNpv, seed);
        // best[b] = largest NPV with at most b spent, adding projects one at a time.
        const best = new Array(p.budget + 1).fill(0);
        p.cost.forEach((c, i) => {
          for (let b = p.budget; b >= c; b--) best[b] = Math.max(best[b], best[b - c] + p.npv[i]);
        });
        expect(best[p.budget]).toBe(value);
      }),
      RUNS,
    );
  });

  it('has sensible projects and the wrong answers sit on the right side of the optimum', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(projectSelectionBestNpv, seed);
        expect(p.cost.length).toBeGreaterThanOrEqual(4);
        expect(p.cost.length).toBeLessThanOrEqual(5);
        for (const [i, c] of p.cost.entries()) {
          expect(c % 10).toBe(0);
          expect(c).toBeLessThanOrEqual(p.budget);
          expect(p.npv[i]).toBeGreaterThan(0);
          expect(Number.isInteger(p.npv[i])).toBe(true);
        }
        expect(p.cost.reduce((s, c) => s + c, 0)).toBeGreaterThan(p.budget);
        expect(Number.isInteger(value)).toBe(true);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of problem.distractors) {
          // Greedy rules give a feasible plan, so they can only fall short; the LP relaxation
          // allows a fraction of a project, so it can only overshoot.
          if (d.mistakeCode === 'FRACTIONAL_PROJECT') expect(d.value).toBeGreaterThan(value);
          else expect(d.value).toBeLessThan(value);
        }
        expect(problem.distractors.map((d) => d.mistakeCode)).toContain('GREEDY_LARGEST_NPV');
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in OP06 (budget 100, four projects)', () => {
    const params = { cost: [60, 30, 50, 80], npv: [11, 8, 10, 12], budget: 100 };
    expect(projectSelectionBestNpv.answer(params)).toMatchObject({ value: 19 });
    expect(projectSelectionBestNpv.distractors(params)).toEqual([
      { value: 12, mistakeCode: 'GREEDY_LARGEST_NPV' },
      { value: 18, mistakeCode: 'GREEDY_BEST_RATIO' },
      { value: 21.67, mistakeCode: 'FRACTIONAL_PROJECT' },
    ]);
  });
});

describe('parametric-lp-optimal-value', { timeout: SLOW }, () => {
  it('equals the best whole-number plan at the new profit, and the best plan has moved', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(parametricLpOptimalValue, seed);
        const plans = wholePlans([p.region.first, p.region.second]);
        const bestAt = (t: number) => {
          let top = -Infinity;
          let at: [number, number] = [0, 0];
          for (const [x, y] of plans) {
            const z = (p.base + t) * x + p.q * y;
            if (z > top) {
              top = z;
              at = [x, y];
            }
          }
          return { top, at };
        };
        // Corners are whole-number plans, so the LP optimum is among them.
        expect(bestAt(p.t).top).toBe(value);
        expect(bestAt(p.t).at).not.toEqual(bestAt(0).at);
      }),
      RUNS,
    );
  });

  it('keeps the profit per tonne positive and the optimal value piecewise linear and convex in t', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(parametricLpOptimalValue, seed);
        expect(p.t).not.toBe(0);
        expect(p.base + p.t).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        const vs = vertices([p.region.first, p.region.second]);
        expect(vs).toHaveLength(4);
        const z = (t: number) => Math.max(...vs.map(([x, y]) => (p.base + t) * x + p.q * y));
        // Convex: the value at a midpoint is never above the average of the ends.
        expect(z(p.t / 2)).toBeLessThanOrEqual((z(0) + z(p.t)) / 2 + 1e-9);
        expect(problem.distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'IGNORED_PARAMETER',
          'KEPT_OLD_PLAN',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in OP06 (cheese and butter, t = 2)', () => {
    const params = {
      region: { first: { a: 2, b: 1, c: 50 }, second: { a: 1, b: 2, c: 40 }, x: 20, y: 10 },
      base: 3,
      q: 2,
      t: 2,
    };
    expect(parametricLpOptimalValue.answer(params)).toMatchObject({ value: 125 });
    expect(parametricLpOptimalValue.distractors(params).map((d) => d.value)).toEqual([120, 80]);
  });
});
