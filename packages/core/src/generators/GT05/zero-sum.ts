import type { Rng } from '../../engine/rng';
import { num } from '../format';

/**
 * A two-player zero-sum game given by one payoff matrix: `a[i][j]` is what the row player A
 * wins from the column player B when A plays row i and B plays column j (B loses the same).
 */
export type PayoffMatrix = number[][];

/** Who the two players are, what the entries measure, and the names of their choices. */
export type ZeroSumContext = 'campaign' | 'tv' | 'promotion';

export const ZERO_SUM_CONTEXTS: Readonly<
  Record<ZeroSumContext, { intro: string; unit: string; labels: [string, string, string] }>
> = {
  campaign: {
    intro:
      'Two firms, A and B, fight over a market of fixed size. Each picks a marketing campaign without seeing the other’s choice.',
    unit: 'the percentage points of market share that A wins from B',
    labels: ['Price cut', 'Advertising', 'Loyalty scheme'],
  },
  tv: {
    intro: 'Two TV channels, A and B, each choose what to show in the Saturday evening slot.',
    unit: 'the thousands of viewers that A wins from B',
    labels: ['Film', 'Sport', 'Quiz show'],
  },
  promotion: {
    intro:
      'Two coffee chains, A and B, each choose this week’s promotion without seeing the other’s choice.',
    unit: 'the hundreds of customers a week that A wins from B',
    labels: ['Discount', 'Loyalty card', 'Free refill'],
  },
};

export const CONTEXT_IDS = ['campaign', 'tv', 'promotion'] as const;

export const rowsOf = (a: PayoffMatrix) => a.length;
export const colsOf = (a: PayoffMatrix) => a[0]?.length ?? 0;
export const entry = (a: PayoffMatrix, i: number, j: number) => a[i]?.[j] ?? 0;
const indices = (n: number) => Array.from({ length: n }, (_, k) => k);

/** The worst A can get from each row (B answers with the column that hurts A most). */
export const rowMinima = (a: PayoffMatrix) =>
  indices(rowsOf(a)).map((i) => Math.min(...indices(colsOf(a)).map((j) => entry(a, i, j))));

/** The worst B can suffer from each column (A answers with the row that pays A most). */
export const colMaxima = (a: PayoffMatrix) =>
  indices(colsOf(a)).map((j) => Math.max(...indices(rowsOf(a)).map((i) => entry(a, i, j))));

/** Lower value: the most A can guarantee with a pure strategy, max over rows of the row minima. */
export const maximin = (a: PayoffMatrix) => Math.max(...rowMinima(a));

/** Upper value: the least B can hold A to with a pure strategy, min over columns of the column maxima. */
export const minimax = (a: PayoffMatrix) => Math.min(...colMaxima(a));

/** The indices where `values` reach `target`. */
export const argWhere = (values: number[], target: number) =>
  values.flatMap((v, k) => (v === target ? [k] : []));

/** A matrix of whole numbers from `min` to `max`. */
export function drawMatrix(rng: Rng, m: number, n: number, min: number, max: number): PayoffMatrix {
  return indices(m).map(() => indices(n).map(() => rng.int(min, max)));
}

/**
 * The solution of a 2×2 game with no saddle point. With D = a11 − a12 − a21 + a22:
 * p = (a22 − a21)/D is A's probability of row 1, q = (a22 − a12)/D is B's probability of
 * column 1, and the value is v = (a11·a22 − a12·a21)/D.
 */
export function solve2x2(a: PayoffMatrix): { p: number; q: number; v: number; d: number } {
  const [a11, a12, a21, a22] = [entry(a, 0, 0), entry(a, 0, 1), entry(a, 1, 0), entry(a, 1, 1)];
  const d = a11 - a12 - a21 + a22;
  return { p: (a22 - a21) / d, q: (a22 - a12) / d, v: (a11 * a22 - a12 * a21) / d, d };
}

/** The 2×2 value is an exact decimal with at most `decimals` places. */
export function valueIsExact(a: PayoffMatrix, decimals: number): boolean {
  const { d } = solve2x2(a);
  const top = entry(a, 0, 0) * entry(a, 1, 1) - entry(a, 0, 1) * entry(a, 1, 0);
  return d !== 0 && (top * 10 ** decimals) % d === 0;
}

/** The payoff matrix in LaTeX, A's choices as rows and B's as columns. */
export function matrixLatex(a: PayoffMatrix, labels: readonly string[]): string {
  const n = colsOf(a);
  const head = `\\text{A}\\backslash\\text{B} & ${indices(n)
    .map((j) => `\\text{${labels[j]}}`)
    .join(' & ')}`;
  const rows = indices(rowsOf(a)).map(
    (i) =>
      `\\text{${labels[i]}} & ${indices(n)
        .map((j) => num(entry(a, i, j)))
        .join(' & ')}`,
  );
  return `\\begin{array}{c|${'c'.repeat(n)}} ${head} \\\\ \\hline ${rows.join(' \\\\ ')} \\end{array}`;
}

/** "−1,\ 2,\ −2": a list of numbers for a step. */
export const listLatex = (values: number[]) => values.map((v) => num(v)).join(',\\ ');

/** A fraction top/bottom with a positive denominator, then "=" or "≈" its rounded value. */
export function fractionLatex(top: number, bottom: number, value: number, decimals: number) {
  const [t, b] = bottom < 0 ? [-top, -bottom] : [top, bottom];
  const exact = Math.abs(value * 10 ** decimals - Math.round(value * 10 ** decimals)) < 1e-9;
  return `\\frac{${num(t)}}{${num(b)}} ${exact ? '=' : '\\approx'} ${num(value, decimals)}`;
}

/** A number in a product, in brackets when it is negative: "(−2)". */
export const paren = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/** "4p - 2(1 - p)": the expected gain of a mix that puts weight x on the first number. */
export const mixLatex = (first: number, second: number, x: string) =>
  `${num(first)}${x} ${second < 0 ? '-' : '+'} ${num(Math.abs(second))}(1 - ${x})`;

/** The 2×2 value as a fraction (a11·a22 − a12·a21)/D, written with a positive denominator. */
export function valueFractionLatex(a: PayoffMatrix): string {
  const [a11, a12, a21, a22] = [entry(a, 0, 0), entry(a, 0, 1), entry(a, 1, 0), entry(a, 1, 1)];
  const { d } = solve2x2(a);
  const top =
    d > 0
      ? `${paren(a11)} \\cdot ${paren(a22)} - ${paren(a12)} \\cdot ${paren(a21)}`
      : `${paren(a12)} \\cdot ${paren(a21)} - ${paren(a11)} \\cdot ${paren(a22)}`;
  return `\\frac{${top}}{${num(Math.abs(d))}}`;
}
