import { describe, expect, it } from 'vitest';
import {
  apply2,
  eigenDirections,
  eigenvalues2,
  eigenvector2,
  type Mat2,
  spectralRadius2,
} from './EigenDirections';

const realValues = (m: Mat2) => {
  const e = eigenvalues2(m);
  if (e.kind !== 'real') throw new Error('real eigenvalues expected');
  return e.values;
};

describe('EigenDirections maths (LA202)', () => {
  it('finds Example 1: A = (4, 1; 2, 3) has λ = 5, 2 with eigenvectors (1, 1) and (1, −2)', () => {
    const m = { a: 4, b: 1, c: 2, d: 3 };
    const [l1, l2] = realValues(m);
    expect(l1).toBeCloseTo(5, 12);
    expect(l2).toBeCloseTo(2, 12);
    expect(eigenvector2(m, 5)).toEqual([1, 1]);
    expect(eigenvector2(m, 2)).toEqual([1, -2]);
    expect(spectralRadius2(m)).toBeCloseTo(5, 12);
  });

  it('finds Example 2, the default: A = (0.6, 0.3; 0.6, 0.9) has λ = 1.2, 0.3 and is not stable', () => {
    const m = { a: 0.6, b: 0.3, c: 0.6, d: 0.9 };
    const [l1, l2] = realValues(m);
    expect(l1).toBeCloseTo(1.2, 12);
    expect(l2).toBeCloseTo(0.3, 12);
    expect(eigenvector2(m, l1)[1]).toBeCloseTo(2, 12);
    expect(eigenvector2(m, l2)[1]).toBeCloseTo(-1, 12);
    expect(spectralRadius2(m)).toBeCloseTo(1.2, 12);
    // A only stretches each eigen-direction by its λ.
    for (const { lambda, dir } of eigenDirections(m)) {
      const image = apply2(m, dir);
      expect(image[0]).toBeCloseTo(lambda * dir[0], 12);
      expect(image[1]).toBeCloseTo(lambda * dir[1], 12);
    }
  });

  it('gives the Try it checks: c = −0.6 makes λ = 0.75 ± 0.4i with ρ = √0.72 ≈ 0.849; b = c = 0 gives the axes', () => {
    const m = { a: 0.6, b: 0.3, c: -0.6, d: 0.9 };
    const e = eigenvalues2(m);
    expect(e.kind).toBe('complex');
    if (e.kind === 'complex') {
      expect(e.re).toBeCloseTo(0.75, 12);
      expect(e.im).toBeCloseTo(Math.sqrt(0.63) / 2, 12);
      expect(Math.round(e.im * 100) / 100).toBe(0.4);
    }
    expect(spectralRadius2(m)).toBeCloseTo(Math.sqrt(0.72), 12);
    expect(Math.round(spectralRadius2(m) * 1000) / 1000).toBe(0.849);
    expect(eigenDirections(m)).toEqual([]);

    const diagonal = { a: 0.6, b: 0, c: 0, d: 0.9 };
    expect(realValues(diagonal)).toEqual([0.9, 0.6]);
    expect(eigenvector2(diagonal, 0.9)).toEqual([0, 1]);
    expect(Math.abs(eigenvector2(diagonal, 0.6)[1])).toBe(0);
    expect(spectralRadius2(diagonal)).toBeCloseTo(0.9, 12);
  });

  it('finds the eigenvalues 1 and 0.5 of the transition matrix of Example 3, and π = (0.4, 0.6)', () => {
    const p = { a: 0.7, b: 0.3, c: 0.2, d: 0.8 };
    const [l1, l2] = realValues(p);
    expect(l1).toBeCloseTo(1, 12);
    expect(l2).toBeCloseTo(0.5, 12);
    // The stationary distribution is the eigenvector of the transpose for λ = 1.
    const v = eigenvector2({ a: 0.7, b: 0.2, c: 0.3, d: 0.8 }, 1);
    expect(v[1]).toBeCloseTo(1.5, 12);
    expect(v[0] / (v[0] + v[1])).toBeCloseTo(0.4, 12);
  });

  it('keeps one direction for a repeated eigenvalue', () => {
    const m = { a: 0.6, b: 0.15, c: -0.15, d: 0.9 };
    const [l1, l2] = realValues(m);
    expect(l1).toBeCloseTo(0.75, 6);
    expect(l2).toBeCloseTo(0.75, 6);
    expect(eigenDirections(m)).toHaveLength(1);
  });
});
