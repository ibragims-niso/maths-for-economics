import { describe, expect, it } from 'vitest';
import {
  characteristicRoots,
  cycleLength,
  firstExit,
  incomePath,
  largestRoot,
  overshoot,
  regime,
  rootsText,
  samuelsonCoefficients,
  VISIBLE,
} from './MultiplierAccelerator';

/** Every slider position: c = 0.1, 0.15, …, 0.95 and v = 0, 0.1, …, 4. */
const GRID: [number, number][] = [];
for (let i = 2; i <= 19; i++) for (let j = 0; j <= 40; j++) GRID.push([i / 20, j / 10]);

describe('MultiplierAccelerator', () => {
  it('reproduces DY02 Example 3 (c = 0.5, v = 1)', () => {
    const path = incomePath(0.5, 1);
    expect(path.slice(0, 10)).toEqual([
      100, 100, 105, 110, 112.5, 112.5, 111.25, 110, 109.375, 109.375,
    ]);
    expect(samuelsonCoefficients(0.5, 1)).toEqual({ k1: 1, k2: 0.5 });
    const roots = characteristicRoots(0.5, 1);
    expect(rootsText(roots)).toBe('0.5 ± 0.5i');
    expect(largestRoot(roots)).toBeCloseTo(Math.sqrt(0.5), 12);
    expect(cycleLength(roots)).toBeCloseTo(8, 9);
    expect(regime(0.5, 1)).toBe('damped cycle');
    // The closed form Y(t) = 110 − 10(√0.5)ᵗ(cos(πt/4) + sin(πt/4)) from Example 3.
    path.forEach((y, t) => {
      const closed =
        110 -
        10 * Math.sqrt(0.5) ** t * (Math.cos((Math.PI * t) / 4) + Math.sin((Math.PI * t) / 4));
      expect(y).toBeCloseTo(closed, 9);
    });
    expect(firstExit(path)).toBeNull();
  });

  it('builds income from consumption and investment period by period', () => {
    for (const [c, v] of GRID) {
      const path = incomePath(c, v);
      const g = (1 - c) * 110;
      // The old equilibrium 100 = G_old/(1 − c) holds with G_old = 100(1 − c).
      for (let t = 2; t < path.length; t++) {
        const consumption = c * (path[t - 1] ?? 0);
        const investment = v * (consumption - c * (path[t - 2] ?? 0));
        const expected = consumption + investment + g;
        expect(Math.abs((path[t] ?? 0) - expected)).toBeLessThan(
          1e-9 * Math.max(1, Math.abs(expected)),
        );
      }
      // 110 is a fixed point: G/(1 − c) with G 10 % higher.
      const { k1, k2 } = samuelsonCoefficients(c, v);
      expect(k1 * 110 - k2 * 110 + g).toBeCloseTo(110, 9);
    }
  });

  it('finds roots that solve r² − c(1 + v)r + cv = 0 and classifies the regimes correctly', () => {
    for (const [c, v] of GRID) {
      const { k1, k2 } = samuelsonCoefficients(c, v);
      const roots = characteristicRoots(c, v);
      if (roots.kind === 'real') {
        for (const r of [roots.r1, roots.r2]) expect(r * r - k1 * r + k2).toBeCloseTo(0, 9);
      } else if (roots.kind === 'repeated') {
        expect(roots.r * roots.r - k1 * roots.r + k2).toBeCloseTo(0, 9);
      } else {
        // (re + i·im)² − k₁(re + i·im) + k₂ = 0: real and imaginary parts.
        expect(roots.re ** 2 - roots.im ** 2 - k1 * roots.re + k2).toBeCloseTo(0, 9);
        expect(2 * roots.re * roots.im - k1 * roots.im).toBeCloseTo(0, 9);
        expect(roots.modulus).toBeCloseTo(Math.hypot(roots.re, roots.im), 9);
      }
      // Samuelson: complex exactly when c < 4v/(1 + v)²; settles exactly when cv < 1.
      if (Math.abs(c - (4 * v) / (1 + v) ** 2) > 1e-6) {
        expect(roots.kind === 'complex').toBe(c < (4 * v) / (1 + v) ** 2);
      }
      if (Math.abs(c * v - 1) > 1e-6) expect(largestRoot(roots) < 1).toBe(c * v < 1);
    }
    expect(regime(0.8, 0.1)).toBe('monotone convergence');
    expect(regime(0.5, 2)).toBe('regular cycle');
    expect(regime(0.5, 3)).toBe('explosive cycle');
    expect(regime(0.9, 3)).toBe('explosive growth');
    expect(characteristicRoots(0.75, 3)).toEqual({ kind: 'repeated', r: 1.5 });
  });

  it('draws what the caption says for every slider position', () => {
    for (const [c, v] of GRID) {
      const path = incomePath(c, v);
      const kind = regime(c, v);
      if (kind === 'monotone convergence') {
        // Climbs to 110 without passing it, and stays on the graph.
        for (let t = 1; t < path.length; t++) {
          expect(path[t] ?? 0).toBeGreaterThanOrEqual((path[t - 1] ?? 0) - 1e-9);
          expect(path[t] ?? 0).toBeLessThanOrEqual(110 + 1e-9);
        }
        expect(firstExit(path)).toBeNull();
      }
      if (kind === 'damped cycle') {
        // Above the line at least once; the caption says when the waves are too small to see.
        expect(overshoot(path)).toBeGreaterThan(-1e-6);
        if (c === 0.5 && v === 1) expect(overshoot(path)).toBeGreaterThanOrEqual(VISIBLE);
        expect(firstExit(path)).toBeNull();
      }
      if (kind === 'explosive growth') {
        for (let t = 1; t < path.length; t++) {
          expect(path[t] ?? 0).toBeGreaterThanOrEqual((path[t - 1] ?? 0) - 1e-9);
        }
        expect(firstExit(path)).not.toBeNull();
      }
    }
  });
});
