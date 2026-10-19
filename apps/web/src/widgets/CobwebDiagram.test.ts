import { describe, expect, it } from 'vitest';
import {
  cobwebCorners,
  cobwebFactor,
  cobwebPrices,
  cobwebVerdict,
  nextPrice,
  pricesWhileValid,
  steadyPrice,
  supplyLabel,
} from './CobwebDiagram';

describe('CobwebDiagram', () => {
  it('reproduces DY01 Example 2 (Q = 100 − 2P, supply 30 + 1.5P(t − 1), P0 = 28)', () => {
    const prices = cobwebPrices(1.5, 28);
    expect(prices.slice(0, 4)).toEqual([28, 14, 24.5, 16.625]);
    expect(steadyPrice(1.5)).toBe(20);
    expect(cobwebFactor(1.5)).toBe(-0.75);
    expect(cobwebVerdict(1.5)).toBe('converges');
    expect(prices[8]).toBeCloseTo(20 + 8 * 0.75 ** 8, 12);
    expect(prices[8]).toBeCloseTo(20.8, 2);
  });

  it('clears the market every year and follows P(t) = P* + (P0 − P*)(−δ/β)ᵗ', () => {
    for (let delta = 0.5; delta <= 3; delta += 0.25) {
      for (const start of [5, 20, 28, 45]) {
        const prices = cobwebPrices(delta, start);
        const star = steadyPrice(delta);
        // At the steady state demand equals supply.
        expect(100 - 2 * star).toBeCloseTo(30 + delta * star, 12);
        expect(nextPrice(delta, star)).toBeCloseTo(star, 12);
        prices.forEach((p, t) => {
          expect(p).toBeCloseTo(star + (start - star) * cobwebFactor(delta) ** t, 9);
          // Demand this year equals the harvest planted on last year's price.
          if (t > 0) expect(100 - 2 * p).toBeCloseTo(30 + delta * (prices[t - 1] ?? 0), 9);
        });
      }
    }
  });

  it('names the three cases by |a| = δ/β', () => {
    expect(cobwebVerdict(0.5)).toBe('converges');
    expect(cobwebVerdict(2)).toBe('cycles');
    expect(cobwebVerdict(2.5)).toBe('explodes');
    // a = −1: the price jumps between two values for ever.
    const cycle = cobwebPrices(2, 10);
    expect(cycle.slice(0, 4)).toEqual([10, 25, 10, 25]);
  });

  it('draws corners alternately on the supply and the demand line, and stops at negative prices', () => {
    const delta = 1.5;
    const prices = cobwebPrices(delta, 28);
    const corners = cobwebCorners(delta, prices);
    expect(corners.length).toBe(16);
    corners.forEach(([q, p], i) => {
      if (i % 2 === 0) expect(q).toBeCloseTo(30 + delta * (prices[i / 2] ?? 0), 12);
      else expect(q).toBeCloseTo(100 - 2 * p, 12);
    });
    const exploding = pricesWhileValid(cobwebPrices(2.5, 22));
    expect(exploding.length).toBe(5);
    expect(exploding.every((p) => p >= 0)).toBe(true);
    expect(pricesWhileValid(cobwebPrices(3, 45))).toEqual([45]);
    for (let delta = 0.5; delta <= 3; delta += 0.25) {
      const [q, p] = supplyLabel(delta);
      expect(q).toBeLessThanOrEqual(96);
      expect(p).toBeLessThanOrEqual(50);
    }
  });
});
