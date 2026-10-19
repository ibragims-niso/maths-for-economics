import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { annualisedGrowthFromLevels } from './annualised-growth-from-levels';
import { averageGrowthFromChainIndices } from './average-growth-from-chain-indices';
import { baseIndexFromChainRates } from './base-index-from-chain-rates';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** Root of f between lo and hi by bisection (f changes sign there). */
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

describe('base-index-from-chain-rates', () => {
  it('matches a simulated level series and the sum of log growth rates', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(baseIndexFromChainRates, seed);
        // Grow a level of 2500 year by year by adding that year's change in money terms.
        const levels = [2500];
        for (const t of p.tenths) {
          const prev = levels.at(-1) ?? 0;
          levels.push(prev + (prev * t) / 1000);
        }
        const base = (100 * (levels.at(-1) ?? 0)) / 2500;
        expect(Math.abs(value - base)).toBeLessThanOrEqual(0.005 + 1e-9);
        // The same through logs: ln(I/100) = Σ ln(1 + g).
        const logs = p.tenths.reduce((s, t) => s + Math.log(1 + t / 1000), 0);
        expect(Math.abs(value - 100 * Math.exp(logs))).toBeLessThanOrEqual(0.005 + 1e-9);
        // Each chain index is the ratio of consecutive base indices.
        for (let i = 1; i < levels.length; i++) {
          const chain = (levels[i] ?? 0) / (levels[i - 1] ?? 1);
          expect(chain).toBeCloseTo(1 + (p.tenths[i - 1] ?? 0) / 1000, 12);
        }
      }),
      RUNS,
    );
  });

  it('keeps the data realistic and the answer readable', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(baseIndexFromChainRates, seed);
        expect(p.tenths.length).toBeGreaterThanOrEqual(3);
        expect(p.tenths.length).toBeLessThanOrEqual(5);
        expect(p.tenths).not.toContain(0);
        for (const t of p.tenths) {
          expect(Number.isInteger(t)).toBe(true);
          expect(t).toBeGreaterThanOrEqual(-60);
          expect(t).toBeLessThanOrEqual(120);
        }
        if (p.context === 'prices') expect(Math.min(...p.tenths)).toBeGreaterThan(0);
        expect(p.baseYear + p.tenths.length).toBeLessThanOrEqual(2024);
        expect(value).toBeGreaterThan(70);
        expect(value).toBeLessThan(170);
        expect(twoDecimals(value)).toBe(true);
        // Adding the rates is always a wrong answer here.
        expect(distractors.map((d) => d.mistakeCode)).toContain('SUM_OF_RATES');
      }),
      RUNS,
    );
  });

  it('reproduces the chain-to-base step of worked example 2 (2018 = 100)', () => {
    const p = { context: 'gdp' as const, baseYear: 2018, tenths: [40, -60, 80, 30, 20, 35] };
    expect(baseIndexFromChainRates.answer(p)).toEqual({
      kind: 'numeric',
      value: 114.81,
      decimals: 2,
      tolerance: 0.02,
      relTolerance: 0,
    });
    const byCode = Object.fromEntries(
      baseIndexFromChainRates.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.SUM_OF_RATES).toBe(114.5);
    expect(byCode.LAST_CHAIN_ONLY).toBe(103.5);
  });
});

