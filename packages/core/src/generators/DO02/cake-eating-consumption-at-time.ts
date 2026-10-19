import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Amounts to 2 decimals: a small absolute and relative slack for rounding along the way. */
const AMOUNT = { tolerance: 0.01, relTolerance: 0.001 } as const;

interface Params {
  /** Discount rate ρ in per cent a year. */
  rho: number;
  /** Initial stock S₀ (million tonnes). */
  stock: number;
  /** The date t (years) at which consumption is asked for. */
  year: number;
}

const firstConsumption = (p: Params) => (p.rho / 100) * p.stock;
const consumptionAt = (p: Params) =>
  round(firstConsumption(p) * Math.exp((-p.rho / 100) * p.year), 2);

const candidates = (p: Params) => [
  { value: round(firstConsumption(p), 2), mistakeCode: 'CONSTANT_CONSUMPTION' },
  {
    value: round(p.stock * Math.exp((-p.rho / 100) * p.year), 2),
    mistakeCode: 'STOCK_NOT_FLOW',
  },
  {
    value: round(firstConsumption(p) * Math.exp((p.rho / 100) * p.year), 2),
    mistakeCode: 'TILT_WRONG_WAY',
  },
];

/** DO02, difficulty 3: cake eating with u = ln c over an infinite horizon, c(t) = ρS₀e^(−ρt). */
export const cakeEatingConsumptionAtTime: Generator<Params> = {
  id: 'cake-eating-consumption-at-time',
  title: 'Optimal extraction of a fixed stock',
  topicId: 'DO02',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        rho: rng.pick([2, 2.5, 3, 4, 5, 6, 8, 10]),
        stock: rng.int(2, 50) * 10,
        year: rng.int(1, 30),
      };
      const kept = cleanDistractors(
        consumptionAt(p),
        candidates(p),
        AMOUNT.tolerance,
        AMOUNT.relTolerance,
      );
      if (kept.length === 3 && consumptionAt(p) >= 0.1) return p;
    }
  },

  stem: (p) =>
    `A country owns a stock of $S_0 = ${num(p.stock)}$ (million tonnes) of a mineral. The stock does not grow and every tonne used is gone, so $\\dot S = -c$. The country chooses the extraction path $c(t)$ to maximise $\\int_0^\\infty e^{-${num(p.rho / 100, 4)}t}\\ln c(t)\\,dt$. How much is extracted per year at $t = ${num(p.year)}$ along the optimal path? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: consumptionAt(p), decimals: 2, ...AMOUNT }),

  steps(p) {
    const r = num(p.rho / 100, 4);
    const c0 = round(firstConsumption(p), 2);
    const ct = consumptionAt(p);
    return [
      {
        text: 'Write the current-value Hamiltonian and maximise over c.',
        latex: `H_c = \\ln c - \\mu c, \\qquad \\dfrac{\\partial H_c}{\\partial c} = \\dfrac{1}{c} - \\mu = 0 \\;\\Rightarrow\\; c = \\dfrac{1}{\\mu}`,
        why: 'The state is the stock S and Ṡ = −c, so g = −c. Using a tonne now gives marginal utility 1/c, and that must equal μ, the value of keeping the tonne in the ground.',
      },
      {
        text: 'Solve the costate equation.',
        latex: `\\dot\\mu = ${r}\\,\\mu - \\dfrac{\\partial H_c}{\\partial S} = ${r}\\,\\mu \\;\\Rightarrow\\; \\mu(t) = \\mu_0 e^{${r}t},\\; c(t) = c(0)\\,e^{-${r}t}`,
        why: 'The stock does not appear in H_c, so the current-value shadow price grows at the discount rate ρ and consumption, its inverse, falls at rate ρ.',
      },
      {
        text: 'Choose c(0) so that the path uses up exactly the whole stock.',
        latex: `\\int_0^\\infty c(0)\\,e^{-${r}t}\\,dt = \\dfrac{c(0)}{${r}} = ${num(p.stock)} \\;\\Rightarrow\\; c(0) = ${num(c0)}`,
        why: 'Total extraction over all time cannot exceed S₀, and the transversality condition says nothing valuable may be left for ever, so the integral equals S₀ exactly.',
        result: c0,
      },
      {
        text: `Extraction at t = ${p.year}.`,
        latex: `c(${num(p.year)}) = ${num(c0)}\\,e^{-${r} \\times ${num(p.year)}} = ${num(ct)}`,
        why: 'Impatience tilts extraction towards the present: each year the country uses the share ρ of what is left, so the flow shrinks at rate ρ.',
        result: ct,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(consumptionAt(p), candidates(p), AMOUNT.tolerance, AMOUNT.relTolerance),
};
