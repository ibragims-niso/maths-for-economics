import { describe, expect, it } from 'vitest';
import { binomialTree, describeTree } from './BinomialOptionTree';

describe('BinomialOptionTree maths', () => {
  it('matches worked examples 1 and 2 in SP04 (u = 1.25, d = 0.9, r = 4 %, K = 100)', () => {
    const tree = binomialTree(1.25, 0.9, 4);
    expect(tree.noArbitrage).toBe(true);
    expect(tree.q).toBeCloseTo(0.4, 12);
    expect(tree.prices[2]?.[0]).toBeCloseTo(156.25, 9);
    expect(tree.prices[2]?.[1]).toBeCloseTo(112.5, 9);
    expect(tree.prices[2]?.[2]).toBeCloseTo(81, 9);
    expect(tree.calls[2]).toEqual([expect.closeTo(56.25, 9), expect.closeTo(12.5, 9), 0]);
    expect(tree.calls[1]?.[0]).toBeCloseTo(28.8462, 4);
    expect(tree.calls[1]?.[1]).toBeCloseTo(4.8077, 4);
    expect(tree.calls[0]?.[0]).toBeCloseTo(13.8683, 4);
    expect(tree.delta).toBeCloseTo(0.6868, 4);
  });

  it('gives the put of worked example 3 by parity (6.32)', () => {
    expect(binomialTree(1.25, 0.9, 4).put).toBeCloseTo(6.324, 3);
  });

  it('agrees with pricing the put directly in the same tree', () => {
    for (const [u, d, r] of [
      [1.2, 0.8, 3],
      [1.5, 0.5, 10],
      [1.1, 0.95, 0],
    ] as const) {
      const tree = binomialTree(u, d, r);
      const q = tree.q;
      const R = 1 + r / 100;
      const pay = (tree.prices[2] ?? []).map((s) => Math.max(100 - s, 0));
      const direct =
        (q * q * (pay[0] ?? 0) + 2 * q * (1 - q) * (pay[1] ?? 0) + (1 - q) ** 2 * (pay[2] ?? 0)) /
        R ** 2;
      expect(tree.put).toBeCloseTo(direct, 9);
    }
  });

  it('flags arbitrage when R is not below u and explains it', () => {
    const tree = binomialTree(1.05, 0.9, 6);
    expect(tree.noArbitrage).toBe(false);
    expect(tree.q).toBeGreaterThan(1);
    expect(describeTree(tree, 1.05)).toContain('riskless profit');
    expect(describeTree(binomialTree(1.25, 0.9, 4), 1.25)).toContain('6.32');
  });
});
