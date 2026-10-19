import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'mine' | 'land' | 'patent' | 'subsidy';

interface Params {
  context: Context;
  /** The income (or cost) per year, received continuously at a constant rate. */
  flow: number;
  /** Discount rate in per cent a year, compounded continuously. */
  rate: number;
  /** Length of the stream in years. */
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** Share of the perpetual value that the first T years make up: 1 − e^(−rT). */
const captured = (p: Params) => 1 - Math.exp(-(p.rate / 100) * p.years);
/** PV = ∫₀ᵀ A·e^(−rt) dt = A(1 − e^(−rT))/r. */
const presentValue = (p: Params) => round((p.flow * captured(p)) / (p.rate / 100), 2);

const OPENING: Record<Context, (p: Params) => string> = {
  mine: (p) =>
    `A small mine is expected to earn net income at a steady rate of $${num(p.flow)}$ a year, received continuously, for the next $${p.years}$ years.`,
  land: (p) =>
    `A farmer leases out land for $${p.years}$ years. The rent of $${num(p.flow)}$ a year is received continuously, at a steady rate.`,
  patent: (p) =>
    `A patent earns royalties at a steady rate of $${num(p.flow)}$ a year, received continuously, until it expires in $${p.years}$ years.`,
  subsidy: (p) =>
    `A government pays a subsidy continuously, at a steady rate of $${num(p.flow)}$ a year, for $${p.years}$ years.`,
};

const QUESTION: Record<Context, string> = {
  mine: 'What is the present value of this income?',
  land: 'What is the present value of the rent?',
  patent: 'What is the present value of the royalties?',
  subsidy: 'What is the present value of the cost of the subsidy?',
};

/** C116, difficulty 1: present value of a constant continuous stream, ∫₀ᵀ A·e^(−rt) dt = A(1 − e^(−rT))/r. */
export const continuousStreamPresentValue: Generator<Params> = {
  id: 'continuous-stream-present-value',
  title: 'Present value of a continuous income stream',
  topicId: 'C116',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        context: rng.pick(['mine', 'land', 'patent', 'subsidy'] as const),
        flow: rng.int(4, 80) * 500,
        rate: rng.int(4, 24) / 2,
        years: rng.int(3, 40),
      };
      // When rT = 1 the undiscounted total A·T equals the perpetuity A/r; keep the two mistakes apart.
      if (Math.abs((p.rate / 100) * p.years - 1) > 0.02) return p;
    }
  },

  stem: (p) =>
    `${OPENING[p.context](p)} The discount rate is $${num(p.rate)}\\%$ a year, compounded continuously. ${QUESTION[p.context]} Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: presentValue(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = p.rate / 100;
    const rT = round(r * p.years, 4);
    const factor = Math.exp(-r * p.years);
    return [
      {
        text: 'Write the present value as an integral of the discounted income.',
        latex: `PV = \\int_0^{${p.years}} ${num(p.flow)}\\,e^{-${num(r, 4)}t}\\,dt = \\frac{${num(p.flow)}}{${num(r, 4)}}\\left(1 - e^{-${num(r, 4)} \\cdot ${p.years}}\\right)`,
        why: 'The income received in a short interval dt is A·dt, and it is worth A·e^(−rt)·dt today. Adding all these pieces is integrating; an antiderivative of e^(−rt) is −e^(−rt)/r.',
      },
      {
        text: 'Compute the exponent rT.',
        latex: `rT = ${num(r, 4)} \\times ${p.years} = ${num(rT, 4)}`,
        why: 'With continuous discounting only the product of the rate and the time matters.',
        result: rT,
      },
      {
        text: 'Find the discount factor of the last moment of the stream.',
        latex: `e^{-${num(rT, 4)}} = ${num(factor, 6)}`,
        why: 'One unit received at time T is worth e^(−rT) today.',
        result: round(factor, 6),
      },
      {
        text: 'Put the numbers into the formula.',
        latex: `PV = \\frac{${num(p.flow)}}{${num(r, 4)}}\\,(1 - ${num(factor, 6)}) = ${num(presentValue(p))}`,
        why: 'A/r is the value of the stream if it lasted for ever; the bracket is the share of that value the first T years provide.',
        result: presentValue(p),
      },
    ];
  },

  distractors(p) {
    const r = p.rate / 100;
    return cleanDistractors(
      presentValue(p),
      [
        { value: round(p.flow * p.years, 2), mistakeCode: 'UNDISCOUNTED' },
        { value: round(p.flow / r, 2), mistakeCode: 'PERPETUITY_INSTEAD' },
        {
          value: round((p.flow * (1 - (1 + r) ** -p.years)) / r, 2),
          mistakeCode: 'DISCRETE_ANNUITY',
        },
        { value: round(p.flow * p.years * Math.exp(-r * p.years), 2), mistakeCode: 'LUMP_AT_END' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
