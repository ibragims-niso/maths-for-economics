import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Scale of the output rate a·ln(1 + t), in thousand units per year. */
  a: number;
  years: number;
}

/** ∫₀ᵀ a·ln(1 + t) dt = a[(1 + T)ln(1 + T) − T]. */
const totalOutput = (p: Params) => {
  const w = 1 + p.years;
  return p.a * (w * Math.log(w) - p.years);
};

/** C115, difficulty 3: total output when the output rate is a·ln(1 + t), by substitution and parts. */
export const totalOutputLogRate: Generator<Params> = {
  id: 'total-output-log-rate',
  title: 'Total output from a logarithmic output rate',
  topicId: 'C115',
  difficulty: 3,
  timeSec: 180,

  params: (rng) => ({ a: rng.int(2, 40) * 5, years: rng.int(2, 19) }),

  stem: (p) =>
    `As its workers gain experience, a new plant produces at the rate $q(t) = ${num(p.a)}\\ln(1 + t)$ thousand units per year, $t$ years after it opens. Find its total output over the first $${num(p.years)}$ years, $\\int_0^{${num(p.years)}} ${num(p.a)}\\ln(1 + t)\\,dt$, in thousand units. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(totalOutput(p), 2), decimals: 2 }),

  steps(p) {
    const w = 1 + p.years;
    return [
      {
        text: 'Substitute w = 1 + t and change the limits.',
        latex: `w = 1 + t,\\; dw = dt:\\quad \\int_0^{${num(p.years)}} ${num(p.a)}\\ln(1 + t)\\,dt = ${num(p.a)}\\int_1^{${num(w)}} \\ln w\\,dw`,
        why: 'The inside 1 + t has derivative 1, so dw = dt; the limits t = 0 and t = T become w = 1 and w = 1 + T.',
      },
      {
        text: 'Integrate ln w by parts with u = ln w, dv = dw.',
        latex: `\\int \\ln w\\,dw = w\\ln w - \\int w\\cdot\\frac{1}{w}\\,dw = w\\ln w - w`,
        why: 'ln w has no simple antiderivative of its own, but its derivative 1/w is simple. With v = w the new integral is just ∫1 dw.',
      },
      {
        text: 'Evaluate between w = 1 and w = 1 + T.',
        latex: `${num(p.a)}\\Big[w\\ln w - w\\Big]_1^{${num(w)}} = ${num(p.a)}\\big(${num(w)}\\ln ${num(w)} - ${num(w)} + 1\\big) = ${num(p.a)} \\times ${num(totalOutput(p) / p.a, 5)}`,
        why: 'At w = 1, ln 1 = 0, so the lower limit contributes 0 − 1 = −1, which is subtracted.',
        result: round(totalOutput(p) / p.a, 5),
      },
      {
        text: 'Multiply out.',
        latex: `\\text{Total output} = ${num(p.a)} \\times ${num(totalOutput(p) / p.a, 5)} = ${num(round(totalOutput(p), 2))}`,
        why: 'This is the area under the output-rate curve between t = 0 and t = T, in thousand units.',
        result: round(totalOutput(p), 2),
      },
    ];
  },

  distractors(p) {
    const w = 1 + p.years;
    const T = p.years;
    return cleanDistractors(round(totalOutput(p), 2), [
      { value: round(p.a * w * Math.log(w), 2), mistakeCode: 'DROPPED_INTEGRAL_TERM' },
      { value: round(p.a * (w * Math.log(w) + T), 2), mistakeCode: 'PARTS_SIGN' },
      { value: round(p.a * (w * Math.log(w) - w), 2), mistakeCode: 'LOWER_LIMIT_DROPPED' },
    ]);
  },
};
