import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import { createRng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { mleExponentialOrNormalVariance, sumSquaresOf } from './mle-exponential-or-normal-variance';
import { CHI2_1_5PC, lrOf, mleLikelihoodRatioProportion } from './mle-likelihood-ratio-proportion';
import { median, mlePoissonOrBernoulli } from './mle-poisson-or-bernoulli';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return {
    p: pr.params,
    value: pr.answer.value,
    decimals: pr.answer.decimals ?? 2,
    distractors: pr.distractors,
    stem: pr.stem,
    steps: pr.steps,
  };
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** ln(m!) by adding logs. */
const lnFact = (m: number) => {
  let s = 0;
  for (let i = 2; i <= m; i++) s += Math.log(i);
  return s;
};

/**
 * The maximiser of a concave function on [lo, hi], found by golden-section search: a route that
 * never uses the closed-form estimate.
 */
function argmax(f: (t: number) => number, lo: number, hi: number): number {
  const g = (Math.sqrt(5) - 1) / 2;
  let a = lo;
  let b = hi;
  for (let i = 0; i < 120; i++) {
    const c = b - g * (b - a);
    const d = a + g * (b - a);
    if (f(c) >= f(d)) b = d;
    else a = c;
  }
  return (a + b) / 2;
}

/** The numbers listed between $...$ in a stem, e.g. "$3,\ 5,\ 2$". */
const listIn = (stem: string) =>
  (/\$(-?\d+(?:,\\ -?\d+)+)\$/.exec(stem)?.[1] ?? '').split(',\\ ').map(Number);

describe('mle-poisson-or-bernoulli', () => {
  it('maximises the full log-likelihood, found numerically from the data in the stem', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, decimals, distractors, stem, steps } = solve(mlePoissonOrBernoulli, seed);
        expect(hasDecimals(value, decimals)).toBe(true);
        if (p.model === 'poisson') {
          const x = listIn(stem);
          expect(x).toEqual(p.x);
          expect([5, 6, 7, 8, 10]).toContain(x.length);
          for (const v of x) {
            expect(Number.isInteger(v)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(11);
          }
          // The Poisson log-likelihood with all its terms, including −Σ ln xᵢ!.
          const ell = (lam: number) => sum(x.map((v) => -lam + v * Math.log(lam) - lnFact(v)));
          const best = argmax(ell, 1e-6, 20);
          expect(Math.abs(best - value)).toBeLessThanOrEqual(0.005 + 1e-6);
          expect(decimals).toBe(2);
          expect(steps[1]?.result).toBe(value);
          const ds = byCode(distractors);
          expect(codes(distractors)).toEqual([
            'DIVISOR_N_MINUS_1',
            'MEDIAN_NOT_MEAN',
            'SUM_NOT_MEAN',
          ]);
          expect(ds.MEDIAN_NOT_MEAN).toBe(median(x));
          expect(ds.SUM_NOT_MEAN).toBe(sum(x));
          expect(ds.DIVISOR_N_MINUS_1).toBeGreaterThan(value);
        } else {
          const n = Number(/(?:Of|survey of) (\d+)/.exec(stem)?.[1]);
          const k = Number(/, (\d+) (?:defaulted|bought|sell)/.exec(stem)?.[1]);
          expect(n).toBe(p.n);
          expect(k).toBe(p.k);
          expect(k).toBeGreaterThanOrEqual(2);
          expect(k).toBeLessThan(n / 2);
          // The binomial log-likelihood with its constant ln C(n, k) (it does not move the peak).
          const lnC = lnFact(n) - lnFact(k) - lnFact(n - k);
          const ell = (q: number) => lnC + k * Math.log(q) + (n - k) * Math.log(1 - q);
          const best = argmax(ell, 1e-9, 1 - 1e-9);
          expect(Math.abs(best - value)).toBeLessThanOrEqual(0.0005 + 1e-6);
          expect(decimals).toBe(3);
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(0.5);
          const ds = byCode(distractors);
          expect(codes(distractors)).toEqual([
            'ADD_ONE_SMOOTHING',
            'FAILURE_SHARE',
            'SUM_NOT_MEAN',
          ]);
          expect(ds.ADD_ONE_SMOOTHING).toBeGreaterThan(value);
          expect(Math.abs((ds.FAILURE_SHARE ?? 0) + value - 1)).toBeLessThanOrEqual(0.001 + 1e-9);
          expect(ds.SUM_NOT_MEAN).toBe(k);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in EM05 (counts 3, 5, 2, 4, 7, 3: λ̂ = 4)', () => {
    const p = { model: 'poisson' as const, context: 'branch' as const, x: [3, 5, 2, 4, 7, 3] };
    expect(mlePoissonOrBernoulli.answer(p)).toMatchObject({ value: 4 });
    expect(byCode(mlePoissonOrBernoulli.distractors(p))).toEqual({
      MEDIAN_NOT_MEAN: 3.5,
      SUM_NOT_MEAN: 24,
      DIVISOR_N_MINUS_1: 4.8,
    });
  });

  it('reproduces p̂ of worked example 3 in EM05 (9 defaults among 60 loans: 0.15)', () => {
    const p = { model: 'bernoulli' as const, context: 'loans' as const, n: 60, k: 9 };
    expect(mlePoissonOrBernoulli.answer(p)).toMatchObject({ value: 0.15 });
    expect(byCode(mlePoissonOrBernoulli.distractors(p))).toEqual({
      ADD_ONE_SMOOTHING: 0.161,
      FAILURE_SHARE: 0.85,
      SUM_NOT_MEAN: 9,
    });
  });
});

describe('mle-exponential-or-normal-variance', () => {
  it('maximises the log-likelihood numerically and matches Σx²/n − x̄² for the variance', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, decimals, distractors, stem } = solve(
          mleExponentialOrNormalVariance,
          seed,
        );
        const x = listIn(stem);
        expect(x).toEqual(p.x);
        expect(x.length).toBeGreaterThanOrEqual(4);
        expect(x.length).toBeLessThanOrEqual(6);
        expect(new Set(x).size).toBeGreaterThanOrEqual(3);
        expect(hasDecimals(value, decimals)).toBe(true);
        const n = x.length;
        const ds = byCode(distractors);
        if (p.model === 'exponential') {
          for (const v of x) {
            expect(Number.isInteger(v)).toBe(true);
            expect(v).toBeGreaterThan(0);
          }
          const ell = (t: number) => sum(x.map((v) => Math.log(t) - t * v));
          const best = argmax(ell, 1e-6, 5);
          expect(Math.abs(best - value)).toBeLessThanOrEqual(0.0005 + 1e-6);
          expect(decimals).toBe(3);
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThanOrEqual(0.5);
          expect(codes(distractors)).toEqual([
            'DIVISOR_N_MINUS_1',
            'MEAN_NOT_RATE',
            'SUM_NOT_MEAN',
          ]);
          expect(Math.abs((ds.MEAN_NOT_RATE ?? 0) - sum(x) / n)).toBeLessThanOrEqual(0.0005 + 1e-9);
          expect(ds.DIVISOR_N_MINUS_1).toBeLessThan(value);
          expect(ds.SUM_NOT_MEAN).toBeLessThan(value);
        } else {
          for (const v of x) expect(Number.isInteger(v)).toBe(true);
          const mean = sum(x) / n;
          expect(Number.isInteger(mean)).toBe(true);
          // A different formula: mean of the squares minus the square of the mean.
          const v2 = sum(x.map((v) => v * v)) / n - mean * mean;
          expect(Math.abs(v2 - value)).toBeLessThanOrEqual(0.005 + 1e-9);
          // The two-parameter log-likelihood is highest at (x̄, σ̂²): check the neighbours.
          const ell = (mu: number, s2: number) =>
            sum(x.map((v) => -0.5 * Math.log(2 * Math.PI * s2) - (v - mu) ** 2 / (2 * s2)));
          const top = ell(mean, v2);
          for (const [dm, ds2] of [
            [0.01, 0],
            [-0.01, 0],
            [0, 0.01],
            [0, -0.01],
            [0.01, 0.01],
          ] as const) {
            expect(ell(mean + dm, v2 + ds2)).toBeLessThan(top);
          }
          expect(Math.abs(argmax((s) => ell(mean, s), 1e-6, 400) - value)).toBeLessThanOrEqual(
            0.005 + 1e-6,
          );
          expect(decimals).toBe(2);
          expect(codes(distractors)).toEqual([
            'DIVISOR_N_MINUS_1',
            'SD_NOT_VARIANCE',
            'SS_NOT_DIVIDED',
          ]);
          expect(ds.SS_NOT_DIVIDED).toBe(sumSquaresOf(x));
          expect(ds.DIVISOR_N_MINUS_1).toBeGreaterThan(value);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in EM05 (spells 3, 8, 1, 14, 6, 4 months: θ̂ = 0.167)', () => {
    const p = {
      model: 'exponential' as const,
      context: 'unemployment' as const,
      x: [3, 8, 1, 14, 6, 4],
    };
    expect(mleExponentialOrNormalVariance.answer(p)).toMatchObject({ value: 0.167 });
    expect(byCode(mleExponentialOrNormalVariance.distractors(p))).toEqual({
      MEAN_NOT_RATE: 6,
      DIVISOR_N_MINUS_1: 0.139,
      SUM_NOT_MEAN: 0.028,
    });
  });

  it('gives σ̂² = 2 against s² = 2.5 for the values 4, 7, 5, 8, 6 of the formulas section', () => {
    const p = { model: 'normal' as const, context: 'growth' as const, x: [4, 7, 5, 8, 6] };
    expect(mleExponentialOrNormalVariance.answer(p)).toMatchObject({ value: 2 });
    expect(byCode(mleExponentialOrNormalVariance.distractors(p))).toMatchObject({
      DIVISOR_N_MINUS_1: 2.5,
      SS_NOT_DIVIDED: 10,
    });
  });
});

