import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The road is y = (2m/3)·x^(3/2), so y′ = m√x and 1 + y′² = 1 + m²x. */
  m: 1 | 2 | 3;
  /** Start and end of the road along the x-axis, in km. */
  a: number;
  b: number;
}

const COEFFICIENT = { 1: '\\tfrac{2}{3}', 2: '\\tfrac{4}{3}', 3: '2' } as const;
/** 2/(3m²) in lowest terms, the factor in front of the antiderivative. */
const FACTOR = { 1: '\\tfrac{2}{3}', 2: '\\tfrac{1}{6}', 3: '\\tfrac{2}{27}' } as const;

const height = (p: Params, x: number) => ((2 * p.m) / 3) * x ** 1.5;

/** The antiderivative of √(1 + m²x): (2/(3m²))·(1 + m²x)^(3/2). */
const antiderivative = (p: Params, x: number) => (2 / (3 * p.m ** 2)) * (1 + p.m ** 2 * x) ** 1.5;

const arcLength = (p: Params) => round(antiderivative(p, p.b) - antiderivative(p, p.a), 2);

const mx = (p: Params) => (p.m === 1 ? 'x' : `${p.m ** 2}x`);

/** C118, difficulty 3: length of the road y = (2m/3)x^(3/2) between x = a and x = b. */
export const arcLengthThreeHalvesPower: Generator<Params> = {
  id: 'arc-length-three-halves-power',
  title: 'Length of a curved road',
  topicId: 'C118',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    const m = rng.pick([1, 2, 3] as const);
    const a = rng.int(0, 10);
    return { m, a, b: a + rng.int(1, 12) };
  },

  stem: (p) =>
    `On a map measured in km, a new road follows the curve $y = ${COEFFICIENT[p.m]}x^{3/2}$ from $x = ${num(p.a)}$ to $x = ${num(p.b)}$. How long is the road, in km? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: arcLength(p), decimals: 2, unit: 'km' }),

  steps(p) {
    const k = 2 / (3 * p.m ** 2);
    const kTex = FACTOR[p.m];
    const top = 1 + p.m ** 2 * p.b;
    const bottom = 1 + p.m ** 2 * p.a;
    return [
      {
        text: 'Differentiate and square.',
        latex: `y' = ${p.m === 1 ? '' : p.m}\\sqrt{x}, \\qquad 1 + (y')^2 = 1 + ${mx(p)}`,
        why: 'The arc length formula needs 1 + (slope)², the squared length of a tiny piece of road per unit of x.',
      },
      {
        text: 'Write the arc length integral.',
        latex: `L = \\int_{${num(p.a)}}^{${num(p.b)}} \\sqrt{1 + ${mx(p)}}\\,dx`,
        why: 'Each tiny piece of road has length √(dx² + dy²) = √(1 + y′²) dx; the integral adds them up.',
      },
      {
        text: 'Find an antiderivative.',
        latex: `\\int \\sqrt{1 + ${mx(p)}}\\,dx = ${kTex}\\,(1 + ${mx(p)})^{3/2} + C`,
        why:
          p.m === 1
            ? 'Differentiating (1 + x)^(3/2) gives (3/2)(1 + x)^(1/2), so multiply by 2/3 to undo the factor 3/2.'
            : `Differentiating (1 + ${mx(p)})^(3/2) gives (3/2)·${p.m ** 2}·(1 + ${mx(p)})^(1/2) by the chain rule, so divide by ${num(1.5 * p.m ** 2)} to undo that factor.`,
      },
      {
        text: 'Evaluate between the end points.',
        latex: `L = ${kTex}\\left(${top}^{3/2} - ${bottom}^{3/2}\\right) = ${num(arcLength(p))}`,
        why: 'Fundamental Theorem: the definite integral is the antiderivative at the top end minus at the bottom end.',
        result: round(k * (top ** 1.5 - bottom ** 1.5), 2),
      },
    ];
  },

  distractors(p) {
    const fa = height(p, p.a);
    const fb = height(p, p.b);
    const m2 = p.m ** 2;
    return cleanDistractors(arcLength(p), [
      {
        value: round(((4 * p.m) / 15) * (p.b ** 2.5 - p.a ** 2.5), 2),
        mistakeCode: 'INTEGRATED_F',
      },
      { value: round(Math.hypot(p.b - p.a, fb - fa), 2), mistakeCode: 'CHORD_ONLY' },
      {
        value: round(p.b - p.a + (m2 * (p.b ** 2 - p.a ** 2)) / 2, 2),
        mistakeCode: 'NO_SQUARE_ROOT',
      },
      {
        value: round((2 / 3) * ((1 + m2 * p.b) ** 1.5 - (1 + m2 * p.a) ** 1.5), 2),
        mistakeCode: 'SUBSTITUTION_FACTOR',
      },
    ]);
  },
};
