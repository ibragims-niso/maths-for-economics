import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { harvestMapSlopeAtSteadyState } from './harvest-map-slope-at-steady-state';
import { juryMargin2x2Discrete } from './jury-margin-2x2-discrete';
import { solowConvergenceHalfLife } from './solow-convergence-half-life';

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

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode);

describe('harvest-map-slope-at-steady-state', () => {
  it('matches a numerical derivative and the behaviour of iterated small gaps', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(harvestMapSlopeAtSteadyState, seed);
        const g = p.gTenths / 10;
        const K = p.capacity;
        const x = (K * p.m) / 20;
        const H = g * x * (1 - x / K);
        const f = (v: number) => v + g * v * (1 - v / K) - H;
        // x* and the other root K − x* are both steady states; the harvest is positive and readable.
        expect(Math.abs(f(x) - x)).toBeLessThan(1e-9);
        expect(Math.abs(f(K - x) - (K - x))).toBeLessThan(1e-9);
        expect(H).toBeGreaterThan(0);
        expect(hasDecimals(H, 2)).toBe(true);
        expect(x).toBeGreaterThan(0);
        // Route 2: central difference.
        const h = 1e-4;
        const numeric = (f(x + h) - f(x - h)) / (2 * h);
        expect(Math.abs(numeric - value)).toBeLessThan(1e-6);
        // Route 3: a tiny gap is multiplied by about f′(x*) in one step.
        const eps = 1e-6 * K;
        expect(Math.abs((f(x + eps) - x) / eps - value)).toBeLessThan(1e-4);
        // The verdict agrees with what 40 iterations of a small gap do.
        let v = x + 1e-3;
        for (let t = 0; t < 40; t++) v = f(v);
        const grew = Math.abs(v - x) > 1e-3;
        expect(grew).toBe(Math.abs(value) > 1);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(Math.abs(Math.abs(value) - 1)).toBeGreaterThanOrEqual(0.03 - 1e-9);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        for (const c of codes(distractors))
          expect([
            'VALUE_NOT_SLOPE',
            'SLOPE_AT_ZERO',
            'ONE_MINUS_SLOPE',
            'DERIVATIVE_SLIP',
          ]).toContain(c);
      }),
      RUNS,
    );
  });

  it('reproduces DY06 Example 1 (g = 0.5, K = 200, catch 21: f′(140) = 0.8, f′(60) = 1.2)', () => {
    const upper = { context: 'fish' as const, gTenths: 5, capacity: 200, m: 14 };
    const lower = { ...upper, m: 6 };
    const a = harvestMapSlopeAtSteadyState.answer(upper);
    const b = harvestMapSlopeAtSteadyState.answer(lower);
    expect(a.kind === 'numeric' && a.value).toBe(0.8);
    expect(b.kind === 'numeric' && b.value).toBe(1.2);
    expect(harvestMapSlopeAtSteadyState.stem(upper)).toContain('- 21$');
    expect(harvestMapSlopeAtSteadyState.stem(upper)).toContain('x^* = 140');
  });
});

describe('jury-margin-2x2-discrete', () => {
  it('gives a verdict that agrees with the eigenvalues and with iterating the system', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(juryMargin2x2Discrete, seed);
        const [a, b, c, d] = [p.a / 10, p.b / 10, p.c / 10, p.d / 10];
        const tr = a + d;
        const det = a * d - b * c;
        expect(Math.abs(value - (1 + det - Math.abs(tr)))).toBeLessThan(1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        // Route 2: the eigenvalues from the quadratic formula, real or complex.
        const disc = tr * tr - 4 * det;
        const rho =
          disc >= 0
            ? Math.max(Math.abs((tr + Math.sqrt(disc)) / 2), Math.abs((tr - Math.sqrt(disc)) / 2))
            : Math.sqrt(det);
        const stableByTest = value > 0 && det < 1;
        expect(rho < 1).toBe(stableByTest);
        // Route 3: iterate x(t+1) = A x(t) from two starting points.
        let worst = 0;
        for (const start of [
          [1, 0],
          [0, 1],
        ]) {
          let [u, v] = start as [number, number];
          for (let t = 0; t < 3000 && Math.hypot(u, v) < 1e6; t++)
            [u, v] = [a * u + b * v, c * u + d * v];
          worst = Math.max(worst, Math.hypot(u, v));
        }
        if (stableByTest) expect(worst).toBeLessThan(1e-2);
        else expect(worst).toBeGreaterThan(1e2);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        for (const code of codes(distractors))
          expect(['DROPPED_ABS', 'ONLY_TRACE', 'DET_PLUS']).toContain(code);
      }),
      RUNS,
    );
  });

  it('reproduces DY06 Example 2 (A = [1.1, 0.3; −0.5, 0.5]: margin 0.1, stable)', () => {
    const p = { context: 'policy' as const, a: 11, b: 3, c: -5, d: 5 };
    const answer = juryMargin2x2Discrete.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(0.1);
    const byCode = Object.fromEntries(
      juryMargin2x2Discrete.distractors(p).map((x) => [x.mistakeCode, x.value]),
    );
    expect(byCode.ONLY_TRACE).toBe(-0.6);
    expect(byCode.DET_PLUS).toBe(-0.2);
  });
});

describe('solow-convergence-half-life', () => {
  it('matches the time a small gap takes to halve in the nonlinear model', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(solowConvergenceHalfLife, seed);
        const s = p.savingPct / 100;
        const al = p.alphaPct / 100;
        const nd = p.nTenthsPct / 1000 + p.deltaPct / 100;
        const g = (k: number) => s * k ** al - nd * k;
        const kStar = (s / nd) ** (1 / (1 - al));
        expect(Math.abs(g(kStar))).toBeLessThan(1e-9 * kStar);
        // Route 2: numerical derivative at k*.
        const h = 1e-5 * kStar;
        const slope = (g(kStar + h) - g(kStar - h)) / (2 * h);
        expect(slope).toBeLessThan(0);
        expect(Math.abs(Math.LN2 / -slope - value)).toBeLessThan(0.05 + 1e-6);
        // Route 3: simulate the nonlinear equation (RK4) from a small gap until it has halved.
        const gap0 = 1e-4 * kStar;
        let k = kStar + gap0;
        let t = 0;
        const dt = 0.05;
        while (k - kStar > gap0 / 2) {
          const k1 = g(k);
          const k2 = g(k + (dt / 2) * k1);
          const k3 = g(k + (dt / 2) * k2);
          const k4 = g(k + dt * k3);
          k += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
          t += dt;
        }
        expect(Math.abs(t - value)).toBeLessThan(0.05 + dt + 0.01);
        expect(hasDecimals(value, 1)).toBe(true);
        expect(value).toBeGreaterThan(5);
        expect(value).toBeLessThan(80);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        for (const code of codes(distractors))
          expect([
            'NO_ALPHA_FACTOR',
            'ALPHA_NOT_ONE_MINUS',
            'NO_LOG',
            'IGNORED_POPULATION',
          ]).toContain(code);
      }),
      RUNS,
    );
  });

  it('reproduces the Solow illustration in DY06 (α = 0.3, n + δ = 0.05: about 19.8 years)', () => {
    const p = { savingPct: 25, alphaPct: 30, nTenthsPct: 10, deltaPct: 4 };
    const answer = solowConvergenceHalfLife.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(19.8);
  });
});
