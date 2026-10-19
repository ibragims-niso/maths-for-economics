import { describe, expect, it } from 'vitest';
import {
  bestCost,
  bestPath,
  explainPaths,
  T,
  TARGET,
  trialCost,
  trialPath,
} from './AdjustmentCostPaths';

/** ∫₀ᵀ (ẋ² + r·x²) dt of a path, with ẋ from a central difference and Simpson's rule. */
function numericCost(path: (t: number) => number, r: number, from = 0): number {
  const n = 4000;
  const h = (T - from) / n;
  const d = 1e-6;
  const f = (t: number) => {
    const slope =
      (path(Math.min(T, t + d)) - path(Math.max(0, t - d))) /
      (Math.min(T, t + d) - Math.max(0, t - d));
    return slope ** 2 + r * path(t) ** 2;
  };
  let s = f(from) + f(T);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(from + i * h);
  return (s * h) / 3;
}

describe('AdjustmentCostPaths', () => {
  it('reproduces DO01 Example 2 (b/a = 1: x(1) = 3.24, costs 103.73 and 116.67, extra 12.94)', () => {
    expect(bestPath(1, 1)).toBeCloseTo(3.2403, 4);
    expect(bestCost(1)).toBeCloseTo(103.7315, 4);
    expect(trialCost(1, 1)).toBeCloseTo(116.6667, 4);
    expect(trialCost(1, 1) - bestCost(1)).toBeCloseTo(12.9352, 4);
  });

  it('meets both fixed ends and solves x″ = r·x', () => {
    for (const r of [0, 0.25, 1, 2.5, 4]) {
      expect(bestPath(r, 0)).toBeCloseTo(0, 12);
      expect(bestPath(r, T)).toBeCloseTo(TARGET, 10);
      for (const t of [0.3, 1, 1.7]) {
        const h = 1e-4;
        const second = (bestPath(r, t + h) - 2 * bestPath(r, t) + bestPath(r, t - h)) / h ** 2;
        expect(Math.abs(second - r * bestPath(r, t))).toBeLessThan(1e-4 * Math.max(1, r * 10));
      }
    }
    for (const p of [0.75, 1, 2, 4]) {
      expect(trialPath(p, 0)).toBe(0);
      expect(trialPath(p, T)).toBe(TARGET);
    }
  });

  it('gives the costs that numerical integration gives', () => {
    for (const r of [0, 1, 2.5, 4]) {
      expect(Math.abs(bestCost(r) - numericCost((t) => bestPath(r, t), r))).toBeLessThan(1e-3);
      for (const p of [1, 1.5, 2.25, 4]) {
        expect(Math.abs(trialCost(p, r) - numericCost((t) => trialPath(p, t), r))).toBeLessThan(
          1e-3,
        );
      }
    }
  });

  it('never lets a trial path beat the Euler–Lagrange path', () => {
    for (let r = 0; r <= 4; r += 0.25) {
      for (let p = 0.75; p <= 4.0001; p += 0.05) {
        expect(trialCost(p, r)).toBeGreaterThanOrEqual(bestCost(r) - 1e-9);
      }
    }
    // With no running cost the straight line (p = 1) is the best path itself.
    expect(trialCost(1, 0)).toBeCloseTo(bestCost(0), 12);
    expect(bestCost(0)).toBe(50);
  });

  it('has its smallest extra cost near p = 1.7 when b/a = 1', () => {
    let best = { p: 0, extra: Number.POSITIVE_INFINITY };
    for (let i = 0; i <= 65; i++) {
      const p = Math.round((0.75 + 0.05 * i) * 100) / 100;
      const extra = trialCost(p, 1) - bestCost(1);
      if (extra < best.extra) best = { p, extra };
    }
    expect(best.p).toBe(1.7);
    expect(best.extra).toBeCloseTo(1.93, 2);
  });

  it('explains the shape and the verdict', () => {
    expect(explainPaths(1, 0)).toContain('straight line');
    expect(explainPaths(1, 0)).toContain('is the best path');
    expect(explainPaths(1, 1)).toContain('builds up too early');
    expect(explainPaths(4, 1)).toContain('waits too long');
    expect(explainPaths(1.7, 1)).toContain('within 2 %');
    expect(explainPaths(3, 0)).toContain('late burst');
    expect(explainPaths(0.75, 0)).toContain('early burst');
  });
});
