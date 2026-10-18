import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Q = A · L^alpha · K^beta, exponents in tenths, alpha ≠ beta. */
  A: number;
  alpha: number;
  beta: number;
  L: number;
  K: number;
}

/** MRTS = −dK/dL = (alpha·K)/(beta·L), from differentiating A·L^alpha·K^beta = Q̄ with K = K(L). */
const mrts = (p: Params) => round((p.alpha * p.K) / (p.beta * p.L), 2);

function candidates(p: Params) {
  return [
    { value: -mrts(p), mistakeCode: 'SLOPE_NOT_RATE' },
    { value: round((p.beta * p.L) / (p.alpha * p.K), 2), mistakeCode: 'INVERTED_RATIO' },
    { value: round(p.K / p.L, 2), mistakeCode: 'FORGOT_EXPONENTS' },
    { value: round((p.beta * p.K) / (p.alpha * p.L), 2), mistakeCode: 'SWAPPED_EXPONENTS' },
  ];
}

/** C110, difficulty 2: the MRTS −dK/dL along an isoquant of Q = A·L^α·K^β at an input bundle. */
export const isoquantMrts: Generator<Params> = {
  id: 'isoquant-mrts',
  title: 'Marginal rate of technical substitution',
  topicId: 'C110',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const alpha = rng.int(2, 8) / 10;
      const beta = rng.int(2, 8) / 10;
      if (alpha === beta) continue;
      const p: Params = { A: rng.int(2, 20), alpha, beta, L: rng.int(4, 80), K: rng.int(4, 80) };
      const m = mrts(p);
      if (m < 0.2 || m > 15) continue;
      if (cleanDistractors(m, candidates(p)).length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm makes $Q = ${p.A}\\,L^{${num(p.alpha)}}K^{${num(p.beta)}}$ units of output with $L$ workers and $K$ machines. It uses $L = ${p.L}$ and $K = ${p.K}$. Along the isoquant through this bundle, with $K$ on the vertical axis, find the marginal rate of technical substitution $MRTS = -\\dfrac{dK}{dL}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: mrts(p), decimals: 2 }),

  steps(p) {
    const m = mrts(p);
    const a = num(p.alpha);
    const b = num(p.beta);
    return [
      {
        text: 'Write the isoquant with K as an unknown function of L.',
        latex: `${p.A}\\,L^{${a}}K^{${b}} = \\bar Q, \\quad K = K(L)`,
        why: 'An isoquant joins all the input bundles that give the same output, so K must change with L in the way that keeps output fixed.',
      },
      {
        text: 'Differentiate both sides with respect to L.',
        latex: `${p.A}\\left(${a}\\,L^{${num(p.alpha - 1)}}K^{${b}} + ${b}\\,L^{${a}}K^{${num(p.beta - 1)}}\\,\\dfrac{dK}{dL}\\right) = 0`,
        why: 'Product rule on L^α times K^β; K depends on L, so the chain rule adds dK/dL. Output is constant along the isoquant, so the right-hand side gives 0.',
      },
      {
        text: 'Solve for dK/dL.',
        latex: `\\dfrac{dK}{dL} = -\\dfrac{${a}\\,L^{${num(p.alpha - 1)}}K^{${b}}}{${b}\\,L^{${a}}K^{${num(p.beta - 1)}}} = -\\dfrac{${a}\\,K}{${b}\\,L}`,
        why: `The constant ${p.A} multiplies both terms, so it cancels. The powers simplify to K over L.`,
      },
      {
        text: `Evaluate at L = ${p.L}, K = ${p.K}.`,
        latex: `\\dfrac{dK}{dL} = -\\dfrac{${a} \\cdot ${p.K}}{${b} \\cdot ${p.L}} = ${num(-m)}`,
        why: 'This is the slope of the isoquant at the bundle. It is negative: more workers with the same output means fewer machines.',
        result: -m,
      },
      {
        text: 'Change the sign to get the MRTS.',
        latex: `MRTS = -\\dfrac{dK}{dL} = ${num(m)}`,
        why: `The MRTS is the slope without its minus sign: one more worker can replace about ${num(m)} machines with output unchanged.`,
        result: m,
      },
    ];
  },

  distractors: (p) => cleanDistractors(mrts(p), candidates(p)),
};
