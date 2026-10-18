import type { Answer, Distractor } from './types';

/** Absolute tolerance used when a numeric answer does not set its own. */
export const DEFAULT_ABS_TOLERANCE = 0.01;
/** Relative tolerance (0.5 %); the larger of the two applies. */
export const REL_TOLERANCE = 0.005;

/** The allowed distance from `target` (docs/04: 0.01 absolute or 0.5 % relative). */
export function toleranceFor(
  target: number,
  abs = DEFAULT_ABS_TOLERANCE,
  rel = REL_TOLERANCE,
): number {
  return Math.max(abs, Math.abs(target) * rel);
}

export function withinTolerance(
  value: number,
  target: number,
  abs?: number,
  rel?: number,
): boolean {
  return Math.abs(value - target) <= toleranceFor(target, abs, rel) + 1e-12;
}

/**
 * Reads what a student typed: "12.5", "12,5", "-0.67", "−0,67", "2/3", "-3/4", "1 250".
 * Returns null when it is not a number.
 */
export function parseNumber(input: string): number | null {
  const text = input
    .trim()
    .replace(/[−–]/g, '-')
    .replace(/(\d)[\s ](?=\d{3}\b)/g, '$1');
  const fraction = /^(-?)\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)$/.exec(text);
  if (fraction) {
    const [, sign, num, den] = fraction;
    const d = Number((den ?? '').replace(',', '.'));
    if (d === 0) return null;
    const value = Number((num ?? '').replace(',', '.')) / d;
    return sign === '-' ? -value : value;
  }
  if (!/^-?\d+(?:[.,]\d+)?$|^-?[.,]\d+$/.test(text)) return null;
  return Number(text.replace(',', '.'));
}

export interface GradeResult {
  correct: boolean;
  /** The number read from the input, or null if it was not a number. */
  value: number | null;
  /** The likely mistake, when a wrong answer matches a known distractor. */
  mistakeCode?: string;
}

/** Grades a numeric answer and, if wrong, names the mistake it matches (docs/01 R4). */
export function gradeNumeric(
  answer: Answer,
  input: string,
  distractors: Distractor[] = [],
): GradeResult {
  if (answer.kind !== 'numeric') throw new Error('gradeNumeric needs a numeric answer');
  const value = parseNumber(input);
  if (value === null) return { correct: false, value: null };
  const { tolerance, relTolerance } = answer;
  if (withinTolerance(value, answer.value, tolerance, relTolerance))
    return { correct: true, value };
  const match = distractors.find((d) => withinTolerance(value, d.value, tolerance, relTolerance));
  return match
    ? { correct: false, value, mistakeCode: match.mistakeCode }
    : { correct: false, value };
}

/** Rounds for display and for "nice" answers. */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
