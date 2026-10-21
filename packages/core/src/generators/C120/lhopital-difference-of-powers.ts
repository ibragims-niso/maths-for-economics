import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Gross growth factors 1 + r, in per cent above 1: a = 1 + ra/100, b = 1 + rb/100. */
  ra: number;
  rb: number;
}

const FOUR = { tolerance: 0.00005, relTolerance: 0 } as const;

const factor = (r: number) => 1 + r / 100;
export const exactLimit = (p: Params) => Math.log(factor(p.ra)) - Math.log(factor(p.rb));
const limitValue = (p: Params) => round(exactLimit(p), 4);

const candidates = (p: Params) => [
  { value: round(factor(p.ra) - factor(p.rb), 4), mistakeCode: 'NO_LOG' },
  { value: round(-exactLimit(p), 4), mistakeCode: 'SIGN_SLIP' },
  { value: 0, mistakeCode: 'ZERO_OVER_ZERO' },
];

/** C120, difficulty 2: lim_{x→0} (aˣ − bˣ)/x = ln a − ln b, by L'Hôpital's rule. */
export const lhopitalDifferenceOfPowers: Generator<Params> = {
  id: 'lhopital-difference-of-powers',
  title: "L'Hôpital's rule for a gap between two growth factors",
  topicId: 'C120',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const ra = rng.int(1, 30);
      const rb = rng.int(1, 30);
      if (Math.abs(ra - rb) < 2) continue;
      const p: Params = { ra, rb };
      if (cleanDistractors(limitValue(p), candidates(p), FOUR.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `Two investments grow by the factors $${num(factor(p.ra))}$ and $${num(factor(p.rb))}$ a year, so after $x$ years their values are $${num(factor(p.ra))}^{x}$ and $${num(factor(p.rb))}^{x}$. Find $\\displaystyle\\lim_{x \\to 0} \\dfrac{${num(factor(p.ra))}^{x} - ${num(factor(p.rb))}^{x}}{x}$, the rate at which the gap opens at the start. Give your answer to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: limitValue(p), decimals: 4, ...FOUR }),

  steps(p) {
    const a = num(factor(p.ra));
    const b = num(factor(p.rb));
    return [
      {
        text: 'Check the form at x = 0.',
        latex: `\\dfrac{${a}^{0} - ${b}^{0}}{0} = \\dfrac{1 - 1}{0} = \\dfrac{0}{0}`,
        why: "Both top and bottom are 0, so L'Hôpital's rule applies: the limit of f/g equals the limit of f′/g′.",
      },
      {
        text: 'Differentiate the top and the bottom separately.',
        latex: `\\dfrac{d}{dx}\\left(${a}^{x} - ${b}^{x}\\right) = ${a}^{x}\\ln ${a} - ${b}^{x}\\ln ${b}, \\qquad \\dfrac{d}{dx}\\,x = 1`,
        why: 'The derivative of aˣ is aˣ·ln a (C105). Differentiate top and bottom on their own; this is not the quotient rule.',
      },
      {
        text: 'Let x → 0 in the new quotient.',
        latex: `\\lim_{x \\to 0} \\dfrac{${a}^{x}\\ln ${a} - ${b}^{x}\\ln ${b}}{1} = \\ln ${a} - \\ln ${b} = ${num(limitValue(p), 4)}`,
        why: 'At x = 0 both powers equal 1, leaving the difference of the logarithms: the gap between the two continuous growth rates.',
        result: limitValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(limitValue(p), candidates(p), FOUR.tolerance, 0),
};
