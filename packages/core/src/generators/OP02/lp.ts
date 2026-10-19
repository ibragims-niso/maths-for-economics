import { num } from '../format';

/** A constraint a·x + b·y ≤ c (or ≥ c in a minimisation) in two decision variables. */
export interface Constraint {
  a: number;
  b: number;
  c: number;
}

export type Point = [number, number];

export const gcd = (m: number, n: number): number => (n === 0 ? Math.abs(m) : gcd(n, m % n));

/** "2x + 3y", "x + y": the left-hand side of a constraint or objective. */
export function lhs(a: number, b: number, x = 'x', y = 'y'): string {
  const term = (k: number, v: string) => `${k === 1 ? '' : num(k)}${v}`;
  return `${term(a, x)} + ${term(b, y)}`;
}

/** A constraint as LaTeX, e.g. "2x + y \le 40". */
export const inequality = (k: Constraint, sign: '\\le' | '\\ge' = '\\le') =>
  `${lhs(k.a, k.b)} ${sign} ${num(k.c)}`;

/** c/a as LaTeX: a plain number when it divides, else a small fraction. */
export const ratio = (c: number, a: number) =>
  c % a === 0 ? num(c / a) : `\\tfrac{${num(c)}}{${num(a)}}`;

/** The point where the two constraint lines cross (Cramer's rule), or null if parallel. */
export function cross(k: Constraint, l: Constraint): Point | null {
  const det = k.a * l.b - l.a * k.b;
  if (det === 0) return null;
  return [(k.c * l.b - l.c * k.b) / det, (k.a * l.c - l.a * k.c) / det];
}

/** The value of p·x + q·y at a point. */
export const value = (p: number, q: number, [x, y]: Point) => p * x + q * y;

/** A point as LaTeX, e.g. "(16, 8)". */
export const point = ([x, y]: Point) => `(${num(x)}, ${num(y)})`;

/**
 * Every corner of the feasible region {x, y ≥ 0 and each constraint}: the feasible points where two
 * of the boundary lines (the constraints and the two axes) cross. `sense` is "le" for ≤ constraints
 * and "ge" for ≥ constraints.
 */
export function corners(constraints: readonly Constraint[], sense: 'le' | 'ge'): Point[] {
  const lines: Constraint[] = [{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }, ...constraints];
  const eps = 1e-9;
  const ok = ([x, y]: Point) =>
    x >= -eps &&
    y >= -eps &&
    constraints.every((k) =>
      sense === 'le' ? k.a * x + k.b * y <= k.c + eps : k.a * x + k.b * y >= k.c - eps,
    );
  const found: Point[] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const li = lines[i];
      const lj = lines[j];
      if (!li || !lj) continue;
      const pt = cross(li, lj);
      if (!pt || !ok(pt)) continue;
      if (found.some(([x, y]) => Math.abs(x - pt[0]) < eps && Math.abs(y - pt[1]) < eps)) continue;
      found.push(pt);
    }
  }
  return found;
}
