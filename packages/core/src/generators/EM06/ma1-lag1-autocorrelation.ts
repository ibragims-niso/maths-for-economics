import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'oil' | 'inflation' | 'returns';

interface Params {
  context: Context;
  /** The mean μ of the series. */
  mu: number;
  /** The MA coefficient θ in y(t) = μ + ε(t) + θ·ε(t − 1), in hundredths (50 means 0.5). */
  thetaPct: number;
  /** The standard deviation σ of the white-noise shocks. */
  sigma: number;
}

/** A correlation to 3 decimals: a tight absolute tolerance, no relative one. */
const CORR = { tolerance: 0.001, relTolerance: 0 } as const;

interface Setting {
  symbol: string;
  /** Why the series has a one-period memory, then the series itself. */
  text: string;
  mu: readonly number[];
  sigmas: readonly number[];
}

const SETTINGS: Record<Context, Setting> = {
  oil: {
    symbol: 'y',
    text: 'Each oil supply shock affects fuel prices over two months, so the monthly change in a fuel price index $y_t$ (in %)',
    mu: [0.2, 0.3, 0.4, 0.5],
    sigmas: [1.5, 2, 2.5, 3],
  },
  inflation: {
    symbol: '\\pi',
    text: 'Each price shock affects two quarters, so quarterly inflation $\\pi_t$ (in %)',
    mu: [0.5, 0.6, 0.8],
    sigmas: [0.4, 0.5, 0.6, 0.8],
  },
  returns: {
    symbol: 'r',
    text: 'News about a firm moves its share price over two days, so its daily share return $r_t$ (in %)',
    mu: [0.02, 0.04, 0.05],
    sigmas: [1.2, 1.5, 2, 2.5],
  },
};

const theta = (p: Params) => p.thetaPct / 100;
/** γ₁ = θσ², the autocovariance at lag 1. */
const gamma1 = (p: Params) => theta(p) * p.sigma ** 2;
/** γ₀ = σ²(1 + θ²), the variance. */
const gamma0 = (p: Params) => p.sigma ** 2 * (1 + theta(p) ** 2);
const value = (p: Params) => round(theta(p) / (1 + theta(p) ** 2), 3);

const candidates = (p: Params) => [
  { value: theta(p), mistakeCode: 'RHO_EQUALS_THETA' },
  { value: round(theta(p) ** 2, 3), mistakeCode: 'THETA_SQUARED' },
  { value: round(theta(p) / (1 - theta(p) ** 2), 3), mistakeCode: 'MA_DENOM_SIGN' },
  { value: round(gamma1(p), 3), mistakeCode: 'COVARIANCE_NOT_CORRELATION' },
];

/** EM06, difficulty 2: the lag-1 autocorrelation θ/(1 + θ²) of an MA(1) process. */
export const ma1Lag1Autocorrelation: Generator<Params> = {
  id: 'ma1-lag1-autocorrelation',
  title: 'MA(1) lag-1 autocorrelation',
  topicId: 'EM06',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['oil', 'inflation', 'returns'] as const);
      const s = SETTINGS[context];
      const mu = rng.pick(s.mu);
      const sign = rng.int(0, 3) === 0 ? -1 : 1;
      const thetaPct = sign * 5 * rng.int(4, 18);
      const sigma = rng.pick(s.sigmas);
      const p: Params = { context, mu, thetaPct, sigma };
      const kept = cleanDistractors(value(p), candidates(p), CORR.tolerance, CORR.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem(p) {
    const s = SETTINGS[p.context];
    const sign = p.thetaPct < 0 ? '-' : '+';
    return `${s.text} follows the MA(1) model $${s.symbol}_t = ${num(p.mu)} + \\varepsilon_t ${sign} ${num(Math.abs(theta(p)))}\\,\\varepsilon_{t-1}$, where $\\varepsilon_t$ is white noise with standard deviation $\\sigma = ${num(p.sigma)}$. What is the lag-1 autocorrelation, the correlation between $${s.symbol}_t$ and $${s.symbol}_{t-1}$? Give your answer to 3 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 3, ...CORR }),

  steps(p) {
    const t = num(theta(p));
    const tb = p.thetaPct < 0 ? `(${t})` : t;
    const s2 = num(p.sigma ** 2, 4);
    return [
      {
        text: 'Find the covariance of neighbouring values.',
        latex: `\\gamma_1 = \\operatorname{Cov}(\\varepsilon_t + \\theta\\varepsilon_{t-1},\\, \\varepsilon_{t-1} + \\theta\\varepsilon_{t-2}) = \\theta\\sigma^2 = ${tb} \\cdot ${s2} = ${num(gamma1(p), 4)}`,
        why: 'White-noise shocks are uncorrelated with each other, so the only term the two values share is ε(t − 1), which enters once with weight θ and once with weight 1.',
        result: gamma1(p),
      },
      {
        text: 'Find the variance.',
        latex: `\\gamma_0 = \\sigma^2(1 + \\theta^2) = ${s2} \\cdot (1 + ${tb}^2) = ${num(gamma0(p), 4)}`,
        why: 'The value is the sum of two uncorrelated shocks, with variances σ² and θ²σ², so the variances add. The mean μ shifts the series but does not affect any variance or covariance.',
        result: gamma0(p),
      },
      {
        text: 'Divide the covariance by the variance.',
        latex: `\\rho_1 = \\dfrac{\\gamma_1}{\\gamma_0} = \\dfrac{\\theta}{1 + \\theta^2} = \\dfrac{${num(gamma1(p), 4)}}{${num(gamma0(p), 4)}} = ${num(value(p), 3)}`,
        why: 'A correlation is the covariance scaled by the variance (both values have the same variance), so σ² cancels and the answer depends on θ only.',
        result: value(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(value(p), candidates(p), CORR.tolerance, CORR.relTolerance),
};
