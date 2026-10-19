import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { hasDecimals } from '../ST105/contexts';
import { normalCdf } from '../ST105/normal';
import { MEAN_CONTEXTS } from './contexts';
import { hypothesisTestStatistic } from './hypothesis-test-statistic';
import { pValue, zTestPValue } from './z-test-p-value';
import { zTestPower } from './z-test-power';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** The N(mean, sd²) density, written out from its formula. */
const density = (mean: number, sd: number) => (x: number) =>
  Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

/** Simpson's rule with n (even) strips: area under f between a and b. */
function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** P(X > c) for X ~ N(mean, sd²) as an area, with mean + 12 sd standing in for +∞. */
const areaAbove = (mean: number, sd: number, c: number) =>
  simpson(density(mean, sd), c, Math.max(c, mean + 12 * sd));
/** P(X < c) for X ~ N(mean, sd²) as an area. */
const areaBelow = (mean: number, sd: number, c: number) =>
  simpson(density(mean, sd), Math.min(c, mean - 12 * sd), c);

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

describe('hypothesis-test-statistic', () => {
  it('equals the gap in standard errors, from the variance of a sum or the count form', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(hypothesisTestStatistic, seed);
        if (p.kind === 'mean') {
          const t = p.test;
          // Var(X̄) = Var(X₁ + … + Xₙ)/n² = nσ²/n².
          const sdMean = Math.sqrt((t.n * t.sd ** 2) / t.n ** 2);
          expect(Math.abs(value - (t.xbar - t.mu0) / sdMean)).toBeLessThan(1e-9);
        } else {
          const t = p.test;
          // Count form: (X − np₀)/√(np₀(1 − p₀)) for X ~ Bin(n, p₀).
          const z = (t.x - t.n * t.p0) / Math.sqrt(t.n * t.p0 * (1 - t.p0));
          expect(Math.abs(value - z)).toBeLessThan(1e-9);
        }
      }),
      RUNS,
    );
  });

  it('keeps samples sensible, the statistic on the 0.01 grid and the right distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(hypothesisTestStatistic, seed);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.5);
        expect(Math.abs(value)).toBeLessThanOrEqual(3.5);
        const side = p.test.side;
        if (side === 'greater') expect(value).toBeGreaterThan(0);
        if (side === 'less') expect(value).toBeLessThan(0);
        if (p.kind === 'mean') {
          const t = p.test;
          expect(t.xbar).toBeGreaterThan(0);
          expect(t.sd).toBeGreaterThan(0);
          expect(t.sd).toBeLessThan(t.mu0);
          expect(hasDecimals(t.xbar, MEAN_CONTEXTS[t.context].decimals)).toBe(true);
          expect(hasDecimals(t.sd / Math.sqrt(t.n), 2)).toBe(true);
          // z tests use large samples (CLT); t tests small ones from a roughly normal population.
          if (p.known) expect(t.n).toBeGreaterThanOrEqual(36);
          else expect(t.n).toBeLessThanOrEqual(25);
          expect(codes(distractors)).toEqual(['DIVIDED_BY_N', 'SD_NOT_SE', 'SIGN_REVERSED']);
        } else {
          const t = p.test;
          expect(Number.isInteger(t.x)).toBe(true);
          expect(t.x).toBeGreaterThan(0);
          expect(t.x).toBeLessThan(t.n);
          expect(hasDecimals(t.x / t.n, 4)).toBe(true);
          expect(t.n * t.p0).toBeGreaterThanOrEqual(10);
          expect(t.n * (1 - t.p0)).toBeGreaterThanOrEqual(10);
          expect(codes(distractors)).toEqual(['PHAT_IN_SE', 'SD_NOT_SE', 'SIGN_REVERSED']);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked examples 1, 2 and 3 in ST204', () => {
    const wages = {
      kind: 'mean',
      known: true,
      test: { context: 'wages', mu0: 15, sd: 4, n: 64, xbar: 15.9, side: 'greater' },
    } as const;
    expect(hypothesisTestStatistic.answer(wages)).toMatchObject({ value: 1.8 });
    const jobs = {
      kind: 'proportion',
      test: { context: 'unemployment', p0: 0.1, n: 2500, x: 280, side: 'greater' },
    } as const;
    expect(hypothesisTestStatistic.answer(jobs)).toMatchObject({ value: 2 });
    const byCode = Object.fromEntries(
      hypothesisTestStatistic.distractors(jobs).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.PHAT_IN_SE).toBe(1.9);
    const prices = {
      kind: 'mean',
      known: false,
      test: { context: 'inflation', mu0: 2, sd: 1, n: 16, xbar: 2.6, side: 'two' },
    } as const;
    expect(hypothesisTestStatistic.answer(prices)).toMatchObject({ value: 2.4 });
  });
});

