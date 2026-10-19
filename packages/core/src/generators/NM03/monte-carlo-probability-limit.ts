import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'bank' | 'pension' | 'project';

interface Params {
  context: Context;
  /** Number of simulated scenarios; k/N then has at most 4 decimals. */
  scenarios: number;
  /** Scenarios in which the bad event happened. */
  hits: number;
  /** Which end of the 95 % confidence interval is asked for. */
  side: 'upper' | 'lower';
}

/** A probability to 4 decimals; small rounding slips in the standard error are forgiven. */
const PROB = { tolerance: 0.0002, relTolerance: 0 } as const;
const Z95 = 1.96;

export const pHat = (p: Params) => p.hits / p.scenarios;
/** SE(p̂) = √(p̂(1 − p̂)/N). */
export const standardError = (p: Params) => Math.sqrt((pHat(p) * (1 - pHat(p))) / p.scenarios);
const sign = (p: Params) => (p.side === 'upper' ? 1 : -1);
export const limit = (p: Params) => round(pHat(p) + sign(p) * Z95 * standardError(p), 4);

function candidates(p: Params) {
  const ph = pHat(p);
  const s = sign(p);
  return [
    {
      value: round(ph + s * Z95 * ((ph * (1 - ph)) / p.scenarios), 4),
      mistakeCode: 'NO_SQUARE_ROOT',
    },
    { value: round(ph + s * standardError(p), 4), mistakeCode: 'FORGOT_Z' },
    { value: round(ph + s * Z95 * Math.sqrt(ph * (1 - ph)), 4), mistakeCode: 'SD_NOT_SE' },
  ].filter((d) => d.value >= 0 && d.value <= 1);
}

const STORY: Record<Context, string> = {
  bank: 'In a stress test, a bank simulates its losses under {N} economic scenarios. In {k} of them its capital ratio falls below the regulatory minimum. Estimate the probability of such a breach',
  pension:
    'A pension fund simulates {N} possible paths of returns over the next 20 years. In {k} of them it cannot pay the promised pensions in full. Estimate the probability of a shortfall',
  project:
    "A firm simulates a project's net present value {N} times with uncertain prices and costs. In {k} of the runs the NPV is negative. Estimate the probability that the project loses money",
};

/** NM03, difficulty 3: a Monte Carlo probability estimate and one end of its 95 % confidence interval. */
export const monteCarloProbabilityLimit: Generator<Params> = {
  id: 'monte-carlo-probability-limit',
  title: 'Confidence interval for a simulated probability',
  topicId: 'NM03',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['bank', 'pension', 'project'] as const);
      const scenarios = rng.pick([1000, 2000, 2500, 5000, 10000] as const);
      const share = rng.int(10, 300) / 1000;
      const hits = Math.round(share * scenarios);
      const p: Params = { context, scenarios, hits, side: rng.pick(['upper', 'lower'] as const) };
      if (hits < 10 || hits > scenarios / 3) continue;
      if (cleanDistractors(limit(p), candidates(p), PROB.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) => {
    const story = STORY[p.context].replace('{N}', num(p.scenarios)).replace('{k}', num(p.hits));
    return `${story} and give the ${p.side} limit of a 95 % confidence interval for it, using $z = 1.96$. Give your answer as a probability to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: limit(p), decimals: 4, ...PROB }),

  steps(p) {
    const ph = pHat(p);
    const se = standardError(p);
    const op = p.side === 'upper' ? '+' : '-';
    return [
      {
        text: 'Estimate the probability by the share of scenarios in which the event happened.',
        latex: `\\hat p = \\dfrac{${num(p.hits)}}{${num(p.scenarios)}} = ${num(ph, 4)}`,
        why: 'A probability is the expected value of a 0/1 indicator, so its Monte Carlo estimate is the average of the indicators: the share of hits.',
        result: ph,
      },
      {
        text: 'Compute the standard error of the estimate.',
        latex: `\\text{SE} = \\sqrt{\\dfrac{\\hat p(1 - \\hat p)}{N}} = \\sqrt{\\dfrac{${num(ph, 4)} \\times ${num(1 - ph, 4)}}{${num(p.scenarios)}}} = ${num(se, 6)}`,
        why: 'Each scenario is a 0/1 draw with variance p(1 − p); averaging N independent draws divides the variance by N, so the standard deviation by √N.',
        result: se,
      },
      {
        text: `Go 1.96 standard errors ${p.side === 'upper' ? 'up' : 'down'} from the estimate.`,
        latex: `\\hat p ${op} 1.96 \\times \\text{SE} = ${num(ph, 4)} ${op} 1.96 \\times ${num(se, 6)} = ${num(limit(p), 4)}`,
        why: 'With thousands of scenarios the estimate is approximately normal (central limit theorem), so it lies within 1.96 standard errors of the true probability in 95 % of runs.',
        result: limit(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(limit(p), candidates(p), PROB.tolerance, 0),
};
