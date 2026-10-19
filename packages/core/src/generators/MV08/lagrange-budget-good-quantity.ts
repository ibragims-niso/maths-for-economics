import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { drawBudget, EXACT, mrsLatex, partialLatex, utilityLatex } from './budget';

interface Params {
  /** U = x^a·y^b, a ≠ b. */
  a: number;
  b: number;
  px: number;
  py: number;
  M: number;
  /** The optimal bundle, drawn first so both quantities are whole. */
  x: number;
  y: number;
  /** The good asked for. */
  ask: 'x' | 'y';
}

/** Exponent pairs: whole numbers, and decimals that add up to 1. */
const PAIRS: readonly [number, number][] = [
  [1, 2],
  [2, 1],
  [1, 3],
  [3, 1],
  [2, 3],
  [3, 2],
  [0.3, 0.7],
  [0.7, 0.3],
  [0.4, 0.6],
  [0.6, 0.4],
  [0.2, 0.8],
  [0.8, 0.2],
  [0.25, 0.75],
  [0.75, 0.25],
];

const value = (p: Params) => (p.ask === 'x' ? p.x : p.y);

/** The asked good's exponent and price, and the other good's. */
const own = (p: Params) =>
  p.ask === 'x'
    ? { e: p.a, other: p.b, price: p.px, otherPrice: p.py }
    : { e: p.b, other: p.a, price: p.py, otherPrice: p.px };

function candidates(p: Params) {
  const o = own(p);
  const share = o.e / (o.e + o.other);
  return [
    { value: round(p.M / o.price, 2), mistakeCode: 'ALL_ON_ONE_GOOD' },
    { value: round(p.M / (2 * o.price), 2), mistakeCode: 'EQUAL_SPLIT' },
    { value: round((share * p.M) / o.otherPrice, 2), mistakeCode: 'WRONG_PRICE' },
    { value: round(((1 - share) * p.M) / o.price, 2), mistakeCode: 'SWAPPED_EXPONENTS' },
  ];
}

/** MV08, difficulty 1: the utility-maximising quantity of one good for U = x^a·y^b on a budget. */
export const lagrangeBudgetGoodQuantity: Generator<Params> = {
  id: 'lagrange-budget-good-quantity',
  title: 'Best bundle on a budget',
  topicId: 'MV08',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const [a, b] = rng.pick(PAIRS);
      const budget = drawBudget(rng, Math.round(a * 100), Math.round(b * 100), {
        minIncome: 60,
        maxIncome: 1500,
        maxPrice: 20,
      });
      if (!budget) continue;
      if (budget.x < 2 || budget.y < 2 || budget.x > 200 || budget.y > 200) continue;
      const p: Params = { a, b, ...budget, ask: rng.pick(['x', 'x', 'y'] as const) };
      const kept = cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A student's utility from meals $x$ and other goods $y$ is $U = ${utilityLatex(p.a, p.b)}$. A meal costs ${num(p.px)}, a unit of other goods costs ${num(p.py)}, and the monthly budget is ${num(p.M)}, so $${num(p.px)}x + ${num(p.py)}y = ${num(p.M)}$. ${
      p.ask === 'x'
        ? 'How many meals $x$ maximise utility?'
        : 'How many units of other goods $y$ maximise utility?'
    }`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const o = own(p);
    const v = p.ask;
    const w = v === 'x' ? 'y' : 'x';
    const sum = p.a + p.b;
    // Decimal exponents add up to 1, so the share is just the exponent.
    const one = Math.abs(sum - 1) < 1e-9;
    const share = one ? num(o.e) : `\\dfrac{${num(o.e)}}{${num(sum)}}`;
    const shareText = one ? num(o.e) : `${num(o.e)}/${num(sum)}`;
    return [
      {
        text: 'Write the Lagrangian and its three first-order conditions.',
        latex: `\\begin{aligned} \\mathcal{L} &= ${utilityLatex(p.a, p.b)} - \\lambda(${num(p.px)}x + ${num(p.py)}y - ${num(p.M)}) \\\\ \\mathcal{L}_x &= ${partialLatex(p.a, p.b, 'x')} - ${num(p.px)}\\lambda = 0 \\\\ \\mathcal{L}_y &= ${partialLatex(p.a, p.b, 'y')} - ${num(p.py)}\\lambda = 0 \\\\ \\mathcal{L}_\\lambda &: ${num(p.px)}x + ${num(p.py)}y = ${num(p.M)} \\end{aligned}`,
        why: 'At the best affordable bundle each good gives the same extra utility per unit of money (λ), and the whole budget is spent.',
      },
      {
        text: 'Divide the first two conditions: the MRS equals the price ratio.',
        latex: `MRS = ${mrsLatex(p.a, p.b)} = \\dfrac{${num(p.px)}}{${num(p.py)}} \\quad\\Rightarrow\\quad ${num(p.py)}y = \\dfrac{${num(p.b)}}{${num(p.a)}}\\cdot ${num(p.px)}x`,
        why: 'Dividing removes λ. The indifference curve is tangent to the budget line, so their slopes are equal. Spending on each good is in the ratio of the exponents.',
      },
      {
        text: `Put this into the budget and solve for ${v}.`,
        latex: `${v}^* = ${share}\\cdot\\dfrac{${num(p.M)}}{${num(o.price)}} = ${num(value(p))}`,
        why: `Spending on ${v} is the share ${shareText} of the budget; dividing that spending by the price of ${v} gives the quantity. The other good gets ${w}* = ${num(v === 'x' ? p.y : p.x)}.`,
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
