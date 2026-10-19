import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'government' | 'company' | 'bank';

interface Params {
  context: Context;
  /** The face (par) value, repaid at maturity. */
  face: number;
  /** Coupon rate in per cent a year, paid on the face value at the end of each year. */
  coupon: number;
  /** The market yield (yield to maturity) in per cent a year; never equal to the coupon rate. */
  yield: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const couponPayment = (p: Params) => (p.face * p.coupon) / 100;
const y = (p: Params) => p.yield / 100;
/** Annuity factor (1 − (1 + y)^(−n))/y: the value today of 1 paid at the end of each of n years. */
const factor = (p: Params) => (1 - (1 + y(p)) ** -p.years) / y(p);
const couponsValue = (p: Params) => couponPayment(p) * factor(p);
const faceValueToday = (p: Params) => p.face / (1 + y(p)) ** p.years;
const price = (p: Params) => round(couponsValue(p) + faceValueToday(p), 2);

function candidates(p: Params): Distractor[] {
  const C = couponPayment(p);
  return [
    // Discounting at the coupon rate always gives back the face value.
    { value: p.face, mistakeCode: 'COUPON_RATE_USED' },
    { value: round(p.years * C + faceValueToday(p), 2), mistakeCode: 'COUPONS_UNDISCOUNTED' },
    { value: round(couponsValue(p), 2), mistakeCode: 'FORGOT_FACE' },
    { value: round(p.years * C + p.face, 2), mistakeCode: 'UNDISCOUNTED' },
  ];
}

const OPENING: Record<Context, (p: Params) => string> = {
  government: (p) =>
    `The Ministry of Finance issues a government bond with a face value of $${num(p.face)}$ and a coupon rate of $${num(p.coupon)}\\%$ a year.`,
  company: (p) =>
    `A company sells a bond with a face value of $${num(p.face)}$ and a coupon rate of $${num(p.coupon)}\\%$ a year.`,
  bank: (p) =>
    `A bank issues a bond with a face value of $${num(p.face)}$ that pays a coupon of $${num(p.coupon)}\\%$ of the face value a year.`,
};

/** FM07, difficulty 2: price of an annual-coupon bond, P = C(1 − (1 + y)^(−n))/y + F/(1 + y)^n. */
export const bondPriceAnnualCoupon: Generator<Params> = {
  id: 'bond-price-annual-coupon',
  title: 'Price of a coupon bond',
  topicId: 'FM07',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p: Params = {
        context: rng.pick(['government', 'company', 'bank'] as const),
        face: rng.pick([100, 1000] as const),
        coupon: rng.int(2, 20) / 2,
        yield: rng.int(3, 24) / 2,
        years: rng.int(2, 10),
      };
      if (p.coupon === p.yield) continue;
      // Keep every mistake distinct from the answer and from the other mistakes.
      const list = candidates(p);
      if (
        cleanDistractors(price(p), list, MONEY.tolerance, MONEY.relTolerance).length === list.length
      )
        return p;
    }
  },

  stem: (p) =>
    `${OPENING[p.context](p)} The coupon is paid at the end of each year, and the bond matures in $${p.years}$ years, when the face value is repaid. Similar bonds now yield $${num(p.yield)}\\%$ a year. What is the bond's price? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: price(p), decimals: 2, ...MONEY }),

  steps(p) {
    const C = couponPayment(p);
    return [
      {
        text: 'Find the yearly coupon.',
        latex: `C = ${num(p.coupon / 100, 3)} \\times ${num(p.face)} = ${num(C)}`,
        why: 'The coupon rate is a percentage of the face value, fixed when the bond is issued.',
        result: C,
      },
      {
        text: 'Value the coupons today as an annuity at the market yield.',
        latex: `${num(C)} \\times \\dfrac{1 - (${num(1 + y(p), 4)})^{-${p.years}}}{${num(y(p), 4)}} = ${num(C)} \\times ${num(factor(p), 6)} = ${num(couponsValue(p), 4)}`,
        why: 'The coupons are equal payments at the end of each year, so their value today is the coupon times the annuity factor. Discount at the market yield, not at the coupon rate.',
        result: round(couponsValue(p), 4),
      },
      {
        text: 'Value the face value today.',
        latex: `\\dfrac{${num(p.face)}}{(${num(1 + y(p), 4)})^{${p.years}}} = ${num(faceValueToday(p), 4)}`,
        why: 'The face value is a single payment at maturity, so it is discounted for the full n years.',
        result: round(faceValueToday(p), 4),
      },
      {
        text: 'Add the two parts.',
        latex: `P = ${num(couponsValue(p), 4)} + ${num(faceValueToday(p), 4)} = ${num(price(p))}`,
        why: `The price is the present value of everything the holder receives. It is ${p.yield > p.coupon ? 'below' : 'above'} the face value because the market yield is ${p.yield > p.coupon ? 'above' : 'below'} the coupon rate.`,
        result: price(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(price(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};
