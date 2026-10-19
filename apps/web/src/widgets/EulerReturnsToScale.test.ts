import { describe, expect, it } from 'vitest';
import {
  caption,
  eulerSplit,
  output,
  paidPercent,
  rayOutput,
  scaleSum,
} from './EulerReturnsToScale';

describe('EulerReturnsToScale', () => {
  it('starts at the exponents of MV04 Example 2: a + b = 1, output doubles at t = 2, 100 % paid out', () => {
    expect(scaleSum(0.25, 0.75)).toBe(1);
    expect(rayOutput(0.25, 0.75, 2)).toBeCloseTo(2, 12);
    expect(paidPercent(0.25, 0.75)).toBe(100);
    expect(caption(0.25, 0.75)).toContain('product exhaustion');
  });

  it('matches the check in the topic text: b = 0.5 gives 1.68 and 75 %, a = b = 0.8 gives 3.03 and 160 %', () => {
    expect(rayOutput(0.25, 0.5, 2)).toBeCloseTo(1.6818, 4);
    expect(paidPercent(0.25, 0.5)).toBe(75);
    expect(caption(0.25, 0.5)).toContain('25 % is left over');
    expect(rayOutput(0.8, 0.8, 2)).toBeCloseTo(3.0314, 4);
    expect(paidPercent(0.8, 0.8)).toBe(160);
  });

  it('Q(tK, tL) = t^(a+b)·Q(K, L) at any input mix', () => {
    for (const [a, b] of [
      [0.25, 0.75],
      [0.1, 0.8],
      [0.8, 0.8],
    ] as const) {
      for (const t of [0.5, 1.3, 2]) {
        expect(output(a, b, t * 3, t * 7) / output(a, b, 3, 7)).toBeCloseTo(t ** (a + b), 12);
        expect(rayOutput(a, b, t)).toBeCloseTo(output(a, b, t, t), 12);
      }
    }
  });

  it("Euler's theorem: K·MP_K + L·MP_L = (a + b)·Q, checked with numerical partial derivatives", () => {
    const h = 1e-5;
    for (const [a, b] of [
      [0.25, 0.75],
      [0.3, 0.5],
      [0.7, 0.8],
    ] as const) {
      for (const [K, L] of [
        [2, 2],
        [16, 81],
        [0.5, 3],
      ] as const) {
        const f = (k: number, l: number) => output(a, b, k, l);
        const mpk = (f(K + h, L) - f(K - h, L)) / (2 * h);
        const mpl = (f(K, L + h) - f(K, L - h)) / (2 * h);
        const split = eulerSplit(a, b, K, L);
        expect(split.capital).toBeCloseTo(K * mpk, 4);
        expect(split.labour).toBeCloseTo(L * mpl, 4);
        expect(split.capital).toBeCloseTo(a * split.q, 12);
        expect(split.total).toBeCloseTo((a + b) * split.q, 12);
      }
    }
  });

  it('the caption follows the slider steps exactly, including a + b = 1', () => {
    expect(scaleSum(0.45, 0.55)).toBe(1);
    expect(caption(0.45, 0.55)).toContain('constant returns');
    expect(caption(0.1, 0.1)).toContain('decreasing returns');
    expect(caption(0.5, 0.55)).toContain('increasing returns');
    expect(paidPercent(0.35, 0.3)).toBe(65);
  });
});
