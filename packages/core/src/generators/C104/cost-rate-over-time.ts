import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Weekly output Q(t) = m + rt (steady growth) or Q(t) = m + rt² (accelerating growth). */
  form: 'linear' | 'quadratic';
  m: number;
  r: number;
  /** The week at which the rate is asked. */
  t0: number;
  fixedCost: number;
  unitCost: number;
  /** Twice the coefficient of Q²: C(Q) = F + cQ + (h/2)Q², so C′(Q) = c + hQ is whole. */
  h: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const outputAt = (p: Params, t: number) =>
  p.form === 'linear' ? p.m + p.r * t : p.m + p.r * t * t;
/** Q′(t): r, or 2rt. */
const outputRate = (p: Params, t: number) => (p.form === 'linear' ? p.r : 2 * p.r * t);
const costOf = (p: Params, q: number) => p.fixedCost + p.unitCost * q + (p.h / 2) * q * q;
/** C′(Q) = c + hQ. */
const marginalCost = (p: Params, q: number) => p.unitCost + p.h * q;
const answerOf = (p: Params) => marginalCost(p, outputAt(p, p.t0)) * outputRate(p, p.t0);

const outputTex = (p: Params) => {
  const coef = p.r === 1 ? '' : num(p.r);
  return p.form === 'linear' ? `${num(p.m)} + ${coef}t` : `${num(p.m)} + ${coef}t^2`;
};
const costTex = (p: Params) =>
  `${num(p.fixedCost)} + ${num(p.unitCost)}Q + ${p.h === 2 ? '' : num(p.h / 2)}Q^2`;

/** C104, difficulty 2: dC/dt = C′(Q(t))·Q′(t), how fast cost rises while output grows. */
export const costRateOverTime: Generator<Params> = {
  id: 'cost-rate-over-time',
  title: 'Rate of change of cost over time',
  topicId: 'C104',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    const m = rng.int(2, 20) * 5;
    const fixedCost = rng.int(5, 100) * 10;
    const unitCost = rng.int(2, 20);
    const h = rng.int(1, 4);
    if (rng.next() < 0.5) {
      return { form: 'linear', m, r: rng.int(2, 10), t0: rng.int(1, 10), fixedCost, unitCost, h };
    }
    return { form: 'quadratic', m, r: rng.int(1, 4), t0: rng.int(1, 6), fixedCost, unitCost, h };
  },

  stem: (p) =>
    `A factory produces $Q(t) = ${outputTex(p)}$ units a week, $t$ weeks after it opens. Producing $Q$ units a week costs $C(Q) = ${costTex(p)}$ a week. How fast is the weekly cost rising at $t = ${num(p.t0)}$? Find $\\dfrac{dC}{dt}$ at $t = ${num(p.t0)}$.`,

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2, ...MONEY }),

  steps(p) {
    const q = outputAt(p, p.t0);
    const mc = marginalCost(p, q);
    const rate = outputRate(p, p.t0);
    const rateTex =
      p.form === 'linear'
        ? `Q'(t) = ${num(p.r)}`
        : `Q'(t) = ${num(2 * p.r)}t \\;\\Rightarrow\\; Q'(${num(p.t0)}) = ${num(rate)}`;
    return [
      {
        text: 'Write the chain rule for cost through output.',
        latex: `\\dfrac{dC}{dt} = \\dfrac{dC}{dQ} \\cdot \\dfrac{dQ}{dt} = C'(Q(t)) \\cdot Q'(t)`,
        why: 'Time changes output, and output changes cost, so the two rates multiply.',
      },
      {
        text: 'Find output and its rate of growth at the given time.',
        latex: `Q(${num(p.t0)}) = ${num(q)}, \\quad ${rateTex}`,
        why: 'Marginal cost has to be evaluated at the output actually produced at that time.',
        result: q,
      },
      {
        text: 'Find marginal cost at that output.',
        latex: `C'(Q) = ${num(p.unitCost)} + ${p.h === 1 ? '' : num(p.h)}Q \\;\\Rightarrow\\; C'(${num(q)}) = ${num(mc)}`,
        why: 'Differentiate the cost function term by term with the power rule; the fixed cost has derivative 0.',
        result: mc,
      },
      {
        text: 'Multiply the two rates.',
        latex: `\\dfrac{dC}{dt} = ${num(mc)} \\cdot ${num(rate)} = ${num(answerOf(p))}`,
        why: 'Each extra unit adds C′(Q) to cost, and Q′(t) extra units arrive per week, so cost rises by their product per week.',
        result: answerOf(p),
      },
    ];
  },

  distractors(p) {
    const q = outputAt(p, p.t0);
    const rate = outputRate(p, p.t0);
    return cleanDistractors(
      answerOf(p),
      [
        { value: marginalCost(p, q), mistakeCode: 'FORGOT_INNER' },
        { value: rate, mistakeCode: 'INSIDE_ONLY' },
        { value: marginalCost(p, p.t0) * rate, mistakeCode: 'WRONG_POINT' },
        { value: round(costOf(p, q) * rate, 2), mistakeCode: 'OUTER_NOT_DIFFERENTIATED' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
