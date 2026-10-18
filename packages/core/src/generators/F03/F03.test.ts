import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { costFunctionChange } from './cost-function-change';
import { demandDomainMaxPrice } from './demand-domain-max-price';
import { incomeTaxBands } from './income-tax-bands';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

describe('cost-function-change', () => {
  it('equals the sum of the extra costs of each unit from Q₁ to Q₂', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(costFunctionChange, seed);
        const C = (q: number) => p.fixedCost + p.unitCost * q + p.b * q ** 2;
        let total = 0;
        for (let q = p.q1; q < p.q2; q++) total += C(q + 1) - C(q);
        expect(Math.abs(value - total)).toBeLessThan(1e-6);
        // Difference of squares: ΔC = a·ΔQ + b·(Q₂ − Q₁)(Q₂ + Q₁).
        const dq = p.q2 - p.q1;
        expect(value).toBeCloseTo(p.unitCost * dq + p.b * dq * (p.q2 + p.q1), 9);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(p.q2).toBeGreaterThan(p.q1);
        expect(p.q1).toBeGreaterThan(0);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (C(Q) = 500 + 12Q + 2Q², from 20 to 30)', () => {
    const p = { fixedCost: 500, unitCost: 12, b: 2, q1: 20, q2: 30 };
    expect(costFunctionChange.answer(p)).toMatchObject({ kind: 'numeric', value: 1120 });
    const codes = Object.fromEntries(
      costFunctionChange.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({
      LEVEL_NOT_CHANGE: 2660,
      EVALUATED_AT_CHANGE: 820,
      POWER_AS_MULTIPLE: 160,
    });
  });
});

describe('demand-domain-max-price', () => {
  it('is the largest price with Q ≥ 0, found by scanning upwards from zero', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(demandDomainMaxPrice, seed);
        const Q = (price: number) =>
          p.form === 'square' ? p.a - p.b * price ** 2 : p.a - p.b * Math.sqrt(price);
        // Scan whole prices until demand turns negative.
        let last = 0;
        while (Q(last + 1) >= 0) last++;
        expect(value).toBe(last);
        expect(Q(value)).toBeCloseTo(0, 9);
        expect(Q(value + 0.01)).toBeLessThan(0);
        expect(Q(0)).toBeGreaterThan(0);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(Number.isInteger(p.a)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (Q = 1800 − 2P²)', () => {
    const p = { form: 'square' as const, a: 1800, b: 2, maxPrice: 30 };
    expect(demandDomainMaxPrice.answer(p)).toMatchObject({ kind: 'numeric', value: 30 });
  });
});

describe('income-tax-bands', () => {
  it('matches taxing the income slice by slice at the rate of each slice’s band', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(incomeTaxBands, seed);
        const rateFor = (y: number) => (y < p.allowance ? 0 : y < p.upper ? p.rate1 : p.rate2);
        let total = 0;
        for (let y = 0; y < p.income; y += 500) total += (rateFor(y) * 500) / 100;
        expect(value).toBeCloseTo(total, 9);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(p.income).toBeGreaterThan(p.allowance);
        expect(p.rate2).toBeGreaterThan(p.rate1);
        // The average rate is always below the top marginal rate.
        expect(value / p.income).toBeLessThan(p.rate2 / 100);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (income 52,000; bands 10,000 and 40,000; 20 % and 40 %)', () => {
    const p = { allowance: 10000, upper: 40000, rate1: 20, rate2: 40, income: 52000 };
    expect(incomeTaxBands.answer(p)).toMatchObject({ kind: 'numeric', value: 10800 });
    const codes = Object.fromEntries(
      incomeTaxBands.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({
      WRONG_BAND: 8400,
      TOP_RATE_ON_ALL: 20800,
      IGNORED_ALLOWANCE: 12800,
      TOP_BAND_ONLY: 4800,
    });
  });
});
