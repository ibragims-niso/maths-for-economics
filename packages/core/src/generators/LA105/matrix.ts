import { num } from '../format';

/** A square matrix as rows of numbers. */
export type Matrix = number[][];

/** Entry in row i, column j, counting from 0. */
export const at = (m: Matrix, i: number, j: number) => m[i]?.[j] ?? 0;

/** The matrix left after deleting row i and column j (counting from 0). */
export const minorMatrix = (m: Matrix, i: number, j: number): Matrix =>
  m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));

/** Determinant by cofactor expansion along the first row (fine for 2×2 and 3×3). */
export function det(m: Matrix): number {
  if (m.length === 1) return at(m, 0, 0);
  if (m.length === 2) return at(m, 0, 0) * at(m, 1, 1) - at(m, 0, 1) * at(m, 1, 0);
  return (m[0] ?? []).reduce(
    (s, a, j) => s + (j % 2 === 0 ? 1 : -1) * a * det(minorMatrix(m, 0, j)),
    0,
  );
}

/** The cofactor C_ij = (−1)^(i+j) × (minor), with i, j counted from 0. */
export const cofactor = (m: Matrix, i: number, j: number) =>
  ((i + j) % 2 === 0 ? 1 : -1) * det(minorMatrix(m, i, j));

/** The inverse by the adjugate: (A⁻¹)_ij = C_ji / det A. */
export function inverse(m: Matrix): Matrix {
  const d = det(m);
  return m.map((_, i) => m.map((__, j) => cofactor(m, j, i) / d));
}

/** Matrix times vector. */
export const times = (m: Matrix, v: readonly number[]) =>
  m.map((row) => row.reduce((s, a, j) => s + a * (v[j] ?? 0), 0));

/** A matrix as LaTeX, e.g. \begin{pmatrix} 3 & -1 \\ -1 & 2 \end{pmatrix}. */
export const matLatex = (m: Matrix, decimals = 2) =>
  `\\begin{pmatrix} ${m.map((row) => row.map((x) => num(x, decimals)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

/** A column vector as LaTeX. */
export const colLatex = (v: readonly number[]) => matLatex(v.map((x) => [x]));

/** A number in a product, in brackets when negative: 3 \cdot (-2). */
export const factor = (x: number, decimals = 2) =>
  x < 0 ? `(${num(x, decimals)})` : num(x, decimals);

/** Digits as Unicode subscripts for plain text: 12 → "₁₂". */
export const sub = (n: number) =>
  String(n).replace(/\d/g, (d) => String.fromCharCode(0x2080 + Number(d)));
