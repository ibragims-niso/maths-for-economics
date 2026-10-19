import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  argWhere,
  CONTEXT_IDS,
  colMaxima,
  drawMatrix,
  listLatex,
  matrixLatex,
  maximin,
  minimax,
  type PayoffMatrix,
  rowMinima,
  ZERO_SUM_CONTEXTS,
  type ZeroSumContext,
} from './zero-sum';

interface Params {
  context: ZeroSumContext;
  /** 2 or 3 rows and 2 or 3 columns of whole payoffs from −4 to 9, with one saddle point. */
  matrix: PayoffMatrix;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const labels = (p: Params) => ZERO_SUM_CONTEXTS[p.context].labels;
const target = (p: Params) => maximin(p.matrix);

function candidates(p: Params): Distractor[] {
  const a = p.matrix;
  const colMinima = (a[0] ?? []).map((_, j) => Math.min(...a.map((row) => row[j] ?? 0)));
  const all = a.flat();
  return [
    { value: Math.max(...colMinima), mistakeCode: 'ROWS_COLUMNS_SWAPPED' },
    { value: Math.max(...all), mistakeCode: 'MAXIMAX' },
    { value: round(all.reduce((s, x) => s + x, 0) / all.length, 2), mistakeCode: 'AVERAGE_PAYOFF' },
  ];
}

/** The single row and column of the saddle point. */
function saddle(p: Params): [number, number] {
  const r = argWhere(rowMinima(p.matrix), maximin(p.matrix))[0] ?? 0;
  const c = argWhere(colMaxima(p.matrix), minimax(p.matrix))[0] ?? 0;
  return [r, c];
}

/** GT05, difficulty 1: the value of a zero-sum game with a saddle point (maximin = minimax). */
export const zeroSumSaddlePointValue: Generator<Params> = {
  id: 'zero-sum-saddle-point-value',
  title: 'Value of a game with a saddle point',
  topicId: 'GT05',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(CONTEXT_IDS);
      const matrix = drawMatrix(rng, rng.int(2, 3), rng.int(2, 3), -4, 9);
      const lower = maximin(matrix);
      if (lower !== minimax(matrix)) continue;
      // One cautious row and one cautious column, so the saddle point is a single cell.
      if (argWhere(rowMinima(matrix), lower).length !== 1) continue;
      if (argWhere(colMaxima(matrix), lower).length !== 1) continue;
      const p: Params = { context, matrix };
      if (
        cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 3
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `${ZERO_SUM_CONTEXTS[p.context].intro} Each entry is ${ZERO_SUM_CONTEXTS[p.context].unit} (a negative entry means B wins them from A), so A’s gain is B’s loss: $${matrixLatex(p.matrix, labels(p))}$ Both firms play cautiously. What is the value of the game?`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps: (p) => {
    const [r, c] = saddle(p);
    const lower = maximin(p.matrix);
    return [
      {
        text: 'For each of A’s rows, find the worst case: the smallest entry in the row. A picks the row whose worst case is best.',
        latex: `\\text{row minima: } ${listLatex(rowMinima(p.matrix))} \\;\\Rightarrow\\; \\underline{v} = \\max = ${num(lower)}`,
        why: 'B answers each row with the column that hurts A most, so a row is only worth its smallest entry. The largest of these is the maximin, the most A can guarantee.',
        result: lower,
      },
      {
        text: 'For each of B’s columns, find the worst case for B: the largest entry in the column. B picks the column whose worst case is smallest.',
        latex: `\\text{column maxima: } ${listLatex(colMaxima(p.matrix))} \\;\\Rightarrow\\; \\overline{v} = \\min = ${num(minimax(p.matrix))}`,
        why: 'Entries are B’s losses, so B looks at the largest number in each column. The smallest of these is the minimax, the most B can be made to lose.',
        result: minimax(p.matrix),
      },
      {
        text: `The two numbers are equal, so the cell (${labels(p)[r]}, ${labels(p)[c]}) is a saddle point and its entry is the value.`,
        latex: `\\underline{v} = \\overline{v} = ${num(lower)} \\;\\Rightarrow\\; v = ${num(lower)}`,
        why: 'This entry is the smallest in its row and the largest in its column, so neither firm can gain by switching alone: A guarantees it and B concedes no more.',
        result: lower,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
