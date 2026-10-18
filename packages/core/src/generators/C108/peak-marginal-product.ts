import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  a: number;
  b: number;
  /** Drawn first: the inflection L* = a/(3b), where diminishing returns set in. */
  onset: number;
}

const coef = (k: number) => (k === 1 ? '' : num(k));

/** Q(L*) = aL*² − bL*³, which equals 2b·L*³. */
const output = (p: Params) => round(p.a * p.onset ** 2 - p.b * p.onset ** 3, 4);
/** MP(L*) = 2aL* − 3bL*², which equals 3b·L*². */
const peak = (p: Params) => round(2 * p.a * p.onset - 3 * p.b * p.onset ** 2, 4);

/** C108, difficulty 3: the highest marginal product of an S-shaped production function Q = aL² − bL³, at its inflection point. */
export const peakMarginalProduct: Generator<Params> = {
  id: 'peak-marginal-product',
  title: 'Where diminishing returns set in',
  topicId: 'C108',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const b = rng.pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1] as const);
      const onset = rng.int(4, 30);
      const a = round(3 * b * onset, 4);
      if (a < 0.5 || 3 * b * onset * onset > 2000) continue;
      return { a, b, onset };
    }
  },

  stem: (p) =>
    `A workshop's output with $L$ workers is $Q(L) = ${coef(p.a)}L^2 - ${coef(p.b)}L^3$ for $0 \\le L \\le ${num(2 * p.onset)}$. The marginal product of labour first rises and then falls once diminishing marginal returns set in. What is the highest marginal product of labour?`,

  answer: (p) => ({ kind: 'numeric', value: peak(p), decimals: 2 }),

  steps: (p) => [
    {
      text: 'Differentiate to get the marginal product of labour.',
      latex: `MP_L = Q'(L) = ${num(round(2 * p.a, 4))}L - ${num(round(3 * p.b, 4))}L^2`,
      why: 'The marginal product is the extra output from one more worker, the slope of the production function.',
    },
    {
      text: 'Differentiate again and set the result to zero.',
      latex: `Q''(L) = ${num(round(2 * p.a, 4))} - ${num(round(6 * p.b, 4))}L = 0 \\;\\Rightarrow\\; L^* = ${num(p.onset)}`,
      why: 'Q″ is the slope of the marginal product. It is positive (convex part, rising MP) before L* and negative (concave part, falling MP) after it, so MP peaks at the inflection point.',
      result: p.onset,
    },
    {
      text: 'Evaluate the marginal product there.',
      latex: `MP_L(${num(p.onset)}) = ${num(round(2 * p.a, 4))} \\cdot ${num(p.onset)} - ${num(round(3 * p.b, 4))} \\cdot ${num(p.onset)}^2 = ${num(peak(p))}`,
      why: 'The question asks for the marginal product, so put L* into Q′(L), not into Q(L).',
      result: peak(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(peak(p), [
      { value: p.onset, mistakeCode: 'LABOUR_NOT_MP' },
      { value: output(p), mistakeCode: 'OUTPUT_NOT_MP' },
      { value: round(output(p) / p.onset, 2), mistakeCode: 'AVERAGE_NOT_MARGINAL' },
    ]),
};
