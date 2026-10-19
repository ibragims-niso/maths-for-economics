import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import { createRng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { hasDecimals } from '../ST105/contexts';
import { normalCdf } from '../ST105/normal';
import { MEAN_CONTEXTS, sampleMeanTailProbability } from './sample-mean-tail-probability';
import { sampleProportionProbability } from './sample-proportion-probability';
import { sampleSizeForPrecision, Z_TWO_SIDED } from './sample-size-for-precision';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, answer: pr.answer, value: pr.answer.value, distractors: pr.distractors };
};

/** The N(mean, variance) density, written out from its formula. */
const density = (mean: number, variance: number) => (x: number) =>
  Math.exp(-((x - mean) ** 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);

/** Simpson's rule with n (even) strips: area under f between a and b. */
function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** P(X < c) for X ~ N(mean, variance) as an area, with mean − 10 sd standing in for −∞. */
const areaBelow = (mean: number, variance: number, c: number) =>
  simpson(density(mean, variance), mean - 10 * Math.sqrt(variance), c);

/** Exact binomial P(X < k) for X ~ Bin(n, p), from log-probabilities. */
function binomialBelow(n: number, p: number, k: number): number {
  let logC = 0; // log C(n, 0)
  let total = 0;
  for (let x = 0; x < n + 1 && x < k; x++) {
    if (x > 0) logC += Math.log(n - x + 1) - Math.log(x);
    total += Math.exp(logC + x * Math.log(p) + (n - x) * Math.log(1 - p));
  }
  return total;
}

describe('sample-mean-tail-probability', () => {
  it('equals the tail area of the normal curve with variance n·σ²/n² (variance of a sum, scaled)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sampleMeanTailProbability, seed);
        // Var(X₁ + … + Xₙ) = nσ² for independent draws; X̄ is the sum divided by n.
        const variance = (p.n * p.sd ** 2) / p.n ** 2;
        const below = areaBelow(p.mean, variance, p.threshold);
        const exact = p.above ? 1 - below : below;
        // Table rounding of Φ adds at most 0.0001.
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.0002);
      }),
      RUNS,
    );
  });

  it('keeps samples large, numbers readable and the answer a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(sampleMeanTailProbability, seed);
        const se = p.sd / Math.sqrt(p.n);
        expect(p.n).toBeGreaterThanOrEqual(36);
        expect(Number.isInteger(Math.sqrt(p.n))).toBe(true);
        expect(hasDecimals(se, 2)).toBe(true);
        expect(hasDecimals((p.threshold - p.mean) / se, 2)).toBe(true);
        expect(hasDecimals(p.threshold, MEAN_CONTEXTS[p.context].decimals)).toBe(true);
        expect(p.threshold).toBeGreaterThan(0);
        expect(p.sd).toBeGreaterThan(0);
        expect(p.sd).toBeLessThan(p.mean);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'DIVIDED_BY_N',
          'SD_NOT_SE',
          'WRONG_TAIL',
        ]);
      }),
      RUNS,
    );
  });

  it('is close to a seeded simulation of a skewed population (worked example 1 in ST202)', () => {
    const p = {
      context: 'food',
      mean: 60,
      sd: 60,
      n: 36,
      threshold: 72,
      above: true,
    } as const;
    expect(sampleMeanTailProbability.answer(p)).toMatchObject({ kind: 'numeric', value: 0.1151 });
    const byCode = Object.fromEntries(
      sampleMeanTailProbability.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ SD_NOT_SE: 0.4207, DIVIDED_BY_N: 0, WRONG_TAIL: 0.8849 });

    // Spending with mean 60 and SD 60, strongly right-skewed (exponential), 36 households a sample.
    const rng = createRng(2026);
    const reps = 20000;
    let over = 0;
    for (let r = 0; r < reps; r++) {
      let sum = 0;
      for (let i = 0; i < 36; i++) sum += -60 * Math.log(1 - rng.next());
      if (sum / 36 > 72) over++;
    }
    // The exact value for this population is 0.1184; the CLT answer 0.1151 is close to it.
    expect(Math.abs(over / reps - 0.1151)).toBeLessThan(0.01);
  });
});

