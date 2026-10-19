import fc from 'fast-check';
import { erf } from 'mathjs';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { hasDecimals, NORMAL_CONTEXTS } from './contexts';
import { normalCdf, tableCdf, Z_FOR_PERCENT } from './normal';
import { normalPercentileValue } from './normal-percentile-value';
import { normalRangeProbability } from './normal-range-probability';
import { sumOfIndependentNormals } from './sum-of-independent-normals';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, answer: pr.answer, value: pr.answer.value, distractors: pr.distractors };
};

/** The N(mean, sd²) density, written out from its formula. */
const density = (mean: number, sd: number) => (x: number) =>
  Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

/** Simpson's rule with n (even) strips: area under f between a and b. */
function simpson(f: (x: number) => number, a: number, b: number, n = 400): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** P(lower < X < upper) for X ~ N(mean, sd²) as an area, with ±10 sd standing in for ±∞. */
const area = (mean: number, sd: number, lower: number | null, upper: number | null) =>
  simpson(density(mean, sd), lower ?? mean - 10 * sd, upper ?? mean + 10 * sd, 2000);

describe('the standard normal cdf Φ', () => {
  it('agrees with math.js erf to 1e-12 on [−6, 6]', () => {
    for (let z = -6; z <= 6; z += 0.01) {
      const ref = 0.5 * (1 + (erf(z / Math.SQRT2) as number));
      expect(Math.abs(normalCdf(z) - ref)).toBeLessThan(1e-12);
    }
  });

  it('matches printed table values', () => {
    const table: [number, number][] = [
      [0, 0.5],
      [0.5, 0.6915],
      [1, 0.8413],
      [1.28, 0.8997],
      [1.4, 0.9192],
      [1.5, 0.9332],
      [1.6, 0.9452],
      [1.96, 0.975],
      [2, 0.9772],
      [2.5, 0.9938],
      [3, 0.9987],
      [-1, 0.1587],
      [-1.4, 0.0808],
    ];
    for (const [z, phi] of table) expect(tableCdf(z)).toBe(phi);
  });

  it('gives the 68–95–99.7 rule', () => {
    expect(normalCdf(1) - normalCdf(-1)).toBeCloseTo(0.6827, 4);
    expect(normalCdf(2) - normalCdf(-2)).toBeCloseTo(0.9545, 4);
    expect(normalCdf(3) - normalCdf(-3)).toBeCloseTo(0.9973, 4);
  });

  it('uses z values whose left area is the stated percentage (by integrating the density)', () => {
    for (const [pct, z] of Object.entries(Z_FOR_PERCENT)) {
      const left = 0.5 + Math.sign(z) * simpson(density(0, 1), 0, Math.abs(z), 2000);
      expect(Math.abs(left - Number(pct) / 100)).toBeLessThan(0.0001);
    }
  });
});

describe('normal-range-probability', () => {
  it('equals the area under the density between the two values', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(normalRangeProbability, seed);
        // Table rounding of each Φ adds at most 0.0001.
        expect(Math.abs(value - area(p.mean, p.sd, p.lower, p.upper))).toBeLessThanOrEqual(0.0002);
      }),
      RUNS,
    );
  });

  it('keeps values readable, z on the table grid and the answer a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(normalRangeProbability, seed);
        const c = NORMAL_CONTEXTS[p.context];
        const xs = [p.lower, p.upper].filter((x): x is number => x !== null);
        expect(xs.length).toBeGreaterThanOrEqual(1);
        for (const x of xs) {
          expect(hasDecimals(x, c.decimals)).toBe(true);
          expect(hasDecimals((x - p.mean) / p.sd, 2)).toBe(true);
          expect(x).toBeGreaterThanOrEqual(c.min);
          expect(x).toBeLessThanOrEqual(c.max);
        }
        if (p.lower !== null && p.upper !== null) expect(p.lower).toBeLessThan(p.upper);
        expect(p.sd).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST105 (demand N(400, 2500), above 470)', () => {
    const p = { context: 'demand', mean: 400, sd: 50, lower: 470, upper: null } as const;
    expect(normalRangeProbability.answer(p)).toMatchObject({ kind: 'numeric', value: 0.0808 });
    const byCode = Object.fromEntries(
      normalRangeProbability.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ WRONG_TAIL: 0.9192, VARIANCE_FOR_SD: 0.488 });
  });

  it('reproduces worked example 2 in ST105 (returns N(0.1, 2.25), between −2 and 2.5)', () => {
    const p = { context: 'returns', mean: 0.1, sd: 1.5, lower: -2, upper: 2.5 } as const;
    expect(normalRangeProbability.answer(p)).toMatchObject({ kind: 'numeric', value: 0.8644 });
    const byCode = Object.fromEntries(
      normalRangeProbability.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.UPPER_ONLY).toBe(0.9452);
    expect(byCode.WRONG_TAIL).toBe(0.1356);
  });
});

describe('normal-percentile-value', () => {
  it('has the stated share of the distribution below it (bisection on the integrated density)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, answer } = solve(normalPercentileValue, seed);
        const target = p.percent / 100;
        let lo = p.mean - 5 * p.sd;
        let hi = p.mean + 5 * p.sd;
        // 36 halvings narrow 10 sd to about 1e−10 sd, far below the rounding of the answer.
        for (let i = 0; i < 36; i++) {
          const mid = (lo + hi) / 2;
          if (area(p.mean, p.sd, null, mid) < target) lo = mid;
          else hi = mid;
        }
        expect(Math.abs(value - lo)).toBeLessThanOrEqual(answer.tolerance ?? 0);
      }),
      RUNS,
    );
  });

  it('lies on the correct side of the mean and stays sensible', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(normalPercentileValue, seed);
        expect(value < p.mean).toBe(p.percent < 50);
        expect(p.sd).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        if (p.context === 'exam') expect(value).toBeLessThanOrEqual(100);
        if (p.context !== 'returns') expect(value).toBeGreaterThan(0);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST105 (fund return N(0.05, 1.44), 5 % value-at-risk)', () => {
    const p = { context: 'returns', mean: 0.05, sd: 1.2, percent: 5 } as const;
    expect(normalPercentileValue.answer(p)).toMatchObject({ kind: 'numeric', value: -1.92 });
    const byCode = Object.fromEntries(
      normalPercentileValue.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.WRONG_SIGN_Z).toBe(2.02);
    expect(byCode.VARIANCE_FOR_SD).toBe(-2.32);
  });
});

describe('sum-of-independent-normals', () => {
  it('matches integrating over X the chance that Y fills the rest (no variance rule used)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sumOfIndependentNormals, seed);
        // P(X + Y < c) = ∫ f_X(x) · P(Y < c − x) dx
        const below = simpson(
          (x) => density(p.mean1, p.sd1)(x) * normalCdf((p.limit - x - p.mean2) / p.sd2),
          p.mean1 - 10 * p.sd1,
          p.mean1 + 10 * p.sd1,
          1000,
        );
        const above = 1 - below;
        const exact = p.context === 'markets' || p.context === 'branches' ? above : below;
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.0001);
      }),
      RUNS,
    );
  });

  it('keeps the variables positive in practice and the threshold a whole number', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(sumOfIndependentNormals, seed);
        expect(p.mean1 - 3 * p.sd1).toBeGreaterThanOrEqual(0);
        expect(p.mean2 - 3 * p.sd2).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(p.limit)).toBe(true);
        expect(Number.isInteger(Math.sqrt(p.sd1 ** 2 + p.sd2 ** 2))).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });
});
