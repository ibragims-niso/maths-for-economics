import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkProblem, makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { type BasketItem, laspeyres, laspeyresPriceIndex, paasche } from './laspeyres-price-index';
import { realWageChange } from './real-wage-change';
import { realWageDeflated } from './real-wage-deflated';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, steps: pr.steps };
};

const codesOf = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** True when x has at most `d` decimals (allowing for float noise). */
const hasAtMost = (x: number, d: number) => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('real-wage-deflated', () => {
  it('gives a real wage that, re-inflated by the CPI, is the nominal wage again', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(realWageDeflated, seed);
        const cpi = p.cpiTenths / 10;
        // The answer is rounded to 2 decimals, so going back can miss by at most 0.005 × CPI/100.
        expect(Math.abs((value * cpi) / 100 - p.wage)).toBeLessThanOrEqual(
          (0.005 * cpi) / 100 + 1e-9,
        );
        expect(hasAtMost(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('uses sensible numbers: prices rose, so the real wage is positive and below the nominal one', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(realWageDeflated, seed);
        expect(p.cpiTenths).toBeGreaterThan(1000);
        expect(p.cpiTenths).toBeLessThanOrEqual(1800);
        expect(Number.isInteger(p.wage)).toBe(true);
        expect(p.year).toBeGreaterThan(p.baseYear);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.wage);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'FORGOT_100',
          'MULTIPLIED_BY_CPI',
          'PERCENT_OFF_WAGE',
        ]);
        for (const d of distractors) expect(d.value).toBeGreaterThan(0);
        expect(checkProblem(realWageDeflated, seed)).toEqual([]);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1: 1000 manat with a CPI of 120 is 833.33 in base-year prices', () => {
    const p = {
      context: 'average',
      wage: 1000,
      cpiTenths: 1200,
      baseYear: 2020,
      year: 2024,
    } as const;
    expect(realWageDeflated.answer(p)).toMatchObject({ value: 833.33 });
    expect(codesOf(realWageDeflated.distractors(p))).toEqual({
      MULTIPLIED_BY_CPI: 1200,
      PERCENT_OFF_WAGE: 800,
      FORGOT_100: 8.33,
    });
  });
});

