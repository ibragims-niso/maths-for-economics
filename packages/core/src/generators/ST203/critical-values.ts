import { Z_FOR_PERCENT } from '../ST105/normal';
import { Z_TWO_SIDED } from '../ST202/sample-size-for-precision';

/** Confidence levels (in per cent) the ST203 generators use. */
export type Level = 90 | 95 | 99;

export const LEVELS: readonly Level[] = [90, 95, 95, 99];

/** The two-sided z value of a confidence interval: P(|Z| < z) = level (1.645, 1.96, 2.576). */
export const zFor = (level: Level): number => Z_TWO_SIDED[level] ?? 1.96;

/**
 * The one-sided z value a student wrongly uses: P(Z < z) = level (1.282, 1.645, 2.326),
 * i.e. the whole 5 % (or 10 %, 1 %) put in one tail.
 */
export const oneTailZ = (level: Level): number => Z_FOR_PERCENT[level] ?? 1.645;

/**
 * Two-sided critical values of Student's t distribution, to 3 decimals: the t with
 * P(|T| < t) = level for T with `df` degrees of freedom. Tested against values computed
 * by integrating the t density (ST203.test.ts).
 */
export const T_TABLE: Readonly<Record<number, Readonly<Record<Level, number>>>> = {
  1: { 90: 6.314, 95: 12.706, 99: 63.657 },
  2: { 90: 2.92, 95: 4.303, 99: 9.925 },
  3: { 90: 2.353, 95: 3.182, 99: 5.841 },
  4: { 90: 2.132, 95: 2.776, 99: 4.604 },
  5: { 90: 2.015, 95: 2.571, 99: 4.032 },
  6: { 90: 1.943, 95: 2.447, 99: 3.707 },
  7: { 90: 1.895, 95: 2.365, 99: 3.499 },
  8: { 90: 1.86, 95: 2.306, 99: 3.355 },
  9: { 90: 1.833, 95: 2.262, 99: 3.25 },
  10: { 90: 1.812, 95: 2.228, 99: 3.169 },
  11: { 90: 1.796, 95: 2.201, 99: 3.106 },
  12: { 90: 1.782, 95: 2.179, 99: 3.055 },
  13: { 90: 1.771, 95: 2.16, 99: 3.012 },
  14: { 90: 1.761, 95: 2.145, 99: 2.977 },
  15: { 90: 1.753, 95: 2.131, 99: 2.947 },
  16: { 90: 1.746, 95: 2.12, 99: 2.921 },
  17: { 90: 1.74, 95: 2.11, 99: 2.898 },
  18: { 90: 1.734, 95: 2.101, 99: 2.878 },
  19: { 90: 1.729, 95: 2.093, 99: 2.861 },
  20: { 90: 1.725, 95: 2.086, 99: 2.845 },
  21: { 90: 1.721, 95: 2.08, 99: 2.831 },
  22: { 90: 1.717, 95: 2.074, 99: 2.819 },
  23: { 90: 1.714, 95: 2.069, 99: 2.807 },
  24: { 90: 1.711, 95: 2.064, 99: 2.797 },
  25: { 90: 1.708, 95: 2.06, 99: 2.787 },
  26: { 90: 1.706, 95: 2.056, 99: 2.779 },
  27: { 90: 1.703, 95: 2.052, 99: 2.771 },
  28: { 90: 1.701, 95: 2.048, 99: 2.763 },
  29: { 90: 1.699, 95: 2.045, 99: 2.756 },
  30: { 90: 1.697, 95: 2.042, 99: 2.75 },
  40: { 90: 1.684, 95: 2.021, 99: 2.704 },
  60: { 90: 1.671, 95: 2.0, 99: 2.66 },
  120: { 90: 1.658, 95: 1.98, 99: 2.617 },
};

/** The t critical value for `df` degrees of freedom at a confidence level. */
export function tFor(df: number, level: Level): number {
  const row = T_TABLE[df];
  if (!row) throw new Error(`no t value for ${df} degrees of freedom`);
  return row[level];
}
