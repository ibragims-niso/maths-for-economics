import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Weight of capital in tenths: α = alphaTenths/10. */
  alphaTenths: number;
  K: number;
  L: number;
}

const OUTPUT = { tolerance: 0.005, relTolerance: 0.0005 } as const;

const alpha = (p: Params) => p.alphaTenths / 10;
export const cobbDouglas = (p: Params) => p.K ** alpha(p) * p.L ** (1 - alpha(p));
/** The CES output (α·K^ρ + (1 − α)·L^ρ)^(1/ρ) for ρ ≠ 0. */
export const ces = (p: Params, rho: number) =>
  (alpha(p) * p.K ** rho + (1 - alpha(p)) * p.L ** rho) ** (1 / rho);
const limitValue = (p: Params) => round(cobbDouglas(p), 2);

const candidates = (p: Params) => [
  { value: round(alpha(p) * p.K + (1 - alpha(p)) * p.L, 2), mistakeCode: 'LINEAR_AVERAGE' },
  { value: 1, mistakeCode: 'ONE_TO_INFINITY' },
  { value: Math.min(p.K, p.L), mistakeCode: 'LEONTIEF' },
];

/** C120, difficulty 3: the CES production function tends to Cobb–Douglas as ρ → 0. */
export const cesLimitCobbDouglas: Generator<Params> = {
  id: 'ces-limit-cobb-douglas',
  title: 'CES production as ρ tends to zero',
  topicId: 'C120',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const alphaTenths = rng.int(2, 8);
      const K = rng.int(2, 60);
      const L = rng.int(2, 60);
      if (Math.abs(K - L) < 4) continue;
      const p: Params = { alphaTenths, K, L };
      if (
        cleanDistractors(limitValue(p), candidates(p), OUTPUT.tolerance, OUTPUT.relTolerance)
          .length < 3
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm's CES production function is $Q(\\rho) = \\left(${num(alpha(p))}\\,K^{\\rho} + ${num(1 - alpha(p))}\\,L^{\\rho}\\right)^{1/\\rho}$ with $K = ${num(p.K)}$ and $L = ${num(p.L)}$. Find $\\displaystyle\\lim_{\\rho \\to 0} Q(\\rho)$ to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: limitValue(p), decimals: 2, ...OUTPUT }),

  steps(p) {
    const a = num(alpha(p));
    const b = num(1 - alpha(p));
    const lnLimit = alpha(p) * Math.log(p.K) + (1 - alpha(p)) * Math.log(p.L);
    return [
      {
        text: 'Take logarithms to turn the 1^∞ form into 0/0.',
        latex: `\\ln Q(\\rho) = \\dfrac{\\ln\\left(${a}\\,K^{\\rho} + ${b}\\,L^{\\rho}\\right)}{\\rho} \\to \\dfrac{\\ln 1}{0} = \\dfrac{0}{0}`,
        why: `As ρ → 0 the bracket tends to ${a} + ${b} = 1 and the power 1/ρ grows without limit: a 1^∞ form, which is not 1. The logarithm brings the power down as a fraction.`,
      },
      {
        text: "Apply L'Hôpital's rule: differentiate top and bottom with respect to ρ.",
        latex: `\\lim_{\\rho \\to 0} \\dfrac{${a}\\,K^{\\rho}\\ln K + ${b}\\,L^{\\rho}\\ln L}{${a}\\,K^{\\rho} + ${b}\\,L^{\\rho}} = ${a}\\ln ${num(p.K)} + ${b}\\ln ${num(p.L)} = ${num(lnLimit, 4)}`,
        why: 'The derivative of ln(u) is u′/u, and the derivative of K^ρ with respect to ρ is K^ρ·ln K. At ρ = 0 every K^ρ and L^ρ is 1, and the weights in the denominator add up to 1.',
        result: round(lnLimit, 4),
      },
      {
        text: 'Undo the logarithm.',
        latex: `\\lim_{\\rho \\to 0} Q(\\rho) = e^{${num(lnLimit, 4)}} = ${num(p.K)}^{${a}}\\cdot ${num(p.L)}^{${b}} = ${num(limitValue(p))}`,
        why: 'e raised to α ln K + (1 − α) ln L is K^α·L^(1−α): the Cobb–Douglas function. CES with ρ → 0 has elasticity of substitution 1, exactly like Cobb–Douglas.',
        result: limitValue(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(limitValue(p), candidates(p), OUTPUT.tolerance, OUTPUT.relTolerance),
};
