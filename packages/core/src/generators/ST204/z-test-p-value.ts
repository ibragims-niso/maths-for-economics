import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { tableCdf } from '../ST105/normal';
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
  type Side,
} from './contexts';

type Params = { kind: 'mean'; test: MeanTest } | { kind: 'proportion'; test: ProportionTest };

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const zOf = (p: Params) => (p.kind === 'mean' ? meanZ(p.test) : proportionZ(p.test));

/** The area beyond |z| in one tail, read from a table: 1 − Φ(|z|). */
const oneTail = (z: number) => round(1 - tableCdf(Math.abs(z)), 4);

/** The p-value: one tail for a one-sided test, both tails for a two-sided one. */
export function pValue(z: number, side: Side): number {
  return side === 'two' ? round(2 * oneTail(z), 4) : oneTail(z);
}

function wrongAnswers(p: Params): Distractor[] {
  const z = zOf(p);
  const side = p.test.side;
  const answer = pValue(z, side);
  const tail = oneTail(z);
  return cleanDistractors(
    answer,
    side === 'two'
      ? [
          { value: tail, mistakeCode: 'ONE_TAIL_ONLY' },
          { value: tableCdf(Math.abs(z)), mistakeCode: 'WRONG_TAIL' },
          { value: round(1 - answer, 4), mistakeCode: 'ONE_MINUS_P' },
        ]
      : [
          { value: round(2 * tail, 4), mistakeCode: 'DOUBLED_ONE_SIDED' },
          { value: round(1 - tail, 4), mistakeCode: 'WRONG_TAIL' },
          { value: round(1 - answer, 4), mistakeCode: 'ONE_MINUS_P' },
        ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

function statisticSteps(p: Params): Step[] {
  if (p.kind === 'mean') {
    const t = p.test;
    const se = meanSe(t);
    return [
      {
        text: 'Find the standard error of the sample mean.',
        latex: `\\operatorname{SE} = \\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{${num(t.sd)}}{${Math.sqrt(t.n)}} = ${num(se)}`,
        why: 'The sample mean varies from sample to sample with standard deviation σ/√n, so gaps are measured in these units.',
        result: round(se, 6),
      },
      {
        text: 'Compute the test statistic.',
        latex: `z = \\dfrac{\\bar x - \\mu_0}{\\operatorname{SE}} = \\dfrac{${num(t.xbar)} - ${num(t.mu0)}}{${num(se)}} = ${num(meanZ(t))}`,
        why: 'If H₀ is true, z is a draw from the standard normal distribution, so its size can be judged with the normal table.',
        result: meanZ(t),
      },
    ];
  }
  const t = p.test;
  const se = proportionSe(t);
  return [
    {
      text: 'Find the standard error under H₀.',
      latex: `\\operatorname{SE} = \\sqrt{\\dfrac{p_0(1 - p_0)}{n}} = \\sqrt{\\dfrac{${num(t.p0)} \\times ${num(1 - t.p0)}}{${num(t.n)}}} = ${num(se, 4)}`,
      why: 'The p-value is worked out as if H₀ were true, so the spread of p̂ uses p₀.',
      result: round(se, 6),
    },
    {
      text: 'Compute the test statistic.',
      latex: `z = \\dfrac{\\hat p - p_0}{\\operatorname{SE}} = \\dfrac{${num(proportionPhat(t), 4)} - ${num(t.p0)}}{${num(se, 4)}} = ${num(proportionZ(t))}`,
      why: 'For a large sample, p̂ is approximately normal (central limit theorem), so z is approximately N(0, 1) when H₀ is true.',
      result: proportionZ(t),
    },
  ];
}

function pValueStep(z: number, side: Side): Step {
  const answer = pValue(z, side);
  const phi = num(tableCdf(Math.abs(z)), 4);
  const a = num(Math.abs(z));
  if (side === 'two') {
    return {
      text: 'Add the areas in both tails beyond |z|.',
      latex: `p = P(|Z| \\ge ${a}) = 2\\,(1 - \\Phi(${a})) = 2\\,(1 - ${phi}) = ${num(answer, 4)}`,
      why: 'H₁ is two-sided, so results as far from μ₀ (or p₀) on either side count as at least as extreme as the one observed.',
      result: answer,
    };
  }
  if (side === 'greater') {
    return {
      text: 'Take the area to the right of z.',
      latex: `p = P(Z \\ge ${num(z)}) = 1 - \\Phi(${num(z)}) = 1 - ${phi} = ${num(answer, 4)}`,
      why: 'H₁ points upwards, so only results at least this far above the null value count as at least as extreme.',
      result: answer,
    };
  }
  return {
    text: 'Take the area to the left of z.',
    latex: `p = P(Z \\le ${num(z)}) = \\Phi(${num(z)}) = 1 - \\Phi(${a}) = 1 - ${phi} = ${num(answer, 4)}`,
    why: 'H₁ points downwards, so only results at least this far below the null value count; by symmetry Φ(−a) = 1 − Φ(a).',
    result: answer,
  };
}

/** ST204, difficulty 2: the p-value of a one- or two-sided z test for a mean or a proportion. */
export const zTestPValue: Generator<Params> = {
  id: 'z-test-p-value',
  title: 'p-value of a z test',
  topicId: 'ST204',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p: Params =
        rng.int(0, 1) === 1
          ? { kind: 'mean', test: drawMeanTest(rng, { small: false, zMin: 0.5, zMax: 3 }) }
          : { kind: 'proportion', test: drawProportionTest(rng, { zMin: 0.5, zMax: 3 }) };
      const needed = p.test.side === 'two' ? 3 : 2;
      if (wrongAnswers(p).length < needed) continue;
      return p;
    }
  },

  stem(p) {
    const setting =
      p.kind === 'mean'
        ? `${meanSetting(p.test, true)} To test ${hypotheses('\\mu', num(p.test.mu0), p.test.side)}`
        : `${proportionSetting(p.test)} To test ${hypotheses('p', num(p.test.p0), p.test.side)}`;
    return `${setting}, find the p-value of the $z$ test. Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({
    kind: 'numeric',
    value: pValue(zOf(p), p.test.side),
    decimals: 4,
    ...PROB,
  }),

  steps(p) {
    const z = zOf(p);
    const answer = pValue(z, p.test.side);
    const reject = answer <= 0.05;
    return [
      ...statisticSteps(p),
      pValueStep(z, p.test.side),
      {
        text: 'Compare with a 5 % significance level.',
        latex: reject
          ? `p = ${num(answer, 4)} \\le 0.05 \\Rightarrow \\text{reject } H_0`
          : `p = ${num(answer, 4)} > 0.05 \\Rightarrow \\text{do not reject } H_0`,
        why: reject
          ? 'A result this extreme would happen at most 5 % of the time if H₀ were true, so the data count as evidence against H₀.'
          : 'A result like this is not unusual if H₀ is true, so the data do not give strong evidence against it (which does not prove H₀).',
      },
    ];
  },

  distractors: wrongAnswers,
};
