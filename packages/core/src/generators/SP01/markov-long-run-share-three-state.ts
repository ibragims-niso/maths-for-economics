import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { equalsRounded, fromPercent, PROB } from './chain';

type Context = 'ratings' | 'income' | 'firms';

/**
 * A chain that moves at most one state up or down per period:
 * P = [[1 − a, a, 0], [b, 1 − b − c, c], [0, d, 1 − d]], all in whole per cent.
 */
interface Params {
  context: Context;
  /** 1 → 2 */
  a: number;
  /** 2 → 1 */
  b: number;
  /** 2 → 3 */
  c: number;
  /** 3 → 2 */
  d: number;
  /** The state whose long-run share is asked for. */
  k: 1 | 2 | 3;
}

const SETTING: Record<
  Context,
  { states: [string, string, string]; period: string; intro: string; ask: string }
> = {
  ratings: {
    states: ['A', 'B', 'C'],
    period: 'year',
    intro:
      'A bank grades each of its many loans A (state 1), B (state 2) or C (state 3); each year a grade moves by at most one step.',
    ask: 'In the long run, what share of the loans is graded',
  },
  income: {
    states: ['low income', 'middle income', 'high income'],
    period: 'generation',
    intro:
      'In a model of income mobility each family is low (state 1), middle (state 2) or high income (state 3), and from one generation to the next it moves by at most one class.',
    ask: 'In the long run, what share of families is',
  },
  firms: {
    states: ['small', 'medium', 'large'],
    period: 'year',
    intro:
      'Firms in an industry are small (state 1), medium (state 2) or large (state 3), and each year a firm moves by at most one size class.',
    ask: 'In the long run, what share of firms is',
  },
};

const matrixOf = (p: Params) =>
  fromPercent([
    [100 - p.a, p.a, 0],
    [p.b, 100 - p.b - p.c, p.c],
    [0, p.d, 100 - p.d],
  ]);

/** Unnormalised long-run weights: π₂ = (a/b)π₁ and π₃ = (c/d)π₂, multiplied through by bd. */
const weights = (p: Params) => [p.b * p.d, p.a * p.d, p.a * p.c];
/** The weights if the flows are balanced the wrong way round: π₂ = (b/a)π₁, π₃ = (d/c)π₂. */
const reversedWeights = (p: Params) => [p.a * p.c, p.b * p.c, p.b * p.d];

const shareOf = (w: number[], k: number) => (w[k - 1] ?? Number.NaN) / w.reduce((s, x) => s + x, 0);
const target = (p: Params) => round(shareOf(weights(p), p.k), 4);

const candidates = (p: Params) => {
  const w = weights(p);
  return [
    { value: round(shareOf(reversedWeights(p), p.k), 4), mistakeCode: 'FLOWS_REVERSED' },
    {
      value: round((w[p.k - 1] ?? Number.NaN) / (w[0] ?? Number.NaN), 4),
      mistakeCode: 'NOT_NORMALISED',
    },
    { value: round(1 / 3, 4), mistakeCode: 'EQUAL_SHARES' },
    {
      value: round(matrixOf(p)[p.k - 1]?.[p.k - 1] ?? Number.NaN, 4),
      mistakeCode: 'STAY_PROBABILITY',
    },
  ];
};

/** SP01, difficulty 3: a long-run share of a three-state chain, by solving πP = π with Σπ = 1. */
export const markovLongRunShareThreeState: Generator<Params> = {
  id: 'markov-long-run-share-three-state',
  title: 'Long-run share, three states',
  topicId: 'SP01',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        context: rng.pick(['ratings', 'income', 'firms'] as const),
        a: rng.int(2, 20),
        b: rng.int(2, 20),
        c: rng.int(2, 20),
        d: rng.int(5, 40),
        k: rng.pick([1, 2, 3] as const),
      };
      // Keep the middle state's chance of staying put at 50 % or more.
      if (p.b + p.c > 50) continue;
      const kept = cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance);
      if (kept.length >= 3) return p;
    }
  },

  stem(p) {
    const s = SETTING[p.context];
    return `${s.intro} The transition matrix is $P = ${pmatrix(matrixOf(p))}$ (row = state this ${s.period}, column = state next ${s.period}). ${s.ask} ${s.states[p.k - 1]}? Give your answer as a decimal to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 4, ...PROB }),

  steps(p) {
    const [A, B, C, D] = [p.a, p.b, p.c, p.d].map((x) => num(x / 100));
    const w = weights(p);
    const total = w.reduce((s, x) => s + x, 0);
    const pi1 = (w[0] ?? 0) / total;
    const steps: Step[] = [
      {
        text: 'Write πP = π column by column; columns 1 and 3 are short.',
        latex: `${A}\\,\\pi_1 = ${B}\\,\\pi_2, \\qquad ${C}\\,\\pi_2 = ${D}\\,\\pi_3`,
        why: `Column 1 says π₁(1 − ${A}) + ${B}π₂ = π₁, so the flow out of state 1 (${A}π₁) equals the flow in (${B}π₂). Column 3 gives the same balance between states 2 and 3. Column 2 is not needed: because every row of P adds up to 1, any two of the three equations imply the third.`,
      },
      {
        text: 'Express every share through π₁.',
        latex: `\\pi_2 = \\frac{${A}}{${B}}\\,\\pi_1, \\qquad \\pi_3 = \\frac{${C}}{${D}}\\,\\pi_2 = \\frac{${A} \\cdot ${C}}{${B} \\cdot ${D}}\\,\\pi_1`,
        why: 'Divide each balance by the coefficient of the share being found; the second share then feeds the third.',
      },
      {
        text: 'Use π₁ + π₂ + π₃ = 1.',
        latex: `\\pi_1 = \\dfrac{1}{1 + \\frac{${A}}{${B}} + \\frac{${A} \\cdot ${C}}{${B} \\cdot ${D}}} ${equalsRounded(pi1)}`,
        why: 'The three equations of πP = π fix only the ratios of the shares; the condition that the shares add up to 1 fixes their size.',
        result: round(pi1, 4),
      },
    ];
    if (p.k !== 1) {
      const factor =
        p.k === 2 ? `\\frac{${A}}{${B}}` : `\\frac{${A} \\cdot ${C}}{${B} \\cdot ${D}}`;
      steps.push({
        text: `Long-run share of state ${p.k} (${SETTING[p.context].states[p.k - 1]}).`,
        latex: `\\pi_${p.k} = ${factor}\\,\\pi_1 ${equalsRounded(shareOf(w, p.k))}`,
        why: `Use the ratio from the second step with the exact π₁, not a rounded one, so that the answer is accurate to 4 decimal places.`,
        result: target(p),
      });
    }
    return steps;
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance),
};
