import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { dampedCyclePeriod } from './damped-cycle-period';
import { secondOrderOdeValueAtTime } from './second-order-ode-value-at-time';
import { secondOrderSteadyOrRoot } from './second-order-steady-or-root';

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

/**
 * One classical Runge–Kutta step for y″ = b − a₁y′ − a₂y, written as the system
 * y′ = v, v′ = b − a₁v − a₂y.
 */
function rk4Step(a1: number, a2: number, b: number, y: number, v: number, h: number) {
  const acc = (yy: number, vv: number) => b - a1 * vv - a2 * yy;
  const k1y = v;
  const k1v = acc(y, v);
  const k2y = v + (h / 2) * k1v;
  const k2v = acc(y + (h / 2) * k1y, v + (h / 2) * k1v);
  const k3y = v + (h / 2) * k2v;
  const k3v = acc(y + (h / 2) * k2y, v + (h / 2) * k2v);
  const k4y = v + h * k3v;
  const k4v = acc(y + h * k3y, v + h * k3v);
  return {
    y: y + (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y),
    v: v + (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v),
  };
}

/** y(T) from y(0) = y0, y′(0) = v0, integrated numerically (no closed form). */
function integrate(a1: number, a2: number, b: number, y0: number, v0: number, T: number) {
  const steps = 400;
  let s = { y: y0, v: v0 };
  for (let k = 0; k < steps; k++) s = rk4Step(a1, a2, b, s.y, s.v, T / steps);
  return s.y;
}

// Answers are re-derived without the closed-form solutions: by scanning the characteristic
// polynomial for sign changes, by integrating the equation numerically, and by timing the
// peaks of a simulated path.
describe('second-order-steady-or-root', () => {
  it('is the rest point of the equation, or the largest root found by scanning the polynomial', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(secondOrderSteadyOrRoot, seed);
        const a1 = p.slow + p.fast;
        const a2 = p.slow * p.fast;
        const b = a2 * p.steady;
        expect(a1).toBeGreaterThan(0);
        expect(a2).toBeGreaterThan(0);
        expect(hasDecimals(a1, 1) && hasDecimals(a2, 2) && hasDecimals(b, 2)).toBe(true);
        if (p.ask === 'steady') {
          // A constant path y = value makes y″ + a₁y′ + a₂y equal to b.
          expect(Math.abs(a2 * value - b)).toBeLessThan(1e-9);
          expect(Number.isInteger(value) && value > 0).toBe(true);
          expect(codes(distractors)).toEqual(['DISCRETE_FORMULA', 'WRONG_COEFFICIENT']);
        } else {
          // Scan r² + a₁r + a₂ on a fine grid from −13 to 0 for sign changes.
          const poly = (r: number) => r * r + a1 * r + a2;
          const roots: number[] = [];
          const step = 0.001;
          for (let r = -13; r < 0; r += step) {
            if (poly(r) === 0 || poly(r) * poly(r + step) < 0) roots.push(r + step / 2);
          }
          expect(roots.length).toBe(2);
          const largest = Math.max(...roots);
          expect(Math.abs(value - largest)).toBeLessThan(0.002);
          expect(value).toBeLessThan(0);
          expect(hasDecimals(value, 1)).toBe(true);
          expect(codes(distractors)).toEqual(['DROPPED_CONSTANT', 'FASTER_ROOT', 'ROOT_SIGN']);
        }
      }),
      RUNS,
    );
  });

  it('reproduces DY04 Example 1 (P″ + 3P′ + 2P = 50: P* = 25, slow root −1)', () => {
    const base = { context: 'price' as const, slow: 1, fast: 2, steady: 25 };
    const steady = secondOrderSteadyOrRoot.answer({ ...base, ask: 'steady' });
    const root = secondOrderSteadyOrRoot.answer({ ...base, ask: 'root' });
    expect(steady.kind === 'numeric' && steady.value).toBe(25);
    expect(root.kind === 'numeric' && root.value).toBe(-1);
    expect(secondOrderSteadyOrRoot.stem({ ...base, ask: 'steady' })).toContain(
      '\\ddot P + 3\\,\\dot P + 2\\,P = 50',
    );
  });
});

