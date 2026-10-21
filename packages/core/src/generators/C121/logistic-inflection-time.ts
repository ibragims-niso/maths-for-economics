import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** S(t) = M/(1 + A·e^(−k t)): saturation level M (per cent of households), A > 1, k in hundredths. */
  M: number;
  A: number;
  kHundredths: number;
}

const TIME = { tolerance: 0.005, relTolerance: 0 } as const;

const k = (p: Params) => p.kHundredths / 100;
export const inflectionTime = (p: Params) => Math.log(p.A) / k(p);
const answerValue = (p: Params) => round(inflectionTime(p), 2);

const candidates = (p: Params) => [
  { value: round(p.A / k(p), 2), mistakeCode: 'NO_LOG' },
  { value: round(Math.log(p.A) * k(p), 2), mistakeCode: 'MULTIPLIED_RATE' },
  { value: p.M / 2, mistakeCode: 'GAVE_LEVEL' },
];

/** C121, difficulty 2: the inflection point of a logistic adoption curve, t = ln A / k. */
export const logisticInflectionTime: Generator<Params> = {
  id: 'logistic-inflection-time',
  title: 'When an adoption curve grows fastest',
  topicId: 'C121',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const M = rng.pick([60, 70, 80, 90, 100] as const);
      const A = rng.int(5, 99);
      const kHundredths = rng.int(20, 90);
      const p: Params = { M, A, kHundredths };
      if (inflectionTime(p) > 25) continue;
      if (cleanDistractors(answerValue(p), candidates(p), TIME.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `The share of households (in %) owning a new device $t$ years after launch is modelled by $S(t) = \\dfrac{${num(p.M)}}{1 + ${num(p.A)}e^{-${num(k(p))}t}}$. The curve has an inflection point where adoption grows fastest. After how many years is that? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: answerValue(p), decimals: 2, ...TIME }),

  steps(p) {
    const kk = num(k(p));
    return [
      {
        text: 'Read off the shape: two horizontal asymptotes and an S-shaped curve between them.',
        latex: `\\lim_{t \\to -\\infty} S(t) = 0, \\qquad \\lim_{t \\to \\infty} S(t) = ${num(p.M)}`,
        why: `As t grows, e^(−${kk}t) → 0 and S → ${num(p.M)}, the saturation level; the curve rises between the two lines, first convex, then concave.`,
      },
      {
        text: 'Use the logistic property: the inflection point is where S reaches half the saturation level.',
        latex: `S'' = 0 \\iff S = \\dfrac{${num(p.M)}}{2} \\iff ${num(p.A)}e^{-${kk}t} = 1`,
        why: `For the logistic curve S′ = ${kk}·S(1 − S/${num(p.M)}), a parabola in S that is largest at S = ${num(p.M)}/2; the bracket 1 + A·e^(−kt) equals 2 exactly when A·e^(−kt) = 1.`,
      },
      {
        text: 'Solve for t.',
        latex: `e^{${kk}t} = ${num(p.A)} \\;\\Rightarrow\\; t = \\dfrac{\\ln ${num(p.A)}}{${kk}} = ${num(answerValue(p))}`,
        why: 'Take natural logarithms of both sides, then divide by the growth rate k.',
        result: answerValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerValue(p), candidates(p), TIME.tolerance, 0),
};
