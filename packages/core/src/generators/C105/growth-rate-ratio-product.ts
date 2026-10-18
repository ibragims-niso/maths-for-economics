import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'gdpPerPerson' | 'realWage' | 'nominalGdp' | 'revenue';

interface Params {
  context: Context;
  /** Growth rate of the first part (the top of a ratio), in per cent a year. */
  first: number;
  /** Growth rate of the second part (the bottom of a ratio), in per cent a year. */
  second: number;
}

interface Setup {
  /** Whether the variable is first/second or first × second. */
  kind: 'ratio' | 'product';
  /** Symbols of the two parts. */
  a: string;
  b: string;
  /** Growth rates of the two parts, in per cent with one decimal. */
  draw: (rng: Rng) => [number, number];
  /** The sentence giving the two growth rates and asking the question. */
  text: (first: string, second: string) => string;
}

const tenths = (rng: Rng, min: number, max: number) => rng.int(min * 10, max * 10) / 10;

const SETUP: Record<Context, Setup> = {
  gdpPerPerson: {
    kind: 'ratio',
    a: 'Y',
    b: 'N',
    draw: (rng) => [tenths(rng, 0.5, 7), tenths(rng, 0.1, 3.5)],
    text: (f, s) =>
      `A country's real GDP $Y$ is growing at an instantaneous rate of $${f}\\%$ a year and its population $N$ at $${s}\\%$ a year. At what rate is real GDP per person, $Y/N$, growing?`,
  },
  realWage: {
    kind: 'ratio',
    a: 'W',
    b: 'P',
    draw: (rng) => [tenths(rng, 1, 15), tenths(rng, 0.5, 12)],
    text: (f, s) =>
      `Nominal wages $W$ are growing at an instantaneous rate of $${f}\\%$ a year and the price level $P$ at $${s}\\%$ a year. At what rate is the real wage, $W/P$, growing?`,
  },
  nominalGdp: {
    kind: 'product',
    a: 'P',
    b: 'Y',
    draw: (rng) => [tenths(rng, 0.5, 10), tenths(rng, 0.5, 7)],
    text: (f, s) =>
      `The GDP price level $P$ is growing at an instantaneous rate of $${f}\\%$ a year and real GDP $Y$ at $${s}\\%$ a year. At what rate is nominal GDP, $P \\times Y$, growing?`,
  },
  revenue: {
    kind: 'product',
    a: 'P',
    b: 'Q',
    draw: (rng) => [tenths(rng, 0.5, 6), tenths(rng, 0.5, 10)],
    text: (f, s) =>
      `A firm raises its price $P$ at an instantaneous rate of $${f}\\%$ a year while the quantity it sells, $Q$, grows at $${s}\\%$ a year. At what rate is its revenue, $P \\times Q$, growing?`,
  },
};

const rate = (p: Params) =>
  round(SETUP[p.context].kind === 'ratio' ? p.first - p.second : p.first + p.second, 1);

/** Wrong answers from the usual mistakes: three for a ratio, two for a product. */
function wrongAnswers(p: Params) {
  if (SETUP[p.context].kind === 'ratio') {
    return cleanDistractors(rate(p), [
      { value: round(p.first + p.second, 1), mistakeCode: 'SWAPPED_OPERATION' },
      { value: round(p.first / p.second, 2), mistakeCode: 'LEVEL_RULE' },
      { value: round(p.second - p.first, 1), mistakeCode: 'REVERSED_DIFFERENCE' },
    ]);
  }
  return cleanDistractors(rate(p), [
    { value: round(p.first - p.second, 1), mistakeCode: 'SWAPPED_OPERATION' },
    { value: round(p.first * p.second, 2), mistakeCode: 'LEVEL_RULE' },
  ]);
}

/** C105, difficulty 1: growth rate of a ratio or product (GDP per person, real wage, nominal GDP, revenue). */
export const growthRateRatioProduct: Generator<Params> = {
  id: 'growth-rate-ratio-product',
  title: 'Growth rate of a ratio or product',
  topicId: 'C105',
  difficulty: 1,
  timeSec: 60,

  params(rng) {
    for (;;) {
      const context = rng.pick(['gdpPerPerson', 'realWage', 'nominalGdp', 'revenue'] as const);
      const [first, second] = SETUP[context].draw(rng);
      const p = { context, first, second };
      if (Math.abs(rate(p)) >= 0.2 && wrongAnswers(p).length >= 2) return p;
    }
  },

  stem: (p) =>
    `${SETUP[p.context].text(num(p.first, 1), num(p.second, 1))} Give the answer in per cent a year${SETUP[p.context].kind === 'ratio' ? ' (negative if it is falling)' : ''}.`,

  answer: (p) => ({ kind: 'numeric', value: rate(p), decimals: 1 }),

  steps(p) {
    const { kind, a, b } = SETUP[p.context];
    const ratio = kind === 'ratio';
    const whole = ratio ? `${a}/${b}` : `${a}${b}`;
    const op = ratio ? '-' : '+';
    return [
      {
        text: ratio ? 'Take logs of the ratio.' : 'Take logs of the product.',
        latex: `\\ln(${whole}) = \\ln ${a} ${op} \\ln ${b}`,
        why: ratio
          ? 'The log of a ratio is the log of the top minus the log of the bottom.'
          : 'The log of a product is the sum of the logs.',
      },
      {
        text: 'Differentiate both sides with respect to time.',
        latex: `g_{${whole}} = \\dfrac{\\dot ${a}}{${a}} ${op} \\dfrac{\\dot ${b}}{${b}} = g_${a} ${op} g_${b}`,
        why: 'By the chain rule the time derivative of ln x is ẋ/x, which is the growth rate of x.',
      },
      {
        text: 'Substitute the two growth rates.',
        latex: `g_{${whole}} = ${num(p.first, 1)} ${op} ${num(p.second, 1)} = ${num(rate(p), 1)}\\%`,
        why: ratio
          ? 'The top grows at one rate and the bottom at the other; the ratio grows at the difference.'
          : 'Both parts push the product up, so their growth rates add.',
        result: rate(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
