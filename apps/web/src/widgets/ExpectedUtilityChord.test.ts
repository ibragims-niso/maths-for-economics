import { describe, expect, it } from 'vitest';
import {
  crraInverse,
  crraUtility,
  describeAttitude,
  gamble,
  scaledUtility,
  utilityName,
  WEALTH,
} from './ExpectedUtilityChord';

describe('ExpectedUtilityChord maths', () => {
  it('matches worked example 1 in SP02 and the default view (40,000 or 90,000, equally likely)', () => {
    const sqrt = gamble(WEALTH, 50, 0.5, 0.5);
    expect(sqrt.expected * 1000).toBeCloseTo(65000, 6);
    expect(sqrt.ce * 1000).toBeCloseTo(62500, 6);
    expect(sqrt.premium * 1000).toBeCloseTo(2500, 6);
    const log = gamble(WEALTH, 50, 0.5, 1);
    expect(log.ce * 1000).toBeCloseTo(60000, 6);
    expect(log.premium * 1000).toBeCloseTo(5000, 6);
  });

  it('matches worked example 2 (p = 0.04) and worked example 3 (γ = 2, 40,000 or 60,000)', () => {
    const flood = gamble(WEALTH, 50, 0.04, 0.5);
    expect(flood.expected * 1000).toBeCloseTo(88000, 6);
    expect(flood.ce * 1000).toBeCloseTo(87616, 6);
    expect(flood.premium * 1000).toBeCloseTo(384, 6);
    expect((WEALTH - flood.ce) * 1000).toBeCloseTo(2384, 6);
    expect((WEALTH - gamble(WEALTH, 50, 0.04, 1).ce) * 1000).toBeCloseTo(2872.51, 2);
    const job = gamble(60, 20, 0.5, 2);
    expect(job.ce * 1000).toBeCloseTo(48000, 6);
  });

  it('gives the Try it checks: risk neutral at γ = 0 and risk-loving at γ = −1', () => {
    const neutral = gamble(WEALTH, 50, 0.5, 0);
    expect(neutral.premium).toBeCloseTo(0, 12);
    const lover = gamble(WEALTH, 60, 0.5, -1);
    expect(lover.expected * 1000).toBeCloseTo(60000, 6);
    expect(Math.round(lover.ce * 1000)).toBe(67082);
    expect(lover.premium).toBeLessThan(0);
  });

  it('finds the same CE from the rescaled curve by bisection, for every slider position', () => {
    for (let gamma = -1; gamma <= 4; gamma += 0.5) {
      for (let loss = 10; loss <= 60; loss += 5) {
        for (const p of [0.01, 0.04, 0.3, 0.5, 0.77, 0.99]) {
          const g = gamble(WEALTH, loss, p, gamma);
          let a = WEALTH - loss;
          let b = WEALTH;
          for (let i = 0; i < 100; i++) {
            const m = (a + b) / 2;
            if (scaledUtility(m, gamma) < g.expectedUtility) a = m;
            else b = m;
          }
          expect(a).toBeCloseTo(g.ce, 6);
          // Jensen: concave curve → CE ≤ E[W]; convex → CE ≥ E[W].
          if (gamma > 0) expect(g.ce).toBeLessThan(g.expected);
          if (gamma < 0) expect(g.ce).toBeGreaterThan(g.expected);
          expect(Number.isFinite(g.ce)).toBe(true);
        }
      }
    }
  });

  it('rescales the curve to run from 0 to 1 and inverts the utility', () => {
    for (const gamma of [-1, 0, 0.5, 1, 2, 4]) {
      expect(scaledUtility(30, gamma)).toBeCloseTo(0, 12);
      expect(scaledUtility(100, gamma)).toBeCloseTo(1, 12);
      expect(crraInverse(crraUtility(57, gamma), gamma)).toBeCloseTo(57, 9);
    }
  });

  it('names the utility and the attitude to risk', () => {
    expect(utilityName(0.5)).toContain('√W');
    expect(utilityName(1)).toContain('ln W');
    expect(describeAttitude(2)).toContain('risk aversion');
    expect(describeAttitude(0)).toContain('risk-neutral');
    expect(describeAttitude(-1)).toContain('risk-loving');
  });
});
