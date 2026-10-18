import { describe, expect, it } from 'vitest';
import {
  describeDiscounting,
  discountFactor,
  FUTURE_AMOUNT,
  presentValue,
} from './DiscountingExplorer';

describe('discounting-explorer', () => {
  it('matches worked example 1 in FM03: 1000 in 3 years at 5 % is worth 863.84', () => {
    expect(discountFactor(5, 3)).toBeCloseTo(0.863838, 6);
    expect(presentValue(FUTURE_AMOUNT, 5, 3)).toBeCloseTo(863.84, 2);
  });

  it('grows back into the future amount when compounded forward', () => {
    for (const rate of [0.5, 5, 9.5, 15]) {
      for (const years of [1, 7, 30]) {
        let balance = presentValue(FUTURE_AMOUNT, rate, years);
        for (let y = 0; y < years; y++) balance *= 1 + rate / 100;
        expect(balance).toBeCloseTo(FUTURE_AMOUNT, 8);
      }
    }
  });

  it('shrinks with later dates and higher rates, and is not discounted today or at 0 %', () => {
    expect(presentValue(1000, 5, 4)).toBeLessThan(presentValue(1000, 5, 3));
    expect(presentValue(1000, 6, 3)).toBeLessThan(presentValue(1000, 5, 3));
    expect(presentValue(1000, 5, 0)).toBe(1000);
    expect(presentValue(1000, 0, 20)).toBe(1000);
    expect(presentValue(1000, 5, 14)).toBeCloseTo(505.07, 2);
  });

  it('describes the chosen point in words', () => {
    expect(describeDiscounting(5, 3)).toContain('863.84');
    expect(describeDiscounting(5, 0)).toContain('not discounted');
    expect(describeDiscounting(0, 10)).toContain('0 %');
  });
});
