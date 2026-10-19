import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { ramseyConsumptionGrowthAtCapital } from './ramsey-consumption-growth-at-capital';
import { ramseyModifiedGoldenRuleCapital } from './ramsey-modified-golden-rule-capital';
import { ramseySteadyStateConsumption } from './ramsey-steady-state-consumption';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

const hasAtMostDecimals = (v: number, d: number) =>
  Math.abs(Math.round(v * 10 ** d) - v * 10 ** d) < 1e-6;

/** The derivative of f at x by a central difference. */
const deriv = (f: (x: number) => number, x: number) => {
  const h = 1e-5 * Math.max(1, x);
  return (f(x + h) - f(x - h)) / (2 * h);
};

/** The root of a decreasing function g on [lo, hi], by bisection. */
function bisectDecreasing(g: (x: number) => number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    if (g(m) > 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/** The x in [lo, hi] that maximises a single-peaked f, by golden-section search. */
function argmax(f: (x: number) => number, lo: number, hi: number): number {
  const k = (Math.sqrt(5) - 1) / 2;
  let a = lo;
  let b = hi;
  for (let i = 0; i < 200; i++) {
    const x1 = b - k * (b - a);
    const x2 = a + k * (b - a);
    if (f(x1) < f(x2)) a = x1;
    else b = x2;
  }
  return (a + b) / 2;
}

describe('ramsey-modified-golden-rule-capital', () => {
  it('is where consumption stops changing, found by bisection on the numerical f′', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(ramseyModifiedGoldenRuleCapital, seed);
        const alpha = p.alphaNum / p.alphaDen;
        const rho = p.rhoPct / 100;
        const delta = p.deltaPct / 100;
        const n = p.nPct / 100;
        expect(p.nPct).toBeLessThan(p.rhoPct);
        expect(value).toBeGreaterThanOrEqual(2);
        expect(value).toBeLessThanOrEqual(250);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        const f = (k: number) => p.A * k ** alpha;
        // ċ/c ∝ f′(k) − δ − ρ falls as k rises; its zero is k*.
        const k = bisectDecreasing((x) => deriv(f, x) - delta - rho, 0.01, 1e5);
        expect(Math.abs(k - value)).toBeLessThan(0.006 + 1e-5 * value);
        // Patience (ρ > n) keeps k* below the golden-rule capital, where f′ = n + δ.
        const kGold = bisectDecreasing((x) => deriv(f, x) - n - delta, 0.01, 1e7);
        expect(value).toBeLessThan(kGold);
        expect(codes(problem.distractors)).toEqual([
          'FORGOT_DEPRECIATION',
          'FORGOT_POWER',
          'GOLDEN_RULE',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DO04 Example 1 (f = 1.2k^(1/3), ρ = 4 %, δ = 6 %, n = 1 %: k* = 8)', () => {
    const p = { A: 1.2, alphaNum: 1, alphaDen: 3, rhoPct: 4, deltaPct: 6, nPct: 1 };
    expect(ramseyModifiedGoldenRuleCapital.answer(p)).toMatchObject({ value: 8 });
    expect(ramseyModifiedGoldenRuleCapital.distractors(p).map((d) => d.value)).toEqual([
      13.66, 31.62, 4,
    ]);
  });
});

describe('ramsey-steady-state-consumption', () => {
  it('is where both k̇ = 0 and ċ = 0, and lies below the top of the k̇ = 0 curve', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(ramseySteadyStateConsumption, seed);
        const alpha = 1 / p.alphaDen;
        const rho = p.rhoPct / 100;
        const delta = p.deltaPct / 100;
        const n = p.nPct / 100;
        const A = Number(problem.stem.match(/f\(k\) = ([\d.{},]+)\\,k/)?.[1]?.replace('{,}', ''));
        expect(hasAtMostDecimals(A, 2)).toBe(true);
        expect(A).toBeGreaterThanOrEqual(0.5);
        expect(A).toBeLessThanOrEqual(10);
        expect(value).toBeGreaterThan(0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        const f = (k: number) => A * k ** alpha;
        const k = bisectDecreasing((x) => deriv(f, x) - delta - rho, 0.01, 1e5);
        // Consumption that keeps capital per worker constant: k̇ = f(k) − c − (n + δ)k = 0.
        const c = f(k) - (n + delta) * k;
        expect(Math.abs(c - value)).toBeLessThan(0.006 + 1e-5 * value);
        // The k̇ = 0 curve peaks at the golden rule; the patient optimum is below the peak.
        const hump = (x: number) => f(x) - (n + delta) * x;
        const kGold = argmax(hump, 1e-6, 1e7);
        expect(kGold).toBeGreaterThan(k);
        expect(value).toBeLessThan(hump(kGold) + 0.005);
        expect(codes(problem.distractors)).toEqual([
          'CAPITAL_INCOME',
          'FORGOT_INVESTMENT',
          'INVESTMENT_NOT_CONSUMPTION',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DO04 Example 1 (k* = 8, c* = 1.84)', () => {
    const p = { alphaDen: 3, root: 2, rhoPct: 4, deltaPct: 6, nPct: 1 };
    expect(ramseySteadyStateConsumption.stem(p)).toContain('f(k) = 1.2\\,k^{1/3}');
    expect(ramseySteadyStateConsumption.answer(p)).toMatchObject({ value: 1.84 });
    expect(ramseySteadyStateConsumption.distractors(p).map((d) => d.value)).toEqual([
      2.4, 0.56, 0.8,
    ]);
  });
});

describe('ramsey-consumption-growth-at-capital', () => {
  it('matches the Euler equation with a numerical f′, and has the sign of k* − k', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(ramseyConsumptionGrowthAtCapital, seed);
        const alpha = 1 / p.alphaDen;
        const rho = p.rhoPct / 100;
        const delta = p.deltaPct / 100;
        expect(p.nPct).toBeLessThan(p.rhoPct);
        expect(p.sigma).not.toBe(1);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.49);
        expect(Math.abs(value)).toBeLessThanOrEqual(40);
        const f = (k: number) => p.A * k ** alpha;
        const k = p.root ** p.alphaDen;
        // μ = c^(−σ) and μ̇/μ = ρ + δ − f′(k), so ċ/c = −(μ̇/μ)/σ.
        const muGrowth = rho + delta - deriv(f, k);
        const g = (-100 * muGrowth) / p.sigma;
        expect(Math.abs(g - value)).toBeLessThan(0.0051);
        // Consumption rises below the steady state and falls above it.
        const kStar = bisectDecreasing((x) => deriv(f, x) - delta - rho, 1e-4, 1e6);
        expect(Math.sign(value)).toBe(Math.sign(kStar - k));
        expect(codes(problem.distractors)).toEqual([
          'AVERAGE_PRODUCT',
          'FORGOT_DEPRECIATION',
          'IGNORED_SIGMA',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DO04 Example 2 (k = 1: 15 %; k = 27: −2.78 %)', () => {
    const p = { A: 1.2, alphaDen: 3, root: 1, rhoPct: 4, deltaPct: 6, nPct: 1, sigma: 2 };
    expect(ramseyConsumptionGrowthAtCapital.answer(p)).toMatchObject({ value: 15 });
    expect(ramseyConsumptionGrowthAtCapital.distractors(p).map((d) => d.value)).toEqual([
      30, 55, 18,
    ]);
    const q = { ...p, root: 3 };
    expect(ramseyConsumptionGrowthAtCapital.answer(q)).toMatchObject({ value: -2.78 });
  });
});
