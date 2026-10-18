import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { describeLines, secondRow, solveLines, TwoLineSystem } from './TwoLineSystem';

describe('TwoLineSystem', () => {
  it('matches the LA103 intuition: x + 2y = 8 and 3x + 4y = 18 meet at x = 2, y = 3', () => {
    const r = solveLines(3, 18);
    expect(r).toEqual({ kind: 'one', pivot: -2, rhs: -6, x: 2, y: 3 });
    expect(secondRow(r)).toBe('−2y = −6');
  });

  it('every unique solution satisfies both equations', () => {
    for (let a = 0; a <= 4; a += 0.5) {
      for (let c = 4; c <= 24; c += 2) {
        const r = solveLines(a, c);
        if (r.kind !== 'one') continue;
        expect(r.x + 2 * r.y).toBeCloseTo(8, 9);
        expect(a * r.x + 4 * r.y).toBeCloseTo(c, 9);
      }
    }
  });

  it('a = 2 gives parallel lines (no solution) unless c = 16 (the same line)', () => {
    expect(solveLines(2, 16)).toEqual({ kind: 'many', pivot: 0, rhs: 0 });
    expect(solveLines(2, 18)).toEqual({ kind: 'none', pivot: 0, rhs: 2 });
    expect(secondRow(solveLines(2, 18))).toBe('0 = 2');
    expect(describeLines(2, 18)).toContain('parallel');
    expect(describeLines(2, 16)).toContain('same line');
    // Every other slope gives exactly one solution.
    for (const a of [0, 0.5, 1, 1.5, 2.5, 3, 3.5, 4]) expect(solveLines(a, 16).kind).toBe('one');
  });

  it('says when the crossing point is off the graph', () => {
    // 0x + 4y = 24 → y = 6, x = 8 − 12 = −4.
    expect(solveLines(0, 24)).toMatchObject({ x: -4, y: 6 });
    expect(describeLines(0, 24)).toContain('outside this window');
  });

  it('shows the default read-outs', () => {
    const html = renderToStaticMarkup(createElement(TwoLineSystem));
    expect(html).toContain('<dd>x = 2, y = 3</dd>');
    expect(html).toContain('<dd>−2y = −6</dd>');
    expect(html).toContain('<dd>exactly one</dd>');
  });
});
