import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  bmatrix,
  det2,
  det2Added,
  det2Working,
  EXACT,
  type Matrix2,
  replaceColumn,
} from './matrix';

interface Params {
  /** Autonomous consumption. */
  a: number;
  /** Marginal propensity to consume, e.g. 0.8. */
  b: number;
  investment: number;
  government: number;
  /** The unknown asked for: income Y (column 1) or consumption C (column 2). */
  ask: 'Y' | 'C';
}

const MPC_PCT = [60, 70, 75, 80, 90] as const;

/** Unknowns (Y, C): Y − C = I + G and −bY + C = a. */
const matrix = (p: Params): Matrix2 => [
  [1, -1],
  [-p.b, 1],
];
const rhs = (p: Params): [number, number] => [p.investment + p.government, p.a];
const column = (p: Params): 0 | 1 => (p.ask === 'Y' ? 0 : 1);
/** det A = 1 − b, exact in hundredths. */
const detA = (p: Params) => round(det2(matrix(p)), 4);
const detAj = (p: Params, j: 0 | 1) => round(det2(replaceColumn(matrix(p), j, rhs(p))), 4);
/** Y* = (a + I + G)/(1 − b) and C* = (a + b(I + G))/(1 − b), computed in whole hundredths. */
const solution = (p: Params, j: 0 | 1) => {
  const leak = 100 - Math.round(p.b * 100);
  const numerator100 = Math.round(detAj(p, j) * 100);
  return numerator100 / leak;
};
const value = (p: Params) => solution(p, column(p));

/** LA104, difficulty 1: equilibrium income or consumption in a two-equation model, by Cramer's rule. */
export const cramerIncomeModel: Generator<Params> = {
  id: 'cramer-income-model',
  title: "Income model by Cramer's rule",
  topicId: 'LA104',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const bPct = rng.pick(MPC_PCT);
      const a = rng.int(2, 20) * 10;
      const investment = rng.int(5, 40) * 10;
      const government = rng.int(5, 40) * 10;
      const ask = rng.pick(['Y', 'C'] as const);
      // Keep only draws where Y* = (a + I + G)/(1 − b) is whole; then C* = Y* − I − G is too.
      if ((100 * (a + investment + government)) % (100 - bPct) === 0) {
        return { a, b: bPct / 100, investment, government, ask };
      }
    }
  },

  stem: (p) =>
    `An economy is described by $Y = C + I + G$ and $C = ${num(p.a)} + ${num(p.b)}Y$, with $I = ${num(p.investment)}$ and $G = ${num(p.government)}$ (in billions). Write the model as a linear system in $Y$ and $C$ and use Cramer's rule to find equilibrium ${p.ask === 'Y' ? 'income $Y$' : 'consumption $C$'}.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const A = matrix(p);
    const j = column(p);
    const Aj = replaceColumn(A, j, rhs(p));
    const which = p.ask === 'Y' ? 'first' : 'second';
    return [
      {
        text: 'Move the unknowns to the left and write the system in matrix form.',
        latex: `\\begin{aligned} Y - C &= ${num(rhs(p)[0])} \\\\ -${num(p.b)}Y + C &= ${num(p.a)} \\end{aligned} \\qquad ${bmatrix(A)} \\begin{bmatrix} Y \\\\ C \\end{bmatrix} = ${bmatrix([[rhs(p)[0]], [rhs(p)[1]]])}`,
        why: 'Cramer’s rule works on a system Ax = d: each row is one equation, each column holds the coefficients of one unknown.',
      },
      {
        text: 'Find the determinant of the coefficient matrix.',
        latex: `\\det A = ${det2Working(A)} = ${num(detA(p))}`,
        why: 'A 2×2 determinant is the product down the main diagonal minus the product down the other diagonal. It is 1 − b, which is not zero, so there is exactly one equilibrium.',
        result: detA(p),
      },
      {
        text: `Replace the ${which} column (the ${p.ask} column) by the right-hand side and take the determinant.`,
        latex: `\\det A_{${p.ask}} = \\det ${bmatrix(Aj)} = ${det2Working(Aj)} = ${num(detAj(p, j))}`,
        why: `To find an unknown, swap its own column of coefficients for the constants; ${p.ask} is the ${which} unknown, so the ${which} column goes.`,
        result: detAj(p, j),
      },
      {
        text: 'Divide by det A.',
        latex: `${p.ask}^* = \\dfrac{\\det A_{${p.ask}}}{\\det A} = \\dfrac{${num(detAj(p, j))}}{${num(detA(p))}} = ${num(value(p))}`,
        why: 'Cramer’s rule: each unknown is det of its replaced matrix over det A.',
        result: value(p),
      },
    ];
  },

  distractors(p) {
    const j = column(p);
    const other: 0 | 1 = j === 0 ? 1 : 0;
    const Aj = replaceColumn(matrix(p), j, rhs(p));
    return cleanDistractors(
      value(p),
      [
        { value: solution(p, other), mistakeCode: 'WRONG_COLUMN' },
        { value: detAj(p, j), mistakeCode: 'NOT_DIVIDED' },
        { value: round(detA(p) / detAj(p, j), 4), mistakeCode: 'INVERTED_CRAMER' },
        { value: round(det2Added(Aj) / det2Added(matrix(p)), 2), mistakeCode: 'DET_ADDED' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
