import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Flow {
  amount: number;
  /** Years from today until the payment; the first one is at least 1. */
  year: number;
}

interface Params {
  /** Two or three payments in order of their dates (all dates different). */
  flows: Flow[];
  /** Annual discount rate in per cent. */
  rate: number;
  context: 'client' | 'project';
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const factor = (p: Params, year: number) => (1 + p.rate / 100) ** year;
/** Each payment's value today, to 2 decimal places, as a student writes it down. */
const pieces = (p: Params) => p.flows.map((f) => round(f.amount / factor(p, f.year), 2));
const presentValue = (p: Params) => round(sum(pieces(p)), 2);

const yearsText = (year: number) => `$${year}$ year${year === 1 ? '' : 's'}`;
const listText = (p: Params) => {
  const parts = p.flows.map((f) => `$${num(f.amount)}$ in ${yearsText(f.year)}`);
  return parts.length === 2
    ? `${parts[0]} and ${parts[1]}`
    : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};

/** FM03, difficulty 2: present value of two or three uneven payments at different dates. */
export const presentValueUnevenFlows: Generator<Params> = {
  id: 'present-value-uneven-flows',
  title: 'Present value of several payments',
  topicId: 'FM03',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    const count = rng.int(2, 3);
    const flows: Flow[] = [];
    let year = rng.int(1, 3);
    for (let i = 0; i < count; i++) {
      flows.push({ amount: rng.int(5, 100) * 100, year });
      year += rng.int(1, 3);
    }
    return {
      flows,
      rate: rng.int(4, 20) / 2,
      context: rng.pick(['client', 'project'] as const),
    };
  },

  stem: (p) =>
    p.context === 'client'
      ? `A client agrees to pay a small firm ${listText(p)}. Using a discount rate of $${num(p.rate)}\\%$ per year, compounded annually, what are these payments worth today? Give your answer to 2 decimal places.`
      : `A council expects a new cycle path to cut health-care costs by ${listText(p)}. Using a discount rate of $${num(p.rate)}\\%$ per year, compounded annually, what is the present value of these savings? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: presentValue(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = num(p.rate / 100, 4);
    const values = pieces(p);
    const discountSteps: Step[] = p.flows.map((f, i) => ({
      text: `Discount the payment due in ${yearsText(f.year)}.`,
      latex: `\\dfrac{${num(f.amount)}}{(1 + ${r})^{${f.year}}} = ${num(values[i] ?? 0)}`,
      why:
        i === 0
          ? 'A payment t years away is divided by (1 + r) once for each year: by (1 + r)^t.'
          : 'Each payment uses its own date: the later it comes, the larger the power and the less it is worth today.',
      result: values[i],
    }));
    return [
      ...discountSteps,
      {
        text: 'Add the present values.',
        latex: `PV = ${values.map((v) => num(v)).join(' + ')} = ${num(presentValue(p))}`,
        why: 'Once every payment is measured in money of today, the amounts can be added.',
        result: presentValue(p),
      },
    ];
  },

  distractors(p) {
    const last = p.flows[p.flows.length - 1]?.year ?? 0;
    const total = sum(p.flows.map((f) => f.amount));
    const [first, ...rest] = p.flows;
    return cleanDistractors(
      presentValue(p),
      [
        { value: round(total / factor(p, last), 2), mistakeCode: 'SAME_DATE' },
        {
          value: round(
            (first?.amount ?? 0) + sum(rest.map((f) => f.amount / factor(p, f.year))),
            2,
          ),
          mistakeCode: 'FIRST_NOT_DISCOUNTED',
        },
        { value: total, mistakeCode: 'NO_DISCOUNTING' },
        {
          value: round(sum(p.flows.map((f) => f.amount / (1 + (p.rate / 100) * f.year))), 2),
          mistakeCode: 'SIMPLE_DISCOUNT',
        },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
