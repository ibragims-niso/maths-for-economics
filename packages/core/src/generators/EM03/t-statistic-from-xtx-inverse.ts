import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals } from '../ST105/contexts';
import { tFor } from '../ST203/critical-values';
import {
  COEFFICIENT_CONTEXT_IDS,
  COEFFICIENT_CONTEXTS,
  type CoefficientContext,
  nullHypothesis,
  range,
} from './contexts';

interface Params {
  context: CoefficientContext;
  /** Number of observations. */
  n: number;
  /** Explanatory variables, not counting the intercept. */
  m: number;
  /** The residual standard deviation s = √(SSR/(n − k)). */
  s: number;
  /** √[(XᵀX)⁻¹]ⱼⱼ, so that the diagonal entry r² and SE = s·r are short decimals. */
  r: number;
  /** The estimate b_j. */
  b: number;
}

/** The statistic is asked to 2 decimals; the standard error is exact. */
const STAT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Small samples, where the t table matters (ST203). */
const DFS = range(10, 30, 1);
const SDS = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5];
const ROOTS = range(0.01, 0.6, 0.01);

const kOf = (p: Params) => p.m + 1;
const dfOf = (p: Params) => p.n - kOf(p);
export const ssrOf = (p: Params) => round(p.s ** 2 * dfOf(p), 6);
export const diagOf = (p: Params) => round(p.r ** 2, 8);
const s2Of = (p: Params) => round(p.s ** 2, 8);
const varOf = (p: Params) => round(p.s ** 2 * p.r ** 2, 10);
export const seOf = (p: Params) => round(p.s * p.r, 8);
const nullOf = (p: Params) => COEFFICIENT_CONTEXTS[p.context].nullValue;
const gap = (p: Params) => round(p.b - nullOf(p), 6);
const exactT = (p: Params) => gap(p) / seOf(p);
const target = (p: Params) => round(exactT(p), 2);

function candidates(p: Params): Distractor[] {
  const ssr = ssrOf(p);
  const tWith = (divisor: number) => round(gap(p) / Math.sqrt((ssr / divisor) * diagOf(p)), 2);
  const list: Distractor[] = [
    { value: round(gap(p) / varOf(p), 2), mistakeCode: 'DIVIDED_BY_VARIANCE' },
    { value: tWith(p.n), mistakeCode: 'SSR_OVER_N' },
    { value: tWith(p.n - p.m), mistakeCode: 'DF_NO_INTERCEPT' },
  ];
  if (nullOf(p) !== 0) {
    list.push({ value: round(p.b / seOf(p), 2), mistakeCode: 'NULL_NOT_SUBTRACTED' });
  }
  return list;
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), STAT.tolerance, STAT.relTolerance);

/**
 * EM03, difficulty 3: the t statistic for H₀: β_j = c when SE(b_j) must first be built from
 * s² = SSR/(n − k) and the diagonal entry of (XᵀX)⁻¹.
 */
export const tStatisticFromXtxInverse: Generator<Params> = {
  id: 't-statistic-from-xtx-inverse',
  title: 't statistic from s² and (XᵀX)⁻¹',
  topicId: 'EM03',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(COEFFICIENT_CONTEXT_IDS);
      const c = COEFFICIENT_CONTEXTS[context];
      const m = rng.int(2, 5);
      const p: Params = {
        context,
        n: rng.pick(DFS) + m + 1,
        m,
        s: rng.pick(SDS),
        r: rng.pick(ROOTS),
        b: rng.pick(c.bs),
      };
      // A realistic standard error for this kind of coefficient, and an SSR with 2 decimals.
      const se = seOf(p);
      if (se < (c.ses[0] ?? 0) || se > (c.ses[c.ses.length - 1] ?? 0)) continue;
      if (!hasDecimals(ssrOf(p), 2)) continue;
      const t = Math.abs(exactT(p));
      if (t < 1 || t > 8) continue;
      // A clear decision at 5 %: |t| is not within rounding of the critical value.
      if (Math.abs(t - tFor(dfOf(p), 95)) < 0.02) continue;
      // Every mistake that applies leads to its own wrong number.
      if (kept(p).length === candidates(p).length) return p;
    }
  },

  stem(p) {
    const c = COEFFICIENT_CONTEXTS[p.context];
    return `${c.lead} has an intercept and ${p.m} explanatory variables and is estimated from $n = ${p.n}$ observations. Its sum of squared residuals is $\\text{SSR} = ${num(ssrOf(p))}$, ${c.coefficient} is $b = ${num(p.b, c.decimals)}$, and the diagonal entry of $(X^\\top X)^{-1}$ that belongs to this coefficient is $${num(diagOf(p), 4)}$. To test ${c.question}, find the $t$ statistic for $${nullHypothesis(c.nullValue)}$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...STAT }),

  steps(p) {
    const c = COEFFICIENT_CONTEXTS[p.context];
    const k = kOf(p);
    const df = dfOf(p);
    const crit = tFor(df, 95);
    const t = target(p);
    const nv = nullOf(p);
    const minusNull = nv === 0 ? '- 0' : nv < 0 ? `- (${nv})` : `- ${nv}`;
    return [
      {
        text: 'Count the coefficients and the residual degrees of freedom.',
        latex: `k = ${p.m} + 1 = ${k}, \\qquad n - k = ${p.n} - ${k} = ${df}`,
        why: 'k counts every estimated coefficient, the intercept included; each one uses up a degree of freedom of the residuals.',
        result: df,
      },
      {
        text: 'Estimate the error variance.',
        latex: `s^2 = \\dfrac{\\text{SSR}}{n - k} = \\dfrac{${num(ssrOf(p))}}{${df}} = ${num(s2Of(p), 4)}`,
        why: 'Dividing by n − k rather than n makes s² an unbiased estimate of σ² (EM02).',
        result: s2Of(p),
      },
      {
        text: 'Find the standard error of the coefficient.',
        latex: `\\operatorname{SE}(b) = \\sqrt{s^2\\,[(X^\\top X)^{-1}]_{jj}} = \\sqrt{${num(s2Of(p), 4)} \\times ${num(diagOf(p), 4)}} = \\sqrt{${num(varOf(p), 8)}} = ${num(seOf(p), 4)}`,
        why: 'The estimated variance of b_j is the j-th diagonal entry of s²(XᵀX)⁻¹; the standard error is its square root.',
        result: seOf(p),
      },
      {
        text: 'Divide the gap from the null value by the standard error.',
        latex: `t = \\dfrac{b - \\beta_0}{\\operatorname{SE}(b)} = \\dfrac{${num(p.b, c.decimals)} ${minusNull}}{${num(seOf(p), 4)}} = ${num(t)}`,
        why: `If H₀ is true, t follows a t distribution with ${df} degrees of freedom; its 5 % two-sided critical value is ${num(crit, 3)}, so |t| = ${num(Math.abs(t))} ${Math.abs(exactT(p)) >= crit ? 'rejects' : 'does not reject'} H₀ at the 5 % level.`,
        result: t,
      },
    ];
  },

  distractors: (p) => kept(p),
};
