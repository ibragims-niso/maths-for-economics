import { describe, expect, it } from 'vitest';
import {
  arithmeticMeanRate,
  baseIndices,
  DEFAULT_RATES,
  geometricMeanRate,
  indexTicks,
  indexWindow,
} from './ChainBaseGrowth';

const withSliders = (a: number, b: number) => [DEFAULT_RATES[0], a, b, ...DEFAULT_RATES.slice(3)];

describe('ChainBaseGrowth maths', () => {
  it('matches worked example 2 in ST107 (the default view)', () => {
    const levels = baseIndices(DEFAULT_RATES);
    expect(levels[0]).toBe(100);
    expect(levels[2]).toBeCloseTo(97.76, 10);
    expect(levels.at(-1)).toBeCloseTo(114.8055, 4);
    expect(geometricMeanRate(DEFAULT_RATES)).toBeCloseTo(2.3278, 4);
    expect(arithmeticMeanRate(DEFAULT_RATES)).toBeCloseTo(2.4167, 4);
    expect(100 * (1 + arithmeticMeanRate(DEFAULT_RATES) / 100) ** 6).toBeCloseTo(115.4048, 4);
  });

  it('gives the Try it check (2020 at −10 %, 2021 at +10 %)', () => {
    const rates = withSliders(-10, 10);
    expect(baseIndices(rates).at(-1)).toBeCloseTo(111.9557, 4);
    expect(geometricMeanRate(rates)).toBeCloseTo(1.9, 4);
    expect(arithmeticMeanRate(rates)).toBeCloseTo(2.0833, 4);
    expect(0.9 * 1.1).toBeCloseTo(0.99, 12);
  });

  it('chain indices are ratios of consecutive base indices, and ḡ compounds to the last one', () => {
    for (const [a, b] of [
      [-15, 15],
      [-15, -15],
      [15, 15],
      [0, 0],
      [-6, 8],
    ]) {
      const rates = withSliders(a ?? 0, b ?? 0);
      const levels = baseIndices(rates);
      rates.forEach((r, i) => {
        expect((levels[i + 1] ?? 0) / (levels[i] ?? 1)).toBeCloseTo(1 + r / 100, 12);
      });
      const gm = geometricMeanRate(rates);
      expect(100 * (1 + gm / 100) ** rates.length).toBeCloseTo(levels.at(-1) ?? 0, 9);
      // The arithmetic mean is never below the geometric one, so it overshoots the last index.
      expect(arithmeticMeanRate(rates)).toBeGreaterThan(gm);
    }
  });

  it('keeps everything drawn inside the window for every slider position', () => {
    for (let a = -15; a <= 15; a += 0.5) {
      for (let b = -15; b <= 15; b += 0.5) {
        const rates = withSliders(a, b);
        const levels = baseIndices(rates);
        const amEnd = 100 * (1 + arithmeticMeanRate(rates) / 100) ** rates.length;
        const { lo, hi } = indexWindow([...levels, amEnd]);
        expect(lo).toBeLessThan(Math.min(...levels, amEnd));
        expect(hi).toBeGreaterThan(Math.max(...levels, amEnd));
        const ticks = indexTicks(lo, hi);
        expect(ticks.length).toBeGreaterThanOrEqual(3);
        expect(ticks.length).toBeLessThanOrEqual(7);
        for (const t of ticks) expect(Number.isInteger(t)).toBe(true);
      }
    }
  });
});
