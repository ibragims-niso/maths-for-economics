import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Period {
  /** How the period is written in the question, e.g. "a 15-minute period". */
  text: string;
  /** Its length in the rate's unit, e.g. 15 minutes = 0.25 hours. */
  factor: number;
  /** The factor as LaTeX, e.g. "\tfrac{15}{60}". */
  frac: string;
  /** The same in words for the steps, e.g. "15 minutes is 15/60 of an hour". */
  why: string;
}

const minutes = (m: number): Period => ({
  text: `a ${m}-minute period`,
  factor: m / 60,
  frac: `\\tfrac{${m}}{60}`,
  why: `${m} minutes is ${m}/60 of an hour`,
});

const CONTEXTS = {
  bank: {
    rate: (r: number) => `Customers arrive at a bank branch at an average rate of $${r}$ per hour.`,
    things: 'customers arrive',
    one: 'customer arrives',
    rates: [6, 8, 9, 10, 12, 15, 18, 20, 24, 30],
    periods: [5, 10, 12, 15, 20, 30, 40, 45].map(minutes),
  },
  calls: {
    rate: (r: number) => `A call centre receives on average $${r}$ calls per hour.`,
    things: 'calls come in',
    one: 'call comes in',
    rates: [12, 15, 18, 20, 24, 30, 36, 40, 45, 48],
    periods: [2, 3, 4, 5, 6, 10, 12, 15].map(minutes),
  },
  claims: {
    rate: (r: number) =>
      `A small insurer receives on average $${r}$ large claims per month, at random times.`,
    things: 'large claims arrive',
    one: 'large claim arrives',
    rates: [1.5, 2, 2.5, 3, 4, 5],
    periods: [
      { text: 'half a month', factor: 0.5, frac: '0.5', why: 'the period is 0.5 months long' },
      { text: 'two months', factor: 2, frac: '2', why: 'the period is 2 months long' },
      { text: 'a quarter (three months)', factor: 3, frac: '3', why: 'a quarter is 3 months long' },
    ],
  },
  cable: {
    rate: (r: number) =>
      `A factory's copper cable has on average $${r}$ flaws per $100$ metres, at random places.`,
    things: 'flaws are found',
    one: 'flaw is found',
    rates: [1, 2, 3, 4, 5, 6, 8],
    periods: [20, 25, 40, 50, 60, 150, 200].map((m) => ({
      text: `a $${m}$-metre length of cable`,
      factor: m / 100,
      frac: `\\tfrac{${m}}{100}`,
      why: `${m} metres is ${m}/100 of the 100 metres the rate is given for`,
    })),
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  /** Average count per unit (per hour, per month, per 100 m). */
  rate: number;
  /** Index into the context's list of periods. */
  period: number;
  /** P(X = k) or P(X ≥ 1). */
  mode: 'exact' | 'atLeastOne';
  /** The count asked about in 'exact' mode (2 or more). */
  k: number;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

export function factorial(k: number): number {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return f;
}

/** Decimal places that show x (0 < x < 1) to 6 significant figures, at least 4. */
const sigDecimals = (x: number) => Math.max(4, 5 - Math.floor(Math.log10(x)));

/** P(X = k) for X ~ Poisson(λ). */
export const poisson = (lambda: number, k: number) =>
  (Math.exp(-lambda) * lambda ** k) / factorial(k);

const periodOf = (p: Params): Period => {
  const period = CONTEXTS[p.context].periods[p.period];
  if (!period) throw new Error('no such period');
  return period;
};

/** λ for the period asked about, kept to 2 decimals so it prints exactly. */
export const lambdaOf = (p: Params) => round(p.rate * periodOf(p).factor, 2);

const exact = (p: Params) =>
  p.mode === 'exact' ? poisson(lambdaOf(p), p.k) : 1 - Math.exp(-lambdaOf(p));

/** Values a student gets from the common mistakes (values that round to 0 are dropped). */
function wrongAnswers(p: Params) {
  const lambda = lambdaOf(p);
  const candidates =
    p.mode === 'exact'
      ? [
          { value: round(poisson(p.rate, p.k), 4), mistakeCode: 'RATE_NOT_SCALED' },
          { value: round(lambda ** p.k / factorial(p.k), 4), mistakeCode: 'NO_EXP' },
          { value: round(Math.exp(-lambda) * lambda ** p.k, 4), mistakeCode: 'NO_FACTORIAL' },
        ]
      : [
          { value: round(1 - Math.exp(-p.rate), 4), mistakeCode: 'RATE_NOT_SCALED' },
          { value: round(Math.exp(-lambda), 4), mistakeCode: 'NOT_COMPLEMENT' },
          { value: round(lambda * Math.exp(-lambda), 4), mistakeCode: 'EXACT_ONLY' },
        ];
  return cleanDistractors(
    round(exact(p), 4),
    candidates.filter((d) => d.value > 0),
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** ST104, difficulty 2: Poisson P(X = k) or P(X ≥ 1) after rescaling the average rate to the period asked about. */
export const poissonArrivalsProbability: Generator<Params> = {
  id: 'poisson-arrivals-probability',
  title: 'Poisson arrivals in a period',
  topicId: 'ST104',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const c = CONTEXTS[context];
      const rate = rng.pick(c.rates);
      const period = rng.int(0, c.periods.length - 1);
      const mode = rng.pick(['exact', 'exact', 'atLeastOne'] as const);
      const p: Params = { context, rate, period, mode, k: rng.int(2, 7) };
      const lambda = rate * (c.periods[period]?.factor ?? 1);
      // λ with at most one decimal, small enough that the counts stay readable.
      if (Math.abs(lambda * 10 - Math.round(lambda * 10)) > 1e-9) continue;
      if (lambda < 0.5 || lambda > (mode === 'exact' ? 8 : 4)) continue;
      const value = exact(p);
      if (value < 0.01 || wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    const ask =
      p.mode === 'exact'
        ? `exactly $${p.k}$ ${c.things} in ${periodOf(p).text}`
        : `at least one ${c.one} in ${periodOf(p).text}`;
    return `${c.rate(p.rate)} Assuming a Poisson distribution, what is the probability that ${ask}? Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(exact(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const period = periodOf(p);
    const lambda = lambdaOf(p);
    const answer = round(exact(p), 4);
    const scale = {
      text: 'Rescale the average rate to the period in the question.',
      latex: `\\lambda = ${num(p.rate)} \\times ${period.frac} = ${num(lambda)}`,
      why: `The mean count grows in proportion to the length of the interval, and ${period.why}.`,
      result: lambda,
    };
    if (p.mode === 'exact') {
      const top = lambda ** p.k;
      return [
        scale,
        {
          text: `Apply the Poisson formula with k = ${p.k}.`,
          latex: `P(X = ${p.k}) = \\dfrac{e^{-${num(lambda)}}\\,${num(lambda)}^{${p.k}}}{${p.k}!}`,
          why: 'Counts of independent events at a steady average rate follow the Poisson distribution with mean λ.',
        },
        {
          text: 'Work out the pieces and divide.',
          latex: `\\dfrac{${num(Math.exp(-lambda), sigDecimals(Math.exp(-lambda)))} \\times ${num(top, 4)}}{${factorial(p.k)}} = ${num(answer, 4)}`,
          why: `e^(−λ) is the chance of no events at all; λ^k/k! counts the ways k events can happen, with k! = ${factorial(p.k)} removing their order.`,
          result: answer,
        },
      ];
    }
    const none = Math.exp(-lambda);
    return [
      scale,
      {
        text: 'Find the probability of no events at all.',
        latex: `P(X = 0) = \\dfrac{e^{-${num(lambda)}}\\,${num(lambda)}^{0}}{0!} = e^{-${num(lambda)}} = ${num(none, 4)}`,
        why: 'λ⁰ = 1 and 0! = 1, so only e^(−λ) is left.',
        result: round(none, 4),
      },
      {
        text: 'Use the complement.',
        latex: `P(X \\ge 1) = 1 - e^{-${num(lambda)}} = ${num(answer, 4)}`,
        why: '"At least one" is everything except "none", and adding up P(X = 1), P(X = 2), … would never end.',
        result: answer,
      },
    ];
  },

  distractors: wrongAnswers,
};