describe('annualised-growth-from-levels', () => {
  it('matches growing the level period by period for a year, and inverts back to the ratio', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(annualisedGrowthFromLevels, seed);
        const k = p.context === 'gdpQuarter' ? 4 : 12;
        const step = p.endTenths - p.startTenths;
        // Each period adds the same percentage of the level it starts from.
        let level = p.startTenths;
        for (let i = 0; i < k; i++) level += (level * step) / p.startTenths;
        const yearly = 100 * (level / p.startTenths - 1);
        expect(Math.abs(value - yearly)).toBeLessThanOrEqual(0.005 + 1e-9);
        // The k-th root of the annual factor gives back the one-period ratio.
        const back = bisect((x) => x ** k - (1 + yearly / 100), 0.5, 1.5);
        expect(back).toBeCloseTo(p.endTenths / p.startTenths, 10);
      }),
      RUNS,
    );
  });

  it('compounding beats multiplying the rate by k, and the data stay realistic', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(annualisedGrowthFromLevels, seed);
        const k = p.context === 'gdpQuarter' ? 4 : 12;
        const rate = 100 * (p.endTenths / p.startTenths - 1);
        expect(Math.sign(value)).toBe(Math.sign(rate));
        const simple = distractors.find((d) => d.mistakeCode === 'SIMPLE_ANNUALISING');
        expect(simple).toBeDefined();
        // Bernoulli: (1 + q)^k − 1 ≥ kq, so the simple version is always lower.
        expect(simple?.value ?? 0).toBeLessThan(value);
        expect(Math.abs((simple?.value ?? 0) - k * rate)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(twoDecimals(value)).toBe(true);
        expect(p.startTenths).toBeGreaterThan(0);
        if (p.context === 'gdpQuarter') {
          expect(p.period).toBeGreaterThanOrEqual(1);
          expect(p.period).toBeLessThanOrEqual(4);
          expect(Math.abs(value)).toBeLessThan(11);
        } else {
          expect(p.period).toBeGreaterThanOrEqual(1);
          expect(p.period).toBeLessThanOrEqual(12);
          expect(p.endTenths).toBeGreaterThan(p.startTenths);
          expect(value).toBeLessThan(20);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST107 (Q4 2023 253.8 → Q1 2024 256.1)', () => {
    const p = {
      context: 'gdpQuarter' as const,
      period: 1,
      year: 2024,
      startTenths: 2538,
      endTenths: 2561,
    };
    expect(annualisedGrowthFromLevels.answer(p)).toEqual({
      kind: 'numeric',
      value: 3.67,
      decimals: 2,
      tolerance: 0.01,
      relTolerance: 0,
    });
    expect(annualisedGrowthFromLevels.stem(p)).toContain('Q4 2023');
    const byCode = Object.fromEntries(
      annualisedGrowthFromLevels.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.SIMPLE_ANNUALISING).toBe(3.62);
    expect(byCode.NOT_ANNUALISED).toBe(0.91);
  });
});

describe('average-growth-from-chain-indices', () => {
  it('matches the constant rate found by bisection that reproduces the last base index', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(averageGrowthFromChainIndices, seed);
        const n = p.tenths.length;
        // Build the series of levels from the chain indices.
        let level = 100;
        for (const t of p.tenths) level = (level * t) / 1000;
        const g = bisect((x) => 100 * (1 + x) ** n - level, -0.5, 0.5);
        expect(Math.abs(value - 100 * g)).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('the arithmetic mean of the rates is never below the answer, and the data are realistic', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(averageGrowthFromChainIndices, seed);
        const n = p.tenths.length;
        expect(n).toBeGreaterThanOrEqual(4);
        expect(n).toBeLessThanOrEqual(6);
        for (const t of p.tenths) {
          expect(Number.isInteger(t)).toBe(true);
          expect(t).toBeGreaterThanOrEqual(850);
          expect(t).toBeLessThanOrEqual(1200);
        }
        expect(Math.max(...p.tenths) - Math.min(...p.tenths)).toBeGreaterThanOrEqual(50);
        const am = p.tenths.reduce((s, t) => s + (t - 1000) / 10, 0) / n;
        expect(am).toBeGreaterThan(value);
        const arith = distractors.find((d) => d.mistakeCode === 'ARITHMETIC_MEAN_RATES');
        expect(arith).toBeDefined();
        const index = distractors.find((d) => d.mistakeCode === 'AVERAGE_INDEX');
        if (index) expect(Math.abs(index.value - (100 + value))).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.2);
        expect(Math.abs(value)).toBeLessThan(20);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in ST107 (104.0, 94.0, 108.0, 103.0, 102.0, 103.5)', () => {
    const p = {
      context: 'gdp' as const,
      startYear: 2018,
      tenths: [1040, 940, 1080, 1030, 1020, 1035],
    };
    expect(averageGrowthFromChainIndices.answer(p)).toEqual({
      kind: 'numeric',
      value: 2.33,
      decimals: 2,
      tolerance: 0.01,
      relTolerance: 0,
    });
    const byCode = Object.fromEntries(
      averageGrowthFromChainIndices.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode.ARITHMETIC_MEAN_RATES).toBe(2.42);
    expect(byCode.SIMPLE_AVERAGE).toBe(2.47);
    expect(byCode.AVERAGE_INDEX).toBe(102.33);
  });
});
