import { num } from '../format';

/**
 * Helpers for the F01 Cobb–Douglas generators. An exponent p/q is applied to X = root^q, so
 * X^(p/q) = root^p is always a whole number.
 */

/** The exponent as LaTeX: "1/3", or "0.25" when shown as a decimal. */
export function exponentLatex(p: number, q: number, asDecimal: boolean): string {
  return asDecimal ? num(p / q) : `${p}/${q}`;
}

/** The q-th root as LaTeX: \sqrt{x} for square roots, \sqrt[q]{x} otherwise. */
export function rootLatex(q: number, x: number): string {
  return q === 2 ? `\\sqrt{${num(x)}}` : `\\sqrt[${q}]{${num(x)}}`;
}

/** Working for X^(p/q) with X = root^q, e.g. "\left(\sqrt[3]{125}\right)^{2} = 5^{2} = 25". */
export function powerWorking(root: number, p: number, q: number): string {
  const x = root ** q;
  if (p === 1) return `${rootLatex(q, x)} = ${num(root)}`;
  return `\\left(${rootLatex(q, x)}\\right)^{${p}} = ${num(root)}^{${p}} = ${num(root ** p)}`;
}

/** Tight tolerance for whole-number answers that are exact (no rounding is needed). */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;
