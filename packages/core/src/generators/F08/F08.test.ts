import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { arithmeticSalaryTotal } from './arithmetic-salary-total';
import { salaryOffersDifference } from './salary-offers-difference';
import { spendingRoundsTotal } from './spending-rounds-total';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most `decimals` decimal places (up to floating-point noise). */
const hasDecimals = (x: number, decimals: number) =>
  Math.abs(x * 10 ** decimals - Math.round(x * 10 ** decimals)) < 1e-6;

// Each answer is re-derived by simulating the payments year by year (or round by round),
// not by the closed-form sum formulas the generators use.
describe('arithmetic-salary-total', () => {
  it('equals the salaries added up one year at a time', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(arithmeticSalaryTotal, seed);
        let salary = p.start;
        let sum = 0;
        for (let year = 1; year <= p.years; year++) {
          sum += salary;
          salary += p.raise;
        }
        expect(value).toBe(sum);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(p.start).toBeGreaterThan(0);
        expect(p.raise).toBeGreaterThan(0);
        expect(p.years).toBeGreaterThanOrEqual(4);
        expect(p.years).toBeLessThanOrEqual(15);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in F08 (24,000 rising by 1,200, over 8 years)', () => {
    const p = { start: 24000, raise: 1200, years: 8 };
    const answer = arithmeticSalaryTotal.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(225600);
    expect(arithmeticSalaryTotal.steps(p)[1]?.result).toBe(32400);
  });
});

describe('spending-rounds-total', () => {
  it('equals the rounds of spending simulated one by one, below the long-run total', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(spendingRoundsTotal, seed);
        let round = p.injection;
        let sum = 0;
        for (let k = 1; k <= p.rounds; k++) {
          sum += round;
          round *= p.share;
        }
        expect(Math.abs(value - sum)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(p.share).toBeGreaterThan(0);
        expect(p.share).toBeLessThan(1);
        expect(value).toBeGreaterThan(p.injection);
        // The long-run total a/(1 − r) is visibly larger than the n-round total.
        expect(p.injection / (1 - p.share) - value).toBeGreaterThan(0.5);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in F08 (100 million, 75 % re-spent, 5 rounds)', () => {
    const p = { injection: 100, share: 0.75, rounds: 5 };
    const answer = spendingRoundsTotal.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(305.08);
    const infinite = spendingRoundsTotal
      .distractors(p)
      .find((d) => d.mistakeCode === 'INFINITE_SUM');
    expect(infinite?.value).toBe(400);
  });
});

describe('salary-offers-difference', () => {
  it('equals the gap between the two offers paid out year by year', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(salaryOffersDifference, seed);
        let a = p.startA;
        let b = p.startB;
        let sumA = 0;
        let sumB = 0;
        for (let year = 1; year <= p.years; year++) {
          sumA += a;
          sumB += b;
          a += p.raiseA;
          b *= 1 + p.growthB / 100;
        }
        expect(Math.abs(value - Math.abs(sumB - sumA))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(value).toBeGreaterThanOrEqual(500);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(p.startB).toBeLessThanOrEqual(p.startA);
        expect(p.startB).toBeGreaterThan(0);
        expect(p.growthB).toBeGreaterThanOrEqual(2);
        expect(p.growthB).toBeLessThanOrEqual(8);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in F08 (30,000 + 1,500 a year against 28,000 + 6 %, 10 years)', () => {
    const p = { startA: 30000, raiseA: 1500, startB: 28000, growthB: 6, years: 10 };
    const answer = salaryOffersDifference.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(1562.26);
    const steps = salaryOffersDifference.steps(p);
    expect(steps[0]?.result).toBe(367500);
    expect(steps[2]?.result).toBe(369062.26);
  });
});
