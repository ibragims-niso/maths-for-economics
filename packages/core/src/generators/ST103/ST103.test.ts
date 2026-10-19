import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { expectedValueDiscrete } from './expected-value-discrete';
import { profitVarianceLinearTransform } from './profit-variance-linear-transform';
import { varianceDiscreteRisk } from './variance-discrete-risk';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value };
};

/**
 * Probabilities are in hundredths, so the distribution is exactly 100 equally likely "years":
 * outcome k appears chances[k] times. Averages over this list need no probability formula.
 */
function hundredYears(outcomes: number[], chances: number[]): number[] {
  expect(chances.reduce((s, c) => s + c, 0)).toBe(100);
  return outcomes.flatMap((x, k) => Array<number>(chances[k] ?? 0).fill(x));
}
const average = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
/** Average squared distance from the average (population variance, divide by the count). */
const spread = (xs: number[]) => {
  const m = average(xs);
  return average(xs.map((x) => (x - m) ** 2));
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

describe('expected-value-discrete', () => {
  it('equals the average outcome over 100 equally likely years', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(expectedValueDiscrete, seed);
        const years = hundredYears(p.outcomes, p.chances);
        expect(years).toHaveLength(100);
        expect(Math.abs(value - average(years))).toBeLessThan(1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('draws a sensible distribution with one most likely outcome', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(expectedValueDiscrete, seed);
        expect([3, 4]).toContain(p.outcomes.length);
        expect(p.chances).toHaveLength(p.outcomes.length);
        expect(p.chances.every((c) => Number.isInteger(c) && c >= 1)).toBe(true);
        expect(new Set(p.outcomes).size).toBe(p.outcomes.length);
        for (let k = 1; k < p.outcomes.length; k++) {
          expect(p.outcomes[k]).toBeGreaterThan(p.outcomes[k - 1] ?? Number.NEGATIVE_INFINITY);
        }
        const top = Math.max(...p.chances);
        expect(p.chances.filter((c) => c === top)).toHaveLength(1);
        if (p.context === 'claims') {
          expect(p.outcomes[0]).toBe(0);
          expect(p.chances[0]).toBeGreaterThanOrEqual(60);
        } else {
          expect(p.outcomes[0]).toBeLessThan(0);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST103 (−10 %, 5 %, 20 % with 0.2, 0.5, 0.3)', () => {
    const p = { context: 'return', outcomes: [-10, 5, 20], chances: [20, 50, 30] } as const;
    const params = { ...p, outcomes: [...p.outcomes], chances: [...p.chances] };
    expect(expectedValueDiscrete.answer(params)).toMatchObject({ kind: 'numeric', value: 6.5 });
    const codes = expectedValueDiscrete.distractors(params).map((d) => [d.mistakeCode, d.value]);
    // The most likely outcome (5 %) equals the simple average here, so it is listed once.
    expect(codes).toEqual([
      ['SIMPLE_AVERAGE', 5],
      ['NO_PROBABILITIES', 15],
    ]);
  });
});

describe('variance-discrete-risk', () => {
  it('equals the average squared distance from the mean over 100 equally likely years', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(varianceDiscreteRisk, seed);
        const v = spread(hundredYears(p.outcomes, p.chances));
        const expected = p.ask === 'variance' ? v : Math.sqrt(v);
        expect(Math.abs(value - expected)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(value).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('has a loss in the worst case and a visible spread', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(varianceDiscreteRisk, seed);
        expect(p.outcomes[0]).toBeLessThan(0);
        expect(p.chances.every((c) => c >= 5)).toBe(true);
        expect(Math.sqrt(spread(hundredYears(p.outcomes, p.chances)))).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in ST103 (variance 110.25, standard deviation 10.5)', () => {
    const base = { context: 'return' as const, outcomes: [-10, 5, 20], chances: [20, 50, 30] };
    expect(varianceDiscreteRisk.answer({ ...base, ask: 'variance' })).toMatchObject({
      value: 110.25,
    });
    expect(varianceDiscreteRisk.answer({ ...base, ask: 'sd' })).toMatchObject({ value: 10.5 });
    const byCode = Object.fromEntries(
      varianceDiscreteRisk
        .distractors({ ...base, ask: 'variance' })
        .map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ NO_MEAN_SQUARED: 152.5, REVERSED_ORDER: -110.25, UNWEIGHTED: 152.25 });
  });
});

describe('profit-variance-linear-transform', () => {
  it('equals the spread of the 100 daily profits computed one by one', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(profitVarianceLinearTransform, seed);
        const profits = hundredYears(p.sales, p.chances).map((x) => p.margin * x - p.fixed);
        expect(Math.abs(value - spread(profits))).toBeLessThan(1e-6);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps sales in tens, probabilities at least 0.1 and the business profitable on average', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(profitVarianceLinearTransform, seed);
        expect(p.sales.every((x) => x % 10 === 0 && x >= 50 && x <= 300)).toBe(true);
        expect(new Set(p.sales).size).toBe(3);
        expect(p.chances.every((c) => c >= 10)).toBe(true);
        const profits = hundredYears(p.sales, p.chances).map((x) => p.margin * x - p.fixed);
        expect(average(profits)).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });
});
