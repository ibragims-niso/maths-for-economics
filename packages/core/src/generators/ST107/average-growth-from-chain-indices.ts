import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'gdp' | 'exports' | 'industry' | 'realWages';

interface Params {
  context: Context;
  /** The year before the first chain index. */
  startYear: number;
  /** Chain indices (previous year = 100) in tenths: 1040 = 104.0, 940 = 94.0. */
  tenths: number[];
}

/** Rates in per cent to 2 decimals; the arithmetic-mean trap is often only 0.05–0.3 points away. */
const RATE = { tolerance: 0.01, relTolerance: 0 } as const;

/** Lowest and highest yearly change in tenths of a per cent, by context. */
const RANGE: Record<Context, [number, number]> = {
  gdp: [-60, 90],
  exports: [-150, 200],
  industry: [-80, 110],
  realWages: [-50, 100],
};

const indices = (p: Params) => p.tenths.map((t) => t / 10);
const factors = (p: Params) => p.tenths.map((t) => t / 1000);
/** Product of the chain factors: the last base index ÷ 100. */
const total = (p: Params) => factors(p).reduce((s, f) => s * f, 1);
const meanFactor = (p: Params) => total(p) ** (1 / p.tenths.length);
const target = (p: Params) => round(100 * (meanFactor(p) - 1), 2);
const arithmetic = (p: Params) => indices(p).reduce((s, i) => s + (i - 100), 0) / p.tenths.length;

function subject(c: Context): string {
  switch (c) {
    case 'gdp':
      return "a country's real GDP";
    case 'exports':
      return "a country's export volume";
    case 'industry':
      return "a region's industrial output";
    case 'realWages':
      return 'the average real wage';
  }
}

/** ST107, difficulty 3: average yearly growth rate from 4–6 chain indices (geometric mean). */
export const averageGrowthFromChainIndices: Generator<Params> = {
  id: 'average-growth-from-chain-indices',
  title: 'Average growth from chain indices',
  topicId: 'ST107',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['gdp', 'exports', 'industry', 'realWages'] as const);
      const [lo, hi] = RANGE[context];
      const n = rng.int(4, 6);
      const tenths = Array.from({ length: n }, () => 1000 + rng.int(lo, hi));
      const p = { context, startYear: rng.int(2005, 2024 - n), tenths };
      // Years that differ clearly, a visible average, and an arithmetic mean that is a
      // different answer (it is never below the geometric one).
      if (Math.max(...tenths) - Math.min(...tenths) < 50) continue;
      if (Math.abs(target(p)) < 0.2) continue;
      if (round(arithmetic(p), 2) - target(p) < 0.03) continue;
      return p;
    }
  },

  stem(p) {
    const n = p.tenths.length;
    const first = p.startYear + 1;
    const last = p.startYear + n;
    return `The chain indices of ${subject(p.context)} (previous year $= 100$) for ${first}–${last} were $${indices(
      p,
    )
      .map((i) => i.toFixed(1))
      .join(
        ',\\ ',
      )}$. Find the average annual growth rate from ${p.startYear} to ${last}. Give your answer in per cent to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...RATE }),

  steps(p) {
    const n = p.tenths.length;
    const fs = factors(p);
    const last = p.startYear + n;
    return [
      {
        text: 'Multiply the chain factors to get the growth over the whole period.',
        latex: `${fs.map((f) => num(f, 3)).join(' \\times ')} = ${num(total(p), 6)}`,
        why: `The product of the chain indices is the base index of ${last} with ${p.startYear} = 100, divided by 100.`,
        result: round(total(p), 6),
      },
      {
        text: `Take the ${n}th root to get the average growth factor.`,
        latex: `\\bar{i} = ${num(total(p), 6)}^{1/${n}} = ${num(meanFactor(p), 6)}`,
        why: `The average factor is the one that, applied in each of the ${n} years, gives the same total growth. That is the geometric mean of the factors, not their arithmetic mean.`,
        result: round(meanFactor(p), 6),
      },
      {
        text: 'Subtract 1 and write it in per cent.',
        latex: `\\bar{g} = (${num(meanFactor(p), 6)} - 1) \\times 100 = ${num(target(p), 2)}\\%`,
        why: 'The growth rate is the part of the factor above 1.',
        result: target(p),
      },
    ];
  },

  distractors(p) {
    const n = p.tenths.length;
    return cleanDistractors(
      target(p),
      [
        { value: round(arithmetic(p), 2), mistakeCode: 'ARITHMETIC_MEAN_RATES' },
        { value: round((100 * (total(p) - 1)) / n, 2), mistakeCode: 'SIMPLE_AVERAGE' },
        { value: round(100 * meanFactor(p), 2), mistakeCode: 'AVERAGE_INDEX' },
      ],
      RATE.tolerance,
      RATE.relTolerance,
    );
  },
};
