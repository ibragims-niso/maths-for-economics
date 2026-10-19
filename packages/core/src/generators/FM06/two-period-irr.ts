import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Drawn first: the internal rate of return in whole per cent. */
  irr: number;
  /** The initial outlay today, a multiple of 10 000 so that every cash flow is a whole number. */
  cost: number;
  /** Cash flow at the end of year 1, a multiple of 100. */
  flow1: number;
  /** Cash flow at the end of year 2, built so that the NPV at the IRR is exactly zero. */
  flow2: number;
  context: 'equipment' | 'software';
}

/** NPV = 0 multiplied by x² (x = 1 + r) gives the quadratic cost·x² − flow1·x − flow2 = 0. */
const discriminant = (p: Params) => p.flow1 ** 2 + 4 * p.cost * p.flow2;
const roots = (p: Params) => {
  const s = Math.sqrt(discriminant(p));
  return [(p.flow1 + s) / (2 * p.cost), (p.flow1 - s) / (2 * p.cost)] as const;
};
const irrPercent = (p: Params) => round((roots(p)[0] - 1) * 100, 2);
const totalReturn = (p: Params) => ((p.flow1 + p.flow2) / p.cost - 1) * 100;

function candidates(p: Params) {
  return [
    { value: round(totalReturn(p) / 2, 2), mistakeCode: 'SIMPLE_AVERAGE_RETURN' },
    { value: round(totalReturn(p), 2), mistakeCode: 'TOTAL_RETURN' },
    { value: round((roots(p)[1] - 1) * 100, 2), mistakeCode: 'NEGATIVE_ROOT' },
  ];
}

/** FM06, difficulty 2: the IRR of a two-period project, from a quadratic in 1 + r. */
export const twoPeriodIrr: Generator<Params> = {
  id: 'two-period-irr',
  title: 'IRR of a two-year project',
  topicId: 'FM06',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const irr = rng.int(4, 30);
      const cost = rng.int(1, 20) * 10000;
      const flow1 = (cost * rng.int(10, 90)) / 100;
      // cost·(1 + R)² − flow1·(1 + R), in whole numbers because cost is a multiple of 10 000.
      const flow2 = (cost / 10000) * (100 + irr) ** 2 - (flow1 / 100) * (100 + irr);
      const p: Params = {
        irr,
        cost,
        flow1,
        flow2,
        context: rng.pick(['equipment', 'software'] as const),
      };
      // The averaged return must not land on the true rate, or the distractor would be useless.
      if (Math.abs(totalReturn(p) / 2 - irr) >= 0.5) return p;
    }
  },

  stem: (p) =>
    p.context === 'equipment'
      ? `A farm can buy irrigation equipment for $${num(p.cost)}$ today. It will raise the farm's net income by $${num(p.flow1)}$ at the end of the first year and by $${num(p.flow2)}$ at the end of the second year, and then be worn out. Find the internal rate of return (IRR) of this investment, as a percentage.`
      : `A firm can pay $${num(p.cost)}$ today for new software. It will save $${num(p.flow1)}$ at the end of the first year and $${num(p.flow2)}$ at the end of the second year, after which it is replaced. Find the internal rate of return (IRR) of this investment, as a percentage.`,

  answer: (p) => ({ kind: 'numeric', value: irrPercent(p), decimals: 2 }),

  steps(p) {
    const [x1, x2] = roots(p);
    return [
      {
        text: 'Set the NPV equal to zero, writing x = 1 + r.',
        latex: `-${num(p.cost)} + \\dfrac{${num(p.flow1)}}{x} + \\dfrac{${num(p.flow2)}}{x^2} = 0`,
        why: 'The IRR is the discount rate at which the discounted cash flows exactly repay the outlay.',
      },
      {
        text: 'Multiply by x² to get a quadratic.',
        latex: `${num(p.cost)}x^2 - ${num(p.flow1)}x - ${num(p.flow2)} = 0`,
        why: 'Multiplying by x² (which is positive) clears the fractions without changing the solutions.',
      },
      {
        text: 'Solve with the quadratic formula and keep the positive root.',
        latex: `x = \\dfrac{${num(p.flow1)} \\pm \\sqrt{${num(discriminant(p), 0)}}}{${num(2 * p.cost)}} \\;\\Rightarrow\\; x = ${num(x1, 4)} \\text{ or } x = ${num(x2, 4)}`,
        why: 'x = 1 + r is a growth factor and must be positive; the negative root would mean r below −100 %, which makes no economic sense.',
        result: round(x1, 4),
      },
      {
        text: 'Subtract 1 and write the rate in per cent.',
        latex: `r = ${num(x1, 4)} - 1 = ${num(irrPercent(p))}\\%`,
        why: 'x is the growth factor 1 + r; the IRR is the part above 1.',
        result: irrPercent(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(irrPercent(p), candidates(p)),
};
