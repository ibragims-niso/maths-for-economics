import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { tFor } from '../ST203/critical-values';
import { olsSlopeFromData } from './ols-slope-from-data';
import { regressionLineFromSums } from './regression-line-from-sums';
import { regressionSlopeTStatistic } from './regression-slope-t-statistic';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
const sum = (vs: number[]) => vs.reduce((s, v) => s + v, 0);

/**
 * The least-squares line from the two normal equations
 *   Σy = n·b₀ + b₁·Σx,   Σxy = b₀·Σx + b₁·Σx²
 * solved by Cramer's rule, a different route from the centred formula the generator uses.
 */
function normalEquations(xs: number[], ys: number[]) {
  const n = xs.length;
  const sx = sum(xs);
  const sy = sum(ys);
  const sxx = sum(xs.map((x) => x * x));
  const sxy = sum(xs.map((x, i) => x * (ys[i] ?? 0)));
  const det = n * sxx - sx * sx;
  return { b0: (sy * sxx - sx * sxy) / det, b1: (n * sxy - sx * sy) / det };
}
const ssrOf = (xs: number[], ys: number[], b0: number, b1: number) =>
  sum(xs.map((x, i) => ((ys[i] ?? 0) - b0 - b1 * x) ** 2));

describe('ols-slope-from-data', () => {
  it('equals the slope from the normal equations, and no nearby line has a smaller SSR', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(olsSlopeFromData, seed);
        const { xs, ys } = p;
        expect([5, 6]).toContain(xs.length);
        expect(new Set(xs).size).toBe(xs.length);
        expect(Number.isInteger(sum(xs) / xs.length)).toBe(true);
        if (p.context !== 'okun') expect(Math.min(...ys)).toBeGreaterThanOrEqual(4);
        // y values have at most one decimal place.
        expect(ys.every((y) => hasDecimals(y, 1))).toBe(true);
        const { b0, b1 } = normalEquations(xs, ys);
        expect(Math.abs(value - b1)).toBeLessThan(1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        // Residuals add up to 0 and are not all 0 (the points do not lie on one line).
        const res = xs.map((x, i) => (ys[i] ?? 0) - b0 - b1 * x);
        expect(Math.abs(sum(res))).toBeLessThan(1e-9);
        expect(res.filter((e) => Math.abs(e) > 1e-9).length).toBeGreaterThanOrEqual(3);
        // Brute force: tilting or shifting the line always raises the sum of squared residuals.
        const best = ssrOf(xs, ys, b0, b1);
        for (const [da, db] of [
          [0, 0.01],
          [0, -0.01],
          [0.1, 0],
          [-0.1, 0],
          [0.05, 0.01],
          [-0.05, -0.01],
        ] as const) {
          expect(ssrOf(xs, ys, b0 + da, b1 + db)).toBeGreaterThan(best);
        }
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'END_POINTS',
          'NO_CENTRING',
          'REVERSED_REGRESSION',
        ]);
        // Economic signs: demand and Okun's law slope down, spending and wages slope up.
        expect(Math.sign(value)).toBe(p.context === 'demand' || p.context === 'okun' ? -1 : 1);
        if (p.context === 'consumption') expect(value).toBeLessThan(1);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST205 (sandwich demand, b₁ = −8)', () => {
    const p = {
      context: 'demand' as const,
      xs: [2, 3, 4, 5, 6],
      ys: [86, 73, 68, 61, 52],
      slope: -8,
    };
    expect(normalEquations(p.xs, p.ys)).toEqual({ b0: 100, b1: -8 });
    expect(olsSlopeFromData.answer(p)).toMatchObject({ value: -8 });
    const byCode = Object.fromEntries(
      olsSlopeFromData.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ NO_CENTRING: 14.22, REVERSED_REGRESSION: -0.12, END_POINTS: -8.5 });
  });
});

