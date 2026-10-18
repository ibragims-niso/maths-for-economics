import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  budget: number;
  priceX: number;
  priceY: number;
  unitsY: number;
  /** Drawn first: the largest whole number of units of X that fits the budget. */
  best: number;
}

/** The answer is a whole number, and best + 1 must never be graded as correct. */
const WHOLE = { tolerance: 0.01, relTolerance: 0 } as const;

/** F02, difficulty 1: largest whole number of units of one good that fits a budget constraint. */
export const budgetMaxWholeUnits: Generator<Params> = {
  id: 'budget-max-whole-units',
  title: 'Most units within a budget',
  topicId: 'F02',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    for (;;) {
      const priceX = rng.int(3, 40);
      const priceY = rng.int(2, 30);
      const unitsY = rng.int(1, 10);
      // Spending on Y worth at least two units of X keeps the mistakes apart.
      if (priceY * unitsY < 2 * priceX) continue;
      const best = rng.int(3, 60);
      const leftOver = rng.int(1, priceX - 1); // never zero, so the limit is not a whole number
      const budget = priceX * best + priceY * unitsY + leftOver;
      return { budget, priceX, priceY, unitsY, best };
    }
  },

  stem: (p) =>
    `A consumer has a budget of $${num(p.budget)}$. She buys $${num(p.unitsY)}$ units of good Y at $${num(p.priceY)}$ each and spends the rest on good X, which costs $${num(p.priceX)}$ per unit. What is the largest whole number of units of X she can afford?`,

  answer: (p) => ({ kind: 'numeric', value: p.best, decimals: 0, ...WHOLE }),

  steps(p) {
    const spentY = p.priceY * p.unitsY;
    const rest = p.budget - spentY;
    return [
      {
        text: 'Write the budget constraint.',
        latex: `${num(p.priceX)}x + ${num(p.priceY)} \\cdot ${num(p.unitsY)} \\le ${num(p.budget)}`,
        why: 'Spending on the two goods together cannot be more than the budget.',
      },
      {
        text: 'Move the spending on Y to the right-hand side.',
        latex: `${num(p.priceX)}x \\le ${num(p.budget)} - ${num(spentY)} = ${num(rest)}`,
        why: 'Subtract the same amount from both sides; the term changes sign as it moves across.',
        result: rest,
      },
      {
        text: 'Divide both sides by the price of X.',
        latex: `x \\le \\dfrac{${num(rest)}}{${num(p.priceX)}} \\approx ${num(rest / p.priceX)}`,
        why: 'Dividing both sides by a positive number keeps the direction of the inequality.',
        result: round(rest / p.priceX, 2),
      },
      {
        text: 'Take the largest whole number that satisfies the inequality.',
        latex: `x = ${num(p.best)}: \\; ${num(p.priceX)} \\cdot ${num(p.best)} = ${num(p.priceX * p.best)} \\le ${num(rest)} < ${num(p.priceX * (p.best + 1))}`,
        why: `Goods come in whole units, and ${p.best + 1} units would cost more than the money left, so round down, not to the nearest whole number.`,
        result: p.best,
      },
    ];
  },

  distractors(p) {
    const spentY = p.priceY * p.unitsY;
    return cleanDistractors(
      p.best,
      [
        { value: p.best + 1, mistakeCode: 'ROUNDED_UP' },
        { value: round((p.budget - spentY) / p.priceX, 2), mistakeCode: 'NOT_WHOLE' },
        { value: Math.floor(p.budget / p.priceX), mistakeCode: 'IGNORED_OTHER_SPENDING' },
        { value: Math.floor((p.budget + spentY) / p.priceX), mistakeCode: 'MOVED_TERM_SIGN' },
      ],
      WHOLE.tolerance,
      WHOLE.relTolerance,
    );
  },
};
