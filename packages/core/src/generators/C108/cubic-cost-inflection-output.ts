import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  fixedCost: number;
  a: number;
  b: number;
  c: number;
  /** Drawn first so the inflection output b/(3c) is whole. */
  best: number;
}

const coef = (k: number) => (k === 1 ? '' : num(k));

/** C108, difficulty 2: output at the inflection point of C(Q) = F + aQ − bQ² + cQ³, where marginal cost is lowest. */
export const cubicCostInflectionOutput: Generator<Params> = {
  id: 'cubic-cost-inflection-output',
  title: 'Inflection point of a cost curve',
  topicId: 'C108',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const c = rng.pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1] as const);
      const best = rng.int(3, 40);
      const b = round(3 * c * best, 4);
      // a above b²/(3c) = 3c·best² keeps marginal cost positive at every output.
      const a = Math.ceil(round(3 * c * best * best, 4)) + rng.int(1, 40);
      if (b < 0.5 || a > 800) continue;
      return { fixedCost: rng.int(1, 40) * 50, a, b, c, best };
    }
  },

  stem: (p) =>
    `A firm's total cost is $C(Q) = ${num(p.fixedCost)} + ${num(p.a)}Q - ${coef(p.b)}Q^2 + ${coef(p.c)}Q^3$. At what output does the cost curve change from concave to convex, so that marginal cost stops falling and starts rising?`,

  answer: (p) => ({ kind: 'numeric', value: p.best, decimals: 2 }),

  steps: (p) => [
    {
      text: 'Differentiate once to get marginal cost.',
      latex: `MC = C'(Q) = ${num(p.a)} - ${num(2 * p.b)}Q + ${num(round(3 * p.c, 4))}Q^2`,
      why: 'Marginal cost is the slope of the total cost curve.',
    },
    {
      text: 'Differentiate again.',
      latex: `C''(Q) = -${num(2 * p.b)} + ${num(round(6 * p.c, 4))}Q`,
      why: 'C″ is the slope of marginal cost: negative while MC falls, positive while MC rises.',
    },
    {
      text: 'Set the second derivative to zero and solve.',
      latex: `${num(round(6 * p.c, 4))}Q = ${num(2 * p.b)} \\;\\Rightarrow\\; Q = \\dfrac{${num(2 * p.b)}}{${num(round(6 * p.c, 4))}} = ${num(p.best)}`,
      why: 'An inflection point can only be where C″ = 0. Here Q = 2b/(6c) = b/(3c).',
      result: p.best,
    },
    {
      text: 'Check that the sign changes.',
      latex: `C''(Q) < 0 \\text{ for } Q < ${num(p.best)}, \\quad C''(Q) > 0 \\text{ for } Q > ${num(p.best)}`,
      why: 'C″ is a rising straight line, so it is negative before its zero and positive after it: the curve is concave, then convex, and marginal cost is lowest at this output.',
    },
  ],

  distractors: (p) =>
    cleanDistractors(p.best, [
      { value: 2 * p.best, mistakeCode: 'POWER_ONCE' },
      { value: round(1.5 * p.best, 2), mistakeCode: 'AVC_MINIMUM' },
    ]),
};