describe('second-order-ode-value-at-time', () => {
  it('equals the equation integrated numerically from y(0) and y′(0)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(secondOrderOdeValueAtTime, seed);
        const a1 = p.slow + p.fast;
        const a2 = p.slow * p.fast;
        const b = a2 * p.steady;
        const y = integrate(a1, a2, b, p.start, p.slope, p.t);
        expect(Math.abs(value - y)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.start).toBeGreaterThan(0);
        expect(p.slow).toBeLessThan(p.fast);
        expect(Math.abs(value - p.steady)).toBeGreaterThan(0.49);
        expect(codes(distractors)).toEqual(['NO_PARTICULAR', 'ONE_ROOT', 'SWAPPED_CONSTANTS']);
        for (const d of distractors) expect(Math.abs(d.value - value)).toBeGreaterThan(0.04);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        // Leaving out the particular solution is solving y″ + a₁y′ + a₂y = 0 from the same start.
        const bare = integrate(a1, a2, 0, p.start, p.slope, p.t);
        expect(Math.abs((byCode.NO_PARTICULAR ?? 0) - bare)).toBeLessThanOrEqual(0.005 + 1e-6);
      }),
      RUNS,
    );
  });

  it('reproduces DY04 Example 2 (N″ + 5N′ + 4N = 240, N(0) = 90, N′(0) = −12: N(2) = 64.87)', () => {
    const p = {
      context: 'inventory' as const,
      slow: 1,
      fast: 4,
      steady: 60,
      start: 90,
      slope: -12,
      t: 2,
    };
    const answer = secondOrderOdeValueAtTime.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(64.87);
    const steps = secondOrderOdeValueAtTime.steps(p);
    expect(steps[1]?.result).toBe(30);
    expect(steps[2]?.result).toBe(36);
    expect(steps[2]?.latex).toContain('B = -6');
  });
});

describe('damped-cycle-period', () => {
  it('is the time between two peaks of the simulated path', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(dampedCyclePeriod, seed);
        // The gap y − y* obeys the equation with b = 0, and the period does not depend on b.
        expect(p.context === 'output' ? p.steady === 0 : p.steady > 0).toBe(true);
        // The swings are still visible after one cycle: e^(hT) ≥ 0.02 with h = −a₁/2.
        expect(Math.exp((-p.a1 / 2) * value)).toBeGreaterThan(0.019);
        // Start the gap at 1, at rest; record the times where y′ turns from + to −.
        const dt = value / 400;
        let s = { y: 1, v: 0 };
        const peaks: number[] = [];
        for (let k = 1; peaks.length < 2 && k < 2000; k++) {
          const next = rk4Step(p.a1, p.a2, 0, s.y, s.v, dt);
          if (s.v > 0 && next.v <= 0) peaks.push((k - 1 + s.v / (s.v - next.v)) * dt);
          s = next;
        }
        expect(peaks.length).toBe(2);
        const measured = (peaks[1] ?? 0) - (peaks[0] ?? 0);
        expect(Math.abs(value - measured)).toBeLessThanOrEqual(0.005 + 1e-3 * value);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value >= 1 && value <= 40).toBe(true);
        expect(p.a1).toBeGreaterThan(0);
        expect(p.a1 ** 2).toBeLessThan(4 * p.a2);
        for (const d of distractors)
          expect(Math.abs(d.value - value)).toBeGreaterThan(0.029 * value);
        expect(codes(distractors)).toEqual([
          'DISCRIMINANT_NOT_HALVED',
          'FREQUENCY_NOT_PERIOD',
          'IGNORED_DAMPING',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DY04 Example 3 (P″ + P′ + 4.25P = 85: roots −0.5 ± 2i, period π)', () => {
    const p = { context: 'price' as const, a1: 1, a2: 4.25, steady: 20 };
    const answer = dampedCyclePeriod.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(3.14);
    expect(dampedCyclePeriod.steps(p)[1]?.result).toBe(2);
    expect(dampedCyclePeriod.stem(p)).toContain('\\ddot P + \\,\\dot P + 4.25\\,P = 85');
  });
});
