import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { characteristicEquationLargerRoot } from './characteristic-equation-larger-root';
import { multiplierAcceleratorIncome } from './multiplier-accelerator-income';
import { secondOrderIteratedValue } from './second-order-iterated-value';

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

/** The larger size |r| of the two roots of r² + a₁r + a₂ = 0, real or complex. */
function largestRootSize(a1: number, a2: number): number {
  const d = a1 * a1 - 4 * a2;
  if (d < 0) return Math.sqrt(a2);
  return Math.max(Math.abs((-a1 + Math.sqrt(d)) / 2), Math.abs((-a1 - Math.sqrt(d)) / 2));
}

describe('second-order-iterated-value', () => {
  it('follows the gap to the steady state and satisfies the original equation', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(secondOrderIteratedValue, seed);
        const a1 = p.a1Tenths / 10;
        const a2 = p.a2Tenths / 10;
        const b = (p.steady * (10 + p.a1Tenths + p.a2Tenths)) / 10;
        expect(Number.isInteger(b)).toBe(true);
        // y* = b/(1 + a₁ + a₂) is a fixed point of the equation.
        expect(Math.abs(p.steady * (1 + a1 + a2) - b)).toBeLessThan(1e-9);
        // Route 2: the gaps z = y − y* follow the homogeneous equation z(t+2) = −a₁z(t+1) − a₂z(t).
        const z = [p.y0 - p.steady, p.y1 - p.steady];
        for (let t = 2; t <= p.n; t++) z.push(-a1 * (z[t - 1] ?? 0) - a2 * (z[t - 2] ?? 0));
        const y = z.map((g) => g + p.steady);
        expect(Math.abs(value - (y[p.n] ?? 0))).toBeLessThanOrEqual(0.005 + 1e-9);
        // Substituting back: y(t+2) + a₁y(t+1) + a₂y(t) = b at every step.
        for (let t = 0; t + 2 <= p.n; t++) {
          expect(
            Math.abs((y[t + 2] ?? 0) + a1 * (y[t + 1] ?? 0) + a2 * (y[t] ?? 0) - b),
          ).toBeLessThan(1e-6);
        }
        expect(y.every((x) => x > 0)).toBe(true);
        expect(hasDecimals(value, 2)).toBe(true);
        expect([3, 4]).toContain(p.n);
        expect(largestRootSize(a1, a2)).toBeLessThan(1);
        expect(codes(distractors)).toEqual(['DROPPED_SECOND_LAG', 'ONE_PERIOD_SHORT', 'SIGN_SLIP']);
      }),
      RUNS,
    );
  });

  it('reproduces DY02 Example 1 (Y(t+2) − 1.1Y(t+1) + 0.3Y(t) = 20 from 90, 94: Y4 = 98.70)', () => {
    const p = {
      context: 'output' as const,
      a1Tenths: -11,
      a2Tenths: 3,
      steady: 100,
      y0: 90,
      y1: 94,
      n: 4,
    };
    const answer = secondOrderIteratedValue.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(98.7);
    expect(secondOrderIteratedValue.stem(p)).toContain('Y_{t+2} - 1.1Y_{t+1} + 0.3Y_t = 20');
    const byCode = Object.fromEntries(
      secondOrderIteratedValue.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.SIGN_SLIP).toBe(-118.18);
    expect(byCode.ONE_PERIOD_SHORT).toBe(97.84);
  });
});

