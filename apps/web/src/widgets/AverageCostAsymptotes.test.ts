import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AverageCostAsymptotes, averageCost, lowestPoint } from './AverageCostAsymptotes';

describe('AverageCostAsymptotes', () => {
  it('has its lowest point at q = 10 with AC = 60 for F = 200 and d = 2', () => {
    expect(lowestPoint(200, 2)).toEqual({ q: 10, ac: 60 });
  });

  it('is above its oblique asymptote by exactly F/q, a gap that shrinks', () => {
    for (const q of [1, 10, 100, 1000]) {
      expect(averageCost(200, 2, q) - (20 + 2 * q)).toBeCloseTo(200 / q, 9);
    }
    expect(averageCost(200, 2, 0.001)).toBeGreaterThan(1e5);
  });

  it('really is the minimum: nearby outputs cost more per unit', () => {
    for (const [F, d] of [
      [50, 0.5],
      [400, 4],
      [120, 1.3],
    ] as const) {
      const low = lowestPoint(F, d);
      expect(averageCost(F, d, low.q - 0.1)).toBeGreaterThan(low.ac);
      expect(averageCost(F, d, low.q + 0.1)).toBeGreaterThan(low.ac);
    }
  });

  it('renders the Try it values at the defaults', () => {
    const html = renderToStaticMarkup(createElement(AverageCostAsymptotes));
    expect(html).toContain('>60<');
    expect(html).toContain('>10<');
    expect(html).toContain('Gap to the line at q = 20');
  });
});
