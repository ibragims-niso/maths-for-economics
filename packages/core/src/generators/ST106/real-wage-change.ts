import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { WAGE_CONTEXTS, type WageContext } from './real-wage-deflated';

interface Params {
  context: WageContext;
  /** Nominal wages in manat in the earlier and the later year. */
  w1: number;
  w2: number;
  /** CPI (base year = 100) in the two years, whole numbers. */
  c1: number;
  c2: number;
  baseYear: number;
  year1: number;
  year2: number;
}

/** A percentage to 2 decimals; 0.02 allows for growth factors rounded to 4 decimals on the way. */
const PERCENT = { tolerance: 0.02, relTolerance: 0 } as const;

const wageGrowth = (p: Params) => (p.w2 / p.w1 - 1) * 100;
const inflation = (p: Params) => (p.c2 / p.c1 - 1) * 100;
const realChange = (p: Params) => round((p.w2 / p.c2 / (p.w1 / p.c1) - 1) * 100, 2);

function wrongAnswers(p: Params): Distractor[] {
  return cleanDistractors(
    realChange(p),
    [
      { value: round(wageGrowth(p) - inflation(p), 2), mistakeCode: 'SUBTRACTED_INFLATION' },
      { value: round(wageGrowth(p) - (p.c2 - p.c1), 2), mistakeCode: 'CPI_POINTS' },
      { value: round(wageGrowth(p), 2), mistakeCode: 'NOMINAL_ONLY' },
    ],
    PERCENT.tolerance,
    PERCENT.relTolerance,
  );
}

/** ST106, difficulty 3: % change in the real wage between two years, CPI not based in either year. */
export const realWageChange: Generator<Params> = {
  id: 'real-wage-change',
  title: 'Change in the real wage',
  topicId: 'ST106',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(WAGE_CONTEXTS) as WageContext[]);
      const c = WAGE_CONTEXTS[context];
      const baseYear = rng.pick([2005, 2010, 2015] as const);
      const year1 = baseYear + rng.int(2, 6);
      const w1 = rng.int(c.lo, c.hi) * 10;
      const c1 = rng.int(104, 190);
      const q: Params = {
        context,
        w1,
        // Nominal growth of 2 % to 50 % (in whole manat), inflation of about 2 % to 40 %.
        w2: Math.round(w1 * (1 + rng.int(2, 50) / 100)),
        c1,
        c2: c1 + rng.int(Math.ceil(c1 * 0.02), Math.floor(c1 * 0.4)),
        baseYear,
        year1,
        year2: year1 + rng.int(1, 5),
      };
      // Index points and percentages must differ (c1 ≠ 100), and all three mistakes must show.
      if (wrongAnswers(q).length < 3) continue;
      return q;
    }
  },

  stem(p) {
    const what = WAGE_CONTEXTS[p.context].what;
    return `${what.charAt(0).toUpperCase()}${what.slice(1)} rose from $${num(p.w1)}$ manat in ${p.year1} to $${num(p.w2)}$ manat in ${p.year2}. Over the same years the consumer price index (${p.baseYear} = 100) rose from $${num(p.c1)}$ to $${num(p.c2)}$. By what percentage did the real wage change? Give your answer to 2 decimal places (negative if it fell).`;
  },

  answer: (p) => ({ kind: 'numeric', value: realChange(p), decimals: 2, ...PERCENT }),

  steps(p) {
    const wageRatio = p.w2 / p.w1;
    const priceRatio = p.c2 / p.c1;
    return [
      {
        text: 'Find the growth factor of the nominal wage.',
        latex: `\\dfrac{${num(p.w2)}}{${num(p.w1)}} = ${num(wageRatio, 4)}`,
        why: `The wage grew by ${num(wageGrowth(p))} % in money terms.`,
        result: round(wageRatio, 4),
      },
      {
        text: 'Find the growth factor of prices from the CPI.',
        latex: `\\dfrac{${num(p.c2)}}{${num(p.c1)}} = ${num(priceRatio, 4)}`,
        why: `Inflation is the percentage change in the index, ${num(inflation(p))} %, not the ${num(p.c2 - p.c1)} index points it moved: the CPI did not start at 100.`,
        result: round(priceRatio, 4),
      },
      {
        text: 'Divide the two factors and turn the result into a percentage change.',
        latex: `\\left(\\dfrac{${num(wageRatio, 4)}}{${num(priceRatio, 4)}} - 1\\right) \\times 100 = ${num(realChange(p))}\\%`,
        why: 'The real wage is the nominal wage divided by the price level, so its growth factor is the wage factor divided by the price factor. Subtracting the two percentages is only an approximation.',
        result: realChange(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
