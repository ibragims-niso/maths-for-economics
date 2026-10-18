import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Cost {
  /** Fixed cost. */
  F: number;
  /** Coefficient of q. */
  v: number;
  /** Coefficient of q². */
  w: number;
}

interface Params {
  A: Cost;
  B: Cost;
}

const coef = (x: number) => (x === 1 ? '' : num(x));

/** "F + vq + wq²" in the order firms usually write costs. */
const cost = (c: Cost) => `${num(c.F)} + ${coef(c.v)}q + ${coef(c.w)}q^2`;

/** The same cost with the highest power first. */
const leadingFirst = (c: Cost) => `${coef(c.w)}q^2 + ${coef(c.v)}q + ${num(c.F)}`;

const limit = (p: Params) => p.A.w / p.B.w;

/** C101, difficulty 2: the long-run ratio of two quadratic cost functions (ratio of leading terms). */
export const longRunCostRatio: Generator<Params> = {
  id: 'long-run-cost-ratio',
  title: 'Long-run ratio of two costs',
  topicId: 'C101',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      // Firm B's q² coefficient divides 100, so the answer has at most 2 decimals.
      const B = { F: rng.int(2, 60) * 100, v: rng.int(2, 60), w: rng.pick([1, 2, 4, 5]) };
      const A = { F: rng.int(2, 60) * 100, v: rng.int(2, 60), w: rng.int(1, 12) };
      // A ratio of 1 would coincide with the "∞/∞ = 1" mistake.
      if (A.w !== B.w) return { A, B };
    }
  },

  stem: (p) =>
    `Firm A's total cost is $C_A(q) = ${cost(p.A)}$ and firm B's is $C_B(q) = ${cost(p.B)}$. As output $q$ grows without limit, what value does the ratio $\\dfrac{C_A(q)}{C_B(q)}$ approach?${Number.isInteger(limit(p)) ? '' : ' Give your answer to 2 decimal places.'}`,

  answer: (p) => ({ kind: 'numeric', value: round(limit(p), 2), decimals: 2 }),

  steps: (p) => [
    {
      text: 'Find the highest power of q in the top and the bottom.',
      latex: `\\frac{C_A(q)}{C_B(q)} = \\frac{${leadingFirst(p.A)}}{${leadingFirst(p.B)}}`,
      why: 'For large q the q² terms dwarf the others, so the q² terms decide where the ratio goes. Writing them first makes this visible.',
    },
    {
      text: 'Divide every term, top and bottom, by q².',
      latex: `\\frac{${num(p.A.w)} + \\frac{${num(p.A.v)}}{q} + \\frac{${num(p.A.F)}}{q^2}}{${num(p.B.w)} + \\frac{${num(p.B.v)}}{q} + \\frac{${num(p.B.F)}}{q^2}}`,
      why: 'Dividing the top and the bottom by the same number does not change the ratio, but now every term except the first tends to 0.',
    },
    {
      text: 'Let q grow without limit.',
      latex: `\\lim_{q \\to \\infty} \\frac{C_A(q)}{C_B(q)} = \\frac{${num(p.A.w)} + 0 + 0}{${num(p.B.w)} + 0 + 0} = ${num(limit(p))}`,
      why: 'A fixed number divided by an ever larger q tends to 0, so only the ratio of the leading coefficients is left.',
      result: round(limit(p), 2),
    },
  ],

  distractors: (p) =>
    cleanDistractors(round(limit(p), 2), [
      { value: round(p.A.F / p.B.F, 2), mistakeCode: 'CONSTANT_TERMS' },
      { value: 1, mistakeCode: 'INFINITY_OVER_INFINITY' },
      { value: 0, mistakeCode: 'TENDS_TO_ZERO' },
    ]),
};
