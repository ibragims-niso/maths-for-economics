import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Amounts to 2 decimals: a small absolute and relative slack for rounding along the way. */
const AMOUNT = { tolerance: 0.01, relTolerance: 0.001 } as const;

interface Params {
  /** Number of years the savings must last (2 or 3). */
  periods: 2 | 3;
  /** Discount factor. */
  beta: number;
  /** Savings in thousands. */
  wealth: number;
}

/** 1 + β + … + β^(n−1): the sum of the weights on each year's utility. */
const weightSum = (n: number, beta: number) =>
  Array.from({ length: n }, (_, t) => beta ** t).reduce((a, b) => a + b, 0);

const firstConsumption = (p: Params) => round(p.wealth / weightSum(p.periods, p.beta), 2);

const candidates = (p: Params) => [
  { value: round(p.wealth / p.periods, 2), mistakeCode: 'EQUAL_SPLIT' },
  {
    value: round((p.wealth * p.beta ** (p.periods - 1)) / weightSum(p.periods, p.beta), 2),
    mistakeCode: 'DISCOUNT_INVERTED',
  },
  { value: round(p.wealth * (1 - p.beta), 2), mistakeCode: 'INFINITE_HORIZON_RULE' },
  ...(p.periods === 3
    ? [{ value: round(p.wealth / (1 + p.beta), 2), mistakeCode: 'SHORT_HORIZON' }]
    : []),
];

/** DO03, difficulty 3: first-year consumption in a 2- or 3-year cake-eating problem with u = ln c. */
export const dpCakeEatingFirstConsumption: Generator<Params> = {
  id: 'dp-cake-eating-first-consumption',
  title: 'First-year consumption with log utility',
  topicId: 'DO03',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        periods: rng.pick([2, 3] as const),
        beta: rng.pick([0.5, 0.6, 0.75, 0.8, 0.9, 0.95]),
        wealth: rng.int(4, 60) * 5,
      };
      const kept = cleanDistractors(
        firstConsumption(p),
        candidates(p),
        AMOUNT.tolerance,
        AMOUNT.relTolerance,
      );
      if (kept.length >= 3) return p;
    }
  },

  stem(p) {
    const b = num(p.beta);
    const years = p.periods === 3 ? '0, 1 and 2' : '0 and 1';
    const objective =
      p.periods === 3 ? `\\ln c_0 + ${b}\\ln c_1 + ${b}^2\\ln c_2` : `\\ln c_0 + ${b}\\ln c_1`;
    const budget = p.periods === 3 ? 'c_0 + c_1 + c_2' : 'c_0 + c_1';
    return `A retired couple has savings of ${num(p.wealth)} (thousand) to spend over years ${years}; the savings earn no interest. They choose consumption to maximise $${objective}$ subject to $${budget} = ${num(p.wealth)}$. How much should they consume in year 0? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: firstConsumption(p), decimals: 2, ...AMOUNT }),

  steps(p) {
    const b = num(p.beta);
    const S = weightSum(p.periods, p.beta);
    const c0 = firstConsumption(p);
    const last = p.periods - 1;
    const steps: Step[] = [
      {
        text: `Start at the last year: whatever is left is eaten.`,
        latex: `c_${last} = x_${last},\\quad V_${last}(x) = \\ln x`,
        why: 'Nothing is valued after the last year, so saving anything would waste it. V_t(x) is the best total utility from year t on when x is left.',
      },
    ];
    if (p.periods === 3) {
      steps.push({
        text: 'Year 1: split what is left, x, between eating now and the last year.',
        latex: `V_1(x) = \\max_c\\{\\ln c + ${b}\\ln(x - c)\\}:\\; \\dfrac{1}{c} = \\dfrac{${b}}{x - c} \\Rightarrow c = \\dfrac{x}{1 + ${b}},\\; V_1(x) = ${num(1 + p.beta, 4)}\\ln x + \\text{const}`,
        why: 'Setting the derivative to zero equates the utility gained from one more unit now, 1/c, with the discounted utility lost next year. Substituting the best c back gives a value that is (1 + β) times ln x plus a constant.',
      });
    }
    const weight = p.periods === 3 ? num(p.beta * (1 + p.beta), 4) : b;
    steps.push(
      {
        text: 'Year 0: the Bellman equation with the value of what is saved.',
        latex: `V_0(W) = \\max_{c_0}\\{\\ln c_0 + ${weight}\\ln(W - c_0)\\} + \\text{const}:\\; \\dfrac{1}{c_0} = \\dfrac{${weight}}{W - c_0} \\Rightarrow c_0 = \\dfrac{W}{${num(S, 4)}}`,
        why: `What is not eaten now is worth ${p.periods === 3 ? 'β·V₁' : 'β·V₁ = β ln'}(W − c₀), so the weight on ln(W − c₀) is ${p.periods === 3 ? 'β(1 + β)' : 'β'}; the first-order condition then gives c₀ = W/(1 + β${p.periods === 3 ? ' + β²' : ''}).`,
      },
      {
        text: 'Put in the numbers.',
        latex: `c_0 = \\dfrac{${num(p.wealth)}}{${num(S, 4)}} = ${num(c0)}`,
        why: 'Each year gets a share of the savings in proportion to its weight 1, β, β², …, so the first year gets 1/(1 + β + …) of the total.',
        result: c0,
      },
    );
    return steps;
  },

  distractors: (p) =>
    cleanDistractors(firstConsumption(p), candidates(p), AMOUNT.tolerance, AMOUNT.relTolerance),
};
