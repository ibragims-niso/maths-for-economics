import { num } from '../format';

/** Helpers for the MV07 generators: a two-product profit π = aQ₁ + bQ₂ − cQ₁² − dQ₂² − eQ₁Q₂ − F. */

/** Tight tolerance for whole-number answers that are exact (no rounding is needed). */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** "c·x" with a coefficient of 1 left out: (1, "Q_1") → "Q_1", (3, "Q_1") → "3Q_1". */
export const term = (c: number, x: string) => `${c === 1 ? '' : num(c)}${x}`;

/** A term with its sign in front: (3, "Q_1") → " + 3Q_1", (−2, "Q_1") → " - 2Q_1". */
export const signed = (c: number, x: string) => `${c < 0 ? ' - ' : ' + '}${term(Math.abs(c), x)}`;

/** A number inside a product, in brackets when negative: 3 → "3", −2 → "(-2)". */
export const factor = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

export interface QuadraticProfit {
  a: number;
  b: number;
  /** Coefficients of −Q₁², −Q₂² and −Q₁Q₂ (e may be negative: then +|e|Q₁Q₂). */
  c: number;
  d: number;
  e: number;
  fixedCost: number;
}

/** The profit function as LaTeX. */
export const profitLatex = (p: QuadraticProfit) =>
  `\\pi = ${term(p.a, 'Q_1')}${signed(p.b, 'Q_2')}${signed(-p.c, 'Q_1^2')}${signed(-p.d, 'Q_2^2')}${signed(-p.e, 'Q_1Q_2')} - ${num(p.fixedCost)}`;

/** The profit at (q1, q2). */
export const profitAt = (p: QuadraticProfit, q1: number, q2: number) =>
  p.a * q1 + p.b * q2 - p.c * q1 * q1 - p.d * q2 * q2 - p.e * q1 * q2 - p.fixedCost;

/** The solution of [[A, B], [B, C]]·x = [r, s] by Cramer's rule, or null if the determinant is 0. */
export function solveSymmetric(
  A: number,
  B: number,
  C: number,
  r: number,
  s: number,
): [number, number] | null {
  const det = A * C - B * B;
  if (det === 0) return null;
  return [(r * C - B * s) / det, (A * s - B * r) / det];
}
