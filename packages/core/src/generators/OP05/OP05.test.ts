import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { basicCells, leastCost, potentials, reducedCost } from './transport';
import { transportNorthWestCost } from './transport-north-west-cost';
import { transportReducedCostEmptyCell } from './transport-reduced-cost-empty-cell';
import { transportTwoSourceMinimumCost } from './transport-two-source-minimum-cost';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const total = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
const costOf = (plan: number[][], cost: number[][]) =>
  plan.reduce((s, r, i) => s + r.reduce((t, x, j) => t + x * (cost[i]?.[j] ?? 0), 0), 0);
const byCode = (ds: { value: number; mistakeCode: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/**
 * North-west corner plan in closed form: cell (i, j) gets the overlap of the interval of units
 * from source i, (S_{i−1}, S_i], with the interval for destination j, (D_{j−1}, D_j], where S
 * and D are running totals of the supplies and demands.
 */
function northWestByIntervals(supply: number[], demand: number[]): number[][] {
  const run = (xs: number[]) => xs.map((_, k) => total(xs.slice(0, k + 1)));
  const S = run(supply);
  const D = run(demand);
  return supply.map((_, i) =>
    demand.map((_, j) => {
      const lo = Math.max(S[i - 1] ?? 0, D[j - 1] ?? 0);
      const hi = Math.min(S[i] ?? 0, D[j] ?? 0);
      return Math.max(0, hi - lo);
    }),
  );
}

/** Row and column totals of a plan match the supplies and demands, with no negative cell. */
function feasible(plan: number[][], supply: number[], demand: number[]): boolean {
  return (
    plan.every((r, i) => total(r) === supply[i] && r.every((x) => x >= 0)) &&
    demand.every((d, j) => total(plan.map((r) => r[j] ?? 0)) === d)
  );
}

/** Every 2 × 3 plan with whole-number shipments, by trying all x₁₁ and x₁₂. */
function bruteForce2x3(supply: number[], demand: number[], cost: number[][]) {
  let best = Number.POSITIVE_INFINITY;
  let count = 0;
  const [a = 0] = supply;
  const [b1 = 0, b2 = 0, b3 = 0] = demand;
  for (let x11 = 0; x11 <= Math.min(a, b1); x11++) {
    for (let x12 = 0; x12 <= Math.min(a - x11, b2); x12++) {
      const x13 = a - x11 - x12;
      if (x13 > b3) continue;
      const plan = [
        [x11, x12, x13],
        [b1 - x11, b2 - x12, b3 - x13],
      ];
      const c = costOf(plan, cost);
      if (c < best) {
        best = c;
        count = 1;
      } else if (c === best) count++;
    }
  }
  return { best, count };
}

/** Every 3 × 3 plan with shipments in steps of `step`, by trying x₁₁, x₁₂, x₂₁, x₂₂. */
function bruteForce3x3(supply: number[], demand: number[], cost: number[][], step: number) {
  let best = Number.POSITIVE_INFINITY;
  const [s1 = 0, s2 = 0] = supply;
  const [d1 = 0, d2 = 0, d3 = 0] = demand;
  for (let a = 0; a <= s1; a += step)
    for (let b = 0; a + b <= s1; b += step)
      for (let c = 0; c <= s2; c += step)
        for (let e = 0; c + e <= s2; e += step) {
          const plan = [
            [a, b, s1 - a - b],
            [c, e, s2 - c - e],
            [d1 - a - c, d2 - b - e, d3 - (s1 - a - b) - (s2 - c - e)],
          ];
          if (feasible(plan, supply, demand)) best = Math.min(best, costOf(plan, cost));
        }
  return best;
}

/** The stepping-stone loop: a closed path from the empty cell through used cells, turning at each. */
function loopThrough(used: boolean[][], start: [number, number]): [number, number][] | null {
  const n = used.length;
  const walk = (path: [number, number][], alongRow: boolean): [number, number][] | null => {
    const [r, c] = path[path.length - 1] ?? start;
    for (let k = 0; k < n; k++) {
      const next: [number, number] = alongRow ? [r, k] : [k, c];
      if (next[0] === r && next[1] === c) continue;
      if (next[0] === start[0] && next[1] === start[1]) {
        if (path.length >= 4 && path.length % 2 === 0) return path;
        continue;
      }
      if (!used[next[0]]?.[next[1]]) continue;
      if (path.some(([pr, pc]) => pr === next[0] && pc === next[1])) continue;
      const found = walk([...path, next], !alongRow);
      if (found) return found;
    }
    return null;
  };
  return walk([start], true) ?? walk([start], false);
}

describe('transport-north-west-cost', () => {
  it('equals the cost of the plan built from overlapping running totals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(transportNorthWestCost, seed);
        const plan = northWestByIntervals(p.supply, p.demand);
        expect(feasible(plan, p.supply, p.demand)).toBe(true);
        expect(value).toBe(costOf(plan, p.cost));
        // Non-degenerate: exactly m + n − 1 cells are used.
        expect(plan.flat().filter((x) => x > 0).length).toBe(p.supply.length + 2);
        expect(Number.isInteger(value) && value > 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('draws balanced, readable problems and the distractors described in the topic', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(transportNorthWestCost, seed);
        expect([2, 3]).toContain(p.supply.length);
        expect(p.demand.length).toBe(3);
        expect(total(p.supply)).toBe(total(p.demand));
        for (const x of [...p.supply, ...p.demand]) {
          expect(x % 10 === 0 && x >= 20 && x <= 90).toBe(true);
        }
        const all = p.cost.flat();
        expect(new Set(all).size).toBe(all.length);
        expect(all.every((c) => Number.isInteger(c) && c >= 2 && c <= 15)).toBe(true);
        const codes = byCode(distractors);
        expect(distractors.length).toBe(3);
        expect(codes.LEAST_COST_RULE).toBe(costOf(leastCost(p.supply, p.demand, p.cost), p.cost));
        // The last north-west cell is the bottom-right corner.
        const m = p.supply.length;
        const last = northWestByIntervals(p.supply, p.demand)[m - 1]?.[2] ?? 0;
        expect(codes.MISSED_ALLOCATION).toBe(value - last * (p.cost[m - 1]?.[2] ?? 0));
        expect(codes.AVERAGE_COST).toBeCloseTo((total(p.supply) * total(all)) / all.length, 2);
      }),
      RUNS,
    );
  });

  it('reproduces OP05 Example 1 (north-west plan of the cement problem costs 730)', () => {
    const p = {
      context: 'cement' as const,
      supply: [50, 70],
      demand: [30, 40, 50],
      cost: [
        [4, 8, 3],
        [6, 5, 7],
      ],
    };
    expect(transportNorthWestCost.answer(p)).toMatchObject({ kind: 'numeric', value: 730 });
    expect(northWestByIntervals(p.supply, p.demand)).toEqual([
      [30, 20, 0],
      [0, 20, 50],
    ]);
    // With 10 t of spare capacity at P₂ a dummy site (cost 0) takes it; the cost is unchanged.
    const dummy = northWestByIntervals([50, 80], [30, 40, 50, 10]);
    expect(dummy).toEqual([
      [30, 20, 0, 0],
      [0, 20, 50, 10],
    ]);
    expect(costOf(dummy, [p.cost[0]?.concat(0) ?? [], p.cost[1]?.concat(0) ?? []])).toBe(730);
  });
});

