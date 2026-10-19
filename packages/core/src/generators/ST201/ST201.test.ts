import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import type { JointTable } from './joint-table';
import { jointTableConditionalProbability } from './joint-table-conditional-probability';
import { jointTableCovariance } from './joint-table-covariance';
import { twoAssetPortfolioRisk } from './two-asset-portfolio-risk';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

/**
 * Probabilities are in hundredths, so the table is exactly 100 equally likely households (or
 * months): the pair (x, y) appears cells[i][j] times. Counting in this list needs no formula.
 */
function hundredPairs(t: JointTable): [number, number][] {
  const pairs: [number, number][] = [];
  t.xs.forEach((x, i) => {
    t.ys.forEach((y, j) => {
      for (let k = 0; k < (t.cells[i]?.[j] ?? 0); k++) pairs.push([x, y]);
    });
  });
  return pairs;
}
const average = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

function checkTable(t: JointTable) {
  const all = t.cells.flat();
  expect(t.cells).toHaveLength(2);
  expect([2, 3]).toContain(t.ys.length);
  expect(t.cells.every((row) => row.length === t.ys.length)).toBe(true);
  expect(all.every((c) => c % 5 === 0 && c >= 5 && c <= 45)).toBe(true);
  expect(all.reduce((s, c) => s + c, 0)).toBe(100);
  for (const vs of [t.xs, t.ys]) {
    for (let k = 1; k < vs.length; k++) {
      expect(vs[k]).toBeGreaterThan(vs[k - 1] ?? Number.NEGATIVE_INFINITY);
    }
  }
  if (t.context === 'spending') {
    expect(t.xs.every((x) => x >= 1)).toBe(true); // income is positive
    expect(t.ys.every((y) => y >= 0)).toBe(true); // spending is never negative
  } else {
    expect([...t.xs, ...t.ys].every((r) => r % 5 === 0 && r >= -20 && r <= 30)).toBe(true);
  }
}

describe('joint-table-conditional-probability', () => {
  it('equals the share of the matching households among those meeting the condition', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(jointTableConditionalProbability, seed);
        checkTable(p.table);
        const x = p.table.xs[p.i];
        const y = p.table.ys[p.j];
        const pairs = hundredPairs(p.table);
        const meeting = pairs.filter(([a, b]) => (p.given === 'X' ? a === x : b === y));
        const both = meeting.filter(([a, b]) => a === x && b === y);
        expect(Math.abs(value - both.length / meeting.length)).toBeLessThanOrEqual(0.0005 + 1e-9);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasDecimals(value, 3)).toBe(true);
        // The condition matters: the answer differs from the probability without it.
        const without = pairs.filter(([a, b]) => (p.given === 'X' ? b === y : a === x)).length;
        expect(Math.abs(value - without / 100)).toBeGreaterThan(0.01);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST201 (P(Y = 3 | X = 4) = 0.5)', () => {
    const table: JointTable = {
      context: 'spending',
      xs: [2, 4],
      ys: [1, 2, 3],
      cells: [
        [25, 15, 10],
        [10, 15, 25],
      ],
    };
    const p = { table, given: 'X' as const, i: 1, j: 2 };
    expect(jointTableConditionalProbability.answer(p)).toMatchObject({ value: 0.5 });
    const byCode = Object.fromEntries(
      jointTableConditionalProbability.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      JOINT_FOR_CONDITIONAL: 0.25,
      WRONG_MARGINAL: 0.714,
      IGNORED_CONDITION: 0.35,
    });
    const reverse = { table, given: 'Y' as const, i: 1, j: 2 };
    expect(jointTableConditionalProbability.answer(reverse)).toMatchObject({ value: 0.714 });
  });
});

