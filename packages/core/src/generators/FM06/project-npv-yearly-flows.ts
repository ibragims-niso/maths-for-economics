import { round, withinTolerance } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The initial outlay, paid today (t = 0). */
  cost: number;
  /** Net cash flows at the end of years 1, 2, ... (two to four of them). */
  flows: number[];
  /** Annual discount rate in per cent. */
  rate: number;
  context: 'machine' | 'council' | 'shop';
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** Each cash flow's value today, to 2 decimal places, as a student writes it down. */
const pieces = (p: Params) => p.flows.map((cf, i) => round(cf / (1 + p.rate / 100) ** (i + 1), 2));
const npv = (p: Params) => round(sum(pieces(p)) - p.cost, 2);

const flowList = (p: Params) => {
  const parts = p.flows.map((cf) => `$${num(cf)}$`);
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};
const yearList = (n: number) =>
  `${Array.from({ length: n - 1 }, (_, i) => i + 1).join(', ')} and ${n}`;

function candidates(p: Params) {
  const r = 1 + p.rate / 100;
  return [
    { value: round(sum(p.flows) - p.cost, 2), mistakeCode: 'NO_DISCOUNTING' },
    {
      value: round(sum(p.flows.map((cf, i) => cf / r ** i)) - p.cost, 2),
      mistakeCode: 'TIMING_OFF_BY_ONE',
    },
    { value: round(sum(pieces(p)), 2), mistakeCode: 'FORGOT_OUTLAY' },
  ];
}

/** FM06, difficulty 1: NPV of a project with an initial cost and two to four yearly cash flows. */
export const projectNpvYearlyFlows: Generator<Params> = {
  id: 'project-npv-yearly-flows',
  title: 'Net present value of a project',
  topicId: 'FM06',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const cost = rng.int(10, 120) * 500;
      const count = rng.int(2, 4);
      const scale = rng.int(100, 150) / 100;
      const flows = Array.from(
        { length: count },
        () => Math.round((cost * scale * rng.int(70, 130)) / (100 * count * 100)) * 100,
      );
      const p: Params = {
        cost,
        flows,
        rate: rng.int(4, 24) / 2,
        context: rng.pick(['machine', 'council', 'shop'] as const),
      };
      if (flows.some((cf) => cf <= 0)) continue;
      // Keep the NPV clearly away from zero and the three wrong answers clearly apart.
      if (Math.abs(npv(p)) < 50) continue;
      const values = [npv(p), ...candidates(p).map((c) => c.value)];
      const clash = values.some((v, i) =>
        values.some((w, j) => j > i && withinTolerance(v, w, MONEY.tolerance, MONEY.relTolerance)),
      );
      if (!clash) return p;
    }
  },

  stem(p) {
    const n = p.flows.length;
    const tail = `Using a discount rate of $${num(p.rate)}\\%$ per year, what is the net present value (NPV) of the project? Give your answer to 2 decimal places.`;
    if (p.context === 'machine')
      return `A firm can buy a new machine for $${num(p.cost)}$ today. It is expected to bring net cash flows of ${flowList(p)} at the end of years ${yearList(n)}. ${tail}`;
    if (p.context === 'council')
      return `A council can build a footbridge for $${num(p.cost)}$ today. It expects time savings worth ${flowList(p)} at the end of years ${yearList(n)}, and nothing after that. ${tail}`;
    return `A shop owner can refit the shop for $${num(p.cost)}$ today. The refit is expected to add net cash flows of ${flowList(p)} at the end of years ${yearList(n)}. ${tail}`;
  },

  answer: (p) => ({ kind: 'numeric', value: npv(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = num(1 + p.rate / 100, 4);
    const values = pieces(p);
    const discount: Step[] = p.flows.map((cf, i) => ({
      text: `Discount the cash flow at the end of year ${i + 1}.`,
      latex: `\\dfrac{${num(cf)}}{${r}${i === 0 ? '' : `^{${i + 1}}`}} = ${num(values[i] ?? 0)}`,
      why:
        i === 0
          ? 'A cash flow t years away is divided by (1 + r)^t; the first one comes after a full year, so it is discounted once.'
          : 'Each cash flow is discounted by its own date: one more year means one more division by (1 + r).',
      result: values[i],
    }));
    const value = npv(p);
    return [
      ...discount,
      {
        text: 'Add the present values and subtract the initial cost.',
        latex: `NPV = -${num(p.cost)} + ${values.map((v) => num(v)).join(' + ')} = ${num(value)}`,
        why:
          value > 0
            ? 'The cost is paid today, so it is not discounted. The NPV is positive: the project earns more than the discount rate, so accept it.'
            : 'The cost is paid today, so it is not discounted. The NPV is negative: the project earns less than the discount rate, so reject it.',
        result: value,
      },
    ];
  },

  distractors: (p) => cleanDistractors(npv(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};
