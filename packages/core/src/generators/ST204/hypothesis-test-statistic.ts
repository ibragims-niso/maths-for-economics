import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  drawMeanTest,
  drawProportionTest,
  hypotheses,
  type MeanTest,
  meanSe,
  meanSetting,
  meanZ,
  type ProportionTest,
  proportionPhat,
  proportionSe,
  proportionSetting,
  proportionZ,
} from './contexts';

type Params =
  /** A test about a mean: z test when σ is known, t test when only the sample's s is. */
  { kind: 'mean'; known: boolean; test: MeanTest } | { kind: 'proportion'; test: ProportionTest };

/** The statistic is exact on the 0.01 grid, so only a small absolute tolerance is needed. */
const STAT = { tolerance: 0.01, relTolerance: 0 } as const;

const statistic = (p: Params) => (p.kind === 'mean' ? meanZ(p.test) : proportionZ(p.test));

function wrongAnswers(p: Params): Distractor[] {
  const z = statistic(p);
  const candidates: Distractor[] =
    p.kind === 'mean'
      ? [
          { value: round((p.test.xbar - p.test.mu0) / p.test.sd, 2), mistakeCode: 'SD_NOT_SE' },
          { value: -z, mistakeCode: 'SIGN_REVERSED' },
          {
            value: round((p.test.xbar - p.test.mu0) / (p.test.sd / p.test.n), 2),
            mistakeCode: 'DIVIDED_BY_N',
          },
        ]
      : (() => {
          const t = p.test;
          const ph = proportionPhat(t);
          return [
            {
              value: round((ph - t.p0) / Math.sqrt(t.p0 * (1 - t.p0)), 2),
              mistakeCode: 'SD_NOT_SE',
            },
            { value: -z, mistakeCode: 'SIGN_REVERSED' },
            {
              value: round((ph - t.p0) / Math.sqrt((ph * (1 - ph)) / t.n), 2),
              mistakeCode: 'PHAT_IN_SE',
            },
          ];
        })();
  return cleanDistractors(z, candidates, STAT.tolerance, STAT.relTolerance);
}

function meanSteps(test: MeanTest, known: boolean): Step[] {
  const se = meanSe(test);
  const z = meanZ(test);
  const diff = round(test.xbar - test.mu0, 4);
  const s = known ? '\\sigma' : 's';
  const letter = known ? 'z' : 't';
  return [
    {
      text: 'Find how far the sample mean is from the value in H₀.',
      latex: `\\bar x - \\mu_0 = ${num(test.xbar)} - ${num(test.mu0)} = ${num(diff, 4)}`,
      why: 'The test asks whether this gap is too large to be put down to sampling noise when H₀ is true.',
      result: diff,
    },
    {
      text: 'Find the standard error of the sample mean.',
      latex: `\\operatorname{SE} = \\dfrac{${s}}{\\sqrt{n}} = \\dfrac{${num(test.sd)}}{\\sqrt{${test.n}}} = \\dfrac{${num(test.sd)}}{${Math.sqrt(test.n)}} = ${num(se)}`,
      why: known
        ? 'The gap must be measured against the spread of the sample mean, σ/√n, not against the spread σ of single observations.'
        : 'σ is unknown, so the sample standard deviation s takes its place: s/√n estimates the spread of the sample mean.',
      result: round(se, 6),
    },
    {
      text: 'Divide the gap by the standard error.',
      latex: `${letter} = \\dfrac{\\bar x - \\mu_0}{${s}/\\sqrt{n}} = \\dfrac{${num(diff, 4)}}{${num(se)}} = ${num(z)}`,
      why: known
        ? 'The statistic counts how many standard errors x̄ lies from μ₀; if H₀ is true it is a draw from N(0, 1).'
        : `Using s instead of σ adds extra uncertainty, so if H₀ is true the statistic follows a t distribution with n − 1 = ${test.n - 1} degrees of freedom rather than N(0, 1).`,
      result: z,
    },
  ];
}

function proportionSteps(test: ProportionTest): Step[] {
  const se = proportionSe(test);
  const z = proportionZ(test);
  const ph = proportionPhat(test);
  const diff = round(ph - test.p0, 6);
  return [
    {
      text: 'Find how far the sample proportion is from the value in H₀.',
      latex: `\\hat p - p_0 = ${num(ph, 4)} - ${num(test.p0)} = ${num(diff, 4)}`,
      why: 'The test asks whether this gap is too large to be put down to sampling noise when H₀ is true.',
      result: diff,
    },
    {
      text: 'Find the standard error using the value in H₀.',
      latex: `\\operatorname{SE} = \\sqrt{\\dfrac{p_0(1 - p_0)}{n}} = \\sqrt{\\dfrac{${num(test.p0)} \\times ${num(1 - test.p0)}}{${num(test.n)}}} = ${num(se, 4)}`,
      why: 'The test works out what would happen if H₀ were true, so the spread of p̂ is computed with p₀, not with the sample proportion p̂.',
      result: round(se, 6),
    },
    {
      text: 'Divide the gap by the standard error.',
      latex: `z = \\dfrac{\\hat p - p_0}{\\operatorname{SE}} = \\dfrac{${num(diff, 4)}}{${num(se, 4)}} = ${num(z)}`,
      why: 'With np₀ and n(1 − p₀) well above 10, the central limit theorem makes this approximately N(0, 1) when H₀ is true.',
      result: z,
    },
  ];
}

/** ST204, difficulty 1: the z or t test statistic for a mean, or the z statistic for a proportion. */
export const hypothesisTestStatistic: Generator<Params> = {
  id: 'hypothesis-test-statistic',
  title: 'Test statistic',
  topicId: 'ST204',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const roll = rng.int(1, 10);
      const p: Params =
        roll <= 4
          ? {
              kind: 'mean',
              known: true,
              test: drawMeanTest(rng, { small: false, zMin: 0.5, zMax: 3.5 }),
            }
          : roll <= 7
            ? {
                kind: 'mean',
                known: false,
                test: drawMeanTest(rng, { small: true, zMin: 0.5, zMax: 3.5 }),
              }
            : { kind: 'proportion', test: drawProportionTest(rng, { zMin: 0.5, zMax: 3.5 }) };
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    if (p.kind === 'proportion') {
      const t = p.test;
      return `${proportionSetting(t)} To test ${hypotheses('p', num(t.p0), t.side)}, calculate the test statistic $z$. Give your answer to 2 decimal places.`;
    }
    const t = p.test;
    const letter = p.known ? 'z' : 't';
    return `${meanSetting(t, p.known)} To test ${hypotheses('\\mu', num(t.mu0), t.side)}, calculate the test statistic $${letter}$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: statistic(p), decimals: 2, ...STAT }),

  steps: (p) => (p.kind === 'mean' ? meanSteps(p.test, p.known) : proportionSteps(p.test)),

  distractors: wrongAnswers,
};
