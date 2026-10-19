import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { chebyshevIntervalBound } from './chebyshev-interval-bound';
import { chebyshevSampleSize } from './chebyshev-sample-size';
import { sampleMeanChebyshevBound } from './sample-mean-chebyshev-bound';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** The numbers written in $...$ in a stem, in order ("1{,}500" → 1500). */
const mathNumbers = (stem: string) =>
  [...stem.matchAll(/\$(-?[\d{},.]+)\$/g)].map((m) => Number((m[1] ?? '').replace(/\{,\}/g, '')));

const byCode = (ds: { value: number; mistakeCode: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/**
 * The three-point distribution that makes Chebyshev's inequality an equality: μ − c and μ + c
 * with probability σ²/(2c²) each, μ otherwise. Returns its mean, variance and P(|X − μ| ≥ c).
 */
function extremal(mu: number, sigma: number, c: number) {
  const q = sigma ** 2 / (2 * c ** 2);
  const pts: [number, number][] = [
    [mu - c, q],
    [mu, 1 - 2 * q],
    [mu + c, q],
  ];
  const mean = pts.reduce((s, [x, w]) => s + x * w, 0);
  const variance = pts.reduce((s, [x, w]) => s + (x - mean) ** 2 * w, 0);
  const far = pts.filter(([x]) => Math.abs(x - mu) >= c - 1e-9).reduce((s, [, w]) => s + w, 0);
  return { mean, variance, far };
}

describe('chebyshev-interval-bound', () => {
  it('equals the probability of the extreme three-point distribution, with the interval read from the stem', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(chebyshevIntervalBound, seed);
        const [mu = 0, sigma = 0, lo = 0, hi = 0] = mathNumbers(stem);
        expect(mu).toBe(p.mu);
        expect(sigma).toBe(p.sigma);
        expect((lo + hi) / 2).toBeCloseTo(mu, 9);
        const c = (hi - lo) / 2;
        const x = extremal(mu, sigma, c);
        expect(x.mean).toBeCloseTo(mu, 9);
        expect(x.variance).toBeCloseTo(sigma ** 2, 6);
        // Chebyshev is sharp: this distribution reaches the bound exactly.
        const target = p.mode === 'outside' ? x.far : 1 - x.far;
        expect(Math.abs(value - target)).toBeLessThanOrEqual(0.00005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('keeps the interval at positive values and the answer a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(chebyshevIntervalBound, seed);
        expect(Number.isInteger(p.sigma) && Number.isInteger(p.c)).toBe(true);
        expect(p.mu - p.c).toBeGreaterThan(0);
        expect(p.c / p.sigma).toBeGreaterThan(1);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST206 (withdrawals: mean 40, standard deviation 10)', () => {
    const inside = { context: 'withdrawals', mu: 40, sigma: 10, c: 20, mode: 'inside' } as const;
    expect(chebyshevIntervalBound.answer(inside)).toMatchObject({ value: 0.75 });
    expect(byCode(chebyshevIntervalBound.distractors(inside))).toEqual({
      ONE_OVER_K: 0.5,
      WRONG_FORM: 0.25,
      WIDTH_NOT_HALF: 0.9375,
    });
    const outside = { context: 'withdrawals', mu: 40, sigma: 10, c: 30, mode: 'outside' } as const;
    expect(chebyshevIntervalBound.answer(outside)).toMatchObject({ value: 0.1111 });
  });
});

describe('sample-mean-chebyshev-bound', () => {
  it('matches Chebyshev applied to the total S = X₁ + … + Xₙ, with the numbers read from the stem', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(sampleMeanChebyshevBound, seed);
        const [n = 0, mu = 0, sigma = 0, ...rest] = mathNumbers(stem);
        const eps = rest.find((x) => x !== mu) ?? 0;
        expect([n, mu, sigma, eps]).toEqual([p.n, p.mu, p.sigma, p.eps]);
        // The total has variance n·σ² (adding n equal variances one by one); |X̄ − μ| ≥ ε is |S − nμ| ≥ nε.
        let varTotal = 0;
        for (let i = 0; i < n; i++) varTotal += sigma ** 2;
        const bound = varTotal / (n * eps) ** 2;
        const target = p.mode === 'outside' ? bound : 1 - bound;
        expect(Math.abs(value - target)).toBeLessThanOrEqual(0.0001 + 1e-9);
      }),
      RUNS,
    );
  });

  it('gives a bound that says something and a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(sampleMeanChebyshevBound, seed);
        const bound = p.sigma ** 2 / (p.n * p.eps ** 2);
        expect(bound).toBeGreaterThanOrEqual(0.01);
        expect(bound).toBeLessThanOrEqual(0.6);
        // One draw alone: Chebyshev says much less, which is the point of averaging.
        expect(p.sigma ** 2 / p.eps ** 2).toBeGreaterThan(bound);
        expect(p.eps).toBeLessThan(p.mu);
        expect(p.n).toBeGreaterThanOrEqual(100);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        expect(distractors.length).toBeLessThanOrEqual(4);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in ST206 (2500 policies, σ = 1500, ε = 60)', () => {
    const p = {
      context: 'insurance',
      n: 2500,
      mu: 300,
      sigma: 1500,
      eps: 60,
      mode: 'outside',
    } as const;
    expect(sampleMeanChebyshevBound.answer(p)).toMatchObject({ value: 0.25 });
    expect(sampleMeanChebyshevBound.steps(p)[0]?.result).toBe(900);
    // NO_N (625) and EPS_NOT_SQUARED (15) are not probabilities and are dropped; VAR_OVER_N_SQUARED
    // (0.0001) is within the tolerance of SD_NOT_VARIANCE (0.0002).
    expect(byCode(sampleMeanChebyshevBound.distractors(p))).toEqual({
      SD_NOT_VARIANCE: 0.0002,
      WRONG_FORM: 0.75,
    });
    const inside = { ...p, mode: 'inside' } as const;
    expect(sampleMeanChebyshevBound.answer(inside)).toMatchObject({ value: 0.75 });
  });
});

