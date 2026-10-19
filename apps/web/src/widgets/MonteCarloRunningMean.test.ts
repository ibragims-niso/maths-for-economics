import { createRng } from '@mfe/core';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  bandHalfWidth,
  caption,
  DRAWS,
  drawTicks,
  MAX_DRAWS,
  MonteCarloRunningMean,
  npvFromUniform,
  RUNNING,
  runningAt,
  runStats,
  summarise,
  TRUE_MEAN,
  TRUE_SD,
} from './MonteCarloRunningMean';

describe('MonteCarloRunningMean', () => {
  it('uses the project of NM03 Example 1: NPV = −200 + 600u, mean 100, SD 600/√12', () => {
    expect(npvFromUniform(0.62)).toBeCloseTo(172, 9);
    expect(npvFromUniform(0)).toBeCloseTo(-200, 9);
    expect(npvFromUniform(1)).toBeCloseTo(400, 9);
    // The mean and SD of a uniform NPV on [−200, 400], by a fine midpoint sum.
    const k = 100000;
    const xs = Array.from({ length: k }, (_, i) => npvFromUniform((i + 0.5) / k));
    const m = xs.reduce((a, b) => a + b, 0) / k;
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / k);
    expect(m).toBeCloseTo(TRUE_MEAN, 6);
    expect(sd).toBeCloseTo(TRUE_SD, 3);
    expect(TRUE_SD).toBeCloseTo(173.21, 2);
  });

  it('reproduces the estimate and standard error of Example 1 from its ten draws', () => {
    const u = [0.62, 0.15, 0.88, 0.47, 0.03, 0.71, 0.36, 0.94, 0.29, 0.41];
    const { mean, sd, se } = summarise(u.map(npvFromUniform));
    expect(mean).toBeCloseTo(91.6, 9);
    expect(sd).toBeCloseTo(180.07, 2);
    expect(se).toBeCloseTo(56.94, 2);
  });

  it('draws from the seeded generator, so a seed always gives the same run', () => {
    const rng = createRng(1);
    expect(DRAWS[0]?.[0]).toBe(npvFromUniform(rng.next()));
    expect(DRAWS[0]?.[1]).toBe(npvFromUniform(rng.next()));
    expect(DRAWS.every((xs) => xs.length === MAX_DRAWS)).toBe(true);
    expect(DRAWS.flat().every((x) => x >= -200 && x < 400)).toBe(true);
  });

  it('shows the numbers of the Try it text: seed 1 at 400 and 1600 draws, seed 4 at 400', () => {
    const a = runStats(1, 400);
    expect(a.mean).toBeCloseTo(87.99, 2);
    expect(a.se).toBeCloseTo(8.8, 2);
    const b = runStats(1, 1600);
    expect(b.mean).toBeCloseTo(97.96, 2);
    expect(b.se).toBeCloseTo(4.3, 2);
    const c = runStats(4, 400);
    expect(c.mean).toBeCloseTo(127.26, 2);
    expect(Math.abs(c.mean - TRUE_MEAN)).toBeGreaterThan(bandHalfWidth(400));
    expect(bandHalfWidth(400)).toBeCloseTo(17.32, 2);
    expect(bandHalfWidth(1600)).toBeCloseTo(bandHalfWidth(400) / 2, 9);
  });

  it('keeps the running estimate equal to the plain average, and between draws on a line', () => {
    for (let seed = 1; seed <= 5; seed++) {
      expect(RUNNING[seed - 1]?.[250]).toBeCloseTo(runStats(seed, 250).mean, 9);
      const at = runningAt(seed, 250.5);
      const lo = RUNNING[seed - 1]?.[250] ?? 0;
      const hi = RUNNING[seed - 1]?.[251] ?? 0;
      expect(at).toBeCloseTo((lo + hi) / 2, 9);
      // After all 2000 draws every seed is within 2 standard errors of the true value.
      expect(Math.abs(runStats(seed, MAX_DRAWS).mean - TRUE_MEAN)).toBeLessThan(
        bandHalfWidth(MAX_DRAWS),
      );
    }
  });

  it('picks at most four round ticks and describes the run', () => {
    expect(drawTicks(400)).toEqual([100, 200, 300]);
    expect(drawTicks(2000)).toEqual([500, 1000, 1500]);
    expect(drawTicks(10)).toEqual([5]);
    expect(caption(400, runStats(1, 400).mean)).toMatch(/inside the gold band/);
    expect(caption(400, runStats(4, 400).mean)).toMatch(/outside the gold band/);
  });

  it('renders the default state (seed 1, N = 400)', () => {
    const html = renderToStaticMarkup(createElement(MonteCarloRunningMean));
    expect(html).toContain('87.99');
    expect(html).toContain('8.8');
    expect(html).toContain('100 ± 17.3');
  });
});
