import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'gdpQuarter' | 'cpiMonth';

interface Params {
  context: Context;
  /** Quarter (1–4) or month (1–12) of the later observation. */
  period: number;
  /** Year of the later observation. */
  year: number;
  /** The two levels in tenths (2538 = 253.8), so every difference is exact. */
  startTenths: number;
  endTenths: number;
}

/** Rates in per cent to 2 decimals; 0.01 allows the last digit to move if the ratio is rounded. */
const RATE = { tolerance: 0.01, relTolerance: 0 } as const;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Periods in a year: 4 quarters or 12 months. */
const perYear = (p: Params) => (p.context === 'gdpQuarter' ? 4 : 12);
const ratio = (p: Params) => p.endTenths / p.startTenths;
const periodRate = (p: Params) => 100 * (ratio(p) - 1);
const target = (p: Params) => round(100 * (ratio(p) ** perYear(p) - 1), 2);

function label(p: Params, later: boolean): string {
  const k = perYear(p);
  let period = p.period;
  let year = p.year;
  if (!later) {
    period -= 1;
    if (period === 0) {
      period = k;
      year -= 1;
    }
  }
  return p.context === 'gdpQuarter' ? `Q${period} ${year}` : `${MONTHS[period - 1]} ${year}`;
}

/** ST107, difficulty 2: annualised quarter-on-quarter or month-on-month growth from two levels. */
export const annualisedGrowthFromLevels: Generator<Params> = {
  id: 'annualised-growth-from-levels',
  title: 'Annualised growth rate',
  topicId: 'ST107',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['gdpQuarter', 'cpiMonth'] as const);
      const year = rng.int(2012, 2025);
      let p: Params;
      if (context === 'gdpQuarter') {
        // Seasonally adjusted real GDP in billions; quarterly changes between −2 % and +2.5 %.
        const startTenths = rng.int(500, 9000);
        const q = rng.int(-200, 250) / 10000;
        const endTenths = Math.round(startTenths * (1 + q));
        p = { context, period: rng.int(1, 4), year, startTenths, endTenths };
      } else {
        // A price index (2015 = 100) that moves by 0.2 to 1.5 index points in a month.
        const startTenths = rng.int(1050, 1800);
        const endTenths = startTenths + rng.int(2, 15);
        p = { context, period: rng.int(1, 12), year, startTenths, endTenths };
      }
      // A visible change, and simple annualising (k × rate) must differ from compounding.
      if (Math.abs(periodRate(p)) < (context === 'gdpQuarter' ? 0.5 : 0.15)) continue;
      if (Math.abs(target(p) - round(perYear(p) * periodRate(p), 2)) < 0.03) continue;
      return p;
    }
  },

  stem(p) {
    const a = (p.startTenths / 10).toFixed(1);
    const b = (p.endTenths / 10).toFixed(1);
    return p.context === 'gdpQuarter'
      ? `Seasonally adjusted real GDP was $${a}$ billion in ${label(p, false)} and $${b}$ billion in ${label(p, true)}. Find the annualised quarter-on-quarter growth rate: the yearly rate if growth continued at this pace for four quarters. Give your answer in per cent to 2 decimal places.`
      : `A seasonally adjusted consumer price index (2015 $= 100$) was $${a}$ in ${label(p, false)} and $${b}$ in ${label(p, true)}. Find the annualised month-on-month inflation rate: the yearly rate if prices kept rising at this pace for twelve months. Give your answer in per cent to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...RATE }),

  steps(p) {
    const k = perYear(p);
    const word = p.context === 'gdpQuarter' ? 'quarter' : 'month';
    const r = ratio(p);
    return [
      {
        text: `Find the growth factor over one ${word}.`,
        latex: `\\dfrac{${(p.endTenths / 10).toFixed(1)}}{${(p.startTenths / 10).toFixed(1)}} = ${num(r, 6)}`,
        why: `The ${word}-on-${word} growth factor is the later level divided by the earlier one; here the ${word}ly rate is ${num(periodRate(p), 4).replace('-', '−')} %.`,
        result: round(r, 6),
      },
      {
        text: `Compound it over the ${k} ${word}s of a year.`,
        latex: `${num(r, 6)}^{${k}} = ${num(r ** k, 6)}`,
        why: `Annualising asks what a whole year at this pace would give. Each ${word} grows from the level the previous one reached, so the factors multiply: raise to the power ${k}, do not multiply the rate by ${k}.`,
        result: round(r ** k, 6),
      },
      {
        text: 'Subtract 1 and write it in per cent.',
        latex: `(${num(r ** k, 6)} - 1) \\times 100 = ${num(target(p), 2)}\\%`,
        why: 'The growth rate is the part of the yearly factor above 1.',
        result: target(p),
      },
    ];
  },

  distractors(p) {
    const k = perYear(p);
    const candidates = [
      { value: round(k * periodRate(p), 2), mistakeCode: 'SIMPLE_ANNUALISING' },
      { value: round(periodRate(p), 2), mistakeCode: 'NOT_ANNUALISED' },
    ];
    if (p.context === 'cpiMonth') {
      // The rise in index points read as a percentage, then compounded.
      const points = (p.endTenths - p.startTenths) / 10;
      candidates.push({
        value: round(100 * ((1 + points / 100) ** k - 1), 2),
        mistakeCode: 'INDEX_POINTS',
      });
    }
    return cleanDistractors(target(p), candidates, RATE.tolerance, RATE.relTolerance);
  },
};