describe('mle-likelihood-ratio-proportion', () => {
  it('equals 2 ln of the ratio of binomial probabilities, with p̂ found numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem, steps } = solve(mleLikelihoodRatioProportion, seed);
        const n = Number(/(?:Of|survey of) (\d+)/.exec(stem)?.[1]);
        const k = Number(/, (\d+) (?:defaulted|bought|export)/.exec(stem)?.[1]);
        const p0 = Number(/H_0\\colon p = (0\.\d+)\$/.exec(stem)?.[1]);
        expect([n, k, Math.round(p0 * 100)]).toEqual([p.n, p.k, p.p0]);
        // The binomial probability of the data, with its constant, at the best p and at p₀.
        const lnC = lnFact(n) - lnFact(k) - lnFact(n - k);
        const lnB = (q: number) => lnC + k * Math.log(q) + (n - k) * Math.log(1 - q);
        const best = argmax(lnB, 1e-9, 1 - 1e-9);
        const lr = 2 * (lnB(best) - lnB(p0));
        expect(Math.abs(value - lr)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0.5);
        expect(value).toBeLessThanOrEqual(25);
        // p̂ has at most 3 decimals and the verdict is clear.
        expect(hasDecimals(k / n, 3)).toBe(true);
        expect(Math.abs(value - CHI2_1_5PC)).toBeGreaterThanOrEqual(0.49);
        expect(steps[4]?.latex).toContain(value > CHI2_1_5PC ? '>' : '<');
        const ds = byCode(distractors);
        expect(codes(distractors)).toEqual(['DROPPED_FAILURES', 'LOG_BASE_10', 'LR_NOT_DOUBLED']);
        expect(Math.abs((ds.LR_NOT_DOUBLED ?? 0) - lr / 2)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(Math.abs((ds.LOG_BASE_10 ?? 0) - lr / Math.log(10))).toBeLessThanOrEqual(
          0.005 + 1e-6,
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in EM05 (9 of 60 loans, H₀: p = 0.05: LR = 8.43)', () => {
    const p = { context: 'loans' as const, n: 60, k: 9, p0: 5 };
    expect(mleLikelihoodRatioProportion.answer(p)).toMatchObject({ value: 8.43 });
    expect(byCode(mleLikelihoodRatioProportion.distractors(p))).toEqual({
      LR_NOT_DOUBLED: 4.22,
      LOG_BASE_10: 3.66,
      DROPPED_FAILURES: 19.78,
    });
    const steps = mleLikelihoodRatioProportion.steps(p);
    expect(steps[1]?.result).toBe(-25.363);
    expect(steps[2]?.result).toBe(-29.578);
  });

  it('rejects a true H₀ about 5 % of the time (simulated loans)', () => {
    const rng = createRng(20261019);
    const n = 200;
    const reps = 2000;
    let rejections = 0;
    for (let r = 0; r < reps; r++) {
      let k = 0;
      for (let i = 0; i < n; i++) if (rng.next() < 0.1) k++;
      if (k > 0 && lrOf({ context: 'loans', n, k, p0: 10 }) > CHI2_1_5PC) rejections++;
    }
    expect(rejections / reps).toBeGreaterThan(0.03);
    expect(rejections / reps).toBeLessThan(0.075);
  });
});
