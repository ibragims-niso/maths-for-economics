import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TradeBalanceLine, tradeOfCountry1 } from './TradeBalanceLine';

describe('TradeBalanceLine', () => {
  it('balances at x₂ = 300 for the shares of LA205 Example 2 (30 % and 20 %)', () => {
    const t = tradeOfCountry1(0.3, 0.2, 300);
    expect(t.exports).toBeCloseTo(60, 12);
    expect(t.imports).toBeCloseTo(60, 12);
    expect(t.balance).toBeCloseTo(0, 12);
    expect(t.balancingX2).toBeCloseTo(300, 12);
  });

  it('gives country 1 a surplus above the balancing income and a deficit below it', () => {
    expect(tradeOfCountry1(0.3, 0.2, 400).balance).toBeCloseTo(20, 12);
    expect(tradeOfCountry1(0.3, 0.2, 200).balance).toBeCloseTo(-20, 12);
  });

  it('is the eigenvector of the structure matrix for eigenvalue 1', () => {
    for (const [a, b] of [
      [0.1, 0.4],
      [0.5, 0.05],
      [0.25, 0.25],
    ] as const) {
      const x2 = tradeOfCountry1(a, b, 0).balancingX2;
      const x = [200, x2];
      const A = [
        [1 - a, b],
        [a, 1 - b],
      ];
      const Ax = A.map((r) => (r[0] ?? 0) * (x[0] ?? 0) + (r[1] ?? 0) * (x[1] ?? 0));
      expect(Ax[0]).toBeCloseTo(200, 9);
      expect(Ax[1]).toBeCloseTo(x2, 9);
    }
  });

  it('renders the balanced case at the defaults', () => {
    const html = renderToStaticMarkup(createElement(TradeBalanceLine));
    expect(html).toContain('exactly zero');
    expect(html).toContain('>300<');
  });
});