describe('chebyshev-sample-size', () => {
  it('is the smallest n whose bound σ²/(nε²) is at most α, found by checking n and n − 1', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(chebyshevSampleSize, seed);
        const alpha = p.alphaPct / 100;
        const bound = (n: number) => p.sigma ** 2 / (n * p.eps ** 2);
        expect(Number.isInteger(value)).toBe(true);
        expect(bound(value)).toBeLessThanOrEqual(alpha * (1 + 1e-12));
        expect(bound(value - 1)).toBeGreaterThan(alpha * (1 + 1e-12));
      }),
      RUNS,
    );
  });

  it('reads σ, ε and the guarantee from the stem and keeps n realistic', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(chebyshevSampleSize, seed);
        const nums = mathNumbers(stem);
        expect(nums).toContain(p.eps);
        expect(nums.at(-1)).toBeCloseTo(1 - p.alphaPct / 100, 9);
        if (p.context === 'poll') expect(p.sigma).toBe(0.5);
        else expect(nums.slice(0, 2)).toEqual([p.mu, p.sigma]);
        expect(value).toBeGreaterThanOrEqual(50);
        expect(value).toBeLessThanOrEqual(200000);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        for (const d of distractors) expect(Number.isInteger(d.value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked examples 2 and 3 in ST206', () => {
    const insurance = { context: 'insurance', mu: 300, sigma: 1500, eps: 60, alphaPct: 5 } as const;
    expect(chebyshevSampleSize.answer(insurance)).toMatchObject({ value: 12500 });
    const poll = { context: 'poll', mu: 0, sigma: 0.5, eps: 0.03, alphaPct: 5 } as const;
    expect(chebyshevSampleSize.answer(poll)).toMatchObject({ value: 5556 });
    expect(byCode(chebyshevSampleSize.distractors(poll))).toEqual({
      ROUNDED_DOWN: 5555,
      SD_NOT_VARIANCE: 11112,
      EPS_NOT_SQUARED: 167,
      CONFIDENCE_NOT_ALPHA: 293,
    });
  });
});
