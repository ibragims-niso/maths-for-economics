import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  cell,
  colTotal,
  drawJointTable,
  type JointTable,
  prob,
  rowTotal,
  tableLatex,
  tableLead,
} from './joint-table';

interface Params {
  table: JointTable;
  /** The condition is on X (P(Y = y | X = x)) or on Y (P(X = x | Y = y)). */
  given: 'X' | 'Y';
  /** Row of the X value and column of the Y value in the asked event. */
  i: number;
  j: number;
}

/** A probability to 3 decimals; an exact ratio rounded, so 0.001 covers the rounding. */
const PROB = { tolerance: 0.001, relTolerance: 0 } as const;

/** The marginal probability of the condition, in hundredths. */
const conditionTotal = (p: Params) =>
  p.given === 'X' ? rowTotal(p.table, p.i) : colTotal(p.table, p.j);
/** The marginal probability of the asked variable alone, in hundredths. */
const otherTotal = (p: Params) =>
  p.given === 'X' ? colTotal(p.table, p.j) : rowTotal(p.table, p.i);
const conditional = (p: Params) => round(cell(p.table, p.i, p.j) / conditionTotal(p), 3);

/** "P(Y = 15 \mid X = -10)" or "P(X = 4 \mid Y = 3)". */
function event(p: Params) {
  const x = `X = ${num(p.table.xs[p.i] ?? 0)}`;
  const y = `Y = ${num(p.table.ys[p.j] ?? 0)}`;
  return p.given === 'X' ? `P(${y} \\mid ${x})` : `P(${x} \\mid ${y})`;
}

/** ST201, difficulty 1: a conditional probability P(Y = y | X = x) = p(x, y)/P(X = x) from a joint table. */
export const jointTableConditionalProbability: Generator<Params> = {
  id: 'joint-table-conditional-probability',
  title: 'Conditional probability from a joint table',
  topicId: 'ST201',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const table = drawJointTable(rng, rng.pick(['shares', 'spending'] as const));
      const p: Params = {
        table,
        given: rng.pick(['X', 'Y'] as const),
        i: rng.int(0, 1),
        j: rng.int(0, table.ys.length - 1),
      };
      // The asked cell must show dependence, so the condition actually changes the probability.
      const product = prob(rowTotal(table, p.i)) * prob(colTotal(table, p.j));
      if (Math.abs(prob(cell(table, p.i, p.j)) - product) < 0.02) continue;
      return p;
    }
  },

  stem(p) {
    return `${tableLead(p.table)} $${tableLatex(p.table)}$ What is $${event(p)}$? Give your answer to 3 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: conditional(p), decimals: 3, ...PROB }),

  steps(p) {
    const t = p.table;
    const joint = num(prob(cell(t, p.i, p.j)));
    const total = num(prob(conditionTotal(p)));
    const along =
      p.given === 'X'
        ? (t.cells[p.i] ?? []).map((c) => num(prob(c)))
        : t.cells.map((row) => num(prob(row[p.j] ?? 0)));
    const condition =
      p.given === 'X' ? `P(X = ${num(t.xs[p.i] ?? 0)})` : `P(Y = ${num(t.ys[p.j] ?? 0)})`;
    return [
      {
        text: `Find the marginal probability of the condition by adding its ${p.given === 'X' ? 'row' : 'column'}.`,
        latex: `${condition} = ${along.join(' + ')} = ${total}`,
        why: `The condition can happen together with every value of the other variable, so its probability is the total of its ${p.given === 'X' ? 'row' : 'column'}.`,
        result: prob(conditionTotal(p)),
      },
      {
        text: 'Divide the joint probability by the probability of the condition.',
        latex: `${event(p)} = \\dfrac{${joint}}{${total}} = ${num(conditional(p), 3)}`,
        why: 'Knowing the condition shrinks the possibilities to that row or column; dividing by its total rescales the probabilities in it so that they add up to 1.',
        result: conditional(p),
      },
    ];
  },

  distractors(p) {
    return cleanDistractors(
      conditional(p),
      [
        { value: prob(cell(p.table, p.i, p.j)), mistakeCode: 'JOINT_FOR_CONDITIONAL' },
        {
          value: round(cell(p.table, p.i, p.j) / otherTotal(p), 3),
          mistakeCode: 'WRONG_MARGINAL',
        },
        { value: prob(otherTotal(p)), mistakeCode: 'IGNORED_CONDITION' },
      ],
      PROB.tolerance,
      PROB.relTolerance,
    );
  },
};
