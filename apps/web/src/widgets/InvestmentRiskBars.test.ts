import { describe, expect, it } from 'vitest';
import { describeRisk, expectation, fitNormal, goodChance, variance } from './InvestmentRiskBars';

describe('InvestmentRiskBars', () => {
  it('reproduces ST103 Examples 1 and 2: −10 %, 5 %, 20 % with 0.2, 0.5, 0.3', () => {
    const xs = [-10, 5, 20];
    const ps = [0.2, 0.5, goodChance(0.2, 0.5)];
    expect(ps[2]).toBe(0.3);
    expect(expectation(xs, ps)).toBeCloseTo(6.5, 10);
    expect(variance(xs, ps)).toBeCloseTo(110.25, 10);
    expect(Math.sqrt(variance(xs, ps))).toBeCloseTo(10.5, 10);
  });

  it('agrees with the definition Var(X) = Σ (x − μ)² p(x) on every slider position', () => {
    for (let b = 0; b <= 20; b++) {
      for (let n = 0; n <= 20 - b; n++) {
        for (const good of [10, 20, 35]) {
          const bad = b / 20;
          const normal = fitNormal(bad, n / 20);
          const ps = [bad, normal, goodChance(bad, normal)];
          expect(ps.reduce((s, p) => s + p, 0)).toBeCloseTo(1, 12);
          const xs = [-10, 5, good];
          const mu = expectation(xs, ps);
          const direct = xs.reduce((s, x, k) => s + (x - mu) ** 2 * (ps[k] ?? 0), 0);
          expect(variance(xs, ps)).toBeCloseTo(direct, 9);
          expect(variance(xs, ps)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('keeps the probabilities adding up to 1 when the bad-year chance rises', () => {
    expect(fitNormal(0.7, 0.5)).toBe(0.3);
    expect(goodChance(0.7, fitNormal(0.7, 0.5))).toBe(0);
    expect(fitNormal(0.2, 0.5)).toBe(0.5);
  });

  it('a sure outcome has no risk', () => {
    expect(variance([-10, 5, 20], [0, 1, 0])).toBe(0);
    expect(describeRisk(5, 0)).toMatch(/no risk/);
    expect(describeRisk(6.5, 10.5)).toContain('10.5');
  });
});
