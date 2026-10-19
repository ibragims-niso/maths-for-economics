import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: y, the included x₁ and the omitted x₂. */
type Context = 'ability' | 'quality' | 'soil';

interface Params {
  context: Context;
  /** True coefficient of x₁. */
  beta1: number;
  /** True coefficient of the omitted x₂. */
  beta2: number;
  /** Σ(x₁ − x̄₁)². */
  s11: number;
  /** Slope δ₁ of x₂ on x₁ in the sample, so Σ(x₁ − x̄₁)(x₂ − x̄₂) = δ₁·Σ(x₁ − x̄₁)². */
  delta: number;
  /** Σ(x₂ − x̄₂)². */
  s22: number;
}

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 6));

interface Recipe {
  beta1s: number[];
  beta2s: number[];
  deltas: number[];
  s11s: number[];
  text: string;
}

const RECIPES: Readonly<Record<Context, Recipe>> = {
  ability: {
    beta1s: range(0.5, 2.5, 0.1),
    beta2s: range(0.1, 0.8, 0.1),
    deltas: range(0.5, 3, 0.5),
    s11s: range(100, 600, 20),
    text: 'In a wage equation, $y$ is the hourly wage, $x_1$ is years of education and $x_2$ is a measure of ability (a test score in points).',
  },
  quality: {
    beta1s: range(-30, -5),
    beta2s: range(2, 12),
    deltas: range(0.2, 1.5, 0.1),
    s11s: range(20, 200, 10),
    text: "In a demand equation, $y$ is a café's weekly sales of a dish, $x_1$ is its price and $x_2$ is its quality rating from customer reviews.",
  },
  soil: {
    beta1s: range(0.2, 1.5, 0.1),
    beta2s: range(0.2, 1.2, 0.1),
    deltas: range(-2, -0.2, 0.2),
    s11s: range(50, 400, 25),
    text: 'In a farm study, $y$ is the wheat yield in tonnes per hectare, $x_1$ is fertiliser in hundreds of kilograms per hectare and $x_2$ is a soil-quality index; farmers on poor soil tend to use more fertiliser.',
  },
};

export const s12Of = (p: Params) => round(p.delta * p.s11, 6);
const target = (p: Params) => round(p.beta1 + p.beta2 * p.delta, 2);

function candidates(p: Params): Distractor[] {
  return [
    { value: round(p.beta1, 2), mistakeCode: 'NO_BIAS' },
    { value: round(p.beta1 - p.beta2 * p.delta, 2), mistakeCode: 'BIAS_SIGN' },
    { value: round(p.beta2 * p.delta, 2), mistakeCode: 'BIAS_ONLY' },
    { value: round(p.beta1 + (p.beta2 * s12Of(p)) / p.s22, 2), mistakeCode: 'DELTA_REVERSED' },
  ];
}

const kept = (p: Params) => cleanDistractors(target(p), candidates(p));

/** EM02, difficulty 3: the expected short-regression slope β₁ + β₂δ₁ when x₂ is omitted, with δ₁ from the sample sums. */
export const omittedVariableBiasSlope: Generator<Params> = {
  id: 'omitted-variable-bias-slope',
  title: 'Omitted-variable bias',
  topicId: 'EM02',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['ability', 'quality', 'soil'] as const);
      const r = RECIPES[context];
      const s11 = rng.pick(r.s11s);
      const delta = rng.pick(r.deltas);
      const s12 = delta * s11;
      // A whole cross-product, and a squared correlation between 0.15 and 0.8.
      if (Math.abs(s12 - Math.round(s12)) > 1e-9) continue;
      const corr2 = rng.int(15, 80) / 100;
      const s22 = Math.round((s12 * s12) / (s11 * corr2));
      const p: Params = {
        context,
        beta1: rng.pick(r.beta1s),
        beta2: rng.pick(r.beta2s),
        s11,
        delta,
        s22,
      };
      const r2 = (s12 * s12) / (s11 * s22);
      if (r2 < 0.1 || r2 > 0.85) continue;
      // The expected slope is exact to 2 decimals and not zero.
      const e = p.beta1 + p.beta2 * p.delta;
      if (Math.abs(e * 100 - Math.round(e * 100)) > 1e-6 || Math.abs(e) < 0.05) continue;
      if (kept(p).length === 4) return p;
    }
  },

  stem(p) {
    return `${RECIPES[p.context].text} The true model is $y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + u$ with $E[u \\mid x_1, x_2] = 0$, $\\beta_1 = ${num(p.beta1)}$ and $\\beta_2 = ${num(p.beta2)}$. A researcher has no data on $x_2$ and regresses $y$ on $x_1$ alone. In the sample, $\\sum (x_1 - \\bar x_1)^2 = ${num(p.s11)}$, $\\sum (x_1 - \\bar x_1)(x_2 - \\bar x_2) = ${num(s12Of(p))}$ and $\\sum (x_2 - \\bar x_2)^2 = ${num(p.s22)}$. Find the expected value of the short-regression slope $\\tilde b_1$ given these $x$ values. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2 }),

  steps(p) {
    const bias = round(p.beta2 * p.delta, 6);
    const flips = Math.sign(target(p)) !== Math.sign(p.beta1);
    const direction = `${bias > 0 ? 'upwards: on average the short slope lies above β₁' : 'downwards: on average the short slope lies below β₁'}${flips ? ', so far that it even has the wrong sign' : ''}`;
    return [
      {
        text: 'Find the slope of the omitted variable on the included one.',
        latex: `\\delta_1 = \\dfrac{\\sum (x_1 - \\bar x_1)(x_2 - \\bar x_2)}{\\sum (x_1 - \\bar x_1)^2} = \\dfrac{${num(s12Of(p))}}{${num(p.s11)}} = ${num(p.delta)}`,
        why: 'δ₁ is the OLS slope of a regression of x₂ on x₁: how much the omitted variable moves, on average, with the included one. The denominator is the spread of x₁, the regressor, not of x₂.',
        result: p.delta,
      },
      {
        text: 'Add the part of x₂ that the short slope picks up.',
        latex: `E[\\tilde b_1 \\mid X] = \\beta_1 + \\beta_2\\,\\delta_1 = ${num(p.beta1)} + ${num(p.beta2)} \\times ${p.delta < 0 ? `(${num(p.delta)})` : num(p.delta)} = ${num(target(p))}`,
        why: `When x₁ is one unit higher, x₂ is on average δ₁ higher too, and that moves y by β₂δ₁. The short regression credits this to x₁. Here the bias β₂δ₁ = ${num(bias, 4).replace('-', '−')}, so the slope is biased ${direction}.`,
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
