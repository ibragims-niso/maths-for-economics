import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The outlay today, a multiple of 1000. */
  cost: number;
  /** Cash flows at the end of years 1, 2 and 3, multiples of 100. */
  flows: [number, number, number];
  /** The starting guess r₀ in whole per cent. */
  guess: number;
}

/** The answer is a rate in per cent to 2 decimals; only rounding slips are forgiven. */
const RATE = { tolerance: 0.01, relTolerance: 0 } as const;

export const npv = (p: Params, r: number) =>
  -p.cost + p.flows.reduce((sum, cf, i) => sum + cf / (1 + r) ** (i + 1), 0);

/** NPV′(r) = −Σ t·CFₜ/(1 + r)^(t+1). */
export const npvSlope = (p: Params, r: number) =>
  p.flows.reduce((sum, cf, i) => sum - ((i + 1) * cf) / (1 + r) ** (i + 2), 0);

/** The IRR in per cent: NPV falls as r rises, so bisection on [0, 100 %] finds the one root. */
export function irrPercent(p: Params) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    if (npv(p, m) > 0) lo = m;
    else hi = m;
  }
  return ((lo + hi) / 2) * 100;
}

const r0 = (p: Params) => p.guess / 100;
export const newtonRate = (p: Params) => r0(p) - npv(p, r0(p)) / npvSlope(p, r0(p));
const estimate = (p: Params) => round(newtonRate(p) * 100, 2);

function candidates(p: Params) {
  const r = r0(p);
  const slipSlope = p.flows.reduce((sum, cf, i) => sum - ((i + 1) * cf) / (1 + r) ** (i + 1), 0);
  return [
    { value: round((r + npv(p, r) / npvSlope(p, r)) * 100, 2), mistakeCode: 'NEWTON_PLUS_SIGN' },
    { value: round((r - npv(p, r) / slipSlope) * 100, 2), mistakeCode: 'DERIVATIVE_POWER_SLIP' },
    { value: round(irrPercent(p), 2), mistakeCode: 'EXACT_ROOT' },
  ];
}

/** NM01, difficulty 3: one Newton step for the IRR of a three-year project from a starting guess. */
export const newtonIrrStep: Generator<Params> = {
  id: 'newton-irr-step',
  title: "Newton's method for an IRR",
  topicId: 'NM01',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const cost = rng.int(2, 30) * 1000;
      const flows = [0, 0, 0].map(() => Math.round((cost * rng.int(20, 60)) / 10000) * 100) as [
        number,
        number,
        number,
      ];
      const guess = rng.pick([5, 8, 10, 12, 15, 20] as const);
      const p: Params = { cost, flows, guess };
      const irr = irrPercent(p);
      if (irr < 3 || irr > 30) continue;
      const gap = Math.abs(guess - irr);
      if (gap < 1.5 || gap > 8) continue;
      // One step must not land on the IRR itself at 2 decimals.
      if (Math.abs(newtonRate(p) * 100 - irr) < 0.05) continue;
      if (cleanDistractors(estimate(p), candidates(p), RATE.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A project costs $${num(p.cost)}$ today and returns $${num(p.flows[0])}$, $${num(p.flows[1])}$ and $${num(p.flows[2])}$ at the ends of years 1, 2 and 3. Its IRR solves $NPV(r) = -${num(p.cost)} + \\dfrac{${num(p.flows[0])}}{1 + r} + \\dfrac{${num(p.flows[1])}}{(1 + r)^2} + \\dfrac{${num(p.flows[2])}}{(1 + r)^3} = 0$. Take one step of Newton's method from the guess $r_0 = ${num(p.guess)}\\%$. Give $r_1$ as a percentage to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 2, ...RATE }),

  steps(p) {
    const r = r0(p);
    const v = npv(p, r);
    const d = npvSlope(p, r);
    const [c1, c2, c3] = p.flows;
    const x = num(1 + r, 2);
    return [
      {
        text: 'Evaluate the NPV at the guess.',
        latex: `NPV(${num(r, 2)}) = -${num(p.cost)} + \\dfrac{${num(c1)}}{${x}} + \\dfrac{${num(c2)}}{${x}^2} + \\dfrac{${num(c3)}}{${x}^3} = ${num(v, 2)}`,
        why:
          v > 0
            ? 'The NPV is positive, so the guess is below the IRR: the rate must rise.'
            : 'The NPV is negative, so the guess is above the IRR: the rate must fall.',
        result: round(v, 2),
      },
      {
        text: 'Differentiate the NPV and evaluate the slope at the guess.',
        latex: `NPV'(r) = -\\dfrac{${num(c1)}}{(1 + r)^2} - \\dfrac{${num(2 * c2)}}{(1 + r)^3} - \\dfrac{${num(3 * c3)}}{(1 + r)^4}, \\quad NPV'(${num(r, 2)}) = ${num(d, 2)}`,
        why: 'Each term CF·(1 + r)⁻ᵗ has derivative −t·CF·(1 + r)⁻ᵗ⁻¹ by the chain rule: the power goes up by one.',
        result: round(d, 2),
      },
      {
        text: 'Take the Newton step and write it in per cent.',
        latex: `r_1 = ${num(r, 2)} - \\dfrac{${num(v, 2)}}{${num(d, 2)}} = ${num(newtonRate(p), 6)} = ${num(estimate(p))}\\%`,
        why: 'Follow the tangent of the NPV curve at r₀ to where it crosses zero; the NPV curve is almost straight near the IRR, so r₁ is much closer than r₀.',
        result: estimate(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(estimate(p), candidates(p), RATE.tolerance, 0),
};
