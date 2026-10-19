import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { ar1ForecastHSteps } from './ar1-forecast-h-steps';
import { ar1MeanOrVariance } from './ar1-mean-or-variance';
import { ma1Lag1Autocorrelation } from './ma1-lag1-autocorrelation';

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
const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

// The generators use the closed forms c/(1 − φ), σ²/(1 − φ²), μ + φʰ(y(T) − μ) and θ/(1 + θ²).
// The tests get the same numbers another way: by running the mean equation forward until it
// settles, by adding up the variance contributed by every past shock, by iterating one-step
// forecasts, and by enumerating every combination of two-valued shocks.
describe('ar1-mean-or-variance', () => {
  it('equals the settled mean recursion or the sum of the variances of all past shocks', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(ar1MeanOrVariance, seed);
        const phi = p.phiPct / 100;
        const c = p.cTenths / 10;
        expect(Math.abs(phi)).toBeLessThan(1);
        expect(c).toBeGreaterThan(0);
        expect(p.sigma).toBeGreaterThan(0);
        // E[y(t)] = c + φ·E[y(t − 1)], run forward from 0 until it no longer moves.
        let m = 0;
        for (let t = 0; t < 400; t++) m = c + phi * m;
        // y(t) = μ + Σ φʲ ε(t − j): the shocks are uncorrelated, so their variances add.
        let v = 0;
        for (let j = 0; j < 400; j++) v += (phi ** j) ** 2 * p.sigma ** 2;
        const target = p.ask === 'mean' ? m : v;
        expect(Math.abs(value - target)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
        if (p.context !== 'inventory') expect(m >= 1 - 1e-9 && m <= 12 + 1e-9).toBe(true);
        else expect(phi).toBeLessThan(0);
        const d = byCode(distractors);
        if (p.ask === 'mean') {
          expect(codes(distractors)).toEqual([
            'IGNORED_PERSISTENCE',
            'MEAN_DENOM_SIGN',
            'MEAN_MULTIPLIED',
          ]);
          expect(d.IGNORED_PERSISTENCE).toBe(c);
        } else {
          expect(codes(distractors)).toEqual([
            'IGNORED_PERSISTENCE',
            'PHI_NOT_SQUARED',
            'SIGMA_NOT_SQUARED',
          ]);
          expect(Math.abs((d.IGNORED_PERSISTENCE ?? 0) - p.sigma ** 2)).toBeLessThan(0.005 + 1e-9);
        }
      }),
      RUNS,
    );
  });

  it('reproduces EM06 Example 1 (π = 1.2 + 0.6π(t − 1) + ε, σ = 1.2: mean 3, variance 2.25)', () => {
    const base = { context: 'inflation' as const, phiPct: 60, cTenths: 12, sigma: 1.2 };
    const mean = ar1MeanOrVariance.answer({ ...base, ask: 'mean' });
    const variance = ar1MeanOrVariance.answer({ ...base, ask: 'variance' });
    expect(mean.kind === 'numeric' && mean.value).toBe(3);
    expect(variance.kind === 'numeric' && variance.value).toBe(2.25);
    expect(ar1MeanOrVariance.stem({ ...base, ask: 'mean' })).toContain(
      '\\pi_t = 1.2 + 0.6\\,\\pi_{t-1}',
    );
  });
});

