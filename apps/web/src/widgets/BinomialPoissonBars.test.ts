import { describe, expect, it } from 'vitest';
import {
  axisTop,
  binomialPmf,
  countTicks,
  largestGap,
  poissonPmf,
  windowFor,
} from './BinomialPoissonBars';

const choose = (n: number, k: number) => {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
};

describe('BinomialPoissonBars maths', () => {
  it('matches the default view and worked example 1 in ST104 (n = 8, p = 0.1)', () => {
    expect(binomialPmf(8, 0.1, 0)).toBeCloseTo(0.4305, 4);
    expect(binomialPmf(8, 0.1, 1)).toBeCloseTo(0.3826, 4);
    expect(binomialPmf(8, 0.1, 2)).toBeCloseTo(0.1488, 4);
    expect(poissonPmf(0.8, 1)).toBeCloseTo(0.3595, 4);
    expect(8 * 0.1 * 0.9).toBeCloseTo(0.72, 12);
  });

  it('gives the Try it checks (n = 100, p = 0.03) and worked example 3 (n = 500, p = 0.006)', () => {
    expect(binomialPmf(100, 0.03, 3)).toBeCloseTo(0.2275, 4);
    expect(poissonPmf(3, 3)).toBeCloseTo(0.224, 4);
    expect(binomialPmf(500, 0.006, 3)).toBeCloseTo(0.2247, 4);
    expect(binomialPmf(20, 0.5, 10)).toBeCloseTo(0.1762, 4);
    expect(poissonPmf(10, 10)).toBeCloseTo(0.1251, 4);
  });

  it('agrees with C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ and e^(−λ)λᵏ/k!, and both add up to 1', () => {
    for (const [n, p] of [
      [5, 0.3],
      [12, 0.45],
      [40, 0.05],
    ] as const) {
      let total = 0;
      for (let k = 0; k <= n; k++) {
        expect(binomialPmf(n, p, k)).toBeCloseTo(choose(n, k) * p ** k * (1 - p) ** (n - k), 12);
        total += binomialPmf(n, p, k);
      }
      expect(total).toBeCloseTo(1, 12);
      expect(binomialPmf(n, p, n + 1)).toBe(0);
    }
    let fact = 1;
    let total = 0;
    for (let k = 0; k <= 60; k++) {
      if (k > 0) fact *= k;
      expect(poissonPmf(4.5, k)).toBeCloseTo((Math.exp(-4.5) * 4.5 ** k) / fact, 12);
      total += poissonPmf(4.5, k);
    }
    expect(total).toBeCloseTo(1, 12);
  });

  it('has mean np for both, and variance np(1 − p) for the binomial but np for the Poisson', () => {
    const n = 30;
    const p = 0.25;
    let mB = 0;
    let vB = 0;
    let mP = 0;
    let vP = 0;
    for (let k = 0; k <= 80; k++) {
      mB += k * binomialPmf(n, p, k);
      mP += k * poissonPmf(n * p, k);
    }
    for (let k = 0; k <= 80; k++) {
      vB += (k - mB) ** 2 * binomialPmf(n, p, k);
      vP += (k - mP) ** 2 * poissonPmf(n * p, k);
    }
    expect(mB).toBeCloseTo(7.5, 10);
    expect(mP).toBeCloseTo(7.5, 10);
    expect(vB).toBeCloseTo(5.625, 10);
    expect(vP).toBeCloseTo(7.5, 10);
  });

  it('brings the two together as n grows with np fixed', () => {
    const gaps = [10, 30, 100].map((n) => largestGap(n, 3 / n));
    expect(gaps[0]).toBeGreaterThan(gaps[1] ?? 0);
    expect(gaps[1]).toBeGreaterThan(gaps[2] ?? 0);
    expect(gaps[2]).toBeLessThan(0.01);
    expect(largestGap(8, 0.1)).toBeGreaterThan(0.01);
    expect(largestGap(100, 0.5)).toBeGreaterThan(0.01);
  });

  it('shows almost all the probability and keeps it inside the frame for every slider position', () => {
    for (let n = 2; n <= 100; n++) {
      for (let i = 1; i <= 50; i++) {
        const p = i / 100;
        const { from, to } = windowFor(n, p);
        let shownB = 0;
        let shownP = 0;
        let tallest = 0;
        for (let k = from; k <= to; k++) {
          shownB += binomialPmf(n, p, k);
          shownP += poissonPmf(n * p, k);
          tallest = Math.max(tallest, binomialPmf(n, p, k), poissonPmf(n * p, k));
        }
        expect(shownB).toBeGreaterThan(0.999);
        expect(shownP).toBeGreaterThan(0.999);
        const top = axisTop(tallest);
        expect(top).toBeGreaterThan(tallest);
        // Both tick labels, top/2 and top, need at most 2 decimals.
        expect(Math.abs(top * 50 - Math.round(top * 50))).toBeLessThan(1e-9);
        expect(countTicks(from, to).length).toBeLessThanOrEqual(6);
        expect(Number.isFinite(largestGap(n, p))).toBe(true);
      }
    }
  });
});
