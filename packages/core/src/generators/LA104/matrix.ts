import { num } from '../format';

/** Helpers for the LA104 generators: small determinants and how to write matrices in LaTeX. */

/** Tight tolerance for whole-number answers that are exact (no rounding is needed). */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

export type Matrix2 = readonly [readonly [number, number], readonly [number, number]];
export type Matrix3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

/** ad − bc. */
export const det2 = (m: Matrix2) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

/** ad + bc: the 2×2 determinant with the wrong sign between the two products. */
export const det2Added = (m: Matrix2) => m[0][0] * m[1][1] + m[0][1] * m[1][0];

/** The matrix with column `j` (0 or 1) replaced by the right-hand side `rhs`, as in Cramer's rule. */
export function replaceColumn(m: Matrix2, j: 0 | 1, rhs: readonly [number, number]): Matrix2 {
  return j === 0
    ? [
        [rhs[0], m[0][1]],
        [rhs[1], m[1][1]],
      ]
    : [
        [m[0][0], rhs[0]],
        [m[1][0], rhs[1]],
      ];
}

/** A matrix as LaTeX, e.g. \begin{bmatrix} 1 & -1 \\ -0.8 & 1 \end{bmatrix}. */
export function bmatrix(rows: readonly (readonly number[])[]): string {
  return `\\begin{bmatrix} ${rows.map((r) => r.map((x) => num(x)).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
}

/** A number inside a product, in brackets when negative: 3 → "3", −2 → "(-2)". */
export const factor = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/** The 2×2 determinant written out: "1 \cdot 1 - (-1)(-0.8)". */
export function det2Working(m: Matrix2): string {
  return `${factor(m[0][0])} \\cdot ${factor(m[1][1])} - ${factor(m[0][1])} \\cdot ${factor(m[1][0])}`;
}
