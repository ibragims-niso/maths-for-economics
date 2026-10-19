import { describe, expect, it } from 'vitest';
import { fmt } from './kit';
import { coefficients, leontiefInverse, multiplier, outputs, times } from './LeontiefTwoSector';

describe('LeontiefTwoSector', () => {
  it('reproduces LA106 Examples 1 and 2 at the default sliders', () => {
    const A = coefficients(0.2);
    const L = leontiefInverse(A);
    expect(L[0][0]).toBeCloseTo(1.2, 12);
    expect(L[0][1]).toBeCloseTo(0.4, 12);
    expect(L[1][0]).toBeCloseTo(0.4, 12);
    expect(L[1][1]).toBeCloseTo(1.8, 12);
    const x = outputs(A, [80, 260]);
    expect(x[0]).toBeCloseTo(200, 9);
    expect(x[1]).toBeCloseTo(500, 9);
    expect(multiplier(A, 1)).toBeCloseTo(2.2, 12);
    expect(multiplier(A, 0)).toBeCloseTo(1.6, 12);
    // The first round of inputs, Ad.
    const first = times(A, [80, 260]);
    expect(first[0]).toBeCloseTo(60, 9);
    expect(first[1]).toBeCloseTo(120, 9);
    // 50 more final demand for industry: outputs (220, 590), as in Example 2.
    const more = outputs(A, [80, 310]);
    expect(more[0]).toBeCloseTo(220, 9);
    expect(more[1]).toBeCloseTo(590, 9);
  });

  it('agrees with the balance x = Ax + d and with the rounds d + Ad + A²d + … at every slider position', () => {
    for (let k = 0; k <= 10; k++) {
      const A = coefficients(k * 0.05);
      for (let d2 = 0; d2 <= 400; d2 += 10) {
        const d: [number, number] = [80, d2];
        const x = outputs(A, d);
        const Ax = times(A, x);
        expect(Ax[0] + d[0]).toBeCloseTo(x[0], 9);
        expect(Ax[1] + d[1]).toBeCloseTo(x[1], 9);
        let round: [number, number] = [...d];
        const total: [number, number] = [...d];
        for (let r = 0; r < 200; r++) {
          round = times(A, round);
          total[0] += round[0];
          total[1] += round[1];
        }
        expect(total[0]).toBeCloseTo(x[0], 6);
        expect(total[1]).toBeCloseTo(x[1], 6);
        // Bars stay inside the picture and every round adds output.
        expect(x[0]).toBeLessThan(1000);
        expect(x[1]).toBeLessThan(1000);
        expect(x[1] - d[1] - times(A, d)[1]).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it('a larger agricultural input raises the industry multiplier', () => {
    expect(multiplier(coefficients(0), 1)).toBeCloseTo(0.9 / 0.54, 9);
    expect(multiplier(coefficients(0.5), 1)).toBeCloseTo(1.4 / 0.44, 9);
    expect(multiplier(coefficients(0.5), 1)).toBeGreaterThan(multiplier(coefficients(0.2), 1));
    // The check in the topic's Try it text: a₁₂ = 0.5, d₂ = 260.
    const x = outputs(coefficients(0.5), [80, 260]);
    expect(fmt(x[0], 1)).toBe('404.5');
    expect(fmt(x[1], 1)).toBe('568.2');
    expect(fmt(multiplier(coefficients(0.5), 1))).toBe('3.18');
  });
});
