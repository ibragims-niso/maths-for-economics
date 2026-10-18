import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { fiscalMultiplierTaxImports } from './fiscal-multiplier-tax-imports';
import { keynesianEquilibriumIncome } from './keynesian-equilibrium-income';
import { moneyMultiplierCurrency } from './money-multiplier-currency';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

/** Adds up rounds first, first·ratio, first·ratio², … until they are negligible. */
const sumRounds = (first: number, ratio: number) => {
  let total = 0;
  let round = first;
  for (let i = 0; i < 10000 && Math.abs(round) > 1e-12; i++) {
    total += round;
    round *= ratio;
  }
  return total;
};

describe('keynesian-equilibrium-income', () => {
  it('matches income found by repeating "income = planned spending" until it settles', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(keynesianEquilibriumIncome, seed);
        let y = 0;
        for (let i = 0; i < 2000; i++) y = p.a + p.b * y + p.investment + p.government;
        expect(Math.abs(value - y)).toBeLessThan(1e-6);
        // Substituting the answer back: output equals planned spending.
        expect(p.a + p.b * value + p.investment + p.government).toBeCloseTo(value, 9);
      }),
      RUNS,
    );
  });

  it('gives a whole, positive income from sensible parameters', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(keynesianEquilibriumIncome, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(p.b).toBeGreaterThan(0.5);
        expect(p.b).toBeLessThan(1);
        for (const x of [p.a, p.investment, p.government]) {
          expect(x).toBeGreaterThan(0);
          expect(x % 10).toBe(0);
        }
        // Income exceeds autonomous spending: the multiplier is above 1.
        expect(value).toBeGreaterThan(p.a + p.investment + p.government);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in F11 (C = 50 + 0.8Y, I = 150, G = 200)', () => {
    const p = { a: 50, b: 0.8, investment: 150, government: 200 };
    expect(keynesianEquilibriumIncome.answer(p)).toEqual({
      kind: 'numeric',
      value: 2000,
      decimals: 0,
    });
    const results = keynesianEquilibriumIncome.steps(p).map((s) => s.result);
    expect(results).toEqual([undefined, 400, 2000, undefined]);
    const codes = keynesianEquilibriumIncome.distractors(p);
    expect(codes).toEqual([
      { value: 500, mistakeCode: 'DIVIDED_BY_MPC' },
      { value: 1750, mistakeCode: 'FORGOT_AUTONOMOUS' },
      { value: 400, mistakeCode: 'NO_MULTIPLIER' },
    ]);
  });
});

describe('fiscal-multiplier-tax-imports', () => {
  it('matches the sum of the spending rounds', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(fiscalMultiplierTaxImports, seed);
        // Each round of new income: b(1 − t) of it is spent, minus the m that goes on imports.
        const total = sumRounds(p.change, p.b * (1 - p.t) - p.m);
        expect(Math.abs(value - total)).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('extra leakages (saving + tax + imports) equal the extra government spending', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(fiscalMultiplierTaxImports, seed);
        const tax = p.t * value;
        const disposable = value - tax;
        const saving = (1 - p.b) * disposable;
        const imports = p.m * value;
        expect(saving + tax + imports).toBeCloseTo(p.change, 9);
      }),
      RUNS,
    );
  });

  it('gives a whole rise larger than ΔG, with sensible rates', () => {
    let open = 0;
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(fiscalMultiplierTaxImports, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(Number.isInteger(p.change)).toBe(true);
        expect(p.change).toBeGreaterThanOrEqual(10);
        expect(p.change).toBeLessThanOrEqual(300);
        expect(value).toBeGreaterThan(p.change);
        expect(p.t).toBeGreaterThan(0);
        expect(p.t).toBeLessThan(0.5);
        expect(p.m).toBeGreaterThanOrEqual(0);
        expect(p.b * (1 - p.t)).toBeGreaterThan(p.m);
        if (p.m > 0) open++;
      }),
      RUNS,
    );
    // Both the closed and the open economy appear.
    expect(open).toBeGreaterThan(200);
    expect(open).toBeLessThan(800);
  });

  it('reproduces Example 2 in F11 (b = 0.8, t = 0.25, M = 0.1Y, ΔG = 50)', () => {
    const p = { b: 0.8, t: 0.25, m: 0.1, change: 50 };
    expect(fiscalMultiplierTaxImports.answer(p)).toEqual({
      kind: 'numeric',
      value: 100,
      decimals: 0,
    });
    expect(fiscalMultiplierTaxImports.steps(p).map((s) => s.result)).toEqual([0.5, 2, 100]);
    expect(fiscalMultiplierTaxImports.distractors(p)).toEqual([
      { value: 250, mistakeCode: 'SIMPLE_MULTIPLIER' },
      { value: 55.56, mistakeCode: 'TAX_NOT_COMPLEMENT' },
      { value: 125, mistakeCode: 'IGNORED_IMPORTS' },
      { value: 50, mistakeCode: 'NO_MULTIPLIER' },
    ]);
  });
});

describe('money-multiplier-currency', () => {
  it('matches a round-by-round simulation of deposits, cash and lending', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(moneyMultiplierCurrency, seed);
        // Each injection is held as money: deposits D and cash cD. Banks lend (1 − rr)D again.
        let money = 0;
        let injection = p.change;
        for (let i = 0; i < 10000 && injection > 1e-12; i++) {
          const deposits = injection / (1 + p.c);
          money += injection;
          injection = (1 - p.rr) * deposits;
        }
        expect(Math.abs(value - money)).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('balance sheets add up: new cash + new reserves equal the new base', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(moneyMultiplierCurrency, seed);
        const deposits = value / (1 + p.c);
        expect(p.c * deposits + p.rr * deposits).toBeCloseTo(p.change, 9);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(p.change);
        expect(value).toBeLessThan(p.change / p.rr);
        expect(p.change).toBeGreaterThanOrEqual(10);
        expect(p.change).toBeLessThanOrEqual(300);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in F11 (rr = 0.1, c = 0.2, ΔB = 30)', () => {
    const p = { rr: 0.1, c: 0.2, change: 30 };
    expect(moneyMultiplierCurrency.answer(p)).toEqual({ kind: 'numeric', value: 120, decimals: 0 });
    expect(moneyMultiplierCurrency.steps(p).map((s) => s.result)).toEqual([0.3, 100, 120]);
    expect(moneyMultiplierCurrency.distractors(p)).toEqual([
      { value: 300, mistakeCode: 'IGNORED_CURRENCY' },
      { value: 100, mistakeCode: 'DEPOSITS_ONLY' },
      { value: 30, mistakeCode: 'BASE_ONLY' },
    ]);
  });
});
