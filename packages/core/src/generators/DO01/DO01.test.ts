import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { variationsAdjustmentPathValue } from './variations-adjustment-path-value';
import { variationsAdjustmentSaving } from './variations-adjustment-saving';
import { variationsStraightLinePath } from './variations-straight-line-path';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

/** True when x has at most d decimal places (up to floating-point noise). */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

const N = 200; // grid intervals (even, for Simpson's rule)

/** Simpson's rule for values sampled on an even grid of N intervals of width h. */
function simpson(values: number[], h: number): number {
  let s = (values[0] ?? 0) + (values[values.length - 1] ?? 0);
  for (let i = 1; i < values.length - 1; i++) s += (i % 2 ? 4 : 2) * (values[i] ?? 0);
  return (s * h) / 3;
}

/** The cost ∫(a·ẋ² + b·x²) dt of a path given by its values and slopes on the grid. */
const cost = (xs: number[], vs: number[], a: number, b: number, T: number) =>
  simpson(
    xs.map((x, i) => a * (vs[i] ?? 0) ** 2 + b * x * x),
    T / N,
  );

/**
 * Solves x″ = k²x from x(0) = A with slope v0 by Runge–Kutta steps, returning the values and
 * slopes on the grid. No closed form is used.
 */
function shoot(k2: number, A: number, v0: number, T: number) {
  const h = T / N;
  const xs = [A];
  const vs = [v0];
  let x = A;
  let v = v0;
  for (let i = 0; i < N; i++) {
    const k1x = v;
    const k1v = k2 * x;
    const k2x = v + (h / 2) * k1v;
    const k2v = k2 * (x + (h / 2) * k1x);
    const k3x = v + (h / 2) * k2v;
    const k3v = k2 * (x + (h / 2) * k2x);
    const k4x = v + h * k3v;
    const k4v = k2 * (x + h * k3x);
    x += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    xs.push(x);
    vs.push(v);
  }
  return { xs, vs };
}

/** The Euler–Lagrange path through x(0) = A and x(T) = B: x(T) is affine in the starting slope. */
function boundaryPath(k2: number, A: number, B: number, T: number) {
  const end0 = shoot(k2, A, 0, T).xs[N] ?? 0;
  const end1 = shoot(k2, A, 1, T).xs[N] ?? 0;
  return shoot(k2, A, (B - end0) / (end1 - end0), T);
}

describe('variations-straight-line-path', () => {
  it('beats every bent path with the same ends, and its level and cost agree with the grid', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(variationsStraightLinePath, seed);
        const B = p.start + p.speed * p.T;
        expect(p.start).toBeGreaterThan(0);
        expect(B).toBeGreaterThan(p.start);
        expect(p.t > 0 && p.t < p.T).toBe(true);
        expect(hasDecimals(value, 2)).toBe(true);
        // The straight line and bent paths x + ε·sin(πt/T), which keep both ends.
        const grid = Array.from({ length: N + 1 }, (_, i) => (p.T * i) / N);
        const pathCost = (eps: number) =>
          cost(
            grid.map((t) => p.start + p.speed * t + eps * Math.sin((Math.PI * t) / p.T)),
            grid.map((t) => p.speed + ((eps * Math.PI) / p.T) * Math.cos((Math.PI * t) / p.T)),
            p.c,
            0,
            p.T,
          );
        const best = pathCost(0);
        for (const eps of [-5, -0.5, 0.5, 5]) expect(pathCost(eps)).toBeGreaterThan(best);
        if (p.ask === 'value') {
          expect(2 * p.t).not.toBe(p.T);
          // Walk the path in small steps at the constant speed (B − A)/T.
          let x = p.start;
          for (let i = 0; i < 100 * p.t; i++) x += (B - p.start) / p.T / 100;
          expect(Math.abs(value - x)).toBeLessThan(1e-6);
          expect(codes(distractors)).toEqual(['FORGOT_START', 'MIDPOINT', 'SPEED_ONLY']);
        } else {
          expect(Math.abs(value - best)).toBeLessThan(1e-6 * Math.max(1, best));
          expect(codes(distractors)).toEqual(['CHANGE_AS_SPEED', 'FORGOT_SQUARE', 'SPEED_ONLY']);
        }
      }),
      RUNS,
    );
  });

  it('reproduces DO01 Example 1 (20 → 60 over 4 months: x(1) = 30, least cost 400)', () => {
    const base = { context: 'output' as const, T: 4, start: 20, speed: 10, c: 1, t: 1 };
    const level = variationsStraightLinePath.answer({ ...base, ask: 'value' });
    const least = variationsStraightLinePath.answer({ ...base, ask: 'cost' });
    expect(level.kind === 'numeric' && level.value).toBe(30);
    expect(least.kind === 'numeric' && least.value).toBe(400);
  });
});

