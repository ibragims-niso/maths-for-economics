import { describe, expect, it } from 'vitest';
import { firstN, gapAt, rootIteration, SEQUENCES } from './EpsilonBand';

describe('EpsilonBand maths', () => {
  it('matches Example 1 in AN02: (2n + 1)/(n + 3) with ε = 0.1 needs N = 48', () => {
    expect(firstN(0, 0.1)).toBe(48);
    // At n = 47 the gap is exactly 0.1, which is not < 0.1.
    expect(gapAt(0, 47)).toBe(0.1);
    expect(gapAt(0, 48)).toBeLessThan(0.1);
  });

  it('matches the Try it checks: ε = 0.5 gives N = 8, ε = 0.25 gives N = 18', () => {
    expect(firstN(0, 0.5)).toBe(8);
    expect(firstN(0, 0.25)).toBe(18);
  });

  it('agrees with the closed form N = ⌊5/ε − 3⌋ + 1 for the rational sequence', () => {
    for (let k = 1; k <= 20; k++) {
      const eps = Math.round(k * 5) / 100;
      // 5/ε − 3 = 500/(100ε) − 3, with 100ε a whole number.
      const hundredths = Math.round(eps * 100);
      expect(firstN(0, eps)).toBe(Math.max(1, Math.floor(500 / hundredths - 3) + 1));
      expect(gapAt(0, 10)).toBeCloseTo(Math.abs((SEQUENCES[0]?.terms[9] ?? 0) - 2), 12);
    }
  });

  it('gives N from 0.9ⁿ < ε for the oscillating sequence', () => {
    for (const eps of [0.05, 0.15, 0.3, 0.7, 1]) {
      expect(firstN(1, eps)).toBe(Math.floor(Math.log(eps) / Math.log(0.9)) + 1);
    }
  });

  it('matches Example 2: x₁ = 0, xₙ₊₁ = √(2 + xₙ) rises towards 2', () => {
    const xs = rootIteration(40);
    expect(xs[0]).toBe(0);
    expect(xs[1]).toBeCloseTo(Math.sqrt(2), 12);
    expect(xs.slice(2, 5).map((x) => Math.round(x * 10000) / 10000)).toEqual([
      1.8478, 1.9616, 1.9904,
    ]);
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i]).toBeGreaterThanOrEqual(xs[i - 1] ?? 0);
      expect(xs[i]).toBeLessThanOrEqual(2);
    }
    expect(firstN(2, 0.05)).toBe(4);
    // The Try it check: with ε = 0.1 the recursive sequence needs only N = 4.
    expect(firstN(2, 0.1)).toBe(4);
    expect(firstN(2, 1)).toBe(2);
  });

  it('keeps every shown term inside the graph and finds N for every slider value', () => {
    for (const seq of SEQUENCES) {
      for (const a of seq.terms.slice(0, 50)) {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(3);
      }
    }
    for (let i = 0; i < SEQUENCES.length; i++) {
      for (let k = 1; k <= 20; k++) {
        const N = firstN(i, k * 0.05);
        expect(N).toBeLessThan(200);
        expect(gapAt(i, N)).toBeLessThan(k * 0.05);
      }
    }
  });
});
