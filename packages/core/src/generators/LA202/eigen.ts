import { num } from '../format';

/** A 2×2 matrix with rows (a, b) and (c, d). */
export interface Matrix2 {
  a: number;
  b: number;
  c: number;
  d: number;
}

export const trace2 = (m: Matrix2) => m.a + m.d;
export const det2 = (m: Matrix2) => m.a * m.d - m.b * m.c;

/** The rows of the matrix, for pmatrix(). */
export const rows2 = (m: Matrix2) => [
  [m.a, m.b],
  [m.c, m.d],
];

/** "+ 3" or "- 3": a term added to an expression, with its sign written out. */
const signed = (x: number, suffix = '') => {
  if (x === 0) return '';
  const size = Math.abs(x) === 1 && suffix ? '' : num(Math.abs(x));
  return ` ${x < 0 ? '-' : '+'} ${size}${suffix}`;
};

/** The characteristic polynomial λ² − Tλ + D written naturally, e.g. "\lambda^2 - 7\lambda + 10". */
export const charPolyLatex = (t: number, d: number) =>
  `\\lambda^2${signed(-t, '\\lambda')}${signed(d)}`;

/** A number for plain text (a step's "why"), with a Unicode minus sign. */
export const plain = (x: number) => (x < 0 ? `−${num(-x)}` : num(x));

/** A number for plain text, in brackets when it is negative. */
export const bracket = (x: number) => (x < 0 ? `(${plain(x)})` : plain(x));

/** A number in brackets when it is negative, for products such as "4 \cdot (-2)". */
export const paren = (x: number) => (x < 0 ? `(${num(x)})` : num(x));
