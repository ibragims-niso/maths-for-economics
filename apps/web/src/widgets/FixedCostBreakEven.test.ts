import { describe, expect, it } from 'vitest';
import { breakEvenOutputs, discriminant, profit } from './FixedCostBreakEven';

describe('FixedCostBreakEven', () => {
  it('reproduces F02 example 2: break-even at 20 and 50 when F = 2000', () => {
    expect(discriminant(2000)).toBe(3600);
    expect(breakEvenOutputs(2000)).toEqual([20, 50]);
    expect(profit(30, 2000)).toBe(400);
  });

  it('reproduces F02 example 3: one break-even output at the largest fixed cost, none above it', () => {
    expect(discriminant(2450)).toBe(0);
    expect(breakEvenOutputs(2450)).toEqual([35]);
    expect(discriminant(3000)).toBe(-4400);
    expect(breakEvenOutputs(3000)).toEqual([]);
  });

  it('gives outputs where profit really is zero, for every slider position', () => {
    for (let f = 0; f <= 3500; f += 50) {
      for (const q of breakEvenOutputs(f)) expect(Math.abs(profit(q, f))).toBeLessThan(1e-6);
      if (breakEvenOutputs(f).length === 0) expect(profit(35, f)).toBeLessThan(0);
    }
  });
});
