import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { drawBudget, EXACT, mrsLatex, partialLatex, utilityLatex } from './budget';

interface Params {
  /** U = x^a·y^b with small whole exponents. */
  a: number;
  b: number;
  px: number;
  py: number;
  M: number;
  /** The optimal bundle, drawn first so both quantities are whole. */
  x: number;
  y: number;
}

const PAIRS: readonly [number, number][] = [
  [1, 1],
  [1, 1],
  [2, 1],
  [1, 2],
];

/** Marginal utilities at the optimum (whole numbers, since x and y are whole). */
const muX = (p: Params) => p.a * p.x ** (p.a - 1) * p.y ** p.b;
const muY = (p: Params) => p.b * p.x ** p.a * p.y ** (p.b - 1);
/** λ = MU_x / p_x, the extra utility from one more unit of money. */
const lambda = (p: Params) => round(muX(p) / p.px, 2);

function candidates(p: Params) {
  const utility = p.x ** p.a * p.y ** p.b;
  return [
    { value: p.x, mistakeCode: 'GAVE_QUANTITY' },
    { value: round(utility / p.M, 2), mistakeCode: 'AVERAGE_NOT_MARGINAL' },
    { value: round(muX(p) / p.py, 2), mistakeCode: 'WRONG_PRICE' },
    { value: -lambda(p), mistakeCode: 'LAMBDA_SIGN' },
  ];
}

/** MV08, difficulty 3: the Lagrange multiplier λ at the optimum of U = x^a·y^b on a budget. */
export const lagrangeMultiplierUtility: Generator<Params> = {
  id: 'lagrange-multiplier-utility',
  title: 'Value of the Lagrange multiplier',
  topicId: 'MV08',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const [a, b] = rng.pick(PAIRS);
      const budget = drawBudget(rng, a, b, { minIncome: 40, maxIncome: 1200, maxPrice: 12 });
      if (!budget) continue;
      if (budget.x < 2 || budget.y < 2) continue;
      const p: Params = { a, b, ...budget };
      // λ must be exact to 2 decimals: 100·MU_x is a whole multiple of p_x.
      if ((100 * muX(p)) % p.px !== 0) continue;
      const l = muX(p) / p.px;
      if (l < 0.5 || l > 500) continue;
      const kept = cleanDistractors(lambda(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer maximises $U = ${utilityLatex(p.a, p.b)}$ subject to the budget $${num(p.px)}x + ${num(p.py)}y = ${num(p.M)}$, using the Lagrangian $\\mathcal{L} = ${utilityLatex(p.a, p.b)} - \\lambda(${num(p.px)}x + ${num(p.py)}y - ${num(p.M)})$. Find the value of $\\lambda$ at the optimum. Give your answer to 2 decimal places if it is not whole.`,

  answer: (p) => ({ kind: 'numeric', value: lambda(p), decimals: 2, ...EXACT }),

  steps(p) {
    const sum = p.a + p.b;
    return [
      {
        text: 'Write the first-order conditions of the Lagrangian.',
        latex: `\\mathcal{L}_x = ${partialLatex(p.a, p.b, 'x')} - ${num(p.px)}\\lambda = 0, \\quad \\mathcal{L}_y = ${partialLatex(p.a, p.b, 'y')} - ${num(p.py)}\\lambda = 0, \\quad ${num(p.px)}x + ${num(p.py)}y = ${num(p.M)}`,
        why: 'λ appears in the first two conditions: it is the marginal utility of each good divided by its price.',
      },
      {
        text: 'Solve for the optimal bundle with the ratio trick.',
        latex: `MRS = ${mrsLatex(p.a, p.b)} = \\dfrac{${num(p.px)}}{${num(p.py)}} \\;\\Rightarrow\\; x^* = \\dfrac{${num(p.a)}}{${num(sum)}}\\cdot\\dfrac{${num(p.M)}}{${num(p.px)}} = ${num(p.x)}, \\quad y^* = \\dfrac{${num(p.b)}}{${num(sum)}}\\cdot\\dfrac{${num(p.M)}}{${num(p.py)}} = ${num(p.y)}`,
        why: 'Dividing the first two conditions removes λ and gives MRS = price ratio; the budget then fixes the bundle. λ can only be found once x and y are known.',
        result: p.x,
      },
      {
        text: 'Put the bundle into the first condition and solve for λ.',
        latex: `\\lambda = \\dfrac{U_x}{p_x} = \\dfrac{${num(muX(p))}}{${num(p.px)}} = ${num(lambda(p))} \\quad\\left(\\text{check: } \\dfrac{U_y}{p_y} = \\dfrac{${num(muY(p))}}{${num(p.py)}}\\right)`,
        why: 'Both goods give the same extra utility per unit of money at the optimum. λ is roughly how much utility one more unit of income would add (MV09 develops this).',
        result: lambda(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(lambda(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
