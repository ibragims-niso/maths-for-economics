import type { Rng } from '../../engine/rng';
import { num } from '../format';

/**
 * Helpers for the MV11 generators: a firm with Q = A·K^α·L^β minimises wL + rK for an output
 * target Q̄. Exponents are fractions α = i/d and β = j/d, so every root in the solution is exact.
 */

/** Tight tolerance for answers that are exact to the stated decimals (no rounding is needed). */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** α = i/d (capital) and β = j/d (labour). Equal halves are left to MV08. */
export const TECHNOLOGIES = [
  { i: 1, j: 3, d: 4 },
  { i: 3, j: 1, d: 4 },
  { i: 1, j: 2, d: 3 },
  { i: 2, j: 1, d: 3 },
  { i: 1, j: 1, d: 4 },
  { i: 1, j: 2, d: 4 },
  { i: 2, j: 1, d: 4 },
  { i: 1, j: 1, d: 3 },
  { i: 3, j: 3, d: 4 },
  { i: 1, j: 2, d: 2 },
  { i: 2, j: 1, d: 2 },
] as const;

export interface CostMin {
  /** Q = A·K^(i/d)·L^(j/d). */
  A: number;
  i: number;
  j: number;
  d: number;
  /** Wage w per worker and rental r per machine. */
  w: number;
  r: number;
  /** The output target Q̄. */
  Q: number;
  /** The cost-minimising inputs, whole numbers: K = g·mᵈ and L = g·nᵈ, so K/L = (m/n)ᵈ. */
  L: number;
  K: number;
  m: number;
  n: number;
}

export const alpha = (p: CostMin) => p.i / p.d;
export const beta = (p: CostMin) => p.j / p.d;
export const degree = (p: CostMin) => (p.i + p.j) / p.d;
export const minCost = (p: CostMin) => p.w * p.L + p.r * p.K;

/**
 * The labour that produces Q̄ when the firm keeps capital per worker at K/L = `ratio`:
 * A·ratio^α·L^(α+β) = Q̄, so L = (Q̄/(A·ratio^α))^(1/(α+β)).
 */
export const labourAtRatio = (p: CostMin, ratio: number, A = p.A) =>
  (p.Q / (A * ratio ** alpha(p))) ** (1 / degree(p));

/** The tangency MRTS = (β/α)·(K/L) = w/r gives K/L = αw/(βr). */
export const tangencyRatio = (p: CostMin) => (p.i * p.w) / (p.j * p.r);

/** Draws a technology, prices and target whose cost-minimising inputs are whole numbers. */
export function drawCostMin(rng: Rng): CostMin | null {
  const { i, j, d } = rng.pick(TECHNOLOGIES);
  // g^s must be whole, s = (i + j)/d: take g = h^q with q the denominator of s in lowest terms.
  const q = d / gcd(i + j, d);
  const h = rng.int(1, q === 1 ? 100 : q === 2 ? 7 : 3);
  const g = h ** q;
  const m = rng.int(1, d === 4 ? 2 : 3);
  const n = rng.int(1, d === 4 ? 2 : 3);
  if (gcd(m, n) !== 1) return null;
  // w/r = (β/α)·(K/L) = (j/i)·(m/n)^d, in lowest terms times a scale t.
  const top = j * m ** d;
  const bottom = i * n ** d;
  const G = gcd(top, bottom);
  const t = rng.int(1, 12);
  const w = (top / G) * t;
  const r = (bottom / G) * t;
  if (w > 150 || r > 150 || w + r < 4) return null;
  const A = rng.int(2, 6);
  const Q = A * h ** ((i + j) / gcd(i + j, d)) * m ** i * n ** j;
  const p: CostMin = { A, i, j, d, w, r, Q, L: g * n ** d, K: g * m ** d, m, n };
  if (p.Q < 10 || p.Q > 20000 || p.L < 2 || p.K < 2 || p.L > 5000 || p.K > 5000) return null;
  if (minCost(p) > 200000) return null;
  return p;
}

/** A fraction as LaTeX, or a whole number when the bottom is 1. */
export function frac(top: number, bottom: number) {
  const g = gcd(top, bottom);
  return bottom / g === 1 ? `${top / g}` : `\\tfrac{${top / g}}{${bottom / g}}`;
}

/** "^{1/4}", "" for 1: an exponent i/d as LaTeX. */
export function power(top: number, bottom: number) {
  const g = gcd(top, bottom);
  return bottom / g === 1 && top / g === 1 ? '' : `^{${plainFrac(top, bottom)}}`;
}

/** The production function as LaTeX, e.g. "5K^{1/3}L^{2/3}". */
export const technologyLatex = (p: CostMin) => `${num(p.A)}K${power(p.i, p.d)}L${power(p.j, p.d)}`;

/** A fraction in plain text for the "why" lines: "3/4", or "2" when it is whole. */
export function plainFrac(top: number, bottom: number) {
  const g = gcd(top, bottom);
  return bottom / g === 1 ? `${top / g}` : `${top / g}/${bottom / g}`;
}

/** "L^{3/4}", or "L" when the power is 1. */
export const raised = (symbol: string, top: number, bottom: number) =>
  `${symbol}${power(top, bottom)}`;
