import { describe, expect, it } from 'vitest';
import {
  basketAfter,
  describeBias,
  fisherIndex,
  laspeyresIndex,
  paascheIndex,
} from './IndexNumberBasket';

describe('IndexNumberBasket', () => {
  it('reproduces ST106 Example 2: fuel +40 %, 25 % less fuel gives 122, 120 and 121', () => {
    const b = basketAfter(40, 25);
    expect(b.q1[1]).toBeCloseTo(30, 12);
    expect(laspeyresIndex(b)).toBeCloseTo(122, 10);
    expect(paascheIndex(b)).toBeCloseTo(120, 10);
    expect(fisherIndex(b)).toBeCloseTo(121, 2);
  });

  it('Laspeyres equals the base-expenditure-weighted average of the price relatives', () => {
    for (let rise = 10; rise <= 100; rise += 5) {
      const b = basketAfter(rise, 25);
      // Base spending: bread 90, fuel 60, so the weights are 0.6 and 0.4.
      expect(laspeyresIndex(b)).toBeCloseTo(0.6 * 110 + 0.4 * (100 + rise), 10);
    }
  });

  it('keeps Paasche ≤ Fisher ≤ Laspeyres when fuel rises at least as fast as bread', () => {
    for (let rise = 10; rise <= 100; rise += 5) {
      for (let cut = 0; cut <= 50; cut += 5) {
        const b = basketAfter(rise, cut);
        const [l, p, f] = [laspeyresIndex(b), paascheIndex(b), fisherIndex(b)];
        expect(p).toBeLessThanOrEqual(f + 1e-9);
        expect(f).toBeLessThanOrEqual(l + 1e-9);
        // The value index is exactly Laspeyres price × Paasche quantity.
        const value =
          (b.p1[0] * b.q1[0] + b.p1[1] * b.q1[1]) / (b.p0[0] * b.q0[0] + b.p0[1] * b.q0[1]);
        const paascheQuantity =
          (b.p1[0] * b.q1[0] + b.p1[1] * b.q1[1]) / (b.p1[0] * b.q0[0] + b.p1[1] * b.q0[1]);
        expect((l / 100) * paascheQuantity).toBeCloseTo(value, 12);
      }
    }
  });

  it('shows equal indices when nothing is substituted or prices move together', () => {
    const same = basketAfter(60, 0);
    expect(paascheIndex(same)).toBeCloseTo(laspeyresIndex(same), 12);
    expect(describeBias(60, 0)).toMatch(/agree/);
    expect(paascheIndex(basketAfter(10, 40))).toBeCloseTo(110, 12);
    expect(describeBias(10, 40)).toMatch(/110/);
    expect(describeBias(40, 25)).toMatch(/overstates/);
  });
});
