import { describe, expect, it } from 'vitest';
import { demandQuantity, inverseDemandPrice, mirror } from './InverseDemandMirror';

describe('InverseDemandMirror', () => {
  it('reproduces F10 Example 2: Q = 120 − 4P, so 80 rentals sell at a price of 10', () => {
    expect(demandQuantity(120, 4, 10)).toBe(80);
    expect(inverseDemandPrice(120, 4, 80)).toBe(10);
    // domain 0 ≤ Q ≤ 120 of the inverse maps onto the range 30 ≥ P ≥ 0
    expect(inverseDemandPrice(120, 4, 0)).toBe(30);
    expect(inverseDemandPrice(120, 4, 120)).toBe(0);
  });

  it('inverse demand undoes demand, and the mirror point lies on the inverse', () => {
    for (const b of [2, 3, 4, 5, 6]) {
      for (let p = 0; p <= 120 / b; p++) {
        const q = demandQuantity(120, b, p);
        expect(inverseDemandPrice(120, b, q)).toBeCloseTo(p, 12);
        const [mx, my] = mirror([p, q]);
        expect(my).toBeCloseTo(inverseDemandPrice(120, b, mx), 12);
      }
    }
  });

  it('reflects a point in y = x by swapping its coordinates', () => {
    expect(mirror([10, 80])).toEqual([80, 10]);
    expect(mirror(mirror([3, 7]))).toEqual([3, 7]);
  });
});
