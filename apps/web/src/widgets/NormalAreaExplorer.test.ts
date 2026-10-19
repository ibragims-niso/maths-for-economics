import { describe, expect, it } from 'vitest';
import {
  band,
  describeNormal,
  leftArea,
  normalCdf,
  normalDensity,
  probText,
} from './NormalAreaExplorer';

/** Area under the N(mean, sd²) density from mean − 10 sd up to x, by the trapezium rule. */
function integrate(x: number, mean: number, sd: number): number {
  const a = mean - 10 * sd;
  const n = 20000;
  const h = (x - a) / n;
  let s = (normalDensity(a, mean, sd) + normalDensity(x, mean, sd)) / 2;
  for (let i = 1; i < n; i++) s += normalDensity(a + i * h, mean, sd);
  return s * h;
}

describe('normal-area-explorer', () => {
  it('reproduces worked example 1 of ST105 (N(400, 50²), cut-off 470)', () => {
    const { z, p } = leftArea(470, 400, 50);
    expect(z).toBeCloseTo(1.4, 12);
    expect(p).toBeCloseTo(0.9192, 4);
    expect(1 - p).toBeCloseTo(0.0808, 4);
  });

  it('gives the values quoted in the Try it text', () => {
    expect(leftArea(470, 400, 35).p).toBeCloseTo(0.9772, 4);
    expect(band(leftArea(470, 400, 35).z)).toBe('exactly 2σ');
    expect(leftArea(450, 400, 50).p).toBeCloseTo(0.8413, 4);
    expect(leftArea(400, 400, 50).p).toBe(0.5);
    expect(leftArea(350, 400, 50).p).toBeCloseTo(0.1587, 4);
  });

  it('agrees with the area under the density', () => {
    for (const [x, mean, sd] of [
      [470, 400, 50],
      [150, 300, 80],
      [650, 500, 20],
      [380, 420, 35],
    ] as const) {
      expect(leftArea(x, mean, sd).p).toBeCloseTo(integrate(x, mean, sd), 7);
    }
  });

  it('has density with total area 1 and its peak 1/(σ√(2π)) at the mean', () => {
    expect(integrate(400 + 10 * 50, 400, 50)).toBeCloseTo(1, 8);
    expect(normalDensity(400, 400, 50)).toBeCloseTo(1 / (50 * Math.sqrt(2 * Math.PI)), 12);
    expect(normalCdf(1) - normalCdf(-1)).toBeCloseTo(0.6827, 4);
    expect(normalCdf(2) - normalCdf(-2)).toBeCloseTo(0.9545, 4);
    expect(normalCdf(3) - normalCdf(-3)).toBeCloseTo(0.9973, 4);
  });

  it('names the band of the 68–95–99.7 rule', () => {
    expect([0.3, -1, 1.4, -2.5, 3, 3.2].map(band)).toEqual([
      'within 1σ',
      'exactly 1σ',
      '1σ to 2σ',
      '2σ to 3σ',
      'exactly 3σ',
      'beyond 3σ',
    ]);
  });

  it('explains the shaded area in the caption with the current numbers', () => {
    const text = describeNormal(400, 50, 470);
    expect(text).toContain('P(X < 470) = 0.9192');
    expect(text).toContain('between 1σ and 2σ above the mean');
    expect(text).toContain('95 % of days');
    expect(text).toContain('between 300 and 500');
    expect(describeNormal(400, 50, 400)).toContain('half of the area');
    expect(describeNormal(400, 50, 350)).toContain('exactly 1σ below the mean');
    expect(describeNormal(500, 30, 650)).toContain('more than 3σ above');
    expect(describeNormal(500, 30, 650)).toContain('P(X < 650) > 0.9999');
    expect([leftArea(650, 500, 30).p, leftArea(150, 500, 30).p, 0.91924].map(probText)).toEqual([
      '> 0.9999',
      '< 0.0001',
      '0.9192',
    ]);
  });
});
