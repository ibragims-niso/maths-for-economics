import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Productivity A in f(k) = A·k^α. */
  A: number;
  /** Capital's exponent α = alphaNum/alphaDen. */
  alphaNum: number;
  alphaDen: number;
  /** Rate of time preference ρ, in per cent. */
  rhoPct: number;
  /** Depreciation δ, in per cent. */
  deltaPct: number;
  /** Population growth n, in per cent (below ρ). */
  nPct: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.002 } as const;
const ALPHAS = [
  [1, 4],
  [1, 3],
  [2, 5],
  [1, 2],
] as const;
const PRODUCTIVITY = [1, 1.2, 1.5, 2, 2.5, 3] as const;

const alpha = (p: Params) => p.alphaNum / p.alphaDen;
const rho = (p: Params) => p.rhoPct / 100;
const delta = (p: Params) => p.deltaPct / 100;
const n = (p: Params) => p.nPct / 100;
/** The capital per worker where αA·k^(α − 1) = rate, i.e. f′(k) = rate. */
const capitalWhereMpkIs = (p: Params, rate: number) =>
  ((alpha(p) * p.A) / rate) ** (1 / (1 - alpha(p)));
/** k* from the modified golden rule f′(k*) = ρ + δ. */
const kStarExact = (p: Params) => capitalWhereMpkIs(p, rho(p) + delta(p));
const kStar = (p: Params) => round(kStarExact(p), 2);
/** The ratio αA/(ρ + δ) that k^(1 − α) must equal. */
const ratio = (p: Params) => (alpha(p) * p.A) / (rho(p) + delta(p));

const alphaTex = (p: Params) => `${p.alphaNum}/${p.alphaDen}`;
/** 1/(1 − α) as a slash fraction, e.g. "3/2" or "2". */
const powerTex = (p: Params) => {
  const bottom = p.alphaDen - p.alphaNum;
  return bottom === 1 ? `${p.alphaDen}` : `${p.alphaDen}/${bottom}`;
};
/** α − 1 as a fraction, e.g. "-2/3". */
const minusTex = (p: Params) => `-${p.alphaDen - p.alphaNum}/${p.alphaDen}`;

const candidates = (p: Params) => [
  { value: round(capitalWhereMpkIs(p, n(p) + delta(p)), 2), mistakeCode: 'GOLDEN_RULE' },
  { value: round(capitalWhereMpkIs(p, rho(p)), 2), mistakeCode: 'FORGOT_DEPRECIATION' },
  { value: round(ratio(p), 2), mistakeCode: 'FORGOT_POWER' },
];

/** DO04, difficulty 1: steady-state capital per worker from the modified golden rule f′(k*) = ρ + δ. */
export const ramseyModifiedGoldenRuleCapital: Generator<Params> = {
  id: 'ramsey-modified-golden-rule-capital',
  title: 'Ramsey steady-state capital (modified golden rule)',
  topicId: 'DO04',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const [alphaNum, alphaDen] = rng.pick(ALPHAS);
      const p: Params = {
        A: rng.pick(PRODUCTIVITY),
        alphaNum,
        alphaDen,
        rhoPct: rng.int(2, 6),
        deltaPct: rng.int(3, 10),
        nPct: rng.int(0, 2),
      };
      if (p.nPct >= p.rhoPct) continue;
      const k = kStarExact(p);
      // A readable capital stock that the economy builds up from below 1.
      if (k < 2 || k > 250) continue;
      const kept = cleanDistractors(kStar(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A social planner chooses consumption per worker $c$ to maximise $\\int_0^\\infty e^{-\\rho t}L(t)\\,\\dfrac{c^{1-\\sigma}}{1-\\sigma}\\,dt$, where the labour force $L(t)$ grows at $n$. Output per worker is $f(k) = ${p.A === 1 ? '' : `${num(p.A)}\\,`}k^{${alphaTex(p)}}$, and along the optimal path $\\dfrac{\\dot c}{c} = \\dfrac{f'(k) - \\delta - \\rho}{\\sigma}$ and $\\dot k = f(k) - c - (n + \\delta)k$. With $\\rho = ${p.rhoPct}\\%$, $\\delta = ${p.deltaPct}\\%$ and $n = ${p.nPct}\\%$, find the steady-state capital per worker $k^*$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: kStar(p), decimals: 2, ...VALUE }),

  steps(p) {
    const rd = rho(p) + delta(p);
    return [
      {
        text: 'Set the growth of consumption to zero.',
        latex: `\\dot c = 0 \\iff f'(k^*) = \\rho + \\delta = ${num(rho(p))} + ${num(delta(p))} = ${num(rd)}`,
        why: 'Consumption per worker stops changing only when the net return on capital, f′(k) − δ, equals the rate of time preference ρ: this is the modified golden rule.',
        result: rd,
      },
      {
        text: 'Differentiate f and solve for the power of k.',
        latex: `f'(k) = ${num(alpha(p) * p.A, 4)}\\,k^{${minusTex(p)}} = ${num(rd)} \\;\\Rightarrow\\; k^{1 - ${alphaTex(p)}} = \\dfrac{${num(alpha(p) * p.A, 4)}}{${num(rd)}} = ${num(ratio(p), 4)}`,
        why: 'The derivative of A·k^α is αA·k^(α − 1); moving k^(α − 1) to the other side leaves k^(1 − α).',
        result: ratio(p),
      },
      {
        text: 'Undo the power 1 − α.',
        latex: `k^* = ${num(ratio(p), 4)}^{${powerTex(p)}} = ${num(kStar(p))}`,
        why: `Raising both sides to the power 1/(1 − α) = ${powerTex(p)} gives k itself. Population growth n does not appear: it matters for c* and for the golden rule, not for the modified golden rule.`,
        result: kStar(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(kStar(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
