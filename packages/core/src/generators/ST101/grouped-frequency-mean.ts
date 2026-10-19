import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'income' | 'firms' | 'houses';

interface Params {
  context: Context;
  /** Lower limit of the first class. */
  start: number;
  /** Width of every class. */
  width: number;
  /** How many observations fall in each class, from the lowest class up. */
  freqs: number[];
}

/** The mean is asked to 2 decimals; 0.01 covers rounding the last digit either way. */
const MEAN = { tolerance: 0.01, relTolerance: 0 } as const;

const total = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const lower = (p: Params, k: number) => p.start + k * p.width;
const midpoint = (p: Params, k: number) => lower(p, k) + p.width / 2;
const sumFm = (p: Params) => p.freqs.reduce((s, f, k) => s + f * midpoint(p, k), 0);
const exactMean = (p: Params) => sumFm(p) / total(p.freqs);
const target = (p: Params) => round(exactMean(p), 2);

const WORDS: Record<Context, { lead: string; variable: string; count: string; ask: string }> = {
  income: {
    lead: 'households were grouped by monthly income',
    variable: 'Income',
    count: 'Households',
    ask: 'the mean monthly household income',
  },
  firms: {
    lead: 'small firms in a region were grouped by their number of employees',
    variable: 'Employees',
    count: 'Firms',
    ask: 'the mean number of employees per firm',
  },
  houses: {
    lead: 'houses sold last year were grouped by price, in thousands',
    variable: 'Price',
    count: 'Houses',
    ask: 'the mean house price, in thousands',
  },
};

function tableLatex(p: Params): string {
  const w = WORDS[p.context];
  const classes = p.freqs.map((_, k) => `${lower(p, k)}\\text{–}${lower(p, k + 1)}`);
  return `\\begin{array}{l|${'c'.repeat(p.freqs.length)}} \\text{${w.variable}} & ${classes.join(' & ')} \\\\ \\hline \\text{${w.count}} & ${p.freqs.join(' & ')} \\end{array}`;
}

/** ST101, difficulty 2: the mean of grouped data, Σ f·m / Σ f with the class midpoints m. */
export const groupedFrequencyMean: Generator<Params> = {
  id: 'grouped-frequency-mean',
  title: 'Mean from a grouped frequency table',
  topicId: 'ST101',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    const context = rng.pick(['income', 'firms', 'houses'] as const);
    const width =
      context === 'income'
        ? rng.pick([200, 250, 300, 400, 500])
        : context === 'firms'
          ? rng.pick([10, 20, 25, 50])
          : rng.pick([25, 50, 100]);
    const start =
      context === 'income'
        ? rng.pick([0, width])
        : context === 'firms'
          ? 0
          : rng.pick([50, 100, 150]);
    const k = rng.int(4, 6);
    // The second or third class gets extra weight, as with incomes, firm sizes and house prices.
    const peak = rng.int(1, 2);
    const freqs = Array.from({ length: k }, (_, j) =>
      j === peak ? rng.int(40, 90) : rng.int(5, 45),
    );
    return { context, start, width, freqs };
  },

  stem(p) {
    const w = WORDS[p.context];
    return `In a survey, ${total(p.freqs)} ${w.lead}: $${tableLatex(p)}$ Each class includes its lower limit but not its upper one. Using the class midpoints, estimate ${w.ask}. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...MEAN }),

  steps(p) {
    const n = total(p.freqs);
    const s = sumFm(p);
    const mids = p.freqs.map((_, k) => num(midpoint(p, k)));
    return [
      {
        text: 'Find the midpoint of each class.',
        latex: `m = ${mids.join(',\\ ')}`,
        why: 'The table does not show the individual values, so each one is represented by the middle of its class.',
      },
      {
        text: 'Count the observations.',
        latex: `\\sum f = ${p.freqs.join(' + ')} = ${num(n)}`,
        why: 'The mean divides by the number of observations, not by the number of classes.',
        result: n,
      },
      {
        text: 'Multiply each midpoint by its frequency and add.',
        latex: `\\sum f m = ${p.freqs.map((f, k) => `${f} \\times ${mids[k]}`).join(' + ')} = ${num(s)}`,
        why: 'A class with f observations contributes f times its midpoint to the total.',
        result: s,
      },
      {
        text: 'Divide the total by the number of observations.',
        latex: `\\bar{x} \\approx \\frac{${num(s)}}{${num(n)}} = ${num(exactMean(p), 4)}`,
        why: 'This is the mean of the data set in which every value sits at its class midpoint, so it is an estimate of the true mean.',
        result: target(p),
      },
    ];
  },

  distractors(p) {
    const n = total(p.freqs);
    const k = p.freqs.length;
    const lowerTotal = p.freqs.reduce((s, f, j) => s + f * lower(p, j), 0);
    const midsMean = p.freqs.reduce((s, _, j) => s + midpoint(p, j), 0) / k;
    return cleanDistractors(
      target(p),
      [
        { value: round(lowerTotal / n, 2), mistakeCode: 'LOWER_LIMITS' },
        { value: round(midsMean, 2), mistakeCode: 'UNWEIGHTED_MIDPOINTS' },
        { value: round(sumFm(p) / k, 2), mistakeCode: 'DIVIDED_BY_CLASSES' },
      ],
      MEAN.tolerance,
      MEAN.relTolerance,
    );
  },
};
