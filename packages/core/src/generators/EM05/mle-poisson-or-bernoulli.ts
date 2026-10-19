import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Count data for a Poisson rate λ. */
type CountContext = 'branch' | 'claims' | 'orders';
/** Yes/no data for a Bernoulli probability p. */
type ShareContext = 'loans' | 'cars' | 'exporters';

type Params =
  | {
      model: 'poisson';
      context: CountContext;
      /** The observed counts, one per period (small whole numbers). */
      x: number[];
    }
  | {
      model: 'bernoulli';
      context: ShareContext;
      /** Number of independent trials (loans, households, firms). */
      n: number;
      /** Number of "successes" among them (defaults, car purchases, exporters). */
      k: number;
    };

/** λ̂ is asked to 2 decimal places, p̂ to 3. */
const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;
const THREE_DP = { tolerance: 0.001, relTolerance: 0 } as const;

const COUNT_TEXT: Readonly<Record<CountContext, (n: number) => string>> = {
  branch: (n) =>
    `A bank branch counts the customers who arrive in the first 10 minutes after opening on ${n} days`,
  claims: (n) => `An insurer counts the car-damage claims it receives per day on ${n} days`,
  orders: (n) =>
    `A small online shop records the number of orders it receives per hour over ${n} hours`,
};

const COUNT_UNIT: Readonly<Record<CountContext, string>> = {
  branch: 'customers per 10 minutes',
  claims: 'claims per day',
  orders: 'orders per hour',
};

const SHARE_TEXT: Readonly<
  Record<ShareContext, { stem: (n: number, k: number) => string; what: string }>
> = {
  loans: {
    stem: (n, k) => `Of ${n} small-business loans that a bank made, ${k} defaulted within a year.`,
    what: 'the same default probability $p$',
  },
  cars: {
    stem: (n, k) => `In a survey of ${n} households, ${k} bought a car in the past year.`,
    what: 'the same probability $p$ that a household buys a car in a year',
  },
  exporters: {
    stem: (n, k) =>
      `Of ${n} manufacturing firms in a survey, ${k} sell some of their output abroad.`,
    what: 'the same probability $p$ that a firm exports',
  },
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** The sample median: the middle value, or the average of the two middle values. */
export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? (s[m] ?? 0) : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2;
}

const target = (p: Params) =>
  p.model === 'poisson' ? round(sum(p.x) / p.x.length, 2) : round(p.k / p.n, 3);
const tolOf = (p: Params) => (p.model === 'poisson' ? TWO_DP : THREE_DP);