describe('regression-line-from-sums', () => {
  it('agrees with the point-slope form through the means and with R² = r²', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(regressionLineFromSums, seed);
        const slope = p.sxy / p.sxx;
        expect(slope).toBeCloseTo(p.slope, 9);
        const sdX = Math.sqrt(p.sxx / (p.n - 1));
        if (p.kind === 'intercept') {
          // The line through (0, b₀) and (x̄, ȳ) has the least-squares slope.
          expect(Math.abs((p.ybar - value) / p.xbar - slope)).toBeLessThanOrEqual(
            0.005 / p.xbar + 1e-9,
          );
          expect(hasDecimals(value, 2)).toBe(true);
        } else if (p.kind === 'prediction') {
          // ŷ − ȳ = b₁(x₀ − x̄): the prediction moves from the point of means along the line.
          expect(Math.abs(value - (p.ybar + slope * (p.x0 - p.xbar)))).toBeLessThanOrEqual(
            0.005 + 1e-9,
          );
          expect(hasDecimals(value, 2)).toBe(true);
          // Within two standard deviations of x̄: not an extrapolation.
          expect(p.x0).not.toBe(p.xbar);
          expect(Math.abs(p.x0 - p.xbar)).toBeLessThanOrEqual(2 * sdX);
          if (p.context !== 'okun') expect(value).toBeGreaterThan(0);
        } else {
          const r = p.sxy / Math.sqrt(p.sxx * p.syy);
          expect(Math.abs(value - r * r)).toBeLessThanOrEqual(0.0005 + 1e-9);
          expect(value).toBeGreaterThan(0.25);
          expect(value).toBeLessThan(0.97);
          expect(hasDecimals(value, 3)).toBe(true);
        }
        expect(p.n).toBeGreaterThanOrEqual(20);
        expect(p.sxx).toBeGreaterThan(0);
        expect(p.syy).toBeGreaterThan(p.slope * p.sxy);
        if (p.context === 'consumption') {
          expect(p.slope).toBeGreaterThan(0);
          expect(p.slope).toBeLessThan(1);
          expect(p.ybar - p.slope * p.xbar).toBeGreaterThan(0);
        }
      }),
      RUNS,
    );
  });

  it('asks all three questions', () => {
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) kinds.add(solve(regressionLineFromSums, seed).p.kind);
    expect(kinds).toEqual(new Set(['intercept', 'prediction', 'r-squared']));
  });

  it('reproduces worked example 2 in ST205 (8 households: ŷ = 62 at x = 65, R² = 0.939)', () => {
    const base = {
      context: 'consumption' as const,
      n: 8,
      xbar: 55,
      ybar: 54,
      slope: 0.8,
      sxx: 4200,
      sxy: 3360,
      syy: 2864,
      x0: 65,
    };
    expect(regressionLineFromSums.answer({ ...base, kind: 'intercept' })).toMatchObject({
      value: 10,
    });
    const prediction = { ...base, kind: 'prediction' as const };
    expect(regressionLineFromSums.answer(prediction)).toMatchObject({ value: 62 });
    const byCode = Object.fromEntries(
      regressionLineFromSums.distractors(prediction).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ USED_MEAN_Y: 54, NO_INTERCEPT: 52, INTERCEPT_SIGN: 150 });
    const r2 = { ...base, kind: 'r-squared' as const };
    expect(regressionLineFromSums.answer(r2)).toMatchObject({ value: 0.939 });
    const r2Codes = Object.fromEntries(
      regressionLineFromSums.distractors(r2).map((d) => [d.mistakeCode, d.value]),
    );
    expect(r2Codes).toEqual({ RESIDUAL_SHARE: 0.061, R_NOT_R_SQUARED: 0.969 });
  });
});

describe('regression-slope-t-statistic', () => {
  it('equals r√(n − 2)/√(1 − r²) and gives a clear decision at 5 %', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(regressionSlopeTStatistic, seed);
        const sxx = p.rootSxx ** 2;
        const ssr = p.s ** 2 * (p.n - 2);
        // R² from the explained and total sums of squares, then t from the correlation.
        const sse = p.slope ** 2 * sxx;
        const r = Math.sign(p.slope) * Math.sqrt(sse / (sse + ssr));
        const t = (r * Math.sqrt(p.n - 2)) / Math.sqrt(1 - r * r);
        expect(Math.abs(value - t)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(Math.abs(t)).toBeGreaterThanOrEqual(1.2);
        expect(Math.abs(t)).toBeLessThanOrEqual(8);
        expect(Math.abs(Math.abs(t) - tFor(p.n - 2, 95))).toBeGreaterThanOrEqual(0.02);
        expect(p.n).toBeGreaterThanOrEqual(12);
        expect(p.n).toBeLessThanOrEqual(32);
        expect(hasDecimals(p.s / p.rootSxx, 4)).toBe(true);
        expect(Math.sign(value)).toBe(p.context === 'demand' || p.context === 'okun' ? -1 : 1);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST205 (wages: SE = 0.6, t = 2.5)', () => {
    const p = { context: 'wages' as const, n: 27, slope: 1.5, rootSxx: 10, s: 6 };
    expect(regressionSlopeTStatistic.stem(p)).toContain('\\text{SSR} = 900');
    expect(regressionSlopeTStatistic.answer(p)).toMatchObject({ value: 2.5 });
    const steps = regressionSlopeTStatistic.steps(p);
    expect(steps.map((s) => s.result)).toEqual([36, 0.6, 2.5]);
    expect(steps[2]?.why).toContain('2.06');
    const byCode = Object.fromEntries(
      regressionSlopeTStatistic.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ DF_N: 2.6, DF_N_MINUS_1: 2.55, VAR_NOT_SE: 4.17 });
  });
});
