import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  principal: number;
  /** Annual rate in per cent, a whole number. */
  rate: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** n(n − 1)/2, the coefficient of r² in (1 + r)ⁿ. */
const pairs = (n: number) => (n * (n - 1)) / 2;

/** P(1 + nr + n(n − 1)r²/2); exact to the cent because P is a multiple of 100 and r is whole %. */
const estimate = ({ principal, rate, years }: Params) => {
  const r = rate / 100;
  return round(principal * (1 + years * r + pairs(years) * r * r), 2);
};

function candidates(p: Params) {
  const r = p.rate / 100;
  const n = p.years;
  return [
    { value: round(p.principal * (1 + n * r), 2), mistakeCode: 'LINEAR_ONLY' },
    {
      value: round(p.principal * (1 + n * r + n * (n - 1) * r * r), 2),
      mistakeCode: 'FORGOT_HALF',
    },
    {
      value: round(p.principal * (1 + n * r + ((n * n) / 2) * r * r), 2),
      mistakeCode: 'POWER_RULE_SLIP',
    },
    { value: round(p.principal * (1 + r) ** n, 2), mistakeCode: 'EXACT_VALUE' },
  ];
}

/** C111, difficulty 2: second-order estimate of a compound-growth amount, P(1 + r)ⁿ ≈ P(1 + nr + n(n − 1)r²/2). */
export const compoundGrowthQuadraticApproximation: Generator<Params> = {
  id: 'compound-growth-quadratic-approximation',
  title: 'Compound growth, second-order estimate',
  topicId: 'C111',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        principal: rng.int(5, 100) * 100,
        rate: rng.int(1, 8),
        years: rng.int(3, 15),
      };
      // Keep nr ≤ 0.6: beyond that a second-order estimate is a poor one.
      if (p.rate * p.years > 60) continue;
      if (
        cleanDistractors(estimate(p), candidates(p), MONEY.tolerance, MONEY.relTolerance).length < 3
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `A deposit of $${num(p.principal)}$ earns $${p.rate}\\%$ a year, compounded annually, for $${p.years}$ years. Estimate its final value with the quadratic (second-order) approximation of $(1 + r)^n$ about $r = 0$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = p.rate / 100;
    const n = p.years;
    const factor = 1 + n * r + pairs(n) * r * r;
    const ans = estimate(p);
    return [
      {
        text: 'Find the first two derivatives of g(r) = (1 + r)ⁿ at r = 0.',
        latex: `g(0) = 1, \\quad g'(r) = n(1 + r)^{n-1} \\Rightarrow g'(0) = ${n}, \\quad g''(r) = n(n-1)(1 + r)^{n-2} \\Rightarrow g''(0) = ${n * (n - 1)}`,
        why: 'The quadratic approximation needs the value, the slope and the second derivative at the point r = 0.',
        result: n * (n - 1),
      },
      {
        text: 'Build the quadratic approximation.',
        latex: `(1 + r)^{${n}} \\approx 1 + ${n}r + \\tfrac{${n * (n - 1)}}{2}r^2 = 1 + ${n}r + ${num(pairs(n))}r^2`,
        why: 'g(0) + g′(0)r + ½g″(0)r²: the tangent line plus the curvature correction.',
        result: pairs(n),
      },
      {
        text: `Put in r = ${num(r, 2)}.`,
        latex: `1 + ${n} \\cdot ${num(r, 2)} + ${num(pairs(n))} \\cdot ${num(r, 2)}^2 = 1 + ${num(n * r, 2)} + ${num(pairs(n) * r * r, 4)} = ${num(factor, 4)}`,
        why: `${num(n * r, 2)} is simple interest, ${n} × ${p.rate} %; the r² term, ${num(pairs(n) * r * r, 4)}, is interest on interest for each of the ${num(pairs(n))} pairs of years.`,
        result: round(factor, 4),
      },
      {
        text: 'Multiply by the deposit.',
        latex: `${num(p.principal)} \\times ${num(factor, 4)} = ${num(ans)}`,
        why: 'The deposit grows by the same factor as one unit of money.',
        result: ans,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(estimate(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};