function candidates(p: Params): Distractor[] {
  if (p.model === 'poisson') {
    const s = sum(p.x);
    return [
      { value: median(p.x), mistakeCode: 'MEDIAN_NOT_MEAN' },
      { value: s, mistakeCode: 'SUM_NOT_MEAN' },
      { value: round(s / (p.x.length - 1), 2), mistakeCode: 'DIVISOR_N_MINUS_1' },
    ];
  }
  return [
    { value: round((p.k + 1) / (p.n + 2), 3), mistakeCode: 'ADD_ONE_SMOOTHING' },
    { value: round((p.n - p.k) / p.n, 3), mistakeCode: 'FAILURE_SHARE' },
    { value: p.k, mistakeCode: 'SUM_NOT_MEAN' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), tolOf(p).tolerance, tolOf(p).relTolerance);

/** True when num/den sits exactly on a rounding tie at `dp` decimals (…5 in the next place). */
const isTie = (num: number, den: number, dp: number) => ((num * 10 ** dp) % den) * 2 === den;

/** EM05, difficulty 1: the MLE of a Poisson rate (λ̂ = x̄) or of a Bernoulli probability (p̂ = k/n). */
export const mlePoissonOrBernoulli: Generator<Params> = {
  id: 'mle-poisson-or-bernoulli',
  title: 'MLE of a rate or a probability',
  topicId: 'EM05',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      if (rng.next() < 0.5) {
        const n = rng.pick([5, 6, 7, 8, 10]);
        const lam = rng.int(1, 8);
        const x = Array.from({ length: n }, () => Math.max(0, lam + rng.int(-3, 3)));
        const p: Params = {
          model: 'poisson',
          context: rng.pick(['branch', 'claims', 'orders'] as const),
          x,
        };
        if (new Set(x).size < 3 || sum(x) === 0) continue;
        if (isTie(sum(x), n, 2)) continue;
        if (kept(p).length === 3) return p;
      } else {
        const n = rng.pick([20, 25, 40, 50, 60, 80, 100, 120, 150, 200, 250, 400, 500]);
        const k = rng.int(2, Math.floor(0.45 * n));
        const p: Params = {
          model: 'bernoulli',
          context: rng.pick(['loans', 'cars', 'exporters'] as const),
          n,
          k,
        };
        if (isTie(k, n, 3)) continue;
        if (kept(p).length === 3) return p;
      }
    }
  },

  stem(p) {
    if (p.model === 'poisson') {
      const list = p.x.map((v) => num(v)).join(',\\ ');
      return `${COUNT_TEXT[p.context](p.x.length)}: $${list}$. Assuming the counts are independent draws from a Poisson distribution with rate $\\lambda$, find the maximum likelihood estimate $\\hat\\lambda$. Give your answer to 2 decimal places.`;
    }
    const s = SHARE_TEXT[p.context];
    return `${s.stem(p.n, p.k)} Treating each as an independent yes/no (Bernoulli) outcome, with ${s.what}, find the maximum likelihood estimate $\\hat p$. Give your answer to 3 decimal places.`;
  },

  answer: (p) => ({
    kind: 'numeric',
    value: target(p),
    decimals: p.model === 'poisson' ? 2 : 3,
    ...tolOf(p),
  }),

  steps(p): Step[] {
    if (p.model === 'poisson') {
      const n = p.x.length;
      const s = sum(p.x);
      const lam = target(p);
      return [
        {
          text: 'Write the log-likelihood and add up the counts.',
          latex: `\\ell(\\lambda) = \\sum_{i=1}^{${n}} \\left(-\\lambda + x_i \\ln\\lambda - \\ln x_i!\\right) = -${n}\\lambda + ${s}\\ln\\lambda - \\text{const}, \\qquad \\sum x_i = ${p.x.map((v) => num(v)).join(' + ')} = ${s}`,
          why: 'Each count has probability e^(−λ)λ^x/x!, and independence multiplies them; the log turns the product into a sum. The terms ln xᵢ! do not contain λ, so they do not affect where the maximum is.',
          result: s,
        },
        {
          text: 'Set the derivative to zero and solve.',
          latex: `\\ell'(\\lambda) = -${n} + \\dfrac{${s}}{\\lambda} = 0 \\;\\Rightarrow\\; \\hat\\lambda = \\dfrac{${s}}{${n}} = ${num(lam, 2)}`,
          why: `At the top of the log-likelihood its slope is zero. The estimate is the sample mean x̄: the Poisson rate is the mean count, ${COUNT_UNIT[p.context]}.`,
          result: lam,
        },
        {
          text: 'Check that it is a maximum.',
          latex: `\\ell''(\\lambda) = -\\dfrac{${s}}{\\lambda^2} < 0`,
          why: 'The second derivative is negative for every λ > 0, so the log-likelihood is concave and the stationary point is its highest point (C109).',
        },
      ];
    }
    const { n, k } = p;
    const share = target(p);
    return [
      {
        text: 'Write the log-likelihood.',
        latex: `\\ell(p) = k\\ln p + (n - k)\\ln(1 - p) = ${k}\\ln p + ${n - k}\\ln(1 - p)`,
        why: `Each of the ${k} "yes" outcomes has probability p and each of the ${n - k} "no" outcomes 1 − p; independence multiplies them, and the log turns the product into a sum.`,
      },
      {
        text: 'Set the derivative to zero and solve.',
        latex: `\\ell'(p) = \\dfrac{${k}}{p} - \\dfrac{${n - k}}{1 - p} = 0 \\;\\Rightarrow\\; ${k}(1 - p) = ${n - k}\\,p \\;\\Rightarrow\\; \\hat p = \\dfrac{${k}}{${n}} = ${num(share, 3)}`,
        why: 'At the top of the log-likelihood its slope is zero. Solving gives the share of "yes" outcomes in the sample, k/n.',
        result: share,
      },
      {
        text: 'Check that it is a maximum.',
        latex: `\\ell''(p) = -\\dfrac{${k}}{p^2} - \\dfrac{${n - k}}{(1 - p)^2} < 0`,
        why: 'Both terms are negative for every p between 0 and 1, so the log-likelihood is concave and the stationary point is its highest point (C109).',
      },
    ];
  },

  distractors: (p) => kept(p),
};
