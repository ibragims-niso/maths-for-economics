import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  breakpoints,
  type Column,
  describeEnvelope,
  describeP,
  envelope,
  FIXED,
  gainAt,
  saddlePoint,
  solveEnvelope,
  ZeroSumLowerEnvelope,
} from './ZeroSumLowerEnvelope';

const game = (top: number, bottom: number): Column[] => [...FIXED, { top, bottom }];

describe('ZeroSumLowerEnvelope', () => {
  it('matches GT05 Example 3: p* = 0.4, v = 1, B1 and B2 cross at the top, B3 is 2.4 there', () => {
    const cols = game(-3, 6);
    const { value, pLow, pHigh, active } = solveEnvelope(cols);
    expect(pLow).toBeCloseTo(0.4, 12);
    expect(pHigh).toBeCloseTo(0.4, 12);
    expect(value).toBeCloseTo(1, 12);
    expect(active).toEqual([0, 1]);
    expect(gainAt(cols[2] as Column, 0.4)).toBeCloseTo(2.4, 12);
    expect(saddlePoint(cols)).toBeUndefined();
    // The envelope pieces: B2 up to 0.4, B1 up to 0.75, B3 after that.
    expect(breakpoints(cols).map((p) => Number(p.toFixed(4)))).toEqual([0, 0.4, 0.5, 0.75, 1]);
    expect(envelope(cols, 0.75)).toBeCloseTo(-0.75, 12);
  });

  it('agrees with a fine grid: no p guarantees A more than the top of the envelope', () => {
    for (let top = -3; top <= 7; top++)
      for (let bottom = -3; bottom <= 7; bottom++) {
        const cols = game(top, bottom);
        const { value } = solveEnvelope(cols);
        let best = Number.NEGATIVE_INFINITY;
        for (let k = 0; k <= 2000; k++) best = Math.max(best, envelope(cols, k / 2000));
        expect(best).toBeLessThanOrEqual(value + 1e-9);
        expect(best).toBeGreaterThan(value - 0.01);
        // With a saddle point the value is its entry.
        const s = saddlePoint(cols);
        if (s) {
          const c = cols[s[1]] as Column;
          expect(s[0] === 0 ? c.top : c.bottom).toBeCloseTo(value, 12);
        }
      }
  });

  it('matches the checks in the Try it text', () => {
    // Row-2 gain of B3 lowered to 3: B3 replaces B1 at the top, p* = 4/11, v = 9/11.
    const lower = solveEnvelope(game(-3, 3));
    expect(lower.pLow).toBeCloseTo(4 / 11, 12);
    expect(lower.value).toBeCloseTo(9 / 11, 12);
    expect(lower.active).toEqual([1, 2]);
    expect(describeP(lower.pLow, lower.pHigh)).toBe('0.364');
    // Both B3 gains at −1: a saddle point at (row 2, B3) with value −1, any p from 0 to 0.8.
    const flat = solveEnvelope(game(-1, -1));
    expect(flat.value).toBeCloseTo(-1, 12);
    expect(flat.pLow).toBe(0);
    expect(flat.pHigh).toBeCloseTo(0.8, 12);
    expect(saddlePoint(game(-1, -1))).toEqual([1, 2]);
    expect(describeP(flat.pLow, flat.pHigh)).toBe('0 to 0.8');
  });

  it('describes the top of the envelope and the unused column', () => {
    const text = describeEnvelope(game(-3, 6));
    expect(text).toContain('p* = 0.4, which guarantees v = 1');
    expect(text).toContain('B1 and B2, are the columns B mixes; B3 (2.4 there) lies above the top');
    expect(describeEnvelope(game(-3, 3))).toContain('B1 (1.18 there)');
    expect(describeEnvelope(game(-1, -1))).toContain('saddle point at (row 2, B3)');
  });

  it('shows the default read-outs', () => {
    const html = renderToStaticMarkup(createElement(ZeroSumLowerEnvelope));
    expect(html).toContain('<dd>0.4</dd>');
    expect(html).toContain('<dd>1</dd>');
    expect(html).toContain('<dd>none</dd>');
  });
});
