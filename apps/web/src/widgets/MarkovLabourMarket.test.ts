import { describe, expect, it } from 'vitest';
import {
  axisTop,
  gapFactor,
  longRunUnemployment,
  nextUnemployment,
  unemploymentAfter,
} from './MarkovLabourMarket';

describe('MarkovLabourMarket', () => {
  it('reproduces SP01 Examples 1 and 2 (s = 0.04, f = 0.36, start 20 %)', () => {
    expect(unemploymentAfter(0.04, 0.36, 0.2, 1)).toBeCloseTo(0.16, 12);
    expect(unemploymentAfter(0.04, 0.36, 0.2, 2)).toBeCloseTo(0.136, 12);
    expect(longRunUnemployment(0.04, 0.36)).toBeCloseTo(0.1, 12);
    expect(gapFactor(0.04, 0.36)).toBeCloseTo(0.6, 12);
    expect(unemploymentAfter(0.04, 0.36, 0.2, 10)).toBeCloseTo(0.1006, 4);
    expect(unemploymentAfter(0.04, 0.36, 0, 10)).toBeCloseTo(0.0994, 4);
  });

  it('is the row vector (1 − u, u) times P, and the gap shrinks by 1 − s − f each quarter', () => {
    for (let s = 0.01; s <= 0.1; s += 0.01) {
      for (let f = 0.1; f <= 0.6; f += 0.05) {
        const P = [
          [1 - s, s],
          [f, 1 - f],
        ];
        for (const u0 of [0, 0.2, 0.5]) {
          const viaMatrix = (1 - u0) * (P[0]?.[1] ?? 0) + u0 * (P[1]?.[1] ?? 0);
          expect(nextUnemployment(s, f, u0)).toBeCloseTo(viaMatrix, 12);
          const star = longRunUnemployment(s, f);
          for (let n = 0; n <= 20; n++) {
            expect(unemploymentAfter(s, f, u0, n) - star).toBeCloseTo(
              (u0 - star) * gapFactor(s, f) ** n,
              12,
            );
          }
          // The long-run share does not move: inflows s(1 − u*) equal outflows f·u*.
          expect(nextUnemployment(s, f, star)).toBeCloseTo(star, 12);
        }
      }
    }
  });

  it('puts the top of the axis at a multiple of 5 above the highest value', () => {
    expect([20, 50, 10].map(axisTop)).toEqual([25, 60, 15]);
  });
});
