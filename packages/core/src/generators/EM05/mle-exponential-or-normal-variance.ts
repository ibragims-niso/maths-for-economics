import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Waiting times for an exponential rate θ. */
type TimeContext = 'unemployment' | 'customers' | 'vans';
/** Measurements for the variance σ² of a normal distribution. */
type SpreadContext = 'returns' | 'wages' | 'growth';

type Params =
  | {
      model: 'exponential';
      context: TimeContext;
      /** The observed durations (whole numbers of months or minutes). */
      x: number[];
    }
  | {
      model: 'normal';
      context: SpreadContext;
      /** The observations (whole numbers whose mean is a whole number). */
      x: number[];
    };

/** θ̂ is asked to 3 decimal places, σ̂² to 2. */
const THREE_DP = { tolerance: 0.001, relTolerance: 0 } as const;
const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;

interface TimeSetting {
  range: [number, number];
  text: (n: number) => string;
  unit: string;
}

const TIMES: Readonly<Record<TimeContext, TimeSetting>> = {
  unemployment: {
    range: [1, 18],
    text: (n) =>
      `A labour-market survey follows ${n} workers who lost their jobs; they found new ones after these numbers of months`,
    unit: 'per month',
  },
  customers: {
    range: [1, 12],
    text: (n) =>
      `A shop records the minutes between ${n + 1} successive customer arrivals, giving ${n} gaps`,
    unit: 'per minute',
  },
  vans: {
    range: [2, 30],
    text: (n) =>
      `A delivery firm records how many months each of its ${n} new vans ran before its first breakdown`,
    unit: 'per month',
  },
};

interface SpreadSetting {
  range: [number, number];
  text: (n: number) => string;
}

