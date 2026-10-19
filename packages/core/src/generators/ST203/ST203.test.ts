import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import { createRng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { hasDecimals } from '../ST105/contexts';
import { normalCdf } from '../ST105/normal';
import { ciMeanKnownSigmaLimit } from './ci-mean-known-sigma-limit';
import { ciMeanTSmallSample, T_CONTEXTS } from './ci-mean-t-small-sample';
import { ciProportionLimit } from './ci-proportion-limit';
import { type Level, oneTailZ, T_TABLE, tFor, zFor } from './critical-values';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const codesOf = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** Simpson's rule with m (even) strips: area under f between a and b. */
function simpson(f: (x: number) => number, a: number, b: number, m = 20000): number {
  const h = (b - a) / m;
  let s = f(a) + f(b);
  for (let i = 1; i < m; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Γ(k/2) for a whole number k, from Γ(1/2) = √π, Γ(1) = 1 and Γ(x + 1) = x·Γ(x). */
function gammaHalf(k: number): number {
  let x = k % 2 === 0 ? 1 : 0.5;
  let g = k % 2 === 0 ? 1 : Math.sqrt(Math.PI);
  while (x < k / 2 - 1e-9) {
    g *= x;
    x += 1;
  }
  return g;
}

/** P(|T| < t) for Student's t with v degrees of freedom, as the area under its density. */
function tCentralArea(t: number, v: number): number {
  const c = gammaHalf(v + 1) / (Math.sqrt(v * Math.PI) * gammaHalf(v));
  return 2 * simpson((x) => c * (1 + (x * x) / v) ** (-(v + 1) / 2), 0, t);
}

/** The z with P(|Z| < z) = level, by bisection on Φ (no table). */
function zByBisection(level: number): number {
  let lo = 0;
  let hi = 10;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (2 * normalCdf(mid) - 1 < level) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

describe('critical values', () => {
  it('has t values that are the true quantiles rounded to 3 decimals', () => {
    for (const [df, row] of Object.entries(T_TABLE)) {
      for (const level of [90, 95, 99] as const) {
        const t = row[level];
        const v = Number(df);
        // The exact quantile lies within half a unit of the last decimal of the table value.
        expect(tCentralArea(t - 0.0005, v), `df ${df}, ${level} %`).toBeLessThan(level / 100);
        expect(tCentralArea(t + 0.0005, v), `df ${df}, ${level} %`).toBeGreaterThan(level / 100);
      }
    }
  });

  it('has t values that fall towards z as the degrees of freedom grow', () => {
    for (const level of [90, 95, 99] as const) {
      const dfs = Object.keys(T_TABLE).map(Number);
      for (let i = 1; i < dfs.length; i++) {
        expect(tFor(dfs[i] ?? 0, level)).toBeLessThan(tFor(dfs[i - 1] ?? 0, level));
      }
      expect(tFor(120, level)).toBeGreaterThan(zFor(level));
      expect(tFor(120, level) - zFor(level)).toBeLessThan(0.05);
    }
  });

  it('uses the two-sided z values and the one-sided ones for the mistake', () => {
    for (const level of [90, 95, 99] as const) {
      expect(Math.abs(zFor(level) - zByBisection(level / 100))).toBeLessThan(0.0005);
      // The one-sided value puts all of 1 − level in the upper tail: Φ(z) = level.
      expect(Math.abs(normalCdf(oneTailZ(level)) - level / 100)).toBeLessThan(0.0002);
    }
  });
});

describe('ci-mean-known-sigma-limit', () => {
  it('is x̄ ± z·σ/√n with z found by bisection on Φ', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(ciMeanKnownSigmaLimit, seed);
        const se = p.sd / Math.sqrt(p.n);
        const z = zByBisection(p.level / 100);
        const exact = p.upper ? p.mean + z * se : p.mean - z * se;
        // 2-decimal rounding, plus z = 1.96 etc. being rounded to 3 decimals.
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 0.0005 * se + 1e-9);
        // The answer really is a limit at the stated confidence: the coverage of x̄ ± |L − x̄|.
        const half = Math.abs(value - p.mean);
        expect(Math.abs(2 * normalCdf(half / se) - 1 - p.level / 100)).toBeLessThan(
          0.01 / se + 0.001,
        );
      }),
      RUNS,
    );
  });

  it('keeps numbers readable and the interval sensible', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(ciMeanKnownSigmaLimit, seed);
        expect(p.n).toBeGreaterThanOrEqual(36);
        expect(Number.isInteger(Math.sqrt(p.n))).toBe(true);
        expect(hasDecimals(p.mean, 2)).toBe(true);
        expect(hasDecimals(p.sd / Math.sqrt(p.n), 2)).toBe(true);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
        if (p.upper) expect(value).toBeGreaterThan(p.mean);
        else expect(value).toBeLessThan(p.mean);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (x̄ = 1150, σ = 400, n = 64)', () => {
    const base = {
      context: 'income',
      mean: 1150,
      sd: 400,
      n: 64,
      level: 95 as Level,
      givenVariance: false,
    } as const;
    expect(ciMeanKnownSigmaLimit.answer({ ...base, upper: false })).toMatchObject({ value: 1052 });
    expect(ciMeanKnownSigmaLimit.answer({ ...base, upper: true })).toMatchObject({ value: 1248 });
    expect(ciMeanKnownSigmaLimit.answer({ ...base, level: 99, upper: false })).toMatchObject({
      value: 1021.2,
    });
    expect(ciMeanKnownSigmaLimit.answer({ ...base, level: 99, upper: true })).toMatchObject({
      value: 1278.8,
    });
    expect(codesOf(ciMeanKnownSigmaLimit.distractors({ ...base, upper: false }))).toEqual({
      FORGOT_ROOT_N: 366,
      ONE_TAIL_Z: 1067.75,
      DIVIDED_BY_N: 1137.75,
    });
  });
});

