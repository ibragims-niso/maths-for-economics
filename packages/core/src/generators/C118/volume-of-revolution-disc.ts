import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'root': y = k√x (a rounded tank); 'cone': y = kx (a conical hopper). */
  shape: 'root' | 'cone';
  /** Coefficient k of the profile curve. */
  k: number;
  /** Length of the solid along the x-axis, in metres. */
  b: number;
}

/** ∫₀ᵇ f(x)² dx, the integral before multiplying by π. */
const squaredIntegral = (p: Params) =>
  p.shape === 'root' ? (p.k ** 2 * p.b ** 2) / 2 : (p.k ** 2 * p.b ** 3) / 3;

const volume = (p: Params) => round(Math.PI * squaredIntegral(p), 2);

/** The right-hand side of the profile curve y = f(x), e.g. "2\sqrt{x}" or "1.5x". */
const radius = (p: Params) =>
  `${p.k === 1 ? '' : num(p.k)}${p.shape === 'root' ? '\\sqrt{x}' : 'x'}`;

/** C118, difficulty 1: volume of a tank made by rotating y = k√x or y = kx about the x-axis (discs). */
export const volumeOfRevolutionDisc: Generator<Params> = {
  id: 'volume-of-revolution-disc',
  title: 'Volume of a tank by discs',
  topicId: 'C118',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    const shape = rng.pick(['root', 'cone'] as const);
    if (shape === 'root') return { shape, k: rng.int(1, 4), b: rng.int(1, 12) };
    return { shape, k: rng.int(1, 6) / 2, b: rng.int(1, 10) };
  },

  stem: (p) =>
    `${p.shape === 'root' ? 'The inside of a storage tank' : 'A conical grain hopper'} is the solid formed by rotating the curve $y = ${radius(p)}$, for $0 \\le x \\le ${num(p.b)}$ (in metres), about the $x$-axis. Find its volume in cubic metres. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: volume(p), decimals: 2, unit: 'm³' }),

  steps(p) {
    const k2 = p.k ** 2;
    const inner = squaredIntegral(p);
    const power = p.shape === 'root' ? 1 : 2;
    const square = `${k2 === 1 ? '' : num(k2)}${power === 1 ? 'x' : 'x^2'}`;
    return [
      {
        text: 'Square the radius.',
        latex: `f(x)^2 = \\left(${radius(p)}\\right)^2 = ${square}`,
        why: 'Each thin slice is a disc whose radius is the height of the curve, and a disc’s area is π × radius².',
      },
      {
        text: 'Integrate the squared radius from 0 to b.',
        latex: `\\int_0^{${num(p.b)}} ${square}\\,dx = \\left[\\dfrac{${k2 === 1 ? '' : num(k2)}x^{${power + 1}}}{${power + 1}}\\right]_0^{${num(p.b)}} = ${num(inner, 4)}`,
        why: 'Adding up the slices, each of thickness dx, turns the sum of disc volumes into an integral.',
        result: round(inner, 4),
      },
      {
        text: 'Multiply by π.',
        latex: `V = \\pi \\cdot ${num(inner, 4)} = ${num(volume(p))}`,
        why: 'π was kept outside the integral; it belongs to every disc’s area πr².',
        result: volume(p),
      },
    ];
  },

  distractors(p) {
    const inner = squaredIntegral(p);
    const unsquared = p.shape === 'root' ? (2 * p.k * p.b ** 1.5) / 3 : (p.k * p.b ** 2) / 2;
    return cleanDistractors(volume(p), [
      { value: round(inner, 2), mistakeCode: 'NO_PI' },
      { value: round(Math.PI * unsquared, 2), mistakeCode: 'NOT_SQUARED' },
      { value: round(2 * Math.PI * inner, 2), mistakeCode: 'TWO_PI' },
    ]);
  },
};
