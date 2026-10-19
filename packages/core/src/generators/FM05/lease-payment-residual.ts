import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'machine' | 'van' | 'car';

interface Params {
  context: Context;
  /** The price of the asset today. */
  price: number;
  /** What the asset is expected to be worth when it is handed back at the end. */
  residual: number;
  /** Annual rate in per cent, compounded monthly. */
  rate: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const perMonth = (p: Params) => p.rate / 100 / 12;
const count = (p: Params) => 12 * p.years;
/** (1 + r)^(−n): the discount factor of the hand-back date. */
const discount = (p: Params) => (1 + perMonth(p)) ** -count(p);
/** Annuity factor (1 − (1 + r)^(−n))/r. */
const factor = (p: Params) => (1 - discount(p)) / perMonth(p);
/** The part of the price the lease payments must cover: price − PV(residual). */
const financed = (p: Params) => p.price - p.residual * discount(p);
const payment = (p: Params) => round(financed(p) / factor(p), 2);

const OPENING: Record<Context, (p: Params) => string> = {
  machine: (p) =>
    `A leasing company buys a machine for $${num(p.price)}$ and leases it to a factory for $${p.years}$ years. At the end the machine comes back to the company, which expects it to be worth $${num(p.residual)}$ then.`,
  van: (p) =>
    `A leasing company buys a delivery van for $${num(p.price)}$ and leases it to a courier firm for $${p.years}$ years. At the end the van is returned, and it is expected to be worth $${num(p.residual)}$.`,
  car: (p) =>
    `A car costs $${num(p.price)}$ and is leased to a driver for $${p.years}$ years, after which it goes back to the leasing company with an expected value of $${num(p.residual)}$.`,
};

/** FM05, difficulty 3: lease payment with a residual value, PMT = (P − RV(1 + r)^(−n))·r/(1 − (1 + r)^(−n)). */
export const leasePaymentResidual: Generator<Params> = {
  id: 'lease-payment-residual',
  title: 'Lease payment with a residual value',
  topicId: 'FM05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    const context = rng.pick(['machine', 'van', 'car'] as const);
    const price =
      context === 'machine'
        ? rng.int(10, 200) * 1000
        : context === 'van'
          ? rng.int(40, 120) * 500
          : rng.int(30, 120) * 500;
    // The residual is 20 % to 50 % of the price, rounded to a multiple of 500.
    const residual = Math.max(500, Math.round((price * rng.int(20, 50)) / 100 / 500) * 500);
    return {
      context,
      price,
      residual,
      // Multiples of 0.6 % a year give a monthly rate with at most 4 decimals.
      rate: round(rng.int(5, 20) * 0.6, 1),
      years: rng.int(2, 5),
    };
  },

  stem: (p) =>
    `${OPENING[p.context](p)} The lease is priced at $${num(p.rate)}\\%$ a year, compounded monthly, with equal payments at the end of each month. What monthly payment exactly covers the price, given the value handed back at the end? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: payment(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = perMonth(p);
    const n = count(p);
    return [
      {
        text: 'Find the monthly rate and the number of payments.',
        latex: `r = \\dfrac{${num(p.rate / 100, 4)}}{12} = ${num(r, 6)}, \\quad n = 12 \\cdot ${p.years} = ${n}`,
        why: 'Payments are monthly, so the annual rate is split into 12 and the payments are counted in months.',
        result: n,
      },
      {
        text: 'Discount the residual value back to today.',
        latex: `${num(p.residual)} \\times (${num(1 + r, 6)})^{-${n}} = ${num(p.residual * discount(p))}`,
        why: 'The asset is worth its residual value only when it comes back, n months from now; today that is worth just its present value, and this is the part of the price it covers.',
        result: round(p.residual * discount(p), 2),
      },
      {
        text: 'Subtract it from the price: this is what the payments must cover.',
        latex: `${num(p.price)} - ${num(p.residual * discount(p))} = ${num(financed(p))}`,
        why: 'The lessor is repaid partly by the payments and partly by getting the asset back; the payments carry the rest.',
        result: round(financed(p), 2),
      },
      {
        text: 'Spread that amount over the payments with the annuity factor.',
        latex: `PMT = \\dfrac{${num(financed(p))}}{${num(factor(p), 6)}} = ${num(payment(p))}`,
        why: 'The factor (1 − (1 + r)^(−n))/r is the value today of 1 a month for n months, so dividing by it turns a present value into a level monthly payment.',
        result: payment(p),
      },
    ];
  },

  distractors(p) {
    const n = count(p);
    return cleanDistractors(
      payment(p),
      [
        { value: round(p.price / factor(p), 2), mistakeCode: 'RESIDUAL_IGNORED' },
        {
          value: round((p.price - p.residual) / factor(p), 2),
          mistakeCode: 'RESIDUAL_UNDISCOUNTED',
        },
        { value: round((p.price - p.residual) / n, 2), mistakeCode: 'IGNORED_INTEREST' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
