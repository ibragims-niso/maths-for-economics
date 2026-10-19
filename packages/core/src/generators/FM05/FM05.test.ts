import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { withinTolerance } from '../../engine/grading';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { leasePaymentResidual } from './lease-payment-residual';
import { loanLevelPayment } from './loan-level-payment';
import { loanScheduleRow } from './loan-schedule-row';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
const MONEY = [0.05, 0.00005] as const;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, steps: pr.steps };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** Balance after n payments of `pay`, simulated period by period: B ← B(1 + r) − pay. */
const simulate = (loan: number, r: number, n: number, pay: number) => {
  let balance = loan;
  for (let t = 0; t < n; t++) balance = balance * (1 + r) - pay;
  return balance;
};

/** The payment that clears the loan, found by bisection on the simulated schedule (no formula). */
const paymentByBisection = (loan: number, r: number, n: number) => {
  let lo = loan / n;
  let hi = loan * (1 + r);
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (simulate(loan, r, n, mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

describe('loan-level-payment', () => {
  it('the payments clear the loan when simulated month by month', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(loanLevelPayment, seed);
        const r = p.rate / 100 / p.m;
        const n = p.m * p.years;
        // Rounding the payment to the cent leaves at most half a cent per payment, grown with interest.
        const slack = (0.005 * ((1 + r) ** n - 1)) / r + 1e-6;
        expect(Math.abs(simulate(p.loan, r, n, value))).toBeLessThanOrEqual(slack);
        expect(Math.abs(value - paymentByBisection(p.loan, r, n))).toBeLessThanOrEqual(
          0.005 + 1e-6,
        );
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: more than loan/n, less than the loan, readable rates', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(loanLevelPayment, seed);
        const r = p.rate / 100 / p.m;
        const n = p.m * p.years;
        expect(p.loan).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(p.loan / n);
        expect(value).toBeLessThan(p.loan);
        // Interest alone is r × L, so the payment must exceed it for the loan to shrink.
        expect(value).toBeGreaterThan(r * p.loan);
        expect(Math.abs(r * 1e4 - Math.round(r * 1e4))).toBeLessThan(1e-6);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        const codes = distractors.map((d) => d.mistakeCode);
        expect(codes).toContain('IGNORED_INTEREST');
        if (p.m === 1) expect(codes).not.toContain('ANNUAL_RATE_MONTHLY');
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in FM05 (18000 over 5 years at 6 %, monthly)', () => {
    const p = { context: 'car', loan: 18000, rate: 6, m: 12, years: 5 } as const;
    expect(loanLevelPayment.answer(p)).toMatchObject({ kind: 'numeric', value: 347.99 });
  });
});

describe('loan-schedule-row', () => {
  /** Interest, principal and balances of row k from a schedule built row by row. */
  const row = (loan: number, r: number, n: number, k: number) => {
    const pay = paymentByBisection(loan, r, n);
    let opening = loan;
    for (let t = 1; t < k; t++) opening -= pay - r * opening;
    const interest = r * opening;
    const principal = pay - interest;
    return { pay, opening, interest, principal, closing: opening - principal };
  };

  it('agrees with an independent row-by-row schedule, and so do the steps', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, steps } = solve(loanScheduleRow, seed);
        const r = p.rate / 100 / p.m;
        const n = p.m * p.years;
        const s = row(p.loan, r, n, p.k);
        const expected =
          p.ask === 'interest' ? s.interest : p.ask === 'principal' ? s.principal : s.closing;
        expect(Math.abs(value - expected)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
        // Step 2 is the payment, step 3 the balance before (or after) payment k.
        expect(Math.abs((steps[1]?.result ?? 0) - s.pay)).toBeLessThanOrEqual(0.00005 + 1e-9);
        const balance = p.ask === 'balance' ? s.closing : s.opening;
        expect(Math.abs((steps[2]?.result ?? 0) - balance)).toBeLessThanOrEqual(0.005 + 1e-6);
        // Each row splits the payment exactly into interest and principal.
        expect(s.interest + s.principal).toBeCloseTo(s.pay, 9);
      }),
      RUNS,
    );
  });

  it('a student who rounds the payment to the cent and builds the rows still lands within tolerance', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(loanScheduleRow, seed);
        const r = p.rate / 100 / p.m;
        const pay = Math.round(paymentByBisection(p.loan, r, p.m * p.years) * 100) / 100;
        const opening = simulate(p.loan, r, p.k - 1, pay);
        const got =
          p.ask === 'interest'
            ? r * opening
            : p.ask === 'principal'
              ? pay - r * opening
              : simulate(p.loan, r, p.k, pay);
        expect(withinTolerance(got, value, ...MONEY)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: 2 ≤ k ≤ n, positive answer, interest falling and principal rising', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(loanScheduleRow, seed);
        const r = p.rate / 100 / p.m;
        const n = p.m * p.years;
        expect(p.k).toBeGreaterThanOrEqual(2);
        expect(p.k).toBeLessThanOrEqual(p.ask === 'balance' ? n - 1 : n);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.loan);
        const first = row(p.loan, r, n, 1);
        const kth = row(p.loan, r, n, p.k);
        expect(kth.interest).toBeLessThan(first.interest);
        expect(kth.principal).toBeGreaterThan(first.principal);
        // Principal parts grow by the factor (1 + r) from one row to the next.
        expect(kth.principal).toBeCloseTo(first.principal * (1 + r) ** (p.k - 1), 6);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in FM05 (50000 at 8 % over 5 years, yearly)', () => {
    const base = { context: 'business', loan: 50000, rate: 8, m: 1, years: 5, k: 2 } as const;
    expect(loanScheduleRow.answer({ ...base, ask: 'interest' })).toMatchObject({ value: 3318.17 });
    expect(loanScheduleRow.answer({ ...base, ask: 'principal' })).toMatchObject({
      value: 9204.65,
    });
    expect(loanScheduleRow.answer({ ...base, ask: 'balance' })).toMatchObject({ value: 32272.53 });
  });
});

