import { withinTolerance } from '../engine/grading';
import type { Distractor } from '../engine/types';

/** A number for LaTeX: trims needless zeros and uses a thin-space thousands separator. */
export function num(value: number, decimals = 2): string {
  const fixed = Number(value.toFixed(decimals));
  const [int = '0', frac] = Math.abs(fixed).toString().split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
  return `${fixed < 0 ? '-' : ''}${grouped}${frac ? `.${frac}` : ''}`;
}

/** "a - bP" written naturally: "100 - 2P", "100 - P". */
export function linearDemand(a: number, b: number, variable = 'P'): string {
  return `${num(a)} - ${b === 1 ? '' : num(b)}${variable}`;
}

/** Drops distractors equal to the answer or to an earlier distractor (docs/04). */
export function cleanDistractors(
  answer: number,
  candidates: Distractor[],
  tolerance?: number,
): Distractor[] {
  const kept: Distractor[] = [];
  for (const d of candidates) {
    if (!Number.isFinite(d.value)) continue;
    if (withinTolerance(d.value, answer, tolerance)) continue;
    if (kept.some((k) => withinTolerance(k.value, d.value, tolerance))) continue;
    kept.push(d);
  }
  return kept;
}