describe('transport-two-source-minimum-cost', () => {
  it('equals the cheapest of all whole-number plans, which is unique', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(transportTwoSourceMinimumCost, seed);
        const { best, count } = bruteForce2x3(p.supply, p.demand, p.cost);
        expect(value).toBe(best);
        expect(count).toBe(1);
        expect(Number.isInteger(value) && value > 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('has balanced amounts and distractors that miss the optimum for the stated reasons', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(transportTwoSourceMinimumCost, seed);
        expect(p.supply.length).toBe(2);
        expect(total(p.supply)).toBe(total(p.demand));
        const codes = byCode(distractors);
        const nw = costOf(northWestByIntervals(p.supply, p.demand), p.cost);
        expect(codes.NORTH_WEST_START).toBe(nw);
        expect(nw).toBeGreaterThan(value);
        // Each destination from its cheaper source: cheaper than any feasible plan here.
        const free = p.demand.reduce(
          (s, d, j) => s + d * Math.min(p.cost[0]?.[j] ?? 0, p.cost[1]?.[j] ?? 0),
          0,
        );
        expect(codes.IGNORED_SUPPLY_LIMIT).toBe(free);
        expect(free).toBeLessThan(value);
        if ('LEAST_COST_START' in codes) expect(codes.LEAST_COST_START).toBeGreaterThan(value);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces the two-source shortcut in OP05 (cement problem: 530 against 730)', () => {
    const p = {
      context: 'cement' as const,
      supply: [50, 70],
      demand: [30, 40, 50],
      cost: [
        [4, 8, 3],
        [6, 5, 7],
      ],
    };
    expect(transportTwoSourceMinimumCost.answer(p)).toMatchObject({ kind: 'numeric', value: 530 });
    expect(bruteForce2x3(p.supply, p.demand, p.cost).best).toBe(530);
    expect(byCode(transportTwoSourceMinimumCost.distractors(p))).toEqual({
      NORTH_WEST_START: 730,
      IGNORED_SUPPLY_LIMIT: 470,
    });
  });
});

describe('transport-reduced-cost-empty-cell', () => {
  it('equals the change in total cost from shipping one unit around the stepping-stone loop', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(transportReducedCostEmptyCell, seed);
        const plan = northWestByIntervals(p.supply, p.demand);
        const used = plan.map((r) => r.map((x) => x > 0));
        expect(used.flat().filter(Boolean).length).toBe(5);
        expect(used[p.i - 1]?.[p.j - 1]).toBe(false);
        const loop = loopThrough(used, [p.i - 1, p.j - 1]);
        expect(loop).not.toBeNull();
        const moved = plan.map((r) => [...r]);
        (loop ?? []).forEach(([r, c], k) => {
          const row = moved[r] as number[];
          row[c] = (row[c] ?? 0) + (k % 2 === 0 ? 1 : -1);
        });
        expect(feasible(moved, p.supply, p.demand)).toBe(true);
        expect(value).toBe(costOf(moved, p.cost) - costOf(plan, p.cost));
        expect(Number.isInteger(value) && value !== 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('gives the sign-reversed and implied-cost distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(transportReducedCostEmptyCell, seed);
        const codes = byCode(distractors);
        expect(codes.REDUCED_SIGN).toBe(-value);
        expect(codes.IMPLIED_COST).toBe((p.cost[p.i - 1]?.[p.j - 1] ?? 0) - value);
      }),
      RUNS,
    );
  });

  it('reproduces OP05 Examples 2 and 3 (least-cost plan 630, Δ₁₁ = −3, optimum 570)', () => {
    const supply = [30, 40, 70];
    const demand = [60, 50, 30];
    const cost = [
      [6, 3, 7],
      [10, 4, 11],
      [5, 12, 2],
    ];
    const lc = leastCost(supply, demand, cost);
    expect(lc).toEqual([
      [0, 30, 0],
      [20, 20, 0],
      [40, 0, 30],
    ]);
    expect(costOf(lc, cost)).toBe(630);
    expect(costOf(northWestByIntervals(supply, demand), cost)).toBe(1060);
    const { u, v } = potentials(basicCells(lc), cost, 3, 3);
    expect(u).toEqual([0, 1, -4]);
    expect(v).toEqual([9, 3, 6]);
    expect(reducedCost(cost, u, v, 0, 0)).toBe(-3);
    const improved = [
      [20, 10, 0],
      [0, 40, 0],
      [40, 0, 30],
    ];
    expect(feasible(improved, supply, demand)).toBe(true);
    expect(costOf(improved, cost)).toBe(630 - 3 * 20);
    expect(bruteForce3x3(supply, demand, cost, 1)).toBe(570);
  });
});
