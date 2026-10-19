import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** α = 1/alphaDen in f(k) = A·k^α. */
  alphaDen: number;
  /** k* = root^alphaDen, so that k*^(1 − α) = root^(alphaDen − 1) is a whole number. */
  root: number;
  /** Rate of time preference ρ, in per cent. */
  rhoPct: number;
  /** Depreciation δ, in per cent. */
  deltaPct: number;
  /** Population growth n, in per cent (below ρ). */
  nPct: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;
/** α = 1/2, 1/3, 1/4 with the roots that keep k* readable. */
const SHAPES = [
  { alphaDen: 2, roots: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { alphaDen: 3, roots: [2, 3, 4, 5, 6] },
  { alphaDen: 4, roots: [2, 3] },
] as const;

const rho = (p: Params) => p.rhoPct / 100;
const delta = (p: Params) => p.deltaPct / 100;
const n = (p: Params) => p.nPct / 100;
/** k* = root^alphaDen. */
const kStar = (p: Params) => p.root ** p.alphaDen;
/** A chosen so that f′(k*) = (A/alphaDen)·k*^(α − 1) = ρ + δ exactly: A = alphaDen·(ρ + δ)·root^(alphaDen − 1). */
const productivity = (p: Params) =>
  round(p.alphaDen * (rho(p) + delta(p)) * p.root ** (p.alphaDen - 1), 4);
/** f(k*) = A·k*^α = A·root. */
const output = (p: Params) => productivity(p) * p.root;
const investment = (p: Params) => (n(p) + delta(p)) * kStar(p);
const cStar = (p: Params) => round(output(p) - investment(p), 2);

const candidates = (p: Params) => [
  { value: round(output(p), 2), mistakeCode: 'FORGOT_INVESTMENT' },
  { value: round(investment(p), 2), mistakeCode: 'INVESTMENT_NOT_CONSUMPTION' },
  { value: round((rho(p) + delta(p)) * kStar(p), 2), mistakeCode: 'CAPITAL_INCOME' },
];

/** DO04, difficulty 2: steady-state consumption per worker c* = f(k*) − (n + δ)k* in the Ramsey model. */
export const ramseySteadyStateConsumption: Generator<Params> = {
  id: 'ramsey-steady-state-consumption',
  title: 'Ramsey steady-state consumption',
  topicId: 'DO04',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const shape = rng.pick(SHAPES);
      const p: Params = {
        alphaDen: shape.alphaDen,
        root: rng.pick(shape.roots),
        rhoPct: rng.int(2, 6),
        deltaPct: rng.int(3, 10),
        nPct: rng.int(0, 2),
      };
      if (p.nPct >= p.rhoPct) continue;
      const A = productivity(p);
      // A with at most 2 decimals and a sensible size.
      if (Math.abs(A * 100 - Math.round(A * 100)) > 1e-9 || A < 0.5 || A > 10) continue;
      const kept = cleanDistractors(cStar(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `In a Ramsey economy output per worker is $f(k) = ${num(productivity(p))}\\,k^{1/${p.alphaDen}}$. Along the optimal path consumption per worker follows $\\dfrac{\\dot c}{c} = \\dfrac{f'(k) - \\delta - \\rho}{\\sigma}$ and capital per worker $\\dot k = f(k) - c - (n + \\delta)k$, with $\\rho = ${p.rhoPct}\\%$, $\\delta = ${p.deltaPct}\\%$ and $n = ${p.nPct}\\%$. Find steady-state consumption per worker $c^*$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: cStar(p), decimals: 2, ...VALUE }),

  steps(p) {
    const rd = rho(p) + delta(p);
    const A = productivity(p);
    const k = kStar(p);
    return [
      {
        text: 'Find k* from the modified golden rule.',
        latex: `f'(k^*) = \\tfrac{${num(A)}}{${p.alphaDen}}\\,k^{-${p.alphaDen - 1}/${p.alphaDen}} = ${num(rd)} \\;\\Rightarrow\\; k^{${p.alphaDen - 1}/${p.alphaDen}} = ${num(A / p.alphaDen / rd, 4)} \\;\\Rightarrow\\; k^* = ${num(k)}`,
        why: `Setting ċ = 0 gives f′(k*) = ρ + δ. Raising ${num(A / p.alphaDen / rd, 4)} to the power ${p.alphaDen}/${p.alphaDen - 1} gives k*.`,
        result: k,
      },
      {
        text: 'Output per worker at k*.',
        latex: `f(k^*) = ${num(A)} \\times ${num(k)}^{1/${p.alphaDen}} = ${num(A)} \\times ${p.root} = ${num(output(p))}`,
        why: `${num(k)} is ${p.root} to the power ${p.alphaDen}, so its ${p.alphaDen === 2 ? 'square' : p.alphaDen === 3 ? 'cube' : 'fourth'} root is ${p.root}.`,
        result: output(p),
      },
      {
        text: 'Set the change in capital to zero and solve for c.',
        latex: `c^* = f(k^*) - (n + \\delta)k^* = ${num(output(p))} - ${num(n(p) + delta(p))} \\times ${num(k)} = ${num(output(p))} - ${num(investment(p))} = ${num(cStar(p))}`,
        why: 'At the steady state k̇ = 0: of the output per worker, the part (n + δ)k* must be invested to equip new workers and replace worn-out capital, and everything else is consumed.',
        result: cStar(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(cStar(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
