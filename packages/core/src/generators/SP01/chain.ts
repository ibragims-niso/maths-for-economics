import { num } from '../format';
import type { Matrix } from '../LA102/matrix';

/** Shares and probabilities to 4 decimal places. */
export const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

/** A matrix given in whole per cent, as probabilities: 96 → 0.96. */
export const fromPercent = (rows: Matrix): number[][] => rows.map((r) => r.map((x) => x / 100));

/** One period of a Markov chain: the row vector of shares v times the transition matrix P. */
export function nextShares(v: readonly number[], m: Matrix): number[] {
  return (m[0] ?? []).map((_, j) => v.reduce((s, vi, i) => s + vi * (m[i]?.[j] ?? 0), 0));
}

/** A row vector of shares in LaTeX, e.g. "(0.84,\ 0.16)". */
export function sharesLatex(v: readonly number[], decimals = 6): string {
  return `\\left(${v.map((x) => num(x, decimals)).join(',\\ ')}\\right)`;
}

/** "= 0.136" when the value has at most 4 decimals, otherwise "= 0.12345678 \approx 0.1235". */
export function equalsRounded(exact: number, decimals = 4): string {
  const rounded = Number(exact.toFixed(decimals));
  return Math.abs(exact - rounded) < 1e-12
    ? `= ${num(rounded, decimals)}`
    : `= ${num(exact, 10)} \\approx ${num(rounded, decimals)}`;
}
