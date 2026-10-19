import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { T_TABLE, tFor } from '../ST203/critical-values';
import {
  COEFFICIENT_CONTEXT_IDS,
  COEFFICIENT_CONTEXTS,
  type CoefficientContext,
  nullHypothesis,
} from './contexts';

interface Params {
  context: CoefficientContext;
  /** The estimate b_j. */
  b: number;
  /** Its standard error SE(b_j). */
  se: number;
  /** Number of observations. */
  n: number;
  /** Number of coefficients, the intercept included. */
  k: number;
}

/** The statistic is asked to 2 decimals. */
const STAT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Residual degrees of freedom the t table covers (ST203). */
const DFS = Object.keys(T_TABLE)
  .map(Number)
  .filter((df) => df >= 10);

const nullOf = (p: Params) => COEFFICIENT_CONTEXTS[p.context].nullValue;
const gap = (p: Params) => round(p.b - nullOf(p), 6);
const exactT = (p: Params) => gap(p) / p.se;
const target = (p: Params) => round(exactT(p), 2);

function candidates(p: Params): Distractor[] {
  return [
    { value: round(p.b / p.se, 2), mistakeCode: 'NULL_NOT_SUBTRACTED' },
    { value: round(gap(p) / p.se ** 2, 2), mistakeCode: 'DIVIDED_BY_VARIANCE' },
    { value: round(-gap(p) / p.se, 2), mistakeCode: 'SIGN_REVERSED' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), STAT.tolerance, STAT.relTolerance);

/** EM03, difficulty 1: the t statistic (b_j − c)/SE(b_j) for H₀: β_j = c from a regression table. */
export const coefficientTStatistic: Generator<Params> = {
  id: 'coefficient-t-statistic',
  title: 't statistic for a regression coefficient',
  topicId: 'EM03',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(COEFFICIENT_CONTEXT_IDS);
      const c = COEFFICIENT_CONTEXTS[context];
      const df = rng.pick(DFS);
      const k = rng.int(3, 6);
      const p: Params = { context, b: rng.pick(c.bs), se: rng.pick(c.ses), n: df + k, k };
      const t = Math.abs(exactT(p));
      if (t < 0.5 || t > 8) continue;
      // A clear decision at 5 %: |t| is not within rounding of the critical value.
      if (Math.abs(t - tFor(df, 95)) < 0.02) continue;
      // Every mistake that applies leads to its own wrong number (forgetting c needs c ≠ 0).
      if (kept(p).length === (c.nullValue === 0 ? 2 : 3)) return p;
    }
  },

  stem(p) {
    const c = COEFFICIENT_CONTEXTS[p.context];
    return `${c.lead}, estimated from $n = ${p.n}$ observations with $k = ${p.k}$ coefficients (intercept included), gives ${c.coefficient} $b = ${num(p.b, c.decimals)}$ with standard error $\\operatorname{SE}(b) = ${num(p.se, c.decimals)}$. To test ${c.question}, find the $t$ statistic for $${nullHypothesis(c.nullValue)}$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...STAT }),

  steps(p) {
    const c = COEFFICIENT_CONTEXTS[p.context];
    const d = c.decimals;
    const df = p.n - p.k;
    const crit = tFor(df, 95);
    const t = target(p);
    const nv = c.nullValue;
    const minusNull = nv === 0 ? '- 0' : nv < 0 ? `- (${nv})` : `- ${nv}`;
    return [
      {
        text: 'Measure how far the estimate is from the value in H₀.',
        latex: `b - \\beta_0 = ${num(p.b, d)} ${minusNull} = ${num(gap(p), d)}`,
        why:
          nv === 0
            ? 'H₀ says the variable has no effect, so the question is how far the estimate lies from zero.'
            : `H₀ fixes the coefficient at ${nv}, so the evidence against it is the distance of b from ${nv}, not from zero.`,
        result: gap(p),
      },
      {
        text: 'Divide the gap by the standard error.',
        latex: `t = \\dfrac{b - \\beta_0}{\\operatorname{SE}(b)} = \\dfrac{${num(gap(p), d)}}{${num(p.se, d)}} = ${num(t)}`,
        why: `The gap is measured in standard errors. If H₀ is true, t follows a t distribution with n − k = ${p.n} − ${p.k} = ${df} degrees of freedom; its 5 % two-sided critical value is ${num(crit, 3)}, so |t| = ${num(Math.abs(t))} ${Math.abs(exactT(p)) >= crit ? 'rejects' : 'does not reject'} H₀ at the 5 % level.`,
        result: t,
      },
    ];
  },

  distractors: (p) => kept(p),
};
