import { describe, expect, it } from 'vitest';
import {
  characteristicRoots,
  cyclePeriod,
  envelopeAt,
  explainRegime,
  gapAt,
  regime,
  rootsText,
} from './SecondOrderDamping';

/** y(T) for y″ + a₁y′ + a₂y = 0 from y(0) = 1, y′(0) = 0, by small semi-implicit Euler steps. */
function simulate(a1: number, a2: number, T: number): number {
  const h = 0.0001;
  let y = 1;
  let v = 0;
  for (let k = 0; k < Math.round(T / h); k++) {
    v += h * (-a1 * v - a2 * y);
    y += h * v;
  }
  return y;
}

describe('SecondOrderDamping', () => {
  it('reproduces DY04 Example 3 (a₁ = 1, a₂ = 4.25: roots −0.5 ± 2i, period π)', () => {
    expect(characteristicRoots(1, 4.25)).toEqual({ kind: 'complex', h: -0.5, k: 2 });
    expect(rootsText(1, 4.25)).toBe('−0.5 ± 2i');
    expect(regime(1, 4.25)).toBe('damped oscillation');
    expect(cyclePeriod(1, 4.25)).toBeCloseTo(Math.PI, 12);
    // Example 3's price starts 3 above P* = 20 at rest: lowest at t = π/2, 20 − 3e^(−π/4) = 18.63.
    expect(20 + 3 * gapAt(1, 4.25, Math.PI / 2)).toBeCloseTo(18.63, 2);
    expect(20 + 3 * gapAt(1, 4.25, Math.PI)).toBeCloseTo(20.62, 2);
  });

  it('reproduces DY04 Examples 1 and 2 (roots −1, −2 and −1, −4: overdamped)', () => {
    expect(characteristicRoots(3, 2)).toEqual({ kind: 'real', r1: -1, r2: -2 });
    expect(rootsText(3, 2)).toBe('−1 and −2');
    expect(regime(3, 2)).toBe('overdamped');
    expect(rootsText(5, 4)).toBe('−1 and −4');
    expect(cyclePeriod(3, 2)).toBeNull();
  });

  it('names every regime from the roots', () => {
    expect(regime(2, 1)).toBe('critically damped');
    expect(rootsText(4, 4)).toBe('−2 (twice)');
    expect(regime(0, 4)).toBe('steady oscillation');
    expect(rootsText(0, 4)).toBe('± 2i');
    expect(regime(-0.5, 4)).toBe('explosive oscillation');
    expect(regime(1, -1)).toBe('explosive');
    expect(regime(-3, 2)).toBe('explosive');
    expect(regime(2, 0)).toBe('no pull back');
    expect(explainRegime(1, 4.25)).toContain('both positive');
    expect(explainRegime(-0.5, 4)).toContain('not both positive');
  });

  it('solves the equation: the formula agrees with a numerical simulation in every regime', () => {
    const cases: [number, number][] = [
      [1, 4.25],
      [3, 2],
      [2, 1],
      [0, 4],
      [-0.5, 2],
      [1, -1],
      [5, 6],
      [0.25, 0.75],
    ];
    for (const [a1, a2] of cases) {
      for (const t of [1, 4, 10]) {
        const exact = gapAt(a1, a2, t);
        expect(Math.abs(simulate(a1, a2, t) - exact)).toBeLessThan(
          2e-3 * Math.max(1, Math.abs(exact)),
        );
      }
    }
  });

  it('keeps a cycling path between the envelope curves, touching them', () => {
    for (const [a1, a2] of [
      [1, 4.25],
      [0, 4],
      [-0.5, 2],
      [0.25, 0.75],
    ] as [number, number][]) {
      let touch = 0;
      for (let t = 0; t <= 10; t += 0.001) {
        const env = envelopeAt(a1, a2, t) ?? 0;
        expect(Math.abs(gapAt(a1, a2, t))).toBeLessThanOrEqual(env + 1e-12);
        touch = Math.max(touch, Math.abs(gapAt(a1, a2, t)) / env);
      }
      expect(touch).toBeGreaterThan(0.9999);
    }
    expect(envelopeAt(3, 2, 1)).toBeNull();
  });

  it('is stable exactly when a₁ > 0 and a₂ > 0', () => {
    for (let a1 = -1; a1 <= 5; a1 += 0.25) {
      for (let a2 = -1; a2 <= 6; a2 += 0.25) {
        const roots = characteristicRoots(a1, a2);
        const largestRealPart =
          roots.kind === 'real' ? roots.r1 : roots.kind === 'repeated' ? roots.r : roots.h;
        expect(largestRealPart < -1e-9).toBe(a1 > 1e-9 && a2 > 1e-9);
      }
    }
  });
});
