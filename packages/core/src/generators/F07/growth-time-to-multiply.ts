import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'gdp' | 'prices' | 'population' | 'sales';

interface Params {
  context: Context;
  /** Growth rate in per cent a year. */
  rate: number;
  /** How many times larger the value must become. */
  factor: number;
}

const FACTORS = [1.25, 1.5, 2, 3, 4, 5, 10] as const;

/** Realistic yearly rates for each context: rate = int(min, max) / divisor, in per cent. */
const RATE_RANGE: Record<Context, readonly [number, number, number]> = {
  gdp: [10, 90, 10], // 1.0 % to 9.0 %
  prices: [15, 150, 10], // 1.5 % to 15.0 %
  population: [5, 40, 10], // 0.5 % to 4.0 %
  sales: [10, 80, 2], // 5 % to 40 %, in halves
};

const SUBJECT: Record<Context, [string, string]> = {
  gdp: ["A country's real GDP grows", 'real GDP'],
  prices: ['Prices rise', 'the price level'],
  population: ["A city's population grows", 'the population'],
  sales: ["A start-up's sales grow", 'its sales'],
};

/** "double", "rise by 50 %", "become 4 times as large". */
function goal(factor: number): string {
  if (factor === 2) return 'double';
  if (factor === 3) return 'triple';
  if (factor < 2) return `rise by $${num((factor - 1) * 100)}\\%$`;
  return `become $${num(factor)}$ times as large`;
}

const years = (p: Params) => Math.log(p.factor) / Math.log(1 + p.rate / 100);

/** F07, difficulty 1: years for a value growing at g % a year to grow k-fold, t = ln k / ln(1 + g). */
export const growthTimeToMultiply: Generator<Params> = {
  id: 'growth-time-to-multiply',
  title: 'Time to grow by a factor',
  topicId: 'F07',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['gdp', 'prices', 'population', 'sales'] as const);
      const [min, max, per] = RATE_RANGE[context];
      const p = { context, rate: rng.int(min, max) / per, factor: rng.pick(FACTORS) };
      const t = years(p);
      if (t >= 1 && t <= 120) return p; // keep the horizon readable
    }
  },

  stem: (p) => {
    const [opening, subject] = SUBJECT[p.context];
    return `${opening} at $${num(p.rate)}\\%$ a year. How many years will it take for ${subject} to ${goal(p.factor)}? Use logarithms and give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(years(p), 2), decimals: 2 }),

  steps(p) {
    const b = 1 + p.rate / 100;
    const t = round(years(p), 2);
    const estimate = Math.log(p.factor) / (p.rate / 100);
    return [
      {
        text: 'Write the condition with the yearly growth factor.',
        latex: `(${num(b, 4)})^t = ${num(p.factor)}`,
        why: 'Each year the value is multiplied by 1 + g, so after t years by (1 + g)^t. The starting level is on both sides and cancels.',
      },
      {
        text: 'Take natural logarithms of both sides.',
        latex: `t \\ln ${num(b, 4)} = \\ln ${num(p.factor)}`,
        why: 'The rule ln(xᵗ) = t·ln x brings the unknown exponent down, where it can be solved for.',
      },
      {
        text: 'Divide by the log of the growth factor.',
        latex: `t = \\dfrac{\\ln ${num(p.factor)}}{\\ln ${num(b, 4)}} = \\dfrac{${num(Math.log(p.factor), 4)}}{${num(Math.log(b), 5)}} = ${num(t)}`,
        why: 'ln(1 + g) is just a positive number, so dividing both sides by it leaves t on its own.',
        result: t,
      },
      {
        text: 'Sense check with the estimate ln(1 + g) ≈ g.',
        latex: `t \\approx \\dfrac{\\ln ${num(p.factor)}}{${num(p.rate / 100, 4)}} = ${num(estimate)}`,
        why: 'For small rates ln(1 + g) is close to g, which is where the rule of 70 comes from. The gap grows as the rate grows.',
      },
    ];
  },

  distractors(p) {
    const g = p.rate / 100;
    return cleanDistractors(round(years(p), 2), [
      {
        value: round(p.factor === 2 ? 70 / p.rate : Math.log(p.factor) / g, 2),
        mistakeCode: 'RULE_OF_70',
      },
      { value: round((p.factor - 1) / g, 2), mistakeCode: 'LINEAR_CHANGE' },
      {
        value: round(Math.log(p.factor) / Math.log(1 + p.rate), 2),
        mistakeCode: 'PERCENT_NOT_DIVIDED',
      },
      {
        value: round(Math.log10(p.factor) / Math.log(1 + g), 2),
        mistakeCode: 'MIXED_BASES',
      },
    ]);
  },
};
