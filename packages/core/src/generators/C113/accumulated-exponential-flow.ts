import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Net investment builds up a capital stock; a revenue flow adds up to total sales. */
  setting: 'investment' | 'revenue';
  /** The flow is A·e^(kt) per year. */
  A: number;
  /** Growth (k > 0) or decline (k < 0) rate; |k| is chosen so that A/k is a short decimal. */
  k: number;
  /** The period runs from year t1 to year t2. */
  t1: number;
  t2: number;
}

/**
 * Students round e^(kt) on a calculator; allow 0.1 % (A/k can be large) but keep the two-decimal
 * form of the answer.
 */
const TOL = { tolerance: 0.05, relTolerance: 0.001 } as const;

const flow = (p: Params, t: number) => p.A * Math.exp(p.k * t);
/** An antiderivative of the flow: F(t) = (A/k)·e^(kt). */
const antiderivative = (p: Params, t: number) => (p.A / p.k) * Math.exp(p.k * t);
const total = (p: Params) => round(antiderivative(p, p.t2) - antiderivative(p, p.t1), 2);

const UNIT = { investment: 'billion', revenue: 'thousand' } as const;

function flowFormula(p: Params): string {
  return `${num(p.A)}e^{${num(p.k)}t}`;
}

/** "from now (t = 0)" or "from year t1". */
const fromText = (p: Params) => (p.t1 === 0 ? 'now' : `year $${num(p.t1)}$`);

/** C113, difficulty 2: the total of a flow A·e^(kt) between two dates, (A/k)(e^(k·t₂) − e^(k·t₁)). */
export const accumulatedExponentialFlow: Generator<Params> = {
  id: 'accumulated-exponential-flow',
  title: 'Total of a growing or shrinking flow',
  topicId: 'C113',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    const t1 = rng.next() < 0.4 ? 0 : rng.int(1, 5);
    const t2 = t1 + rng.int(3, 10);
    if (rng.next() < 0.5) {
      return {
        setting: 'investment',
        A: rng.int(4, 60) * 5,
        k: rng.pick([0.02, 0.04, 0.05, 0.08, 0.1]),
        t1,
        t2,
      };
    }
    return {
      setting: 'revenue',
      A: rng.int(5, 80) * 10,
      k: rng.pick([0.04, 0.05, 0.08, 0.1, 0.2, -0.04, -0.05, -0.08, -0.1, -0.2]),
      t1,
      t2,
    };
  },

  stem(p) {
    const when = `between ${fromText(p)} and year $${num(p.t2)}$`;
    if (p.setting === 'investment') {
      return `A country's net investment is $I(t) = ${flowFormula(p)}$ ${UNIT.investment} per year, $t$ years from now. By how much does its capital stock rise ${when}? Give your answer to 2 decimal places.`;
    }
    const trend = p.k > 0 ? 'growing' : 'shrinking';
    return `Sales revenue from a ${trend} product line flows in at $R(t) = ${flowFormula(p)}$ ${UNIT.revenue} per year, $t$ years from now. What total revenue does it bring in ${when}? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: total(p), decimals: 2, ...TOL }),

  steps(p) {
    const name = p.setting === 'investment' ? 'I' : 'R';
    const ratio = p.A / p.k;
    return [
      {
        text: 'Write the total as a definite integral of the flow.',
        latex: `\\int_{${num(p.t1)}}^{${num(p.t2)}} ${flowFormula(p)}\\,dt`,
        why:
          p.setting === 'investment'
            ? 'Net investment is the rate at which the capital stock grows, so the change in the stock over the period is the integral of the flow.'
            : 'Revenue arrives at a changing rate per year; adding it up over the period means integrating the flow.',
      },
      {
        text: 'Find an antiderivative.',
        latex: `F(t) = \\dfrac{${num(p.A)}}{${num(p.k)}}e^{${num(p.k)}t} = ${num(ratio)}e^{${num(p.k)}t}`,
        why: 'Differentiating e^(kt) brings down a factor k, so an antiderivative of e^(kt) is e^(kt)/k.',
      },
      {
        text: 'Evaluate at the end of the period.',
        latex: `F(${num(p.t2)}) = ${num(ratio)}e^{${num(round(p.k * p.t2, 2))}} = ${num(round(antiderivative(p, p.t2), 2))}`,
        why: 'Put the later date into the antiderivative.',
        result: round(antiderivative(p, p.t2), 2),
      },
      {
        text: 'Evaluate at the start of the period.',
        latex: `F(${num(p.t1)}) = ${num(ratio)}e^{${num(round(p.k * p.t1, 2))}} = ${num(round(antiderivative(p, p.t1), 2))}`,
        why:
          p.t1 === 0
            ? 'e⁰ = 1, so F(0) is A/k, not 0: it must still be subtracted.'
            : 'The total counts only what flows in after the start date, so subtract the value there.',
        result: round(antiderivative(p, p.t1), 2),
      },
      {
        text: 'Subtract: end minus start.',
        latex: `F(${num(p.t2)}) - F(${num(p.t1)}) = ${num(total(p))}`,
        why: `F(t₂) − F(t₁) is the total. Compare it with ${name}(${num(p.t1)}) × ${num(p.t2 - p.t1)} = ${num(round(flow(p, p.t1) * (p.t2 - p.t1), 2))}, which would hold if the flow stayed at its starting level.`,
        result: total(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      total(p),
      [
        {
          value: round(p.A * (Math.exp(p.k * p.t2) - Math.exp(p.k * p.t1)), 2),
          mistakeCode: 'EXP_NO_DIVIDE_K',
        },
        { value: round(antiderivative(p, p.t2), 2), mistakeCode: 'ONLY_UPPER_LIMIT' },
        {
          value: round(flow(p, p.t1) * (p.t2 - p.t1), 2),
          mistakeCode: 'CONSTANT_FLOW',
        },
      ],
      TOL.tolerance,
      TOL.relTolerance,
    ),
};
