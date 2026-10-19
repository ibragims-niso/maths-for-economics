import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'inflation' | 'sales' | 'hours';

interface Params {
  context: Context;
  /**
   * The data in whole units of `scale`: inflation in tenths of a percentage point (34 = 3.4 %),
   * sales and hours as they are. Whole numbers keep every deviation exact.
   */
  units: number[];
}

/** s is exact up to the last rounding; 0.1 % margin covers a student who rounds s² first. */
const SD = { tolerance: 0.01, relTolerance: 0.001 } as const;

const scaleOf = (c: Context) => (c === 'inflation' ? 0.1 : 1);
const values = (p: Params) => p.units.map((u) => u * scaleOf(p.context));
const total = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
/** Mean and deviations in units, all whole numbers because the draw makes the total divisible by n. */
const meanUnits = (p: Params) => total(p.units) / p.units.length;
const devUnits = (p: Params) => p.units.map((u) => u - meanUnits(p));
/** Σ (x − x̄)² in the data's own units. */
const sumSquares = (p: Params) => total(devUnits(p).map((d) => d * d)) * scaleOf(p.context) ** 2;
const sampleVariance = (p: Params) => sumSquares(p) / (p.units.length - 1);
const target = (p: Params) => round(Math.sqrt(sampleVariance(p)), 2);

const decimalsOf = (c: Context) => (c === 'inflation' ? 1 : 0);
const show = (p: Params, x: number) =>
  `${num(x, decimalsOf(p.context))}${p.context === 'inflation' ? '\\%' : ''}`;
const paren = (s: string) => (s.startsWith('-') ? `(${s})` : s);

/** ST101, difficulty 3: the sample standard deviation s = √(Σ (x − x̄)² / (n − 1)) of 5–8 values. */
export const sampleStandardDeviation: Generator<Params> = {
  id: 'sample-standard-deviation',
  title: 'Sample standard deviation',
  topicId: 'ST101',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['inflation', 'sales', 'hours'] as const);
      const n = rng.int(5, 8);
      const [lo, hi] =
        context === 'inflation' ? [10, 90] : context === 'sales' ? [20, 90] : [20, 48];
      const units = Array.from({ length: n }, () => rng.int(lo, hi));
      if (total(units) % n !== 0) continue; // a mean the student can write exactly
      const p = { context, units };
      // A visible spread, and a variance far enough from s that the two cannot be confused.
      const s = Math.sqrt(sampleVariance(p));
      if (s < (context === 'inflation' ? 0.5 : 2)) continue;
      if (Math.abs(sampleVariance(p) - s) < 0.1) continue;
      return p;
    }
  },

  stem(p) {
    const n = p.units.length;
    const data = values(p)
      .map((x) => show(p, x))
      .join(',\\ ');
    const lead =
      p.context === 'inflation'
        ? `A statistics office measured annual inflation in a random sample of ${n} towns: $${data}$.`
        : p.context === 'sales'
          ? `A café recorded how many sandwiches it sold on ${n} randomly chosen days: $${data}$.`
          : `A survey asked ${n} randomly chosen employees how many hours they worked last week: $${data}$.`;
    return `${lead} Find the sample standard deviation $s$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...SD }),

  steps(p) {
    const n = p.units.length;
    const sc = scaleOf(p.context);
    const d = decimalsOf(p.context);
    const mean = meanUnits(p) * sc;
    const devs = devUnits(p).map((u) => num(u * sc, d));
    const ss = sumSquares(p);
    const v = sampleVariance(p);
    return [
      {
        text: 'Find the mean.',
        latex: `\\bar{x} = \\frac{${num(total(p.units) * sc, d)}}{${n}} = ${show(p, mean)}`,
        why: 'The standard deviation measures spread around the mean, so the mean comes first.',
        result: round(mean, 2),
      },
      {
        text: 'Subtract the mean from each value, square, and add.',
        latex: `\\sum (x_i - \\bar{x})^2 = ${devs.map((s) => `${paren(s)}^2`).join(' + ')} = ${num(ss, 2 * d)}`,
        why: 'Squaring makes every distance positive, so values below the mean do not cancel those above it.',
        result: round(ss, 2),
      },
      {
        text: `Divide by n − 1 = ${n - 1} to get the sample variance.`,
        latex: `s^2 = \\frac{${num(ss, 2 * d)}}{${n - 1}} = ${num(v, 4)}`,
        why: 'The deviations are measured from the sample mean, which is fitted to these same data, so they are slightly too small; dividing by n − 1 instead of n corrects for that.',
        result: round(v, 2),
      },
      {
        text: 'Take the square root.',
        latex: `s = \\sqrt{${num(v, 4)}} = ${num(Math.sqrt(v), 2)}`,
        why: 'The variance is in squared units; its square root is back in the units of the data.',
        result: target(p),
      },
    ];
  },

  distractors(p) {
    const n = p.units.length;
    const sc = scaleOf(p.context);
    const mad = (total(devUnits(p).map(Math.abs)) * sc) / n;
    return cleanDistractors(
      target(p),
      [
        { value: round(Math.sqrt(sumSquares(p) / n), 2), mistakeCode: 'POPULATION_DIVISOR' },
        { value: round(sampleVariance(p), 2), mistakeCode: 'NO_SQUARE_ROOT' },
        { value: round(mad, 2), mistakeCode: 'MEAN_ABS_DEVIATION' },
      ],
      SD.tolerance,
      SD.relTolerance,
    );
  },
};
