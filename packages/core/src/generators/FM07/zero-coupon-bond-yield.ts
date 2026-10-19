import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'government' | 'company' | 'savings';

interface Params {
  context: Context;
  /** The yield in per cent, drawn first (steps of 0.25) so the answer is a clean rate. */
  rate: number;
  years: number;
  /** What the bond pays at maturity. */
  face: number;
  /** Today's price: the face value discounted at the rate, to 2 decimal places. */
  price: number;
}

/** A rate to 2 decimals: allow one unit in the last place for rounding along the way. */
const RATE = { tolerance: 0.01, relTolerance: 0 } as const;

const ratio = (p: Params) => p.face / p.price;
const growthPerYear = (p: Params) => ratio(p) ** (1 / p.years);
const yieldPercent = (p: Params) => round((growthPerYear(p) - 1) * 100, 2);

const ROOT_NAME: Record<number, string> = { 2: 'square', 3: 'cube' };

function candidates(p: Params): Distractor[] {
  return [
    { value: round(((ratio(p) - 1) / p.years) * 100, 2), mistakeCode: 'SIMPLE_YIELD' },
    { value: round((ratio(p) - 1) * 100, 2), mistakeCode: 'TOTAL_RETURN' },
    {
      value: round(((p.price / p.face) ** (1 / p.years) - 1) * 100, 2),
      mistakeCode: 'RATIO_INVERTED',
    },
  ];
}

const OPENING: Record<Context, (p: Params) => string> = {
  government: (p) =>
    `A government zero-coupon bond pays $${num(p.face)}$ in $${p.years}$ years and nothing before then. It sells today for $${num(p.price)}$.`,
  company: (p) =>
    `A company's zero-coupon bond, which pays $${num(p.face)}$ at maturity in $${p.years}$ years and no coupons, trades at $${num(p.price)}$.`,
  savings: (p) =>
    `A savings bond costs $${num(p.price)}$ today and pays $${num(p.face)}$ in $${p.years}$ years, with no payments in between.`,
};

/** FM07, difficulty 1: yield to maturity of a zero-coupon bond, y = (F/P)^(1/n) − 1. */
export const zeroCouponBondYield: Generator<Params> = {
  id: 'zero-coupon-bond-yield',
  title: 'Yield of a zero-coupon bond',
  topicId: 'FM07',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const rate = rng.int(8, 48) / 4;
      const years = rng.int(2, 10);
      const face = rng.pick([1000, 5000, 10000, 50000, 100000] as const);
      const price = round(face / (1 + rate / 100) ** years, 2);
      const p: Params = {
        context: rng.pick(['government', 'company', 'savings'] as const),
        rate,
        years,
        face,
        price,
      };
      // The rounded price must still give back the drawn rate, and every mistake must stay distinct.
      if (Math.abs(yieldPercent(p) - rate) > 1e-9) continue;
      const list = candidates(p);
      if (
        cleanDistractors(yieldPercent(p), list, RATE.tolerance, RATE.relTolerance).length ===
        list.length
      )
        return p;
    }
  },

  stem: (p) =>
    `${OPENING[p.context](p)} What is its yield to maturity, as an annual rate compounded once a year? Give your answer as a percentage to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: yieldPercent(p), decimals: 2, unit: '%', ...RATE }),

  steps: (p) => [
    {
      text: 'Write the price as the discounted face value and rearrange.',
      latex: `${num(p.price)} = \\dfrac{${num(p.face)}}{(1 + y)^{${p.years}}} \\;\\Rightarrow\\; (1 + y)^{${p.years}} = \\dfrac{${num(p.face)}}{${num(p.price)}} = ${num(ratio(p), 6)}`,
      why: 'The yield is the rate at which the face value, discounted back to today, equals the price.',
      result: round(ratio(p), 6),
    },
    {
      text: `Take the ${ROOT_NAME[p.years] ?? `${p.years}th`} root of both sides.`,
      latex: `1 + y = ${num(ratio(p), 6)}^{1/${p.years}} = ${num(growthPerYear(p), 6)}`,
      why: 'F/P is the growth over the whole life of the bond; the root turns it into growth per year.',
      result: round(growthPerYear(p), 6),
    },
    {
      text: 'Subtract 1 and write the yield in per cent.',
      latex: `y = ${num(growthPerYear(p) - 1, 6)} = ${num(yieldPercent(p))}\\%`,
      why: '1 + y is the yearly growth factor; the yield is the part above 1.',
      result: yieldPercent(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(yieldPercent(p), candidates(p), RATE.tolerance, RATE.relTolerance),
};
