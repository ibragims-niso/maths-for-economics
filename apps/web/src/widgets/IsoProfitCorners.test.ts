import { describe, expect, it } from 'vitest';
import {
  binding,
  describeLevel,
  describeOptimum,
  LIMITS,
  optimum,
  profit,
  regionCorners,
} from './IsoProfitCorners';

describe('IsoProfitCorners', () => {
  it('has the five corners of OP02 Example 2, each inside every machine limit', () => {
    const corners = regionCorners();
    const sorted = [...corners].sort((m, n) => m[0] - n[0] || m[1] - n[1]);
    expect(sorted).toEqual([
      [0, 0],
      [0, 20],
      [6, 18],
      [16, 8],
      [20, 0],
    ]);
    for (const [x, y] of corners) {
      for (const k of LIMITS) expect(k.a * x + k.b * y).toBeLessThanOrEqual(k.c);
    }
  });

  it('reproduces Example 2: best plan (16, 8), profit 640, cutting and assembly binding, 20 finishing hours spare', () => {
    const best = optimum(30);
    expect(best.corners).toEqual([[16, 8]]);
    expect(best.profit).toBe(640);
    expect(binding(best.corners)).toEqual(['cutting', 'assembly']);
    const finishing = LIMITS[2];
    expect(finishing && finishing.c - (finishing.a * 16 + finishing.b * 8)).toBe(20);
    expect(optimum(45)).toEqual({ corners: [[20, 0]], profit: 900 });
  });

  it('finds the same maximum as a search over a fine grid of feasible plans', () => {
    for (const p of [5, 6, 7, 15, 20, 25, 30, 40, 41, 60]) {
      let best = 0;
      for (let x = 0; x <= 30; x += 0.5) {
        for (let y = 0; y <= 30; y += 0.5) {
          if (LIMITS.every((k) => k.a * x + k.b * y <= k.c))
            best = Math.max(best, profit(p, [x, y]));
        }
      }
      expect(optimum(p).profit).toBeCloseTo(best, 9);
    }
  });

  it('reports multiple optima when the iso-profit line is parallel to an edge', () => {
    expect(optimum(20).corners).toHaveLength(2);
    expect(optimum(20).profit).toBe(480);
    expect(binding(optimum(20).corners)).toEqual(['assembly']);
    expect(optimum(40).profit).toBe(800);
    expect(binding(optimum(40).corners)).toEqual(['cutting']);
    expect(describeOptimum(20)).toMatch(/multiple optima/);
    expect(describeOptimum(6)).toMatch(/\(0, 20\)/);
    expect(describeOptimum(7)).toMatch(/\(6, 18\)/);
  });

  it('says whether the dashed line misses, touches or crosses the region', () => {
    expect(describeLevel(30, 640)).toMatch(/just touches/);
    expect(describeLevel(30, 660)).toMatch(/misses/);
    expect(describeLevel(30, 400)).toMatch(/slide outwards/);
  });
});
