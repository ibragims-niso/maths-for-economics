import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT } from '../MV08/budget';

interface Params {
  /** Cost C(q) = F + c·q². */
  F: number;
  c: number;
  /** The output price, p = 2c·q*, so the best output is whole. */
  p: number;
  /** The best output q* = p/(2c). */
  q: number;
}

/** The slope of maximum profit, d(π*)/dp = q* (Hotelling's lemma). */
const slope = (p: Params) => p.q;
/** Maximum profit π*(p) = p·q* − F − c·q*² = c·q*² − F. */
const maxProfit = (p: Params) => p.p * p.q - p.F - p.c * p.q * p.q;

const C_VALUES = [1, 1.5, 2, 2.5, 3, 4, 5] as const;

function candidates(p: Params) {
  return [
    { value: round(maxProfit(p), 2), mistakeCode: 'GAVE_MAX_PROFIT' },
    { value: round(1 / (2 * p.c), 3), mistakeCode: 'SLOPE_OF_OUTPUT' },
    { value: p.p, mistakeCode: 'PRICE_AS_ANSWER' },
  ];
}

/** MV12, difficulty 1: d(π*)/dp for a competitive firm with cost F + cq², which is q* (Hotelling's lemma). */
export const hotellingProfitPriceSlope: Generator<Params> = {
  id: 'hotelling-profit-price-slope',
  title: 'Maximum profit and the price',
  topicId: 'MV12',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const c = rng.pick(C_VALUES);
      const q = rng.int(4, 40);
      const p = Math.round(2 * c * q);
      if (p > 300) continue;
      // A fixed cost that leaves a positive maximum profit.
      const top = Math.floor((0.9 * c * q * q) / 10);
      if (top < 1) continue;
      const F = 10 * rng.int(1, top);
      const params: Params = { F, c, p, q };
      if (maxProfit(params) <= 0) continue;
      const kept = cleanDistractors(
        slope(params),
        candidates(params),
        EXACT.tolerance,
        EXACT.relTolerance,
      );
      if (kept.length < 3) continue;
      return params;
    }
  },

  stem: (p) =>
    `A competitive firm sells its output at the price $p$ and has cost $C(q) = ${num(p.F)} + ${p.c === 1 ? '' : num(p.c)}q^2$. Its maximum profit is $\\pi^*(p) = \\max_q\\,[pq - C(q)]$. Use the envelope theorem to find $d\\pi^*/dp$ at $p = ${num(p.p)}$, the rate at which maximum profit rises with the price.`,

  answer: (p) => ({ kind: 'numeric', value: slope(p), decimals: 2, ...EXACT }),

  steps(p) {
    const cq = p.c === 1 ? '' : num(p.c);
    return [
      {
        text: 'Write profit as a function of output and price, and find the best output.',
        latex: `\\pi(q, p) = pq - ${num(p.F)} - ${cq}q^2, \\quad \\dfrac{\\partial \\pi}{\\partial q} = p - ${num(2 * p.c)}q = 0 \\;\\Rightarrow\\; q^* = \\dfrac{${num(p.p)}}{${num(2 * p.c)}} = ${num(p.q)}`,
        why: `The firm produces where price equals marginal cost, ${num(2 * p.c)}q.`,
        result: p.q,
      },
      {
        text: 'Apply the envelope theorem: differentiate profit with respect to p, holding q at q*.',
        latex: `\\dfrac{d\\pi^*}{dp} = \\dfrac{\\partial \\pi}{\\partial p}\\bigg|_{q = q^*} = q^* = ${num(p.q)}`,
        why: 'Output also changes when the price changes, but ∂π/∂q = 0 at the best output, so that indirect effect vanishes. A price rise of 1 earns 1 more on each unit sold (Hotelling’s lemma).',
        result: slope(p),
      },
      {
        text: 'Check by differentiating the value function directly.',
        latex: `\\pi^*(p) = \\dfrac{p^2}{${num(4 * p.c)}} - ${num(p.F)}, \\quad \\pi^{*\\prime}(${num(p.p)}) = \\dfrac{${num(p.p)}}{${num(2 * p.c)}} = ${num(p.q)}`,
        why: `Substituting q* = p/${num(2 * p.c)} into profit gives π*(p); its slope is the same number, and π* itself (${num(maxProfit(p))} here) is not the answer.`,
        result: slope(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(slope(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
