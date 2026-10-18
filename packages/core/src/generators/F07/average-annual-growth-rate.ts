import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'gdp' | 'gdpPerPerson' | 'cpi' | 'sales';

interface Params {
  context: Context;
  startYear: number;
  /** Years of growth between the two observations, T. */
  years: number;
  start: number;
  end: number;
}

/** Start value, a realistic yearly rate in per cent, and how many decimals the data have. */
const DRAW: Record<Context, (rng: Rng) => [number, number, number]> = {
  gdp: (rng) => [rng.int(200, 9000) / 10, rng.int(5, 90) / 10, 1],
  gdpPerPerson: (rng) => [rng.int(20, 400) * 100, rng.int(5, 80) / 10, 0],
  cpi: (rng) => [rng.int(1000, 1400) / 10, rng.int(10, 120) / 10, 1],
  sales: (rng) => [rng.int(20, 900) / 10, rng.int(20, 250) / 10, 1],
};

function data(p: Params): string {
  const y0 = p.startYear;
  const y1 = p.startYear + p.years;
  const a = num(p.start, 1);
  const b = num(p.end, 1);
  switch (p.context) {
    case 'gdp':
      return `Real GDP was $${a}$ billion in ${y0} and $${b}$ billion in ${y1}. Find the average annual growth rate`;
    case 'gdpPerPerson':
      return `Real GDP per person was $${a}$ in ${y0} and $${b}$ in ${y1}. Find the average annual growth rate`;
    case 'cpi':
      return `The consumer price index was $${a}$ in ${y0} and $${b}$ in ${y1}. Find the average annual inflation rate`;
    case 'sales':
      return `A firm sold $${a}$ million units in ${y0} and $${b}$ million units in ${y1}. Find the average annual growth rate of its sales`;
  }
}

const ratio = (p: Params) => p.end / p.start;
const yearlyFactor = (p: Params) => ratio(p) ** (1 / p.years);
const rate = (p: Params) => round(100 * (yearlyFactor(p) - 1), 2);

/** F07, difficulty 2: average annual (compound) growth rate from two values, (Y_T/Y_0)^(1/T) − 1. */
export const averageAnnualGrowthRate: Generator<Params> = {
  id: 'average-annual-growth-rate',
  title: 'Average annual growth rate',
  topicId: 'F07',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['gdp', 'gdpPerPerson', 'cpi', 'sales'] as const);
      const [start, trueRate, decimals] = DRAW[context](rng);
      const years = rng.int(4, 20);
      const startYear = rng.int(1990, 2025 - years);
      const end = round(start * (1 + trueRate / 100) ** years, decimals);
      const p = { context, startYear, years, start, end };
      if (end > start && rate(p) >= 0.3) return p;
    }
  },

  stem: (p) =>
    `${data(p)}: the constant yearly rate $g$ that turns the first value into the second. Give $g$ in per cent to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: rate(p), decimals: 2 }),

  steps(p) {
    const r = ratio(p);
    const f = yearlyFactor(p);
    return [
      {
        text: 'Count the years of growth.',
        latex: `T = ${p.startYear + p.years} - ${p.startYear} = ${p.years}`,
        why: 'Growth happens between the two dates, so count the gaps between years, not the years themselves.',
        result: p.years,
      },
      {
        text: 'Find the growth factor over the whole period.',
        latex: `\\dfrac{${num(p.end, 1)}}{${num(p.start, 1)}} = ${num(r, 4)}`,
        why: 'Only the ratio matters: (1 + g)^T must equal the end value divided by the start value.',
        result: round(r, 4),
      },
      {
        text: 'Take the T-th root to get the yearly growth factor.',
        latex: `1 + g = ${num(r, 4)}^{1/${p.years}} = ${num(f, 5)}`,
        why: 'The T-th root undoes raising to the power T. With logs it is the same: ln(1 + g) = ln(ratio) ÷ T, then raise e to that power.',
        result: round(f, 5),
      },
      {
        text: 'Subtract 1 and write it as a percentage.',
        latex: `g = ${num(f, 5)} - 1 = ${num(f - 1, 5)} = ${num(rate(p))}\\%`,
        why: 'The growth rate is the part of the factor above 1; multiplying by 100 turns it into per cent.',
        result: rate(p),
      },
    ];
  },

  distractors(p) {
    const r = ratio(p);
    return cleanDistractors(rate(p), [
      { value: round((100 * (r - 1)) / p.years, 2), mistakeCode: 'SIMPLE_AVERAGE' },
      { value: round((100 * Math.log(r)) / p.years, 2), mistakeCode: 'LOG_DIFFERENCE' },
      { value: round(100 * yearlyFactor(p), 2), mistakeCode: 'GROWTH_FACTOR' },
      { value: round(100 * (r ** (1 / (p.years + 1)) - 1), 2), mistakeCode: 'COUNTED_YEARS' },
    ]);
  },
};
