import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Utility U = x^a · y^b. */
  a: number;
  b: number;
  px: number;
  py: number;
  income: number;
  /** The ration: at most `quota` units of x per person. */
  quota: number;
}

/** Answers are exact to 2 decimal places, so the tolerance is tight. */
const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;

const isExact2dp = (v: number) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;

/** Cobb–Douglas demand for x without the ration: the share a/(a + b) of income, over its price. */
export const freeX = (p: Params) => (p.a * p.income) / ((p.a + p.b) * p.px);

/** Cobb–Douglas demand for y without the ration. */
export const freeY = (p: Params) => (p.b * p.income) / ((p.a + p.b) * p.py);

/** Whether the ration binds: the free choice of x is above the quota (whole-number comparison). */
export const quotaBinds = (p: Params) => p.quota * (p.a + p.b) * p.px < p.a * p.income;

/** y when x is held at the quota and the rest of income goes on y. */
export const yAtQuota = (p: Params) => (p.income - p.px * p.quota) / p.py;

/** The best y: at the quota when the ration binds, otherwise the free Cobb–Douglas demand. */
export const rationedY = (p: Params) => round(quotaBinds(p) ? yAtQuota(p) : freeY(p), 2);

const power = (v: string, e: number) => (e === 1 ? v : `${v}^{${e}}`);

/** OP01, difficulty 2: spending on the other good when good x is rationed (the quota may not bind). */
export const rationingQuotaOtherGood: Generator<Params> = {
  id: 'rationing-quota-other-good',
  title: 'Demand under rationing',
  topicId: 'OP01',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 3);
      const b = rng.int(1, 3);
      const px = rng.int(2, 12);
      const py = rng.int(2, 10);
      const t = rng.int(2, 20);
      // Income makes the free demand for x a whole number, a·t.
      const income = (a + b) * px * t;
      if (income < 40 || income > 2000) continue;
      const xFree = a * t;
      // Two draws in three: the ration binds (quota below a·t); otherwise it lies between
      // a·t and all income spent on x, s·t, so it does not bind.
      const quota =
        rng.next() < 2 / 3 ? rng.int(1, xFree - 1) : rng.int(xFree + 1, (a + b) * t - 1);
      const p: Params = { a, b, px, py, income, quota };
      if (!isExact2dp(freeY(p)) || !isExact2dp(yAtQuota(p))) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer has utility $U = ${power('x', p.a)}${power('y', p.b)}$ and income $${num(p.income)}$. Good $x$ costs $${num(p.px)}$ and good $y$ costs $${num(p.py)}$. Good $x$ is rationed: each person may buy at most $${num(p.quota)}$ units. How many units of $y$ does she buy? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: rationedY(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const s = p.a + p.b;
    const xf = freeX(p);
    const intro = {
      text: 'Ignore the ration first and find the Cobb–Douglas demand for x.',
      latex: `x = \\frac{${p.a}}{${s}} \\cdot \\frac{${num(p.income)}}{${num(p.px)}} = ${num(xf)}`,
      why: `With U = x^a·y^b the consumer spends the share a/(a + b) = ${p.a}/${s} of income on x (the Lagrange conditions of MV08). This is the case where the quota multiplier μ is 0.`,
      result: xf,
    };
    if (quotaBinds(p)) {
      const y = yAtQuota(p);
      return [
        intro,
        {
          text: 'Compare with the quota.',
          latex: `${num(xf)} > ${num(p.quota)}`,
          why: 'The free choice breaks the ration, so the case μ = 0 fails. The ration must bind: x = quota, with μ ≥ 0.',
        },
        {
          text: 'Set x at the quota and spend the rest of income on y.',
          latex: `y = \\frac{${num(p.income)} - ${num(p.px)} \\cdot ${num(p.quota)}}{${num(p.py)}} = \\frac{${num(p.income - p.px * p.quota)}}{${num(p.py)}} = ${num(y)}`,
          why: 'The budget still binds, because more y always raises utility. Money that cannot be spent on x goes to y.',
          result: rationedY(p),
        },
        {
          text: 'Check that the quota multiplier is positive.',
          latex: `\\frac{MU_x}{p_x} = \\frac{${p.a}}{${num(p.px)} \\cdot ${num(p.quota)}} > \\frac{${p.b}}{${num(p.py)} \\cdot ${num(y)}} = \\frac{MU_y}{p_y} \\quad (\\text{for } \\ln U)`,
          why: 'Using ln U = a ln x + b ln y, which has the same optimum, the last unit of money buys more utility through x than through y. She would like more x, so the ration really binds and μ > 0.',
        },
      ];
    }
    const y = freeY(p);
    return [
      intro,
      {
        text: 'Compare with the quota.',
        latex: `${num(xf)} < ${num(p.quota)}`,
        why: 'The free choice respects the ration, so the quota is slack: by complementary slackness its multiplier is μ = 0 and it changes nothing.',
      },
      {
        text: 'Use the free Cobb–Douglas demand for y.',
        latex: `y = \\frac{${p.b}}{${s}} \\cdot \\frac{${num(p.income)}}{${num(p.py)}} = ${num(y)}`,
        why: 'The consumer spends the share b/(a + b) of income on y, exactly as without a ration.',
        result: rationedY(p),
      },
    ];
  },

  distractors(p) {
    const binds = quotaBinds(p);
    return cleanDistractors(
      rationedY(p),
      [
        binds
          ? { value: round(freeY(p), 2), mistakeCode: 'IGNORED_QUOTA' }
          : { value: round(yAtQuota(p), 2), mistakeCode: 'QUOTA_ALWAYS_BINDS' },
        { value: round(p.income / p.py, 2), mistakeCode: 'ALL_ON_Y' },
        ...(binds
          ? [{ value: p.income - p.px * p.quota, mistakeCode: 'LEFTOVER_NOT_PRICED' }]
          : [
              {
                value: round((p.a * p.income) / ((p.a + p.b) * p.py), 2),
                mistakeCode: 'WRONG_SHARE',
              },
            ]),
      ],
      TWO_DP.tolerance,
      TWO_DP.relTolerance,
    );
  },
};