describe('sample-proportion-probability', () => {
  it('equals the area under the normal curve with the Bernoulli variance (p − p²)/n', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p: q, value } = solve(sampleProportionProbability, seed);
        // One answer B is 1 with probability p: Var(B) = E[B²] − E[B]² = p − p².
        const variance = (q.p - q.p ** 2) / q.n;
        const below = areaBelow(q.p, variance, q.threshold);
        const exact = q.above ? 1 - below : below;
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.0002);
      }),
      RUNS,
    );
  });

  it('is close to the exact binomial probability for the count of "yes" answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p: q, value } = solve(sampleProportionProbability, seed);
        const k = q.n * q.threshold;
        // The normal curve's P(p̂ < c) should lie between the exact P(count < k) and
        // P(count ≤ k): without a continuity correction it lands inside the jump at k.
        const strict = binomialBelow(q.n, q.p, Math.ceil(k - 1e-9));
        const orEqual = binomialBelow(q.n, q.p, Math.floor(k + 1e-9) + 1);
        const below = q.above ? 1 - value : value;
        expect(below).toBeGreaterThan(strict - 0.03);
        expect(below).toBeLessThan(orEqual + 0.03);
      }),
      RUNS,
    );
  });

  it('keeps the survey large, the threshold a 3-decimal share and the answer a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p: q, value, distractors } = solve(sampleProportionProbability, seed);
        const se = Math.sqrt((q.p * (1 - q.p)) / q.n);
        expect(q.n * q.p).toBeGreaterThanOrEqual(9.99);
        expect(q.n * (1 - q.p)).toBeGreaterThanOrEqual(9.99);
        expect(hasDecimals(se, 4)).toBe(true);
        expect(hasDecimals((q.threshold - q.p) / se, 2)).toBe(true);
        expect(hasDecimals(q.threshold, 3)).toBe(true);
        expect(q.threshold).toBeGreaterThan(0);
        expect(q.threshold).toBeLessThan(1);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in ST202 (unemployment 10 %, 900 people, below 8.5 %)', () => {
    const q = { context: 'unemployment', p: 0.1, n: 900, threshold: 0.085, above: false } as const;
    expect(sampleProportionProbability.answer(q)).toMatchObject({ kind: 'numeric', value: 0.0668 });
    const byCode = Object.fromEntries(
      sampleProportionProbability.distractors(q).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.WRONG_TAIL).toBe(0.9332);
    expect(byCode.NO_SQUARE_ROOT).toBe(0);
    // √(0.1/900) = 0.01054, z = −1.42.
    expect(byCode.FORGOT_ONE_MINUS_P).toBe(0.0778);
  });
});

describe('sample-size-for-precision', () => {
  it('is the smallest n that reaches the probability (search, not the formula)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sampleSizeForPrecision, seed);
        const z = Z_TWO_SIDED[p.level] ?? 0;
        const reaches = (n: number) => (p.halfWidth * Math.sqrt(n)) / p.sd >= z;
        let n = 1;
        while (!reaches(n)) n++;
        expect(value).toBe(n);
        // The probability at that n really is at least the level (z is rounded to 3 decimals).
        const prob = 2 * normalCdf((p.halfWidth * Math.sqrt(n)) / p.sd) - 1;
        expect(prob).toBeGreaterThanOrEqual(p.level / 100 - 0.0001);
      }),
      RUNS,
    );
  });

  it('gives a realistic survey size large enough for the central limit theorem', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { value, distractors } = solve(sampleSizeForPrecision, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(30);
        expect(value).toBeLessThanOrEqual(5000);
        expect(distractors).toHaveLength(3);
        expect(distractors.find((d) => d.mistakeCode === 'NOT_ROUNDED_UP')?.value).toBe(value - 1);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST202 (σ = 600, within 100 with probability 95 %)', () => {
    const p = { context: 'spending', sd: 600, halfWidth: 100, level: 95 } as const;
    expect(sampleSizeForPrecision.answer(p)).toMatchObject({ kind: 'numeric', value: 139 });
    const byCode = Object.fromEntries(
      sampleSizeForPrecision.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ NOT_ROUNDED_UP: 138, FORGOT_TO_SQUARE: 12, FORGOT_Z: 36 });
  });
});
