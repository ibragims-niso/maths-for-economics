import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num, withTwoDistractors } from '../format';

type Context = 'wages' | 'houses';

interface Params {
  context: Context;
  ask: 'mean' | 'median';
  /** The data in the order the question lists them (not sorted). All multiples of 10. */
  values: number[];
}

/** Whole-number answers: only the exact value is right. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const total = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const meanOf = (xs: number[]) => total(xs) / xs.length;
/** The middle value of the sorted data, or the average of the two middle values when n is even. */
export function medianOf(xs: number[]): number {
  const s = sorted(xs);
  const n = s.length;
  const hi = s[Math.floor(n / 2)] ?? 0;
  return n % 2 === 1 ? hi : ((s[n / 2 - 1] ?? 0) + hi) / 2;
}
/** The value that appears most often (the data have exactly one repeated value). */
export function modeOf(xs: number[]): number {
  return xs.find((x, i) => xs.indexOf(x) !== i) ?? Number.NaN;
}
/** What a student gets by taking the middle of the list as printed, without sorting it. */
const unsortedMiddle = (xs: number[]) => {
  const n = xs.length;
  const hi = xs[Math.floor(n / 2)] ?? 0;
  return n % 2 === 1 ? hi : ((xs[n / 2 - 1] ?? 0) + hi) / 2;
};

const target = (p: Params) => (p.ask === 'mean' ? meanOf(p.values) : medianOf(p.values));

function shuffle(rng: Rng, xs: number[]): number[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [out[i], out[j]] = [out[j] ?? 0, out[i] ?? 0];
  }
  return out;
}

const list = (xs: number[]) => xs.map(String).join(',\\ ');

/** ST101, difficulty 1: the mean or the median of 7–11 wages or house prices, one of them an outlier. */
export const meanOrMedianSmallData: Generator<Params> = withTwoDistractors({
  id: 'mean-or-median-small-data',
  title: 'Mean or median of a small data set',
  topicId: 'ST101',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['wages', 'houses'] as const);
      const n = rng.int(7, 11);
      // Ordinary values in tens; one of them appears twice (the mode).
      const [lo, hi] = context === 'wages' ? [60, 150] : [9, 30];
      const distinct = new Set<number>();
      while (distinct.size < n - 2) distinct.add(rng.int(lo, hi) * 10);
      const ordinary = [...distinct];
      const repeated = rng.pick(ordinary);
      // One very large value: the manager's pay or a mansion, at least twice the next largest.
      const outlier = context === 'wages' ? rng.int(30, 80) * 100 : rng.int(60, 150) * 10;
      if (outlier < 2 * Math.max(...ordinary)) continue;
      const values = shuffle(rng, [...ordinary, repeated, outlier]);
      if (total(values) % n !== 0) continue; // a whole-number mean
      const s = sorted(values);
      if (values.every((x, i) => x === s[i])) continue; // the list must need sorting
      if (unsortedMiddle(values) === medianOf(values)) continue;
      if (repeated === medianOf(values)) continue;
      return { context, ask: rng.pick(['mean', 'median'] as const), values };
    }
  },

  stem(p) {
    const n = p.values.length;
    const lead =
      p.context === 'wages'
        ? `The monthly wages of the ${n} employees of a small firm are $${list(p.values)}$.`
        : `The prices, in thousands, of the ${n} houses sold in a small town last month were $${list(p.values)}$.`;
    const what = p.context === 'wages' ? 'monthly wage' : 'house price, in thousands';
    return `${lead} What is the ${p.ask} ${what}?`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps(p) {
    const n = p.values.length;
    const s = sorted(p.values);
    if (p.ask === 'mean') {
      const sum = total(p.values);
      return [
        {
          text: 'Add up all the values.',
          latex: `\\sum x_i = ${num(sum)}`,
          why: 'The mean shares the total equally among all the observations, so the total comes first.',
          result: sum,
        },
        {
          text: `Divide by the number of values, ${n}.`,
          latex: `\\bar{x} = \\frac{${num(sum)}}{${n}} = ${num(sum / n)}`,
          why: `Every observation counts: the repeated value twice and the very large one too, so divide by n = ${n}.`,
          result: sum / n,
        },
      ];
    }
    const steps: Step[] = [
      {
        text: 'Sort the values from smallest to largest.',
        latex: list(s),
        why: 'The median is the middle of the data in order of size, not the middle of the list as it was written down.',
      },
    ];
    if (n % 2 === 1) {
      const k = (n + 1) / 2;
      steps.push({
        text: `With n = ${n} values, the median is value number (n + 1)/2 = ${k}.`,
        latex: `\\text{median} = x_{(${k})} = ${s[k - 1] ?? 0}`,
        why: `There are ${k - 1} values below it and ${k - 1} above it.`,
        result: s[k - 1] ?? 0,
      });
    } else {
      const k = n / 2;
      const a = s[k - 1] ?? 0;
      const b = s[k] ?? 0;
      steps.push({
        text: `With an even number of values, n = ${n}, average the two middle ones, numbers ${k} and ${k + 1}.`,
        latex: `\\text{median} = \\frac{${a} + ${b}}{2} = ${(a + b) / 2}`,
        why: `No single value has as many values above it as below it; halfway between the ${k}th and ${k + 1}th values does.`,
        result: (a + b) / 2,
      });
    }
    return steps;
  },

  distractors(p) {
    const mode = modeOf(p.values);
    const candidates =
      p.ask === 'median'
        ? [
            { value: round(meanOf(p.values), 2), mistakeCode: 'MEAN_NOT_MEDIAN' },
            { value: unsortedMiddle(p.values), mistakeCode: 'UNSORTED' },
            { value: mode, mistakeCode: 'MODE' },
          ]
        : [
            { value: medianOf(p.values), mistakeCode: 'MEDIAN_NOT_MEAN' },
            { value: mode, mistakeCode: 'MODE' },
            {
              value: round(meanOf([...new Set(p.values)]), 2),
              mistakeCode: 'REPEAT_COUNTED_ONCE',
            },
          ];
    return cleanDistractors(target(p), candidates, EXACT.tolerance, EXACT.relTolerance);
  },
});
