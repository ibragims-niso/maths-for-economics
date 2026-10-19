import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { bisectionEquilibriumMidpoint } from './bisection-equilibrium-midpoint';
import { capacityProfitMaximum } from './capacity-profit-maximum';
import { epsilonDeltaLinear, linearValue } from './epsilon-delta-linear';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** At most `d` decimals, allowing for floating-point noise. */
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

describe('epsilon-delta-linear', () => {
  it('works for every input closer than δ and fails just beyond it (checked on f itself)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(epsilonDeltaLinear, seed);
        const f = (x: number) => linearValue(p, x);
        const fa = f(p.point);
        // Points inside the interval: the output stays within ε.
        for (const r of [-0.999, -0.5, -0.1, 0, 0.3, 0.75, 0.999]) {
          expect(Math.abs(f(p.point + r * value) - fa)).toBeLessThan(p.eps);
        }
        // A slightly larger δ fails: some point in the wider interval misses the ε band.
        const wider = value * 1.01;
        expect(Math.abs(f(p.point + 0.995 * wider) - fa)).toBeGreaterThanOrEqual(p.eps);
        expect(Math.abs(f(p.point - 0.995 * wider) - fa)).toBeGreaterThanOrEqual(p.eps);
        // Readable and sensible numbers.
        expect(value).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(hasDecimals(p.eps, 2)).toBe(true);
        expect(p.eps).toBeGreaterThan(0);
        expect(fa).toBeGreaterThan(0);
        expect(f(p.point + value)).toBeGreaterThan(0);
        expect(p.point - value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('tags the slope mistakes with the right values', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(epsilonDeltaLinear, seed);
        const d = byCode(distractors);
        if (d.MULTIPLIED_BY_SLOPE !== undefined)
          expect(d.MULTIPLIED_BY_SLOPE).toBeCloseTo(p.eps * p.slope, 9);
        if (d.IGNORED_SLOPE !== undefined) expect(d.IGNORED_SLOPE).toBe(p.eps);
        if (d.NEGATIVE_DELTA !== undefined) expect(d.NEGATIVE_DELTA).toBe(-value);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in AN03 (C(q) = 500 + 4q at q = 50, ε = 0.6: δ = 0.15)', () => {
    const p = { context: 'cost', intercept: 500, slope: 4, point: 50, eps: 0.6 } as const;
    expect(epsilonDeltaLinear.answer(p)).toMatchObject({ kind: 'numeric', value: 0.15 });
    expect(byCode(epsilonDeltaLinear.distractors(p))).toEqual({
      MULTIPLIED_BY_SLOPE: 2.4,
      IGNORED_SLOPE: 0.6,
      HALVED_EPSILON: 0.3,
    });
    expect(linearValue(p, 50)).toBe(700);
    expect(linearValue(p, 50.1)).toBeCloseTo(700.4, 9);
    expect(linearValue(p, 50.2)).toBeCloseTo(700.8, 9);
  });
});

describe('capacity-profit-maximum', () => {
  it('equals the largest profit found by a grid search over [0, capacity]', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(capacityProfitMaximum, seed);
        const pi = (q: number) => -p.a * q * q + p.b * q - p.fixedCost;
        let best = Number.NEGATIVE_INFINITY;
        let bestQ = -1;
        const n = 400;
        for (let i = 0; i <= n; i++) {
          const q = (p.capacity * i) / n;
          if (pi(q) > best) {
            best = pi(q);
            bestQ = q;
          }
        }
        expect(Math.abs(value - best)).toBeLessThan(1e-6);
        expect(bestQ).toBe(p.capacity);
        // Profit strictly rises up to capacity: neighbours below are lower.
        expect(pi(p.capacity - 0.01)).toBeLessThan(value);
        // Without the limit the firm would go further: profit still rises just beyond capacity.
        expect(pi(p.capacity + 0.01)).toBeGreaterThan(value);
        expect(value).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(Number.isInteger(p.b)).toBe(true);
      }),
      RUNS,
    );
  });

  it('puts the unconstrained peak profit above the answer and π(0) = −F below it', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(capacityProfitMaximum, seed);
        const d = byCode(distractors);
        expect(d.IGNORED_CAPACITY).toBeGreaterThan(value);
        expect(d.WRONG_ENDPOINT).toBe(-p.fixedCost);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in AN03 (−2q² + 240q − 1500 on [0, 50]: 5500)', () => {
    const p = {
      setting: { firm: 'A bakery', units: 'trays of bread a day' },
      a: 2,
      b: 240,
      fixedCost: 1500,
      capacity: 50,
    };
    expect(capacityProfitMaximum.answer(p)).toMatchObject({ kind: 'numeric', value: 5500 });
    expect(byCode(capacityProfitMaximum.distractors(p))).toEqual({
      IGNORED_CAPACITY: 5700,
      WRONG_ENDPOINT: -1500,
      QUANTITY_NOT_PROFIT: 50,
    });
  });
});

describe('bisection-equilibrium-midpoint', () => {
  it('matches an independent bisection on the printed functions, and the interval holds the root', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bisectionEquilibriumMidpoint, seed);
        // Independent route: clear the fraction, E(p) = A − p(s·p + t) has the sign of Z for p > 0.
        const E = (x: number) => p.spend - x * (p.s * x + p.t);
        let lo = p.low;
        let hi = p.low + p.width;
        expect(E(lo)).toBeGreaterThan(0);
        expect(E(hi)).toBeLessThan(0);
        for (let j = 0; j < p.k; j++) {
          const m = (lo + hi) / 2;
          if (E(m) > 0) lo = m;
          else hi = m;
        }
        expect(value).toBe((lo + hi) / 2);
        // The equilibrium, found by a fine scan for the sign change, lies in the final interval.
        let root = Number.NaN;
        for (let x = p.low; x < p.low + p.width; x += 0.001) {
          if (E(x) > 0 && E(x + 0.001) <= 0) {
            root = x;
            break;
          }
        }
        expect(root).toBeGreaterThan(lo - 0.001);
        expect(root).toBeLessThan(hi + 0.001);
        expect(Math.abs(value - root)).toBeLessThanOrEqual(p.width / 2 ** (p.k + 1) + 0.001);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(p.low).toBeGreaterThan(0);
        expect(p.spend).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('keeps the root clear of every tested price and gives at least three distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(bisectionEquilibriumMidpoint, seed);
        const root = (-p.t + Math.sqrt(p.t * p.t + 4 * p.s * p.spend)) / (2 * p.s);
        expect(Math.abs(value - root)).toBeGreaterThanOrEqual(0.05);
        const d = byCode(distractors);
        if (d.EXACT_ROOT !== undefined) expect(Math.abs(d.EXACT_ROOT - root)).toBeLessThan(0.006);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in AN03 (800/p against 3p + 20 on [8, 16], 3 steps: 13.5)', () => {
    const p = { spend: 800, s: 3, t: 20, low: 8, width: 8, k: 3 };
    expect(bisectionEquilibriumMidpoint.answer(p)).toMatchObject({ kind: 'numeric', value: 13.5 });
    expect(byCode(bisectionEquilibriumMidpoint.distractors(p))).toEqual({
      ONE_STEP_SHORT: 13,
      ENDPOINT_NOT_MIDPOINT: 14,
      WRONG_HALF: 8.5,
      EXACT_ROOT: 13.33,
    });
    expect(bisectionEquilibriumMidpoint.steps(p).map((s) => s.result)).toEqual([
      56, 12, 14, 13, 13.5,
    ]);
  });
});
