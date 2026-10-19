import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const GAMMAS = [0.5, 1, 2, 3, 4, 5] as const;
type Gamma = (typeof GAMMAS)[number];

interface Params {
  /** Coefficient of relative risk aversion of the CRRA utility. */
  gamma: Gamma;
  wealth: number;
  /** Standard deviation of the fair (mean-zero) gamble. */
  sd: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** Arrow–Pratt absolute risk aversion of CRRA utility, A(W) = γ/W. */
const absolute = (p: Params) => p.gamma / p.wealth;
/** Small-risk approximation RP ≈ ½·A(W)·σ². */
const premium = (p: Params) => 0.5 * absolute(p) * p.sd * p.sd;

/** CRRA utility W^(1−γ)/(1−γ) written simply, e.g. 2√W, ln W, −1/W, −1/(2W²). */
export function crraLatex(gamma: Gamma): string {
  if (gamma === 0.5) return '2\\sqrt{W}';
  if (gamma === 1) return '\\ln W';
  if (gamma === 2) return '-\\dfrac{1}{W}';
  return `-\\dfrac{1}{${gamma - 1}W^{${gamma - 1}}}`;
}

function wrongAnswers(p: Params) {
  return cleanDistractors(
    round(premium(p), 2),
    [
      { value: round(absolute(p) * p.sd * p.sd, 2), mistakeCode: 'NO_HALF' },
      { value: round(0.5 * absolute(p) * p.sd, 2), mistakeCode: 'SD_NOT_VARIANCE' },
      { value: round(0.5 * p.gamma * p.sd * p.sd, 2), mistakeCode: 'RELATIVE_FOR_ABSOLUTE' },
    ],
    MONEY.tolerance,
    MONEY.relTolerance,
  );
}

/** SP02, difficulty 3: Arrow–Pratt risk premium ½·(γ/W)·σ² of a small fair gamble for CRRA utility. */
export const arrowPrattRiskPremium: Generator<Params> = {
  id: 'arrow-pratt-risk-premium',
  title: 'Risk premium of a small gamble',
  topicId: 'SP02',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const gamma = rng.pick(GAMMAS);
      const wealth = 1000 * rng.int(20, 400);
      const sd = 500 * rng.int(1, 120);
      const p: Params = { gamma, wealth, sd };
      // A small risk: σ between 2 % and 15 % of wealth (whole-number comparisons).
      if (50 * sd < wealth || 20 * sd > 3 * wealth) continue;
      if (premium(p) < 5 || wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `An investor with wealth $W = ${num(p.wealth)}$ has utility $u(W) = ${crraLatex(p.gamma)}$, the CRRA utility $\\dfrac{W^{1-\\gamma}}{1-\\gamma}$ with $\\gamma = ${num(p.gamma)}$${p.gamma === 1 ? ' ($\\ln W$ is the limit of that formula as $\\gamma \\to 1$)' : ''}. She faces a fair gamble that changes her wealth by a random amount with mean $0$ and standard deviation $${num(p.sd)}$. Use the Arrow–Pratt approximation to find her risk premium, the most she would pay to avoid the gamble. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(premium(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const g = num(p.gamma);
    const value = round(premium(p), 2);
    return [
      {
        text: 'Differentiate the utility function twice.',
        latex: `u'(W) = W^{-${g}}, \\qquad u''(W) = -${g}\\,W^{-${num(p.gamma + 1)}}`,
        why: 'For W^(1−γ)/(1−γ) the first derivative is W^(−γ) (also for ln W, where γ = 1); differentiating again brings down −γ.',
      },
      {
        text: 'Find the coefficient of absolute risk aversion at her wealth.',
        latex: `A(W) = -\\dfrac{u''(W)}{u'(W)} = \\dfrac{${g}}{W} = \\dfrac{${g}}{${num(p.wealth)}} ${Math.abs(absolute(p) - round(absolute(p), 8)) < 1e-15 ? '=' : '\\approx'} ${num(absolute(p), 8)}`,
        why: 'The powers of W cancel and leave γ/W. Relative risk aversion W·A(W) = γ is the same at every wealth, hence “constant relative risk aversion”.',
        result: round(absolute(p), 8),
      },
      {
        text: 'Apply the small-risk approximation.',
        latex: `RP \\approx \\tfrac{1}{2}\\,A(W)\\,\\sigma^2 = \\tfrac{1}{2} \\times \\dfrac{${g}}{${num(p.wealth)}} \\times ${num(p.sd)}^2 ${Math.abs(premium(p) - value) < 1e-9 ? '=' : '\\approx'} ${num(value, 2)}`,
        why: 'For a small fair gamble the risk premium is half the absolute risk aversion times the variance; the variance is σ², not σ.',
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
