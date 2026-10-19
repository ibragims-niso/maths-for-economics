import { num } from '../format';

/** Helpers for the MV10 generators on perfect complements, U = min(a·x, b·y). */

/** Tight tolerance for answers that are exact to the stated decimals. */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** "ax" written naturally: "x", "3x". */
export const term = (c: number, v: string) => `${c === 1 ? '' : num(c)}${v}`;

/** "\min(3x,\ 2y)" as LaTeX. */
export const minLatex = (a: number, b: number) => `\\min(${term(a, 'x')},\\ ${term(b, 'y')})`;

/** "\dfrac{a}{b}", or a whole number when b divides a. */
export const ratioLatex = (a: number, b: number) =>
  a % b === 0 ? num(a / b) : `\\dfrac{${num(a)}}{${num(b)}}`;

/** "p_x + \frac{a}{b}p_y": the price of one complete set of the goods, as LaTeX. */
export const setPriceLatex = (a: number, b: number, own = 'x', other = 'y') =>
  `p_${own} + ${a % b === 0 ? (a / b === 1 ? '' : num(a / b)) : `\\tfrac{${num(a)}}{${num(b)}}`}p_${other}`;
