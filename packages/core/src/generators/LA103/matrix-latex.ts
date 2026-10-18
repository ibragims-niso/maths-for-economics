import { num } from '../format';

/** A coefficient: a number, or a LaTeX string such as "k - 3" for an entry with a parameter. */
export type Entry = number | string;

/** One equation of a system, e.g. [2, -1, 0] with ["P_1", "P_2", "P_3"] and 10 → "2P_1 - P_2 = 10". */
export function equation(coefs: readonly Entry[], names: readonly string[], rhs: Entry): string {
  let left = '';
  coefs.forEach((c, i) => {
    const name = names[i] ?? '';
    if (typeof c === 'string') {
      const factor = /^[a-z]$/.test(c) ? c : `(${c})`;
      left += `${left ? ' + ' : ''}${factor}${name}`;
      return;
    }
    if (c === 0) return;
    const size = Math.abs(c) === 1 ? '' : num(Math.abs(c));
    if (!left) left = `${c < 0 ? '-' : ''}${size}${name}`;
    else left += ` ${c < 0 ? '-' : '+'} ${size}${name}`;
  });
  return `${left || '0'} = ${typeof rhs === 'number' ? num(rhs) : rhs}`;
}

/** A system as one brace of equations, for a question stem. */
export function system(
  rows: readonly (readonly Entry[])[],
  names: readonly string[],
  rhs: readonly Entry[],
): string {
  const lines = rows.map((r, i) => equation(r, names, rhs[i] ?? 0));
  return `\\begin{cases} ${lines.join(' \\\\ ')} \\end{cases}`;
}

const cell = (e: Entry) => (typeof e === 'number' ? num(e) : e);

/** An augmented matrix [A | b] in LaTeX. */
export function augmented(rows: readonly (readonly Entry[])[], rhs: readonly Entry[]): string {
  const width = rows[0]?.length ?? 0;
  const body = rows.map((r, i) => [...r.map(cell), cell(rhs[i] ?? 0)].join(' & ')).join(' \\\\ ');
  return `\\left[\\begin{array}{${'r'.repeat(width)}|r} ${body} \\end{array}\\right]`;
}

/**
 * The row operation that subtracts m times row `source` from row `target`, written the way a
 * student would: "R_2 - 2R_1", "R_3 + R_1" (for m = −1).
 */
export function rowOp(target: number, m: number, source: number): string {
  const size = Math.abs(m) === 1 ? '' : num(Math.abs(m));
  return `R_${target} ${m > 0 ? '-' : '+'} ${size}R_${source}`;
}

/** "k - 3", "k + 2" or "k": the parameter k minus a number. */
export function kMinus(v: number): string {
  if (v === 0) return 'k';
  return v > 0 ? `k - ${num(v)}` : `k + ${num(-v)}`;
}

/** "+ 20", "- 7" or "" for a known part moved next to the unknown term. */
export function signed(v: number): string {
  if (v === 0) return '';
  return v > 0 ? ` + ${num(v)}` : ` - ${num(-v)}`;
}

/** "3y", "y" or "-y": a coefficient times an unknown. */
export function term(c: number, name: string): string {
  if (c === 1) return name;
  if (c === -1) return `-${name}`;
  return `${num(c)}${name}`;
}

/** "y = \dfrac{80}{4} = 20", or "y = 20" when the pivot is 1. */
export function divideByPivot(name: string, top: number, pivot: number, value: number): string {
  if (pivot === 1) return `${name} = ${num(value)}`;
  return `${name} = \\dfrac{${num(top)}}{${num(pivot)}} = ${num(value)}`;
}

/** The same row operation in plain text: "row 2 − 2 × row 1", "row 3 + row 1". */
export function rowOpText(target: number, m: number, source: number): string {
  const size = Math.abs(m) === 1 ? '' : `${num(Math.abs(m))} × `;
  return `row ${target} ${m > 0 ? '−' : '+'} ${size}row ${source}`;
}

/** A number in plain text with a real minus sign: −2. */
export function plain(v: number): string {
  return v < 0 ? `−${num(-v)}` : num(v);
}
