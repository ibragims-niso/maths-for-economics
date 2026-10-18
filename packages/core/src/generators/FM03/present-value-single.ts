import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  futureValue: number;
  /** Annual rate in per cent. */
  rate: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const growth = (p: Params) => (1 + p.rate / 100) ** p.years;
const presentValue = (p: Params) => round(p.futureValue / growth(p), 2);

/** FM03, difficulty 1: present value of one future payment, PV = FV/(1 + r)^n. */
export const presentValueSingle: Generator<Params> = {
  id: 'present-value-single',
  title: 'Present value of a future payment',
  topicId: 'FM03',
  difficulty: 1,
  timeSec: 90,

  params: (rng) => ({
    futureValue: rng.int(2, 80) * 250,
    rate: rng.int(2, 24) / 2,
    years: rng.int(2, 15),
  }),

  stem: (p) =>
    `You are promised a payment of $${num(p.futureValue)}$ in $${p.years}$ years. The interest rate is $${num(p.rate)}\\%$ per year, compounded annually. What is the present value of this payment? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: presentValue(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = p.rate / 100;
    return [
      {
        text: 'Write the rate as a decimal.',
        latex: `r = \\dfrac{${num(p.rate)}}{100} = ${num(r, 4)}`,
        why: 'Formulas use the rate as a decimal: 5 % means 0.05.',
        result: r,
      },
      {
        text: 'Find how much money grows over the whole period.',
        latex: `(1 + ${num(r, 4)})^{${p.years}} = ${num(growth(p), 6)}`,
        why: 'One unit invested today would be multiplied by (1 + r) once for each year.',
        result: round(growth(p), 6),
      },
      {
        text: 'Divide the future payment by that growth factor.',
        latex: `PV = \\dfrac{${num(p.futureValue)}}{${num(growth(p), 6)}} = ${num(presentValue(p))}`,
        why: 'Discounting runs compounding backwards: the present value is the amount that would grow into the promised payment by its date.',
        result: presentValue(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      presentValue(p),
      [
        { value: round(p.futureValue * growth(p), 2), mistakeCode: 'COMPOUNDED_FORWARD' },
        {
          value: round(p.futureValue / (1 + (p.rate / 100) * p.years), 2),
          mistakeCode: 'SIMPLE_DISCOUNT',
        },
        {
          value: round(p.futureValue / (1 + p.rate / 100) ** (p.years - 1), 2),
          mistakeCode: 'EXPONENT_OFF_BY_ONE',
        },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
