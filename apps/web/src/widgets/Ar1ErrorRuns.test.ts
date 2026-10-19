import { describe, expect, it } from 'vitest';
import {
  describeRuns,
  durbinWatson,
  errorSeries,
  SHOCKS,
  START_RHO,
  signChanges,
} from './Ar1ErrorRuns';
import { fmt } from './kit';

/** Seeded uniform numbers (mulberry32), the generator the shocks were drawn with. */
function uniform(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('ar1-error-runs', () => {
  it('stores the 40 shocks drawn from seed 52 (Box–Muller, rounded to 2 decimals)', () => {
    const next = uniform(52);
    const drawn = Array.from({ length: 40 }, () => {
      const z = Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
      return Math.round(z * 100) / 100;
    });
    expect([...SHOCKS]).toEqual(drawn);
    // Roughly standard normal: mean near 0, standard deviation near 1.
    const mean = SHOCKS.reduce((a, b) => a + b, 0) / SHOCKS.length;
    const sd = Math.sqrt(SHOCKS.reduce((s, v) => s + (v - mean) ** 2, 0) / SHOCKS.length);
    expect(Math.abs(mean)).toBeLessThan(0.1);
    expect(Math.abs(sd - 1)).toBeLessThan(0.05);
  });

  it('builds uₜ = ρ·uₜ₋₁ + εₜ, and with ρ = 0 the errors are the shocks', () => {
    expect(errorSeries(0)).toEqual([...SHOCKS]);
    const u = errorSeries(0.5, [1, 2, -1]);
    expect(u).toEqual([1, 2.5, 0.25]);
  });

  it('computes d like EM04, Example 2: residuals 2, 3, 1, −1, −3, −2 give 14/28 = 0.5', () => {
    const e = [2, 3, 1, -1, -3, -2];
    expect(durbinWatson(e)).toBeCloseTo(0.5, 12);
    expect(1 - durbinWatson(e) / 2).toBeCloseTo(0.75, 12);
    expect(signChanges(e)).toBe(1);
    // The identity d = 2 − 2Σeₜeₜ₋₁/Σe² − (e₁² + eₙ²)/Σe² behind d ≈ 2(1 − ρ̂).
    const ss = 28;
    const lag = e.slice(1).reduce((s, v, i) => s + v * (e[i] ?? 0), 0);
    expect(lag).toBe(17);
    expect(2 - (2 * lag) / ss - (4 + 4) / ss).toBeCloseTo(0.5, 12);
  });

  it('gives the values quoted in the Try it text', () => {
    expect(START_RHO).toBe(0.75);
    const at = (rho: number) => {
      const u = errorSeries(rho);
      return { d: fmt(durbinWatson(u)), changes: signChanges(u) };
    };
    expect(at(0.75)).toEqual({ d: '0.48', changes: 7 });
    expect(at(0)).toEqual({ d: '2.03', changes: 21 });
    expect(at(-0.75)).toEqual({ d: '3.51', changes: 31 });
    expect(at(0.9)).toEqual({ d: '0.23', changes: 5 });
    expect(fmt(2 * (1 - 0.75))).toBe('0.5');
    expect(fmt(2 * (1 + 0.75))).toBe('3.5');
  });

  it('tracks 2(1 − ρ) and falls as ρ rises, across the whole slider', () => {
    let last = Number.POSITIVE_INFINITY;
    for (let k = -18; k <= 18; k++) {
      const rho = k / 20;
      const d = durbinWatson(errorSeries(rho));
      expect(d).toBeLessThan(last);
      expect(Math.abs(d - 2 * (1 - rho))).toBeLessThan(0.2);
      last = d;
      // The series stays inside the plotted window of ±6.
      for (const v of errorSeries(rho)) expect(Math.abs(v)).toBeLessThan(6);
    }
  });

  it('explains the runs in the caption with the current numbers', () => {
    const start = describeRuns(0.75);
    expect(start).toContain('change sign 7 times in 39 steps');
    expect(start).toContain('long runs of the same sign');
    expect(start).toContain('d = 0.48 is well below 2');
    expect(start).toContain('2(1 − ρ) = 0.5.');
    expect(describeRuns(0)).toContain('d = 2.03 is close to 2');
    expect(describeRuns(-0.75)).toContain('d = 3.51 is above 2');
  });
});
