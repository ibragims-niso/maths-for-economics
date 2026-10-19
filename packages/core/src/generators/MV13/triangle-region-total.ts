import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The triangle 0 ≤ y ≤ x ≤ a (km). */
  a: number;
  /** Density f(x, y) = c·x^m·y^n, in hundreds of orders per km² per day. */
  c: number;
  m: number;
  n: number;
}

/** The answer has at most 2 decimals and is exact, so only rounding slips are accepted. */
export const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;

/** N = m + n + 2, the power of a in every result. */
const big = (p: Params) => p.m + p.n + 2;
/** ∫₀ᵃ∫₀ˣ c·x^m·y^n dy dx = c·a^N / ((n + 1)·N): the answer. */
export const triangleTotal = (p: Params) => (p.c * p.a ** big(p)) / ((p.n + 1) * big(p));

const power = (v: string, k: number) => (k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`);
const twoDp = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;
/** The density c·x^m·y^n for LaTeX, with a coefficient 1 left out. */
const density = (p: Params) => `${p.c === 1 ? '' : num(p.c)}${power('x', p.m)}${power('y', p.n)}`;

const candidates = (p: Params): Distractor[] => {
  const top = p.c * p.a ** big(p);
  return [
    // Used the limits of the whole square [0, a] × [0, a].
    { value: round(top / ((p.m + 1) * (p.n + 1)), 2), mistakeCode: 'RECTANGLE_LIMITS' },
    // Inner limits y from x to a: the other half of the square.
    { value: round(top / ((p.m + 1) * big(p)), 2), mistakeCode: 'OTHER_TRIANGLE' },
    // Took half of the square's integral because the triangle is half the area.
    { value: round(top / (2 * (p.m + 1) * (p.n + 1)), 2), mistakeCode: 'HALF_SQUARE' },
    // Integrated y^n to y^(n+1) without dividing by n + 1.
    { value: round(top / big(p), 2), mistakeCode: 'POWER_NOT_DIVIDED' },
  ];
};

/** MV13, difficulty 3: the double integral of c·x^m·y^n over the triangle 0 ≤ y ≤ x ≤ a. */
export const triangleRegionTotal: Generator<Params> = {
  id: 'triangle-region-total',
  title: 'Total over a triangle',
  topicId: 'MV13',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = { a: rng.int(1, 6), c: rng.int(1, 12), m: rng.int(0, 2), n: rng.int(0, 2) };
      if (p.m + p.n === 0) continue;
      const t = triangleTotal(p);
      if (!twoDp(t) || t < 0.5 || t > 2000) continue;
      if (cleanDistractors(t, candidates(p), TWO_DP.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `A delivery zone is the triangle $0 \\le y \\le x \\le ${num(p.a)}$ (in km), bounded by a road along the $x$-axis, a road along the line $y = x$ and the line $x = ${num(p.a)}$. Orders at the point $(x, y)$, in hundreds per km² per day, are $f(x, y) = ${density(p)}$. Find the total orders per day in the zone, in hundreds. Give your answer to 2 decimal places if it is not whole.`,

  answer: (p) => ({ kind: 'numeric', value: triangleTotal(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const N = big(p);
    const coef = p.c % (p.n + 1) === 0 ? num(p.c / (p.n + 1)) : `\\tfrac{${p.c}}{${p.n + 1}}`;
    /** The coefficient in front of a power of x, left out when it is 1. */
    const lead = coef === '1' ? '' : `${coef}\\,`;
    const xPart = `${p.c === 1 && p.m > 0 ? '' : num(p.c)}${power('x', p.m)}`;
    const yPart = p.n === 0 ? 'x' : `\\frac{x^{${p.n + 1}}}{${p.n + 1}}`;
    return [
      {
        text: 'Write the limits: for each x between 0 and a, y runs from 0 up to the diagonal y = x.',
        latex: `\\iint_T f\\,dA = \\int_0^{${num(p.a)}}\\!\\int_0^{x} ${density(p)}\\,dy\\,dx`,
        why: 'The inner limits may depend on the outer variable. A vertical strip at position x goes from the x-axis up to the line y = x.',
      },
      {
        text: 'Inner integral in y, with x held constant.',
        latex: `\\int_0^{x} ${density(p)}\\,dy = ${xPart} \\cdot ${yPart} = ${lead}x^{${N - 1}}`,
        why: 'Integrate the power of y (y^k becomes y^(k+1)/(k+1)) and put in the upper limit y = x; the factors in x are constants here, and the result is a function of x only.',
      },
      {
        text: 'Outer integral in x from 0 to a.',
        latex: `\\int_0^{${num(p.a)}} ${lead}x^{${N - 1}}\\,dx = ${coef} \\cdot \\frac{${num(p.a)}^{${N}}}{${N}} = ${num(triangleTotal(p))}`,
        why: 'Adding up all the vertical strips from x = 0 to x = a covers the whole triangle.',
        result: triangleTotal(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(triangleTotal(p), candidates(p), TWO_DP.tolerance, 0),
};
