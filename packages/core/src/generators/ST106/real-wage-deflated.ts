import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Incomes that are deflated by a consumer price index; `lo`–`hi` is the range in tens of manat. */
export const WAGE_CONTEXTS = {
  average: { what: 'the average monthly wage in a country', lo: 40, hi: 250 },
  teacher: { what: 'a teacher’s monthly salary', lo: 50, hi: 200 },
  minimum: { what: 'the monthly minimum wage', lo: 25, hi: 80 },
  pension: { what: 'the average monthly pension', lo: 25, hi: 90 },
} as const;

export type WageContext = keyof typeof WAGE_CONTEXTS;

/** Base years of the price index and the later years whose wage is deflated. */
export const BASE_YEARS = [2010, 2012, 2015, 2018, 2020] as const;

interface Params {
  context: WageContext;
  /** Nominal wage in manat (a whole number). */
  wage: number;
  /** CPI in the current year, base year = 100, in tenths (1184 means 118.4). */
  cpiTenths: number;
  baseYear: number;
  year: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const cpi = (p: Params) => p.cpiTenths / 10;
const realWage = (p: Params) => round((p.wage / cpi(p)) * 100, 2);

function wrongAnswers(p: Params): Distractor[] {
  return cleanDistractors(
    realWage(p),
    [
      { value: round((p.wage * cpi(p)) / 100, 2), mistakeCode: 'MULTIPLIED_BY_CPI' },
      { value: round(p.wage * (1 - (cpi(p) - 100) / 100), 2), mistakeCode: 'PERCENT_OFF_WAGE' },
      { value: round(p.wage / cpi(p), 2), mistakeCode: 'FORGOT_100' },
    ],
    MONEY.tolerance,
    MONEY.relTolerance,
  );
}

/** ST106, difficulty 1: a nominal wage in base-year prices, real wage = nominal / CPI × 100. */
export const realWageDeflated: Generator<Params> = {
  id: 'real-wage-deflated',
  title: 'Real wage from the CPI',
  topicId: 'ST106',
  difficulty: 1,
  timeSec: 60,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(WAGE_CONTEXTS) as WageContext[]);
      const c = WAGE_CONTEXTS[context];
      const baseYear = rng.pick(BASE_YEARS);
      const q: Params = {
        context,
        wage: rng.int(c.lo, c.hi) * 10,
        cpiTenths: rng.int(1020, 1800),
        baseYear,
        year: baseYear + rng.int(3, 8),
      };
      if (wrongAnswers(q).length < 3) continue;
      return q;
    }
  },

  stem: (p) =>
    `In ${p.year}, ${WAGE_CONTEXTS[p.context].what} was $${num(p.wage)}$ manat, and the consumer price index (${p.baseYear} = 100) stood at $${num(cpi(p), 1)}$. What was it worth in ${p.baseYear} prices (the real wage)? Give your answer in manat to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: realWage(p), decimals: 2, ...MONEY }),

  steps(p) {
    const factor = cpi(p) / 100;
    return [
      {
        text: 'Turn the index into a price factor.',
        latex: `\\dfrac{${num(cpi(p), 1)}}{100} = ${num(factor, 3)}`,
        why: `An index of ${num(cpi(p), 1)} with ${p.baseYear} = 100 means the basket costs ${num(factor, 3)} times what it cost in ${p.baseYear}.`,
        result: factor,
      },
      {
        text: 'Divide the nominal wage by the price factor.',
        latex: `\\text{real wage} = \\dfrac{${num(p.wage)}}{${num(cpi(p), 1)}} \\times 100 = ${num(realWage(p))}`,
        why: 'Each manat now buys only 1/factor of what it bought in the base year, so dividing removes the price rise and leaves the wage in base-year purchasing power.',
        result: realWage(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
