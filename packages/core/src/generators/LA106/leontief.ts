import { num } from '../format';
import { at, type Matrix, matLatex } from '../LA105/matrix';

/**
 * Shared pieces of the LA106 (input–output) generators. Input coefficients are stored as whole
 * numbers of tenths (3 means 0.3), so that sums and products stay exact.
 */

/** Sector names, in the order of the rows and columns of A. */
export const SECTORS = ['agriculture', 'industry', 'services'] as const;
const LABELS = ['Agriculture', 'Industry', 'Services'] as const;

export const sectorName = (k: number) => SECTORS[k] ?? 'sector';

/** A matrix of tenths as decimals: [[1, 2], [2, 4]] → [[0.1, 0.2], [0.2, 0.4]]. */
export const fromTenths = (T: Matrix): Matrix => T.map((row) => row.map((t) => t / 10));

/** A matrix of tenths as LaTeX, e.g. \begin{pmatrix} 0.1 & 0.2 \\ 0.2 & 0.4 \end{pmatrix}. */
export const tenthsLatex = (T: Matrix) => matLatex(fromTenths(T));

/** Sum of column j of a matrix. */
export const columnSum = (M: Matrix, j: number) => M.reduce((s, row) => s + (row[j] ?? 0), 0);

/** Sum of row i of a matrix. */
export const rowSum = (M: Matrix, i: number) => (M[i] ?? []).reduce((s, x) => s + x, 0);

/** 100 × det(I − A) for a 2×2 A in tenths: (10 − t₁₁)(10 − t₂₂) − t₁₂t₂₁. */
export const det100 = (T: Matrix) =>
  (10 - at(T, 0, 0)) * (10 - at(T, 1, 1)) - at(T, 0, 1) * at(T, 1, 0);

/** 10 × adj(I − A) for a 2×2 A in tenths: swap the diagonal of I − A, drop the minus signs. */
export const adj10 = (T: Matrix): Matrix => [
  [10 - at(T, 1, 1), at(T, 0, 1)],
  [at(T, 1, 0), 10 - at(T, 0, 0)],
];

/** The Leontief inverse (I − A)⁻¹ = adj(I − A) / det(I − A) of a 2×2 A in tenths. */
export const leontief2 = (T: Matrix): Matrix => {
  const h = det100(T);
  return adj10(T).map((row) => row.map((a) => (10 * a) / h));
};

/**
 * Every 2×2 coefficient matrix the generators use: entries 0.1 to 0.5 (every sector buys from
 * both), and each column adds up to at most 0.8, so the economy is productive.
 */
export const COEFFICIENTS_2X2: Matrix[] = (() => {
  const found: Matrix[] = [];
  const t = [1, 2, 3, 4, 5];
  for (const a of t)
    for (const b of t)
      for (const c of t)
        for (const d of t)
          if (a + c <= 8 && b + d <= 8)
            found.push([
              [a, b],
              [c, d],
            ]);
  return found;
})();

const isWhole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;

/** The matrices of COEFFICIENTS_2X2 whose Leontief inverse is exact to 2 decimal places. */
export const NICE_2X2: Matrix[] = COEFFICIENTS_2X2.filter((T) =>
  leontief2(T).every((row) => row.every((x) => isWhole(x * 100))),
);

/** Matrix times vector. */
export const times = (M: Matrix, v: readonly number[]) =>
  M.map((row) => row.reduce((s, a, j) => s + a * (v[j] ?? 0), 0));

/**
 * A flows table as LaTeX: rows are the selling sectors, columns the buying sectors, then final
 * demand. `flows[i][j]` is what sector i sells to sector j.
 */
export function flowsTableLatex(flows: Matrix, finalDemand: readonly number[]): string {
  const n = flows.length;
  const names = LABELS.slice(0, n).map((s) => `\\text{${s}}`);
  const head = ` & ${names.join(' & ')} & \\text{Final demand}`;
  const rows = flows.map(
    (row, i) => `${names[i]} & ${row.map((z) => num(z)).join(' & ')} & ${num(finalDemand[i] ?? 0)}`,
  );
  return `\\begin{array}{l|${'c'.repeat(n)}|c} ${head} \\\\ \\hline ${rows.join(' \\\\ ')} \\end{array}`;
}
