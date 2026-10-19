import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** from, from + step, …, to (rounded to remove floating-point noise). */
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 4));

/** Surveys that estimate a population mean; `unit` follows the half-width d in the stem. */
const CONTEXTS = {
  spending: {
    setup: (s: string) =>
      `A statistics office wants to estimate average weekly household spending in a city. From earlier surveys it knows that the standard deviation of weekly spending is $\\sigma = ${s}$.`,
    who: 'households',
    unit: '',
    sds: range(50, 300, 5),
    halfWidths: [4, 5, 6, 8, 10, 12, 15, 20, 25, 30],
  },
  wages: {
    setup: (s: string) =>
      `A ministry wants to estimate the average hourly wage in the retail sector. The standard deviation of hourly wages in the sector is about $\\sigma = ${s}$.`,
    who: 'workers',
    unit: '',
    sds: range(2, 12, 0.25),
    halfWidths: [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1],
  },
  rent: {
    setup: (s: string) =>
      `A housing agency wants to estimate the average monthly rent of two-room flats in a city. The standard deviation of these rents is about $\\sigma = ${s}$.`,
    who: 'flats',
    unit: '',
    sds: range(80, 400, 10),
    halfWidths: [10, 15, 20, 25, 30, 40, 50, 60],
  },
  electricity: {
    setup: (s: string) =>
      `An energy regulator wants to estimate average monthly electricity use per household. The standard deviation of monthly use is about $\\sigma = ${s}$ kWh.`,
    who: 'households',
    unit: '\\text{ kWh}',
    sds: range(80, 300, 5),
    halfWidths: [5, 8, 10, 12, 15, 20, 25, 30],
  },
} as const;

type Context = keyof typeof CONTEXTS;

/** Two-sided probabilities and their z: P(|Z| < z) = level. */
export const Z_TWO_SIDED: Readonly<Record<number, number>> = { 90: 1.645, 95: 1.96, 99: 2.576 };

interface Params {
  context: Context;
  sd: number;
  /** The sample mean must be within ±halfWidth of μ … */
  halfWidth: number;
  /** … with at least this probability, in per cent. */
  level: number;
}

/** A whole number of observations: only the exact integer is accepted. */
const COUNT = { tolerance: 0.4, relTolerance: 0 } as const;

const zFor = (p: Params) => Z_TWO_SIDED[p.level] ?? 1.96;
/** √n must be at least zσ/d. */
const rootN = (p: Params) => (zFor(p) * p.sd) / p.halfWidth;
/** n must be at least (zσ/d)². */
const exactN = (p: Params) => rootN(p) ** 2;
const needed = (p: Params) => Math.ceil(round(exactN(p), 6));

function wrongAnswers(p: Params): Distractor[] {
  return cleanDistractors(
    needed(p),
    [
      { value: Math.floor(exactN(p)), mistakeCode: 'NOT_ROUNDED_UP' },
      { value: Math.ceil(rootN(p)), mistakeCode: 'FORGOT_TO_SQUARE' },
      { value: Math.ceil(round((p.sd / p.halfWidth) ** 2, 6)), mistakeCode: 'FORGOT_Z' },
    ],
    COUNT.tolerance,
    COUNT.relTolerance,
  );
}

/** ST202, difficulty 3: the smallest n so that X̄ is within ±d of μ with a given probability. */
export const sampleSizeForPrecision: Generator<Params> = {
  id: 'sample-size-for-precision',
  title: 'Sample size for a precise average',
  topicId: 'ST202',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const c = CONTEXTS[context];
      const p: Params = {
        context,
        sd: rng.pick(c.sds),
        halfWidth: rng.pick(c.halfWidths),
        level: rng.pick([90, 95, 95, 99]),
      };
      const n = exactN(p);
      // Large enough for the central limit theorem, small enough to be a realistic survey.
      if (n < 30 || n > 5000) continue;
      // Not (almost) a whole number, so that rounding up matters and is unambiguous.
      const frac = n - Math.floor(n);
      if (frac < 0.02 || frac > 0.98) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.setup(num(p.sd))} How many ${c.who} must it sample at random so that the sample mean $\\bar X$ is within $${num(p.halfWidth)}${c.unit}$ of the true mean $\\mu$ with probability at least $${p.level}\\%$? Use the central limit theorem and $P(|Z| < ${num(zFor(p), 3)}) = ${num(p.level / 100)}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: needed(p), decimals: 0, ...COUNT }),

  steps(p) {
    const z = zFor(p);
    const zs = num(z, 3);
    return [
      {
        text: 'Write the condition with the standard error.',
        latex: `P(|\\bar X - \\mu| < ${num(p.halfWidth)}) = P\\!\\left(|Z| < \\dfrac{${num(p.halfWidth)}}{${num(p.sd)}/\\sqrt{n}}\\right) \\ge ${num(p.level / 100)} \\iff \\dfrac{${num(p.halfWidth)}\\sqrt{n}}{${num(p.sd)}} \\ge ${zs}`,
        why: 'By the central limit theorem X̄ is approximately N(μ, σ²/n), so dividing the distance from μ by the standard error σ/√n gives a standard normal Z. The probability is large enough once that cut-off reaches z.',
      },
      {
        text: 'Solve for √n.',
        latex: `\\sqrt{n} \\ge \\dfrac{${zs} \\times ${num(p.sd)}}{${num(p.halfWidth)}} = ${num(rootN(p), 4)}`,
        why: 'Multiply both sides by σ and divide by d; √n grows in proportion to σ and to z, and inversely to the accuracy d.',
        result: round(rootN(p), 4),
      },
      {
        text: 'Square both sides.',
        latex: `n \\ge ${num(rootN(p), 4)}^2 = ${num(exactN(p), 4)}`,
        why: 'The condition is on √n, but the question asks for n itself, so square it: halving d needs four times the sample.',
        result: round(exactN(p), 4),
      },
      {
        text: 'Round up to a whole number.',
        latex: `n = ${needed(p)}`,
        why: 'n counts sampled units, so it must be a whole number; rounding down would leave the probability just below the target, so take the next whole number up.',
        result: needed(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
