import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Interest rate on the debt, in per cent a year. */
  r: number;
  /** Growth of nominal GDP, in per cent a year; above r, so the ratio settles. */
  g: number;
  /** Primary deficit, in per cent of GDP each year. */
  deficit: number;
  /** Debt today, in per cent of GDP (it does not affect the long run). */
  start: number;
}

/** Default tolerance (0.5 %): it accepts a factor a rounded to 4 decimals, not the shortcut 1 + r − g. */
const TOL = { tolerance: 0.01, relTolerance: 0.005 } as const;

/** 1 + x/100 for a rate x in per cent, e.g. 3.5 → 1.035. */
const one = (x: number) => num(1 + x / 100, 4);

/** a = (1 + r)/(1 + g). */
const factor = (p: Params) => (100 + p.r) / (100 + p.g);
/** d* = p/(1 − a) = p(1 + g)/(g − r), using 1 − a = (g − r)/(1 + g) exactly. */
const steadyExact = (p: Params) => (p.deficit * (100 + p.g)) / (p.g - p.r);
const steady = (p: Params) => round(steadyExact(p), 2);

const candidates = (p: Params) => [
  { value: round(p.deficit / (1 + factor(p)), 2), mistakeCode: 'DENOMINATOR_SIGN' },
  { value: round((100 * p.deficit) / (p.g - p.r), 2), mistakeCode: 'APPROX_FACTOR' },
  { value: round(-steadyExact(p), 2), mistakeCode: 'REARRANGE_SIGN' },
];

/** DY01, difficulty 2: the long-run public debt ratio d* = p/(1 − a) with a = (1 + r)/(1 + g) < 1. */
export const debtRatioSteadyState: Generator<Params> = {
  id: 'debt-ratio-steady-state',
  title: 'Long-run debt ratio',
  topicId: 'DY01',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const g = rng.int(4, 18) / 2;
      const r = g - rng.int(1, 8) / 2;
      const deficit = rng.int(1, 8) / 2;
      const start = rng.int(4, 18) * 5;
      if (r < 1) continue;
      const p: Params = { r, g, deficit, start };
      // A sensible long-run ratio that is clearly different from today's.
      const d = steadyExact(p);
      if (d < 25 || d > 250 || Math.abs(d - start) < 10) continue;
      return p;
    }
  },

  stem: (p) =>
    `A government runs a primary deficit (spending minus taxes, before interest) of $${num(p.deficit)}\\%$ of GDP every year. It pays $${p.r}\\%$ interest on its debt and nominal GDP grows by $${p.g}\\%$ a year, so the debt ratio $d_t$ (debt in % of GDP) follows $d_{t+1} = \\dfrac{${one(p.r)}}{${one(p.g)}}\\,d_t + ${num(p.deficit)}$. Debt is now $${p.start}\\%$ of GDP. If nothing changes, which debt ratio does it approach in the long run, in % of GDP? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: steady(p), decimals: 2, ...TOL }),

  steps(p) {
    const a = factor(p);
    const oneMinus = (p.g - p.r) / (100 + p.g);
    return [
      {
        text: 'Read off the factor a and check stability.',
        latex: `a = \\dfrac{${one(p.r)}}{${one(p.g)}} = ${num(a, 6)} < 1`,
        why: 'Interest (r) pushes the ratio up and GDP growth (g) pulls it down; with g > r the factor is below 1, so the gap to the steady state shrinks and the ratio settles.',
        result: a,
      },
      {
        text: 'Compute 1 − a exactly.',
        latex: `1 - a = \\dfrac{${one(p.g)} - ${one(p.r)}}{${one(p.g)}} = \\dfrac{${num((p.g - p.r) / 100, 4)}}{${one(p.g)}} = ${num(oneMinus, 6)}`,
        why: '1 − a is small, so rounding a first would lose most of its digits; writing it as (g − r)/(1 + g) keeps it exact.',
        result: oneMinus,
      },
      {
        text: 'Divide the deficit by 1 − a.',
        latex: `d^* = \\dfrac{${num(p.deficit)}}{1 - a} = \\dfrac{${num(p.deficit)} \\cdot ${one(p.g)}}{${num((p.g - p.r) / 100, 4)}} = ${num(steady(p))}`,
        why: 'The steady state solves d = a·d + p, so d(1 − a) = p and d* = p/(1 − a). The debt today does not enter: it only decides where the path starts.',
        result: steady(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(steady(p), candidates(p), TOL.tolerance, TOL.relTolerance),
};
