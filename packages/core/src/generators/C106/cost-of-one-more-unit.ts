import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** C(Q) = F + cQ + sQ² + dQ³; d = 0 gives a quadratic cost, d > 0 (with s < 0) a cubic one. */
  fixedCost: number;
  c: number;
  /** A multiple of 0.5; negative only for a cubic cost. */
  s: number;
  /** A multiple of 0.1, or 0. */
  d: number;
  q0: number;
}

/** The answer is exact to the cent, so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const cost = (p: Params, q: number) =>
  round(p.fixedCost + p.c * q + p.s * q * q + p.d * q * q * q, 2);
/** Marginal cost C′(Q) = c + 2sQ + 3dQ². */
const marginalCost = (p: Params, q: number) => round(p.c + 2 * p.s * q + 3 * p.d * q * q, 2);
const extraCost = (p: Params) => round(cost(p, p.q0 + 1) - cost(p, p.q0), 2);

const coef = (k: number) => (k === 1 ? '' : num(k));

function formula(p: Params): string {
  const square = `${p.s < 0 ? '-' : '+'} ${coef(Math.abs(p.s))}Q^2`;
  const cube = p.d > 0 ? ` + ${coef(p.d)}Q^3` : '';
  return `${num(p.fixedCost)} + ${num(p.c)}Q ${square}${cube}`;
}

function derivative(p: Params): string {
  const square = `${p.s < 0 ? '-' : '+'} ${coef(Math.abs(2 * p.s))}Q`;
  const cube = p.d > 0 ? ` + ${coef(3 * p.d)}Q^2` : '';
  return `${num(p.c)} ${square}${cube}`;
}

/** C106, difficulty 2: the exact cost of one more unit, C(Q₀ + 1) − C(Q₀), next to the marginal-cost estimate C′(Q₀). */
export const costOfOneMoreUnit: Generator<Params> = {
  id: 'cost-of-one-more-unit',
  title: 'Exact cost of one more unit',
  topicId: 'C106',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    const fixedCost = rng.int(2, 40) * 50;
    if (rng.next() < 0.5) {
      return {
        fixedCost,
        c: rng.int(2, 60),
        s: rng.int(1, 6) / 2,
        d: 0,
        q0: rng.int(5, 40),
      };
    }
    // Cubic cost: marginal cost c + 2sQ + 3dQ² first falls, then rises. Keep it positive
    // (c > s²/(3d)) and keep a visible gap between C′(Q₀) and the exact extra cost.
    for (;;) {
      const p = {
        fixedCost,
        c: rng.int(5, 200),
        s: -rng.int(1, 8) / 2,
        d: rng.int(1, 5) / 10,
        q0: rng.int(5, 30),
      };
      const lowestMarginalCost = p.c - (p.s * p.s) / (3 * p.d);
      const gap = p.s + p.d * (3 * p.q0 + 1);
      if (lowestMarginalCost > 1 && Math.abs(gap) >= 0.3) return p;
    }
  },

  stem: (p) =>
    `A firm's total cost of producing $Q$ units is $C(Q) = ${formula(p)}$. It now makes $${num(p.q0)}$ units. Find the exact extra cost of making one more unit, $C(${num(p.q0 + 1)}) - C(${num(p.q0)})$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: extraCost(p), decimals: 2, ...EXACT }),

  steps: (p) => [
    {
      text: 'Estimate first with marginal cost.',
      latex: `C'(Q) = ${derivative(p)}, \\quad C'(${num(p.q0)}) = ${num(marginalCost(p, p.q0))}`,
      why: 'The derivative is the rate at which cost rises at the current output, so it estimates the cost of one more unit. The exact figure follows.',
      result: marginalCost(p, p.q0),
    },
    {
      text: 'Cost of the current output.',
      latex: `C(${num(p.q0)}) = ${num(cost(p, p.q0))}`,
      why: 'The exact change compares total cost before and after the extra unit.',
      result: cost(p, p.q0),
    },
    {
      text: 'Cost with one more unit.',
      latex: `C(${num(p.q0 + 1)}) = ${num(cost(p, p.q0 + 1))}`,
      why: 'Put Q₀ + 1 into the same cost function.',
      result: cost(p, p.q0 + 1),
    },
    {
      text: 'Subtract.',
      latex: `C(${num(p.q0 + 1)}) - C(${num(p.q0)}) = ${num(extraCost(p))}`,
      why: `The exact extra cost differs from the estimate ${num(marginalCost(p, p.q0))} because marginal cost keeps changing between Q₀ and Q₀ + 1: the cost curve bends.`,
      result: extraCost(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      extraCost(p),
      [
        { value: marginalCost(p, p.q0), mistakeCode: 'MARGINAL_FOR_EXACT' },
        { value: cost(p, p.q0 + 1), mistakeCode: 'TOTAL_NOT_MARGINAL' },
        { value: round(cost(p, p.q0) / p.q0, 2), mistakeCode: 'AVERAGE_NOT_MARGINAL' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
