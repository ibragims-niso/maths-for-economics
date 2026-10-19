import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'gdp' | 'industry' | 'prices' | 'retail';

interface Params {
  context: Context;
  /** The year the base index is 100. */
  baseYear: number;
  /** Year-on-year changes for the following years, in tenths of a per cent (32 = +3.2 %). */
  tenths: number[];
}

/** Index points to 2 decimals; 0.02 covers a student who rounds each year's index to 2 decimals. */
const INDEX = { tolerance: 0.02, relTolerance: 0 } as const;

/** Lowest and highest yearly change in tenths of a per cent, by context. */
const RANGE: Record<Context, [number, number]> = {
  gdp: [-40, 70],
  industry: [-60, 90],
  prices: [5, 120],
  retail: [-30, 100],
};

const rates = (p: Params) => p.tenths.map((t) => t / 10);
const factors = (p: Params) => p.tenths.map((t) => 1 + t / 1000);
/** Base index of each year after the base year, unrounded. */
const baseIndices = (p: Params) => {
  let level = 100;
  return factors(p).map((f) => {
    level *= f;
    return level;
  });
};
const lastYear = (p: Params) => p.baseYear + p.tenths.length;
const target = (p: Params) => round(baseIndices(p).at(-1) ?? 100, 2);

const signed = (x: number) => (x > 0 ? `+${x.toFixed(1)}` : x.toFixed(1));
/** A signed rate for plain text, with a real minus sign. */
const plain = (x: number) => signed(x).replace('-', '−');
const yearsText = (p: Params) => {
  const years = p.tenths.map((_, i) => p.baseYear + i + 1);
  return `${years.slice(0, -1).join(', ')} and ${years.at(-1)}`;
};

function subject(c: Context): string {
  switch (c) {
    case 'gdp':
      return "A country's real GDP";
    case 'industry':
      return "A region's industrial output";
    case 'prices':
      return 'The consumer price level';
    case 'retail':
      return 'The volume of retail sales';
  }
}

/** ST107, difficulty 1: base index for the last year from 3–5 yearly (chain) growth rates. */
export const baseIndexFromChainRates: Generator<Params> = {
  id: 'base-index-from-chain-rates',
  title: 'Base index from yearly growth rates',
  topicId: 'ST107',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['gdp', 'industry', 'prices', 'retail'] as const);
      const [lo, hi] = RANGE[context];
      const n = rng.int(3, 5);
      const tenths = Array.from({ length: n }, () => rng.int(lo, hi));
      if (tenths.includes(0)) continue;
      const baseYear = rng.int(2005, 2024 - n);
      const p = { context, baseYear, tenths };
      // Adding the rates must give a visibly different answer from multiplying the factors.
      const sumOfRates = 100 + rates(p).reduce((s, r) => s + r, 0);
      if (Math.abs(sumOfRates - target(p)) < 0.1) continue;
      return p;
    }
  },

  stem: (p) =>
    `${subject(p.context)} changed by ${rates(p)
      .map((r) => `$${signed(r)}\\%$`)
      .join(
        ', ',
      )} in ${yearsText(p)}, each year compared with the year before. Taking ${p.baseYear} $= 100$, find the base index for ${lastYear(p)}. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...INDEX }),

  steps(p) {
    const fs = factors(p);
    const levels = baseIndices(p);
    return [
      {
        text: 'Turn each growth rate into a chain index (growth factor).',
        latex: fs.map((f) => num(f, 3)).join(',\\ '),
        why: `The factor is 1 + rate ÷ 100: a change of ${plain(rates(p)[0] ?? 0)} % multiplies the level by ${num(fs[0] ?? 1, 3)}. A fall gives a factor below 1.`,
      },
      {
        text: 'Chain them year by year, starting from 100.',
        latex: levels.map((l, i) => `I_{${p.baseYear + i + 1}} = ${num(l, 2)}`).join(',\\quad '),
        why: 'Each base index is the previous year’s base index times that year’s factor, because each year’s growth applies to the level already reached.',
        result: target(p),
      },
      {
        text: 'Write the whole calculation in one line.',
        latex: `I_{${lastYear(p)}} = 100 \\times ${fs.map((f) => num(f, 3)).join(' \\times ')} = ${num(target(p), 2)}`,
        why: 'A base index is the product of all the chain indices since the base year; multiplying once avoids rounding along the way.',
        result: target(p),
      },
    ];
  },

  distractors(p) {
    const rs = rates(p);
    const sumR = rs.reduce((s, r) => s + r, 0);
    return cleanDistractors(
      target(p),
      [
        { value: round(100 + sumR, 2), mistakeCode: 'SUM_OF_RATES' },
        { value: round(100 + (rs.at(-1) ?? 0), 2), mistakeCode: 'LAST_CHAIN_ONLY' },
        { value: round(100 + sumR / rs.length, 2), mistakeCode: 'MEAN_CHAIN_INDEX' },
        { value: round(target(p) - 100, 2), mistakeCode: 'GROWTH_NOT_INDEX' },
      ],
      INDEX.tolerance,
      INDEX.relTolerance,
    );
  },
};
