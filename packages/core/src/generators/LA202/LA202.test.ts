import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import { eigenvalueLarger2x2 } from './eigenvalue-larger-2x2';
import { eigenvectorSecondComponent } from './eigenvector-second-component';
import { spectralRadiusStability } from './spectral-radius-stability';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

/** det(A − λI) for A with rows (a, b) and (c, d), straight from the definition. */
const charPoly = (m: { a: number; b: number; c: number; d: number }, lambda: number) =>
  (m.a - lambda) * (m.d - lambda) - m.b * m.c;

type M2 = [[number, number], [number, number]];
const mul = (x: M2, y: M2): M2 => [
  [x[0][0] * y[0][0] + x[0][1] * y[1][0], x[0][0] * y[0][1] + x[0][1] * y[1][1]],
  [x[1][0] * y[0][0] + x[1][1] * y[1][0], x[1][0] * y[0][1] + x[1][1] * y[1][1]],
];
const maxAbs = (x: M2) => Math.max(...x.flat().map(Math.abs));

/** A^(2^k) by squaring k times. */
const powerOfTwo = (m: M2, k: number) => {
  let power = m;
  for (let i = 0; i < k; i++) power = mul(power, power);
  return power;
};

/**
 * Gelfand's formula, ρ = lim ‖Aⁿ‖^(1/n), with n = 2^k: squares A k times, rescaling as it goes
 * and keeping the logarithm of the scale. No eigenvalues are computed.
 */
function gelfandRadius(m: M2, k = 14): number {
  let power = m;
  let logScale = 0;
  for (let i = 0; i < k; i++) {
    power = mul(power, power);
    const s = maxAbs(power);
    // The scale of A^(2n) is the square of the scale of Aⁿ, times the new rescaling.
    logScale = 2 * logScale + Math.log(s);
    power = power.map((r) => r.map((x) => x / s)) as M2;
  }
  return Math.exp(logScale / 2 ** k);
}

describe('eigenvalue-larger-2x2', () => {
  it('is the larger of the two whole numbers λ (found by search) with det(A − λI) = 0', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(eigenvalueLarger2x2, seed);
        const roots: number[] = [];
        for (let lambda = -40; lambda <= 40; lambda++)
          if (charPoly(p, lambda) === 0) roots.push(lambda);
        expect(roots).toHaveLength(2);
        expect(numericValue(answer)).toBe(Math.max(...roots));
        for (const x of [p.a, p.b, p.c, p.d])
          expect(Number.isInteger(x) && Math.abs(x) <= 9).toBe(true);
        // Not triangular: the eigenvalues cannot be read off the diagonal.
        expect(p.b * p.c).not.toBe(0);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA202: A = (4, 1; 2, 3) has eigenvalues 5 and 2', () => {
    const p = { a: 4, b: 1, c: 2, d: 3, big: 5, small: 2 };
    expect(numericValue(eigenvalueLarger2x2.answer(p))).toBe(5);
    expect(eigenvalueLarger2x2.steps(p)[2]?.latex).toContain('\\lambda^2 - 7\\lambda + 10');
    expect(eigenvalueLarger2x2.distractors(p).map((d) => d.value)).toEqual([7, 10, 4, 2]);
  });
});

describe('eigenvector-second-component', () => {
  it('gives a vector (1, y) that A only stretches by λ, and λ is a simple eigenvalue', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(eigenvectorSecondComponent, seed);
        const y = numericValue(answer);
        // Av = λv in both rows, exactly (y is a whole number or a half).
        expect(p.a + p.b * y).toBe(p.lambda);
        expect(Math.abs(p.c + p.d * y - p.lambda * y)).toBe(0);
        expect(Math.abs(charPoly(p, p.lambda))).toBe(0);
        // The other root of λ² − (a + d)λ + det differs, so the direction (1, y) is unique.
        const other = p.a + p.d - p.lambda;
        expect(Math.abs(charPoly(p, other))).toBe(0);
        expect(other).not.toBe(p.lambda);
        expect(Number.isInteger(2 * y) && y !== 0).toBe(true);
        for (const x of [p.a, p.b, p.c, p.d, p.lambda]) expect(Number.isInteger(x)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA202: the eigenvectors of A = (4, 1; 2, 3) are (1, 1) and (1, −2)', () => {
    const base = { a: 4, b: 1, c: 2, d: 3 };
    expect(numericValue(eigenvectorSecondComponent.answer({ ...base, lambda: 2 }))).toBe(-2);
    expect(numericValue(eigenvectorSecondComponent.answer({ ...base, lambda: 5 }))).toBe(1);
    expect(
      eigenvectorSecondComponent.distractors({ ...base, lambda: 2 }).map((d) => d.value),
    ).toEqual([2, -0.5, -4, -1]);
  });
});

describe('spectral-radius-stability', () => {
  it("matches Gelfand's formula ρ = lim ‖Aⁿ‖^(1/n), and the powers of A die out exactly when ρ < 1", () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(spectralRadiusStability, seed);
        const rho = numericValue(answer);
        const m: M2 = [
          [p.a / 10, p.b / 10],
          [p.c / 10, p.d / 10],
        ];
        expect(Math.abs(gelfandRadius(m) - rho)).toBeLessThan(0.008);
        expect(Math.abs(rho - 1)).toBeGreaterThan(0.02);
        expect(Math.round(rho * 100)).toBeCloseTo(rho * 100, 9);
        // Stability seen directly: after 512 periods every deviation is tiny or huge.
        const power = powerOfTwo(m, 9);
        if (rho < 1) expect(maxAbs(power)).toBeLessThan(1e-3);
        else expect(maxAbs(power)).toBeGreaterThan(1e3);
        for (const x of [p.a, p.b, p.c, p.d])
          expect(Number.isInteger(x) && Math.abs(x) <= 12).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA202: A = (0.9, 0.1; 0.2, 1) has ρ = 1.1, so it is not stable', () => {
    const p = { a: 9, b: 1, c: 2, d: 10 };
    expect(numericValue(spectralRadiusStability.answer(p))).toBe(1.1);
    expect(spectralRadiusStability.steps(p)[1]?.latex).toContain('\\lambda_2 = 0.8');
  });

  it('uses |λ| = √det for a complex pair: A = (0.6, 0.2; −0.5, 0.8)', () => {
    const p = { a: 6, b: 2, c: -5, d: 8 };
    // det = 0.48 + 0.1 = 0.58, trace² − 4 det = 1.96 − 2.32 < 0.
    expect(numericValue(spectralRadiusStability.answer(p))).toBe(0.76);
    expect(spectralRadiusStability.distractors(p).map((d) => d.mistakeCode)).toEqual([
      'REAL_PART_ONLY',
      'MODULUS_SQUARED',
      'DIAGONAL_ENTRY',
    ]);
  });
});
