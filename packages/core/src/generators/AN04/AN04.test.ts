import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { budgetLineDistance } from './budget-line-distance';
import { budgetSetLargestBall } from './budget-set-largest-ball';
import { compactBudgetMaxUtility } from './compact-budget-max-utility';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, stem: pr.stem, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Is (x, y) in {x ≥ 0, y ≥ 0, p₁x + p₂y ≤ M}? A hair of slack for rounding. */
const inBudgetSet = (p1: number, p2: number, M: number, x: number, y: number) =>
  x >= -1e-9 && y >= -1e-9 && p1 * x + p2 * y <= M + 1e-9;

describe('budget-line-distance', () => {
  it('is the shortest distance to the line, found by searching along the line', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(budgetLineDistance, seed);
        // Points of the line: (t, (M − p₁t)/p₂). Search t for the closest one (convex in t).
        const dist = (t: number) => Math.hypot(t - p.a, (p.M - p.p1 * t) / p.p2 - p.b);
        let lo = -1000;
        let hi = 1000;
        for (let i = 0; i < 200; i++) {
          const m1 = lo + (hi - lo) / 3;
          const m2 = hi - (hi - lo) / 3;
          if (dist(m1) < dist(m2)) hi = m2;
          else lo = m1;
        }
        const best = dist((lo + hi) / 2);
        expect(Math.abs(best - value)).toBeLessThanOrEqual(0.005 + 1e-9);
        // No point of the line is closer than the answer (up to rounding).
        let nearest = Number.POSITIVE_INFINITY;
        for (let t = -50; t <= 250; t += 0.25) nearest = Math.min(nearest, dist(t));
        expect(nearest).toBeGreaterThan(value - 0.006);
        expect(p.p1 * p.a + p.p2 * p.b).not.toBe(p.M);
        expect(p.p1).toBeGreaterThan(0);
        expect(p.p2).toBeGreaterThan(0);
        expect(value).toBeGreaterThanOrEqual(0.2);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(stem.includes('2 decimal places')).toBe(!Number.isInteger(value));
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in AN04 ((2, 3) with p = (3, 4), M = 24 is 1.2 from the line)', () => {
    const p = { p1: 3, p2: 4, M: 24, a: 2, b: 3 };
    expect(budgetLineDistance.answer(p)).toMatchObject({ kind: 'numeric', value: 1.2 });
    const codes = budgetLineDistance.distractors(p);
    expect(codes).toContainEqual({ value: 6, mistakeCode: 'FORGOT_NORM' });
    expect(codes).toContainEqual({ value: 0.24, mistakeCode: 'SQUARED_NORM' });
    expect(codes).toContainEqual({ value: 1.5, mistakeCode: 'AXIS_ONLY' });
  });
});

describe('budget-set-largest-ball', () => {
  it('a slightly smaller ball fits inside the set and a slightly bigger one does not', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(budgetSetLargestBall, seed);
        const inside = (r: number) => {
          for (let k = 0; k < 720; k++) {
            const t = (k * Math.PI) / 360;
            const x = p.a + r * Math.cos(t);
            const y = p.b + r * Math.sin(t);
            if (!inBudgetSet(p.p1, p.p2, p.M, x, y)) return false;
          }
          return true;
        };
        // The true radius is within 0.005 of the 2-decimal answer.
        expect(inside(value - 0.01)).toBe(true);
        expect(inside(value + 0.01)).toBe(false);
        // The centre is strictly inside, and the corners are whole numbers.
        expect(p.a).toBeGreaterThan(0);
        expect(p.b).toBeGreaterThan(0);
        expect(p.p1 * p.a + p.p2 * p.b).toBeLessThan(p.M);
        expect(Number.isInteger(p.M / p.p1) && Number.isInteger(p.M / p.p2)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0.3);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in AN04: r = 1.2 at (2, 3) and r = 1 at (1, 3)', () => {
    const base = { p1: 3, p2: 4, M: 24 };
    expect(budgetSetLargestBall.answer({ ...base, a: 2, b: 3 })).toMatchObject({ value: 1.2 });
    expect(budgetSetLargestBall.answer({ ...base, a: 1, b: 3 })).toMatchObject({ value: 1 });
    const codes = budgetSetLargestBall.distractors({ ...base, a: 2, b: 3 });
    expect(codes).toContainEqual({ value: 2, mistakeCode: 'FORGOT_NORM' });
    expect(codes).toContainEqual({ value: 3.61, mistakeCode: 'VERTEX_DISTANCE' });
    expect(codes).toContainEqual({ value: 1.5, mistakeCode: 'AXIS_ONLY' });
    const axis = budgetSetLargestBall.distractors({ ...base, a: 1, b: 3 });
    expect(axis).toContainEqual({ value: 1.8, mistakeCode: 'IGNORED_AXES' });
  });
});

