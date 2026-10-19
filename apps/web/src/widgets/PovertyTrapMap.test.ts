import { describe, expect, it } from 'vitest';
import {
  capitalPath,
  explainBasins,
  isStable,
  longRunSteadyState,
  mapSlope,
  netInvestment,
  nextCapital,
  STEPS,
  staircase,
  steadyStates,
} from './PovertyTrapMap';

describe('PovertyTrapMap', () => {
  it('reproduces DY06 Example 3 (steady states 2, 5, 10; slopes 0.52, 1.3, 0.2)', () => {
    const states = steadyStates(0);
    expect(states).toHaveLength(3);
    for (const [i, k] of [2, 5, 10].entries()) expect(states[i]).toBeCloseTo(k, 9);
    expect(mapSlope(2)).toBeCloseTo(0.52, 12);
    expect(mapSlope(5)).toBeCloseTo(1.3, 12);
    expect(mapSlope(10)).toBeCloseTo(0.2, 12);
    expect(states.map(isStable)).toEqual([true, false, true]);
    expect(nextCapital(4, 0)).toBeCloseTo(3.76, 12);
    expect(nextCapital(6, 0)).toBeCloseTo(6.32, 12);
    // The widget's default start, 4: after 20 steps the economy is at 2 (to 2 decimals).
    const path = capitalPath(4, 0);
    expect(path).toHaveLength(STEPS + 1);
    expect(path[STEPS]).toBeCloseTo(2, 2);
    expect(longRunSteadyState(4, 0)).toBeCloseTo(2, 9);
    expect(longRunSteadyState(6, 0)).toBeCloseTo(10, 9);
    expect(capitalPath(6, 0)[STEPS]).toBeCloseTo(10, 2);
    // Starting exactly at the unstable steady state, the economy stays there.
    expect(longRunSteadyState(5, 0)).toBe(5);
  });

  it('agrees with a numerical derivative and finds every crossing with the 45° line', () => {
    for (let z = -0.8; z <= 0.4 + 1e-9; z += 0.05) {
      for (let k = 0; k <= 12; k += 0.25) {
        const h = 1e-5;
        const numeric = (nextCapital(k + h, z) - nextCapital(k - h, z)) / (2 * h);
        expect(numeric).toBeCloseTo(mapSlope(k), 6);
      }
      const states = steadyStates(z);
      expect(states.length === 1 || states.length === 3).toBe(true);
      for (const k of states) expect(Math.abs(netInvestment(k, z))).toBeLessThan(1e-9);
      // Steady states alternate: stable, unstable, stable.
      expect(states.map(isStable)).toEqual(states.length === 1 ? [true] : [true, false, true]);
      // Capital stays positive and inside the graph from every start the slider allows.
      for (let k0 = 1; k0 <= 11; k0 += 0.5) {
        for (const k of capitalPath(k0, z)) {
          expect(k).toBeGreaterThan(0);
          expect(k).toBeLessThanOrEqual(12);
        }
      }
      expect(explainBasins(z)).not.toMatch(/NaN|undefined/);
    }
  });

  it('moves the equilibria with the boost: the trap vanishes when z exceeds 8/27', () => {
    // g has a local minimum −8/27 at k = 10/3 and a local maximum 0.72 at k = 8.
    expect(netInvestment(10 / 3, 0)).toBeCloseTo(-8 / 27, 12);
    expect(netInvestment(8, 0)).toBeCloseTo(0.72, 12);
    expect(steadyStates(0.25)).toHaveLength(3);
    expect(steadyStates(0.3)).toHaveLength(1);
    expect(steadyStates(0.3)[0]).toBeGreaterThan(10);
    expect(explainBasins(0.3)).toContain('trap has disappeared');
    expect(steadyStates(-0.7)).toHaveLength(3);
    expect(steadyStates(-0.75)).toHaveLength(1);
    expect(steadyStates(-0.75)[0]).toBeLessThan(2);
  });

  it('draws the staircase between the curve and the 45° line', () => {
    const path = capitalPath(4, 0, 3);
    const corners = staircase(path);
    expect(corners[0]).toEqual([4, 0]);
    expect(corners).toHaveLength(1 + 2 * 3);
    for (let t = 1; t <= 3; t++) {
      expect(corners[2 * t - 1]).toEqual([path[t - 1], path[t]]);
      expect(corners[2 * t]).toEqual([path[t], path[t]]);
    }
  });
});