describe('z-test-p-value', () => {
  it('equals the tail area(s) of the standard normal curve beyond the observed z', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zTestPValue, seed);
        const { z } = makeProblem(zTestPValue, seed).steps.reduce(
          (acc, s, i) => (i === 1 && s.result !== undefined ? { z: s.result } : acc),
          { z: Number.NaN },
        );
        const right = areaAbove(0, 1, z);
        const left = areaBelow(0, 1, z);
        const exact =
          p.test.side === 'greater'
            ? right
            : p.test.side === 'less'
              ? left
              : 2 * Math.min(left, right);
        // A table rounds Φ to 4 decimals (doubled for two tails), and p is rounded to 4 decimals.
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.0002);
      }),
      RUNS,
    );
  });

  it('gives a 4-decimal probability on the side of H₁, with the matching distractors', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(zTestPValue, seed);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasDecimals(value, 4)).toBe(true);
        if (p.test.side === 'two') {
          expect(codes(distractors)).toEqual(['ONE_MINUS_P', 'ONE_TAIL_ONLY', 'WRONG_TAIL']);
          const half = distractors.find((d) => d.mistakeCode === 'ONE_TAIL_ONLY')?.value ?? 0;
          expect(Math.abs(value - 2 * half)).toBeLessThan(1e-9);
        } else {
          // The data point towards H₁, so the one-sided p-value is below one half.
          expect(value).toBeLessThan(0.5);
          expect(codes(distractors)).toEqual(['DOUBLED_ONE_SIDED', 'WRONG_TAIL']);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked examples 1 and 2 in ST204', () => {
    const wages = {
      kind: 'mean',
      test: { context: 'wages', mu0: 15, sd: 4, n: 64, xbar: 15.9, side: 'greater' },
    } as const;
    expect(zTestPValue.answer(wages)).toMatchObject({ value: 0.0359 });
    expect(pValue(1.8, 'two')).toBe(0.0718);
    const jobs = {
      kind: 'proportion',
      test: { context: 'unemployment', p0: 0.1, n: 2500, x: 280, side: 'greater' },
    } as const;
    expect(zTestPValue.answer(jobs)).toMatchObject({ value: 0.0228 });
    expect(pValue(2, 'two')).toBe(0.0456);
  });
});

describe('z-test-power', () => {
  /** The cut-off for x̄ found by search: the size of the test under μ₀ equals α. */
  function cutOff(mu0: number, se: number, alpha: number, up: boolean): number {
    let lo = up ? mu0 : mu0 - 10 * se;
    let hi = up ? mu0 + 10 * se : mu0;
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2;
      const size = up ? areaAbove(mu0, se, mid) : areaBelow(mu0, se, mid);
      if (size > alpha === up) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  it('equals the area of the rejection region under the true mean', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zTestPower, seed);
        const se = p.sd / Math.sqrt(p.n);
        const up = p.side === 'greater';
        const c = cutOff(p.mu0, se, p.alpha / 100, up);
        const power = up ? areaAbove(p.mu1, se, c) : areaBelow(p.mu1, se, c);
        // The answer is rounded to 2 decimals; table z values have 3 decimals.
        expect(Math.abs(value - power)).toBeLessThanOrEqual(0.0055);
      }),
      RUNS,
    );
  });

  it('is above α, below 1, and grows as the true mean moves further from μ₀', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(zTestPower, seed);
        const se = p.sd / Math.sqrt(p.n);
        const up = p.side === 'greater';
        expect(up ? p.mu1 > p.mu0 : p.mu1 < p.mu0).toBe(true);
        expect(p.mu1).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(p.alpha / 100);
        expect(value).toBeGreaterThanOrEqual(0.1);
        expect(value).toBeLessThanOrEqual(0.95);
        expect(hasDecimals(value, 2)).toBe(true);
        const further = zTestPower.answer({ ...p, mu1: p.mu1 + (up ? se : -se) });
        if (further.kind !== 'numeric') throw new Error('numeric expected');
        expect(further.value).toBeGreaterThan(value);
        expect(codes(distractors)).toEqual(['BETA_NOT_POWER', 'SD_NOT_SE', 'TWO_SIDED_CRITICAL']);
      }),
      RUNS,
    );
  });

  it('gives the same 2-decimal answer whichever way z is rounded for the table', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const pr = makeProblem(zTestPower, seed);
        if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
        // Step 3 standardises the cut-off under μ₁; power is Φ of minus that for H₁: μ > μ₀,
        // and Φ of it for H₁: μ < μ₀.
        const at = pr.steps[2]?.result ?? Number.NaN;
        const b = pr.params.side === 'greater' ? -at : at;
        for (const r of [Math.floor(b * 100 + 1e-9) / 100, Math.ceil(b * 100 - 1e-9) / 100]) {
          const tablePower = Math.round((Math.round(normalCdf(r) * 1e4) / 1e4) * 100) / 100;
          expect(tablePower).toBe(pr.answer.value);
        }
      }),
      RUNS,
    );
  });

  it('reproduces the power quoted in ST204 (wage test of example 1, true mean 16)', () => {
    const p = {
      context: 'wages',
      mu0: 15,
      sd: 4,
      n: 64,
      mu1: 16,
      side: 'greater',
      alpha: 5,
    } as const;
    expect(zTestPower.answer(p)).toMatchObject({ value: 0.64 });
    const byCode = Object.fromEntries(
      zTestPower.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.BETA_NOT_POWER).toBe(0.36);
    expect(byCode.TWO_SIDED_CRITICAL).toBe(0.52);
  });
});
