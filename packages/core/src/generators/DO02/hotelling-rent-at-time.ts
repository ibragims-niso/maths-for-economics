import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Prices to 2 decimals: a tight tolerance, as for money in FM01. */
const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

interface Params {
  /** Rent (price per tonne, extraction costs nothing) today. */
  rent0: number;
  /** Interest rate in per cent a year, compounded continuously. */
  rate: number;
  /** Years ahead. */
  years: number;
}

const rentAt = (p: Params) => round(p.rent0 * Math.exp((p.rate / 100) * p.years), 2);

const candidates = (p: Params) => [
  { value: round(p.rent0 * (1 + (p.rate / 100) * p.years), 2), mistakeCode: 'SIMPLE_GROWTH' },
  { value: round(p.rent0 * Math.exp((-p.rate / 100) * p.years), 2), mistakeCode: 'RENT_FALLS' },
  { value: round(p.rent0 * (1 + p.rate / 100) ** p.years, 2), mistakeCode: 'ANNUAL_COMPOUNDING' },
];

/** DO02, difficulty 1: the Hotelling rule, rent at time t = p₀e^(rt). */
export const hotellingRentAtTime: Generator<Params> = {
  id: 'hotelling-rent-at-time',
  title: 'Resource rent by the Hotelling rule',
  topicId: 'DO02',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const p: Params = {
        rent0: rng.int(10, 150),
        rate: rng.int(4, 20) / 2,
        years: rng.int(3, 30),
      };
      const kept = cleanDistractors(rentAt(p), candidates(p), MONEY.tolerance, MONEY.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `A mine owner in a competitive market sells a non-renewable mineral that costs nothing to extract. The rent (the price per tonne) is $p_0 = ${num(p.rent0)}$ today and the interest rate is $${num(p.rate)}\\%$ a year, compounded continuously. By the Hotelling rule, what is the rent in $${num(p.years)}$ years? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: rentAt(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = num(p.rate / 100, 4);
    return [
      {
        text: 'Write the Hamiltonian: the state is the stock S, the control is extraction q.',
        latex: `H = e^{-${r}t}\\,p(t)\\,q - \\lambda q, \\qquad \\dot S = -q`,
        why: 'The objective is the discounted revenue e^(−rt)·p·q, and each tonne extracted lowers the stock by one, so g = −q.',
      },
      {
        text: 'Apply the costate equation and the condition on q.',
        latex: `\\dot\\lambda = -\\dfrac{\\partial H}{\\partial S} = 0 \\;\\Rightarrow\\; e^{-${r}t}p(t) = \\lambda \\;\\Rightarrow\\; p(t) = p_0\\,e^{${r}t}`,
        why: 'H does not contain S, so the shadow price λ of a tonne in the ground is constant. H is linear in q, so the owner extracts at every date only if the discounted price equals λ there; otherwise all extraction would move to the best date.',
      },
      {
        text: 'Put in the numbers.',
        latex: `p(${num(p.years)}) = ${num(p.rent0)}\\,e^{${r} \\times ${num(p.years)}} = ${num(rentAt(p))}`,
        why: 'The rent grows at the interest rate, continuously compounded: keeping a tonne in the ground must pay as well as selling it and putting the money in the bank.',
        result: rentAt(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(rentAt(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};
