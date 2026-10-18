import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Output Q(L) = kL (linear) or Q(L) = k√L (square root, diminishing returns). */
  form: 'linear' | 'sqrt';
  k: number;
  fixedCost: number;
  unitCost: number;
  /** Built from a whole number of workers, so the answer is whole. */
  budget: number;
}

/** A number of workers is exact: no relative tolerance. */
const COUNT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Undo the cost function: the output that costs exactly the budget. */
const outputFor = (p: Params) => (p.budget - p.fixedCost) / p.unitCost;
/** Undo the production function: the workers who make that output. */
const labourFor = (p: Params, q: number) => (p.form === 'linear' ? q / p.k : (q / p.k) ** 2);
const answerOf = (p: Params) => round(labourFor(p, outputFor(p)), 2);

const outputTex = (p: Params) => (p.form === 'linear' ? `${num(p.k)}L` : `${num(p.k)}\\sqrt{L}`);

/** F10, difficulty 3: invert a composite, the workers whose output costs exactly a budget. */
export const labourForCostBudget: Generator<Params> = {
  id: 'labour-for-cost-budget',
  title: 'Workers for a cost budget',
  topicId: 'F10',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    const fixedCost = rng.int(5, 200) * 50;
    const unitCost = rng.int(2, 40);
    if (rng.next() < 0.5) {
      const k = rng.int(2, 25);
      const labour = rng.int(5, 80);
      return { form: 'linear', k, fixedCost, unitCost, budget: fixedCost + unitCost * k * labour };
    }
    const k = rng.int(4, 30);
    const root = rng.int(2, 20); // L = root², so output k·root is whole
    return { form: 'sqrt', k, fixedCost, unitCost, budget: fixedCost + unitCost * k * root };
  },

  stem: (p) =>
    `A workshop that employs $L$ workers produces $Q(L) = ${outputTex(p)}$ units, and producing $Q$ units costs $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q$. How many workers should it employ so that its total cost $C(Q(L))$ is exactly $${num(p.budget)}$?`,

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 0, ...COUNT }),

  steps(p) {
    const q = outputFor(p);
    const undoInner =
      p.form === 'linear'
        ? {
            latex: `${num(p.k)}L = ${num(q)} \\;\\Rightarrow\\; L = \\dfrac{${num(q)}}{${num(p.k)}} = ${num(answerOf(p))}`,
            why: 'Q(L) = kL multiplies the number of workers by k, so its inverse divides the output by k.',
          }
        : {
            latex: `${num(p.k)}\\sqrt{L} = ${num(q)} \\;\\Rightarrow\\; \\sqrt{L} = ${num(q / p.k)} \\;\\Rightarrow\\; L = ${num(q / p.k)}^2 = ${num(answerOf(p))}`,
            why: 'Q(L) = k√L takes a square root and then multiplies by k, so its inverse divides by k and then squares. Squaring is safe here because output and workers are never negative.',
          };
    return [
      {
        text: 'Undo the outer function first: find the output whose cost is the budget.',
        latex: `${num(p.fixedCost)} + ${num(p.unitCost)}Q = ${num(p.budget)} \\;\\Rightarrow\\; Q = \\dfrac{${num(p.budget)} - ${num(p.fixedCost)}}{${num(p.unitCost)}} = ${num(q)}`,
        why: 'The cost function was applied last, so it is undone first: take away the fixed cost, then divide by the cost per unit.',
        result: q,
      },
      {
        text: 'Then undo the inner function: find the workers who make that output.',
        ...undoInner,
        result: answerOf(p),
      },
      {
        text: 'Check by putting the workers back through both functions.',
        latex: `C(Q(${num(answerOf(p))})) = ${num(p.fixedCost)} + ${num(p.unitCost)} \\cdot ${num(q)} = ${num(p.budget)}`,
        why: 'Applying the composite to the answer must give back the budget, because the inverse undoes the composite.',
      },
    ];
  },

  distractors(p) {
    const q = outputFor(p);
    const candidates = [
      { value: q, mistakeCode: 'OUTPUT_NOT_WORKERS' },
      {
        value: round(labourFor(p, p.budget / p.unitCost), 2),
        mistakeCode: 'FIXED_COST_IGNORED',
      },
      {
        value: round(p.form === 'linear' ? p.k * q : p.k * Math.sqrt(q), 2),
        mistakeCode: 'APPLIED_NOT_INVERTED',
      },
    ];
    if (p.form === 'sqrt') candidates.push({ value: q / p.k, mistakeCode: 'FORGOT_SQUARE' });
    return cleanDistractors(answerOf(p), candidates, COUNT.tolerance, COUNT.relTolerance);
  },
};
