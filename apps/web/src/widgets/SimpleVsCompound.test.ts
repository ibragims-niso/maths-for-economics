import { describe, expect, it } from 'vitest';
import { amountAxis, compoundAmount, FREQUENCIES, simpleAmount } from './SimpleVsCompound';

describe('SimpleVsCompound', () => {
  it('reproduces FM01 Example 1: 2000 at 6 % simple interest for 4 years is 2480', () => {
    expect(simpleAmount(2000, 0.06, 4)).toBeCloseTo(2480, 9);
  });

  it('reproduces FM01 Example 2: 5000 at 4 % compounded quarterly for 3 years is 5634.13', () => {
    const a = compoundAmount(5000, 0.04, 4, 3);
    expect(Math.abs(a - 5634.13)).toBeLessThan(0.01);
    expect(simpleAmount(5000, 0.04, 3)).toBeCloseTo(5600, 9);
    expect(a - simpleAmount(5000, 0.04, 3)).toBeCloseTo(34.13, 2);
  });

  it('reproduces FM01 Example 3: at 8 % compounded yearly money doubles in about 9.01 years', () => {
    const t = Math.log(2) / Math.log(1.08);
    expect(compoundAmount(1, 0.08, 1, t)).toBeCloseTo(2, 9);
  });

  it('compounds period by period, and never falls below simple interest after a year', () => {
    for (const { m } of FREQUENCIES) {
      for (const rate of [0.01, 0.045, 0.12]) {
        let balance = 5000;
        for (let k = 0; k < m * 2; k++) balance += balance * (rate / m);
        expect(compoundAmount(5000, rate, m, 2)).toBeCloseTo(balance, 6);
        for (let t = 1; t <= 30; t++) {
          expect(compoundAmount(5000, rate, m, t)).toBeGreaterThanOrEqual(
            simpleAmount(5000, rate, t) - 1e-9,
          );
        }
      }
    }
  });

  it('chooses an axis that holds the 30-year amount, with 1 to 4 labelled ticks below the top', () => {
    for (let rate = 1; rate <= 12; rate += 0.5) {
      for (const { m } of FREQUENCIES) {
        const largest = compoundAmount(5000, rate / 100, m, 30);
        const { top, ticks } = amountAxis(largest);
        expect(top).toBeGreaterThan(largest / 1000);
        expect(ticks.length).toBeGreaterThanOrEqual(1);
        expect(ticks.length).toBeLessThanOrEqual(4);
        expect(Math.max(...ticks)).toBeLessThan(top);
      }
    }
  });
});
