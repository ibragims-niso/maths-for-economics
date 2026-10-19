import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { hasDecimals } from '../ST105/contexts';
import { tFor } from '../ST203/critical-values';
import { coefficientTStatistic } from './coefficient-t-statistic';
import { COEFFICIENT_CONTEXTS, F_05, F_DFS, fCritical } from './contexts';
import { fStatisticRestrictedSsr, kOf, ssrR, ssrU } from './f-statistic-restricted-ssr';
import { diagOf, seOf, ssrOf, tStatisticFromXtxInverse } from './t-statistic-from-xtx-inverse';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, steps: pr.steps };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** ln Γ(k/2) for a whole number k, from Γ(1/2) = √π, Γ(1) = 1 and Γ(x + 1) = x·Γ(x). */
function logGammaHalf(k: number): number {
  let x = k % 2 === 0 ? 1 : 0.5;
  let g = k % 2 === 0 ? 0 : 0.5 * Math.log(Math.PI);
  while (x < k / 2 - 1e-9) {
    g += Math.log(x);
    x += 1;
  }
  return g;
}

/** The F(a, b) density, written out from its formula. */
function fDensity(a: number, b: number): (x: number) => number {
  const logC = logGammaHalf(a + b) - logGammaHalf(a) - logGammaHalf(b) + (a / 2) * Math.log(a / b);
  return (x) =>
    x <= 0
      ? 0
      : Math.exp(logC + (a / 2 - 1) * Math.log(x) - ((a + b) / 2) * Math.log(1 + (a * x) / b));
}

/**
 * P(F > c) for F ~ F(a, b) as the area under the density from c to ∞, by Simpson's rule after
 * the substitution x = c/u, which maps (c, ∞) onto (0, 1].
 */
function fTail(c: number, a: number, b: number, m = 2000): number {
  const f = fDensity(a, b);
  const g = (u: number) => (u <= 0 ? 0 : (f(c / u) * c) / (u * u));
  const h = 1 / m;
  let s = g(0) + g(1);
  for (let i = 1; i < m; i++) s += g(i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

describe('EM03 F table', () => {
  it('puts 5 % of the F(q, n − k) density beyond each table value (to 2 decimals)', () => {
    for (const df of F_DFS) {
      for (let q = 1; q <= 5; q++) {
        const c = fCritical(q, df);
        expect(fTail(c - 0.005, q, df)).toBeGreaterThan(0.05);
        expect(fTail(c + 0.005, q, df)).toBeLessThan(0.05);
      }
    }
  });

  it('agrees with the closed form for q = 2 and with t² for q = 1', () => {
    for (const df of F_DFS) {
      // For q = 2, P(F > x) = (1 + 2x/df)^(−df/2) exactly.
      const c = fCritical(2, df);
      expect(fTail(c, 2, df)).toBeCloseTo((1 + (2 * c) / df) ** (-df / 2), 6);
      // One restriction: F = t², so the 5 % F value is the square of the two-sided t value.
      expect(Math.abs(fCritical(1, df) - tFor(df, 95) ** 2)).toBeLessThan(0.01);
      expect(F_05[df]?.length).toBe(5);
    }
  });
});

describe('coefficient-t-statistic', () => {
  it('puts the estimate t standard errors away from the null value', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(coefficientTStatistic, seed);
        const c = COEFFICIENT_CONTEXTS[p.context].nullValue;
        // Walking t standard errors from c lands on b (up to the 2-decimal rounding of t).
        expect(Math.abs(c + value * p.se - p.b)).toBeLessThanOrEqual(0.005 * p.se + 1e-9);
      }),
      RUNS,
    );
  });

  it('decides as the 95 % confidence interval does, with readable numbers and the right distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, steps } = solve(coefficientTStatistic, seed);
        const ctx = COEFFICIENT_CONTEXTS[p.context];
        const crit = tFor(p.n - p.k, 95);
        // H₀ is rejected exactly when c lies outside b ± t·SE.
        const outside = Math.abs(p.b - ctx.nullValue) > crit * p.se;
        const why = steps[steps.length - 1]?.why ?? '';
        expect(why).toContain(outside ? ' rejects H₀' : 'does not reject H₀');
        expect(hasDecimals(value, 2)).toBe(true);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.5);
        expect(Math.abs(value)).toBeLessThanOrEqual(8);
        expect(p.se).toBeGreaterThan(0);
        expect(hasDecimals(p.b, ctx.decimals) && hasDecimals(p.se, ctx.decimals)).toBe(true);
        expect(p.n - p.k).toBeGreaterThanOrEqual(10);
        const expected =
          ctx.nullValue === 0
            ? ['DIVIDED_BY_VARIANCE', 'SIGN_REVERSED']
            : ['DIVIDED_BY_VARIANCE', 'NULL_NOT_SUBTRACTED', 'SIGN_REVERSED'];
        expect(codes(distractors)).toEqual(expected);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in EM03 (price elasticity −1.32, SE 0.12)', () => {
    const p = { context: 'priceElasticity', b: -1.32, se: 0.12, n: 33, k: 3 } as const;
    expect(coefficientTStatistic.answer(p)).toMatchObject({ value: -2.67 });
    const d = byCode(coefficientTStatistic.distractors(p));
    expect(d.NULL_NOT_SUBTRACTED).toBe(-11);
    expect(d.SIGN_REVERSED).toBe(2.67);
    expect(d.DIVIDED_BY_VARIANCE).toBe(-22.22);
  });
});

