import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Marginal cost MC(q) = a + bq + cq². */
  a: number;
  /** A whole number, so b/2 has at most one decimal. */
  b: number;
  /** A multiple of 0.03 (possibly 0), so c/3 has at most two decimals. */
  c: number;
  fixedCost: number;
  q0: number;
}

/** The answer is exact to the cent, so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const coef = (k: number) => (k === 1 ? '' : num(k));

/** The variable part of cost, aq + (b/2)q² + (c/3)q³, without the fixed cost. */
const variableCost = (p: Params, q: number) =>
  round(p.a * q + (p.b / 2) * q * q + (p.c / 3) * q * q * q, 2);
const totalCost = (p: Params, q: number) => round(p.fixedCost + variableCost(p, q), 2);

function marginalCost(p: Params): string {
  const square = p.c > 0 ? ` + ${coef(p.c)}q^2` : '';
  return `${num(p.a)} + ${coef(p.b)}q${square}`;
}

function antiderivative(p: Params): string {
  const cube = p.c > 0 ? ` + ${coef(round(p.c / 3, 2))}q^3` : '';
  return `${num(p.a)}q + ${coef(p.b / 2)}q^2${cube}`;
}

/** C112, difficulty 1: total cost at q₀ from marginal cost a + bq + cq² and a fixed cost. */
export const totalCostFromMarginalCost: Generator<Params> = {
  id: 'total-cost-from-marginal-cost',
  title: 'Total cost from marginal cost',
  topicId: 'C112',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    return {
      a: rng.int(5, 60),
      b: rng.int(1, 12),
      c: round(rng.int(0, 10) * 0.03, 2),
      fixedCost: rng.int(2, 40) * 50,
      q0: rng.int(5, 30),
    };
  },

  stem: (p) =>
    `A firm's marginal cost is $MC(q) = ${marginalCost(p)}$ and its fixed cost is $${num(p.fixedCost)}$. Find the total cost of producing $${num(p.q0)}$ units. Give your answer to 2 decimal places if needed.`,

  answer: (p) => ({ kind: 'numeric', value: totalCost(p, p.q0), decimals: 2, ...EXACT }),

  steps: (p) => [
    {
      text: 'Integrate marginal cost term by term.',
      latex: `C(q) = \\int (${marginalCost(p)})\\,dq = ${antiderivative(p)} + c_0`,
      why: 'Total cost is the function whose derivative is marginal cost. For each power of q, raise the power by 1 and divide by the new power; differentiating the result gives MC back.',
    },
    {
      text: 'Fix the constant with the fixed cost.',
      latex: `C(0) = c_0 = ${num(p.fixedCost)}`,
      why: 'Producing nothing still costs the fixed cost, and every q-term is zero at q = 0, so the constant equals the fixed cost.',
      result: p.fixedCost,
    },
    {
      text: 'Evaluate at the given output.',
      latex: `C(${num(p.q0)}) = ${num(p.fixedCost)} + ${num(variableCost(p, p.q0))} = ${num(totalCost(p, p.q0))}`,
      why: `The variable cost of ${num(p.q0)} units is ${num(variableCost(p, p.q0))}; adding the fixed cost gives the total.`,
      result: totalCost(p, p.q0),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      totalCost(p, p.q0),
      [
        { value: variableCost(p, p.q0), mistakeCode: 'FORGOT_CONSTANT' },
        {
          value: round(p.fixedCost + (p.a + p.b * p.q0 + p.c * p.q0 * p.q0) * p.q0, 2),
          mistakeCode: 'NO_DIVIDE_POWER',
        },
        { value: round(p.b + 2 * p.c * p.q0, 2), mistakeCode: 'DIFFERENTIATED' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