describe('compact-budget-max-utility', () => {
  it('no affordable bundle on a fine grid beats the answer, and the best bundle attains it', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(compactBudgetMaxUtility, seed);
        const U = (x: number, y: number) => (p.kind === 'cd' ? x * y : p.alpha * x + p.beta * y);
        const X = p.M / p.p1;
        const Y = p.M / p.p2;
        let best = Number.NEGATIVE_INFINITY;
        let bestBundle: [number, number] = [0, 0];
        const n = 120;
        for (let i = 0; i <= n; i++) {
          for (let j = 0; j <= n; j++) {
            const x = (X * i) / n;
            const y = (Y * j) / n;
            if (!inBudgetSet(p.p1, p.p2, p.M, x, y)) continue;
            const u = U(x, y);
            if (u > best) {
              best = u;
              bestBundle = [x, y];
            }
          }
        }
        // The grid includes the line's points with i + j = n, so it comes within 1 % of the max.
        expect(best).toBeLessThanOrEqual(value + 1e-9);
        expect(best).toBeGreaterThanOrEqual(value * 0.99 - 1e-9);
        // The best grid bundle spends (nearly) all income: the maximum is on the budget line.
        expect(p.p1 * bestBundle[0] + p.p2 * bestBundle[1]).toBeGreaterThan(p.M * 0.98);
        // Some affordable whole-number-friendly bundle attains the answer exactly.
        const cands: [number, number][] = [
          [X, 0],
          [0, Y],
          [X / 2, Y / 2],
        ];
        const attained = cands.filter(
          ([x, y]) => inBudgetSet(p.p1, p.p2, p.M, x, y) && Math.abs(U(x, y) - value) < 1e-9,
        );
        expect(attained.length).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        if (p.kind === 'linear') expect(p.alpha * p.p2).not.toBe(p.beta * p.p1);
      }),
      RUNS,
    );
  });

  it('reproduces Examples 2 and 3 in AN04 (xy gives 12; 2x + y gives 16 at (8, 0))', () => {
    const cd = { kind: 'cd' as const, alpha: 1, beta: 1, p1: 3, p2: 4, M: 24 };
    expect(compactBudgetMaxUtility.answer(cd)).toMatchObject({ value: 12 });
    const cdCodes = compactBudgetMaxUtility.distractors(cd);
    expect(cdCodes).toContainEqual({ value: 5.33, mistakeCode: 'CENTRE_VALUE' });
    expect(cdCodes).toContainEqual({ value: 48, mistakeCode: 'BOX_CORNER' });
    expect(cdCodes).toContainEqual({ value: 0, mistakeCode: 'CORNER_ONLY' });
    const lin = { kind: 'linear' as const, alpha: 2, beta: 1, p1: 3, p2: 4, M: 24 };
    expect(compactBudgetMaxUtility.answer(lin)).toMatchObject({ value: 16 });
    expect(compactBudgetMaxUtility.distractors(lin)).toContainEqual({
      value: 6,
      mistakeCode: 'WRONG_VERTEX',
    });
  });
});
