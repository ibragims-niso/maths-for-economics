import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The time-series settings the residuals come from. */
type Context = 'gdp' | 'consumption' | 'sales';
/** What is asked: the statistic d itself, or the first-order autocorrelation ρ̂ ≈ 1 − d/2. */
type Ask = 'd' | 'rho';

interface Params {
  context: Context;
  ask: Ask;
  /** The OLS residuals e₁, …, eₙ in time order (whole numbers that add up to 0). */
  e: number[];
}

/** Asked to 3 decimal places. */
const THREE_DP = { tolerance: 0.001, relTolerance: 0 } as const;

const SETTINGS: Readonly<Record<Context, (n: number) => string>> = {
  gdp: (n) =>
    `A regression of quarterly GDP growth on the change in the interest rate, estimated over ${n} quarters, leaves these residuals (in tenths of a percentage point)`,
  consumption: (n) =>
    `An annual consumption function, estimated over ${n} years, leaves these residuals (in billions)`,
  sales: (n) =>
    `A regression of a firm's monthly sales on its advertising spending, estimated over ${n} months, leaves these residuals (in thousands of units)`,
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** The changes eₜ − eₜ₋₁ for t = 2, …, n. */
export const diffsOf = (p: Params) => p.e.slice(1).map((v, i) => v - (p.e[i] ?? 0));
/** Σ(eₜ − eₜ₋₁)², a whole number. */
export const numeratorOf = (p: Params) => sum(diffsOf(p).map((v) => v * v));
/** Σeₜ² over all n residuals, a whole number. */
export const denominatorOf = (p: Params) => sum(p.e.map((v) => v * v));
const dOf = (p: Params) => numeratorOf(p) / denominatorOf(p);
const target = (p: Params) => round(p.ask === 'd' ? dOf(p) : 1 - dOf(p) / 2, 3);

function candidates(p: Params): Distractor[] {
  const den = denominatorOf(p);
  const shortDen = den - (p.e[0] ?? 0) ** 2;
  const dShort = numeratorOf(p) / shortDen;
  if (p.ask === 'd') {
    return [
      { value: round(sum(diffsOf(p).map(Math.abs)) / den, 3), mistakeCode: 'DW_NOT_SQUARED' },
      { value: round(dShort, 3), mistakeCode: 'DW_DENOM_SHORT' },
      { value: round((numeratorOf(p) + (p.e[0] ?? 0) ** 2) / den, 3), mistakeCode: 'DW_E0_ZERO' },
    ];
  }
  return [
    { value: round(dOf(p) / 2, 3), mistakeCode: 'RHO_HALF_D' },
    { value: round(dOf(p), 3), mistakeCode: 'D_NOT_RHO' },
    { value: round(1 - dShort / 2, 3), mistakeCode: 'DW_DENOM_SHORT' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), THREE_DP.tolerance, THREE_DP.relTolerance);

/** True when x·1000 sits within 1e-6 of a rounding tie (x.xxx5), where 3-decimal rounding is fragile. */
const nearTie = (x: number) => Math.abs(Math.abs((x * 1000) % 1) - 0.5) < 1e-6;

/** EM04, difficulty 2: the Durbin–Watson d = Σ(eₜ − eₜ₋₁)²/Σeₜ² from residuals, or ρ̂ ≈ 1 − d/2. */
export const durbinWatsonStatistic: Generator<Params> = {
  id: 'durbin-watson-statistic',
  title: 'Durbin–Watson statistic',
  topicId: 'EM04',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const n = rng.int(6, 7);
      // Errors with some persistence (or alternation), as in real time series.
      const rho = rng.pick([-0.6, -0.3, 0, 0.4, 0.7, 0.9]);
      const e: number[] = [rng.pick([-1, 1]) * rng.int(1, 5)];
      for (let t = 1; t < n - 1; t++) e.push(Math.round(rho * (e[t - 1] ?? 0)) + rng.int(-2, 2));
      e.push(-sum(e));
      const p: Params = {
        context: rng.pick(['gdp', 'consumption', 'sales'] as const),
        ask: rng.pick(['d', 'rho'] as const),
        e,
      };
      if (e.some((v) => Math.abs(v) > 7) || e.filter((v) => v === 0).length > 1) continue;
      if (denominatorOf(p) < 12 || numeratorOf(p) === 0) continue;
      if (nearTie(dOf(p)) || nearTie(1 - dOf(p) / 2)) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem(p) {
    const list = p.e.map((v) => num(v)).join(',\\ ');
    const ask =
      p.ask === 'd'
        ? 'Find the Durbin–Watson statistic $d$.'
        : 'Use the Durbin–Watson statistic $d$ to estimate the first-order autocorrelation of the errors, $\\hat\\rho \\approx 1 - d/2$.';
    return `${SETTINGS[p.context](p.e.length)}, in time order: $${list}$. ${ask} Give your answer to 3 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 3, ...THREE_DP }),

  steps(p) {
    const diffs = diffsOf(p);
    const num1 = numeratorOf(p);
    const den = denominatorOf(p);
    const d = round(dOf(p), 3);
    const paren = (v: number) => (v < 0 ? `(${num(v)})` : num(v));
    const steps = [
      {
        text: 'Square the changes from one period to the next and add them.',
        latex: `\\sum_{t=2}^{${p.e.length}} (e_t - e_{t-1})^2 = ${diffs.map((v) => `${paren(v)}^2`).join(' + ')} = ${num1}`,
        why: `There are n − 1 = ${p.e.length - 1} changes, starting with e₂ − e₁; nothing comes before e₁. When the errors are persistent, neighbours are alike and these changes are small.`,
        result: num1,
      },
      {
        text: 'Add the squares of all the residuals.',
        latex: `\\sum_{t=1}^{${p.e.length}} e_t^2 = ${p.e.map((v) => `${paren(v)}^2`).join(' + ')} = ${den}`,
        why: 'The denominator uses all n residuals: it measures how big the residuals are, so that d does not depend on their units.',
        result: den,
      },
      {
        text: 'Divide.',
        latex: `d = \\dfrac{${num1}}{${den}} = ${num(d, 3)}`,
        why:
          d < 2
            ? 'd is below 2: neighbouring residuals tend to have the same sign, a sign of positive autocorrelation. With no autocorrelation d would be close to 2.'
            : 'd is above 2: the residuals tend to switch sign from one period to the next, a sign of negative autocorrelation. With no autocorrelation d would be close to 2.',
        result: d,
      },
    ];
    if (p.ask === 'd') return steps;
    return [
      ...steps,
      {
        text: 'Turn d into an estimate of ρ.',
        latex: `\\hat\\rho \\approx 1 - \\dfrac{d}{2} = 1 - \\dfrac{${num1}}{2 \\times ${den}} = ${num(target(p), 3)}`,
        why: 'In large samples d ≈ 2(1 − ρ̂), so ρ̂ ≈ 1 − d/2: d = 2 means ρ̂ = 0, d near 0 means ρ̂ near 1, and d near 4 means ρ̂ near −1.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
