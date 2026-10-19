import { describe, expect, it } from 'vitest';
import {
  crossoverYear,
  monthlyPayment,
  tickStep,
  totalInterest,
  yearlySplit,
} from './LoanScheduleBars';

describe('LoanScheduleBars maths', () => {
  it('matches worked example 1 in FM05 (18000 over 5 years at 6 %)', () => {
    expect(monthlyPayment(18000, 0.06, 5)).toBeCloseTo(347.99, 2);
    expect(totalInterest(18000, 0.06, 5)).toBeCloseTo(2879.43, 2);
  });

  it('shows the default mortgage of the Try it text (200000 at 4.8 % over 25 years)', () => {
    expect(monthlyPayment(200000, 0.048, 25)).toBeCloseTo(1145.99, 2);
    expect(totalInterest(200000, 0.048, 25)).toBeCloseTo(143798.18, 2);
    const rows = yearlySplit(200000, 0.048, 25);
    expect(rows).toHaveLength(25);
    expect(crossoverYear(rows)).toBe(12);
    const first = rows[0] ?? { interest: 0, principal: 0 };
    expect(first.interest / (first.interest + first.principal)).toBeCloseTo(0.69, 2);
  });

  it('gives the other values quoted in the Try it text (10 % for 25 years; 4.8 % for 10 years)', () => {
    expect(totalInterest(200000, 0.1, 25)).toBeCloseTo(345220.45, 2);
    expect(crossoverYear(yearlySplit(200000, 0.1, 25))).toBe(19);
    expect(monthlyPayment(200000, 0.048, 10)).toBeCloseTo(2101.81, 2);
    expect(totalInterest(200000, 0.048, 10)).toBeCloseTo(52217.5, 2);
    expect(crossoverYear(yearlySplit(200000, 0.048, 10))).toBe(1);
    // The first month: 800 of interest, so 345.99 repays the loan. Month 128 is the first in which
    // principal is larger, since that needs n − k + 1 < ln 2 / ln(1 + r) = 173.6.
    const r = 0.004;
    const pay = monthlyPayment(200000, 0.048, 25);
    expect(pay - r * 200000).toBeCloseTo(345.99, 2);
    let balance = 200000;
    let month = 0;
    for (let k = 1; k <= 300 && month === 0; k++) {
      const interest = r * balance;
      if (pay - interest > interest) month = k;
      balance -= pay - interest;
    }
    expect(month).toBe(128);
  });

  it('the yearly parts add up to the payments and repay exactly the loan', () => {
    for (const [rate, years] of [
      [0.01, 5],
      [0.048, 25],
      [0.1, 35],
    ] as const) {
      const pay = monthlyPayment(200000, rate, years);
      const rows = yearlySplit(200000, rate, years);
      for (const row of rows) expect(row.interest + row.principal).toBeCloseTo(12 * pay, 6);
      const principal = rows.reduce((s, row) => s + row.principal, 0);
      const interest = rows.reduce((s, row) => s + row.interest, 0);
      expect(principal).toBeCloseTo(200000, 6);
      expect(interest).toBeCloseTo(totalInterest(200000, rate, years), 6);
      // Interest falls and principal rises every year.
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i]?.interest ?? 0).toBeLessThan(rows[i - 1]?.interest ?? 0);
        expect(rows[i]?.principal ?? 0).toBeGreaterThan(rows[i - 1]?.principal ?? 0);
      }
    }
  });

  it('reports year 1 when principal is larger from the start, and picks readable ticks', () => {
    expect(crossoverYear(yearlySplit(200000, 0.01, 35))).toBe(1);
    expect(crossoverYear(yearlySplit(200000, 0.1, 35))).toBe(29);
    expect(tickStep(13.75)).toBe(5);
    expect(tickStep(51)).toBe(20);
    expect(monthlyPayment(12000, 0, 1)).toBe(1000);
  });
});