const SPREADS: Readonly<Record<SpreadContext, SpreadSetting>> = {
  returns: {
    range: [-6, 16],
    text: (n) => `The annual returns of an investment fund over ${n} years, in %, were`,
  },
  wages: { range: [8, 26], text: (n) => `The hourly wages of ${n} shop assistants in a town are` },
  growth: {
    range: [-2, 9],
    text: (n) => `Last year's GDP growth rates of ${n} regions of a country, in %, were`,
  },
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** Σ(x − x̄)², a whole number because x̄ is a whole number. */
export const sumSquaresOf = (x: number[]) => {
  const m = sum(x) / x.length;
  return sum(x.map((v) => (v - m) ** 2));
};

const target = (p: Params) =>
  p.model === 'exponential'
    ? round(p.x.length / sum(p.x), 3)
    : round(sumSquaresOf(p.x) / p.x.length, 2);
const tolOf = (p: Params) => (p.model === 'exponential' ? THREE_DP : TWO_DP);

function candidates(p: Params): Distractor[] {
  const n = p.x.length;
  if (p.model === 'exponential') {
    const s = sum(p.x);
    return [
      { value: round(s / n, 3), mistakeCode: 'MEAN_NOT_RATE' },
      { value: round((n - 1) / s, 3), mistakeCode: 'DIVISOR_N_MINUS_1' },
      { value: round(1 / s, 3), mistakeCode: 'SUM_NOT_MEAN' },
    ];
  }
  const ss = sumSquaresOf(p.x);
  return [
    { value: round(ss / (n - 1), 2), mistakeCode: 'DIVISOR_N_MINUS_1' },
    { value: ss, mistakeCode: 'SS_NOT_DIVIDED' },
    { value: round(Math.sqrt(ss / n), 2), mistakeCode: 'SD_NOT_VARIANCE' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), tolOf(p).tolerance, tolOf(p).relTolerance);

/** True when num/den sits exactly on a rounding tie at `dp` decimals (…5 in the next place). */
const isTie = (num: number, den: number, dp: number) => ((num * 10 ** dp) % den) * 2 === den;

const paren = (v: number) => (v < 0 ? `(${num(v)})` : num(v));

/** EM05, difficulty 2: the MLE of an exponential rate (θ̂ = 1/x̄) or of a normal variance (σ̂² = Σ(x − x̄)²/n). */
export const mleExponentialOrNormalVariance: Generator<Params> = {
  id: 'mle-exponential-or-normal-variance',
  title: 'MLE of a waiting-time rate or a variance',
  topicId: 'EM05',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const n = rng.int(4, 6);
      if (rng.next() < 0.5) {
        const context = rng.pick(['unemployment', 'customers', 'vans'] as const);
        const [lo, hi] = TIMES[context].range;
        const x = Array.from({ length: n }, () => rng.int(lo, hi));
        const p: Params = { model: 'exponential', context, x };
        const s = sum(x);
        if (new Set(x).size < 3 || s < 2 * n) continue;
        if (isTie(n, s, 3)) continue;
        if (kept(p).length === 3) return p;
      } else {
        const context = rng.pick(['returns', 'wages', 'growth'] as const);
        const [lo, hi] = SPREADS[context].range;
        const x = Array.from({ length: n }, () => rng.int(lo, hi));
        const p: Params = { model: 'normal', context, x };
        if (new Set(x).size < 3 || sum(x) % n !== 0) continue;
        const ss = sumSquaresOf(x);
        if (ss > 300 || isTie(ss, n, 2)) continue;
        if (kept(p).length === 3) return p;
      }
    }
  },

  stem(p) {
    const list = p.x.map((v) => num(v)).join(',\\ ');
    if (p.model === 'exponential') {
      return `${TIMES[p.context].text(p.x.length)}: $${list}$. Assuming the durations are independent draws from an exponential distribution with density $f(x) = \\theta e^{-\\theta x}$, find the maximum likelihood estimate of the rate $\\theta$. Give your answer to 3 decimal places.`;
    }
    return `${SPREADS[p.context].text(p.x.length)} $${list}$. Assuming they are independent draws from a normal distribution $N(\\mu, \\sigma^2)$, find the maximum likelihood estimate $\\hat\\sigma^2$ of the variance. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({
    kind: 'numeric',
    value: target(p),
    decimals: p.model === 'exponential' ? 3 : 2,
    ...tolOf(p),
  }),

  steps(p): Step[] {
    const n = p.x.length;
    const s = sum(p.x);
    if (p.model === 'exponential') {
      const theta = target(p);
      return [
        {
          text: 'Write the log-likelihood and add up the durations.',
          latex: `\\ell(\\theta) = \\sum_{i=1}^{${n}} \\left(\\ln\\theta - \\theta x_i\\right) = ${n}\\ln\\theta - \\theta\\sum x_i, \\qquad \\sum x_i = ${p.x.map((v) => num(v)).join(' + ')} = ${s}`,
          why: 'Each duration has density θe^(−θx); independence multiplies them, and the log turns the product into a sum of n ln θ and −θ times the total time.',
          result: s,
        },
        {
          text: 'Set the derivative to zero and solve.',
          latex: `\\ell'(\\theta) = \\dfrac{${n}}{\\theta} - ${s} = 0 \\;\\Rightarrow\\; \\hat\\theta = \\dfrac{${n}}{${s}} = \\dfrac{1}{\\bar x} = ${num(theta, 3)}`,
          why: `The rate is one over the average duration. The average here is x̄ = ${num(s / n, 2)}, so the estimated rate is ${num(theta, 3)} ${TIMES[p.context].unit}: a long average wait means a low rate.`,
          result: theta,
        },
        {
          text: 'Check that it is a maximum.',
          latex: `\\ell''(\\theta) = -\\dfrac{${n}}{\\theta^2} < 0`,
          why: 'The second derivative is negative for every θ > 0, so the stationary point is the highest point of the log-likelihood.',
        },
      ];
    }
    const mean = s / n;
    const ss = sumSquaresOf(p.x);
    const v = target(p);
    return [
      {
        text: 'Estimate the mean first.',
        latex: `\\hat\\mu = \\bar x = \\dfrac{${s}}{${n}} = ${num(mean)}`,
        why: 'Setting the derivative of the log-likelihood with respect to μ to zero gives Σ(xᵢ − μ) = 0, so μ̂ is the sample mean, whatever σ² is.',
        result: mean,
      },
      {
        text: 'Add up the squared deviations from the mean.',
        latex: `\\sum (x_i - \\bar x)^2 = ${p.x.map((x) => `${paren(x - mean)}^2`).join(' + ')} = ${ss}`,
        why: 'The log-likelihood depends on the data only through n and this sum of squares once μ is replaced by x̄.',
        result: ss,
      },
      {
        text: 'Divide by n.',
        latex: `\\hat\\sigma^2 = \\dfrac{1}{n}\\sum (x_i - \\bar x)^2 = \\dfrac{${ss}}{${n}} = ${num(v)}`,
        why: `Setting the derivative with respect to σ², −n/(2σ²) + Σ(x − x̄)²/(2σ⁴), to zero gives the divisor n. It is a little smaller than the unbiased s² = ${ss}/${n - 1}, which divides by n − 1.`,
        result: v,
      },
    ];
  },

  distractors: (p) => kept(p),
};
