import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { type Matrix2, paren, rows2, trace2 } from './eigen';

interface Params extends Matrix2 {
  /** The eigenvalue given in the question; its eigenvector is (1, y) with y = (λ − a)/b. */
  lambda: number;
}

/** y is a whole number or a half, so the exact value is expected. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const Y_VALUES = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];

const answerOf = (p: Params) => (p.lambda - p.a) / p.b;

const candidates = (p: Params): Distractor[] => {
  const y = answerOf(p);
  return [
    { value: -y, mistakeCode: 'SIGN' },
    { value: round(1 / y, 2), mistakeCode: 'RECIPROCAL' },
    // Solved Av = 0 from row 1: a + b·y = 0.
    { value: round(-p.a / p.b, 2), mistakeCode: 'FORGOT_LAMBDA' },
    // Read row 1 down column 1 instead: (a − λ) + c·y = 0.
    { value: round((p.lambda - p.a) / p.c, 2), mistakeCode: 'COLUMN_NOT_ROW' },
  ];
};

/** LA202, difficulty 2: the second entry of the eigenvector (1, y) of a 2×2 matrix for a given eigenvalue. */
export const eigenvectorSecondComponent: Generator<Params> = {
  id: 'eigenvector-second-component',
  title: 'Eigenvector for a given eigenvalue',
  topicId: 'LA202',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const y = rng.pick(Y_VALUES);
      const a = rng.int(-2, 9);
      const b = rng.int(1, 6) * rng.pick([1, -1]);
      const d = rng.int(-2, 9);
      const lambda = a + b * y;
      // Row 2 must also hold: c + (d − λ)·y = 0.
      const c = y * (lambda - d);
      if (!Number.isInteger(lambda) || !Number.isInteger(c)) continue;
      if (c === 0 || lambda === 0 || Math.abs(c) > 12 || Math.abs(lambda) > 15) continue;
      const p: Params = { a, b, c, d, lambda };
      // The other eigenvalue, trace − λ, must differ, so the eigenvector direction is unique.
      if (trace2(p) - lambda === lambda) continue;
      if (cleanDistractors(y, candidates(p), EXACT.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const whole = Number.isInteger(answerOf(p));
    return `One eigenvalue of $A = ${pmatrix(rows2(p))}$ is $\\lambda = ${num(p.lambda)}$. Find the eigenvector for this eigenvalue in the form $v = (1, y)$: what is $y$?${whole ? '' : ' Give your answer to 2 decimal places.'}`;
  },

  answer(p) {
    const y = answerOf(p);
    return { kind: 'numeric', value: y, decimals: Number.isInteger(y) ? 0 : 2, ...EXACT };
  },

  steps(p) {
    const y = answerOf(p);
    const shifted = rows2({ ...p, a: p.a - p.lambda, d: p.d - p.lambda });
    return [
      {
        text: 'Subtract λ from the diagonal entries.',
        latex: `A - ${paren(p.lambda)}I = ${pmatrix(shifted)}`,
        why: 'An eigenvector solves (A − λI)v = 0. Because λ is an eigenvalue, A − λI is singular: its two rows are proportional, so one row is enough.',
      },
      {
        text: 'Put v = (1, y) into the first row and solve for y.',
        latex: `${num(p.a - p.lambda)} \\cdot 1 + ${paren(p.b)}\\,y = 0 \\;\\Rightarrow\\; y = \\dfrac{${num(p.lambda - p.a)}}{${num(p.b)}} = ${num(y)}`,
        why: 'Any non-zero multiple of an eigenvector is also an eigenvector, so the first entry can be fixed at 1; the first row then leaves one unknown.',
        result: y,
      },
      {
        text: 'Check with the second row and with Av = λv.',
        latex: `${num(p.c)} + ${paren(p.d - p.lambda)} \\cdot ${paren(y)} = 0,\\qquad A\\begin{pmatrix} 1 \\\\ ${num(y)} \\end{pmatrix} = \\begin{pmatrix} ${num(p.a + p.b * y)} \\\\ ${num(p.c + p.d * y)} \\end{pmatrix} = ${paren(p.lambda)}\\begin{pmatrix} 1 \\\\ ${num(y)} \\end{pmatrix}`,
        why: 'The second row gives the same y, and A only stretches v by the factor λ: v stays on its own line.',
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0),
};
