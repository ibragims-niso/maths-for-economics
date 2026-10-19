import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { Z_FOR_PERCENT, zText } from './normal';

/** from, from + step, …, to (rounded to remove floating-point noise). */
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 4));

const CONTEXTS = {
  returns: {
    setup: (m: number, v: number) =>
      `The daily return of an investment fund, in per cent, is normally distributed: $R \\sim N(${num(m)}, ${num(v)})$.`,
    ask: (pct: number) =>
      `Find its $${num(pct)}\\%$ value-at-risk return: the return $r$ such that on only $${num(pct)}\\%$ of days the return is below $r$, so $P(R < r) = ${num(pct / 100, 3)}$.`,
    percents: [1, 2.5, 5, 10],
    means: range(0, 0.15, 0.01),
    sds: range(0.5, 3, 0.1),
    letter: 'r',
  },
  packets: {
    setup: (m: number, v: number) =>
      `A machine fills rice bags; because of small filling errors the weight in grams is normally distributed: $W \\sim N(${num(m)}, ${num(v)})$.`,
    ask: (pct: number) =>
      `Find the weight $w$ that only $${num(pct)}\\%$ of bags fall below, so $P(W < w) = ${num(pct / 100, 3)}$.`,
    percents: [1, 2.5, 5, 10],
    means: [250, 500, 750, 1000, 2000],
    sds: range(1.5, 8, 0.5),
    letter: 'w',
  },
  exam: {
    setup: (m: number, v: number) =>
      `Scores in a large microeconomics exam are normally distributed: $S \\sim N(${num(m)}, ${num(v)})$.`,
    ask: (pct: number) =>
      `The best $${num(100 - pct)}\\%$ of students get a distinction. Find the lowest score $s$ that earns one, so $P(S < s) = ${num(pct / 100, 3)}$.`,
    percents: [90, 95, 97.5, 99],
    means: range(50, 68, 1),
    sds: range(4, 14, 1),
    letter: 's',
  },
  demand: {
    setup: (m: number, v: number) =>
      `Weekly demand for a shop's best-selling product, in units, is normally distributed: $D \\sim N(${num(m)}, ${num(v)})$.`,
    ask: (pct: number) =>
      `How much stock $q$ must the shop hold at the start of a week so that demand is below it in $${num(pct)}\\%$ of weeks, so $P(D < q) = ${num(pct / 100, 3)}$?`,
    percents: [90, 95, 97.5, 99],
    means: range(150, 1000, 10),
    sds: range(10, 80, 5),
    letter: 'q',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  mean: number;
  sd: number;
  /** P(X < x) in per cent. */
  percent: number;
}

/**
 * Tables give z to 2 or 3 decimals (1.64, 1.645 or 1.65), so allow 0.01 standard deviations
 * on top of rounding the answer to 2 decimals.
 */
const tolerances = (p: Params) => ({ tolerance: round(0.01 * p.sd + 0.005, 4), relTolerance: 0 });

const zFor = (p: Params) => Z_FOR_PERCENT[p.percent] ?? 0;
const value = (p: Params) => round(p.mean + zFor(p) * p.sd, 2);

function wrongAnswers(p: Params): Distractor[] {
  const z = zFor(p);
  const t = tolerances(p);
  return cleanDistractors(
    value(p),
    [
      { value: round(p.mean - z * p.sd, 2), mistakeCode: 'WRONG_SIGN_Z' },
      { value: round(p.mean + z * p.sd ** 2, 2), mistakeCode: 'VARIANCE_FOR_SD' },
      { value: round(p.mean + z, 2), mistakeCode: 'Z_NOT_SCALED' },
    ],
    t.tolerance,
    t.relTolerance,
  );
}

/** ST105, difficulty 2: the value x with P(X < x) = p for a normal X (percentile, value-at-risk). */
export const normalPercentileValue: Generator<Params> = {
  id: 'normal-percentile-value',
  title: 'Value for a given percentile (value-at-risk)',
  topicId: 'ST105',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const c = CONTEXTS[context];
      const p: Params = {
        context,
        mean: rng.pick(c.means),
        sd: rng.pick(c.sds),
        percent: rng.pick(c.percents),
      };
      if (context === 'exam' && value(p) > 100) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.setup(p.mean, p.sd ** 2)} ${c.ask(p.percent)} Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...tolerances(p) }),

  steps(p) {
    const z = zFor(p);
    const share = num(p.percent / 100, 3);
    const x = CONTEXTS[p.context].letter;
    return [
      {
        text: 'Find the standard deviation.',
        latex: `\\sigma = \\sqrt{${num(p.sd ** 2)}} = ${num(p.sd)}`,
        why: 'In N(μ, σ²) the second number is the variance; the distance from the mean is measured in standard deviations σ.',
        result: p.sd,
      },
      {
        text: 'Find z with this area to its left.',
        latex: `\\Phi(z) = ${share} \\;\\Rightarrow\\; z = ${zText(z)}`,
        why:
          z < 0
            ? `Look up ${num(1 - p.percent / 100, 3)} in the body of the table and use symmetry: an area below 0.5 lies to the left of the mean, so z is negative.`
            : 'Look up this area in the body of the table and read off z; an area above 0.5 lies to the right of the mean, so z is positive.',
        result: z,
      },
      {
        text: 'Turn z back into the original units.',
        latex: `${x} = \\mu + z\\sigma = ${num(p.mean)} + (${zText(z)})(${num(p.sd)}) = ${num(value(p))}`,
        why: 'Solving z = (x − μ)/σ for x gives x = μ + zσ: start at the mean and move z standard deviations.',
        result: value(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
