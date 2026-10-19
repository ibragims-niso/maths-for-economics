import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface PriceParams {
  context: 'price';
  /** Speed of adjustment λ in dp/dt = λ(D − S). */
  lambda: number;
  /** Demand D(p) = alpha − beta·p and supply S(p) = gamma + delta·p. */
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  /** The starting price (it does not affect the answer). */
  start: number;
  /** The share of the starting gap that must be closed, in per cent. */
  share: number;
}

interface CapitalParams {
  context: 'capital';
  /** Investment per year. */
  invest: number;
  /** Depreciation rate. */
  depreciation: number;
  /** The starting capital stock (it does not affect the answer). */
  start: number;
  share: number;
}

type Params = PriceParams | CapitalParams;

const TIME = { tolerance: 0.01, relTolerance: 0.002 } as const;
const SHARES = [50, 75, 80, 90, 95, 99] as const;
const LAMBDAS = [0.02, 0.05, 0.1, 0.2, 0.25, 0.5] as const;
const DEPRECIATION = [0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25] as const;

/** The coefficient a in dy/dt + a·y = b: λ(β + δ) for the price, the depreciation rate for capital. */
const rate = (p: Params) =>
  p.context === 'price' ? p.lambda * (p.beta + p.delta) : p.depreciation;
/** The fraction of the gap still left, q = 1 − share. */
const left = (p: Params) => (100 - p.share) / 100;
/** t = ln(1/q)/a: when e^(−at) has fallen to q. */
const time = (p: Params) => round(Math.log(1 / left(p)) / rate(p), 2);

const candidates = (p: Params) => [
  { value: round(1 / rate(p), 2), mistakeCode: 'NO_LOG' },
  { value: round(Math.log(1 / left(p)) * rate(p), 2), mistakeCode: 'RATE_TIMES_LOG' },
  { value: round(p.share / 100 / rate(p), 2), mistakeCode: 'LINEAR_CLOSING' },
  { value: round(Math.log(100 / p.share) / rate(p), 2), mistakeCode: 'CLOSED_VS_REMAINING' },
];

/** Supply as LaTeX, without a "0 +" when the intercept is zero. */
const supply = (p: PriceParams) => `${p.gamma === 0 ? '' : `${num(p.gamma)} + `}${num(p.delta)}p`;

function stem(p: Params): string {
  const ask =
    p.share === 50
      ? 'How long does it take until half of the starting gap to the steady state has closed?'
      : `How long does it take until $${p.share}\\%$ of the starting gap to the steady state has closed?`;
  if (p.context === 'price')
    return `In a market with demand $D(p) = ${num(p.alpha)} - ${num(p.beta)}p$ and supply $S(p) = ${supply(p)}$, the price rises when there is excess demand: $\\dfrac{dp}{dt} = ${num(p.lambda)}\\,\\big(D(p) - S(p)\\big)$, with time in months. The price starts at $p(0) = ${num(p.start)}$. ${ask} Give your answer in months to 2 decimal places.`;
  return `A firm invests $${num(p.invest)}$ a year and its capital wears out at the rate $${num(p.depreciation)}$ a year, so $\\dfrac{dK}{dt} = ${num(p.invest)} - ${num(p.depreciation)}K$. Capital starts at $K(0) = ${num(p.start)}$. ${ask} Give your answer in years to 2 decimal places.`;
}

/** DY03, difficulty 2: the time t = ln(1/q)/a for the gap to the steady state to shrink to a fraction q. */
export const odeGapClosingTime: Generator<Params> = {
  id: 'ode-gap-closing-time',
  title: 'Time to close the gap',
  topicId: 'DY03',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const share = rng.pick(SHARES);
      let p: Params;
      if (rng.int(0, 1) === 0) {
        const lambda = rng.pick(LAMBDAS);
        const beta = rng.int(1, 6);
        const delta = rng.int(1, 6);
        const pStar = rng.int(10, 60);
        const gamma = rng.int(0, 8) * 5;
        const alpha = gamma + pStar * (beta + delta);
        const start = pStar + rng.int(3, 20) * (rng.int(0, 1) === 0 ? -1 : 1);
        if (start <= 0 || alpha - beta * start <= 0) continue;
        p = { context: 'price', lambda, alpha, beta, gamma, delta, start, share };
      } else {
        const depreciation = rng.pick(DEPRECIATION);
        const steady = rng.int(10, 200) * 10;
        const invest = depreciation * steady;
        const start = steady + rng.int(-8, 8) * Math.round(steady / 10);
        if (Math.abs(invest * 100 - Math.round(invest * 100)) > 1e-6 || start <= 0) continue;
        if (start === steady) continue;
        p = { context: 'capital', invest: round(invest, 2), depreciation, start, share };
      }
      const a = rate(p);
      const t = time(p);
      if (a < 0.05 || a > 3 || t < 0.5 || t > 120) continue;
      const kept = cleanDistractors(t, candidates(p), TIME.tolerance, TIME.relTolerance);
      if (kept.length < (share === 50 ? 3 : 4)) continue;
      return p;
    }
  },

  stem,

  answer: (p) => ({ kind: 'numeric', value: time(p), decimals: 2, ...TIME }),

  steps(p) {
    const a = rate(p);
    const q = left(p);
    const first =
      p.context === 'price'
        ? {
            text: 'Write the equation as dp/dt + a·p = b and read off a.',
            latex: `\\dfrac{dp}{dt} = ${num(p.lambda)}\\big(${num(p.alpha - p.gamma)} - ${num(p.beta + p.delta)}p\\big) \\;\\Rightarrow\\; a = ${num(p.lambda)} \\cdot ${num(p.beta + p.delta)} = ${num(a, 4)}`,
            why: 'D − S = (α − γ) − (β + δ)p, so the price obeys dp/dt + λ(β + δ)p = λ(α − γ). The coefficient of p, a = λ(β + δ), sets the speed; the starting price and the steady state do not.',
            result: a,
          }
        : {
            text: 'Read off a from dK/dt + a·K = I.',
            latex: `\\dfrac{dK}{dt} + ${num(p.depreciation)}K = ${num(p.invest)} \\;\\Rightarrow\\; a = ${num(a, 4)}`,
            why: 'The coefficient of K, the depreciation rate, sets the speed at which the gap to the steady state closes; the investment and the starting capital do not.',
            result: a,
          };
    return [
      first,
      {
        text: `${p.share} % of the gap closed means ${100 - p.share} % of it is still left.`,
        latex: `e^{-${num(a, 4)}\\,t} = 1 - ${num(p.share / 100)} = ${num(q)}`,
        why: 'The gap y − y* is multiplied by e^(−at) after time t, so the share still left is e^(−at), and it must equal 1 minus the share that has closed.',
        result: q,
      },
      {
        text: 'Take natural logs and solve for t.',
        latex: `t = \\dfrac{\\ln(1/${num(q)})}{${num(a, 4)}} = \\dfrac{${num(Math.log(1 / q), 4)}}{${num(a, 4)}} = ${num(time(p))}`,
        why: 'ln(e^(−at)) = −at, so −at = ln q and t = ln(1/q)/a. For a half-life q = 0.5 and t = ln 2/a ≈ 0.693/a.',
        result: time(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(time(p), candidates(p), TIME.tolerance, TIME.relTolerance),
};
