import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { lpMaxProfitTwoProducts } from './lp-max-profit-two-products';
import { lpMinCostFeedBlend } from './lp-min-cost-feed-blend';
import { lpUnusedHoursAtOptimum } from './lp-unused-hours-at-optimum';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
/** Grid searches over 1,000 seeds can pass 5 s on a busy machine. */
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

type Row = { a: number; b: number; c: number };

/**
 * Corners found the long way, without the generators' helpers: every pair of boundary lines
 * (constraints and axes) solved by elimination, keeping the points that satisfy everything.
 */
function vertices(rows: Row[], sense: 'le' | 'ge'): [number, number][] {
  const lines = [{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }, ...rows];
  const out: [number, number][] = [];
  for (const [i, u] of lines.entries()) {
    for (const v of lines.slice(i + 1)) {
      const det = u.a * v.b - u.b * v.a;
      if (Math.abs(det) < 1e-12) continue;
      const x = (u.c * v.b - u.b * v.c) / det;
      const y = (u.a * v.c - u.c * v.a) / det;
      const fits = rows.every((r) =>
        sense === 'le' ? r.a * x + r.b * y <= r.c + 1e-9 : r.a * x + r.b * y >= r.c - 1e-9,
      );
      if (x >= -1e-9 && y >= -1e-9 && fits) out.push([x, y]);
    }
  }
  return out;
}

/** Best whole-number plan in a box, by trying every one. */
function gridBest(
  rows: Row[],
  sense: 'le' | 'ge',
  p: number,
  q: number,
  xMax: number,
  yMax: number,
) {
  let best = sense === 'le' ? -Infinity : Infinity;
  let at: [number, number] = [0, 0];
  for (let x = 0; x <= xMax; x++) {
    for (let y = 0; y <= yMax; y++) {
      const fits = rows.every((r) =>
        sense === 'le' ? r.a * x + r.b * y <= r.c : r.a * x + r.b * y >= r.c,
      );
      const v = p * x + q * y;
      if (fits && (sense === 'le' ? v > best : v < best)) {
        best = v;
        at = [x, y];
      }
    }
  }
  return { best, at };
}

describe('lp-max-profit-two-products', { timeout: SLOW }, () => {
  it('equals the best whole-number plan and the best corner found independently', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lpMaxProfitTwoProducts, seed);
        const rows = [p.cutting, p.assembly];
        const xMax = Math.floor(Math.min(...rows.map((r) => r.c / r.a)));
        const yMax = Math.floor(Math.min(...rows.map((r) => r.c / r.b)));
        expect(gridBest(rows, 'le', p.p, p.q, xMax, yMax).best).toBe(value);
        const corner = Math.max(...vertices(rows, 'le').map(([x, y]) => p.p * x + p.q * y));
        expect(corner).toBeCloseTo(value, 9);
      }),
      RUNS,
    );
  });

  it('uses positive whole numbers and offers at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(lpMaxProfitTwoProducts, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        for (const n of [p.p, p.q, p.x, p.y, p.cutting.c, p.assembly.c]) {
          expect(Number.isInteger(n)).toBe(true);
          expect(n).toBeGreaterThan(0);
        }
        expect(vertices([p.cutting, p.assembly], 'le')).toHaveLength(4);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of problem.distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in OP02 (30x + 40y, x + y ≤ 40, x + 2y ≤ 50)', () => {
    const params = {
      cutting: { a: 1, b: 1, c: 40 },
      assembly: { a: 1, b: 2, c: 50 },
      p: 30,
      q: 40,
      x: 30,
      y: 10,
    };
    expect(lpMaxProfitTwoProducts.answer(params)).toMatchObject({ value: 1300 });
    expect(lpMaxProfitTwoProducts.distractors(params).map((d) => d.value)).toEqual([1200, 1500]);
  });
});

const MACHINES = ['welding', 'painting', 'assembly'];

describe('lp-unused-hours-at-optimum', { timeout: SLOW }, () => {
  it('equals the spare hours of the named machine at the best whole-number plan', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(lpUnusedHoursAtOptimum, seed);
        const rows = [...p.machines];
        const xMax = Math.floor(Math.min(...rows.map((r) => r.c / r.a)));
        const yMax = Math.floor(Math.min(...rows.map((r) => r.c / r.b)));
        const { best, at } = gridBest(rows, 'le', p.p, p.q, xMax, yMax);
        const corner = Math.max(...vertices(rows, 'le').map(([x, y]) => p.p * x + p.q * y));
        expect(corner).toBeCloseTo(best, 9);
        const slack = rows.map((r) => r.c - r.a * at[0] - r.b * at[1]);
        // Exactly one machine has hours to spare at the optimum, and the stem asks about it.
        expect(slack.filter((s) => s > 0)).toHaveLength(1);
        const named = MACHINES.findIndex((m) => problem.stem.includes(`many ${m} hours`));
        expect(slack[named]).toBe(value);
        expect(value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('has five corners, whole numbers and at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(lpUnusedHoursAtOptimum, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(vertices([...p.machines], 'le')).toHaveLength(5);
        for (const r of p.machines) for (const n of [r.a, r.b, r.c]) expect(n).toBeGreaterThan(0);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in OP02 (finishing, here called assembly, has 20 hours to spare)', () => {
    const params = {
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
    expect(lpUnusedHoursAtOptimum.answer(params)).toMatchObject({ value: 20 });
    expect(lpUnusedHoursAtOptimum.steps(params)[2]?.result).toBe(640);
  });
});

describe('lp-min-cost-feed-blend', { timeout: SLOW }, () => {
  it('equals the cheapest whole-number blend and the cheapest corner found independently', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lpMinCostFeedBlend, seed);
        const rows = [p.protein, p.fibre];
        // The cheapest corner lies within the box spanned by the two axis corners.
        const xMax = Math.ceil(Math.max(...rows.map((r) => r.c / r.a)));
        const yMax = Math.ceil(Math.max(...rows.map((r) => r.c / r.b)));
        expect(gridBest(rows, 'ge', p.costA, p.costB, xMax, yMax).best).toBe(value);
        const corner = Math.min(...vertices(rows, 'ge').map(([x, y]) => p.costA * x + p.costB * y));
        expect(corner).toBeCloseTo(value, 9);
        // Buying nothing does not meet the requirements.
        expect(rows.every((r) => r.c > 0)).toBe(true);
      }),
      RUNS,
    );
  });

  it('uses positive whole numbers and offers wrong answers below and above', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(lpMinCostFeedBlend, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(vertices([p.protein, p.fibre], 'ge')).toHaveLength(3);
        for (const n of [p.costA, p.costB, p.x, p.y]) expect(n).toBeGreaterThan(0);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces the blend in OP02 (3x + 2y, 2x + y ≥ 16, x + 2y ≥ 20)', () => {
    const params = {
      protein: { a: 2, b: 1, c: 16 },
      fibre: { a: 1, b: 2, c: 20 },
      costA: 3,
      costB: 2,
      x: 4,
      y: 8,
    };
    expect(lpMinCostFeedBlend.answer(params)).toMatchObject({ value: 28 });
    expect(lpMinCostFeedBlend.distractors(params).map((d) => d.mistakeCode)).toContain(
      'INFEASIBLE_ORIGIN',
    );
  });
});
