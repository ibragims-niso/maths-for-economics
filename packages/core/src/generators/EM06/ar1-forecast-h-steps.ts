import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'inflation' | 'growth' | 'unemployment';

interface Params {
  context: Context;
  /** The long-run mean μ = c/(1 − φ), in tenths (25 means 2.5); drawn first so that c is short. */
  muTenths: number;
  /** The persistence φ, in hundredths (70 means 0.7). */
  phiPct: number;
  /** The latest observation y(T), in tenths. */
  lastTenths: number;
  /** The forecast horizon h, in periods. */
  h: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;

interface Setting {
  symbol: string;
  /** The series, as the start of a sentence. */
  text: string;
  /** The name of one period, singular and plural. */
  period: [string, string];
  mu: [number, number];
  phis: readonly number[];
  last: [number, number];
  h: [number, number];
}

const SETTINGS: Record<Context, Setting> = {
  inflation: {
    symbol: '\\pi',
    text: 'Annual inflation $\\pi_t$ (in %)',
    period: ['year', 'years'],
    mu: [20, 60],
    phis: [50, 60, 70, 75, 80, 90],
    last: [5, 120],
    h: [2, 6],
  },
  growth: {
    symbol: 'g',
    text: 'Quarterly GDP growth $g_t$ (annualised, in %)',
    period: ['quarter', 'quarters'],
    mu: [15, 35],
    phis: [30, 40, 50, 60, 70],
    last: [-30, 60],
    h: [2, 4],
  },
  unemployment: {
    symbol: 'u',
    text: 'The monthly unemployment rate $u_t$ (in %)',
    period: ['month', 'months'],
    mu: [40, 90],
    phis: [80, 85, 90, 95],
    last: [30, 130],
    h: [3, 12],
  },
};

const phi = (p: Params) => p.phiPct / 100;
const mean = (p: Params) => p.muTenths / 10;
const last = (p: Params) => p.lastTenths / 10;
/** c = μ(1 − φ); params() keeps it to at most 2 decimals. */
const intercept = (p: Params) => (p.muTenths * (100 - p.phiPct)) / 1000;
/** ŷ(T + n) = μ + φⁿ(y(T) − μ). */
const forecastAt = (p: Params, n: number) => mean(p) + phi(p) ** n * (last(p) - mean(p));
const value = (p: Params) => round(forecastAt(p, p.h), 2);

const candidates = (p: Params) => [
  { value: round(phi(p) ** p.h * last(p), 2), mistakeCode: 'FORECAST_NO_MEAN' },
  { value: round(forecastAt(p, 1), 2), mistakeCode: 'ONE_STEP_ONLY' },
  { value: mean(p), mistakeCode: 'LONG_RUN_MEAN_ONLY' },
  {
    value: round(intercept(p) + phi(p) ** p.h * (last(p) - intercept(p)), 2),
    mistakeCode: 'INTERCEPT_AS_MEAN',
  },
];

/** EM06, difficulty 3: the h-step forecast μ + φʰ(y(T) − μ) of an AR(1) given c, φ and y(T). */
export const ar1ForecastHSteps: Generator<Params> = {
  id: 'ar1-forecast-h-steps',
  title: 'AR(1) forecast h periods ahead',
  topicId: 'EM06',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['inflation', 'growth', 'unemployment'] as const);
      const s = SETTINGS[context];
      const muTenths = rng.int(...s.mu);
      const phiPct = rng.pick(s.phis);
      const lastTenths = rng.int(...s.last);
      const h = rng.int(...s.h);
      // c = μ(1 − φ) must have at most 2 decimals.
      if ((muTenths * (100 - phiPct)) % 10 !== 0) continue;
      // A clear gap between the latest value and the mean.
      if (Math.abs(lastTenths - muTenths) < 10) continue;
      const p: Params = { context, muTenths, phiPct, lastTenths, h };
      const kept = cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem(p) {
    const s = SETTINGS[p.context];
    const [one, many] = s.period;
    return `${s.text} follows the AR(1) model $${s.symbol}_t = ${num(intercept(p))} + ${num(phi(p))}\\,${s.symbol}_{t-1} + \\varepsilon_t$, where $\\varepsilon_t$ is white noise. In the latest ${one} it was $${s.symbol}_T = ${num(last(p))}$. What is the forecast $\\hat ${s.symbol}_{T+${p.h}}$ for ${p.h} ${many} ahead? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const gap = last(p) - mean(p);
    const shrunk = phi(p) ** p.h * gap;
    return [
      {
        text: 'Find the long-run mean.',
        latex: `\\mu = \\dfrac{c}{1 - \\varphi} = \\dfrac{${num(intercept(p))}}{1 - ${num(phi(p))}} = ${num(mean(p))}`,
        why: 'Forecasts are pulled towards the mean of the series, which is c/(1 − φ), not the intercept c.',
        result: mean(p),
      },
      {
        text: 'Measure how far the latest value is from the mean.',
        latex: `y_T - \\mu = ${num(last(p))} - ${num(mean(p))} = ${num(gap)}`,
        why: 'Future shocks have mean 0, so the forecast follows only this gap, and each period keeps a share φ of it, as in a difference equation.',
        result: gap,
      },
      {
        text: `Shrink the gap ${p.h} times.`,
        latex: `\\varphi^{${p.h}}\\,(y_T - \\mu) = ${num(phi(p))}^{${p.h}} \\cdot ${gap < 0 ? `(${num(gap)})` : num(gap)} = ${num(shrunk, 4)}`,
        why: `Each step ahead multiplies the expected gap by φ once more, so after h = ${p.h} steps it is φ^${p.h} times the gap today.`,
        result: shrunk,
      },
      {
        text: 'Add the mean back.',
        latex: `\\hat y_{T+${p.h}} = \\mu + \\varphi^{${p.h}}(y_T - \\mu) = ${num(mean(p))} ${shrunk < 0 ? '-' : '+'} ${num(Math.abs(shrunk), 4)} = ${num(value(p))}`,
        why: 'The forecast is the mean plus what is left of the gap; as h grows it moves steadily towards the mean.',
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
