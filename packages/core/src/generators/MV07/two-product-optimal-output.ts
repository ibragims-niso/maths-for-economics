import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  EXACT,
  factor,
  profitLatex,
  type QuadraticProfit,
  signed,
  solveSymmetric,
  term,
} from './two-goods';

interface Params extends QuadraticProfit {
  /** The profit-maximising quantities, drawn first so the answer is whole. */
  q1: number;
  q2: number;
  /** The quantity asked for: Q₁ or Q₂. */
  ask: 1 | 2;
}

/** FOCs: 2c·Q₁ + e·Q₂ = a and e·Q₁ + 2d·Q₂ = b. */
const det = (p: Params) => 4 * p.c * p.d - p.e * p.e;
const value = (p: Params) => (p.ask === 1 ? p.q1 : p.q2);

/** MV07, difficulty 2: the profit-maximising quantity of one good for a two-product firm. */
export const twoProductOptimalOutput: Generator<Params> = {
  id: 'two-product-optimal-output',
  title: 'Two-product firm: best output',
  topicId: 'MV07',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const c = rng.int(1, 5);
      const d = rng.int(1, 5);
      // Usually the goods compete for the firm's capacity (e > 0); sometimes they help each other.
      const e = rng.pick([-3, -2, -1, 1, 1, 2, 2, 3, 3, 4, 5, 6]);
      if (4 * c * d - e * e < 3) continue;
      const q1 = rng.int(4, 30);
      const q2 = rng.int(4, 30);
      const a = 2 * c * q1 + e * q2;
      const b = 2 * d * q2 + e * q1;
      if (a < 10 || b < 10 || q1 === q2) continue;
      return {
        a,
        b,
        c,
        d,
        e,
        fixedCost: rng.int(2, 40) * 25,
        q1,
        q2,
        ask: rng.pick([1, 2] as const),
      };
    }
  },

  stem: (p) =>
    `A firm makes two products. Its profit is $${profitLatex(p)}$, where $Q_1$ and $Q_2$ are the quantities of the two products. Which quantity $Q_${p.ask}$ maximises profit?`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const D = det(p);
    const numerator = p.ask === 1 ? p.a * 2 * p.d - p.e * p.b : 2 * p.c * p.b - p.e * p.a;
    const cramer =
      p.ask === 1
        ? `${num(p.a)} \\cdot ${num(2 * p.d)} - ${factor(p.e)} \\cdot ${num(p.b)}`
        : `${num(2 * p.c)} \\cdot ${num(p.b)} - ${factor(p.e)} \\cdot ${num(p.a)}`;
    return [
      {
        text: 'Set both partial derivatives equal to zero (the first-order conditions).',
        latex: `\\begin{aligned} \\dfrac{\\partial \\pi}{\\partial Q_1} &= ${num(p.a)}${signed(-2 * p.c, 'Q_1')}${signed(-p.e, 'Q_2')} = 0 \\\\ \\dfrac{\\partial \\pi}{\\partial Q_2} &= ${num(p.b)}${signed(-2 * p.d, 'Q_2')}${signed(-p.e, 'Q_1')} = 0 \\end{aligned}`,
        why: 'At the top of the profit hill a small change in either quantity adds nothing, so both slopes are zero. The cross term eQ₁Q₂ appears in both derivatives.',
      },
      {
        text: 'Write the two conditions as a linear system and find its determinant.',
        latex: `\\begin{aligned} ${term(2 * p.c, 'Q_1')}${signed(p.e, 'Q_2')} &= ${num(p.a)} \\\\ ${p.e < 0 ? '-' : ''}${term(Math.abs(p.e), 'Q_1')}${signed(2 * p.d, 'Q_2')} &= ${num(p.b)} \\end{aligned} \\qquad \\det = ${num(2 * p.c)} \\cdot ${num(2 * p.d)} - ${factor(p.e)}^2 = ${num(D)}`,
        why: 'The determinant is not zero, so there is exactly one critical point.',
        result: D,
      },
      {
        text: `Solve for Q${p.ask === 1 ? '₁' : '₂'} by Cramer's rule.`,
        latex: `Q_${p.ask} = \\dfrac{${cramer}}{${num(D)}} = \\dfrac{${num(numerator)}}{${num(D)}} = ${num(value(p))}`,
        why: 'Replace the column of the unknown by the right-hand side and divide by the determinant. Substitution gives the same result.',
        result: value(p),
      },
      {
        text: 'Check that the critical point is a maximum.',
        latex: `\\pi_{11} = ${num(-2 * p.c)} < 0, \\quad D = \\pi_{11}\\pi_{22} - \\pi_{12}^2 = ${factor(-2 * p.c)} \\cdot ${factor(-2 * p.d)} - ${factor(-p.e)}^2 = ${num(D)} > 0`,
        why: `D > 0 and π₁₁ < 0, so profit bends down in every direction: (${num(p.q1)}, ${num(p.q2)}) is a maximum.`,
      },
    ];
  },

  distractors(p) {
    const own = p.ask === 1 ? [2 * p.c, p.a] : [2 * p.d, p.b];
    const wrongSign = solveSymmetric(2 * p.c, -p.e, 2 * p.d, p.a, p.b);
    const noTwo = solveSymmetric(p.c, p.e, p.d, p.a, p.b);
    const pick = (x: [number, number] | null) =>
      x === null ? Number.NaN : round(x[p.ask - 1] ?? Number.NaN, 2);
    return cleanDistractors(
      value(p),
      [
        { value: round((own[1] ?? 0) / (own[0] ?? 1), 2), mistakeCode: 'IGNORED_CROSS_TERM' },
        { value: pick(wrongSign), mistakeCode: 'CROSS_SIGN' },
        { value: pick(noTwo), mistakeCode: 'FORGOT_FACTOR_TWO' },
        { value: p.ask === 1 ? p.q2 : p.q1, mistakeCode: 'OTHER_QUANTITY' },
      ].filter((x) => x.value > 0),
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
