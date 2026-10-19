import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { dpBudgetAllocationBestReturn } from './dp-budget-allocation-best-return';
import { dpCakeEatingFirstConsumption } from './dp-cake-eating-first-consumption';
import { dpStagedRouteLeastCost } from './dp-staged-route-least-cost';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
/** Searches over 1,000 seeds can pass 5 s on a busy machine. */
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

type Net = { sizes: number[]; cost: number[][][] };

/** Every route cost, found by walking forwards from S with a stack (no stage-by-stage values). */
function routeCosts(net: Net): number[] {
  const layers = [1, ...net.sizes, 1];
  const out: number[] = [];
  const stack: [layer: number, node: number, cost: number][] = [[0, 0, 0]];
  while (stack.length > 0) {
    const [s, i, c] = stack.pop() ?? [0, 0, 0];
    if (s === layers.length - 1) {
      out.push(c);
      continue;
    }
    for (let j = 0; j < (layers[s + 1] ?? 0); j++)
      stack.push([s + 1, j, c + (net.cost[s]?.[i]?.[j] ?? Number.NaN)]);
  }
  return out;
}

/** The myopic driver: cheapest road out of the current town, every time. */
function myopic(net: Net): number {
  let i = 0;
  let total = 0;
  for (const stage of net.cost) {
    const row = stage[i] ?? [];
    const m = Math.min(...row);
    total += m;
    i = row.indexOf(m);
  }
  return total;
}

describe('dp-staged-route-least-cost', { timeout: SLOW }, () => {
  it('equals the cheapest of all routes listed one by one, and beats the myopic route', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(dpStagedRouteLeastCost, seed);
        const layers = [1, ...p.sizes, 1];
        expect(p.cost.length).toBe(layers.length - 1);
        p.cost.forEach((stage, s) => {
          expect(stage.length).toBe(layers[s]);
          for (const row of stage) {
            expect(row.length).toBe(layers[s + 1]);
            for (const c of row) {
              expect(Number.isInteger(c)).toBe(true);
              expect(c).toBeGreaterThanOrEqual(1);
              expect(c).toBeLessThanOrEqual(9);
            }
          }
        });
        const all = routeCosts(p).sort((a, b) => a - b);
        expect(all.length).toBe(layers.reduce((a, b) => a * b, 1));
        expect(value).toBe(all[0]);
        expect(all[1]).toBeGreaterThan(value);
        expect(myopic(p)).toBeGreaterThan(value);
        expect(codes(problem.distractors)).toEqual(['GREEDY_PATH', 'LONGEST_PATH', 'STAGE_MINIMA']);
        for (const d of problem.distractors) {
          if (d.mistakeCode === 'GREEDY_PATH') expect(d.value).toBe(myopic(p));
          if (d.mistakeCode === 'LONGEST_PATH') expect(d.value).toBe(all[all.length - 1]);
          if (d.mistakeCode === 'STAGE_MINIMA') expect(d.value).toBeLessThan(value);
        }
        // Every road appears in the question.
        expect((problem.stem.match(/\\to /g) ?? []).length).toBe(p.cost.flat(2).length);
      }),
      RUNS,
    );
  });

  it('reproduces DO03 Example 1 (cheapest route 10 via S–B–C–T)', () => {
    const p = {
      sizes: [2, 2],
      cost: [
        [[2, 4]],
        [
          [8, 4],
          [3, 1],
        ],
        [[3], [6]],
      ],
    };
    expect(dpStagedRouteLeastCost.answer(p)).toMatchObject({ value: 10 });
    expect(dpStagedRouteLeastCost.distractors(p).map((d) => d.value)).toEqual([12, 13, 6]);
    const steps = dpStagedRouteLeastCost.steps(p);
    expect(steps[steps.length - 1]?.latex).toContain('S\\to B\\to C\\to T');
  });
});

type Alloc = { units: number; returns: number[][] };

/** The best total from spending at most the budget, by checking every amount for each region. */
function bruteForce(p: Alloc) {
  const totals: number[] = [];
  for (let a = 0; a <= p.units; a++)
    for (let b = 0; b <= p.units; b++)
      for (let c = 0; c <= p.units; c++)
        if (a + b + c <= p.units)
          totals.push(
            (p.returns[0]?.[a] ?? 0) + (p.returns[1]?.[b] ?? 0) + (p.returns[2]?.[c] ?? 0),
          );
  return totals.sort((x, y) => y - x);
}

