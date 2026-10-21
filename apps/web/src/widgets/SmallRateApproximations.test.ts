import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ratios, SmallRateApproximations } from './SmallRateApproximations';

describe('SmallRateApproximations', () => {
  it('gives the Try it values at g = 10 %: 0.953, 1.052 and 0.998', () => {
    const r = ratios(0.1);
    expect(Number(r.log.toFixed(3))).toBe(0.953);
    expect(Number(r.exp.toFixed(3))).toBe(1.052);
    expect(Number(r.sin.toFixed(3))).toBe(0.998);
  });

  it('sends every ratio to 1 as g shrinks, with the log ratio below 1 and the exp ratio above', () => {
    for (const g of [0.5, 0.1, 0.01, 0.001]) {
      const r = ratios(g);
      expect(r.log).toBeLessThan(1);
      expect(r.exp).toBeGreaterThan(1);
      expect(r.sin).toBeLessThan(1);
    }
    const tiny = ratios(1e-6);
    for (const v of [tiny.log, tiny.exp, tiny.sin]) expect(Math.abs(v - 1)).toBeLessThan(1e-5);
    // The gaps shrink roughly in proportion to g: ln(1 + g)/g ≈ 1 − g/2.
    expect(Math.abs(1 - ratios(0.01).log - 0.005)).toBeLessThan(1e-4);
  });

  it('renders at the default rate with all three read-outs', () => {
    const html = renderToStaticMarkup(createElement(SmallRateApproximations));
    expect(html).toContain('0.953');
    expect(html).toContain('1.052');
    expect(html).toContain('0.998');
  });
});
