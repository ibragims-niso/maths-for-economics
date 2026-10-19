import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Density f(x, y) = k·x^m·y^n on the unit square; k = (m + 1)(n + 1) is for the student to find. */
  m: number;
  n: number;
  /** The probability asked for is P(X ≤ p and Y ≤ q). */
  p: number;
  q: number;
}

/** A probability to 4 decimal places: only rounding slips are accepted. */
export const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const CUTS = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] as const;

export const constantK = (p: Params) => (p.m + 1) * (p.n + 1);
/** P(X ≤ p, Y ≤ q) = p^(m+1)·q^(n+1), rounded to 4 decimals: the answer. */
export const probability = (p: Params) => round(p.p ** (p.m + 1) * p.q ** (p.n + 1), 4);

/** x^m written for LaTeX: '' for m = 0, 'x' for m = 1, 'x^{m}' otherwise. */
const power = (v: string, k: number) => (k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`);
/** base^k for LaTeX, without the exponent 1. */
const powNum = (base: number, k: number) => (k === 1 ? num(base) : `${num(base)}^{${k}}`);
/** base^k / k for LaTeX; just the base when k = 1. */
const powOver = (base: number, k: number) =>
  k === 1 ? num(base) : `\\tfrac{${num(base)}^{${k}}}{${k}}`;

const candidates = (p: Params): Distractor[] => {
  const exact = p.p ** (p.m + 1) * p.q ** (p.n + 1);
  const list: Distractor[] = [
    { value: round(exact / constantK(p), 4), mistakeCode: 'NOT_NORMALISED' },
    { value: round(p.p * p.q, 4), mistakeCode: 'AREA_NOT_PROBABILITY' },
  ];
  const noDivide = exact * constantK(p);
  if (noDivide < 1) list.push({ value: round(noDivide, 4), mistakeCode: 'POWER_NOT_DIVIDED' });
  return list;
};

/** MV13, difficulty 2: normalise the joint density k·x^m·y^n on [0, 1]², then find P(X ≤ p, Y ≤ q). */
export const jointDensityRectangleProbability: Generator<Params> = {
  id: 'joint-density-rectangle-probability',
  title: 'Joint density probability',
  topicId: 'MV13',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p: Params = {
        m: rng.int(0, 3),
        n: rng.int(0, 3),
        p: rng.pick(CUTS),
        q: rng.pick(CUTS),
      };
      if (p.m + p.n === 0) continue;
      if (probability(p) < 0.01) continue;
      if (cleanDistractors(probability(p), candidates(p), PROB.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `$X$ and $Y$ are the fractions of their monthly sales targets that two shops reach, each between 0 and 1. Their joint density is $f(x, y) = k\\,${power('x', p.m)}${power('y', p.n)}$ for $0 \\le x \\le 1$, $0 \\le y \\le 1$ (and 0 elsewhere). Find $P(X \\le ${num(p.p)},\\ Y \\le ${num(p.q)})$. Give your answer to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: probability(p), decimals: 4, ...PROB }),

  steps(p) {
    const k = constantK(p);
    const fx = power('x', p.m) || '1';
    const fy = power('y', p.n) || '1';
    const a = p.p ** (p.m + 1) / (p.m + 1);
    const b = p.q ** (p.n + 1) / (p.n + 1);
    return [
      {
        text: 'Find k: the density must integrate to 1 over the unit square.',
        latex: `\\int_0^1\\!\\int_0^1 ${power('x', p.m)}${power('y', p.n)}\\,dy\\,dx = \\tfrac{1}{${p.m + 1}} \\cdot \\tfrac{1}{${p.n + 1}} = \\tfrac{1}{${k}} \\;\\Rightarrow\\; k = ${k}`,
        why: 'Total probability is 1. The integrand is a function of x times a function of y over a rectangle, so the double integral is the product of two single integrals.',
        result: k,
      },
      {
        text: 'Integrate the density over the rectangle 0 ≤ x ≤ p, 0 ≤ y ≤ q.',
        latex: `P = ${k} \\int_0^{${num(p.p)}} ${fx}\\,dx \\cdot \\int_0^{${num(p.q)}} ${fy}\\,dy = ${k} \\cdot ${powOver(p.p, p.m + 1)} \\cdot ${powOver(p.q, p.n + 1)}`,
        why: 'The probability of a region is the double integral of the joint density over that region; the integrand splits again.',
      },
      {
        text: 'Simplify: k cancels the two divisors.',
        latex: `P = ${powNum(p.p, p.m + 1)} \\cdot ${powNum(p.q, p.n + 1)} = ${num(probability(p), 4)}`,
        why: `k = ${p.m + 1} × ${p.n + 1} = ${k} is exactly the product of the two divisors, so it cancels them; only the powers of the two cut-offs are left.`,
        result: round(k * a * b, 4),
      },
    ];
  },

  distractors: (p) => cleanDistractors(probability(p), candidates(p), PROB.tolerance, 0),
};
