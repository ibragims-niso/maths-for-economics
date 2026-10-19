import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BREAK_EVEN,
  describeRun,
  NewtonBreakEven,
  newtonPath,
  profit,
  profitSlope,
} from './NewtonBreakEven';

describe('NewtonBreakEven', () => {
  it('uses the profit of NM01 Example 3: π(3) = 24 at the top of the hill, π(5) = −20', () => {
    expect(profit(3)).toBe(24);
    expect(profitSlope(3)).toBe(0);
    expect(profit(5)).toBe(-20);
    expect(profitSlope(5)).toBe(-48);
  });

  it('lists the break-even outputs, where profit is zero', () => {
    for (const q of BREAK_EVEN) expect(Math.abs(profit(q))).toBeLessThan(0.002);
  });

  it('reproduces the Newton estimates of Example 3 from q₀ = 5 and q₀ = 1', () => {
    const { path } = newtonPath(5, 4);
    expect(path.map((q) => Number(q.toFixed(4)))).toEqual([5, 4.5833, 4.513, 4.5111, 4.5111]);
    // The Try it check: after 3 steps the last step is about 0.002.
    expect(Math.abs((path[3] ?? 0) - (path[2] ?? 0))).toBeCloseTo(0.002, 3);
    const low = newtonPath(1, 2).path;
    expect(low.map((q) => Number(q.toFixed(4)))).toEqual([1, 1.1667, 1.1705]);
  });

  it('stops at a flat tangent and jumps to a negative output from 2.9', () => {
    const flat = newtonPath(3, 3);
    expect(flat.flat).toBe(true);
    expect(flat.path).toEqual([3]);
    expect(describeRun(flat)).toMatch(/flat/);
    const bad = newtonPath(2.9, 1);
    expect(bad.path[1]).toBeCloseTo(-10.609, 3);
    expect(describeRun(bad)).toMatch(/negative output/);
  });

  it('names the break-even output the estimates approach', () => {
    expect(describeRun(newtonPath(5, 2))).toMatch(/higher break-even output, 4\.5111/);
    expect(describeRun(newtonPath(1, 2))).toMatch(/lower break-even output, 1\.1705/);
  });

  it('shows the default numbers of the Try it text (q₀ = 5, 2 steps)', () => {
    const html = renderToStaticMarkup(createElement(NewtonBreakEven));
    expect(html).toContain('4.513');
    expect(html).toContain('−0.0676');
    expect(html).toContain('0.0703');
  });
});
