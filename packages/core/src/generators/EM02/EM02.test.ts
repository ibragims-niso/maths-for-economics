import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import { createRng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { olsErrorVarianceEstimate } from './ols-error-variance-estimate';
import { olsSlopeStandardError, ssrOf, sumSquaresOf } from './ols-slope-standard-error';
import { omittedVariableBiasSlope, s12Of } from './omitted-variable-bias-slope';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** Simple OLS slope Σ(x − x̄)(y − ȳ)/Σ(x − x̄)², computed from the data points. */
function simpleSlope(xs: number[], ys: number[]): number {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let sxy = 0;
  let sxx = 0;
  xs.forEach((x, i) => {
    sxy += (x - mx) * ((ys[i] ?? 0) - my);
    sxx += (x - mx) ** 2;
  });
  return sxy / sxx;
}

/** A standard normal draw from the seeded generator (Box–Muller). */
const normal = (next: () => number) =>
  Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());

/** Solves A·x = b by Gaussian elimination with partial pivoting. */
function solveLinear(a: number[][], b: number[]): number[] {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i] ?? 0]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++)
      if (Math.abs(m[r]?.[c] ?? 0) > Math.abs(m[piv]?.[c] ?? 0)) piv = r;
    [m[c], m[piv]] = [m[piv] ?? [], m[c] ?? []];
    for (let r = c + 1; r < n; r++) {
      const f = (m[r]?.[c] ?? 0) / (m[c]?.[c] ?? 1);
      for (let j = c; j <= n; j++) (m[r] as number[])[j] = (m[r]?.[j] ?? 0) - f * (m[c]?.[j] ?? 0);
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = m[r]?.[n] ?? 0;
    for (let j = r + 1; j < n; j++) s -= (m[r]?.[j] ?? 0) * (x[j] ?? 0);
    x[r] = s / (m[r]?.[r] ?? 1);
  }
  return x;
}

describe('ols-error-variance-estimate', () => {
  it('gives the s² that, times n − k, returns the stated SSR', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(olsErrorVarianceEstimate, seed);
        const k = p.m + 1;
        // Read SSR back from the stem and check s²·(n − k) = SSR.
        const shown = /\\text\{SSR\} = ([\d{},.]+)\$/.exec(stem)?.[1] ?? '';
        const ssr = Number(shown.replace(/\{,\}/g, ''));
        expect(Math.abs(value * (p.n - k) - ssr)).toBeLessThan(1e-6);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.n - k).toBeGreaterThanOrEqual(5);
        expect(p.m).toBeGreaterThanOrEqual(2);
        expect(stem).toContain(`${p.m} explanatory variables`);
        // Every wrong divisor makes s² too small.
        for (const d of distractors) expect(d.value).toBeLessThan(value);
        expect(codes(distractors)).toEqual(['DF_N', 'DF_NO_INTERCEPT', 'DF_N_MINUS_1']);
      }),
      RUNS,
    );
  });

  it('is unbiased in simulation: SSR/(n − k) averages σ², SSR/n does not', () => {
    const rng = createRng(20261018);
    const n = 10;
    const sigma2 = 4;
    const reps = 3000;
    let unbiased = 0;
    let naive = 0;
    for (let r = 0; r < reps; r++) {
      const rows = Array.from({ length: n }, () => [1, rng.next() * 10, rng.next() * 5]);
      const ys = rows.map(
        ([, a = 0, b = 0]) => 2 + 0.5 * a - b + Math.sqrt(sigma2) * normal(rng.next),
      );
      const xtx = [0, 1, 2].map((i) =>
        [0, 1, 2].map((j) => rows.reduce((s, row) => s + (row[i] ?? 0) * (row[j] ?? 0), 0)),
      );
      const xty = [0, 1, 2].map((i) =>
        rows.reduce((s, row, t) => s + (row[i] ?? 0) * (ys[t] ?? 0), 0),
      );
      const b = solveLinear(xtx, xty);
      const ssr = rows.reduce((s, row, t) => {
        const fit = row.reduce((f, v, j) => f + v * (b[j] ?? 0), 0);
        return s + ((ys[t] ?? 0) - fit) ** 2;
      }, 0);
      unbiased += ssr / (n - 3) / reps;
      naive += ssr / n / reps;
    }
    expect(Math.abs(unbiased - sigma2)).toBeLessThan(0.2);
    expect(naive).toBeLessThan(3.0);
  });
});

