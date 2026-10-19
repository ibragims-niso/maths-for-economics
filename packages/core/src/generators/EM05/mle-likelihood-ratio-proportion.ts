import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The yes/no settings and where the hypothesised probability p₀ comes from. */
type Context = 'loans' | 'cars' | 'exporters';

interface Params {
  context: Context;
  /** Number of independent trials. */
  n: number;
  /** Number of "yes" outcomes (defaults, car purchases, exporters). */
  k: number;
  /** The hypothesised probability p₀, in hundredths (5 means 0.05). */
  p0: number;
}

/** LR to 2 decimal places; 0.02 allows for log-likelihoods rounded to 2 decimals on the way. */
const LR_TOL = { tolerance: 0.02, relTolerance: 0 } as const;

/** The 5 % critical value of χ² with 1 degree of freedom. */
export const CHI2_1_5PC = 3.841;

interface Setting {
  text: (n: number, k: number, p0: string) => string;
  what: string;
}

const SETTINGS: Readonly<Record<Context, Setting>> = {
  loans: {
    text: (n, k, p0) =>
      `Of ${n} small-business loans that a bank made, ${k} defaulted within a year. The bank's risk model assumes a default probability of ${p0}.`,
    what: 'default probability $p$',
  },
  cars: {
    text: (n, k, p0) =>
      `In a survey of ${n} households, ${k} bought a car in the past year. A car maker's planning model assumes that a household buys a car in a given year with probability ${p0}.`,
    what: 'probability $p$ of buying a car in a year',
  },
  exporters: {
    text: (n, k, p0) =>
      `Of ${n} manufacturing firms in a survey, ${k} export. An earlier census found that a share ${p0} of firms exported.`,
    what: 'probability $p$ that a firm exports',
  },
};

/** ℓ(p) = k ln p + (n − k) ln(1 − p). */
export const logLik = (n: number, k: number, p: number) =>
  k * Math.log(p) + (n - k) * Math.log(1 - p);

export const pHatOf = (p: Params) => p.k / p.n;
const p0Of = (p: Params) => p.p0 / 100;
/** The exact statistic 2[ℓ(p̂) − ℓ(p₀)]. */
export const lrOf = (p: Params) => 2 * (logLik(p.n, p.k, pHatOf(p)) - logLik(p.n, p.k, p0Of(p)));
const target = (p: Params) => round(lrOf(p), 2);

function candidates(p: Params): Distractor[] {
  const lr = lrOf(p);
  return [
    { value: round(lr / 2, 2), mistakeCode: 'LR_NOT_DOUBLED' },
    { value: round(lr / Math.LN10, 2), mistakeCode: 'LOG_BASE_10' },
    { value: round(2 * p.k * Math.log(pHatOf(p) / p0Of(p)), 2), mistakeCode: 'DROPPED_FAILURES' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), LR_TOL.tolerance, LR_TOL.relTolerance);

/** EM05, difficulty 3: the likelihood-ratio statistic 2[ℓ(p̂) − ℓ(p₀)] for a probability from k of n. */
export const mleLikelihoodRatioProportion: Generator<Params> = {
  id: 'mle-likelihood-ratio-proportion',
  title: 'Likelihood-ratio test of a probability',
  topicId: 'EM05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const n = rng.pick([40, 50, 60, 80, 100, 120, 150, 200, 250, 400]);
      const k = rng.int(2, Math.floor(0.4 * n));
      const p: Params = {
        context: rng.pick(['loans', 'cars', 'exporters'] as const),
        n,
        k,
        p0: rng.pick([2, 3, 4, 5, 8, 10, 15, 20, 25, 30]),
      };
      // p̂ = k/n with at most 3 decimals, different from p₀.
      if ((k * 1000) % n !== 0 || k * 100 === p.p0 * n) continue;
      const lr = lrOf(p);
      // A statistic of a readable size and a clear verdict either way.
      if (lr < 0.5 || lr > 25 || Math.abs(lr - CHI2_1_5PC) < 0.5) continue;
      // The steps show ℓ values to 3 decimals; their difference must give the same 2-decimal LR.
      const lu = round(logLik(n, k, pHatOf(p)), 3);
      const lr0 = round(logLik(n, k, p0Of(p)), 3);
      if (round(2 * (lu - lr0), 2) !== target(p)) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem(p) {
    const s = SETTINGS[p.context];
    const p0 = num(p0Of(p));
    return `${s.text(p.n, p.k, p0)} Treat the outcomes as independent, with ${s.what}, so the log-likelihood is $\\ell(p) = k\\ln p + (n - k)\\ln(1 - p)$. Find the likelihood-ratio statistic for $H_0\\colon p = ${p0}$. (The 5 % critical value of $\\chi^2_1$ is 3.841.) Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...LR_TOL }),

  steps(p) {
    const { n, k } = p;
    const ph = pHatOf(p);
    const p0 = p0Of(p);
    const lu = round(logLik(n, k, ph), 3);
    const lr0 = round(logLik(n, k, p0), 3);
    const lr = target(p);
    const reject = lr > CHI2_1_5PC;
    return [
      {
        text: 'Find the unrestricted estimate.',
        latex: `\\hat p = \\dfrac{k}{n} = \\dfrac{${k}}{${n}} = ${num(ph, 3)}`,
        why: 'Without the restriction, the log-likelihood is highest at the sample share k/n, the maximum likelihood estimate.',
        result: ph,
      },
      {
        text: 'Evaluate the log-likelihood at the estimate.',
        latex: `\\ell_U = \\ell(${num(ph, 3)}) = ${k}\\ln ${num(ph, 3)} + ${n - k}\\ln ${num(1 - ph, 3)} = ${num(lu, 3)}`,
        why: 'This is the highest value the log-likelihood can reach with these data.',
        result: lu,
      },
      {
        text: 'Evaluate it under the null hypothesis.',
        latex: `\\ell_R = \\ell(${num(p0)}) = ${k}\\ln ${num(p0)} + ${n - k}\\ln ${num(1 - p0)} = ${num(lr0, 3)}`,
        why: 'The restricted model has no free parameter left: p is fixed at the hypothesised value, so ℓ_R is lower than ℓ_U.',
        result: lr0,
      },
      {
        text: 'Double the gap.',
        latex: `\\text{LR} = 2(\\ell_U - \\ell_R) = 2\\,(${num(lu, 3)} - (${num(lr0, 3)})) = ${num(lr)}`,
        why: 'Twice the drop in the log-likelihood has approximately a χ² distribution with 1 degree of freedom (one restriction) when H₀ is true.',
        result: lr,
      },
      {
        text: 'Compare with the critical value.',
        latex: `${num(lr)} ${reject ? '>' : '<'} \\chi^2_1(5\\,\\%) = 3.841`,
        why: reject
          ? `The data are much less likely under p = ${num(p0)} than at p̂, so H₀ is rejected at 5 %.`
          : `The drop in fit from imposing p = ${num(p0)} is small, so H₀ is not rejected at 5 %.`,
      },
    ];
  },

  distractors: (p) => kept(p),
};
