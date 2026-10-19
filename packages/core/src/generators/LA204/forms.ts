import { num } from '../format';

/** Helpers for the LA204 generators: quadratic forms, their symmetric matrices and minors. */

/** Answers that are exact at the stated precision, so only the exact value is correct. */
export const EXACT = { tolerance: 0.005, relTolerance: 0 } as const;

/** A symmetric 3×3 matrix: diagonal (p, q, r) and off-diagonal entries d = h₁₂, e = h₁₃, f = h₂₃. */
export interface Sym3 {
  p: number;
  q: number;
  r: number;
  d: number;
  e: number;
  f: number;
}

export const rows3 = (m: Sym3) => [
  [m.p, m.d, m.e],
  [m.d, m.q, m.f],
  [m.e, m.f, m.r],
];

/** The three leading principal minors D₁, D₂, D₃ of a symmetric 3×3 matrix. */
export const minors3 = (m: Sym3): [number, number, number] => [
  m.p,
  m.p * m.q - m.d * m.d,
  m.p * (m.q * m.r - m.f * m.f) - m.d * (m.d * m.r - m.f * m.e) + m.e * (m.d * m.f - m.q * m.e),
];

/** "c·x" with a coefficient of ±1 written without the 1: (1, "x^2") → "x^2", (−3, "xy") → "-3xy". */
const lead = (c: number, x: string) =>
  `${c < 0 ? '-' : ''}${Math.abs(c) === 1 ? '' : num(Math.abs(c))}${x}`;

/** A later term with its sign in front: (3, "xy") → " + 3xy", (−1, "y^2") → " - y^2". */
const later = (c: number, x: string) =>
  `${c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : num(Math.abs(c))}${x}`;

/** ax² + bxy + cy² as LaTeX (a and c are never zero; b is never zero). */
export const formLatex = (a: number, b: number, c: number) =>
  `${lead(a, 'x^2')}${later(b, 'xy')}${later(c, 'y^2')}`;

/** What the signs of the leading principal minors say, for a matrix whose determinant is not 0. */
export function sylvesterVerdict(minors: readonly number[]): {
  name: 'positive definite' | 'negative definite' | 'indefinite';
  latex: string;
} {
  if (minors.every((m) => m > 0))
    return { name: 'positive definite', latex: '\\text{all } D_k > 0' };
  if (minors.every((m, k) => (k % 2 === 0 ? m < 0 : m > 0)))
    return { name: 'negative definite', latex: '\\text{signs } -, +, -' };
  return { name: 'indefinite', latex: '\\text{neither pattern}' };
}

/** A number in brackets when it is negative, for products such as "4 \cdot (-2)". */
export const paren = (x: number, decimals = 2) =>
  x < 0 ? `(${num(x, decimals)})` : num(x, decimals);

/** A number for plain text (a step's "why"), with a Unicode minus sign. */
export const plain = (x: number, decimals = 2) =>
  x < 0 ? `−${num(-x, decimals)}` : num(x, decimals);