describe('laspeyres-price-index', () => {
  it('equals the base-expenditure-weighted average of the price relatives', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(laspeyresPriceIndex, seed);
        const total = p.items.reduce((s, it) => s + it.p0 * it.q0, 0);
        const weighted = p.items.reduce(
          (s, it) => s + ((it.p0 * it.q0) / total) * (it.p1 / it.p0) * 100,
          0,
        );
        expect(Math.abs(value - weighted)).toBeLessThanOrEqual(0.005 + 1e-9);
        // A weighted average lies between the smallest and the largest price relative.
        const rel = p.items.map((it) => (it.p1 / it.p0) * 100);
        expect(value).toBeGreaterThanOrEqual(Math.min(...rel) - 0.005);
        expect(value).toBeLessThanOrEqual(Math.max(...rel) + 0.005);
      }),
      RUNS,
    );
  });

  it('builds the Paasche and value-index distractors by their own definitions', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, distractors } = solve(laspeyresPriceIndex, seed);
        let a = 0;
        let b = 0;
        let v0 = 0;
        for (const it of p.items) {
          a += it.p1 * it.q1;
          b += it.p0 * it.q1;
          v0 += it.p0 * it.q0;
        }
        const codes = codesOf(distractors);
        expect(Math.abs((codes.PAASCHE_WEIGHTS ?? 0) - (a / b) * 100)).toBeLessThan(0.006);
        expect(Math.abs((codes.VALUE_INDEX ?? 0) - (a / v0) * 100)).toBeLessThan(0.006);
        expect(Object.keys(codes).sort()).toEqual([
          'PAASCHE_WEIGHTS',
          'SUM_OF_PRICES',
          'UNWEIGHTED_RELATIVES',
          'VALUE_INDEX',
        ]);
      }),
      RUNS,
    );
  });

  it('draws whole-qəpik prices, positive quantities and 2–3 different goods', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(laspeyresPriceIndex, seed);
        expect(p.items.length).toBeGreaterThanOrEqual(2);
        expect(p.items.length).toBeLessThanOrEqual(3);
        expect(new Set(p.items.map((it) => it.good)).size).toBe(p.items.length);
        for (const it of p.items) {
          for (const x of [it.p0, it.p1, it.q0, it.q1]) {
            expect(Number.isInteger(x)).toBe(true);
            expect(x).toBeGreaterThan(0);
          }
          expect(it.p1 / it.p0).toBeGreaterThanOrEqual(0.9 - 1e-12);
          expect(it.p1 / it.p0).toBeLessThanOrEqual(1.6 + 1e-12);
        }
        expect(p.items.some((it) => it.p1 !== it.p0)).toBe(true);
        expect(hasAtMost(value, 2)).toBe(true);
        expect(checkProblem(laspeyresPriceIndex, seed)).toEqual([]);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2: bread and fuel give L = 122, P = 120 and a value index of 108', () => {
    const items: BasketItem[] = [
      { good: 'bread', p0: 100, p1: 110, q0: 90, q1: 90 },
      { good: 'fuel', p0: 150, p1: 210, q0: 40, q1: 30 },
    ];
    expect(laspeyres(items)).toBeCloseTo(122, 10);
    expect(paasche(items)).toBeCloseTo(120, 10);
    expect(Math.sqrt(laspeyres(items) * paasche(items))).toBeCloseTo(121, 2);
    const codes = codesOf(laspeyresPriceIndex.distractors({ items, baseYear: 2023 }));
    expect(codes).toEqual({
      PAASCHE_WEIGHTS: 120,
      UNWEIGHTED_RELATIVES: 125,
      VALUE_INDEX: 108,
      SUM_OF_PRICES: 128,
    });
  });
});

describe('real-wage-change', () => {
  it('agrees with deflating each wage to base-year prices and comparing them', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(realWageChange, seed);
        const real1 = (p.w1 / p.c1) * 100;
        const real2 = (p.w2 / p.c2) * 100;
        expect(Math.abs(value - (real2 / real1 - 1) * 100)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Sign check in whole numbers: the real wage rose exactly when w2·c1 > w1·c2.
        const cross = p.w2 * p.c1 - p.w1 * p.c2;
        if (cross > 0) expect(value).toBeGreaterThanOrEqual(0);
        if (cross < 0) expect(value).toBeLessThanOrEqual(0);
        expect(hasAtMost(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('has the three classic shortcuts as distractors and sensible numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(realWageChange, seed);
        expect(p.c1).not.toBe(100);
        expect(p.c2).toBeGreaterThan(p.c1);
        expect(p.w2).toBeGreaterThan(p.w1);
        expect(Number.isInteger(p.w2)).toBe(true);
        expect(p.year2).toBeGreaterThan(p.year1);
        expect(p.year1).toBeGreaterThan(p.baseYear);
        const codes = codesOf(distractors);
        expect(Object.keys(codes).sort()).toEqual([
          'CPI_POINTS',
          'NOMINAL_ONLY',
          'SUBTRACTED_INFLATION',
        ]);
        // Nominal growth always overstates the real change, because prices rose.
        expect(codes.NOMINAL_ONLY ?? 0).toBeGreaterThan(value);
        expect(checkProblem(realWageChange, seed)).toEqual([]);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3: 1200 → 1800 manat while the CPI goes 140 → 182', () => {
    const p = {
      context: 'average',
      w1: 1200,
      w2: 1800,
      c1: 140,
      c2: 182,
      baseYear: 2015,
      year1: 2020,
      year2: 2024,
    } as const;
    expect(realWageChange.answer(p)).toMatchObject({ value: 15.38 });
    expect(codesOf(realWageChange.distractors(p))).toEqual({
      SUBTRACTED_INFLATION: 20,
      CPI_POINTS: 8,
      NOMINAL_ONLY: 50,
    });
  });
});
