import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Term i is a + b·i. */
  a: number;
  b: number;
  /** Lower and upper limits of the sum (inclusive). */
  from: number;
  to: number;
  context: 'sales' | 'output';
}

/** Counts are exact: no tolerance beyond input noise. */
const COUNT = { tolerance: 0.01, relTolerance: 0 } as const;

const terms = (p: Params) => p.to - p.from + 1;
/** 1 + 2 + … + n. */
const upTo = (n: number) => (n * (n + 1)) / 2;
const indexSum = (p: Params) => upTo(p.to) - upTo(p.from - 1);
const total = (p: Params) => terms(p) * p.a + p.b * indexSum(p);

const sigma = (p: Params) => `\\sum_{i=${p.from}}^{${p.to}} (${num(p.a)} + ${num(p.b)}i)`;

/** F09, difficulty 2: evaluate Σ_{i=m}^{n} (a + b·i) with linearity and 1 + 2 + … + n = n(n + 1)/2. */
export const sigmaLinearSum: Generator<Params> = {
  id: 'sigma-linear-sum',
  title: 'Adding up with Σ notation',
  topicId: 'F09',
  difficulty: 2,
  timeSec: 150,

  params: (rng) => {
    const from = rng.int(2, 7);
    return {
      a: rng.int(2, 60) * 5,
      b: rng.int(2, 30),
      from,
      to: rng.int(from + 3, 24),
      context: rng.pick(['sales', 'output'] as const),
    };
  },

  stem: (p) =>
    p.context === 'sales'
      ? `In month $i$ after its launch, a shop sells $${num(p.a)} + ${num(p.b)}i$ units of a new product. How many units does it sell from month $${p.from}$ to month $${p.to}$ inclusive, that is, what is $${sigma(p)}$?`
      : `A new factory produces $${num(p.a)} + ${num(p.b)}i$ units in week $i$. What is its total output from week $${p.from}$ to week $${p.to}$ inclusive, that is, what is $${sigma(p)}$?`,

  answer: (p) => ({ kind: 'numeric', value: total(p), decimals: 0, ...COUNT }),

  steps: (p) => [
    {
      text: 'Count the terms.',
      latex: `${p.to} - ${p.from} + 1 = ${terms(p)}`,
      why: 'From i = m to i = n inclusive there are n − m + 1 values of i; n − m alone leaves out one end.',
      result: terms(p),
    },
    {
      text: 'Split the sum into a constant part and an index part.',
      latex: `${sigma(p)} = \\sum_{i=${p.from}}^{${p.to}} ${num(p.a)} + ${num(p.b)}\\sum_{i=${p.from}}^{${p.to}} i`,
      why: 'Σ is linear: a sum of two parts can be added up part by part, and a constant factor moves outside the sum.',
    },
    {
      text: 'Add up the constant part.',
      latex: `\\sum_{i=${p.from}}^{${p.to}} ${num(p.a)} = ${terms(p)} \\cdot ${num(p.a)} = ${num(terms(p) * p.a)}`,
      why: 'The constant appears once in every term, so it is added as many times as there are terms.',
      result: terms(p) * p.a,
    },
    {
      text: 'Add up the index from the lower to the upper limit.',
      latex: `\\sum_{i=${p.from}}^{${p.to}} i = \\dfrac{${p.to} \\cdot ${p.to + 1}}{2} - \\dfrac{${p.from - 1} \\cdot ${p.from}}{2} = ${num(upTo(p.to))} - ${num(upTo(p.from - 1))} = ${num(indexSum(p))}`,
      why: 'Use 1 + 2 + … + n = n(n + 1)/2 for the sum up to the upper limit, then remove the terms below the lower limit.',
      result: indexSum(p),
    },
    {
      text: 'Combine the two parts.',
      latex: `${num(terms(p) * p.a)} + ${num(p.b)} \\cdot ${num(indexSum(p))} = ${num(total(p))}`,
      why: 'The index sum is multiplied by its coefficient and then added to the constant part.',
      result: total(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      total(p),
      [
        { value: p.a + p.b * indexSum(p), mistakeCode: 'CONSTANT_ONCE' },
        { value: total(p) - (p.a + p.b * p.from), mistakeCode: 'OFF_BY_ONE' },
        { value: p.to * p.a + p.b * upTo(p.to), mistakeCode: 'IGNORED_LOWER_LIMIT' },
      ],
      COUNT.tolerance,
      COUNT.relTolerance,
    ),
};
