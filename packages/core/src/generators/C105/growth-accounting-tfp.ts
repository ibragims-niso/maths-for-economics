import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Capital's exponent α; labour's is 1 − α. */
  alpha: number;
  /** Growth rates of output, capital and labour, in per cent a year. */
  gY: number;
  gK: number;
  gL: number;
}

const tfp = (p: Params) => round(p.gY - p.alpha * p.gK - (1 - p.alpha) * p.gL, 2);

/** Wrong answers from the usual growth-accounting mistakes. */
function wrongAnswers(p: Params) {
  return cleanDistractors(tfp(p), [
    { value: round(p.gY - p.gK - p.gL, 2), mistakeCode: 'FORGOT_EXPONENTS' },
    {
      value: round(p.gY - (1 - p.alpha) * p.gK - p.alpha * p.gL, 2),
      mistakeCode: 'SWAPPED_SHARES',
    },
    {
      value: round(p.gY + p.alpha * p.gK + (1 - p.alpha) * p.gL, 2),
      mistakeCode: 'SWAPPED_OPERATION',
    },
  ]);
}

/** C105, difficulty 3: TFP growth from Y = A·K^α·L^(1−α), g_A = g_Y − α·g_K − (1 − α)·g_L. */
export const growthAccountingTfp: Generator<Params> = {
  id: 'growth-accounting-tfp',
  title: 'Growth accounting: productivity growth',
  topicId: 'C105',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p = {
        alpha: rng.pick([0.25, 0.3, 0.35, 0.4] as const),
        gY: rng.int(10, 80) / 10,
        gK: rng.int(5, 100) / 10,
        gL: rng.int(0, 30) / 10,
      };
      const gA = tfp(p);
      if (gA >= 0.2 && gA <= 4 && wrongAnswers(p).length >= 2) return p;
    }
  },

  stem: (p) =>
    `A country's output follows $Y = A K^{${num(p.alpha)}} L^{${num(1 - p.alpha)}}$. Over a year, output grows at $${num(p.gY, 1)}\\%$, the capital stock at $${num(p.gK, 1)}\\%$ and employment at $${num(p.gL, 1)}\\%$ (instantaneous rates). How fast did total factor productivity $A$ grow? Give the answer in per cent a year to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: tfp(p), decimals: 2 }),

  steps(p) {
    const a = num(p.alpha);
    const b = num(1 - p.alpha);
    const capital = p.alpha * p.gK;
    const labour = (1 - p.alpha) * p.gL;
    return [
      {
        text: 'Take logs of the production function.',
        latex: `\\ln Y = \\ln A + ${a}\\ln K + ${b}\\ln L`,
        why: 'Logs turn the product into a sum and bring the exponents down in front.',
      },
      {
        text: 'Differentiate with respect to time.',
        latex: `g_Y = g_A + ${a}\\,g_K + ${b}\\,g_L`,
        why: 'By the chain rule the time derivative of ln X is Ẋ/X, the growth rate of X.',
      },
      {
        text: 'Work out the contributions of capital and labour.',
        latex: `${a} \\times ${num(p.gK, 1)} = ${num(capital, 3)}, \\quad ${b} \\times ${num(p.gL, 1)} = ${num(labour, 3)}, \\quad \\text{together } ${num(capital + labour, 3)}`,
        why: 'Each input adds its growth rate times its exponent to output growth, in percentage points.',
        result: round(capital + labour, 3),
      },
      {
        text: 'Subtract them from output growth.',
        latex: `g_A = ${num(p.gY, 1)} - ${num(capital, 3)} - ${num(labour, 3)} = ${num(tfp(p))}\\%`,
        why: 'TFP growth is the residual: the part of output growth that more capital and more labour do not explain.',
        result: tfp(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
