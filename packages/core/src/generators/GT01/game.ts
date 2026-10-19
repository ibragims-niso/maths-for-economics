import type { Rng } from '../../engine/rng';
import { num } from '../format';

/**
 * A two-player game in normal form: firm A picks a row, firm B picks a column.
 * `a[r][c]` is A's payoff and `b[r][c]` is B's payoff when A plays row r and B plays column c.
 */
export interface Bimatrix {
  a: number[][];
  b: number[][];
}

export type Cell = [row: number, col: number];

/** What the two firms choose; the labels name the rows and columns. */
export type GameContext = 'price' | 'advertising' | 'capacity' | 'standard';

export const GAME_CONTEXTS: Readonly<
  Record<GameContext, { intro: string; labels: Record<2 | 3, string[]> }>
> = {
  price: {
    intro: 'Two firms, A and B, each set a price without seeing the other’s choice.',
    labels: { 2: ['Low', 'High'], 3: ['Low', 'Medium', 'High'] },
  },
  advertising: {
    intro: 'Two firms, A and B, each choose an advertising budget at the same time.',
    labels: { 2: ['None', 'Heavy'], 3: ['None', 'Some', 'Heavy'] },
  },
  capacity: {
    intro: 'Two firms, A and B, each choose the size of a new plant at the same time.',
    labels: { 2: ['Small', 'Large'], 3: ['Small', 'Medium', 'Large'] },
  },
  standard: {
    intro:
      'Two firms, A and B, each choose a technology standard for their product at the same time.',
    labels: { 2: ['X', 'Y'], 3: ['X', 'Y', 'Z'] },
  },
};

export const size = (g: Bimatrix) => g.a.length;
export const payA = (g: Bimatrix, r: number, c: number) => g.a[r]?.[c] ?? 0;
export const payB = (g: Bimatrix, r: number, c: number) => g.b[r]?.[c] ?? 0;
const indices = (n: number) => Array.from({ length: n }, (_, k) => k);

/** A's best replies to column c: the rows with the highest payoff for A in that column. */
export function bestRows(g: Bimatrix, c: number): number[] {
  const rows = indices(size(g));
  const top = Math.max(...rows.map((r) => payA(g, r, c)));
  return rows.filter((r) => payA(g, r, c) === top);
}

/** B's best replies to row r: the columns with the highest payoff for B in that row. */
export function bestCols(g: Bimatrix, r: number): number[] {
  const cols = indices(size(g));
  const top = Math.max(...cols.map((c) => payB(g, r, c)));
  return cols.filter((c) => payB(g, r, c) === top);
}

/** Every best reply is unique: no ties in a column of A's payoffs or a row of B's. */
export function strictReplies(g: Bimatrix): boolean {
  return indices(size(g)).every((k) => bestRows(g, k).length === 1 && bestCols(g, k).length === 1);
}

/** The cells where A's row is a best reply to B's column and B's column a best reply to A's row. */
export function pureEquilibria(g: Bimatrix): Cell[] {
  const n = size(g);
  const cells: Cell[] = [];
  for (const r of indices(n))
    for (const c of indices(n))
      if (bestRows(g, c).includes(r) && bestCols(g, r).includes(c)) cells.push([r, c]);
  return cells;
}

/** Cells where exactly one or both players are best-responding (at least one underline). */
export function underlinedCells(g: Bimatrix): Cell[] {
  const n = size(g);
  const cells: Cell[] = [];
  for (const r of indices(n))
    for (const c of indices(n))
      if (bestRows(g, c).includes(r) || bestCols(g, r).includes(c)) cells.push([r, c]);
  return cells;
}

/** A's strictly dominant row, if it has one: better than every other row against every column. */
export function dominantRow(g: Bimatrix): number | undefined {
  const n = size(g);
  return indices(n).find((r) =>
    indices(n).every((o) => o === r || indices(n).every((c) => payA(g, r, c) > payA(g, o, c))),
  );
}

/** B's strictly dominant column, if it has one. */
export function dominantCol(g: Bimatrix): number | undefined {
  const n = size(g);
  return indices(n).find((c) =>
    indices(n).every((o) => o === c || indices(n).every((r) => payB(g, r, c) > payB(g, r, o))),
  );
}

/** The index with the largest value, or undefined if that largest value is tied. */
function uniqueArgMax(values: number[]): number | undefined {
  const top = Math.max(...values);
  const at = values.flatMap((v, k) => (v === top ? [k] : []));
  return at.length === 1 ? at[0] : undefined;
}

/**
 * The cautious (max-min) cell: A takes the row whose worst payoff is highest and B the column
 * whose worst payoff is highest. Undefined if either choice is tied.
 */
export function maximinCell(g: Bimatrix): Cell | undefined {
  const n = size(g);
  const r = uniqueArgMax(indices(n).map((i) => Math.min(...indices(n).map((c) => payA(g, i, c)))));
  const c = uniqueArgMax(indices(n).map((j) => Math.min(...indices(n).map((i) => payB(g, i, j)))));
  return r === undefined || c === undefined ? undefined : [r, c];
}

/** The cell with the highest total payoff A + B, or undefined if tied. */
export function jointBestCell(g: Bimatrix): Cell | undefined {
  const n = size(g);
  const cells = indices(n * n).map((k) => [Math.floor(k / n), k % n] as Cell);
  const at = uniqueArgMax(cells.map(([r, c]) => payA(g, r, c) + payB(g, r, c)));
  return at === undefined ? undefined : cells[at];
}

/** An n×n game with whole payoffs from 0 to `max` for both players. */
export function drawGame(rng: Rng, n: number, max: number): Bimatrix {
  const draw = () => indices(n).map(() => indices(n).map(() => rng.int(0, max)));
  return { a: draw(), b: draw() };
}

/** The payoff table in LaTeX: A's choices as rows, B's as columns, cells "(A's, B's)". */
export function bimatrixLatex(g: Bimatrix, labels: readonly string[]): string {
  const n = size(g);
  const head = `\\text{A}\\backslash\\text{B} & ${labels.map((l) => `\\text{${l}}`).join(' & ')}`;
  const rows = indices(n).map(
    (r) =>
      `\\text{${labels[r]}} & ${indices(n)
        .map((c) => `(${num(payA(g, r, c))},\\ ${num(payB(g, r, c))})`)
        .join(' & ')}`,
  );
  return `\\begin{array}{c|${'c'.repeat(n)}} ${head} \\\\ \\hline ${rows.join(' \\\\ ')} \\end{array}`;
}

/** "B: Low → A: Medium (7); …": the best reply of A to each column, with A's payoff. */
export function bestRowsLatex(g: Bimatrix, labels: readonly string[]): string {
  return indices(size(g))
    .map((c) => {
      const r = bestRows(g, c)[0] ?? 0;
      return `\\text{B: ${labels[c]}} \\to \\text{A: ${labels[r]}}\\ (${num(payA(g, r, c))})`;
    })
    .join(';\\ ');
}

/** The best reply of B to each row, with B's payoff. */
export function bestColsLatex(g: Bimatrix, labels: readonly string[]): string {
  return indices(size(g))
    .map((r) => {
      const c = bestCols(g, r)[0] ?? 0;
      return `\\text{A: ${labels[r]}} \\to \\text{B: ${labels[c]}}\\ (${num(payB(g, r, c))})`;
    })
    .join(';\\ ');
}

/** "(Medium, Medium)": a cell named by its row and column labels. */
export const cellName = (labels: readonly string[], [r, c]: Cell) =>
  `(\\text{${labels[r]}},\\ \\text{${labels[c]}})`;
