import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { equilibriumIncome, KeynesianCross, multiplier } from './KeynesianCross';

describe('KeynesianCross', () => {
  it('matches F11 Example 1: C = 50 + 0.8Y, I = 150, G = 200 gives Y* = 2000', () => {
    expect(multiplier(0.8)).toBeCloseTo(5, 12);
    expect(equilibriumIncome(50, 0.8, 150, 200)).toBeCloseTo(2000, 9);
  });

  it('raising G by 20 raises Y* by 100 when b = 0.8 (Example 1, step 4)', () => {
    const before = equilibriumIncome(50, 0.8, 150, 200);
    expect(equilibriumIncome(50, 0.8, 150, 220) - before).toBeCloseTo(100, 9);
    expect(equilibriumIncome(50, 0.8, 150, 220)).toBeCloseTo(2100, 9);
  });

  it('puts Y* on the 45° line: planned spending equals income', () => {
    for (const b of [0.5, 0.6, 0.75, 0.85]) {
      for (const g of [100, 250, 400]) {
        const y = equilibriumIncome(50, b, 150, g);
        expect(50 + b * y + 150 + g).toBeCloseTo(y, 9);
      }
    }
  });

  it('shows the default read-outs: Y* = 2,000 and multiplier 5', () => {
    const html = renderToStaticMarkup(createElement(KeynesianCross));
    expect(html).toContain('2,000');
    expect(html).toContain('<dd>5</dd>');
  });
});
