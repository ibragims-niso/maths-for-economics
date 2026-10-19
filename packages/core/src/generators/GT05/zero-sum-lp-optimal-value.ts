import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  CONTEXT_IDS,
  drawMatrix,
  entry,
  matrixLatex,
  maximin,
  minimax,
  mixLatex,
  type PayoffMatrix,
  solve2x2,
  valueFractionLatex,
  valueIsExact,
  ZERO_SUM_CONTEXTS,
  type ZeroSumContext,
} from './zero-sum';

interface Params {
  context: ZeroSumContext;
  /** A 2×2 matrix of whole payoffs from −5 to 6, at least one negative, with no saddle point. */
  matrix: PayoffMatrix;
}

const LP = { tolerance: 0.0001, relTolerance: 0 } as const;
const DECIMALS = 4;

const labels = (p: Params) => ZERO_SUM_CONTEXTS[p.context].labels;
/** The constant added to every entry: the smallest whole number that makes every entry at least 1. */
export const shiftFor = (a: PayoffMatrix) => 1 - Math.min(...a.flat());
const value = (p: Params) => solve2x2(p.matrix).v;
const target = (p: Params) => round(1 / (value(p) + shiftFor(p.matrix)), DECIMALS);

function candidates(p: Params): Distractor[] {
  const v = value(p);
  const k = shiftFor(p.matrix);
  return [
    { value: round(1 / v, DECIMALS), mistakeCode: 'FORGOT_CONSTANT' },
    { value: round(v + k, DECIMALS), mistakeCode: 'NO_RECIPROCAL' },
    { value: round(1 / (maximin(p.matrix) + k), DECIMALS), mistakeCode: 'PURE_MAXIMIN' },
  ];
}

/** "(a + k)u₁ + (c + k)u₂ ≥ 1" for one of B's columns, with the shifted numbers. */
function constraintLatex(p: Params, j: number): string {
  const k = shiftFor(p.matrix);
  const term = (c: number, u: string) => (c === 1 ? u : `${num(c)}${u}`);
  return `${term(entry(p.matrix, 0, j) + k, 'u_1')} + ${term(entry(p.matrix, 1, j) + k, 'u_2')} \\ge 1`;
}

/** GT05, difficulty 3: the optimal value of the row player's linear programme for a 2×2 zero-sum game. */
export const zeroSumLpOptimalValue: Generator<Params> = {
  id: 'zero-sum-lp-optimal-value',
  title: 'Linear programme of a zero-sum game',
  topicId: 'GT05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(CONTEXT_IDS);
      const matrix = drawMatrix(rng, 2, 2, -5, 6);
      if (Math.min(...matrix.flat()) >= 0) continue;
      if (maximin(matrix) >= minimax(matrix)) continue;
      if (!valueIsExact(matrix, 2)) continue;
      const p: Params = { context, matrix };
      // Keep 1/v readable: a value very close to 0 would give an absurd wrong answer.
      if (Math.abs(value(p)) < 0.1) continue;
      if (cleanDistractors(target(p), candidates(p), LP.tolerance, LP.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) =>
    `${ZERO_SUM_CONTEXTS[p.context].intro} Each entry is ${ZERO_SUM_CONTEXTS[p.context].unit} (a negative entry means B wins them from A): $${matrixLatex(p.matrix, labels(p))}$ To solve the game by linear programming, ${num(shiftFor(p.matrix))} is added to every entry, and A’s programme becomes: minimise $u_1 + u_2$ subject to $${constraintLatex(p, 0)}$, $${constraintLatex(p, 1)}$, $u_1, u_2 \\ge 0$. What is the minimum value of $u_1 + u_2$? Give your answer to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: DECIMALS, ...LP }),

  steps: (p) => {
    const a = p.matrix;
    const k = shiftFor(a);
    const v = value(p);
    return [
      {
        text: 'Check for a saddle point.',
        latex: `\\underline{v} = \\max(\\text{row minima}) = ${num(maximin(a))} < \\overline{v} = \\min(\\text{column maxima}) = ${num(minimax(a))}`,
        why: 'There is no saddle point, so both firms mix and the value lies strictly between these two numbers.',
      },
      {
        text: 'Find the value of the original game from the 2×2 formula (or by making A indifferent between B’s columns).',
        latex: `v = ${valueFractionLatex(a)} = ${num(v, 2)}`,
        why: `With p the probability of A’s first row, ${mixLatex(entry(a, 0, 0), entry(a, 1, 0), 'p')} = ${mixLatex(entry(a, 0, 1), entry(a, 1, 1), 'p')} gives the same value; the formula is that solution written out.`,
        result: v,
      },
      {
        text: `Adding ${num(k)} to every entry adds ${num(k)} to every expected gain, so the shifted game has value v + ${num(k)}.`,
        latex: `v + k = ${num(v, 2)} + ${num(k)} = ${num(v + k, 2)}`,
        why: 'The optimal mixes do not change, because the same constant is added whatever the players do. The shift only makes the value positive, which the change of variables needs.',
        result: v + k,
      },
      {
        text: 'The programme uses u_i = (probability of row i)/(v + k), so the u’s add up to 1/(v + k), and A maximising the value means minimising u₁ + u₂.',
        latex: `\\min (u_1 + u_2) = \\frac{1}{v + k} = \\frac{1}{${num(v + k, 2)}} ${Math.abs(1 / (v + k) - target(p)) < 1e-12 ? '=' : '\\approx'} ${num(target(p), DECIMALS)}`,
        why: 'Dividing each constraint “expected gain against this column ≥ value” by the positive value gives the constraints of the programme; the probabilities add to 1, so u₁ + u₂ = 1/(v + k).',
        result: target(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p), LP.tolerance, LP.relTolerance),
};
