import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { linearOdeValueAtTime } from './linear-ode-value-at-time';
import { odeGapClosingTime } from './ode-gap-closing-time';
import { solowSteadyStateCapital } from './solow-steady-state-capital';

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

/** y(T) for dy/dt = f(y) from y(0) = y0, by the classical Runge–Kutta method (no closed form). */
function integrate(f: (y: number) => number, y0: number, T: number, steps = 400): number {
  const h = T / steps;
  let y = y0;
  for (let k = 0; k < steps; k++) {
    const k1 = f(y);
    const k2 = f(y + (h / 2) * k1);
    const k3 = f(y + (h / 2) * k2);
    const k4 = f(y + h * k3);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  }
  return y;
}

// The answers are re-derived by integrating the differential equation numerically, or by
// bisection on dk/dt = 0, never by the closed-form solutions the generators use.
describe('linear-ode-value-at-time', () => {
  it('equals the equation integrated numerically from y(0), between y(0) and y*', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(linearOdeValueAtTime, seed);
        const b = p.a * p.steady;
        expect(hasDecimals(b, 2)).toBe(true);
        const y = integrate((x) => b - p.a * x, p.start, p.t);
        expect(Math.abs(value - y)).toBeLessThanOrEqual(0.005 + 1e-7);
        expect(hasDecimals(value, 2)).toBe(true);
        // a > 0: the path moves monotonically from y(0) towards y* without reaching it.
        expect(p.a).toBeGreaterThan(0);
        expect(p.start).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(Math.min(p.start, p.steady));
        expect(value).toBeLessThan(Math.max(p.start, p.steady));
        expect(codes(distractors)).toEqual([
          'EXPONENT_SIGN',
          'IGNORED_STEADY_STATE',
          'STEADY_STATE_ONLY',
        ]);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        // Leaving out b: plain decay dy/dt = −a·y from the same start.
        const decay = integrate((x) => -p.a * x, p.start, p.t);
        expect(Math.abs((byCode.IGNORED_STEADY_STATE ?? 0) - decay)).toBeLessThanOrEqual(
          0.005 + 1e-7,
        );
        // The steady state really is a rest point: b − a·y* = 0.
        expect(Math.abs(b - p.a * (byCode.STEADY_STATE_ONLY ?? 0))).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('reproduces DY03 Example 1 (dK/dt = 30 − 0.1K from 100: K(5) = 178.69)', () => {
    const p = { context: 'capital' as const, a: 0.1, steady: 300, start: 100, t: 5 };
    const answer = linearOdeValueAtTime.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(178.69);
    expect(linearOdeValueAtTime.steps(p)[0]?.result).toBe(300);
    expect(linearOdeValueAtTime.stem(p)).toContain('\\dfrac{dK}{dt} = 30 - 0.1K');
  });
});

describe('ode-gap-closing-time', () => {
  it('is when the simulated gap to the steady state first falls to the share left', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(odeGapClosingTime, seed);
        // The equation as the student meets it, and its rest point found by bisection.
        const f =
          p.context === 'price'
            ? (x: number) => p.lambda * (p.alpha - p.beta * x - (p.gamma + p.delta * x))
            : (x: number) => p.invest - p.depreciation * x;
        let lo = 0;
        let hi = 1e5;
        for (let k = 0; k < 100; k++) {
          const mid = (lo + hi) / 2;
          if (f(mid) > 0) lo = mid;
          else hi = mid;
        }
        const star = (lo + hi) / 2;
        const gapLeft = (t: number) =>
          Math.abs(integrate(f, p.start, t) - star) / Math.abs(p.start - star);
        const q = (100 - p.share) / 100;
        // The true time lies within half a hundredth of the rounded answer.
        expect(gapLeft(value - 0.005 - 1e-4)).toBeGreaterThan(q);
        expect(gapLeft(value + 0.005 + 1e-4)).toBeLessThan(q);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value >= 0.5 && value <= 120).toBe(true);
        expect(p.start).toBeGreaterThan(0);
        if (p.context === 'price') expect(p.alpha - p.beta * p.start).toBeGreaterThan(0);
        const expected = ['LINEAR_CLOSING', 'NO_LOG', 'RATE_TIMES_LOG'];
        if (p.share !== 50) expected.unshift('CLOSED_VS_REMAINING');
        expect(codes(distractors)).toEqual(expected);
      }),
      RUNS,
    );
  });

  it('reproduces DY03 Example 2 (λ = 0.1, D = 100 − 2p, S = 10 + 3p: 1.39 and 4.61 months)', () => {
    const base = {
      context: 'price' as const,
      lambda: 0.1,
      alpha: 100,
      beta: 2,
      gamma: 10,
      delta: 3,
      start: 30,
    };
    const half = odeGapClosingTime.answer({ ...base, share: 50 });
    const ninety = odeGapClosingTime.answer({ ...base, share: 90 });
    expect(half.kind === 'numeric' && half.value).toBe(1.39);
    expect(ninety.kind === 'numeric' && ninety.value).toBe(4.61);
    expect(odeGapClosingTime.steps({ ...base, share: 90 })[0]?.result).toBe(0.5);
  });
});

describe('solow-steady-state-capital', () => {
  it('is the capital per worker where dk/dt = 0, found by bisection', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(solowSteadyStateCapital, seed);
        const s = p.saving / 100;
        const nd = p.nTenths / 1000 + p.depreciation / 100;
        const alpha = p.alphaNum / p.alphaDen;
        const kdot = (k: number) => s * k ** alpha - nd * k;
        let lo = 1e-3;
        let hi = 1e4;
        expect(kdot(lo)).toBeGreaterThan(0);
        expect(kdot(hi)).toBeLessThan(0);
        for (let k = 0; k < 100; k++) {
          const mid = (lo + hi) / 2;
          if (kdot(mid) > 0) lo = mid;
          else hi = mid;
        }
        expect(Math.abs(value - lo)).toBeLessThanOrEqual(0.005 + 1e-7);
        expect(hasDecimals(value, 2)).toBe(true);
        // Stable: capital per worker rises below k* and falls above it.
        expect(kdot(0.9 * lo)).toBeGreaterThan(0);
        expect(kdot(1.1 * lo)).toBeLessThan(0);
        expect(value > 1 && value <= 200).toBe(true);
        expect(p.saving >= 10 && p.saving <= 40).toBe(true);
        expect(p.nTenths >= 5 && p.nTenths <= 30).toBe(true);
        expect(codes(distractors)).toEqual(['FORGOT_POWER', 'IGNORED_POPULATION', 'WRONG_POWER']);
      }),
      RUNS,
    );
  });

  it('reproduces the Solow example in DY03 (s = 0.25, n = 0.01, δ = 0.04, α = 1/2: k* = 25)', () => {
    const p = { saving: 25, nTenths: 10, depreciation: 4, alphaNum: 1, alphaDen: 2 };
    const answer = solowSteadyStateCapital.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(25);
    expect(solowSteadyStateCapital.steps(p)[0]?.result).toBe(5);
  });
});
