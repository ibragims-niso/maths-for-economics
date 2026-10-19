import type { Rng } from '../../engine/rng';
import { num } from '../format';

/** A 2×2 matrix as two rows. */
export type M2 = [[number, number], [number, number]];

export const det2 = (m: M2) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

/** The product ab; + 0 turns a negative zero into 0. */
export const mul2 = (a: M2, b: M2): M2 => [
  [a[0][0] * b[0][0] + a[0][1] * b[1][0] + 0, a[0][0] * b[0][1] + a[0][1] * b[1][1] + 0],
  [a[1][0] * b[0][0] + a[1][1] * b[1][0] + 0, a[1][0] * b[0][1] + a[1][1] * b[1][1] + 0],
];

/** The inverse of an integer matrix with determinant ±1, which is again an integer matrix. */
export function inverseUnimodular(m: M2): M2 {
  const d = det2(m);
  if (d !== 1 && d !== -1) throw new Error('determinant must be ±1');
  // (1/d)·adj(m), and 1/d = d when d = ±1.
  return [
    [d * m[1][1] + 0, -d * m[0][1] + 0],
    [-d * m[1][0] + 0, d * m[0][0] + 0],
  ];
}

export const diag2 = (a: number, b: number): M2 => [
  [a, 0],
  [0, b],
];

/** Column j (0 or 1) of a matrix. */
export const col2 = (m: M2, j: 0 | 1): [number, number] => [m[0][j], m[1][j]];

/** P D P⁻¹ for an eigenvector matrix P with determinant ±1. */
export const fromEigen = (p: M2, l1: number, l2: number): M2 =>
  mul2(mul2(p, diag2(l1, l2)), inverseUnimodular(p));

/**
 * An eigenvector matrix P: integer entries between −3 and 3, determinant ±1 (so P⁻¹ has integer
 * entries too), and each column's first non-zero entry positive, as eigenvectors are usually
 * written.
 */
export function drawUnimodular(rng: Rng): M2 {
  for (;;) {
    const p: M2 = [
      [rng.int(-3, 3), rng.int(-3, 3)],
      [rng.int(-3, 3), rng.int(-3, 3)],
    ];
    const d = det2(p);
    if (d !== 1 && d !== -1) continue;
    const leadPositive = (j: 0 | 1) => (p[0][j] !== 0 ? p[0][j] > 0 : p[1][j] > 0);
    if (!leadPositive(0) || !leadPositive(1)) continue;
    return p;
  }
}

/** A matrix in LaTeX with round brackets. */
export const pm = (m: M2, decimals = 2) =>
  `\\begin{pmatrix} ${num(m[0][0], decimals)} & ${num(m[0][1], decimals)} \\\\ ${num(m[1][0], decimals)} & ${num(m[1][1], decimals)} \\end{pmatrix}`;

/** A vector written in a line, e.g. "(1, -2)". */
export const vec2 = (v: readonly number[]) => `(${v.map((x) => num(x)).join(', ')})`;

/** A number in brackets when negative, for products such as 3 \cdot (-2)^4. */
export const paren = (x: number, decimals = 2) =>
  x < 0 ? `(${num(x, decimals)})` : num(x, decimals);

/** A column vector in LaTeX. */
export const colvec = (v: readonly number[]) =>
  `\\begin{pmatrix} ${v.map((x) => num(x)).join(' \\\\ ')} \\end{pmatrix}`;

/** A number for plain text (a step's "why"): Unicode minus sign, brackets when negative. */
export const plain = (x: number, decimals = 2) => num(x, decimals).replace('-', '−');
export const plainParen = (x: number) => (x < 0 ? `(${plain(x)})` : plain(x));
