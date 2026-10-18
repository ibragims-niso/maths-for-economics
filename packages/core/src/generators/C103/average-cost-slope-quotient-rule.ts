import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  fixedCost: number;
  /** C(Q) = F + cQ + dQ². */
  c: number;
  d: number;
  q: number;
}

const coef = (x: number) => (x === 1 ? '' : num(x));

/** u = C(Q) and u′ = C′(Q) at the chosen output. */
const top = (p: Params) => p.fixedCost + p.c * p.q + p.d * p.q ** 2;
const topSlope = (p: Params) => p.c + 2 * p.d * p.q;
/** AC′(Q) = (u′v − uv′)/v² with v = Q, which simplifies to d − F/Q². */
const slope = (p: Params) => round((topSlope(p) * p.q - top(p)) / p.q ** 2, 2);

function candidates(p: Params) {
  const u = top(p);
  const du = topSlope(p);
  return [
    { value: round((du * p.q + u) / p.q ** 2, 2), mistakeCode: 'QUOTIENT_SIGN' },
    { value: -slope(p), mistakeCode: 'QUOTIENT_ORDER' },
    { value: du * p.q - u, mistakeCode: 'NUMERATOR_ONLY' },
    { value: du, mistakeCode: 'QUOTIENT_OF_DERIVATIVES' },
  ];
}

/** C103, difficulty 3: the slope of average cost AC(Q) = C(Q)/Q at Q₀, with the quotient rule. */
export const averageCostSlopeQuotientRule: Generator<Params> = {
  id: 'average-cost-slope-quotient-rule',
  title: 'Slope of average cost with the quotient rule',
  topicId: 'C103',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const q = rng.int(4, 40);
      const d = rng.int(1, 6);
      // The answer is d − F/Q². Draw F/Q² = m/4 (quarters, so the answer is exact), between
      // d/5 and 5d, and half the time above d (average cost falling), half the time below.
      const falling = rng.next() < 0.5;
      const m = falling ? rng.int(4 * d + 1, 20 * d) : rng.int(Math.ceil(0.8 * d), 4 * d - 1);
      const fixedCost = (m * q * q) / 4;
      if (!Number.isInteger(fixedCost) || fixedCost < 100 || fixedCost > 20000) continue;
      const p: Params = { fixedCost, c: rng.int(2, 40), d, q };
      if (cleanDistractors(slope(p), candidates(p)).length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm's total cost is $C(Q) = ${num(p.fixedCost)} + ${num(p.c)}Q + ${coef(p.d)}Q^2$. Use the quotient rule to find the derivative of average cost $AC(Q) = \\dfrac{C(Q)}{Q}$ at $Q = ${p.q}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: slope(p), decimals: 2 }),

  steps(p) {
    const u = top(p);
    const du = topSlope(p);
    const ans = slope(p);
    return [
      {
        text: 'Name the top and the bottom of the fraction and differentiate each.',
        latex: `u = ${num(p.fixedCost)} + ${num(p.c)}Q + ${coef(p.d)}Q^2,\\; u' = ${num(p.c)} + ${num(2 * p.d)}Q; \\quad v = Q,\\; v' = 1`,
        why: 'The quotient rule needs both functions and both derivatives. The derivative of the top, u′ = C′(Q), is marginal cost.',
      },
      {
        text: `Evaluate them at Q = ${p.q}.`,
        latex: `u = ${num(u)}, \\quad u' = ${num(du)}, \\quad v = ${p.q}, \\quad v' = 1`,
        why: 'Putting the numbers in before combining keeps the arithmetic short.',
        result: du,
      },
      {
        text: 'Apply the quotient rule.',
        latex: `AC'(${p.q}) = \\dfrac{u'v - uv'}{v^2} = \\dfrac{${num(du)} \\cdot ${p.q} - ${num(u)}}{${p.q}^2} = \\dfrac{${num(du * p.q - u)}}{${num(p.q ** 2)}} = ${num(ans)}`,
        why: 'The quotient rule is (u/v)′ = (u′v − uv′)/v²: derivative of the top times the bottom, minus the top times the derivative of the bottom, all over the bottom squared.',
        result: ans,
      },
      {
        text: 'Read the sign.',
        latex:
          ans < 0
            ? `AC'(${p.q}) < 0: \\text{average cost is falling}`
            : `AC'(${p.q}) > 0: \\text{average cost is rising}`,
        why:
          ans < 0
            ? 'The numerator u′v − uv′ = Q(MC − AC) is negative: the next unit costs less than the current average, so it pulls the average down.'
            : 'The numerator u′v − uv′ = Q(MC − AC) is positive: the next unit costs more than the current average, so it pulls the average up.',
      },
    ];
  },

  distractors: (p) => cleanDistractors(slope(p), candidates(p)),
};
