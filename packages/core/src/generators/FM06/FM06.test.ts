import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { largeIrrPercent, mutuallyExclusiveBestNpv } from './mutually-exclusive-best-npv';
import { projectNpvYearlyFlows } from './project-npv-yearly-flows';
import { twoPeriodIrr } from './two-period-irr';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, decimals: pr.answer.decimals, pr };
};

/** True when x has at most `d` decimal places. */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/**
 * What is left in a bank account that lends the outlay at rate r, receives every cash flow on its
 * date and pays interest each year, after the last cash flow: the NPV grown to that date.
 */
function endBalance(cost: number, flows: number[], ratePercent: number): number {
  let balance = -cost;
  for (const cf of flows) balance = balance * (1 + ratePercent / 100) + cf;
  return balance;
}

describe('project-npv-yearly-flows', () => {
  it('equals the final bank balance of the project, discounted back to today', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, decimals } = solve(projectNpvYearlyFlows, seed);
        const n = p.flows.length;
        const exact = endBalance(p.cost, p.flows, p.rate) / (1 + p.rate / 100) ** n;
        // Each discounted cash flow is rounded to the cent, so allow half a cent per flow.
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 * (n + 1) + 1e-9);
        expect(Math.sign(value)).toBe(Math.sign(exact));
        expect(Math.abs(value)).toBeGreaterThanOrEqual(50);
        expect(decimals).toBe(2);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('has a positive cost, two to four positive whole-hundred cash flows and a sensible rate', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, pr } = solve(projectNpvYearlyFlows, seed);
        expect(p.cost).toBeGreaterThan(0);
        expect(p.flows.length).toBeGreaterThanOrEqual(2);
        expect(p.flows.length).toBeLessThanOrEqual(4);
        for (const cf of p.flows) {
          expect(cf).toBeGreaterThan(0);
          expect(cf % 100).toBe(0);
        }
        expect(p.rate).toBeGreaterThanOrEqual(2);
        expect(p.rate).toBeLessThanOrEqual(12);
        expect(pr.distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'FORGOT_OUTLAY',
          'NO_DISCOUNTING',
          'TIMING_OFF_BY_ONE',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in FM06 (10000; 4000, 5000, 3000 at 8 %)', () => {
    const p = { cost: 10000, flows: [4000, 5000, 3000], rate: 8, context: 'machine' as const };
    const answer = projectNpvYearlyFlows.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(371.89);
    const codes = Object.fromEntries(
      projectNpvYearlyFlows.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes.NO_DISCOUNTING).toBe(2000);
    expect(codes.FORGOT_OUTLAY).toBe(10371.89);
  });
});

describe('two-period-irr', () => {
  it('makes the NPV zero, positive just below the IRR and negative just above it', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(twoPeriodIrr, seed);
        const npvAt = (percent: number) => {
          const x = 1 + percent / 100;
          return -p.cost + p.flow1 / x + p.flow2 / x ** 2;
        };
        expect(Math.abs(npvAt(value))).toBeLessThan(1e-6 * p.cost);
        expect(npvAt(value - 0.5)).toBeGreaterThan(0);
        expect(npvAt(value + 0.5)).toBeLessThan(0);
        // The rate is the whole number the project was built from, and the flows are whole numbers.
        expect(value).toBe(p.irr);
        expect(Number.isInteger(p.flow1) && Number.isInteger(p.flow2)).toBe(true);
        expect(p.flow1).toBeGreaterThan(0);
        expect(p.flow2).toBeGreaterThan(0);
        expect(p.flow1 + p.flow2).toBeGreaterThan(p.cost);
      }),
      RUNS,
    );
  });

  it('agrees with a search over rates from 0 % to 40 % in steps of 0.01 %', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(twoPeriodIrr, seed);
        let best = 0;
        let bestGap = Number.POSITIVE_INFINITY;
        for (let k = 0; k <= 4000; k++) {
          const x = 1 + k / 10000;
          const gap = Math.abs(-p.cost * x * x + p.flow1 * x + p.flow2);
          if (gap < bestGap) {
            bestGap = gap;
            best = k / 100;
          }
        }
        expect(value).toBeCloseTo(best, 9);
      }),
      { numRuns: 200 },
    );
  });

  it('reproduces worked example 2 in FM06 (10000; 5000, 6600 gives 10 %)', () => {
    const p = { irr: 10, cost: 10000, flow1: 5000, flow2: 6600, context: 'software' as const };
    const answer = twoPeriodIrr.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(10);
    const codes = Object.fromEntries(
      twoPeriodIrr.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes.NEGATIVE_ROOT).toBe(-160);
    expect(codes.TOTAL_RETURN).toBe(16);
    expect(codes.SIMPLE_AVERAGE_RETURN).toBe(8);
  });
});

describe('mutually-exclusive-best-npv', () => {
  it('answers the larger NPV, computed from a year-by-year bank balance, while the other project has the higher IRR', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(mutuallyExclusiveBestNpv, seed);
        const r = 1 + p.rate / 100;
        const largeFlows = Array.from({ length: p.years }, () => p.largeFlow);
        const smallFlow = (p.smallCost * (100 + p.smallIrr)) / 100;
        const largeNpv = endBalance(p.largeCost, largeFlows, p.rate) / r ** p.years;
        const smallNpv = endBalance(p.smallCost, [smallFlow], p.rate) / r;
        expect(Math.abs(value - largeNpv)).toBeLessThanOrEqual(0.005 * (p.years + 1) + 1e-9);
        expect(value).toBeCloseTo(Math.max(largeNpv, smallNpv), 1);
        expect(smallNpv).toBeGreaterThan(0);
        // The small project's IRR really is its stated whole number: its NPV there is zero.
        expect(smallFlow / (1 + p.smallIrr / 100) - p.smallCost).toBeCloseTo(0, 6);
        // The large project's IRR, found by stepping the rate up 0.01 % at a time, is lower.
        let k = 0;
        while (endBalance(p.largeCost, largeFlows, k / 100) > 0 && k < 10000) k++;
        expect(Math.abs(k / 100 - largeIrrPercent(p))).toBeLessThanOrEqual(0.011);
        expect(k / 100).toBeLessThan(p.smallIrr - 1.9);
        expect(k / 100).toBeGreaterThan(p.rate + 0.9);
        expect(Number.isInteger(smallFlow)).toBe(true);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in FM06 (10000 → 12500 against 30000 → 4 × 10000 at 8 %)', () => {
    const p = {
      smallCost: 10000,
      smallIrr: 25,
      largeCost: 30000,
      largeFlow: 10000,
      years: 4,
      rate: 8,
      largeFirst: false,
    };
    const answer = mutuallyExclusiveBestNpv.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(3121.27);
    expect(largeIrrPercent(p)).toBeCloseTo(12.59, 2);
    const codes = Object.fromEntries(
      mutuallyExclusiveBestNpv.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes.IRR_RANKING).toBe(1574.07);
  });
});