describe('ar1-forecast-h-steps', () => {
  it('equals the one-step forecast applied h times, between y(T) and the mean', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(ar1ForecastHSteps, seed);
        const phi = p.phiPct / 100;
        const mu = p.muTenths / 10;
        const last = p.lastTenths / 10;
        const c = (p.muTenths * (100 - p.phiPct)) / 1000;
        expect(hasDecimals(c, 2)).toBe(true);
        expect(c).toBeGreaterThan(0);
        // μ really is the mean: μ = c + φμ.
        expect(Math.abs(c + phi * mu - mu)).toBeLessThan(1e-9);
        // Forecast one step at a time: ŷ(T + k) = c + φ·ŷ(T + k − 1), starting from y(T).
        let f = last;
        let first = Number.NaN;
        for (let k = 1; k <= p.h; k++) {
          f = c + phi * f;
          if (k === 1) first = f;
        }
        expect(Math.abs(value - f)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(phi > 0 && phi < 1).toBe(true);
        expect(Math.abs(p.lastTenths - p.muTenths)).toBeGreaterThanOrEqual(10);
        expect(p.h).toBeGreaterThanOrEqual(2);
        // 0 < φ < 1: the forecast lies strictly between the latest value and the mean.
        expect(f).toBeGreaterThan(Math.min(mu, last));
        expect(f).toBeLessThan(Math.max(mu, last));
        if (p.context !== 'growth') expect(last).toBeGreaterThan(0);
        expect(codes(distractors)).toEqual([
          'FORECAST_NO_MEAN',
          'INTERCEPT_AS_MEAN',
          'LONG_RUN_MEAN_ONLY',
          'ONE_STEP_ONLY',
        ]);
        const d = byCode(distractors);
        expect(Math.abs((d.ONE_STEP_ONLY ?? 0) - first)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(d.LONG_RUN_MEAN_ONLY).toBe(mu);
      }),
      RUNS,
    );
  });

  it('reproduces EM06 Example 2 (g = 0.75 + 0.7g(t − 1) + ε, g(T) = −0.5: 4 quarters ahead 1.78)', () => {
    const p = { context: 'growth' as const, muTenths: 25, phiPct: 70, lastTenths: -5, h: 4 };
    const answer = ar1ForecastHSteps.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(1.78);
    expect(ar1ForecastHSteps.steps(p)[0]?.result).toBe(2.5);
    expect(ar1ForecastHSteps.stem(p)).toContain('g_t = 0.75 + 0.7\\,g_{t-1}');
    const two = ar1ForecastHSteps.answer({ ...p, h: 2 });
    expect(two.kind === 'numeric' && two.value).toBe(1.03);
  });
});

describe('ma1-lag1-autocorrelation', () => {
  /**
   * Exact moments when every shock is +σ or −σ with probability 1/2 (white noise with variance
   * σ²): enumerate all 2ⁿ shock paths and return Corr(y(t), y(t − lag)).
   */
  function enumeratedCorrelation(mu: number, theta: number, sigma: number, lag: number) {
    const n = lag + 2;
    let sx = 0;
    let sy = 0;
    let sxy = 0;
    let sxx = 0;
    let syy = 0;
    const count = 2 ** n;
    for (let mask = 0; mask < count; mask++) {
      const e = Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? sigma : -sigma));
      const x = mu + (e[n - 1] ?? 0) + theta * (e[n - 2] ?? 0);
      const y = mu + (e[1] ?? 0) + theta * (e[0] ?? 0);
      sx += x;
      sy += y;
      sxy += x * y;
      sxx += x * x;
      syy += y * y;
    }
    const cov = sxy / count - (sx / count) * (sy / count);
    const vx = sxx / count - (sx / count) ** 2;
    const vy = syy / count - (sy / count) ** 2;
    return cov / Math.sqrt(vx * vy);
  }

  it('equals the correlation found by enumerating every shock path, and lag 2 gives 0', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(ma1Lag1Autocorrelation, seed);
        const theta = p.thetaPct / 100;
        const rho1 = enumeratedCorrelation(p.mu, theta, p.sigma, 1);
        expect(Math.abs(value - rho1)).toBeLessThanOrEqual(0.0005 + 1e-9);
        expect(Math.abs(enumeratedCorrelation(p.mu, theta, p.sigma, 2))).toBeLessThan(1e-9);
        expect(hasDecimals(value, 3)).toBe(true);
        // An MA(1) can never have |ρ₁| above 1/2.
        expect(Math.abs(value)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(theta) >= 0.2 && Math.abs(theta) <= 0.9).toBe(true);
        expect(p.sigma).not.toBe(1);
        expect(codes(distractors)).toEqual([
          'COVARIANCE_NOT_CORRELATION',
          'MA_DENOM_SIGN',
          'RHO_EQUALS_THETA',
          'THETA_SQUARED',
        ]);
        expect(byCode(distractors).RHO_EQUALS_THETA).toBe(theta);
      }),
      RUNS,
    );
  });

  it('reproduces EM06 Example 3 (θ = 0.5: ρ₁ = 0.4)', () => {
    const p = { context: 'oil' as const, mu: 0.5, thetaPct: 50, sigma: 10 };
    const answer = ma1Lag1Autocorrelation.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(0.4);
    expect(ma1Lag1Autocorrelation.steps(p)[1]?.result).toBe(125);
  });
});
