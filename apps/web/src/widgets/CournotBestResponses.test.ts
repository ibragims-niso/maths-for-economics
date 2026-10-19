import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  bestResponse1,
  bestResponse2,
  CournotBestResponses,
  cournotEquilibrium,
  describeCournot,
} from './CournotBestResponses';

describe('CournotBestResponses', () => {
  it('matches GT01 Example 3: P = 100 − 2Q, both costs 10 → 15 each, price 40', () => {
    expect(cournotEquilibrium(100, 10)).toEqual({ q1: 15, q2: 15, price: 40 });
    expect(bestResponse1(100, 15)).toBe(15);
    expect(bestResponse2(100, 10, 15)).toBe(15);
    // Example 3: if firm 2 keeps to the cartel output 11.25, firm 1's best reply is 16.875.
    expect(bestResponse1(100, 11.25)).toBe(16.875);
  });

  it('matches the check in the Try it text: c₂ = 22 gives 17, 11 and price 44', () => {
    expect(cournotEquilibrium(100, 22)).toEqual({ q1: 17, q2: 11, price: 44 });
  });

  it('is a crossing of the two best responses, with positive outputs, over the slider ranges', () => {
    for (let a = 70; a <= 130; a += 5) {
      for (let c2 = 0; c2 <= 30; c2++) {
        const { q1, q2, price } = cournotEquilibrium(a, c2);
        expect(q1).toBeGreaterThan(0);
        expect(q2).toBeGreaterThan(0);
        expect(bestResponse1(a, q2)).toBeCloseTo(q1, 9);
        expect(bestResponse2(a, c2, q1)).toBeCloseTo(q2, 9);
        expect(price).toBeCloseTo((a + 10 + c2) / 3, 9);
        expect(price).toBeGreaterThan(Math.max(10, c2));
      }
    }
  });

  it('a best response beats nearby outputs (profit check, not the formula)', () => {
    const profit1 = (q1: number, q2: number) => (100 - 2 * (q1 + q2) - 10) * q1;
    for (const q2 of [0, 5, 15, 30]) {
      const best = bestResponse1(100, q2);
      for (const d of [-0.5, 0.5]) expect(profit1(best + d, q2)).toBeLessThan(profit1(best, q2));
    }
  });

  it('says how firm 2’s cost moves the equilibrium', () => {
    expect(describeCournot(100, 22)).toContain('produces less and firm 1 more');
    expect(describeCournot(100, 4)).toContain('produces more and firm 1 less');
    expect(describeCournot(100, 10)).toContain('same amount');
  });

  it('shows the default read-outs', () => {
    const html = renderToStaticMarkup(createElement(CournotBestResponses));
    expect(html).toContain('<dd>15</dd>');
    expect(html).toContain('<dd>40</dd>');
  });
});
