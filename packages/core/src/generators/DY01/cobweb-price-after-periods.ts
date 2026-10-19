import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Demand Q = alpha − beta·P(t). */
  alpha: number;
  beta: number;
  /** Supply Q = gamma + delta·P(t − 1): farmers plant on last year's price. */
  gamma: number;
  delta: number;
  /** The price in year 0. */
  start: number;
  /** The crop, for the wording. */
  good: string;
  /** The year asked for. */
  n: number;
}

const PRICE = { tolerance: 0.01, relTolerance: 0.0005 } as const;
const BETAS = [2, 3, 4, 5] as const;
const DELTAS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6] as const;
const GOODS = ['potatoes', 'pork', 'onions', 'coffee beans', 'tomatoes'] as const;

/** m = δ/β; P(t) = b − m·P(t − 1). */
const ratio = (p: Params) => p.delta / p.beta;
const intercept = (p: Params) => (p.alpha - p.gamma) / p.beta;
/** The steady state P* = (α − γ)/(β + δ), where demand meets supply. */
const steady = (p: Params) => (p.alpha - p.gamma) / (p.beta + p.delta);
/** The general solution P(t) = P* + (P(0) − P*)·(−m)ᵗ. */
const priceAt = (p: Params, t: number) => steady(p) + (p.start - steady(p)) * (-ratio(p)) ** t;
const price = (p: Params) => round(priceAt(p, p.n), 2);
/** The path a student gets with +δ instead of −δ when solving for P(t). */
function plusSignPrice(p: Params): number {
  let x = p.start;
  for (let t = 0; t < p.n; t++) x = intercept(p) + ratio(p) * x;
  return x;
}

/** The supply side as LaTeX, without a "0 +" when the intercept is zero. */
const supply = (p: Params) => `${p.gamma === 0 ? '' : `${num(p.gamma)} + `}${num(p.delta)}P_{t-1}`;

const candidates = (p: Params) => [
  { value: round(steady(p), 2), mistakeCode: 'STEADY_STATE_ONLY' },
  { value: round(priceAt(p, p.n - 1), 2), mistakeCode: 'ONE_PERIOD_SHORT' },
  { value: round(plusSignPrice(p), 2), mistakeCode: 'SUPPLY_SIGN' },
];

/** DY01, difficulty 3: the price in year n of a cobweb market, from demand, lagged supply and P(0). */
export const cobwebPriceAfterPeriods: Generator<Params> = {
  id: 'cobweb-price-after-periods',
  title: 'Cobweb price after n years',
  topicId: 'DY01',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const beta = rng.pick(BETAS);
      const delta = rng.pick(DELTAS);
      const m = delta / beta;
      // δ/β with at most 2 decimals, between 0 and 1.5 and not exactly 1.
      if (Math.abs(m * 100 - Math.round(m * 100)) > 1e-9 || m > 1.5 || delta === beta) continue;
      const pStar = rng.int(10, 60);
      const gamma = rng.int(0, 8) * 5;
      const alpha = gamma + pStar * (beta + delta);
      if (!Number.isInteger(alpha)) continue;
      const k = rng.int(3, 12) * (rng.int(0, 1) === 0 ? -1 : 1);
      const n = rng.int(2, 3);
      const p = { alpha, beta, gamma, delta, start: pStar + k, n, good: rng.pick(GOODS) };
      // Every price and quantity on the way is positive.
      let ok = true;
      for (let t = 0; t <= n; t++) {
        const pt = priceAt(p, t);
        if (pt < 1 || alpha - beta * pt < 1) ok = false;
      }
      if (!ok) continue;
      if (cleanDistractors(price(p), candidates(p), PRICE.tolerance, PRICE.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) =>
    `In the market for ${p.good}, demand in year $t$ is $Q = ${num(p.alpha)} - ${num(p.beta)}P_t$. Farmers decide how much to grow from last year's price, so supply is $Q = ${supply(p)}$, and each year the price clears the market. In year 0 the price was $P_0 = ${num(p.start)}$. What is the price in year ${p.n}? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: price(p), decimals: 2, ...PRICE }),

  steps(p) {
    const m = num(ratio(p));
    const b = num(intercept(p), 4);
    const prices = Array.from({ length: p.n + 1 }, (_, t) => priceAt(p, t));
    const rounds = prices
      .slice(1)
      .map((x, i) => `P_${i + 1} = ${b} - ${m} \\cdot ${num(prices[i] ?? 0, 4)} = ${num(x, 4)}`)
      .join(', \\quad ');
    const gap = p.start - steady(p);
    const stable = ratio(p) < 1;
    return [
      {
        text: 'Clear the market and solve for this year’s price.',
        latex: `${num(p.alpha)} - ${num(p.beta)}P_t = ${supply(p)} \\;\\Rightarrow\\; P_t = ${b} - ${m}\\,P_{t-1}`,
        why: 'Supply is fixed by last year’s price, so this year’s price is whatever makes buyers take exactly that harvest. Moving δ·P(t − 1) across gives it a minus sign: a high price last year means a big harvest and a low price now.',
      },
      {
        text: 'Find the steady-state price.',
        latex: `P^* = \\dfrac{${num(p.alpha)} - ${num(p.gamma)}}{${num(p.beta)} + ${num(p.delta)}} = ${num(steady(p), 4)}`,
        why: 'At the steady state the price repeats, P(t) = P(t − 1) = P*, which is the ordinary equilibrium where demand meets supply.',
        result: steady(p),
      },
      {
        text: `Iterate ${p.n} times from P₀.`,
        latex: rounds,
        why: 'Each year’s price comes from the previous one by the rule in the first step; the prices jump from one side of P* to the other.',
        result: price(p),
      },
      {
        text: 'Check with the general solution.',
        latex: `P_{${p.n}} = ${num(steady(p), 4)} + (${num(gap, 4)})(-${m})^{${p.n}} = ${num(price(p))}`,
        why: stable
          ? `The factor is a = −δ/β = −${m}. It is negative, so the price oscillates, and |a| < 1, so the swings shrink and the price converges to P*.`
          : `The factor is a = −δ/β = −${m}. It is negative, so the price oscillates, and |a| > 1, so the swings grow: this market is unstable.`,
        result: price(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(price(p), candidates(p), PRICE.tolerance, PRICE.relTolerance),
};
