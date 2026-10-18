import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { averageAnnualGrowthRate } from './average-annual-growth-rate';
import { depreciationTimeToValue } from './depreciation-time-to-value';
import { growthTimeToMultiply } from './growth-time-to-multiply';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** Root of f between lo and hi by bisection (f changes sign there). Uses no logarithms. */
function bisect(f: (x: number) => number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  const fa = f(a);
  for (let i = 0; i < 200; i++) {
    const mid = (a + b) / 2;
    if (Math.sign(f(mid)) === Math.sign(fa)) a = mid;
    else b = mid;
  }
  return (a + b) / 2;
}

/** True when x has at most two decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

describe('growth-time-to-multiply', () => {
  it('matches the time found by bisection and by growing the value year by year', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(growthTimeToMultiply, seed);
        const b = 1 + p.rate / 100;
        const t = bisect((x) => b ** x - p.factor, 0, 500);
        expect(Math.abs(value - t)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Year by year: the value first reaches the factor in year ceil(t).
        let level = 1;
        let year = 0;
        while (level < p.factor) {
          level *= b;
          year++;
        }
        expect(year).toBe(Math.ceil(t - 1e-9));
        expect(value).toBeGreaterThanOrEqual(year - 1 - 0.005);
        expect(value).toBeLessThanOrEqual(year + 0.005);
      }),
      RUNS,
    );
  });

  it('keeps rates, factors and answers readable', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(growthTimeToMultiply, seed);
        expect(p.rate).toBeGreaterThan(0);
        expect(p.rate).toBeLessThanOrEqual(40);
        expect(Math.abs(p.rate * 10 - Math.round(p.rate * 10))).toBeLessThan(1e-9); // one decimal
        expect(p.factor).toBeGreaterThan(1);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(120);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('uses 70 / g for doubling, and linear growth always takes longer than compound growth', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(growthTimeToMultiply, seed);
        const rule = distractors.find((d) => d.mistakeCode === 'RULE_OF_70');
        if (p.factor === 2 && rule) {
          expect(Math.abs(rule.value - 70 / p.rate)).toBeLessThanOrEqual(0.005 + 1e-9);
        }
        // (1 + g)^t ≥ 1 + g·t for t ≥ 1, so compound growth reaches the factor first.
        const linear = distractors.find((d) => d.mistakeCode === 'LINEAR_CHANGE');
        if (linear) expect(linear.value).toBeGreaterThan(value);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in F07 (prices doubling at 6 %)', () => {
    const p = { context: 'prices' as const, rate: 6, factor: 2 };
    expect(growthTimeToMultiply.answer(p)).toEqual({ kind: 'numeric', value: 11.9, decimals: 2 });
    const rule = growthTimeToMultiply.distractors(p).find((d) => d.mistakeCode === 'RULE_OF_70');
    expect(rule?.value).toBe(11.67);
  });
});

describe('average-annual-growth-rate', () => {
  it('matches the rate found by bisection, and compounding it reproduces the end value', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(averageAnnualGrowthRate, seed);
        const g = bisect((x) => p.start * (1 + x) ** p.years - p.end, 0, 1);
        expect(Math.abs(value - 100 * g)).toBeLessThanOrEqual(0.005 + 1e-9);
        let level = p.start;
        for (let year = 0; year < p.years; year++) level *= 1 + value / 100;
        // A rate rounded to 0.005 percentage points moves the end value by at most T · 0.005 %.
        expect(Math.abs(level / p.end - 1)).toBeLessThanOrEqual(p.years * 0.00005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('keeps the data realistic and the answer readable', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(averageAnnualGrowthRate, seed);
        expect(p.start).toBeGreaterThan(0);
        expect(p.end).toBeGreaterThan(p.start);
        expect(p.years).toBeGreaterThanOrEqual(4);
        expect(p.years).toBeLessThanOrEqual(20);
        expect(p.startYear).toBeGreaterThanOrEqual(1990);
        expect(p.startYear + p.years).toBeLessThanOrEqual(2025);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(30);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('simple average overshoots and the log growth rate undershoots the compound rate', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { value, distractors } = solve(averageAnnualGrowthRate, seed);
        const simple = distractors.find((d) => d.mistakeCode === 'SIMPLE_AVERAGE');
        const log = distractors.find((d) => d.mistakeCode === 'LOG_DIFFERENCE');
        if (simple) expect(simple.value).toBeGreaterThan(value);
        if (log) expect(log.value).toBeLessThan(value);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in F07 (GDP 250 → 380 from 2012 to 2022)', () => {
    const p = { context: 'gdp' as const, startYear: 2012, years: 10, start: 250, end: 380 };
    expect(averageAnnualGrowthRate.answer(p)).toEqual({
      kind: 'numeric',
      value: 4.28,
      decimals: 2,
    });
    const byCode = Object.fromEntries(
      averageAnnualGrowthRate.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.SIMPLE_AVERAGE).toBe(5.2);
    expect(byCode.LOG_DIFFERENCE).toBe(4.19);
  });
});

describe('depreciation-time-to-value', () => {
  it('matches the time found by bisection, with the yearly factor also found by bisection', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(depreciationTimeToValue, seed);
        const b = bisect((x) => p.price * x ** p.years - p.value, 0, 1);
        const t = bisect((x) => p.price * b ** x - p.target, 0, 100);
        expect(Math.abs(value - t)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Year by year: the value is still above the target before t and below it after.
        let worth = p.price;
        for (let year = 1; year <= Math.floor(t); year++) worth *= b;
        expect(worth).toBeGreaterThanOrEqual(p.target - 1e-6);
        expect(worth * b).toBeLessThan(p.target + 1e-6);
      }),
      RUNS,
    );
  });

  it('keeps prices, values and answers sensible', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(depreciationTimeToValue, seed);
        expect(p.price).toBeGreaterThan(p.value);
        expect(p.value).toBeGreaterThan(p.target);
        expect(p.target).toBeGreaterThan(0);
        expect(Number.isInteger(p.price) && Number.isInteger(p.value)).toBe(true);
        expect(Number.isInteger(p.target)).toBe(true);
        expect([0.5, 0.4, 0.3, 0.25, 0.2, 0.1]).toContain(p.target / p.price);
        expect(value).toBeGreaterThan(p.years);
        expect(value).toBeLessThanOrEqual(40);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('measuring from the later observation is off by exactly the years already passed', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(depreciationTimeToValue, seed);
        const late = distractors.find((d) => d.mistakeCode === 'WRONG_START');
        if (late) expect(Math.abs(late.value - (value - p.years))).toBeLessThanOrEqual(0.01 + 1e-9);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in F07 (van 30 000 → 18 000 in 3 years, when 6 000?)', () => {
    const p = { asset: 'van' as const, price: 30000, years: 3, value: 18000, target: 6000 };
    expect(depreciationTimeToValue.answer(p)).toEqual({
      kind: 'numeric',
      value: 9.45,
      decimals: 2,
    });
    const linear = depreciationTimeToValue
      .distractors(p)
      .find((d) => d.mistakeCode === 'LINEAR_CHANGE');
    expect(linear?.value).toBe(6);
  });
});
