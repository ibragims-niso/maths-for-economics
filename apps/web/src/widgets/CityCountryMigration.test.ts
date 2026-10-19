import { describe, expect, it } from 'vitest';
import {
  cityShareAfter,
  describeSpeed,
  longRunCityShare,
  migrationEigenvalues,
  populationPath,
  stepPopulation,
} from './CityCountryMigration';

describe('CityCountryMigration', () => {
  it('reproduces LA203 Example 2 (a = 0.1, b = 0.2, start (36, 54))', () => {
    expect(migrationEigenvalues(0.1, 0.2)[1]).toBeCloseTo(0.7, 12);
    const path = populationPath(0.1, 0.2, [36, 54], 5);
    expect(path).toHaveLength(6);
    // x_t = (60 − 24·0.7ᵗ, 30 + 24·0.7ᵗ)
    path.forEach(([city, country], t) => {
      expect(city).toBeCloseTo(60 - 24 * 0.7 ** t, 10);
      expect(country).toBeCloseTo(30 + 24 * 0.7 ** t, 10);
    });
    expect(path[5]?.[0]).toBeCloseTo(55.97, 2);
    expect(cityShareAfter(0.1, 0.2, 0.4, 5)).toBeCloseTo(0.6218, 4);
    expect(longRunCityShare(0.1, 0.2)).toBeCloseTo(2 / 3, 12);
    expect(cityShareAfter(0.1, 0.2, 0.4, 30)).toBeCloseTo(2 / 3, 3);
  });

  it('agrees with stepping year by year, keeps the total, and has the stated eigenpairs', () => {
    for (let a = 0.02; a <= 0.6; a += 0.04) {
      for (let b = 0.02; b <= 0.6; b += 0.04) {
        const [l1, l2] = migrationEigenvalues(a, b);
        expect(l1).toBe(1);
        // A(b, a) = (b, a) and A(1, −1) = λ₂(1, −1).
        const v1 = stepPopulation(a, b, [b, a]);
        expect(v1[0]).toBeCloseTo(b, 12);
        expect(v1[1]).toBeCloseTo(a, 12);
        const v2 = stepPopulation(a, b, [1, -1]);
        expect(v2[0]).toBeCloseTo(l2, 12);
        expect(v2[1]).toBeCloseTo(-l2, 12);
        const path = populationPath(a, b, [36, 54], 30);
        path.forEach(([city, country], n) => {
          expect(city + country).toBeCloseTo(90, 9);
          expect(city / 90).toBeCloseTo(cityShareAfter(a, b, 0.4, n), 10);
        });
      }
    }
  });

  it('describes the speed for positive, zero and negative second eigenvalues', () => {
    expect(describeSpeed(0.7)).toContain('multiplied by λ₂ = 0.7');
    expect(describeSpeed(0)).toContain('after one year');
    expect(describeSpeed(-0.2)).toContain('negative');
  });
});
