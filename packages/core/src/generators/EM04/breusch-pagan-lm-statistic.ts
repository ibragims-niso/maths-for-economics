import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: what is regressed on what, with q regressors besides the intercept. */
type Context = 'food' | 'wages' | 'firms' | 'houses';

interface Params {
  context: Context;
  /** Number of observations, a multiple of 10. */
  n: number;
  /** R² of the auxiliary regression of e² on the regressors, in thousandths (94 means 0.094). */
  r: number;
}

/** n·R² with n a multiple of 10 and R² in thousandths has at most 2 decimals: graded exactly. */
const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;

/** 5 % critical values of the χ² distribution with q = 1, 2, 3, 4 degrees of freedom. */
export const CHI2_5PC: Readonly<Record<number, number>> = {
  1: 3.841,
  2: 5.991,
  3: 7.815,
  4: 9.488,
};

interface Setting {
  q: number;
  ns: [number, number];
  /** The main regression, given n. */
  text: (n: number) => string;
  /** The regressors, as a phrase for the auxiliary regression. */
  regressors: string;
}

const SETTINGS: Readonly<Record<Context, Setting>> = {
  wages: {
    q: 1,
    ns: [5, 60],
    text: (n) => `the hourly wage of ${n} workers on their years of education`,
    regressors: 'education',
  },
  food: {
    q: 2,
    ns: [4, 30],
    text: (n) => `the monthly food spending of ${n} households on their income and household size`,
    regressors: 'income and household size',
  },
  firms: {
    q: 3,
    ns: [6, 40],
    text: (n) => `the R&D spending of ${n} firms on their sales, age and export share`,
    regressors: 'sales, age and export share',
  },
  houses: {
    q: 4,
    ns: [8, 50],
    text: (n) =>
      `the prices of ${n} flats on floor area, number of rooms, distance to the centre and age of the building`,
    regressors: 'the same four regressors',
  },
};

export const qOf = (p: Params) => SETTINGS[p.context].q;
export const r2Of = (p: Params) => p.r / 1000;
const target = (p: Params) => round((p.n * p.r) / 1000, 2);

function candidates(p: Params): Distractor[] {
  const k = qOf(p) + 1;
  return [
    { value: r2Of(p), mistakeCode: 'BP_R2_ONLY' },
    { value: round(((p.n - k) * p.r) / 1000, 2), mistakeCode: 'BP_DF_SCALED' },
    { value: round((p.n * (1000 - p.r)) / 1000, 2), mistakeCode: 'BP_ONE_MINUS_R2' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), TWO_DP.tolerance, TWO_DP.relTolerance);

/** EM04, difficulty 1: the Breusch–Pagan statistic LM = n·R² of the regression of e² on the regressors. */
export const breuschPaganLmStatistic: Generator<Params> = {
  id: 'breusch-pagan-lm-statistic',
  title: 'Breusch–Pagan test statistic',
  topicId: 'EM04',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['food', 'wages', 'firms', 'houses'] as const);
      const s = SETTINGS[context];
      const p: Params = { context, n: 10 * rng.int(s.ns[0], s.ns[1]), r: rng.int(5, 250) };
      const lm = (p.n * p.r) / 1000;
      // A clear decision either way, and a statistic of a realistic size.
      const crit = CHI2_5PC[s.q] ?? 0;
      if (Math.abs(lm - crit) < 0.5 || lm < 0.5 || lm > 60) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem(p) {
    const s = SETTINGS[p.context];
    return `An OLS regression of ${s.text(p.n)} is estimated. To check for heteroskedasticity, the squared residuals $e^2$ are regressed on ${s.regressors} (with an intercept); this auxiliary regression has $R^2 = ${num(r2Of(p), 3)}$. Find the Breusch–Pagan statistic $\\text{LM}$. (The 5 % critical value of $\\chi^2_{${s.q}}$ is ${num(CHI2_5PC[s.q] ?? 0, 3)}.) Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const q = qOf(p);
    const crit = CHI2_5PC[q] ?? 0;
    const lm = target(p);
    const reject = lm > crit;
    return [
      {
        text: 'Count the regressors of the auxiliary regression.',
        latex: `e^2 = \\gamma_0 + ${Array.from({ length: q }, (_, j) => `\\gamma_${j + 1} x_${j + 1}`).join(' + ')} + v, \\qquad q = ${q}`,
        why: `Under H₀ (homoskedasticity) none of the ${q} regressors helps to predict e², so all of γ₁, …, γ_q are zero. The statistic has a χ² distribution with q = ${q} degrees of freedom; the intercept is not counted.`,
        result: q,
      },
      {
        text: 'Multiply the R² of the auxiliary regression by the number of observations.',
        latex: `\\text{LM} = nR^2 = ${p.n} \\times ${num(r2Of(p), 3)} = ${num(lm)}`,
        why: 'R² measures how much of the variation in e² the regressors explain. The statistic uses all n observations: a small R² is still strong evidence when it comes from a large sample.',
        result: lm,
      },
      {
        text: 'Compare with the critical value.',
        latex: `${num(lm)} ${reject ? '>' : '<'} \\chi^2_{${q}}(5\\,\\%) = ${num(crit, 3)}`,
        why: reject
          ? 'The statistic is beyond the critical value, so homoskedasticity is rejected at 5 %: the usual standard errors should not be trusted, and robust ones should be used.'
          : 'The statistic is below the critical value, so the test finds no significant evidence of heteroskedasticity at 5 %.',
      },
    ];
  },

  distractors: (p) => kept(p),
};
