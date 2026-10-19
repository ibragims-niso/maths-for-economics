import { describe, expect, it } from 'vitest';
import { normalCdf } from './NormalAreaExplorer';
import {
  describeClt,
  populationDensity,
  sampleMeanCdf,
  sampleMeanDensity,
  standardError,
  withinProbability,
} from './SampleMeanClt';

/** Simpson's rule with m (even) strips: area under f between a and b. */
function simpson(f: (x: number) => number, a: number, b: number, m = 20000): number {
  const h = (b - a) / m;
  let s = f(a) + f(b);
  for (let i = 1; i < m; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

describe('sample-mean-clt', () => {
  it('has a sample-mean density with area 1, mean μ = 60 and variance σ²/n', () => {
    for (const n of [2, 5, 36, 100]) {
      const f = (x: number) => sampleMeanDensity(x, n);
      expect(simpson(f, 0, 1000)).toBeCloseTo(1, 6);
      const mean = simpson((x) => x * f(x), 0, 1000);
      expect(mean).toBeCloseTo(60, 4);
      const variance = simpson((x) => (x - 60) ** 2 * f(x), 0, 1000);
      expect(variance).toBeCloseTo(3600 / n, 3);
      expect(Math.sqrt(variance)).toBeCloseTo(standardError(n), 4);
    }
  });

  it('is the population itself when n = 1', () => {
    for (const x of [0.5, 10, 60, 150]) {
      expect(sampleMeanDensity(x, 1)).toBeCloseTo(populationDensity(x), 12);
    }
    expect(simpson(populationDensity, 0, 1500)).toBeCloseTo(1, 6);
  });

  it('has a cdf that agrees with the area under the density', () => {
    for (const [x, n] of [
      [50, 36],
      [72, 36],
      [40, 5],
      [65, 100],
    ] as const) {
      expect(sampleMeanCdf(x, n)).toBeCloseTo(
        simpson((t) => sampleMeanDensity(t, n), 0, x),
        7,
      );
    }
  });

  it('matches worked example 1 of ST202 (n = 36, P(X̄ > 72))', () => {
    expect(standardError(36)).toBe(10);
    expect(1 - normalCdf((72 - 60) / standardError(36))).toBeCloseTo(0.1151, 4);
    // The exact value for this skewed population, quoted in the topic.
    expect(1 - sampleMeanCdf(72, 36)).toBeCloseTo(0.1184, 4);
  });

  it('gives the values quoted in the Try it text', () => {
    expect(withinProbability(36, 10).exact).toBeCloseTo(0.685, 4);
    expect(withinProbability(36, 10).normal).toBeCloseTo(0.6827, 4);
    expect(standardError(9)).toBe(20);
    expect(standardError(100)).toBe(6);
    expect(withinProbability(100, 10).exact).toBeCloseTo(0.9055, 4);
    expect(withinProbability(1, 10).exact).toBeCloseTo(0.1232, 4);
    expect(withinProbability(1, 10).normal).toBeCloseTo(0.1324, 4);
    expect(normalCdf(-60 / standardError(1))).toBeCloseTo(0.1587, 4);
  });

  it('describes the curves, the fit and the 1/√n rule in the caption', () => {
    const text = describeClt(36, 10);
    expect(text).toContain('n = 36 households');
    expect(text).toContain('N(60, 10²)');
    expect(text).toContain('P(50 < X̄ < 70) = 0.685');
    expect(text).toContain('almost coincide');
    expect(describeClt(1, 10)).toContain('n = 1 household;');
    expect(describeClt(1, 10)).toContain('fits badly');
    expect(describeClt(5, 10)).toContain('still visibly skewed');
    expect(describeClt(100, 30)).toContain('P(30 < X̄ < 90) > 0.9999');
  });
});