describe('variations-adjustment-path-value', () => {
  it('equals the boundary-value problem x″ = (b/a)x solved by shooting', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(variationsAdjustmentPathValue, seed);
        const k2 = p.b / p.a;
        expect(Number.isInteger(Math.sqrt(k2) * 2)).toBe(true);
        expect(p.B).toBeGreaterThan(p.A);
        expect(p.A).toBeGreaterThanOrEqual(0);
        expect(hasDecimals(value, 2)).toBe(true);
        const { xs, vs } = boundaryPath(k2, p.A, p.B, p.T);
        expect(Math.abs((xs[N] ?? 0) - p.B)).toBeLessThan(1e-6);
        const i = Math.round((p.t / p.T) * N);
        expect(i * p.T).toBeCloseTo(p.t * N, 9);
        expect(Math.abs(value - (xs[i] ?? 0))).toBeLessThanOrEqual(0.005 + 1e-4);
        // Production stays positive and the path is cheaper than the straight line.
        expect(xs.every((x) => x >= -1e-9)).toBe(true);
        const line = cost(
          xs.map((_, j) => p.A + ((p.B - p.A) * j) / N),
          xs.map(() => (p.B - p.A) / p.T),
          p.a,
          p.b,
          p.T,
        );
        expect(cost(xs, vs, p.a, p.b, p.T)).toBeLessThan(line);
        const expected = ['EXP_ONLY', 'STRAIGHT_LINE', ...(k2 === 1 ? [] : ['K_SQUARED'])].sort();
        expect(codes(distractors)).toEqual(expected);
        for (const d of distractors) expect(Math.abs(d.value - value)).toBeGreaterThan(0.04);
      }),
      RUNS,
    );
  });

  it('reproduces DO01 Example 2 (a = b = 1, 0 → 10 over 2 years: x(1) = 3.24)', () => {
    const p = { a: 1, b: 1, T: 2, A: 0, B: 10, t: 1 };
    const answer = variationsAdjustmentPathValue.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(3.24);
    expect(variationsAdjustmentPathValue.steps(p)[2]?.result).toBe(1.3786);
  });
});

describe('variations-adjustment-saving', () => {
  it('equals the steady plan minus the shooting path, both costed by Simpson’s rule', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(variationsAdjustmentSaving, seed);
        const k2 = p.b / p.a;
        const { xs, vs } = boundaryPath(k2, 0, p.B, p.T);
        const best = cost(xs, vs, p.a, p.b, p.T);
        const line = cost(
          xs.map((_, j) => (p.B * j) / N),
          xs.map(() => p.B / p.T),
          p.a,
          p.b,
          p.T,
        );
        expect(Math.abs(value - (line - best))).toBeLessThanOrEqual(0.011 + 1e-6 * line);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(codes(distractors)).toEqual([
          'LINE_COST_ONLY',
          'OPTIMAL_NOT_SAVING',
          'SQUARED_AVERAGE',
        ]);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces DO01 Example 2 (straight line 116.67, best 103.73, extra 12.94)', () => {
    const p = { a: 1, b: 1, T: 2, B: 10 };
    const answer = variationsAdjustmentSaving.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(12.94);
    const steps = variationsAdjustmentSaving.steps(p);
    expect(steps[0]?.result).toBe(116.67);
    expect(steps[2]?.result).toBe(103.73);
  });
});
