import { describe, expect, it } from 'vitest';
import {
  COLUMNS,
  cellOf,
  describeBayes,
  naturalFrequencies,
  POPULATION,
  ROWS,
  wholeBorrowers,
} from './BayesNaturalFrequencies';

describe('bayes-natural-frequencies', () => {
  it('reproduces worked example 2 of ST102 (5 % default, 80 % hit, 10 % false alarm)', () => {
    const f = naturalFrequencies(5, 80, 10);
    expect(f.defaulters).toBe(50);
    expect(f.truePositives).toBe(40);
    expect(f.missed).toBe(10);
    expect(f.falseAlarms).toBe(95);
    expect(f.flagged).toBe(135);
    expect(f.posterior).toBeCloseTo(0.2963, 4);
  });

  it('agrees with Bayes’ theorem written with probabilities', () => {
    for (let base = 1; base <= 30; base++) {
      for (let hit = 50; hit <= 100; hit += 5) {
        for (let fa = 0; fa <= 30; fa += 3) {
          const pA = base / 100;
          const bayes = (pA * hit) / 100 / ((pA * hit) / 100 + ((1 - pA) * fa) / 100);
          expect(naturalFrequencies(base, hit, fa).posterior).toBeCloseTo(bayes, 12);
        }
      }
    }
  });

  it('draws whole borrowers that add up to the population and fit the grid', () => {
    expect(COLUMNS * ROWS).toBe(POPULATION);
    for (let base = 1; base <= 30; base++) {
      for (let hit = 50; hit <= 100; hit++) {
        for (let fa = 0; fa <= 30; fa++) {
          const w = wholeBorrowers(base, hit, fa);
          for (const v of [w.truePositives, w.missed, w.falseAlarms, w.clear]) {
            expect(Number.isInteger(v) && v >= 0).toBe(true);
          }
          expect(w.truePositives + w.missed + w.falseAlarms + w.clear).toBe(POPULATION);
          expect(w.truePositives).toBeGreaterThan(0);
        }
      }
    }
    expect(cellOf(0)).toEqual([0, 0]);
    expect(cellOf(COLUMNS)).toEqual([0, 1]);
    expect(cellOf(POPULATION - 1)).toEqual([COLUMNS - 1, ROWS - 1]);
  });

  it('explains the result in the caption with the current numbers', () => {
    const text = describeBayes(5, 80, 10);
    expect(text).toContain('warns 40 (gold)');
    expect(text).toContain('40 of 135 default');
    expect(text).toContain('P(default | warning) = 0.296');
    expect(text).toContain('Defaults are rare');
    expect(describeBayes(30, 80, 10)).toContain('strong evidence');
    expect(describeBayes(3, 83, 10)).toContain('about');
  });

  it('shows how false alarms matter more than the hit rate for a rare event', () => {
    expect(naturalFrequencies(5, 80, 2).posterior).toBeCloseTo(0.678, 3);
    expect(naturalFrequencies(5, 95, 10).posterior).toBeCloseTo(0.3333, 4);
    expect(naturalFrequencies(30, 80, 10).posterior).toBeCloseTo(0.774, 3);
  });
});
