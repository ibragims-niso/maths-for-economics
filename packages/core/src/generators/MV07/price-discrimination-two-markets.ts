import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, term } from './two-goods';

interface Params {
  /** Inverse demands P₁ = alpha1 − beta1·Q₁ and P₂ = alpha2 − beta2·Q₂. */
  alpha1: number;
  beta1: number;
  alpha2: number;
  beta2: number;
  /** Cost C = F + m·Q + k·Q² of total output Q = Q₁ + Q₂, with k = k2/2. */
  fixedCost: number;
  m: number;
  k2: number;
  /** The best quantities, drawn first so the prices are whole. */
  q1: number;
  q2: number;
  /** The market whose price is asked for. */
  ask: 1 | 2;
}

const market = (p: Params) =>
  p.ask === 1
    ? { alpha: p.alpha1, beta: p.beta1, q: p.q1 }
    : { alpha: p.alpha2, beta: p.beta2, q: p.q2 };
/** Marginal cost at the optimum: m + 2kQ. */
const marginalCost = (p: Params) => p.m + p.k2 * (p.q1 + p.q2);
const price = (p: Params) => {
  const { alpha, beta, q } = market(p);
  return alpha - beta * q;
};

/** MV07, difficulty 3: the profit-maximising price in one of two markets with a shared, rising marginal cost. */
export const priceDiscriminationTwoMarkets: Generator<Params> = {
  id: 'price-discrimination-two-markets',
  title: 'Price discrimination: price in one market',
  topicId: 'MV07',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const q1 = rng.int(5, 40);
      const q2 = rng.int(5, 40);
      const beta1 = rng.int(1, 4);
      const beta2 = rng.int(1, 4);
      const m = rng.int(2, 30);
      const k2 = rng.int(1, 4);
      // Marginal revenue in each market equals the shared marginal cost at the optimum.
      const mc = m + k2 * (q1 + q2);
      const alpha1 = mc + 2 * beta1 * q1;
      const alpha2 = mc + 2 * beta2 * q2;
      // Different prices in the two markets, so discrimination matters.
      if (beta1 * q1 === beta2 * q2) continue;
      return {
        alpha1,
        beta1,
        alpha2,
        beta2,
        fixedCost: rng.int(2, 40) * 50,
        m,
        k2,
        q1,
        q2,
        ask: rng.pick([1, 2] as const),
      };
    }
  },

  stem: (p) =>
    `A firm sells the same product in two separate markets with inverse demands $P_1 = ${num(p.alpha1)} - ${term(p.beta1, 'Q_1')}$ and $P_2 = ${num(p.alpha2)} - ${term(p.beta2, 'Q_2')}$. Its cost is $C = ${num(p.fixedCost)} + ${num(p.m)}Q + ${term(p.k2 / 2, 'Q^2')}$, where $Q = Q_1 + Q_2$. Which price should it charge in market ${p.ask} to maximise profit?`,

  answer: (p) => ({ kind: 'numeric', value: price(p), decimals: 0, ...EXACT }),

  steps(p) {
    const A = 2 * p.beta1 + p.k2;
    const B = p.k2;
    const C = 2 * p.beta2 + p.k2;
    const det = A * C - B * B;
    const { alpha, beta, q } = market(p);
    return [
      {
        text: 'Write profit as revenue from both markets minus the cost of total output.',
        latex: `\\pi = (${num(p.alpha1)} - ${term(p.beta1, 'Q_1')})Q_1 + (${num(p.alpha2)} - ${term(p.beta2, 'Q_2')})Q_2 - ${num(p.fixedCost)} - ${num(p.m)}(Q_1 + Q_2) - ${term(p.k2 / 2, '(Q_1 + Q_2)^2')}`,
        why: 'The firm chooses two quantities; the cost depends on their sum because both are made in the same plant.',
      },
      {
        text: 'Set both partial derivatives to zero: marginal revenue in each market equals the shared marginal cost.',
        latex: `\\begin{aligned} ${num(p.alpha1)} - ${term(2 * p.beta1, 'Q_1')} - ${num(p.m)} - ${term(p.k2, '(Q_1 + Q_2)')} &= 0 \\\\ ${num(p.alpha2)} - ${term(2 * p.beta2, 'Q_2')} - ${num(p.m)} - ${term(p.k2, '(Q_1 + Q_2)')} &= 0 \\end{aligned}`,
        why: 'Selling one more unit in a market brings in its marginal revenue and adds to total output, so it costs the marginal cost m + 2kQ whichever market it goes to.',
      },
      {
        text: 'Collect terms and solve the linear system.',
        latex: `\\begin{aligned} ${term(A, 'Q_1')} + ${term(B, 'Q_2')} &= ${num(p.alpha1 - p.m)} \\\\ ${term(B, 'Q_1')} + ${term(C, 'Q_2')} &= ${num(p.alpha2 - p.m)} \\end{aligned} \\;\\Rightarrow\\; Q_1 = ${num(p.q1)},\\ Q_2 = ${num(p.q2)}`,
        why: `The determinant is ${num(A)} · ${num(C)} − ${num(B)}² = ${num(det)}, which is positive, and π₁₁ = −${num(A)} < 0: by the Hessian test this critical point is a maximum.`,
        result: q,
      },
      {
        text: `Put Q${p.ask === 1 ? '₁' : '₂'} into the demand of market ${p.ask}.`,
        latex: `P_${p.ask} = ${num(alpha)} - ${num(beta)} \\cdot ${num(q)} =${num(price(p))}`,
        why: `The price comes from the demand curve. It is above the marginal cost of ${num(marginalCost(p))}, as it must be for a firm with market power.`,
        result: price(p),
      },
    ];
  },

  distractors(p) {
    const { alpha, beta, q } = market(p);
    // Market treated alone: alpha − 2βQ = m + 2kQ with only this market's Q.
    const alone = (alpha - p.m) / (2 * beta + p.k2);
    return cleanDistractors(
      price(p),
      [
        { value: round(alpha - beta * alone, 2), mistakeCode: 'IGNORED_OTHER_MARKET' },
        { value: marginalCost(p), mistakeCode: 'PRICE_EQUALS_COST' },
        { value: q, mistakeCode: 'QUANTITY_NOT_PRICE' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
