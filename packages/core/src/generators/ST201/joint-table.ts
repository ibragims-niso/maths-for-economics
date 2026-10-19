import type { Rng } from '../../engine/rng';
import { num } from '../format';

/** What X and Y measure: two shares' monthly returns, or a household's income and spending. */
export type TableContext = 'shares' | 'spending';

/** A joint probability table for X (rows) and Y (columns). */
export interface JointTable {
  context: TableContext;
  /** Values of X, lowest first. */
  xs: number[];
  /** Values of Y, lowest first. */
  ys: number[];
  /** cells[i][j] = P(X = xs[i], Y = ys[j]) in hundredths (multiples of 5, adding up to 100). */
  cells: number[][];
}

export const prob = (c: number) => c / 100;
export const cell = (t: JointTable, i: number, j: number) => t.cells[i]?.[j] ?? 0;

/** P(X = xs[i]) in hundredths: the row total. */
export const rowTotal = (t: JointTable, i: number) => (t.cells[i] ?? []).reduce((s, c) => s + c, 0);

/** P(Y = ys[j]) in hundredths: the column total. */
export const colTotal = (t: JointTable, j: number) =>
  t.cells.reduce((s, row) => s + (row[j] ?? 0), 0);

/** Distinct values from `draw`, sorted from lowest to highest. */
function distinctSorted(n: number, draw: () => number): number[] {
  for (;;) {
    const vs = Array.from({ length: n }, draw).sort((a, b) => a - b);
    if (new Set(vs).size === n) return vs;
  }
}

/**
 * A 2×2 or 2×3 table: every cell at least 0.05, in steps of 0.05, no cell above 0.45.
 * Shares: returns in % (multiples of 5 from −20 to 30). Spending: income 1–8 (thousands),
 * spending on eating out 0–6 (hundreds).
 */
export function drawJointTable(rng: Rng, context: TableContext): JointTable {
  const cols = rng.pick([2, 3] as const);
  for (;;) {
    const units = Array<number>(2 * cols).fill(1);
    for (let k = 0; k < 20 - 2 * cols; k++) {
      const at = rng.int(0, units.length - 1);
      units[at] = (units[at] ?? 0) + 1;
    }
    if (Math.max(...units) > 9) continue;
    const cells = [units.slice(0, cols).map((u) => u * 5), units.slice(cols).map((u) => u * 5)];
    const xs =
      context === 'shares'
        ? distinctSorted(2, () => rng.int(-4, 6) * 5)
        : distinctSorted(2, () => rng.int(1, 8));
    const ys =
      context === 'shares'
        ? distinctSorted(cols, () => rng.int(-4, 6) * 5)
        : distinctSorted(cols, () => rng.int(0, 6));
    return { context, xs, ys, cells };
  }
}

/** The opening sentence that says what X and Y are. */
export function tableLead(t: JointTable): string {
  return t.context === 'shares'
    ? 'The monthly returns, in %, of two shares, $X$ for share A and $Y$ for share B, have this joint distribution:'
    : 'A survey records each household’s monthly income $X$ (in thousands) and its monthly spending on eating out $Y$ (in hundreds). Their joint distribution is:';
}

/** The table as a LaTeX array: one row per value of X, one column per value of Y. */
export function tableLatex(t: JointTable): string {
  const head = ['', ...t.ys.map((y) => `Y = ${num(y)}`)].join(' & ');
  const rows = t.xs.map((x, i) =>
    [`X = ${num(x)}`, ...t.ys.map((_, j) => num(prob(cell(t, i, j))))].join(' & '),
  );
  return `\\begin{array}{c|${'c'.repeat(t.ys.length)}} ${head} \\\\ \\hline ${rows.join(' \\\\ ')} \\end{array}`;
}

/** A number in a product, in brackets when negative: (−5). */
export const paren = (x: number) => (x < 0 ? `(${num(x)})` : num(x));
