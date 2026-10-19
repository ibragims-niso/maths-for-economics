import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { F_DFS, fCritical } from './contexts';

/** The joint hypotheses: what is tested and how many restrictions q it imposes. */
type Context = 'regions' | 'seasons' | 'experience' | 'rivals' | 'returnsToScale';

interface Params {
  context: Context;
  /** Number of restrictions in H₀. */
  q: number;
  /** Explanatory variables in the unrestricted model, not counting the intercept. */
  m: number;
  /** Number of observations. */
  n: number;
  /** s² = SSR_U/(n − k), in hundredths so that SSR_U has at most 2 decimals. */
  s2: number;
  /** (SSR_R − SSR_U)/q, the rise in SSR per restriction, also in hundredths. */
  d: number;
}

/** The statistic is asked to 2 decimals. */
const STAT = { tolerance: 0.01, relTolerance: 0 } as const;

const Q_OPTIONS: Readonly<Record<Context, readonly number[]>> = {
  regions: [2, 3, 4, 5],
  seasons: [3],
  experience: [2],
  rivals: [2, 3],
  returnsToScale: [1],
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'] as const;
const word = (x: number) => WORDS[x] ?? String(x);
/** "one other variable", "two worker characteristics". */
const count = (x: number, noun: string) => `${word(x)} ${noun}${x === 1 ? '' : 's'}`;
const others = (x: number) => count(x, 'other variable');

function setting(p: Params): string {
  const extra = p.m - p.q;
  switch (p.context) {
    case 'regions':
      return `A wage equation for workers in ${word(p.q + 1)} regions has ${count(extra, 'worker characteristic')} and ${word(p.q)} regional dummies (one region is the base group) as explanatory variables. To test whether the regional dummies are jointly significant, it is re-estimated without them.`;
    case 'seasons':
      return `A regression of quarterly electricity demand has ${count(extra, 'economic variable')} and three quarterly dummies (the first quarter is the base) as explanatory variables. To test whether there is any seasonal pattern, it is re-estimated without the three dummies.`;
    case 'experience':
      return `A wage equation has experience, experience squared and ${others(extra)} as explanatory variables. To test whether experience matters at all, it is re-estimated without experience and experience squared.`;
    case 'rivals':
      return `A demand equation for a brand of coffee has the prices of ${word(p.q)} rival brands and ${others(extra)} as explanatory variables. To test whether rivals' prices matter, it is re-estimated without them.`;
    case 'returnsToScale':
      return `A Cobb–Douglas production function $\\ln Q = \\beta_0 + \\beta_1 \\ln L + \\beta_2 \\ln K + \\dots$ is estimated for a sample of firms, with ${word(p.m)} explanatory variables. To test constant returns to scale, $H_0: \\beta_1 + \\beta_2 = 1$, it is re-estimated with the restriction built in (regressing $\\ln(Q/K)$ on $\\ln(L/K)$ and the other variables).`;
  }
}

export const kOf = (p: Params) => p.m + 1;
export const ssrU = (p: Params) => round(p.s2 * (p.n - kOf(p)), 6);
export const ssrR = (p: Params) => round(ssrU(p) + p.q * p.d, 6);
const exactF = (p: Params) => p.d / p.s2;
const target = (p: Params) => round(exactF(p), 2);

/** Swapping q and n − k gives F·q²/(n − k)², usually tiny; it is kept only when it reads as a number. */
const swapped = (p: Params) => round((ssrR(p) - ssrU(p)) / (p.n - kOf(p)) / (ssrU(p) / p.q), 2);

function candidates(p: Params): Distractor[] {
  const df = p.n - kOf(p);
  const rise = ssrR(p) - ssrU(p);
  const swap: Distractor[] =
    swapped(p) >= 0.1 ? [{ value: swapped(p), mistakeCode: 'DF_SWAPPED' }] : [];
  return [
    ...swap,
    { value: round(rise / (ssrU(p) / df), 2), mistakeCode: 'NOT_DIVIDED_BY_Q' },
    { value: round(rise / p.q / (ssrR(p) / df), 2), mistakeCode: 'RESTRICTED_IN_DENOMINATOR' },
    { value: round(rise / p.q / (ssrU(p) / (p.n - p.m)), 2), mistakeCode: 'DF_NO_INTERCEPT' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), STAT.tolerance, STAT.relTolerance);

/** EM03, difficulty 2: the F statistic for q joint restrictions from the restricted and unrestricted SSR. */
export const fStatisticRestrictedSsr: Generator<Params> = {
  id: 'f-statistic-restricted-ssr',
  title: 'F statistic from restricted and unrestricted SSR',
  topicId: 'EM03',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick([
        'regions',
        'seasons',
        'experience',
        'rivals',
        'returnsToScale',
      ] as const);
      const q = rng.pick(Q_OPTIONS[context]);
      const m = q + rng.int(context === 'returnsToScale' ? 2 : 1, 4);
      const df = rng.pick(F_DFS);
      const s2 = rng.int(5, 300) / 100;
      const f = rng.int(20, 1500) / 100;
      const d = round(f * s2, 2);
      if (d <= 0) continue;
      const p: Params = { context, q, m, n: df + m + 1, s2, d };
      const F = exactF(p);
      if (F < 0.2 || F > 15) continue;
      // A clear decision at 5 %: F is not within rounding of the critical value.
      if (Math.abs(F - fCritical(q, df)) < 0.05) continue;
      // Every mistake leads to its own wrong number.
      if (kept(p).length === candidates(p).length) return p;
    }
  },

  stem: (p) =>
    `${setting(p)} With $n = ${p.n}$ observations, the unrestricted regression (intercept included) has $\\text{SSR}_U = ${num(ssrU(p))}$ and the restricted one has $\\text{SSR}_R = ${num(ssrR(p))}$. Find the $F$ statistic for the test. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...STAT }),

  steps(p) {
    const k = kOf(p);
    const df = p.n - k;
    const crit = fCritical(p.q, df);
    const F = target(p);
    const rise = round(ssrR(p) - ssrU(p), 6);
    return [
      {
        text: 'Count the restrictions and the residual degrees of freedom of the unrestricted model.',
        latex: `q = ${p.q}, \\qquad k = ${p.m} + 1 = ${k}, \\qquad n - k = ${p.n} - ${k} = ${df}`,
        why:
          p.q === 1
            ? 'H₀ is a single equation about the coefficients, so it is one restriction. k counts every coefficient of the unrestricted model, the intercept included.'
            : `H₀ sets ${word(p.q)} coefficients to zero, one restriction each. k counts every coefficient of the unrestricted model, the intercept included.`,
        result: df,
      },
      {
        text: 'Find the rise in SSR per restriction.',
        latex: `\\dfrac{\\text{SSR}_R - \\text{SSR}_U}{q} = \\dfrac{${num(ssrR(p))} - ${num(ssrU(p))}}{${p.q}} = \\dfrac{${num(rise)}}{${p.q}} = ${num(p.d)}`,
        why: 'Imposing H₀ can only make the fit worse, so SSR rises. The question is whether it rises by more than chance would explain.',
        result: p.d,
      },
      {
        text: 'Estimate the error variance from the unrestricted model.',
        latex: `s^2 = \\dfrac{\\text{SSR}_U}{n - k} = \\dfrac{${num(ssrU(p))}}{${df}} = ${num(p.s2)}`,
        why: 'The unrestricted model is valid whether or not H₀ holds, so its residuals give the yardstick for how large a chance rise in SSR would be.',
        result: p.s2,
      },
      {
        text: 'Divide the two.',
        latex: `F = \\dfrac{(\\text{SSR}_R - \\text{SSR}_U)/q}{\\text{SSR}_U/(n - k)} = \\dfrac{${num(p.d)}}{${num(p.s2)}} = ${num(F)}`,
        why: `If H₀ is true, F follows the F(${p.q}, ${df}) distribution, whose 5 % critical value is ${num(crit)}; F = ${num(F)} ${exactF(p) > crit ? 'is larger, so reject H₀' : 'is smaller, so do not reject H₀'} at the 5 % level.`,
        result: F,
      },
    ];
  },

  distractors: (p) => kept(p),
};
