import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** MC(q) = c + dq + eq². */
  c: number;
  /** A multiple of 0.2, so d/2 has one decimal. */
  d: number;
  /** A multiple of 0.03 (so e/3 has two decimals), or 0 for a straight-line MC. */
  e: number;
  /** Output rises from a to b. */
  a: number;
  b: number;
}

/** The answer is exact to the cent, so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const coef = (k: number) => (k === 1 ? '' : num(k));

/** Marginal cost at q. */
const marginalCost = (p: Params, q: number) => round(p.c + p.d * q + p.e * q * q, 2);
/** An antiderivative of MC: F(q) = cq + (d/2)q² + (e/3)q³. */
const antiderivative = (p: Params, q: number) =>
  round(p.c * q + (p.d / 2) * q * q + (p.e / 3) * q * q * q, 2);
const costIncrease = (p: Params) => round(antiderivative(p, p.b) - antiderivative(p, p.a), 2);

function mcFormula(p: Params): string {
  const square = p.e > 0 ? ` + ${coef(p.e)}q^2` : '';
  return `${num(p.c)} + ${coef(p.d)}q${square}`;
}

function antiderivativeFormula(p: Params): string {
  const cube = p.e > 0 ? ` + ${coef(round(p.e / 3, 2))}q^3` : '';
  return `${coef(p.c)}q + ${coef(round(p.d / 2, 1))}q^2${cube}`;
}

/** C113, difficulty 1: the extra cost of raising output from a to b, the integral of MC = c + dq + eq² from a to b. */
export const costIncreaseFromMarginalCost: Generator<Params> = {
  id: 'cost-increase-from-marginal-cost',
  title: 'Extra cost from marginal cost',
  topicId: 'C113',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    const a = rng.int(2, 30);
    return {
      c: rng.int(2, 80),
      d: round(rng.int(1, 20) * 0.2, 1),
      e: rng.next() < 0.6 ? round(rng.int(1, 10) * 0.03, 2) : 0,
      a,
      b: a + rng.int(5, 25),
    };
  },

  stem: (p) =>
    `A firm's marginal cost is $MC(q) = ${mcFormula(p)}$ per unit at output $q$. By how much does its total cost rise when output increases from $${num(p.a)}$ to $${num(p.b)}$ units? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: costIncrease(p), decimals: 2, ...EXACT }),

  steps: (p) => [
    {
      text: 'Write the rise in total cost as an integral of marginal cost.',
      latex: `C(${num(p.b)}) - C(${num(p.a)}) = \\int_{${num(p.a)}}^{${num(p.b)}} \\left(${mcFormula(p)}\\right) dq`,
      why: 'Total cost is an antiderivative of marginal cost, so by the Fundamental Theorem of Calculus its change is the area under the MC curve between the two outputs.',
    },
    {
      text: 'Find an antiderivative.',
      latex: `F(q) = ${antiderivativeFormula(p)}`,
      why: 'Raise each power of q by one and divide by the new power. A constant (such as fixed cost) is not needed: it would cancel.',
    },
    {
      text: 'Evaluate it at the upper limit.',
      latex: `F(${num(p.b)}) = ${num(antiderivative(p, p.b))}`,
      why: 'Put the new output into the antiderivative.',
      result: antiderivative(p, p.b),
    },
    {
      text: 'Evaluate it at the lower limit.',
      latex: `F(${num(p.a)}) = ${num(antiderivative(p, p.a))}`,
      why: 'The integral counts only the units from a to b, so the part up to a must be taken away.',
      result: antiderivative(p, p.a),
    },
    {
      text: 'Subtract: upper minus lower.',
      latex: `F(${num(p.b)}) - F(${num(p.a)}) = ${num(costIncrease(p))}`,
      why: 'F(b) − F(a) is the extra cost of the units between a and b.',
      result: costIncrease(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      costIncrease(p),
      [
        { value: antiderivative(p, p.b), mistakeCode: 'ONLY_UPPER_LIMIT' },
        {
          value: round(marginalCost(p, p.b) - marginalCost(p, p.a), 2),
          mistakeCode: 'MC_DIFFERENCE',
        },
        {
          value: round(
            p.c * (p.b - p.a) + p.d * (p.b ** 2 - p.a ** 2) + p.e * (p.b ** 3 - p.a ** 3),
            2,
          ),
          mistakeCode: 'NO_DIVIDE_POWER',
        },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