describe('ci-proportion-limit', () => {
  it('matches the limit built from the variance of the 0/1 answers themselves', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p: q, value } = solve(ciProportionLimit, seed);
        // The answers as a list of ones and zeros; their mean is p̂ and their variance p̂(1 − p̂).
        const answers: number[] = Array.from({ length: q.n }, (_, i) => (i < q.x ? 1 : 0));
        const mean = answers.reduce((s, a) => s + a, 0) / q.n;
        const variance = answers.reduce((s, a) => s + (a - mean) ** 2, 0) / q.n;
        const se = Math.sqrt(variance / q.n);
        const z = zByBisection(q.level / 100);
        const exact = q.upper ? mean + z * se : mean - z * se;
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.00005 + 0.0005 * se + 1e-12);
      }),
      RUNS,
    );
  });

  it('keeps the survey large and the answer a 4-decimal share between 0 and 1', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p: q, value, distractors } = solve(ciProportionLimit, seed);
        expect(q.x).toBeGreaterThanOrEqual(15);
        expect(q.n - q.x).toBeGreaterThanOrEqual(15);
        expect(hasDecimals(q.x / q.n, 4)).toBe(true);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (117 unemployed out of 1500)', () => {
    const q = { context: 'unemployment', x: 117, n: 1500, level: 95 as Level } as const;
    expect(ciProportionLimit.answer({ ...q, upper: false })).toMatchObject({ value: 0.0644 });
    expect(ciProportionLimit.answer({ ...q, upper: true })).toMatchObject({ value: 0.0916 });
  });

  it('covers the true rate in about 95 % of simulated surveys (the meaning of 95 %)', () => {
    // True unemployment rate 7.8 %, surveys of 1500 people, a fixed seed.
    const rng = createRng(203);
    const p = 0.078;
    const n = 1500;
    const reps = 2000;
    let covered = 0;
    for (let r = 0; r < reps; r++) {
      let x = 0;
      for (let i = 0; i < n; i++) if (rng.next() < p) x++;
      const lower = ciProportionLimit.answer({
        context: 'unemployment',
        x,
        n,
        level: 95,
        upper: false,
      });
      const upper = ciProportionLimit.answer({
        context: 'unemployment',
        x,
        n,
        level: 95,
        upper: true,
      });
      if (lower.kind !== 'numeric' || upper.kind !== 'numeric') throw new Error('numeric expected');
      if (lower.value < p && p < upper.value) covered++;
    }
    expect(covered / reps).toBeGreaterThan(0.93);
    expect(covered / reps).toBeLessThan(0.97);
  });
});

describe('ci-mean-t-small-sample', () => {
  it('equals x̄ ± t·s/√n with s from the shortcut formula Σx² − n·x̄²', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(ciMeanTSmallSample, seed);
        const n = p.values.length;
        let sum = 0;
        let sumSq = 0;
        for (const x of p.values) {
          sum += x;
          sumSq += x * x;
        }
        const mean = sum / n;
        const s = Math.sqrt((sumSq - n * mean * mean) / (n - 1));
        const t = T_TABLE[n - 1]?.[p.level] ?? Number.NaN;
        // The t value really has the stated confidence with n − 1 degrees of freedom.
        expect(Math.abs(tCentralArea(t, n - 1) - p.level / 100)).toBeLessThan(0.0002);
        const half = (t * s) / Math.sqrt(n);
        const exact = p.upper ? mean + half : mean - half;
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('uses small samples of readable, positive values and a positive interval', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(ciMeanTSmallSample, seed);
        const n = p.values.length;
        expect(n).toBeGreaterThanOrEqual(5);
        expect(n).toBeLessThanOrEqual(8);
        for (const x of p.values) {
          expect(x).toBeGreaterThan(0);
          expect(hasDecimals(x, T_CONTEXTS[p.context].decimals)).toBe(true);
        }
        expect(new Set(p.values).size).toBeGreaterThanOrEqual(3);
        expect(value).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'SD_DIVISOR_N',
          'USED_Z_NOT_T',
          'WRONG_DF',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (8 inflation forecasts, 95 %)', () => {
    const p = {
      context: 'inflation',
      values: [4.2, 5.0, 3.8, 4.6, 5.4, 4.0, 4.8, 4.4],
      level: 95 as Level,
    } as const;
    const values = [...p.values];
    expect(ciMeanTSmallSample.answer({ ...p, values, upper: false })).toMatchObject({
      value: 4.08,
    });
    expect(ciMeanTSmallSample.answer({ ...p, values, upper: true })).toMatchObject({ value: 4.97 });
    expect(codesOf(ciMeanTSmallSample.distractors({ ...p, values, upper: false }))).toEqual({
      USED_Z_NOT_T: 4.16,
      SD_DIVISOR_N: 4.11,
    });
  });
});
