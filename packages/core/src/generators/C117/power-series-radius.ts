import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /**
   * 'shrinking': Σ nᵖ(x − c)ⁿ/kⁿ, radius k; 'growing': Σ kⁿ(x − c)ⁿ/nᵖ, radius 1/k;
   * 'even': Σ nᵖx²ⁿ/kⁿ, radius √k.
   */
  form: 'shrinking' | 'growing' | 'even';
  k: number;
  /** The power of n in the coefficients (0 means no factor of n). */
  p: number;
  /** The centre of the series (0 for 'even'). */
  c: number;
}

const THREE_DP = { tolerance: 0.001, relTolerance: 0 } as const;
const GROWING_K = [2, 4, 5, 8, 10] as const;
const SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100] as const;

/** The radius of convergence. */
export function radiusOf({ form, k }: Params): number {
  if (form === 'shrinking') return k;
  if (form === 'growing') return 1 / k;
  return Math.sqrt(k);
}

const radius = (p: Params) => round(radiusOf(p), 3);

function candidates(p: Params) {
  const R = radiusOf(p);
  if (p.form === 'even') {
    return [
      { value: p.k, mistakeCode: 'FORGOT_SQUARE_ROOT' },
      { value: round(1 / R, 3), mistakeCode: 'RECIPROCAL_RADIUS' },
    ];
  }
  // The right-hand end point c + R; a radius is never negative, so a negative end point is no
  // likely slip.
  return [
    { value: round(1 / R, 3), mistakeCode: 'RECIPROCAL_RADIUS' },
    { value: round(p.c + R, 3), mistakeCode: 'ENDPOINT_AS_RADIUS' },
  ].filter((d) => d.value > 0);
}

/** nᵖ as LaTeX: "", "n", "n^{2}". */
const nPower = (p: number) => (p === 0 ? '' : p === 1 ? 'n' : `n^{${p}}`);

/** (x − c) as LaTeX: "(x - 3)", "(x + 2)". */
const shifted = (c: number) => (c > 0 ? `(x - ${c})` : `(x + ${-c})`);

/** The series in sigma notation. */
export function seriesLatex(p: Params): string {
  const sum = '\\sum_{n=1}^{\\infty}';
  if (p.form === 'shrinking') return `${sum} \\dfrac{${nPower(p.p)}\\,${shifted(p.c)}^n}{${p.k}^n}`;
  if (p.form === 'growing') return `${sum} \\dfrac{${p.k}^n\\,${shifted(p.c)}^n}{${nPower(p.p)}}`;
  return p.p === 0
    ? `${sum} \\dfrac{x^{2n}}{${p.k}^n}`
    : `${sum} \\dfrac{${nPower(p.p)}\\,x^{2n}}{${p.k}^n}`;
}

/** C117, difficulty 3: radius of convergence of a power series by the ratio test. */
export const powerSeriesRadius: Generator<Params> = {
  id: 'power-series-radius',
  title: 'Radius of convergence',
  topicId: 'C117',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const form = rng.pick(['shrinking', 'shrinking', 'growing', 'even'] as const);
      const sign = rng.next() < 0.5 ? 1 : -1;
      const p: Params =
        form === 'shrinking'
          ? { form, k: rng.int(2, 12), p: rng.int(1, 3), c: sign * rng.int(1, 6) }
          : form === 'growing'
            ? { form, k: rng.pick(GROWING_K), p: rng.int(1, 3), c: sign * rng.int(1, 6) }
            : { form, k: rng.pick(SQUARES), p: rng.int(0, 2), c: 0 };
      if (cleanDistractors(radius(p), candidates(p), THREE_DP.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `Use the ratio test to find the radius of convergence $R$ of the power series $${seriesLatex(p)}$.${p.form === 'growing' ? ' Give $R$ to 3 decimal places.' : ''}`,

  answer: (p) => ({ kind: 'numeric', value: radius(p), decimals: 3, ...THREE_DP }),

  steps(p) {
    const R = radius(p);
    const power = p.p === 1 ? '' : `^{${p.p}}`;
    const nRatio =
      p.p === 0
        ? ''
        : p.form === 'growing'
          ? `\\left(\\dfrac{n}{n+1}\\right)${power}\\,`
          : `\\left(\\dfrac{n+1}{n}\\right)${power}\\,`;
    const nWhy =
      p.p === 0
        ? 'Nothing in the ratio depends on n, so the limit is the ratio itself.'
        : `The factor with n tends to 1 as n → ∞, because (n + 1)/n → 1; so the power of n never changes the radius.`;
    if (p.form === 'even') {
      return [
        {
          text: 'Divide the (n + 1)-th term by the n-th term.',
          latex: `\\left|\\dfrac{a_{n+1}}{a_n}\\right| = ${nRatio}\\dfrac{x^{2}}{${p.k}}`,
          why: 'x²⁽ⁿ⁺¹⁾/x²ⁿ = x² and kⁿ/kⁿ⁺¹ = 1/k.',
        },
        {
          text: 'Take the limit as n → ∞.',
          latex: `L = \\dfrac{x^2}{${p.k}}`,
          why: nWhy,
        },
        {
          text: 'The series converges when L < 1.',
          latex: `\\dfrac{x^2}{${p.k}} < 1 \\iff |x| < \\sqrt{${p.k}} = ${num(R)}, \\quad R = ${num(R)}`,
          why: 'The ratio test gives convergence for L < 1. Here the condition is on x², so take the square root to get the condition on |x|.',
          result: R,
        },
      ];
    }
    const gap = p.c > 0 ? `|x - ${p.c}|` : `|x + ${-p.c}|`;
    const L = p.form === 'shrinking' ? `\\dfrac{${gap}}{${p.k}}` : `${p.k}\\,${gap}`;
    return [
      {
        text: 'Divide the (n + 1)-th term by the n-th term.',
        latex: `\\left|\\dfrac{a_{n+1}}{a_n}\\right| = ${nRatio}${L}`,
        why: `(x − c)ⁿ⁺¹/(x − c)ⁿ = x − c and ${p.form === 'shrinking' ? 'kⁿ/kⁿ⁺¹ = 1/k' : 'kⁿ⁺¹/kⁿ = k'}.`,
      },
      {
        text: 'Take the limit as n → ∞.',
        latex: `L = ${L}`,
        why: nWhy,
      },
      {
        text: 'The series converges when L < 1.',
        latex:
          p.form === 'shrinking'
            ? `${gap} < ${p.k}, \\quad R = ${p.k}`
            : `${gap} < \\dfrac{1}{${p.k}}, \\quad R = ${num(R, 3)}`,
        why: `The radius is the distance from the centre c = ${p.c < 0 ? '−' : ''}${Math.abs(p.c)} to either end of the interval, not the position of an end point such as c + R = ${num(p.c + R, 3).replace('-', '−')}.`,
        result: R,
      },
    ];
  },

  distractors: (p) => cleanDistractors(radius(p), candidates(p), THREE_DP.tolerance, 0),
};
