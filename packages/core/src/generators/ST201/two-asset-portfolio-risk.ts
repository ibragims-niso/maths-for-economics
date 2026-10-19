import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'funds' | 'shares';

interface Params {
  context: Context;
  ask: 'variance' | 'sd';
  /** Weight of asset 1 in hundredths (multiples of 5, from 10 to 90); asset 2 gets the rest. */
  weight: number;
  /** Standard deviations of the two returns, in %. */
  sd1: number;
  sd2: number;
  /** Correlation in tenths, from −9 to 9 and never 0. */
  rho: number;
}

/** Variance is exact to 5 decimals and asked to 2; a 0.1 % margin covers rounding on the way. */
const RISK = { tolerance: 0.01, relTolerance: 0.001 } as const;

const w = (p: Params) => p.weight / 100;
const rho = (p: Params) => p.rho / 10;
const cov = (p: Params) => rho(p) * p.sd1 * p.sd2;
const part1 = (p: Params) => w(p) ** 2 * p.sd1 ** 2;
const part2 = (p: Params) => (1 - w(p)) ** 2 * p.sd2 ** 2;
const part12 = (p: Params) => 2 * w(p) * (1 - w(p)) * cov(p);
const variance = (p: Params) => part1(p) + part2(p) + part12(p);
const target = (p: Params) =>
  p.ask === 'variance' ? round(variance(p), 2) : round(Math.sqrt(variance(p)), 2);

const NAMES: Record<Context, [string, string]> = {
  funds: ['a share fund', 'a bond fund'],
  shares: ['share A', 'share B'],
};

/** ST201, difficulty 3: risk of a two-asset portfolio, σ² = w²σ₁² + (1 − w)²σ₂² + 2w(1 − w)ρσ₁σ₂. */
export const twoAssetPortfolioRisk: Generator<Params> = {
  id: 'two-asset-portfolio-risk',
  title: 'Risk of a two-asset portfolio',
  topicId: 'ST201',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['funds', 'shares'] as const);
      const sd1 = rng.int(10, 35);
      const sd2 = context === 'funds' ? rng.int(3, 12) : rng.int(10, 35);
      if (sd1 === sd2) continue;
      const r = rng.int(-9, 9);
      if (r === 0) continue; // with ρ = 0 the covariance term vanishes and teaches nothing
      return {
        context,
        ask: rng.pick(['variance', 'sd'] as const),
        weight: rng.int(2, 18) * 5,
        sd1,
        sd2,
        rho: r,
      };
    }
  },

  stem(p) {
    const [a, b] = NAMES[p.context];
    const what =
      p.ask === 'variance'
        ? 'What is the variance of the portfolio’s return, in squared percentage points?'
        : 'What is the standard deviation of the portfolio’s return, in per cent?';
    return `An investor puts a fraction $w = ${num(w(p))}$ of her savings in ${a}, whose annual return has standard deviation $\\sigma_1 = ${num(p.sd1)}\\%$, and the rest in ${b}, with $\\sigma_2 = ${num(p.sd2)}\\%$. The correlation between the two returns is $\\rho = ${num(rho(p))}$. ${what} Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...RISK }),

  steps(p) {
    const v = variance(p);
    const steps: Step[] = [
      {
        text: 'Turn the correlation into a covariance.',
        latex: `\\operatorname{Cov} = \\rho\\,\\sigma_1\\sigma_2 = ${num(rho(p))} \\times ${num(p.sd1)} \\times ${num(p.sd2)} = ${num(cov(p))}`,
        why: 'The variance formula needs the covariance; ρ = Cov/(σ₁σ₂), so Cov = ρσ₁σ₂, in the same squared units as the variances.',
        result: round(cov(p), 2),
      },
      {
        text: 'Work out the three parts of the portfolio variance.',
        latex: `w^2\\sigma_1^2 = ${num(w(p))}^2 \\times ${num(p.sd1)}^2 = ${num(part1(p), 4)},\\quad (1 - w)^2\\sigma_2^2 = ${num(1 - w(p))}^2 \\times ${num(p.sd2)}^2 = ${num(part2(p), 4)},\\quad 2w(1 - w)\\operatorname{Cov} = 2 \\times ${num(w(p))} \\times ${num(1 - w(p))} \\times ${cov(p) < 0 ? `(${num(cov(p))})` : num(cov(p))} = ${num(part12(p), 4)}`,
        why: 'Var(aX + bY) = a²Var(X) + b²Var(Y) + 2ab·Cov(X, Y) with a = w and b = 1 − w: each weight is squared in its own term, and the covariance term counts the pair twice.',
      },
      {
        text: 'Add the parts.',
        latex: `\\sigma_p^2 = ${num(part1(p), 4)} + ${num(part2(p), 4)} ${part12(p) < 0 ? '-' : '+'} ${num(Math.abs(part12(p)), 4)} = ${num(v, 4)}`,
        why: 'A negative covariance lowers the portfolio variance: when one asset does badly, the other tends to do better and makes up part of the loss.',
        result: round(v, 2),
      },
    ];
    if (p.ask === 'sd') {
      steps.push({
        text: 'Take the square root.',
        latex: `\\sigma_p = \\sqrt{${num(v, 4)}} = ${num(Math.sqrt(v))}`,
        why: 'The variance is in squared percentage points; the standard deviation is back in per cent and is the usual measure of risk.',
        result: round(Math.sqrt(v), 2),
      });
    }
    return steps;
  },

  distractors(p) {
    const v = variance(p);
    const noCov = part1(p) + part2(p);
    const average = w(p) * p.sd1 + (1 - w(p)) * p.sd2;
    const unsquared = w(p) * p.sd1 ** 2 + (1 - w(p)) * p.sd2 ** 2 + part12(p);
    const candidates =
      p.ask === 'variance'
        ? [
            { value: round(noCov, 2), mistakeCode: 'NO_COVARIANCE_TERM' },
            { value: round(average ** 2, 2), mistakeCode: 'WEIGHTED_SD_AVERAGE' },
            { value: round(unsquared, 2), mistakeCode: 'WEIGHTS_NOT_SQUARED' },
            { value: round(noCov + part12(p) / 2, 2), mistakeCode: 'ONE_COVARIANCE_TERM' },
          ]
        : [
            { value: round(Math.sqrt(noCov), 2), mistakeCode: 'NO_COVARIANCE_TERM' },
            { value: round(average, 2), mistakeCode: 'WEIGHTED_SD_AVERAGE' },
            { value: round(Math.sqrt(unsquared), 2), mistakeCode: 'WEIGHTS_NOT_SQUARED' },
            { value: round(v, 2), mistakeCode: 'NO_SQUARE_ROOT' },
          ];
    return cleanDistractors(target(p), candidates, RISK.tolerance, RISK.relTolerance);
  },
};
