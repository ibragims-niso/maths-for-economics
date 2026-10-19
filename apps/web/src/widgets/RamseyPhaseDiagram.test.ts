import { describe, expect, it } from 'vitest';
import {
  frameFor,
  goldenRule,
  kDotZero,
  mpk,
  ramseyFlow,
  regionArrows,
  saddleConsumption,
  saddlePath,
  stableRoot,
  steadyState,
} from './RamseyPhaseDiagram';

describe('RamseyPhaseDiagram maths', () => {
  it('matches DO04 Example 1 (ρ = 4 %, δ = 6 %: k* = 8, c* = 1.84, golden rule 13.66)', () => {
    const ss = steadyState(0.04, 0.06);
    expect(ss.k).toBeCloseTo(8, 9);
    expect(ss.c).toBeCloseTo(1.84, 9);
    expect(mpk(ss.k)).toBeCloseTo(0.1, 12);
    const gold = goldenRule(0.06);
    expect(gold.k).toBeCloseTo(13.66, 2);
    expect(gold.c).toBeCloseTo(1.91, 2);
    // A rise in ρ to 5 % lowers k* to 6.93.
    expect(steadyState(0.05, 0.06).k).toBeCloseTo(6.93, 2);
  });

  it('puts the golden rule at the top of the k̇ = 0 curve and k* to its left', () => {
    for (const delta of [0.02, 0.06, 0.1]) {
      const gold = goldenRule(delta);
      const h = 1e-3 * gold.k;
      expect(kDotZero(gold.k, delta)).toBeGreaterThan(kDotZero(gold.k - h, delta));
      expect(kDotZero(gold.k, delta)).toBeGreaterThan(kDotZero(gold.k + h, delta));
      for (const rho of [0.02, 0.06, 0.1]) {
        const ss = steadyState(rho, delta);
        expect(ss.k).toBeLessThan(gold.k);
        // Both rates of change are zero at the steady state.
        const [kd, cd] = ramseyFlow(rho, delta, [ss.k, ss.c]);
        expect(Math.abs(kd)).toBeLessThan(1e-12);
        expect(Math.abs(cd)).toBeLessThan(1e-12);
      }
    }
  });

  it('matches DO04 Example 3: eigenvalues 0.1038 and −0.0738, slope 0.1038, c(0) ≈ 1.62 at k = 6', () => {
    const { lambda, slope } = stableRoot(0.04, 0.06);
    expect(lambda).toBeCloseTo(-0.0738, 4);
    expect(slope).toBeCloseTo(0.1038, 4);
    // The two eigenvalues add up to the trace ρ − n = 0.03.
    expect(0.03 - lambda).toBeCloseTo(0.1038, 4);
    const f = frameFor(0.06);
    const path = saddlePath(0.04, 0.06, 1e-3 * f.xMax, 1.2 * f.xMax);
    const c0 = saddleConsumption(path, 6);
    expect(c0).toBeCloseTo(1.62, 2);
    // The straight-line approximation of Example 3 is close: 1.84 − 0.1038 × 2 = 1.63.
    expect(Math.abs(c0 - (1.84 - 2 * slope))).toBeLessThan(0.02);
  });

  it('gives a path that really converges: start on it, run time forwards, reach the steady state', () => {
    for (const [rho, delta] of [
      [0.04, 0.06],
      [0.02, 0.02],
      [0.1, 0.1],
    ] as const) {
      const ss = steadyState(rho, delta);
      const f = frameFor(delta);
      const path = saddlePath(rho, delta, 1e-3 * f.xMax, 1.2 * f.xMax);
      for (const share of [0.5, 1.4]) {
        const k0 = share * ss.k;
        let x: [number, number] = [k0, saddleConsumption(path, k0)];
        // Euler steps forward for 1.5/|λ| years; the gap must shrink (not blow up).
        const gap0 = Math.abs(x[0] - ss.k);
        const h = 0.01;
        const steps = Math.round(1.5 / -stableRoot(rho, delta).lambda / h);
        for (let i = 0; i < steps; i++) {
          const v = ramseyFlow(rho, delta, x);
          x = [x[0] + h * v[0], x[1] + h * v[1]];
        }
        expect(Math.abs(x[0] - ss.k)).toBeLessThan(0.6 * gap0);
        // A path that starts 5 % above the saddle path loses its capital instead.
        let y: [number, number] = [k0, 1.05 * saddleConsumption(path, k0)];
        for (let i = 0; i < 20000 && y[0] > 0.01 * ss.k; i++) {
          const v = ramseyFlow(rho, delta, y);
          y = [y[0] + h * v[0], y[1] + h * v[1]];
        }
        expect(y[0]).toBeLessThan(0.5 * ss.k);
      }
    }
  });

  it('draws arrows whose directions agree with the signs of k̇ and ċ in each region', () => {
    const f = frameFor(0.06);
    const path = saddlePath(0.04, 0.06, 1e-3 * f.xMax, 1.2 * f.xMax);
    const dirs = regionArrows(0.04, 0.06, f, path).map((a) => a.dir.join(','));
    // Above the hump on the left: k falls, c rises; below: both rise; upper right: both fall;
    // lower right: k rises, c falls.
    expect(dirs).toEqual(['-1,1', '1,1', '-1,-1', '1,-1']);
  });
});
