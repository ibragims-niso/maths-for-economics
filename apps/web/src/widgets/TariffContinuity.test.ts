import { describe, expect, it } from 'vitest';
import { bill, joiningK, jump, leftLimit, rightLimit } from './TariffContinuity';

describe('TariffContinuity (C101, Example 3)', () => {
  it('has a left limit of 60 at 10 GB, equal to the bill at 10 GB', () => {
    expect(leftLimit()).toBe(60);
    expect(bill(10, 30)).toBe(60);
    expect(Math.abs(bill(10 - 1e-9, 30) - 60)).toBeLessThan(1e-6);
  });

  it('approaches k + 20 from the right', () => {
    for (const k of [20, 30, 40, 60]) {
      expect(rightLimit(k)).toBe(k + 20);
      expect(Math.abs(bill(10 + 1e-9, k) - rightLimit(k))).toBeLessThan(1e-6);
    }
  });

  it('jumps down by 10 when k = 30 and is continuous for k = 40, as in the text', () => {
    expect(jump(30)).toBe(-10);
    expect(joiningK()).toBe(40);
    expect(jump(joiningK())).toBe(0);
  });

  it('reads the values in the Try it check: C(9.9) = 59.6 and C(10.1) = 50.2 with k = 30', () => {
    expect(bill(9.9, 30)).toBeCloseTo(59.6, 9);
    expect(bill(10.1, 30)).toBeCloseTo(50.2, 9);
  });
});
