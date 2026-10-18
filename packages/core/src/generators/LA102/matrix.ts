import { num } from '../format';

/** A matrix as a list of rows. */
export type Matrix = readonly (readonly number[])[];

/** A matrix in LaTeX with round brackets; numbers through num(). */
export function pmatrix(rows: Matrix, decimals = 2): string {
  const body = rows.map((row) => row.map((x) => num(x, decimals)).join(' & ')).join(' \\\\ ');
  return `\\begin{pmatrix} ${body} \\end{pmatrix}`;
}

/** Entry (i, j) of a matrix, with 1-based indices as in the maths. */
export function entry(m: Matrix, i: number, j: number): number {
  const value = m[i - 1]?.[j - 1];
  if (value === undefined) throw new Error(`no entry (${i}, ${j})`);
  return value;
}

/** Row i of a matrix (1-based). */
export function row(m: Matrix, i: number): readonly number[] {
  const r = m[i - 1];
  if (!r) throw new Error(`no row ${i}`);
  return r;
}

/** Column j of a matrix (1-based). */
export function column(m: Matrix, j: number): number[] {
  return m.map((_, i) => entry(m, i + 1, j));
}

/** The dot product x₁y₁ + x₂y₂ + … of two lists of the same length. */
export function dot(x: readonly number[], y: readonly number[]): number {
  if (x.length !== y.length) throw new Error('dot product needs equal lengths');
  return x.reduce((sum, xk, k) => sum + xk * (y[k] ?? 0), 0);
}

/** The pairs of a dot product written out, e.g. "40 \cdot 3 + 25 \cdot 3". */
export function dotLatex(x: readonly number[], y: readonly number[], decimals = 2): string {
  return x.map((xk, k) => `${num(xk, decimals)} \\cdot ${num(y[k] ?? 0, decimals)}`).join(' + ');
}

export const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
