import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'insurance' | 'survey' | 'poll';

interface Params {
  context: Context;
  /** Mean of one draw (not needed for the answer; it fixes what "within ε" is measured from). */
  mu: number;
  /** Standard deviation of one draw; 0.5 for a yes/no answer in the worst case. */
  sigma: number;
  /** The accuracy ε. */
  eps: number;
  /** The allowed chance of missing, α, in per cent (the guarantee is 1 − α). */
  alphaPct: number;
}

/** The answer is a whole number of draws and must be exact. */
const COUNT = { tolerance: 0, relTolerance: 0 } as const;

const alphaOf = (p: Params) => p.alphaPct / 100;
/** The quotient σ²/(αε²) that n must reach. */
const quotient = (p: Params, s2 = p.sigma ** 2, e2 = p.eps ** 2, a = alphaOf(p)) => s2 / (a * e2);
/** The smallest whole number at least q (ignoring floating-point dust just above a whole number). */
const roundUp = (q: number) => Math.ceil(q - 1e-9);
const isWhole = (q: number) => Math.abs(q - Math.round(q)) < 1e-9;
const target = (p: Params) => roundUp(quotient(p));

function draw(context: Context, rng: Rng) {
  if (context === 'insurance') {
    return { mu: 50 * rng.int(4, 16), sigma: 100 * rng.int(8, 30), eps: 5 * rng.int(4, 30) };
  }
  if (context === 'survey') {
    return { mu: 10 * rng.int(25, 60), sigma: 10 * rng.int(10, 40), eps: 5 * rng.int(2, 16) };
  }
  return { mu: 0, sigma: 0.5, eps: rng.pick([0.02, 0.025, 0.03, 0.04, 0.05]) };
}

/** Values a student gets from the common mistakes. */
function wrongAnswers(p: Params): Distractor[] {
  const q = quotient(p);
  const candidates = [
    { value: Math.floor(q + 1e-9), mistakeCode: 'ROUNDED_DOWN' },
    { value: roundUp(quotient(p, p.sigma)), mistakeCode: 'SD_NOT_VARIANCE' },
    { value: roundUp(quotient(p, undefined, p.eps)), mistakeCode: 'EPS_NOT_SQUARED' },
    // The guaranteed probability 1 − α used in place of α.
    {
      value: roundUp(quotient(p, undefined, undefined, 1 - alphaOf(p))),
      mistakeCode: 'CONFIDENCE_NOT_ALPHA',
    },
  ];
  return cleanDistractors(
    target(p),
    candidates.filter((d) => d.value >= 1),
    COUNT.tolerance,
    COUNT.relTolerance,
  );
}

/** ST206, difficulty 3: smallest n with σ²/(nε²) ≤ α, the sample size Chebyshev guarantees. */
export const chebyshevSampleSize: Generator<Params> = {
  id: 'chebyshev-sample-size',
  title: 'Sample size from Chebyshev',
  topicId: 'ST206',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['insurance', 'survey', 'poll'] as const);
      const alphaPct = rng.pick([1, 2, 4, 5, 10, 20] as const);
      const p = { context, ...draw(context, rng), alphaPct };
      const n = target(p);
      // A sample size that a firm or an office could actually reach, and enough wrong answers.
      if (n < 50 || n > 200000 || wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const conf = num(1 - alphaOf(p));
    if (p.context === 'insurance') {
      return `The claim on one insurance policy in a year has mean $${num(p.mu)}$ and standard deviation $${num(p.sigma)}$, and claims on different policies are independent. Using Chebyshev's inequality, how many policies must the insurer sell so that the average claim per policy is less than $${num(p.eps)}$ away from $${num(p.mu)}$ with probability at least $${conf}$?`;
    }
    if (p.context === 'survey') {
      return `Monthly spending on food of one household has mean $${num(p.mu)}$ and standard deviation $${num(p.sigma)}$. A statistics office samples households at random and independently. Using Chebyshev's inequality, how many households must it sample so that the sample average is less than $${num(p.eps)}$ away from $${num(p.mu)}$ with probability at least $${conf}$?`;
    }
    return `A polling firm asks voters, chosen at random and independently, whether they support a new tax. Each answer counts as 1 (yes) or 0 (no), so its standard deviation $\\sqrt{p(1-p)}$ is at most $0.5$ whatever the true share $p$. Using Chebyshev's inequality with $\\sigma = 0.5$, how many voters must the firm ask so that the share of yes answers in the sample is less than $${num(p.eps, 3)}$ away from $p$ with probability at least $${conf}$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...COUNT }),

  steps(p) {
    const a = alphaOf(p);
    const q = quotient(p);
    const s2 = p.sigma ** 2;
    const e2 = p.eps ** 2;
    return [
      {
        text: 'Write the Chebyshev bound for the average of n draws.',
        latex: `P(|\\bar X - \\mu| \\ge \\varepsilon) \\le \\frac{\\sigma^2}{n\\varepsilon^2} = \\frac{${num(s2, 4)}}{n \\times ${num(e2, 6)}}`,
        why: 'The average of n independent draws has variance σ²/n; Chebyshev divides that variance by ε².',
      },
      {
        text: `Ask for the bound to be at most α = ${num(a)}.`,
        latex: `\\frac{\\sigma^2}{n\\varepsilon^2} \\le ${num(a)} \\iff n \\ge \\frac{\\sigma^2}{\\alpha\\,\\varepsilon^2} = \\frac{${num(s2, 4)}}{${num(a)} \\times ${num(e2, 6)}} = ${num(q, 2)}`,
        why: `Missing by ε or more must have probability at most α = 1 − ${num(1 - a)}; the bound falls as n grows, so solve for n.`,
        result: round(q, 2),
      },
      {
        text: 'Round up to a whole number.',
        latex: `n = ${num(target(p), 0)}`,
        why: isWhole(q)
          ? 'The quotient is already a whole number, so exactly this many draws are enough.'
          : 'n counts policies, households or people, so it is a whole number; rounding down would leave the bound just above α.',
        result: target(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
