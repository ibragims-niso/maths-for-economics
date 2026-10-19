import type { Rng } from '../../engine/rng';
import { num } from '../format';

/** Helpers for the MV08 generators: Cobb–Douglas utility U = x^a·y^b on a budget p_x·x + p_y·y = M. */

/** Tight tolerance for answers that are exact to the stated decimals (no rounding is needed). */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** A budget whose Cobb–Douglas optimum is a whole bundle. */
export interface Budget {
  px: number;
  py: number;
  M: number;
  /** The utility-maximising quantities, both whole numbers. */
  x: number;
  y: number;
}

/**
 * Draws prices and an income so that the optimum of U = x^a·y^b is whole. The consumer spends the
 * share wa/(wa + wb) of income on x, so with M = (ua + ub)·s (ua : ub = wa : wb in lowest terms)
 * spending on x is ua·s and on y is ub·s; s is a multiple of what makes both quantities whole.
 * Returns null when no income in [minIncome, maxIncome] works for the drawn prices.
 */
export function drawBudget(
  rng: Rng,
  wa: number,
  wb: number,
  { minIncome, maxIncome, maxPrice }: { minIncome: number; maxIncome: number; maxPrice: number },
): Budget | null {
  const g = gcd(wa, wb);
  const ua = wa / g;
  const ub = wb / g;
  const px = rng.int(2, maxPrice);
  const py = rng.int(2, maxPrice);
  if (px === py) return null;
  const step = lcm(px / gcd(ua, px), py / gcd(ub, py));
  const unit = (ua + ub) * step;
  const kMin = Math.ceil(minIncome / unit);
  const kMax = Math.floor(maxIncome / unit);
  if (kMax < kMin) return null;
  const s = rng.int(kMin, kMax) * step;
  return { px, py, M: (ua + ub) * s, x: (ua * s) / px, y: (ub * s) / py };
}

/** "x^{0.3}y^{0.7}", "x^2y", "xy": the utility function as LaTeX. */
export const utilityLatex = (a: number, b: number) =>
  `${a === 1 ? 'x' : `x^{${num(a)}}`}${b === 1 ? 'y' : `y^{${num(b)}}`}`;

/** "a·x^(a−1)·y^b" as LaTeX, the partial derivative of x^a·y^b with respect to x. */
export function partialLatex(a: number, b: number, wrt: 'x' | 'y') {
  const [e, f] = wrt === 'x' ? [a, b] : [b, a];
  const lead = e === 1 ? '' : `${num(e)}\\,`;
  const down = e === 1 ? '' : e === 2 ? wrt : `${wrt}^{${num(e - 1)}}`;
  const otherVar = wrt === 'x' ? 'y' : 'x';
  const keep = f === 1 ? otherVar : `${otherVar}^{${num(f)}}`;
  const body = wrt === 'x' ? `${down}${keep}` : `${keep}${down}`;
  return `${lead}${body}`;
}

/** "MRS = a·y/(b·x)" as LaTeX, with coefficients of 1 left out. */
export const mrsLatex = (a: number, b: number) =>
  `\\dfrac{${a === 1 ? '' : `${num(a)}\\,`}y}{${b === 1 ? '' : `${num(b)}\\,`}x}`;
