import type { Rng } from '../../engine/rng';
import { type Constraint, gcd, type Point } from '../OP02/lp';

/** Whole amounts of money or output: accept only the exact value. */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/**
 * A production region {x, y ≥ 0, first, second} with four corners, all with whole coordinates:
 * the origin, (X, 0) on the steeper first line, the crossing point, and (0, Y) on the flatter
 * second line.
 */
export interface Region {
  first: Constraint;
  second: Constraint;
  /** Where both lines cross; drawn first so the corner has whole coordinates. */
  x: number;
  y: number;
}

/** Draws a region whose corners all have whole coordinates, or null to try again. */
export function drawRegion(rng: Rng, maxC = 300): Region | null {
  const first = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
  const second = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
  if (first.a * second.b - second.a * first.b <= 0) return null;
  if (gcd(first.a, first.b) !== 1 || gcd(second.a, second.b) !== 1) return null;
  const x = rng.int(2, 30);
  const y = rng.int(2, 30);
  first.c = first.a * x + first.b * y;
  second.c = second.a * x + second.b * y;
  if (first.c % first.a !== 0 || second.c % second.b !== 0) return null;
  if (first.c > maxC || second.c > maxC) return null;
  return { first, second, x, y };
}

/** The three corners other than the origin: on the x-axis, where both lines cross, on the y-axis. */
export function regionCorners(r: Region): [Point, Point, Point] {
  return [
    [r.first.c / r.first.a, 0],
    [r.x, r.y],
    [0, r.second.c / r.second.b],
  ];
}

/** Index of the strictly largest value, or −1 when the largest is shared. */
export function strictArgMax(values: readonly number[]): number {
  const top = Math.max(...values);
  const at = values.indexOf(top);
  return values.lastIndexOf(top) === at ? at : -1;
}