describe('dp-budget-allocation-best-return', { timeout: SLOW }, () => {
  it('equals the best of every way to spend the budget, which the one-unit-at-a-time rule misses', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(dpBudgetAllocationBestReturn, seed);
        expect(p.units).toBeGreaterThanOrEqual(3);
        expect(p.units).toBeLessThanOrEqual(5);
        expect(p.returns.length).toBe(3);
        for (const row of p.returns) {
          expect(row.length).toBe(p.units + 1);
          expect(row[0]).toBe(0);
          for (let u = 1; u <= p.units; u++) {
            expect(Number.isInteger(row[u])).toBe(true);
            expect(row[u] ?? 0).toBeGreaterThan(row[u - 1] ?? 0);
          }
        }
        const totals = bruteForce(p);
        expect(value).toBe(totals[0]);
        // Increasing returns: spending the whole budget is best, and only one split achieves it.
        let count = 0;
        for (let a = 0; a <= p.units; a++)
          for (let b = 0; a + b <= p.units; b++) {
            const c = p.units - a - b;
            const t =
              (p.returns[0]?.[a] ?? 0) + (p.returns[1]?.[b] ?? 0) + (p.returns[2]?.[c] ?? 0);
            if (t === value) count++;
          }
        expect(count).toBe(1);
        expect(codes(problem.distractors)).toEqual(['ALL_IN_ONE', 'GREEDY_UNIT', 'IGNORE_BUDGET']);
        for (const d of problem.distractors) {
          expect(Number.isInteger(d.value)).toBe(true);
          if (d.mistakeCode === 'IGNORE_BUDGET') expect(d.value).toBeGreaterThan(value);
          else expect(d.value).toBeLessThan(value);
        }
      }),
      RUNS,
    );
  });

  it('reproduces DO03 Example 2 (4 units, best 21 with 1, 2, 1)', () => {
    const p = {
      units: 4,
      returns: [
        [0, 6, 10, 12, 13],
        [0, 3, 10, 13, 15],
        [0, 5, 7, 8, 9],
      ],
    };
    expect(dpBudgetAllocationBestReturn.answer(p)).toMatchObject({ value: 21 });
    expect(dpBudgetAllocationBestReturn.distractors(p).map((d) => d.value)).toEqual([18, 15, 37]);
    const steps = dpBudgetAllocationBestReturn.steps(p);
    expect(steps[1]?.latex).toContain('f_2(4) = 18');
    expect(steps[3]?.latex).toContain('\\text{A}: 1,\\ \\text{B}: 2,\\ \\text{C}: 1');
  });
});

/** The largest value of a single-peaked function on (lo, hi), by ternary search. */
function argmax(f: (x: number) => number, lo: number, hi: number) {
  let a = lo;
  let b = hi;
  for (let k = 0; k < 50; k++) {
    const m1 = a + (b - a) / 3;
    const m2 = b - (b - a) / 3;
    if (f(m1) < f(m2)) a = m1;
    else b = m2;
  }
  return (a + b) / 2;
}

/** Best discounted log utility from x over n years, found numerically year by year. */
function best(n: number, beta: number, x: number): number {
  if (n === 1) return Math.log(x);
  const f = (c: number) => Math.log(c) + beta * best(n - 1, beta, x - c);
  return f(argmax(f, 1e-9 * x, x * (1 - 1e-9)));
}

describe('dp-cake-eating-first-consumption', { timeout: SLOW }, () => {
  it('matches a numerical search over first-year consumption', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(dpCakeEatingFirstConsumption, seed);
        expect([2, 3]).toContain(p.periods);
        expect(p.beta).toBeGreaterThan(0);
        expect(p.beta).toBeLessThan(1);
        expect(p.wealth).toBeGreaterThan(0);
        expect(Math.round(value * 100)).toBeCloseTo(value * 100, 6);
        const f = (c: number) => Math.log(c) + p.beta * best(p.periods - 1, p.beta, p.wealth - c);
        const c0 = argmax(f, 1e-9 * p.wealth, p.wealth * (1 - 1e-9));
        expect(Math.abs(c0 - value)).toBeLessThan(0.006);
        // Impatience: more now than an equal split, but less than the whole cake.
        expect(value).toBeGreaterThan(p.wealth / p.periods);
        expect(value).toBeLessThan(p.wealth);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(3);
        for (const d of problem.distractors)
          if (d.mistakeCode === 'EQUAL_SPLIT') expect(d.value).toBeCloseTo(p.wealth / p.periods, 2);
      }),
      RUNS,
    );
  });

  it('reproduces DO03 Example 3 (100 over 3 years, β = 0.9: c₀ = 36.90)', () => {
    const p = { periods: 3 as const, beta: 0.9, wealth: 100 };
    expect(dpCakeEatingFirstConsumption.answer(p)).toMatchObject({ value: 36.9 });
    expect(dpCakeEatingFirstConsumption.distractors(p).map((d) => d.value)).toEqual([
      33.33, 29.89, 10, 52.63,
    ]);
  });
});