describe('ols-slope-standard-error', () => {
  it('equals s·√[(XᵀX)⁻¹]₂₂ built from n, x̄ and Σx²', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(olsSlopeStandardError, seed);
        // XᵀX = [[n, n x̄], [n x̄, Σx²]]; its inverse has (2, 2) entry n / det.
        const sumX = p.n * p.xbar;
        const sumX2 = sumSquaresOf(p);
        const det = p.n * sumX2 - sumX * sumX;
        expect(det).toBeGreaterThan(0);
        const s2 = ssrOf(p) / (p.n - 2);
        const se = Math.sqrt((s2 * p.n) / det);
        expect(Math.abs(value - se)).toBeLessThan(1e-9);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0.01);
        expect(hasDecimals(ssrOf(p), 2)).toBe(true);
        expect(hasDecimals(sumX2, 2)).toBe(true);
        // Readable, realistic data: positive mean, sensible spread, enough observations.
        expect(p.xbar).toBeGreaterThan(0);
        expect(p.n).toBeGreaterThanOrEqual(15);
        const sdX = Math.sqrt(det) / p.n;
        expect(sdX).toBeGreaterThanOrEqual(0.3);
        expect(sdX).toBeLessThanOrEqual(15);
        const ds = byCode(distractors);
        expect(codes(distractors)).toEqual(['DF_N', 'UNCENTRED_SXX', 'VAR_NOT_SE']);
        // Dividing by n shrinks the SE, and so does using the much larger raw Σx².
        expect(ds.DF_N).toBeLessThan(value);
        expect(ds.UNCENTRED_SXX).toBeLessThan(value);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in EM02 (25 workers, SSR = 828, x̄ = 13, Σx² = 4325)', () => {
    const p = { context: 'wages' as const, n: 25, xbar: 13, rootSxx: 10, s: 6 };
    expect(sumSquaresOf(p)).toBe(4325);
    expect(ssrOf(p)).toBe(828);
    expect(olsSlopeStandardError.answer(p)).toMatchObject({ value: 0.6 });
    expect(olsSlopeStandardError.steps(p).map((s) => s.result)).toEqual([100, 36, 0.6]);
    expect(byCode(olsSlopeStandardError.distractors(p))).toEqual({
      VAR_NOT_SE: 0.36,
      DF_N: 0.5755,
      UNCENTRED_SXX: 0.0912,
    });
  });
});

describe('omitted-variable-bias-slope', () => {
  it('equals the slope of the short regression on E[y], with data built from the sums', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(omittedVariableBiasSlope, seed);
        const s12 = s12Of(p);
        expect(Number.isInteger(s12)).toBe(true);
        expect(Number.isInteger(p.s22)).toBe(true);
        const rest = p.s22 - (s12 * s12) / p.s11;
        expect(rest).toBeGreaterThan(0);
        // Three centred observations with exactly these sums of squares and cross-products.
        const e1 = [1, -1, 0].map((v) => v / Math.SQRT2);
        const e2 = [1, 1, -2].map((v) => v / Math.sqrt(6));
        const x1 = e1.map((v) => 10 + Math.sqrt(p.s11) * v);
        const x2 = e1.map(
          (v, i) => 50 + (s12 / Math.sqrt(p.s11)) * v + Math.sqrt(rest) * (e2[i] ?? 0),
        );
        // OLS is linear in y, so E[b̃₁ | X] is the short slope fitted to E[y | X].
        const ey = x1.map((v, i) => 3 + p.beta1 * v + p.beta2 * (x2[i] ?? 0));
        expect(Math.abs(simpleSlope(x1, ey) - value)).toBeLessThan(1e-6);
        expect(Math.abs(simpleSlope(x1, x2) - p.delta)).toBeLessThan(1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        // Economic signs of each setting.
        if (p.context === 'quality') {
          expect(p.beta1).toBeLessThan(0);
          expect(p.delta).toBeGreaterThan(0);
        } else {
          expect(p.beta1).toBeGreaterThan(0);
          expect(p.delta * (p.context === 'soil' ? -1 : 1)).toBeGreaterThan(0);
        }
        expect(p.beta2).toBeGreaterThan(0);
        const corr2 = (s12 * s12) / (p.s11 * p.s22);
        expect(corr2).toBeGreaterThanOrEqual(0.1);
        expect(corr2).toBeLessThanOrEqual(0.85);
        expect(codes(distractors)).toEqual(['BIAS_ONLY', 'BIAS_SIGN', 'DELTA_REVERSED', 'NO_BIAS']);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in EM02 (β₁ = 1.5, β₂ = 0.4, δ₁ = 300/200: 2.1)', () => {
    const p = {
      context: 'ability' as const,
      beta1: 1.5,
      beta2: 0.4,
      s11: 200,
      delta: 1.5,
      s22: 900,
    };
    expect(s12Of(p)).toBe(300);
    expect(omittedVariableBiasSlope.answer(p)).toMatchObject({ value: 2.1 });
    expect(byCode(omittedVariableBiasSlope.distractors(p))).toEqual({
      NO_BIAS: 1.5,
      BIAS_SIGN: 0.9,
      BIAS_ONLY: 0.6,
      DELTA_REVERSED: 1.63,
    });
  });

  it('matches a simulation: short slopes average β₁ + β₂δ₁, long-regression slopes average β₁', () => {
    // Five workers whose ability rises by δ₁ = 1.5 points per year of education, as in example 3.
    const educ = [10, 12, 14, 16, 18];
    const ability = [46, 46, 48, 52, 58];
    expect(simpleSlope(educ, ability)).toBeCloseTo(1.5, 12);
    const rng = createRng(7);
    const reps = 4000;
    let short = 0;
    let long = 0;
    for (let r = 0; r < reps; r++) {
      const y = educ.map((x, i) => 5 + 1.5 * x + 0.4 * (ability[i] ?? 0) + 2 * normal(rng.next));
      short += simpleSlope(educ, y) / reps;
      const rows = educ.map((x, i) => [1, x, ability[i] ?? 0]);
      const xtx = [0, 1, 2].map((i) =>
        [0, 1, 2].map((j) => rows.reduce((s, row) => s + (row[i] ?? 0) * (row[j] ?? 0), 0)),
      );
      const xty = [0, 1, 2].map((i) =>
        rows.reduce((s, row, t) => s + (row[i] ?? 0) * (y[t] ?? 0), 0),
      );
      long += (solveLinear(xtx, xty)[1] ?? 0) / reps;
    }
    expect(Math.abs(short - 2.1)).toBeLessThan(0.03);
    expect(Math.abs(long - 1.5)).toBeLessThan(0.1);
  });
});
