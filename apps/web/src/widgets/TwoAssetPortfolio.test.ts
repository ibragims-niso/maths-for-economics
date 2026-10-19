import { describe, expect, it } from 'vitest';
import {
  averageSd,
  describeDiversification,
  portfolioMean,
  portfolioSd,
  portfolioVariance,
  safestWeight,
} from './TwoAssetPortfolio';

describe('TwoAssetPortfolio', () => {
  it('reproduces ST201 Example 3: w = 0.6, ρ = −0.2', () => {
    expect(portfolioMean(0.6)).toBeCloseTo(7.6, 10);
    expect(portfolioVariance(0.6, -0.2)).toBeCloseTo(140.8, 10);
    expect(portfolioSd(0.6, -0.2)).toBeCloseTo(11.8659, 4);
    expect(averageSd(0.6)).toBeCloseTo(16, 10);
    expect(portfolioSd(0.6, 0)).toBeCloseTo(Math.sqrt(160), 10);
    expect(safestWeight(-0.2)).toBeCloseTo(140 / 580, 10);
  });

  it('agrees with Var(X + Y) computed over four equally likely states, on every slider position', () => {
    for (let k = 0; k <= 20; k++) {
      const w = k / 20;
      for (let r = -10; r <= 10; r++) {
        const rho = r / 10;
        // Two returns with SDs 20 and 10 and correlation ρ, built from two fair ±1 coins.
        const states = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ].map(([z1 = 0, z2 = 0]) => {
          const shares = 20 * z1;
          const bonds = 10 * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);
          return w * shares + (1 - w) * bonds;
        });
        const m = states.reduce((s, x) => s + x, 0) / 4;
        const v = states.reduce((s, x) => s + (x - m) ** 2, 0) / 4;
        expect(portfolioVariance(w, rho)).toBeCloseTo(v, 9);
        // Diversification never adds risk: the SD is at most the weighted average of the SDs.
        expect(portfolioSd(w, rho)).toBeLessThanOrEqual(averageSd(w) + 1e-9);
      }
    }
  });

  it('has no gain with ρ = 1 and can remove all risk with ρ = −1', () => {
    for (let k = 0; k <= 20; k++) {
      expect(portfolioSd(k / 20, 1)).toBeCloseTo(averageSd(k / 20), 9);
    }
    expect(safestWeight(-1)).toBeCloseTo(1 / 3, 12);
    expect(portfolioSd(1 / 3, -1)).toBeCloseTo(0, 6);
    expect(safestWeight(1)).toBe(0);
  });

  it('explains the gain in words', () => {
    expect(describeDiversification(0.6, -0.2)).toContain('4.13');
    expect(describeDiversification(0.6, -0.2)).toContain('w = 0.24');
    expect(describeDiversification(0.6, 1)).toMatch(/no diversification gain/);
    expect(describeDiversification(1, 0.5)).toMatch(/nothing to diversify/);
  });
});