describe('joint-table-covariance', () => {
  it('equals the average product of deviations over 100 equally likely months', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(jointTableCovariance, seed);
        checkTable(p.table);
        const pairs = hundredPairs(p.table);
        const mx = average(pairs.map(([x]) => x));
        const my = average(pairs.map(([, y]) => y));
        const cov = average(pairs.map(([x, y]) => (x - mx) * (y - my)));
        expect(Math.abs(value - cov)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        // A clear co-movement: the correlation is at least 0.1 in size, and never above 1.
        const sx = Math.sqrt(average(pairs.map(([x]) => (x - mx) ** 2)));
        const sy = Math.sqrt(average(pairs.map(([, y]) => (y - my) ** 2)));
        expect(Math.abs(cov / (sx * sy))).toBeGreaterThanOrEqual(0.1);
        expect(Math.abs(cov / (sx * sy))).toBeLessThanOrEqual(1 + 1e-12);
      }),
      RUNS,
    );
  });

  it('gives both positive and negative covariances', () => {
    const signs = new Set<number>();
    for (let seed = 1; seed <= 200; seed++) {
      signs.add(Math.sign(solve(jointTableCovariance, seed).value));
    }
    expect(signs).toEqual(new Set([1, -1]));
  });

  it('reproduces worked example 2 in ST201 (Cov = 60)', () => {
    const table: JointTable = {
      context: 'shares',
      xs: [-10, 20],
      ys: [-5, 15],
      cells: [
        [35, 15],
        [15, 35],
      ],
    };
    expect(jointTableCovariance.answer({ table })).toMatchObject({ value: 60 });
    // With 0.5 and 0.5 the simple averages equal the weighted ones, so SIMPLE_MEANS drops out.
    expect(jointTableCovariance.distractors({ table })).toEqual([
      { value: 85, mistakeCode: 'NO_PRODUCT_OF_MEANS' },
      { value: -60, mistakeCode: 'REVERSED_ORDER' },
    ]);
  });
});

describe('two-asset-portfolio-risk', () => {
  /**
   * Builds two returns with exactly the given σ₁, σ₂ and ρ from two independent fair ±1 coins
   * (four equally likely states), then measures the portfolio's spread state by state.
   */
  function spreadByStates(w: number, s1: number, s2: number, r: number) {
    const states: [number, number][] = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    const returns = states.map(([z1, z2]) => {
      const r1 = s1 * z1;
      const r2 = s2 * (r * z1 + Math.sqrt(1 - r * r) * z2);
      return w * r1 + (1 - w) * r2;
    });
    const m = average(returns);
    return average(returns.map((x) => (x - m) ** 2));
  }

  it('equals the variance of the portfolio return over four equally likely states', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(twoAssetPortfolioRisk, seed);
        const w = p.weight / 100;
        const v = spreadByStates(w, p.sd1, p.sd2, p.rho / 10);
        const expected = p.ask === 'variance' ? v : Math.sqrt(v);
        expect(Math.abs(value - expected)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('diversifies: the risk lies between |wσ₁ − (1 − w)σ₂| and the weighted average of the SDs', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(twoAssetPortfolioRisk, seed);
        const w = p.weight / 100;
        expect(w).toBeGreaterThanOrEqual(0.1);
        expect(w).toBeLessThanOrEqual(0.9);
        expect(p.rho).not.toBe(0);
        expect(Math.abs(p.rho)).toBeLessThanOrEqual(9);
        const sd = p.ask === 'sd' ? value : Math.sqrt(value);
        expect(sd).toBeLessThan(w * p.sd1 + (1 - w) * p.sd2);
        expect(sd).toBeGreaterThan(Math.abs(w * p.sd1 - (1 - w) * p.sd2) - 0.01);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST201 (w = 0.6, σ = 20 % and 10 %, ρ = −0.2)', () => {
    const base = { context: 'funds' as const, weight: 60, sd1: 20, sd2: 10, rho: -2 };
    expect(twoAssetPortfolioRisk.answer({ ...base, ask: 'variance' })).toMatchObject({
      value: 140.8,
    });
    expect(twoAssetPortfolioRisk.answer({ ...base, ask: 'sd' })).toMatchObject({ value: 11.87 });
    const byCode = Object.fromEntries(
      twoAssetPortfolioRisk
        .distractors({ ...base, ask: 'sd' })
        .map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      NO_COVARIANCE_TERM: 12.65,
      WEIGHTED_SD_AVERAGE: 16,
      WEIGHTS_NOT_SQUARED: 16.15,
      NO_SQUARE_ROOT: 140.8,
    });
  });
});
