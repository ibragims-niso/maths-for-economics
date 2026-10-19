import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { EXACT, minors3, paren, rows3, type Sym3 } from './forms';

interface Params {
  /** Weights in tenths (each at least 1, adding up to 10). */
  w: [number, number, number];
  /** Covariance matrix of the returns in squared percentage points: variances p, q, r on the diagonal. */
  cov: Sym3;
}

const weights = (p: Params) => p.w.map((x) => x / 10) as [number, number, number];

/** The three parts of wᵀΣw, each exact to 2 decimals (weights are tenths, Σ is whole numbers). */
function parts(p: Params) {
  const [w1, w2, w3] = p.w;
  const { p: s11, q: s22, r: s33, d: s12, e: s13, f: s23 } = p.cov;
  // Work in hundredths with whole numbers, then divide once, so there is no rounding drift.
  const own = (w1 * w1 * s11 + w2 * w2 * s22 + w3 * w3 * s33) / 100;
  const cross = (w1 * w2 * s12 + w1 * w3 * s13 + w2 * w3 * s23) / 100;
  const linear = (w1 * s11 + w2 * s22 + w3 * s33) / 10;
  return { own: round(own, 2), cross: round(cross, 2), linear: round(linear, 2) };
}

const variance = (p: Params) => {
  const { own, cross } = parts(p);
  return round(own + 2 * cross, 2);
};

const candidates = (p: Params): Distractor[] => {
  const { own, cross, linear } = parts(p);
  return [
    { value: own, mistakeCode: 'NO_COVARIANCE_TERM' },
    { value: round(own + cross, 2), mistakeCode: 'ONE_COVARIANCE_TERM' },
    { value: round(linear + 2 * cross, 2), mistakeCode: 'WEIGHTS_NOT_SQUARED' },
  ];
};

/** LA204, difficulty 3: the variance wᵀΣw of a three-asset portfolio from its covariance matrix. */
export const portfolioVarianceThreeAssets: Generator<Params> = {
  id: 'portfolio-variance-three-assets',
  title: 'Variance of a three-asset portfolio',
  topicId: 'LA204',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const w1 = rng.int(1, 8);
      const w2 = rng.int(1, 9 - w1);
      const w: [number, number, number] = [w1, w2, 10 - w1 - w2];
      // Standard deviations of 4 % to 30 %; correlations in tenths from −0.5 to 0.9.
      const sd = [rng.int(2, 15) * 2, rng.int(2, 15) * 2, rng.int(2, 15) * 2];
      const corr = () => rng.int(-5, 9) / 10;
      const covOf = (i: number, j: number) => Math.round(corr() * (sd[i] ?? 0) * (sd[j] ?? 0));
      const cov: Sym3 = {
        p: (sd[0] ?? 0) ** 2,
        q: (sd[1] ?? 0) ** 2,
        r: (sd[2] ?? 0) ** 2,
        d: covOf(0, 1),
        e: covOf(0, 2),
        f: covOf(1, 2),
      };
      // A real covariance matrix is positive semidefinite; keep only positive definite ones.
      if (minors3(cov).some((m) => m <= 0)) continue;
      const p = { w, cov };
      if (cleanDistractors(variance(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const [w1, w2, w3] = weights(p);
    return `An investor splits her savings between three funds with weights $\\mathbf{w} = (${num(w1)}, ${num(w2)}, ${num(w3)})$. The covariance matrix of the funds' annual returns, in squared percentage points, is $\\Sigma = ${pmatrix(rows3(p.cov))}$. Find the variance of the portfolio's return in squared percentage points. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: variance(p), decimals: 2, ...EXACT }),

  steps(p) {
    const [w1, w2, w3] = weights(p);
    const c = p.cov;
    const { own, cross } = parts(p);
    const v = variance(p);
    return [
      {
        text: 'Write the variance as the quadratic form wᵀΣw.',
        latex: `\\sigma_p^2 = \\mathbf{w}^{\\mathsf T}\\Sigma\\,\\mathbf{w} = \\sum_i w_i^2 \\sigma_{ii} + 2\\sum_{i<j} w_i w_j \\sigma_{ij}`,
        why: 'The portfolio return is w₁R₁ + w₂R₂ + w₃R₃, and the variance of a sum of weighted returns adds every weighted covariance, Cov(Rᵢ, Rⱼ) = σᵢⱼ, over all pairs (i, j). Each pair with i ≠ j appears twice, as (i, j) and (j, i).',
      },
      {
        text: 'Add the variance terms: each squared weight times its fund’s variance.',
        latex: `${num(w1)}^2 \\cdot ${num(c.p)} + ${num(w2)}^2 \\cdot ${num(c.q)} + ${num(w3)}^2 \\cdot ${num(c.r)} = ${num(own)}`,
        why: 'These are the diagonal entries of Σ. The weights are squared because a fund held at weight w moves the portfolio by w times its own return.',
        result: own,
      },
      {
        text: 'Add the covariance terms, each counted twice.',
        latex: `2\\,(${num(w1)} \\cdot ${num(w2)} \\cdot ${paren(c.d)} + ${num(w1)} \\cdot ${num(w3)} \\cdot ${paren(c.e)} + ${num(w2)} \\cdot ${num(w3)} \\cdot ${paren(c.f)}) = 2 \\cdot ${paren(cross)} = ${num(2 * cross)}`,
        why: 'Σ is symmetric, so σ₁₂ sits both above and below the diagonal; that is where the factor 2 comes from, just as bxy splits into b/2 and b/2 in a two-variable form.',
        result: round(2 * cross, 2),
      },
      {
        text: 'Add the two parts.',
        latex: `\\sigma_p^2 = ${num(own)} + ${paren(2 * cross)} = ${num(v)}`,
        why: `The result is positive, as it must be: Σ is positive definite, so wᵀΣw > 0 for every non-zero w. The standard deviation is √${num(v)} ≈ ${num(Math.sqrt(v))} %.`,
        result: v,
      },
    ];
  },

  distractors: (p) => cleanDistractors(variance(p), candidates(p), EXACT.tolerance, 0),
};
