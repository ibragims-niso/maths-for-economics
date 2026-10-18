import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChainRuleCostTime, costOf, costRate, marginalCost, outputAt } from './ChainRuleCostTime';

describe('ChainRuleCostTime', () => {
  it('matches C104 Example 2: Q = 40 + 5t, C = 500 + 6Q + 0.5Q², t = 4 gives dC/dt = 330', () => {
    expect(outputAt(4, 5)).toBe(60);
    expect(marginalCost(60)).toBe(66);
    expect(costOf(60)).toBe(2660);
    expect(costRate(4, 5)).toBe(330);
  });

  it('agrees with the numerical slope of C(Q(t)) for every slider position', () => {
    for (let g = 1; g <= 8; g++) {
      for (let t = 0; t <= 10; t += 0.5) {
        const h = 1e-4;
        const numeric = (costOf(outputAt(t + h, g)) - costOf(outputAt(t - h, g))) / (2 * h);
        expect(costRate(t, g)).toBeCloseTo(numeric, 4);
      }
    }
  });

  it('keeps the curve inside the graph at the largest growth rate', () => {
    expect(costOf(outputAt(10, 8))).toBeLessThan(9000);
  });

  it('shows the default read-outs: C′(60) = 66 and dC/dt = 330', () => {
    const html = renderToStaticMarkup(createElement(ChainRuleCostTime));
    expect(html).toContain('<dd>66</dd>');
    expect(html).toContain('<dd>330</dd>');
  });
});
