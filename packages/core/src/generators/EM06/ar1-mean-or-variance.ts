import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'inflation' | 'growth' | 'inventory';

interface Params {
  context: Context;
  /** Which moment the student must find. */
  ask: 'mean' | 'variance';
  /** The persistence φ in y(t) = c + φ·y(t − 1) + ε(t), in hundredths (60 means 0.6). */
  phiPct: number;
  /** The intercept c, in tenths (12 means 1.2). */
  cTenths: number;
  /** The standard deviation σ of the white-noise shocks. */
  sigma: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;

interface Setting {
  /** The series' symbol in LaTeX. */
  symbol: string;
  /** What the series is, as the start of a sentence. */
  text: string;
  phis: readonly number[];
  cTenths: [number, number];
  sigmas: readonly number[];
}

const SETTINGS: Record<Context, Setting> = {
  inflation: {
    symbol: '\\pi',
    text: 'Annual inflation $\\pi_t$ (in %)',
    phis: [30, 40, 50, 60, 70, 75, 80, 85, 90],
    cTenths: [3, 25],
    sigmas: [0.5, 0.8, 1.2, 1.5, 2],
  },
  growth: {
    symbol: 'g',
    text: 'Quarterly GDP growth $g_t$ (annualised, in %)',
    phis: [20, 25, 30, 35, 40, 50, 60],
    cTenths: [5, 25],
    sigmas: [1.5, 2, 2.5, 3],
  },
  inventory: {
    symbol: 'y',
    text: "The monthly change in a retailer's inventories $y_t$ (in thousand units)",
    phis: [-60, -50, -40, -30, -25, -20],
    cTenths: [20, 120],
    sigmas: [2, 3, 4, 5],
  },
};

const phi = (p: Params) => p.phiPct / 100;
const intercept = (p: Params) => p.cTenths / 10;
/** μ = c/(1 − φ), the long-run mean. */
const meanExact = (p: Params) => intercept(p) / (1 - phi(p));
/** γ₀ = σ²/(1 − φ²), the long-run variance. */
const varianceExact = (p: Params) => p.sigma ** 2 / (1 - phi(p) ** 2);
const value = (p: Params) => round(p.ask === 'mean' ? meanExact(p) : varianceExact(p), 2);

const candidates = (p: Params) =>
  p.ask === 'mean'
    ? [
        { value: intercept(p), mistakeCode: 'IGNORED_PERSISTENCE' },
        { value: round(intercept(p) / (1 + phi(p)), 2), mistakeCode: 'MEAN_DENOM_SIGN' },
        { value: round(intercept(p) * (1 - phi(p)), 2), mistakeCode: 'MEAN_MULTIPLIED' },
      ]
    : [
        { value: round(p.sigma ** 2, 2), mistakeCode: 'IGNORED_PERSISTENCE' },
        { value: round(p.sigma ** 2 / (1 - phi(p)), 2), mistakeCode: 'PHI_NOT_SQUARED' },
        { value: round(p.sigma / (1 - phi(p) ** 2), 2), mistakeCode: 'SIGMA_NOT_SQUARED' },
      ];

/** "c + φ·y(t − 1)" written naturally, with a minus sign for a negative φ. */
function model(p: Params): string {
  const s = SETTINGS[p.context].symbol;
  const sign = p.phiPct < 0 ? '-' : '+';
  return `${s}_t = ${num(intercept(p))} ${sign} ${num(Math.abs(phi(p)))}\\,${s}_{t-1} + \\varepsilon_t`;
}

/** EM06, difficulty 1: the long-run mean c/(1 − φ) or variance σ²/(1 − φ²) of a stationary AR(1). */
export const ar1MeanOrVariance: Generator<Params> = {
  id: 'ar1-mean-or-variance',
  title: 'AR(1) mean or variance',
  topicId: 'EM06',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['inflation', 'growth', 'inventory'] as const);
      const setting = SETTINGS[context];
      const ask = rng.pick(['mean', 'variance'] as const);
      const phiPct = rng.pick(setting.phis);
      const cTenths = rng.int(...setting.cTenths);
      const sigma = rng.pick(setting.sigmas);
      const p: Params = { context, ask, phiPct, cTenths, sigma };
      // An inflation rate or growth rate that is believable on average.
      const mu = meanExact(p);
      if (context !== 'inventory' && (mu < 1 || mu > 12)) continue;
      const kept = cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const s = SETTINGS[p.context].symbol;
    const question =
      p.ask === 'mean'
        ? `What is its long-run mean $E[${s}_t]$?`
        : `What is its variance $\\operatorname{Var}(${s}_t)$?`;
    return `${SETTINGS[p.context].text} follows the AR(1) model $${model(p)}$, where $\\varepsilon_t$ is white noise with standard deviation $\\sigma = ${num(p.sigma)}$. The process is stationary. ${question} Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const f = num(phi(p));
    const fb = p.phiPct < 0 ? `(${f})` : f;
    const check = {
      text: 'Check that the process is stationary.',
      latex: `|\\varphi| = ${num(Math.abs(phi(p)))} < 1`,
      why: 'Only with |φ| < 1 do old shocks fade away, so that the mean and the variance are the same in every period and can be found from one equation.',
    };
    if (p.ask === 'mean') {
      return [
        check,
        {
          text: 'Take expectations of both sides.',
          latex: `\\mu = c + \\varphi\\,\\mu \\;\\Rightarrow\\; \\mu\\,(1 - \\varphi) = c, \\qquad 1 - \\varphi = 1 - ${fb} = ${num(1 - phi(p))}`,
          why: 'The shock has mean 0, and stationarity means y(t) and y(t − 1) have the same mean μ, just like the steady state y* = a·y* + b of a difference equation.',
          result: 1 - phi(p),
        },
        {
          text: 'Divide the intercept by 1 − φ.',
          latex: `\\mu = \\dfrac{c}{1 - \\varphi} = \\dfrac{${num(intercept(p))}}{${num(1 - phi(p))}} = ${num(value(p))}`,
          why: 'The intercept is added every period and each period keeps a share φ of the last value, so the long-run level is c times 1/(1 − φ), not c itself.',
          result: value(p),
        },
      ];
    }
    return [
      check,
      {
        text: 'Square the shock standard deviation.',
        latex: `\\sigma^2 = ${num(p.sigma)}^2 = ${num(p.sigma ** 2, 4)}`,
        why: 'The formula needs the variance of the shocks, σ², not their standard deviation σ.',
        result: p.sigma ** 2,
      },
      {
        text: 'Take variances of both sides.',
        latex: `\\gamma_0 = \\varphi^2\\gamma_0 + \\sigma^2 \\;\\Rightarrow\\; 1 - \\varphi^2 = 1 - ${fb}^2 = ${num(1 - phi(p) ** 2, 4)}`,
        why: 'The new shock is uncorrelated with the past value, so the variances simply add; multiplying y(t − 1) by φ multiplies its variance by φ², and stationarity makes both variances equal to γ₀.',
        result: 1 - phi(p) ** 2,
      },
      {
        text: 'Divide σ² by 1 − φ².',
        latex: `\\gamma_0 = \\dfrac{\\sigma^2}{1 - \\varphi^2} = \\dfrac{${num(p.sigma ** 2, 4)}}{${num(1 - phi(p) ** 2, 4)}} = ${num(value(p))}`,
        why: 'The value today carries the shocks of all past periods, each shrunk by a further φ, so the variance is larger than σ²; the closer |φ| is to 1, the larger it gets.',
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
