import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** p(t) = a + bt + ct², t in months after 1 January (0 ≤ t ≤ 12). */
  a: number;
  /** A multiple of 0.2, so b/2 has one decimal. */
  b: number;
  /** A multiple of 0.03, so c/3 has two decimals; opposite in sign to b. */
  c: number;
  /** Average over months t1 to t2, with t1 ≥ 1. */
  t1: number;
  t2: number;
}

/** The average is exact to two decimals, so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const price = (p: Params, t: number) => p.a + p.b * t + p.c * t * t;
/** An antiderivative of the price: P(t) = at + (b/2)t² + (c/3)t³. */
const antiderivative = (p: Params, t: number) =>
  round(p.a * t + (p.b / 2) * t * t + (p.c / 3) * t * t * t, 2);
const integral = (p: Params) => round(antiderivative(p, p.t2) - antiderivative(p, p.t1), 2);
const average = (p: Params) => round(integral(p) / (p.t2 - p.t1), 2);

/** "+ 1.2t" or "- 1.2t", dropping a coefficient of 1. */
function term(k: number, power: string): string {
  const size = Math.abs(k);
  return `${k < 0 ? '-' : '+'} ${size === 1 ? '' : num(size)}${power}`;
}

const priceFormula = (p: Params) => `${num(p.a)} ${term(p.b, 't')} ${term(p.c, 't^2')}`;
const antiderivativeFormula = (p: Params) =>
  `${num(p.a)}t ${term(round(p.b / 2, 1), 't^2')} ${term(round(p.c / 3, 2), 't^3')}`;

/** C113, difficulty 3: the average value of a quadratic price path p(t) between months t₁ and t₂. */
export const averagePriceOverPeriod: Generator<Params> = {
  id: 'average-price-over-period',
  title: 'Average price over a period',
  topicId: 'C113',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      // Either a price that rises and then eases (b > 0, c < 0) or one that dips and recovers.
      const rising = rng.next() < 0.5;
      const sign = rising ? 1 : -1;
      const t1 = rng.int(1, 6);
      const p: Params = {
        a: rng.int(20, 150),
        b: round(sign * rng.int(1, 30) * 0.2, 1),
        c: round(-sign * rng.int(1, 10) * 0.03, 2),
        t1,
        t2: rng.int(t1 + 3, 12),
      };
      let lowest = Number.POSITIVE_INFINITY;
      for (let t = 0; t <= 12; t += 0.25) lowest = Math.min(lowest, price(p, t));
      // The end-point average differs from the true average by |c|(t₂ − t₁)²/6: keep it visible.
      const gap = (Math.abs(p.c) * (p.t2 - p.t1) ** 2) / 6;
      if (lowest >= 5 && gap >= 0.3) return p;
    }
  },

  stem: (p) =>
    `The price of a commodity $t$ months after 1 January is $p(t) = ${priceFormula(p)}$ per tonne, for $0 \\le t \\le 12$. What is its average price between $t = ${num(p.t1)}$ and $t = ${num(p.t2)}$? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: average(p), decimals: 2, ...EXACT }),

  steps: (p) => [
    {
      text: 'Write the average value as an integral divided by the length of the period.',
      latex: `\\bar p = \\dfrac{1}{${num(p.t2)} - ${num(p.t1)}}\\int_{${num(p.t1)}}^{${num(p.t2)}} \\left(${priceFormula(p)}\\right) dt`,
      why: 'The average value of a function is the height of the rectangle on the same interval with the same area as the region under the curve.',
    },
    {
      text: 'Find an antiderivative.',
      latex: `P(t) = ${antiderivativeFormula(p)}`,
      why: 'Raise each power of t by one and divide by the new power.',
    },
    {
      text: 'Evaluate between the limits.',
      latex: `P(${num(p.t2)}) - P(${num(p.t1)}) = ${num(antiderivative(p, p.t2))} - ${num(antiderivative(p, p.t1))} = ${num(integral(p))}`,
      why: 'By the Fundamental Theorem of Calculus the integral is the change in the antiderivative: upper limit minus lower limit.',
      result: integral(p),
    },
    {
      text: 'Divide by the length of the period.',
      latex: `\\bar p = \\dfrac{${num(integral(p))}}{${num(p.t2 - p.t1)}} = ${num(average(p))}`,
      why: `The period lasts t₂ − t₁ = ${num(p.t2 - p.t1)} months, not ${num(p.t2)}: it starts at month ${num(p.t1)}, not at 0.`,
      result: average(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      average(p),
      [
        { value: integral(p), mistakeCode: 'TOTAL_NOT_AVERAGE' },
        {
          value: round((price(p, p.t1) + price(p, p.t2)) / 2, 2),
          mistakeCode: 'ENDPOINT_AVERAGE',
        },
        { value: round(integral(p) / p.t2, 2), mistakeCode: 'WRONG_LENGTH' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
