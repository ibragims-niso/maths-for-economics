import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals } from './contexts';
import { tableCdf } from './normal';

const CONTEXTS = {
  markets: {
    setup: (m1: number, v1: number, m2: number, v2: number) =>
      `A firm sells one product in two regions. Weekly demand is $X \\sim N(${num(m1)}, ${num(v1)})$ units in the north and $Y \\sim N(${num(m2)}, ${num(v2)})$ units in the south, independently.`,
    ask: (c: number) =>
      `The firm has $${num(c)}$ units in its warehouse. What is the probability that total weekly demand is more than this?`,
    above: true,
    means: [150, 200, 250, 300, 350, 400],
    scales: [5, 10, 20],
  },
  project: {
    setup: (m1: number, v1: number, m2: number, v2: number) =>
      `A building project has two stages done one after the other. Their durations in days are independent, $X \\sim N(${num(m1)}, ${num(v1)})$ and $Y \\sim N(${num(m2)}, ${num(v2)})$.`,
    ask: (c: number) =>
      `What is the probability that the whole project is finished within $${num(c)}$ days?`,
    above: false,
    means: [20, 25, 30, 40, 45, 60],
    scales: [1, 2],
  },
  costs: {
    setup: (m1: number, v1: number, m2: number, v2: number) =>
      `A company's monthly energy cost $X \\sim N(${num(m1)}, ${num(v1)})$ and its monthly transport cost $Y \\sim N(${num(m2)}, ${num(v2)})$, in thousands, are independent.`,
    ask: (c: number) =>
      `The budget for the two together is $${num(c)}$ thousand. What is the probability that total cost stays below the budget?`,
    above: false,
    means: [40, 50, 60, 80, 100, 120],
    scales: [1, 2, 3],
  },
  branches: {
    setup: (m1: number, v1: number, m2: number, v2: number) =>
      `The daily revenues of a bank's two branches, in thousands, are independent: $X \\sim N(${num(m1)}, ${num(v1)})$ and $Y \\sim N(${num(m2)}, ${num(v2)})$.`,
    ask: (c: number) =>
      `What is the probability that their total daily revenue is above $${num(c)}$ thousand?`,
    above: true,
    means: [30, 40, 50, 70, 90],
    scales: [1, 2],
  },
} as const;

type Context = keyof typeof CONTEXTS;

/** Standard deviations whose squares add up to a perfect square: 3² + 4² = 5², 7² + 24² = 25². */
const PAIRS = [
  [3, 4],
  [4, 3],
  [6, 8],
  [8, 6],
  [7, 24],
  [24, 7],
] as const;

interface Params {
  context: Context;
  mean1: number;
  sd1: number;
  mean2: number;
  sd2: number;
  /** The threshold for the total X + Y. */
  limit: number;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const totalMean = (p: Params) => p.mean1 + p.mean2;
const totalVariance = (p: Params) => p.sd1 ** 2 + p.sd2 ** 2;
const totalSd = (p: Params) => Math.sqrt(totalVariance(p));
const zWith = (p: Params, s: number) => round((p.limit - totalMean(p)) / s, 2);

/** The probability a student gets from a table, standardising the total with spread `s`. */
function probability(p: Params, s: number): number {
  const below = tableCdf((p.limit - totalMean(p)) / s);
  return CONTEXTS[p.context].above ? round(1 - below, 4) : below;
}

function wrongAnswers(p: Params): Distractor[] {
  const answer = probability(p, totalSd(p));
  return cleanDistractors(
    answer,
    [
      { value: probability(p, p.sd1 + p.sd2), mistakeCode: 'ADDED_SDS' },
      { value: probability(p, totalVariance(p)), mistakeCode: 'VARIANCE_FOR_SD' },
      { value: round(1 - answer, 4), mistakeCode: 'WRONG_TAIL' },
    ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** ST105, difficulty 3: a probability for the sum of two independent normal variables. */
export const sumOfIndependentNormals: Generator<Params> = {
  id: 'sum-of-independent-normals',
  title: 'Sum of two independent normal variables',
  topicId: 'ST105',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const c = CONTEXTS[context];
      const [a, b] = rng.pick(PAIRS);
      const scale = rng.pick(c.scales);
      const p: Params = {
        context,
        mean1: rng.pick(c.means),
        sd1: a * scale,
        mean2: rng.pick(c.means),
        sd2: b * scale,
        limit: 0,
      };
      if (p.sd1 * 3 > p.mean1 || p.sd2 * 3 > p.mean2) continue;
      // A whole-number threshold whose z-score lies on the 0.01 grid of a table.
      const k = rng.int(-250, 250);
      if (Math.abs(k) < 20) continue;
      const limit = totalMean(p) + (k * totalSd(p)) / 100;
      if (!hasDecimals(limit, 0)) continue;
      p.limit = Math.round(limit);
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.setup(p.mean1, p.sd1 ** 2, p.mean2, p.sd2 ** 2)} ${c.ask(p.limit)} Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: probability(p, totalSd(p)), decimals: 4, ...PROB }),

  steps(p) {
    const above = CONTEXTS[p.context].above;
    const z = zWith(p, totalSd(p));
    const answer = probability(p, totalSd(p));
    return [
      {
        text: 'Find the mean of the total.',
        latex: `E[X + Y] = ${num(p.mean1)} + ${num(p.mean2)} = ${num(totalMean(p))}`,
        why: 'The mean of a sum is always the sum of the means.',
        result: totalMean(p),
      },
      {
        text: 'Find the variance and standard deviation of the total.',
        latex: `\\operatorname{Var}(X + Y) = ${num(p.sd1 ** 2)} + ${num(p.sd2 ** 2)} = ${num(totalVariance(p))}, \\quad \\sigma = \\sqrt{${num(totalVariance(p))}} = ${num(totalSd(p))}`,
        why: 'For independent variables the variances add, not the standard deviations; the sum of independent normals is again normal.',
        result: totalSd(p),
      },
      {
        text: `Standardise ${num(p.limit)}.`,
        latex: `z = \\dfrac{${num(p.limit)} - ${num(totalMean(p))}}{${num(totalSd(p))}} = ${num(z)}`,
        why: 'Z = (T − μ)/σ turns the total T = X + Y into a standard normal variable, so the table applies.',
        result: z,
      },
      above
        ? {
            text: 'Take the area to the right of z.',
            latex: `P(X + Y > ${num(p.limit)}) = 1 - \\Phi(${num(z)}) = 1 - ${num(tableCdf(z), 4)} = ${num(answer, 4)}`,
            why: 'The table gives the area to the left of z; the area to the right is what remains of the total area 1.',
            result: answer,
          }
        : {
            text: 'Read the area to the left of z.',
            latex: `P(X + Y < ${num(p.limit)}) = \\Phi(${num(z)}) = ${num(answer, 4)}`,
            why:
              z < 0
                ? 'Φ(z) is the area to the left of z; for negative z use Φ(−z) = 1 − Φ(z) if your table only has positive values.'
                : 'Φ(z) is the area to the left of z, which is the probability that the total is below the threshold.',
            result: answer,
          },
    ];
  },

  distractors: wrongAnswers,
};
