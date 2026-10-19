import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { drawBudget, EXACT } from '../MV08/budget';

interface Params {
  /** Prices and income of U = xy on the budget p_x·x + p_y·y = M. */
  px: number;
  py: number;
  M: number;
  /** The optimal bundle, both whole: half of income goes on each good. */
  x: number;
  y: number;
  /** The rise in income. */
  dM: number;
}

/** λ = U_x/p_x = y* / p_x = M/(2·p_x·p_y), exact to 2 decimals by construction. */
const lambda = (p: Params) => round(p.y / p.px, 2);
/** The estimate ΔV ≈ λ·ΔM. */
const estimate = (p: Params) => round((p.y * p.dM) / p.px, 2);
/** Maximum utility V(M) = M²/(4·p_x·p_y). */
const best = (p: Params, m: number) => (m * m) / (4 * p.px * p.py);

function candidates(p: Params) {
  return [
    { value: round(best(p, p.M + p.dM), 2), mistakeCode: 'NEW_LEVEL' },
    { value: lambda(p), mistakeCode: 'LAMBDA_ONLY' },
    { value: round(p.dM / lambda(p), 2), mistakeCode: 'DIVIDED_BY_LAMBDA' },
    { value: round((best(p, p.M) / p.M) * p.dM, 2), mistakeCode: 'AVERAGE_NOT_MARGINAL' },
  ];
}

/** MV09, difficulty 1: estimate the rise in maximum utility of U = xy from extra income, ΔV ≈ λ·ΔM. */
export const shadowPriceIncomeEstimate: Generator<Params> = {
  id: 'shadow-price-income-estimate',
  title: 'Extra utility from extra income',
  topicId: 'MV09',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const budget = drawBudget(rng, 1, 1, { minIncome: 100, maxIncome: 1500, maxPrice: 12 });
      if (!budget) continue;
      if (budget.x < 2 || budget.y < 2) continue;
      // λ = y*/p_x must be exact to 2 decimals.
      if ((100 * budget.y) % budget.px !== 0) continue;
      const l = budget.y / budget.px;
      if (l < 0.5 || l > 100) continue;
      // A small rise, at most a fifth of income, so the estimate is close.
      const dM = 5 * rng.int(1, 20);
      if (5 * dM > budget.M) continue;
      const p: Params = { ...budget, dM };
      const kept = cleanDistractors(
        estimate(p),
        candidates(p),
        EXACT.tolerance,
        EXACT.relTolerance,
      );
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer with utility $U = xy$ faces prices $p_x = ${num(p.px)}$ and $p_y = ${num(p.py)}$ and has income $M = ${num(p.M)}$. Use the Lagrange multiplier to estimate how much maximum utility rises if income rises by ${num(p.dM)}. Give your answer to 2 decimal places if it is not whole.`,

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 2, ...EXACT }),

  steps(p) {
    const exact = best(p, p.M + p.dM) - best(p, p.M);
    return [
      {
        text: 'Find the best bundle: with U = xy, half of income goes on each good.',
        latex: `x^* = \\dfrac{M}{2p_x} = \\dfrac{${num(p.M)}}{${num(2 * p.px)}} = ${num(p.x)}, \\qquad y^* = \\dfrac{M}{2p_y} = \\dfrac{${num(p.M)}}{${num(2 * p.py)}} = ${num(p.y)}`,
        why: 'The Lagrange conditions give MRS = y/x = pₓ/p_y, so spending is equal on the two goods (MV08).',
        result: p.y,
      },
      {
        text: 'Find λ from the first-order condition for x.',
        latex: `\\lambda = \\dfrac{U_x}{p_x} = \\dfrac{y^*}{p_x} = \\dfrac{${num(p.y)}}{${num(p.px)}} = ${num(lambda(p))}`,
        why: 'λ is the slope of the value function V(M): the extra utility from one more unit of income, the marginal utility of income.',
        result: lambda(p),
      },
      {
        text: 'Multiply the shadow price by the change in income.',
        latex: `\\Delta V \\approx \\lambda\\,\\Delta M = ${num(lambda(p))} \\times ${num(p.dM)} = ${num(estimate(p))}`,
        why: `Each extra unit of income is worth about λ. The exact change, V(${p.M + p.dM}) − V(${p.M}) with V(M) = M²/(4pₓp_y), is ${round(exact, 2)}: a little more, because λ itself grows with income.`,
        result: estimate(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(estimate(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
