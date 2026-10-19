import { num } from '../format';

/**
 * A linear expression written naturally: an optional constant, then coefficient–variable terms,
 * e.g. linear(20, [[-3, 'p_1'], [1, 'p_2']]) gives "20 - 3p_1 + p_2". Zero terms are left out.
 */
export function linear(
  constant: number | null,
  terms: readonly (readonly [number, string])[],
  decimals = 2,
): string {
  let text = constant === null || constant === 0 ? '' : num(constant, decimals);
  for (const [coef, variable] of terms) {
    if (coef === 0) continue;
    const size = Math.abs(coef) === 1 ? '' : num(Math.abs(coef), decimals);
    if (text === '') text = `${coef < 0 ? '-' : ''}${size}${variable}`;
    else text += ` ${coef < 0 ? '-' : '+'} ${size}${variable}`;
  }
  return text === '' ? '0' : text;
}

/** A number in brackets when it is negative, for products such as "3 \cdot (-2)". */
export const paren = (x: number, decimals = 2) =>
  x < 0 ? `(${num(x, decimals)})` : num(x, decimals);

/** A number for plain text (a step's "why"), with a Unicode minus sign. */
export const plain = (x: number, decimals = 2) =>
  x < 0 ? `−${num(-x, decimals)}` : num(x, decimals);
