import { describe, expect, it } from 'vitest';
import { breakEvenQuantity, labelX } from './BreakEvenLines';

describe('BreakEvenLines', () => {
  it('reproduces F04 example 2: break-even at 600 units', () => {
    expect(breakEvenQuantity(9000, 40, 25)).toBe(600);
    expect(40 * 600).toBe(9000 + 25 * 600);
  });

  it('has no break-even point when the price does not exceed the unit cost', () => {
    expect(breakEvenQuantity(9000, 25, 25)).toBeNull();
    expect(breakEvenQuantity(9000, 10, 45)).toBeNull();
  });

  it('puts revenue equal to cost at Q* for every slider combination', () => {
    for (let p = 10; p <= 60; p += 5) {
      for (let v = 5; v <= 45; v += 5) {
        const q = breakEvenQuantity(9000, p, v);
        if (q === null) continue;
        expect(Math.abs(p * q - (9000 + v * q))).toBeLessThan(1e-6);
      }
    }
  });

  it('keeps line labels inside the graph', () => {
    const lines: [intercept: number, slope: number][] = [
      [0, 0.06],
      [15, 0.045],
      [3, 0.005],
    ];
    for (const [a, b] of lines) {
      const x = labelX(a, b);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThanOrEqual(1200);
      expect(a + b * x).toBeLessThanOrEqual(50);
    }
  });
});
