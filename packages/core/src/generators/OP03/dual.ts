import { num } from '../format';
import { type Constraint, cross, gcd, lhs, type Point } from '../OP02/lp';

/** Answers to 2 decimal places: accept a student who rounds the other way in the last digit. */
export const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;
/** Whole amounts of money: accept only the exact value. */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/**
 * The shadow prices (u, v) of two machines k and l when both products are made, so both dual
 * constraints hold with equality: k.a·u + l.a·v = p (first product), k.b·u + l.b·v = q (second).
 */
export function dualPrices(k: Constraint, l: Constraint, p: number, q: number): Point | null {
  return cross({ a: k.a, b: l.a, c: p }, { a: k.b, b: l.b, c: q });
}

/** n/d as LaTeX: a whole number, or a reduced fraction followed by its 2-decimal value. */
export function fraction(n: number, d: number): string {
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d) || 1;
  const [top, bottom] = [(s * n) / g, (s * d) / g];
  if (bottom === 1) return num(top);
  const sign = top < 0 ? '-' : '';
  const exact = Math.abs(Math.round((top / bottom) * 100) / 100 - top / bottom) < 1e-9;
  return `${sign}\\tfrac{${num(Math.abs(top))}}{${num(bottom)}} ${exact ? '=' : '\\approx'} ${num(top / bottom)}`;
}

/**
 * The two dual equations and their solution as LaTeX, e.g.
 * "{ y_A + y_B = 30, y_A + 2y_B = 40 } ⇒ y_A = 20, y_B = 10".
 */
export function dualSolution(
  k: Constraint,
  l: Constraint,
  p: number,
  q: number,
  names: [string, string],
): string {
  const [u, v] = names;
  const det = k.a * l.b - l.a * k.b;
  const nu = p * l.b - l.a * q;
  const nv = k.a * q - k.b * p;
  return `\\begin{cases} ${lhs(k.a, l.a, u, v)} = ${num(p)} \\\\ ${lhs(k.b, l.b, u, v)} = ${num(q)} \\end{cases} \\Rightarrow ${u} = ${fraction(nu, det)},\\; ${v} = ${fraction(nv, det)}`;
}
