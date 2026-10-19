import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** A growth rate in per cent to 2 decimals: accept rounding in the last place only. */
const PCT = { tolerance: 0.01, relTolerance: 0 } as const;

interface Params {
  /** Productivity A in f(k) = A·k^α. */
  A: number;
  /** α = 1/alphaDen. */
  alphaDen: number;
  /** Capital per worker now is k = root^alphaDen, so k^(α − 1) = 1/root^(alphaDen − 1). */
  root: number;
  /** Rate of time preference ρ, in per cent. */
  rhoPct: number;
  /** Depreciation δ, in per cent. */
  deltaPct: number;
  /** Population growth n, in per cent (below ρ). */
  nPct: number;
  /** Curvature of utility σ (the inverse of the elasticity of intertemporal substitution). */
  sigma: number;
}

const PRODUCTIVITY = [1, 1.2, 1.5, 2, 2.4, 3] as const;
const SIGMAS = [0.5, 1.5, 2, 2.5, 3, 4] as const;
const SHAPES = [
  { alphaDen: 2, roots: [1, 2, 3, 4, 5, 6, 8, 10] },
  { alphaDen: 3, roots: [1, 2, 3, 4, 5] },
] as const;

/** "1.2\,", or nothing when A = 1. */
const coefTex = (A: number) => (A === 1 ? '' : `${num(A)}\\,`);
const rho = (p: Params) => p.rhoPct / 100;
const delta = (p: Params) => p.deltaPct / 100;
const capital = (p: Params) => p.root ** p.alphaDen;
/** f′(k) = (A/alphaDen)·k^(1/alphaDen − 1) = A/(alphaDen·root^(alphaDen − 1)). */
const mpk = (p: Params) => p.A / (p.alphaDen * p.root ** (p.alphaDen - 1));
/** f(k)/k = A·k^(α − 1) = A/root^(alphaDen − 1), the average product of capital. */
const apk = (p: Params) => p.A / p.root ** (p.alphaDen - 1);
/** ċ/c = (f′(k) − δ − ρ)/σ, in per cent. */
const growthExact = (p: Params) => (100 * (mpk(p) - delta(p) - rho(p))) / p.sigma;
const growth = (p: Params) => round(growthExact(p), 2);

const candidates = (p: Params) => [
  { value: round(100 * (mpk(p) - delta(p) - rho(p)), 2), mistakeCode: 'IGNORED_SIGMA' },
  {
    value: round((100 * (apk(p) - delta(p) - rho(p))) / p.sigma, 2),
    mistakeCode: 'AVERAGE_PRODUCT',
  },
  { value: round((100 * (mpk(p) - rho(p))) / p.sigma, 2), mistakeCode: 'FORGOT_DEPRECIATION' },
];

/** DO04, difficulty 3: the growth rate of consumption per worker, (f′(k) − δ − ρ)/σ, at a capital stock away from k*. */
export const ramseyConsumptionGrowthAtCapital: Generator<Params> = {
  id: 'ramsey-consumption-growth-at-capital',
  title: 'Consumption growth on the way to the Ramsey steady state',
  topicId: 'DO04',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const shape = rng.pick(SHAPES);
      const p: Params = {
        A: rng.pick(PRODUCTIVITY),
        alphaDen: shape.alphaDen,
        root: rng.pick(shape.roots),
        rhoPct: rng.int(2, 6),
        deltaPct: rng.int(3, 10),
        nPct: rng.int(0, 2),
        sigma: rng.pick(SIGMAS),
      };
      if (p.nPct >= p.rhoPct) continue;
      const g = growthExact(p);
      // Clearly away from the steady state, and not an absurd growth rate.
      if (Math.abs(g) < 0.5 || Math.abs(g) > 40) continue;
      const kept = cleanDistractors(growth(p), candidates(p), PCT.tolerance, PCT.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A social planner maximises $\\int_0^\\infty e^{-\\rho t}L(t)\\,\\dfrac{c^{1-\\sigma}}{1-\\sigma}\\,dt$ subject to $\\dot k = f(k) - c - (n + \\delta)k$, where $c$ and $k$ are consumption and capital per worker and the labour force $L(t)$ grows at $n$. Output per worker is $f(k) = ${coefTex(p.A)}k^{1/${p.alphaDen}}$, $\\rho = ${p.rhoPct}\\%$, $\\delta = ${p.deltaPct}\\%$, $n = ${p.nPct}\\%$ and $\\sigma = ${num(p.sigma)}$. Today capital per worker is $k = ${num(capital(p))}$. At what rate is consumption per worker growing along the optimal path at this moment, in per cent a year? Give your answer to 2 decimal places (negative if consumption is falling).`,

  answer: (p) => ({ kind: 'numeric', value: growth(p), decimals: 2, ...PCT }),

  steps(p) {
    const den = p.alphaDen;
    return [
      {
        text: 'Write the current-value Hamiltonian and its conditions.',
        latex: `H_c = \\dfrac{c^{1-\\sigma}}{1-\\sigma} + \\mu\\,\\bigl(f(k) - c - (n + \\delta)k\\bigr), \\quad c^{-\\sigma} = \\mu, \\quad \\dot\\mu = (\\rho - n)\\mu - \\mu\\bigl(f'(k) - n - \\delta\\bigr)`,
        why: 'With L(t) = e^(nt) the objective is ∫ e^(−(ρ − n)t)u(c) dt, so the current-value costate grows at the discount rate ρ − n minus the return ∂H_c/∂k on a unit of capital.',
      },
      {
        text: 'Turn the costate equation into the Euler equation for consumption.',
        latex: `\\dfrac{\\dot\\mu}{\\mu} = \\rho + \\delta - f'(k) = -\\sigma\\,\\dfrac{\\dot c}{c} \\;\\Rightarrow\\; \\dfrac{\\dot c}{c} = \\dfrac{f'(k) - \\delta - \\rho}{\\sigma}`,
        why: 'The n terms cancel. Taking logs of μ = c^(−σ) and differentiating with respect to time gives μ̇/μ = −σ·ċ/c.',
      },
      {
        text: 'Find the marginal product of capital today.',
        latex: `f'(k) = \\tfrac{${num(p.A)}}{${den}}\\,k^{-${den - 1}/${den}} = \\dfrac{${num(p.A)}}{${den} \\times ${p.root ** (den - 1)}} = ${num(mpk(p), 4)}`,
        why: `${num(capital(p))} is ${p.root} to the power ${den}, so k^(${den - 1}/${den}) = ${p.root ** (den - 1)}. The derivative of A·k^α is αA·k^(α − 1), not the average product f(k)/k.`,
        result: mpk(p),
      },
      {
        text: 'Substitute into the Euler equation.',
        latex: `\\dfrac{\\dot c}{c} = \\dfrac{${num(mpk(p), 4)} - ${num(delta(p))} - ${num(rho(p))}}{${num(p.sigma)}} = ${num(growth(p))}\\%`,
        why:
          growth(p) > 0
            ? 'The net return on capital, f′(k) − δ, is above ρ, so capital is scarce (k is below k*) and it pays to postpone consumption: consumption rises while capital is built up.'
            : 'The net return on capital, f′(k) − δ, is below ρ, so capital is plentiful (k is above k*) and patience does not pay: consumption falls while capital is run down.',
        result: growth(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(growth(p), candidates(p), PCT.tolerance, PCT.relTolerance),
};
