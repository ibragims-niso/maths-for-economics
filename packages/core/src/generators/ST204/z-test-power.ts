import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals } from '../ST105/contexts';
import { normalCdf, zText } from '../ST105/normal';
import { hypotheses, MEAN_CONTEXTS, type MeanContext } from './contexts';

/** One-sided critical values z_α, as in a table, for α in per cent. */
export const Z_ONE_SIDED: Readonly<Record<number, number>> = { 10: 1.282, 5: 1.645, 1: 2.326 };
/** Two-sided critical values z_(α/2), for α in per cent. */
export const Z_TWO_SIDED: Readonly<Record<number, number>> = { 10: 1.645, 5: 1.96, 1: 2.576 };

interface Params {
  context: MeanContext;
  mu0: number;
  /** Known population standard deviation σ. */
  sd: number;
  n: number;
  /** The true mean under the alternative, μ₁. */
  mu1: number;
  /** H₁: μ > μ₀ ('greater') or H₁: μ < μ₀ ('less'). */
  side: 'greater' | 'less';
  /** Significance level in per cent. */
  alpha: 1 | 5 | 10;
}

/** Answers to 2 decimal places: anything that rounds to the answer is accepted. */
const POWER = { tolerance: 0.005, relTolerance: 0 } as const;

const se = (p: Params) => p.sd / Math.sqrt(p.n);
/** How many standard errors the true mean lies from μ₀, in the direction of H₁. */
const shift = (p: Params) => round(Math.abs(p.mu1 - p.mu0) / se(p), 6);
const zAlpha = (p: Params) => Z_ONE_SIDED[p.alpha] ?? Number.NaN;

/** P(reject H₀ | μ = μ₁) = Φ(shift − z) for a one-sided test with critical value z. */
const powerWith = (shiftInSe: number, z: number) => normalCdf(shiftInSe - z);

const exactPower = (p: Params) => powerWith(shift(p), zAlpha(p));

/** The critical sample mean: reject H₀ when x̄ is beyond it. */
const criticalMean = (p: Params) =>
  p.side === 'greater' ? p.mu0 + zAlpha(p) * se(p) : p.mu0 - zAlpha(p) * se(p);

function wrongAnswers(p: Params): Distractor[] {
  const power = exactPower(p);
  return cleanDistractors(
    round(power, 2),
    [
      { value: round(1 - power, 2), mistakeCode: 'BETA_NOT_POWER' },
      {
        value: round(powerWith(Math.abs(p.mu1 - p.mu0) / p.sd, zAlpha(p)), 2),
        mistakeCode: 'SD_NOT_SE',
      },
      {
        value: round(powerWith(shift(p), Z_TWO_SIDED[p.alpha] ?? Number.NaN), 2),
        mistakeCode: 'TWO_SIDED_CRITICAL',
      },
    ],
    POWER.tolerance,
    POWER.relTolerance,
  );
}

/** True when a table lookup at z rounded down or up to 2 decimals gives the same 2-decimal answer. */
function unambiguous(p: Params): boolean {
  const a = shift(p) - zAlpha(p);
  const target = round(exactPower(p), 2);
  return [Math.floor(a * 100 + 1e-9) / 100, Math.ceil(a * 100 - 1e-9) / 100].every(
    (b) => round(round(normalCdf(b), 4), 2) === target,
  );
}

/** ST204, difficulty 3: the power of a one-sided z test for a mean against a given true mean. */
export const zTestPower: Generator<Params> = {
  id: 'z-test-power',
  title: 'Power of a z test',
  topicId: 'ST204',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(MEAN_CONTEXTS) as MeanContext[]);
      const c = MEAN_CONTEXTS[context];
      const sides = (c.sides as readonly string[]).filter(
        (s): s is 'greater' | 'less' => s === 'greater' || s === 'less',
      );
      if (sides.length === 0) continue;
      const side = rng.pick(sides);
      const mu0 = rng.pick(c.mu0s);
      const sd = rng.pick(c.sds);
      const n = rng.pick([36, 49, 64, 81, 100, 144]);
      const s = sd / Math.sqrt(n);
      if (!hasDecimals(s, 2) || sd >= mu0) continue;
      // The true mean lies a quarter-step multiple of the standard error from μ₀.
      const d = rng.int(2, 16) / 4;
      const mu1 = round(side === 'greater' ? mu0 + d * s : mu0 - d * s, 6);
      if (!hasDecimals(mu1, c.decimals) || mu1 <= 0) continue;
      const alpha = rng.pick([1, 5, 10] as const);
      const p: Params = { context, mu0, sd, n, mu1, side, alpha };
      const power = exactPower(p);
      if (power < 0.1 || power > 0.95 || round(power, 2) <= alpha / 100) continue;
      if (!unambiguous(p)) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = MEAN_CONTEXTS[p.context];
    return `${c.intro(num(p.mu0))} The standard deviation of ${c.population} is known to be $\\sigma = ${num(p.sd)}$. A random sample of $n = ${p.n}$ ${c.unit} will be used to test ${hypotheses('\\mu', num(p.mu0), p.side)} with a $z$ test at the ${p.alpha} % significance level. If in fact $\\mu = ${num(p.mu1)}$, what is the power of the test, the probability that it rejects $H_0$? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(exactPower(p), 2), decimals: 2, ...POWER }),

  steps(p) {
    const s = se(p);
    const z = zAlpha(p);
    const crit = criticalMean(p);
    const at = round(z - shift(p), 3);
    const power = round(exactPower(p), 2);
    const up = p.side === 'greater';
    return [
      {
        text: 'Find the standard error.',
        latex: `\\operatorname{SE} = \\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{${num(p.sd)}}{${Math.sqrt(p.n)}} = ${num(s)}`,
        why: 'Both the rejection rule and the behaviour of x̄ under the true mean are measured in standard errors.',
        result: round(s, 6),
      },
      {
        text: 'Turn the rejection rule into a cut-off for the sample mean.',
        latex: `\\text{reject } H_0 \\text{ when } \\bar x ${up ? '>' : '<'} ${num(p.mu0)} ${up ? '+' : '-'} ${zText(z)} \\times ${num(s)} = ${num(crit, 5)}`,
        why: `At the ${p.alpha} % level a one-sided test rejects when z is beyond ${zText(z)}, that is when x̄ is more than ${zText(z)} standard errors ${up ? 'above' : 'below'} μ₀.`,
        result: round(crit, 5),
      },
      {
        text: 'Standardise the cut-off using the true mean.',
        latex: `\\dfrac{${num(crit, 5)} - ${num(p.mu1)}}{${num(s)}} = ${num(up ? at : -at, 3)}`,
        why: `Power is worked out under the alternative, so now X̄ ~ N(${num(p.mu1)}, SE²) is centred on the true mean μ₁, not on μ₀.`,
        result: up ? at : -at,
      },
      {
        text: 'Find the probability of landing in the rejection region.',
        latex: up
          ? `\\text{power} = P(\\bar X > ${num(crit, 5)}) = 1 - \\Phi(${num(at, 3)}) = \\Phi(${num(-at, 3)}) \\approx ${num(power)}`
          : `\\text{power} = P(\\bar X < ${num(crit, 5)}) = \\Phi(${num(-at, 3)}) \\approx ${num(power)}`,
        why: 'Power is the chance that the test correctly rejects H₀ when the true mean is μ₁; 1 minus it is β, the chance of a type II error.',
        result: power,
      },
    ];
  },

  distractors: wrongAnswers,
};