describe('f-statistic-restricted-ssr', () => {
  it('equals the R² form of the F statistic, whatever the total sum of squares', () => {
    fc.assert(
      fc.property(seeds, fc.double({ min: 1.01, max: 20, noNaN: true }), (seed, scale) => {
        const { p, value } = solve(fStatisticRestrictedSsr, seed);
        const sst = ssrR(p) * scale;
        const r2U = 1 - ssrU(p) / sst;
        const r2R = 1 - ssrR(p) / sst;
        const df = p.n - kOf(p);
        const F = (r2U - r2R) / p.q / ((1 - r2U) / df);
        expect(Math.abs(value - F)).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('rejects exactly when the area beyond F under the F(q, n − k) density is below 5 %', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, steps } = solve(fStatisticRestrictedSsr, seed);
        const df = p.n - kOf(p);
        const F = (ssrR(p) - ssrU(p)) / p.q / (ssrU(p) / df);
        const why = steps[steps.length - 1]?.why ?? '';
        expect(why).toContain(fTail(F, p.q, df, 400) < 0.05 ? 'so reject H₀' : 'do not reject H₀');
      }),
      { numRuns: 300 },
    );
  });

  it('keeps sums of squares readable and positive, with the right distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(fStatisticRestrictedSsr, seed);
        expect(ssrU(p)).toBeGreaterThan(0);
        expect(ssrR(p)).toBeGreaterThan(ssrU(p));
        expect(hasDecimals(ssrU(p), 2) && hasDecimals(ssrR(p), 2)).toBe(true);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.q).toBeLessThan(p.m);
        expect(F_DFS).toContain(p.n - kOf(p));
        const df = p.n - kOf(p);
        const swappedValue = (ssrR(p) - ssrU(p)) / df / (ssrU(p) / p.q);
        const expected = ['DF_NO_INTERCEPT', 'NOT_DIVIDED_BY_Q', 'RESTRICTED_IN_DENOMINATOR'];
        if (Math.round(swappedValue * 100) / 100 >= 0.1) expected.push('DF_SWAPPED');
        expect(codes(distractors)).toEqual(expected.sort());
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in EM03 (regional dummies)', () => {
    const p = { context: 'regions', q: 3, m: 5, n: 46, s2: 0.2, d: 0.4 } as const;
    expect(ssrU(p)).toBe(8);
    expect(ssrR(p)).toBe(9.2);
    expect(fStatisticRestrictedSsr.answer(p)).toMatchObject({ value: 2 });
    const d = byCode(fStatisticRestrictedSsr.distractors(p));
    expect(d.NOT_DIVIDED_BY_Q).toBe(6);
    expect(d.RESTRICTED_IN_DENOMINATOR).toBe(1.74);
  });
});

describe('t-statistic-from-xtx-inverse', () => {
  it('equals (b − c)/√(SSR·a/(n − k)), worked from the numbers in the stem', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(tStatisticFromXtxInverse, seed);
        const c = COEFFICIENT_CONTEXTS[p.context].nullValue;
        const variance = (ssrOf(p) * diagOf(p)) / (p.n - p.m - 1);
        expect(Math.abs(value - (p.b - c) / Math.sqrt(variance))).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('decides as the 95 % confidence interval does, with readable inputs and the right distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, steps } = solve(tStatisticFromXtxInverse, seed);
        const ctx = COEFFICIENT_CONTEXTS[p.context];
        const df = p.n - p.m - 1;
        const outside = Math.abs(p.b - ctx.nullValue) > tFor(df, 95) * seOf(p);
        expect(steps[steps.length - 1]?.why ?? '').toContain(
          outside ? ' rejects H₀' : 'does not reject H₀',
        );
        expect(df).toBeGreaterThanOrEqual(10);
        expect(df).toBeLessThanOrEqual(30);
        expect(hasDecimals(ssrOf(p), 2) && hasDecimals(diagOf(p), 4)).toBe(true);
        expect(diagOf(p)).toBeGreaterThan(0);
        expect(seOf(p)).toBeGreaterThanOrEqual(ctx.ses[0] ?? 0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(1);
        const expected = ['DF_NO_INTERCEPT', 'DIVIDED_BY_VARIANCE', 'SSR_OVER_N'];
        if (ctx.nullValue !== 0) expected.push('NULL_NOT_SUBTRACTED');
        expect(codes(distractors)).toEqual(expected.sort());
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in EM03 (education, SSR 15, n = 64)', () => {
    const p = { context: 'education', n: 64, m: 3, s: 0.5, r: 0.036, b: 0.072 } as const;
    expect(ssrOf(p)).toBe(15);
    expect(diagOf(p)).toBe(0.001296);
    expect(seOf(p)).toBe(0.018);
    expect(tStatisticFromXtxInverse.answer(p)).toMatchObject({ value: 4 });
  });
});
