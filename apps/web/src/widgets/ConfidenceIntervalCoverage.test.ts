import { createRng } from '@mfe/core';
import { describe, expect, it } from 'vitest';
import {
  coverCount,
  DRAWS,
  describeCoverage,
  intervals,
  marginOf,
  POP_SD,
  TRUE_MEAN,
  widthOf,
  zForLevel,
} from './ConfidenceIntervalCoverage';

describe('confidence-interval-coverage', () => {
  it('uses twenty standard normal draws made with the seeded generator (seed 137, Box–Muller)', () => {
    const rng = createRng(137);
    const z: number[] = [];
    for (let i = 0; i < 10; i++) {
      const r = Math.sqrt(-2 * Math.log(1 - rng.next()));
      const angle = 2 * Math.PI * rng.next();
      z.push(r * Math.cos(angle), r * Math.sin(angle));
    }
    expect(DRAWS).toEqual(z.map((x) => Math.round(x * 1000) / 1000));
  });

  it('gives the z values of the standard normal table', () => {
    expect(zForLevel(80)).toBe(1.282);
    expect(zForLevel(90)).toBe(1.645);
    expect(zForLevel(95)).toBe(1.96);
    expect(zForLevel(99)).toBe(2.576);
  });

  it('matches worked example 1 (σ = 400, n = 64: margin 98 at 95 %, 128.8 at 99 %)', () => {
    expect(marginOf(95, 64)).toBeCloseTo(98, 9);
    expect(widthOf(95, 64)).toBeCloseTo(196, 9);
    expect(marginOf(99, 64)).toBeCloseTo(128.8, 9);
    expect(widthOf(99, 64)).toBeCloseTo(257.6, 9);
    // A quarter of the sample size doubles the width.
    expect(widthOf(95, 16)).toBeCloseTo(2 * widthOf(95, 64), 9);
  });

  it('builds each interval around its survey mean x̄ = μ + Z·σ/√n', () => {
    const ivs = intervals(95, 64);
    expect(ivs).toHaveLength(20);
    ivs.forEach((iv, i) => {
      expect(iv.mean).toBeCloseTo(TRUE_MEAN + (DRAWS[i] ?? 0) * (POP_SD / 8), 9);
      expect(iv.upper - iv.lower).toBeCloseTo(196, 9);
      expect(iv.covers).toBe(Math.abs(DRAWS[i] ?? 0) < 1.96);
    });
    // Survey 14 (Z = 2.166) is the one that misses at 95 %: 1308.3 ± 98.
    expect(ivs[13]?.mean).toBeCloseTo(1308.3, 9);
    expect(ivs[13]?.lower).toBeCloseTo(1210.3, 9);
    expect(ivs[13]?.covers).toBe(false);
  });

  it('covers μ in about the stated share of the 20 surveys, whatever n is', () => {
    for (const n of [16, 64, 100, 400]) {
      expect(coverCount(80, n)).toBe(16);
      expect(coverCount(90, n)).toBe(18);
      expect(coverCount(95, n)).toBe(19);
      expect(coverCount(99, n)).toBe(20);
    }
  });

  it('describes the coverage meaning in the caption', () => {
    const text = describeCoverage(95, 64);
    expect(text).toContain('x̄ ± 1.96 × 400/√64');
    expect(text).toContain('19 of the 20 cover it and the gold one misses');
    expect(text).toContain('95 % of such intervals cover μ');
    expect(describeCoverage(80, 64)).toContain('4 gold ones miss');
    expect(describeCoverage(99, 64)).toContain('all 20 cover it');
  });
});
