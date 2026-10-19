import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** A growth rate in per cent to 2 decimals: accept rounding in the last place only. */
const PCT = { tolerance: 0.01, relTolerance: 0 } as const;

interface Params {
  /** Interest rate in per cent a year. */
  rate: number;
  /** Rate of time preference ρ in per cent a year. */
  rho: number;
  /** Curvature of utility σ (the inverse of the elasticity of intertemporal substitution). */
  sigma: number;
}

const growth = (p: Params) => round((p.rate - p.rho) / p.sigma, 2);

const candidates = (p: Params) => [
  { value: round(p.rate - p.rho, 2), mistakeCode: 'IGNORED_SIGMA' },
  { value: round((p.rate - p.rho) * p.sigma, 2), mistakeCode: 'MULTIPLIED_BY_SIGMA' },
  { value: round((p.rho - p.rate) / p.sigma, 2), mistakeCode: 'SIGN_REVERSED' },
];

/** DO02, difficulty 2: the Keynes–Ramsey rule, consumption growth ċ/c = (r − ρ)/σ, in per cent. */
export const keynesRamseyConsumptionGrowth: Generator<Params> = {
  id: 'keynes-ramsey-consumption-growth',
  title: 'Consumption growth by the Keynes–Ramsey rule',
  topicId: 'DO02',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        rate: rng.int(2, 24) / 2,
        rho: rng.int(2, 16) / 2,
        sigma: rng.pick([0.5, 1.5, 2, 2.5, 3, 4, 5]),
      };
      if (p.rate === p.rho) continue;
      const kept = cleanDistractors(growth(p), candidates(p), PCT.tolerance, PCT.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `A household maximises $\\int_0^\\infty e^{-\\rho t}\\,\\dfrac{c^{1-\\sigma}}{1-\\sigma}\\,dt$ subject to $\\dot a = ra + w - c$, where $a$ is its wealth and $w$ a constant wage. The interest rate is $r = ${num(p.rate)}\\%$, the rate of time preference is $\\rho = ${num(p.rho)}\\%$ and $\\sigma = ${num(p.sigma)}$. At what rate does consumption grow along the optimal path, in per cent a year? Give your answer to 2 decimal places (negative if consumption falls).`,

  answer: (p) => ({ kind: 'numeric', value: growth(p), decimals: 2, ...PCT }),

  steps(p) {
    const g = growth(p);
    return [
      {
        text: 'Write the current-value Hamiltonian, with wealth a as the state and consumption c as the control.',
        latex: `H_c = \\dfrac{c^{1-\\sigma}}{1-\\sigma} + \\mu\\,(ra + w - c)`,
        why: 'Utility is the flow payoff without the discount factor, and μ, the current-value costate, prices one more unit of wealth in utility at that date.',
      },
      {
        text: 'Maximise over c.',
        latex: `\\dfrac{\\partial H_c}{\\partial c} = c^{-\\sigma} - \\mu = 0 \\;\\Rightarrow\\; \\mu = c^{-\\sigma}`,
        why: 'At the optimum the marginal utility of consuming one more unit equals the value of keeping it as wealth.',
      },
      {
        text: 'Use the costate equation of the current-value Hamiltonian.',
        latex: `\\dot\\mu = \\rho\\mu - \\dfrac{\\partial H_c}{\\partial a} = (\\rho - r)\\,\\mu`,
        why: 'Wealth earns r, so ∂H_c/∂a = rμ; the extra ρμ appears because μ is measured in current-value terms.',
      },
      {
        text: 'Turn the growth of μ into the growth of c.',
        latex: `\\dfrac{\\dot\\mu}{\\mu} = -\\sigma\\,\\dfrac{\\dot c}{c} \\;\\Rightarrow\\; \\dfrac{\\dot c}{c} = \\dfrac{r - \\rho}{\\sigma} = \\dfrac{${num(p.rate)} - ${num(p.rho)}}{${num(p.sigma)}} = ${num(g)}\\%`,
        why: 'Taking logs of μ = c^(−σ) and differentiating with respect to time gives μ̇/μ = −σ·ċ/c. Consumption grows when the interest rate beats impatience, and a larger σ (less willingness to shift consumption over time) slows it.',
        result: g,
      },
    ];
  },

  distractors: (p) => cleanDistractors(growth(p), candidates(p), PCT.tolerance, PCT.relTolerance),
};
