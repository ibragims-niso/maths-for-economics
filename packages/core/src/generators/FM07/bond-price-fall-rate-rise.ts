import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The face (par) value, repaid at maturity. */
  face: number;
  /** Coupon rate in per cent a year, paid on the face value at the end of each year. */
  coupon: number;
  /** The market yield before the rise, in per cent a year. */
  yield: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
/** The rise in the market yield, in percentage points. */
const RISE = 1;

const couponPayment = (p: Params) => (p.face * p.coupon) / 100;
const faceToday = (p: Params, yieldPct: number) => p.face / (1 + yieldPct / 100) ** p.years;
/** Price at a yield given in per cent: the coupons as an annuity plus the discounted face value. */
function bondPrice(p: Params, yieldPct: number): number {
  const y = yieldPct / 100;
  return (couponPayment(p) * (1 - (1 + y) ** -p.years)) / y + faceToday(p, yieldPct);
}
const before = (p: Params) => round(bondPrice(p, p.yield), 2);
const after = (p: Params) => round(bondPrice(p, p.yield + RISE), 2);
const fall = (p: Params) => round(before(p) - after(p), 2);

function candidates(p: Params): Distractor[] {
  return [
    { value: after(p), mistakeCode: 'NEW_PRICE_GIVEN' },
    { value: round(before(p) * (RISE / 100), 2), mistakeCode: 'ONE_PERCENT_RULE' },
    {
      value: round(faceToday(p, p.yield) - faceToday(p, p.yield + RISE), 2),
      mistakeCode: 'FACE_ONLY',
    },
  ];
}

/** FM07, difficulty 3: how much a coupon bond's price falls when the market yield rises by 1 point. */
export const bondPriceFallRateRise: Generator<Params> = {
  id: 'bond-price-fall-rate-rise',
  title: 'Bond price after a rate rise',
  topicId: 'FM07',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        face: rng.pick([100, 1000] as const),
        coupon: rng.int(2, 16) / 2,
        yield: rng.int(2, 20) / 2,
        years: rng.int(2, 12),
      };
      const list = candidates(p);
      if (
        cleanDistractors(fall(p), list, MONEY.tolerance, MONEY.relTolerance).length === list.length
      )
        return p;
    }
  },

  stem: (p) =>
    `A bond with a face value of $${num(p.face)}$ pays a coupon of $${num(p.coupon)}\\%$ at the end of each year and matures in $${p.years}$ years. The market yield is $${num(p.yield)}\\%$. After the central bank raises interest rates, the yield rises to $${num(p.yield + RISE)}\\%$. By how much does the bond's price fall? Work out both prices to 2 decimal places, then subtract.`,

  answer: (p) => ({ kind: 'numeric', value: fall(p), decimals: 2, ...MONEY }),

  steps(p) {
    const C = couponPayment(p);
    const y0 = p.yield / 100;
    const y1 = (p.yield + RISE) / 100;
    return [
      {
        text: `Price at the old yield of ${num(p.yield)} %.`,
        latex: `P_0 = ${num(C)} \\times \\dfrac{1 - (${num(1 + y0, 4)})^{-${p.years}}}{${num(y0, 4)}} + \\dfrac{${num(p.face)}}{(${num(1 + y0, 4)})^{${p.years}}} = ${num(before(p))}`,
        why: 'A bond’s price is the coupons valued as an annuity plus the face value discounted from maturity, both at the market yield.',
        result: before(p),
      },
      {
        text: `Price at the new yield of ${num(p.yield + RISE)} %.`,
        latex: `P_1 = ${num(C)} \\times \\dfrac{1 - (${num(1 + y1, 4)})^{-${p.years}}}{${num(y1, 4)}} + \\dfrac{${num(p.face)}}{(${num(1 + y1, 4)})^{${p.years}}} = ${num(after(p))}`,
        why: 'The coupons and the face value do not change, but every payment is now discounted at a higher rate, so each is worth less today.',
        result: after(p),
      },
      {
        text: 'Subtract the new price from the old one.',
        latex: `P_0 - P_1 = ${num(before(p))} - ${num(after(p))} = ${num(fall(p))}`,
        why: `That is a fall of ${num(((before(p) - after(p)) / before(p)) * 100, 1)} % for a 1-point rise in the yield. The longer the bond, the more payments sit far in the future and the bigger the fall.`,
        result: fall(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(fall(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};
