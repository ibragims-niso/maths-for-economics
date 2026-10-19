import { describe, expect, it } from 'vitest';
import {
  ar1Autocorrelation,
  ar1Mean,
  ar1Path,
  ar1Variance,
  between,
  DRAWS,
  isUnitRoot,
  PERIODS,
  SIGMA,
  START,
  verdict,
  verticalFrame,
} from './Ar1ShockPath';

describe('Ar1ShockPath', () => {
  it('reproduces EM06 Example 1 (c = 1.2, φ = 0.6, σ = 1.2: mean 3, variance 2.25, ρ₁ = 0.6)', () => {
    expect(ar1Mean(0.6, 1.2)).toBeCloseTo(3, 12);
    expect(ar1Variance(0.6)).toBeCloseTo(2.25, 12);
    expect(ar1Autocorrelation(0.6)).toBe(0.6);
    expect(ar1Autocorrelation(0.6, 2)).toBeCloseTo(0.36, 12);
    expect(ar1Autocorrelation(0.6, 3)).toBeCloseTo(0.216, 12);
    // The Try it check at φ = 0.95: mean 24, variance 14.77.
    expect(ar1Mean(0.95, 1.2)).toBeCloseTo(24, 9);
    expect(ar1Variance(0.95)).toBeCloseTo(14.77, 2);
    expect(ar1Mean(-0.95, 1.2)).toBeCloseTo(0.62, 2);
  });

  it('ends the path where the Try it text says', () => {
    expect(ar1Path(0.6, 1.2)[PERIODS]).toBeCloseTo(3.65, 2);
    expect(ar1Path(0.95, 1.2)[PERIODS]).toBeCloseTo(22.63, 2);
    expect(ar1Path(1, 0)[PERIODS]).toBeCloseTo(1.61, 2);
    expect(ar1Path(1, 1.2)[PERIODS]).toBeCloseTo(73.61, 2);
  });

  it('builds the path from y(t) = c + φ·y(t − 1) + σ·z(t), and the mean solves μ = c + φμ', () => {
    for (let phi = -0.95; phi <= 1.001; phi += 0.05) {
      for (const c of [0, 0.5, 1.2, 2]) {
        const path = ar1Path(phi, c);
        expect(path.length).toBe(PERIODS + 1);
        expect(path[0]).toBe(START);
        path.slice(1).forEach((y, t) => {
          expect(y).toBeCloseTo(c + phi * (path[t] ?? 0) + SIGMA * (DRAWS[t] ?? 0), 9);
        });
        const mean = ar1Mean(phi, c);
        if (mean !== null) expect(c + phi * mean).toBeCloseTo(mean, 9);
      }
    }
  });

  it('has a variance equal to the sum of all past shocks’ contributions σ²·φ^{2j}', () => {
    for (const phi of [-0.9, -0.3, 0, 0.6, 0.95]) {
      let sum = 0;
      for (let j = 0; j < 2000; j++) sum += SIGMA ** 2 * phi ** (2 * j);
      expect(ar1Variance(phi)).toBeCloseTo(sum, 9);
    }
  });

  it('treats φ = 1 as a random walk: no mean, no variance, the shocks add up', () => {
    expect(isUnitRoot(1)).toBe(true);
    expect(isUnitRoot(0.95)).toBe(false);
    expect(ar1Mean(1, 1.2)).toBeNull();
    expect(ar1Variance(1)).toBeNull();
    expect(ar1Autocorrelation(1)).toBeNull();
    const walk = ar1Path(1, 0);
    const total = DRAWS.reduce((s, z) => s + SIGMA * z, 0);
    expect(walk[PERIODS]).toBeCloseTo(START + total, 9);
    // Differencing the walk with drift gives back c + σz(t), a stationary series.
    const drift = ar1Path(1, 0.5);
    drift.slice(1).forEach((y, t) => {
      expect(y - (drift[t] ?? 0)).toBeCloseTo(0.5 + SIGMA * (DRAWS[t] ?? 0), 9);
    });
    expect(verdict(1)).toMatch(/unit root/);
    expect(verdict(-0.5)).toMatch(/zig-zags/);
  });

  it('uses fixed shocks with sample mean near 0 and standard deviation near 1', () => {
    expect(DRAWS.length).toBe(60);
    const m = DRAWS.reduce((s, z) => s + z, 0) / DRAWS.length;
    const sd = Math.sqrt(DRAWS.reduce((s, z) => s + (z - m) ** 2, 0) / (DRAWS.length - 1));
    expect(Math.abs(m)).toBeLessThan(0.05);
    expect(Math.abs(sd - 1)).toBeLessThan(0.05);
  });

  it('joins the periods with straight lines and frames every value with round ticks', () => {
    const path = ar1Path(0.6, 1.2);
    expect(between(path, 5)).toBeCloseTo(path[5] ?? 0, 12);
    expect(between(path, 5.5)).toBeCloseTo(((path[5] ?? 0) + (path[6] ?? 0)) / 2, 12);
    expect(between(path, PERIODS)).toBeCloseTo(path[PERIODS] ?? 0, 12);
    for (let phi = -0.95; phi <= 1.001; phi += 0.05) {
      for (const c of [0, 1.2, 2]) {
        const values = [...ar1Path(phi, c), 0];
        const { yMin, yMax, ticks } = verticalFrame(values);
        expect(yMin).toBeLessThanOrEqual(Math.min(...values));
        expect(yMax).toBeGreaterThanOrEqual(Math.max(...values));
        expect(ticks.length).toBeLessThanOrEqual(7);
        expect(ticks.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
