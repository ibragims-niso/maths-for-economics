import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MeanValueTangent, marginal, meanValue, output } from './MeanValueTangent';

describe('MeanValueTangent', () => {
  it('reproduces C120 Example 1: from 4 to 64 hours the chord slope is 2 and c = 25', () => {
    const { slope, c } = meanValue(4, 64);
    expect(slope).toBe(2);
    expect(c).toBe(25);
    expect(marginal(25)).toBe(2);
    expect(output(25)).toBe(100);
  });

  it('finds a point inside every interval where the marginal product equals the chord slope', () => {
    for (const [a, b] of [
      [1, 5],
      [9, 49],
      [40, 80],
      [3, 7],
    ] as const) {
      const { slope, c } = meanValue(a, b);
      expect(c).toBeGreaterThan(a);
      expect(c).toBeLessThan(b);
      expect(Math.abs(marginal(c) - slope)).toBeLessThan(1e-12);
      // c lies left of the midpoint, because the marginal product falls.
      expect(c).toBeLessThan((a + b) / 2);
    }
  });

  it('renders the Try it values at the defaults', () => {
    const html = renderToStaticMarkup(createElement(MeanValueTangent));
    expect(html).toContain('25 h');
    expect(html).toMatch(/>2<\/dd>/);
  });
});