describe('characteristic-equation-larger-root', () => {
  it('is a root of r² + a₁r + a₂, and the polynomial has no root above it', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(characteristicEquationLargerRoot, seed);
        const a1 = -(p.r1Tenths + p.r2Tenths) / 10;
        const a2 = (p.r1Tenths * p.r2Tenths) / 100;
        const poly = (r: number) => r * r + a1 * r + a2;
        expect(Math.abs(poly(value))).toBeLessThan(1e-9);
        // Scan to the right of the answer: the parabola stays positive, so no larger root exists.
        let lowest = Number.POSITIVE_INFINITY;
        for (let r = value + 0.01; r < value + 5; r += 0.01) lowest = Math.min(lowest, poly(r));
        expect(lowest).toBeGreaterThan(0);
        // And just to its left it is negative, so it is a simple root with another one below.
        expect(poly(value - 0.01)).toBeLessThan(0);
        // y(t) = rᵗ solves the homogeneous equation y(t+2) + a₁y(t+1) + a₂y(t) = 0.
        for (let t = 0; t < 5; t++) {
          expect(Math.abs(value ** (t + 2) + a1 * value ** (t + 1) + a2 * value ** t)).toBeLessThan(
            1e-9,
          );
        }
        expect(a1 !== 0 && a2 !== 0).toBe(true);
        // The model is stable: both roots lie strictly between −1 and 1.
        expect(largestRootSize(a1, a2)).toBeLessThan(1);
        expect(hasDecimals(value, 1)).toBe(true);
        expect(hasDecimals(a1, 1) && hasDecimals(a2, 2)).toBe(true);
        expect(codes(distractors)).toEqual(['NO_HALF', 'ROOT_SIGN', 'SMALLER_ROOT']);
      }),
      RUNS,
    );
  });

  it('reproduces DY02 Example 2 (S(t+2) − 0.3S(t+1) − 0.4S(t) = 60: roots 0.8 and −0.5)', () => {
    const p = { context: 'inventory' as const, r1Tenths: 8, r2Tenths: -5, b: 60 };
    const answer = characteristicEquationLargerRoot.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(0.8);
    expect(characteristicEquationLargerRoot.stem(p)).toContain(
      'S_{t+2} - 0.3S_{t+1} - 0.4S_t = 60',
    );
  });
});

describe('multiplier-accelerator-income', () => {
  it('equals the model run with consumption, investment and income separately', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(multiplierAcceleratorIncome, seed);
        const c = p.cPct / 100;
        const v = p.vTenths / 10;
        const gBefore = (p.yOld * (100 - p.cPct)) / 100;
        expect(Number.isInteger(gBefore)).toBe(true);
        expect(Number.isInteger(p.rise) && p.rise > 0).toBe(true);
        // Income in periods −1, 0 and 1 is the old equilibrium; G rises from period 2 on.
        const Y = new Map<number, number>([
          [-1, p.yOld],
          [0, p.yOld],
          [1, p.yOld],
        ]);
        // The old equilibrium really is one: C + I + G = Y with I = 0.
        expect(Math.abs(c * p.yOld + 0 + gBefore - p.yOld)).toBeLessThan(1e-9);
        for (let t = 2; t <= p.n; t++) {
          const consumption = c * (Y.get(t - 1) ?? 0);
          const before = c * (Y.get(t - 2) ?? 0);
          const investment = v * (consumption - before);
          Y.set(t, consumption + investment + gBefore + p.rise);
        }
        expect(Math.abs(value - (Y.get(p.n) ?? 0))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(hasDecimals(value, 2)).toBe(true);
        // Income rises above the old equilibrium after the rise in spending.
        expect(value).toBeGreaterThan(p.yOld);
        expect([3, 4]).toContain(p.n);
        expect(codes(distractors)).toEqual([
          'ACCEL_ON_INCOME',
          'NO_ACCELERATOR',
          'ONE_PERIOD_SHORT',
          'STEADY_STATE_ONLY',
        ]);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        // The long-run level is the old one plus the multiplier 1/(1 − c) times the rise.
        expect(
          Math.abs((byCode.STEADY_STATE_ONLY ?? 0) - (p.yOld + p.rise / (1 - c))),
        ).toBeLessThan(0.005 + 1e-6);
      }),
      RUNS,
    );
  });

  it('reproduces DY02 Example 3 (c = 0.5, v = 1, G from 50 to 55: Y4 = 112.5)', () => {
    const p = { cPct: 50, vTenths: 10, yOld: 100, rise: 5, n: 4 };
    const answer = multiplierAcceleratorIncome.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(112.5);
    expect(multiplierAcceleratorIncome.steps(p)[0]?.result).toBe(1);
  });
});
