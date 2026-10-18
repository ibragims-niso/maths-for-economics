import { describe, expect, it } from 'vitest';
import { doublingTime, grow, ruleOf70 } from './DoublingTime';

describe('DoublingTime', () => {
  it('reproduces F07 Example 1: at 6 % prices double in 11.90 years; the rule says 11.67', () => {
    expect(doublingTime(0.06)).toBeCloseTo(11.9, 2);
    expect(ruleOf70(0.06)).toBeCloseTo(11.67, 2);
    expect((doublingTime(0.06) - ruleOf70(0.06)) / doublingTime(0.06)).toBeCloseTo(0.02, 2);
  });

  it('the value really has doubled at the doubling time', () => {
    for (let percent = 2; percent <= 25; percent += 0.5) {
      const g = percent / 100;
      expect(grow(100, g, doublingTime(g))).toBeCloseTo(200, 9);
      // a year earlier it was still below 200
      expect(grow(100, g, doublingTime(g) - 1)).toBeLessThan(200);
    }
  });

  it('the rule of 70 is close for small rates and too short above 2 %', () => {
    expect(Math.abs(ruleOf70(0.02) - doublingTime(0.02))).toBeLessThan(0.01);
    for (const g of [0.03, 0.06, 0.1, 0.25]) expect(ruleOf70(g)).toBeLessThan(doublingTime(g));
    expect(doublingTime(0.25) - ruleOf70(0.25)).toBeGreaterThan(
      doublingTime(0.06) - ruleOf70(0.06),
    );
  });
});
