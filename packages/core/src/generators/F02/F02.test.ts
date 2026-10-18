import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { breakEvenMaxFixedCost } from './break-even-max-fixed-cost';
import { budgetMaxWholeUnits } from './budget-max-whole-units';
import { quadraticBreakEven } from './quadratic-break-even';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, steps: pr.steps };
};

describe('budget-max-whole-units', () => {
  it('matches a brute-force count of affordable units', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(budgetMaxWholeUnits, seed);
        const spentY = p.priceY * p.unitsY;
        let x = 0;
        while (spentY + p.priceX * (x + 1) <= p.budget) x++;
        expect(value).toBe(x);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        // The limit is never a whole number, so rounding the wrong way is always a mistake.
        expect(spentY + p.priceX * value).toBeLessThan(p.budget);
        expect(spentY + p.priceX * (value + 1)).toBeGreaterThan(p.budget);
        expect(p.priceX).toBeGreaterThan(0);
        expect(p.priceY).toBeGreaterThan(0);
        expect(spentY).toBeLessThan(p.budget);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in F02 (budget 120, 4 tickets at 9, books at 11)', () => {
    const p = { budget: 120, priceX: 11, priceY: 9, unitsY: 4, best: 7 };
    const answer = budgetMaxWholeUnits.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(7);
    expect(budgetMaxWholeUnits.steps(p)[2]?.result).toBe(7.64);
  });
});

describe('quadratic-break-even', () => {
  it('profit is zero at the answer, which is the asked one of the two sign changes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(quadraticBreakEven, seed);
        const profit = (q: number) => -p.a * q * q + p.b * q - p.c;
        expect(profit(value)).toBe(0);
        // Scan whole outputs for zeros of profit: there must be exactly two.
        const zeros: number[] = [];
        for (let q = 0; q <= p.b / p.a; q++) if (profit(q) === 0) zeros.push(q);
        expect(zeros).toHaveLength(2);
        expect(value).toBe(p.ask === 'smaller' ? zeros[0] : zeros[1]);
        // A loss outside the break-even points, a profit between them.
        const [lo = 0, hi = 0] = zeros;
        expect(profit(lo - 1)).toBeLessThan(0);
        expect(profit(hi + 1)).toBeLessThan(0);
        expect(profit((lo + hi) / 2)).toBeGreaterThan(0);
        expect(lo).toBeGreaterThan(0);
        expect(p.c).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in F02 (π = −2Q² + 140Q − 2000)', () => {
    const base = { a: 2, b: 140, c: 2000, low: 20, high: 50 };
    const smaller = quadraticBreakEven.answer({ ...base, ask: 'smaller' });
    const larger = quadraticBreakEven.answer({ ...base, ask: 'larger' });
    expect(smaller.kind === 'numeric' && smaller.value).toBe(20);
    expect(larger.kind === 'numeric' && larger.value).toBe(50);
    expect(quadraticBreakEven.steps({ ...base, ask: 'smaller' })[1]?.result).toBe(3600);
  });
});

describe('break-even-max-fixed-cost', () => {
  it('at the answer profit just touches zero; above it there is a loss at every output', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(breakEvenMaxFixedCost, seed);
        // The highest profit before fixed costs, found numerically by ternary search (no formula).
        const operating = (q: number) => -p.a * q * q + p.b * q;
        let lo = 0;
        let hi = p.b / p.a;
        for (let i = 0; i < 200; i++) {
          const m1 = lo + (hi - lo) / 3;
          const m2 = hi - (hi - lo) / 3;
          if (operating(m1) < operating(m2)) lo = m1;
          else hi = m2;
        }
        const best = operating((lo + hi) / 2);
        // Any F up to `best` leaves some output with π ≥ 0; any larger F gives a loss everywhere.
        expect(Math.abs(value - best)).toBeLessThan(1e-6);
        expect(best - (value - 0.01)).toBeGreaterThan(0);
        expect(best - (value + 0.01)).toBeLessThan(0);
        expect(Math.round(value * 100)).toBeCloseTo(value * 100, 6);
        expect(value).toBeGreaterThan(0);
        expect(p.b / (2 * p.a)).toBeGreaterThanOrEqual(5);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in F02 (−2Q² + 140Q − F)', () => {
    const answer = breakEvenMaxFixedCost.answer({ a: 2, b: 140 });
    expect(answer.kind === 'numeric' && answer.value).toBe(2450);
  });
});