describe('lease-payment-residual', () => {
  it('simulated month by month, the balance falls to the residual value', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(leasePaymentResidual, seed);
        const r = p.rate / 100 / 12;
        const n = 12 * p.years;
        const slack = (0.005 * ((1 + r) ** n - 1)) / r + 1e-6;
        expect(Math.abs(simulate(p.price, r, n, value) - p.residual)).toBeLessThanOrEqual(slack);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('equals the depreciation repaid like a loan plus interest on the residual', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(leasePaymentResidual, seed);
        const r = p.rate / 100 / 12;
        const n = 12 * p.years;
        const expected = paymentByBisection(p.price - p.residual, r, n) + r * p.residual;
        expect(Math.abs(value - expected)).toBeLessThanOrEqual(0.005 + 1e-6);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: residual 20–50 % of the price, payment between the two simple guesses', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(leasePaymentResidual, seed);
        const r = p.rate / 100 / 12;
        const n = 12 * p.years;
        expect(p.residual).toBeGreaterThan(0);
        expect(p.residual / p.price).toBeGreaterThanOrEqual(0.15);
        expect(p.residual / p.price).toBeLessThanOrEqual(0.55);
        expect(p.residual % 500).toBe(0);
        expect(value).toBeGreaterThan((p.price - p.residual) / n);
        expect(value).toBeLessThan(paymentByBisection(p.price, r, n));
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['IGNORED_INTEREST', 'RESIDUAL_IGNORED', 'RESIDUAL_UNDISCOUNTED'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in FM05 (60000 machine, residual 20000, 4 years at 7.2 %)', () => {
    const p = { context: 'machine', price: 60000, residual: 20000, rate: 7.2, years: 4 } as const;
    expect(leasePaymentResidual.answer(p)).toMatchObject({ kind: 'numeric', value: 1081.57 });
  });
});
