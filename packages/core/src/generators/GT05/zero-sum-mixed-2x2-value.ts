import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  CONTEXT_IDS,
  colMaxima,
  drawMatrix,
  entry,
  fractionLatex,
  listLatex,
  matrixLatex,
  maximin,
  minimax,
  mixLatex,
  type PayoffMatrix,
  rowMinima,
  solve2x2,
  valueFractionLatex,
  valueIsExact,
  ZERO_SUM_CONTEXTS,
  type ZeroSumContext,
} from './zero-sum';

interface Params {
  context: ZeroSumContext;
  /** A 2×2 matrix of whole payoffs from −5 to 9 with no saddle point. */
  matrix: PayoffMatrix;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;
const DECIMALS = 2;

const labels = (p: Params) => ZERO_SUM_CONTEXTS[p.context].labels;
const target = (p: Params) => round(solve2x2(p.matrix).v, DECIMALS);

function candidates(p: Params): Distractor[] {
  const a = p.matrix;
  const { q } = solve2x2(a);
  return [
    { value: maximin(a), mistakeCode: 'PURE_MAXIMIN' },
    { value: round(a.flat().reduce((s, x) => s + x, 0) / 4, DECIMALS), mistakeCode: 'EQUAL_SPLIT' },
    // B's probability q put in place of A's p in A's expected gain against column 1.
    {
      value: round(q * entry(a, 0, 0) + (1 - q) * entry(a, 1, 0), DECIMALS),
      mistakeCode: 'PROBABILITY_SWAP',
    },
  ];
}

/** GT05, difficulty 2: the value of a 2×2 zero-sum game with no saddle point (both players mix). */
export const zeroSumMixed2x2Value: Generator<Params> = {
  id: 'zero-sum-mixed-2x2-value',
  title: 'Value of a 2×2 game without a saddle point',
  topicId: 'GT05',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(CONTEXT_IDS);
      const matrix = drawMatrix(rng, 2, 2, -5, 9);
      if (maximin(matrix) >= minimax(matrix)) continue;
      if (!valueIsExact(matrix, DECIMALS)) continue;
      const p: Params = { context, matrix };
      if (
        cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 3
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `${ZERO_SUM_CONTEXTS[p.context].intro} Each entry is ${ZERO_SUM_CONTEXTS[p.context].unit} (a negative entry means B wins them from A), so A’s gain is B’s loss: $${matrixLatex(p.matrix, labels(p))}$ What is the value of the game, A’s expected gain when both firms play their optimal mixed strategies? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: DECIMALS, ...EXACT }),

  steps: (p) => {
    const a = p.matrix;
    const [a11, a12, a21, a22] = [entry(a, 0, 0), entry(a, 0, 1), entry(a, 1, 0), entry(a, 1, 1)];
    const { p: prob, d } = solve2x2(a);
    const [l1, l2] = labels(p);
    return [
      {
        text: 'Check for a saddle point: compare the maximin of the row minima with the minimax of the column maxima.',
        latex: `\\text{row minima } ${listLatex(rowMinima(a))} \\Rightarrow \\underline{v} = ${num(maximin(a))};\\quad \\text{column maxima } ${listLatex(colMaxima(a))} \\Rightarrow \\overline{v} = ${num(minimax(a))}`,
        why: 'The maximin is smaller than the minimax, so there is no saddle point: any pure choice can be exploited, and both firms must mix. The value lies between the two numbers.',
      },
      {
        text: `Let p be the probability that A plays ${l1}. Choose p so that A expects the same against both of B’s columns.`,
        latex: `${mixLatex(a11, a21, 'p')} = ${mixLatex(a12, a22, 'p')} \\;\\Rightarrow\\; p = ${fractionLatex(a22 - a21, d, prob, 3)}`,
        why: `If one column gave A less, B would play it every time. A’s best mix leaves B indifferent between ${l1} and ${l2}, which is the formula p = (a₂₂ − a₂₁)/(a₁₁ − a₁₂ − a₂₁ + a₂₂).`,
        result: round(prob, 4),
      },
      {
        text: 'The value is what A then expects against either column.',
        latex: `v = ${mixLatex(a11, a21, 'p')} = ${valueFractionLatex(a)} = ${num(target(p), DECIMALS)}`,
        why: 'Substituting p into either side of the equation gives the same number; the shortcut is v = (a₁₁a₂₂ − a₁₂a₂₁)/(a₁₁ − a₁₂ − a₂₁ + a₂₂).',
        result: target(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
