import { describe, expect, it } from 'vitest';
import { longRunTotal, niceCeil, roundSpending, totalAfter } from './SpendingRounds';

describe('SpendingRounds', () => {
  it('reproduces F08 Example 2: 100 re-spent at 75 % for 5 rounds', () => {
    expect(roundSpending(100, 0.75, 5)).toBeCloseTo(31.64, 2);
    expect(totalAfter(100, 0.75, 5)).toBeCloseTo(305.08, 2);
    expect(longRunTotal(100, 0.75)).toBe(400);
  });

  it('the sum formula equals adding the rounds one by one, and stays below a/(1 − c)', () => {
    for (let c = 0.1; c <= 0.95; c += 0.05) {
      let running = 0;
      for (let n = 1; n <= 20; n++) {
        running += roundSpending(100, c, n);
        expect(totalAfter(100, c, n)).toBeCloseTo(running, 9);
        // the gap to the ceiling is a·cⁿ/(1 − c); test it where it is bigger than rounding error
        if (c ** n > 1e-9) expect(running).toBeLessThan(longRunTotal(100, c));
        expect(longRunTotal(100, c) - totalAfter(100, c, n)).toBeCloseTo(
          (100 * c ** n) / (1 - c),
          9,
        );
      }
    }
    expect(totalAfter(100, 0.5, 0)).toBe(0);
  });

  it('rounds the top of the graph up to a tidy number', () => {
    expect([460, 127.8, 2300, 100, 0.9].map(niceCeil)).toEqual([500, 200, 2500, 100, 1]);
  });
});
