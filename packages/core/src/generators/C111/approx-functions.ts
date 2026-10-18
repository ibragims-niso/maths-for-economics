import type { Rng } from '../../engine/rng';
import { num } from '../format';

/**
 * The functions C111 approximates, each at a point where it is easy to evaluate: √x at a perfect
 * square, ∛x at a perfect cube, ln x at 1 and eˣ at 0.
 */
export type ApproxFn = 'sqrt' | 'cbrt' | 'ln' | 'exp';

export interface ApproxPoint {
  fn: ApproxFn;
  /** The point a where f, f′ and f″ are known exactly. */
  a: number;
  /** The step h: we estimate f(a + h). */
  h: number;
}

/** k with a = k² (square root) or a = k³ (cube root). */
const base = ({ fn, a }: ApproxPoint) => (fn === 'sqrt' ? Math.sqrt(a) : Math.cbrt(a));

/** f(x) itself. */
export function value(fn: ApproxFn, x: number): number {
  if (fn === 'sqrt') return Math.sqrt(x);
  if (fn === 'cbrt') return Math.cbrt(x);
  if (fn === 'ln') return Math.log(x);
  return Math.exp(x);
}

/** f′(x): ½x^(−1/2), ⅓x^(−2/3), 1/x and eˣ. */
export function slope(fn: ApproxFn, x: number): number {
  if (fn === 'sqrt') return 1 / (2 * Math.sqrt(x));
  if (fn === 'cbrt') return 1 / (3 * Math.cbrt(x) ** 2);
  if (fn === 'ln') return 1 / x;
  return Math.exp(x);
}

/** f″(x): −¼x^(−3/2), −(2/9)x^(−5/3), −1/x² and eˣ. */
export function curvature(fn: ApproxFn, x: number): number {
  if (fn === 'sqrt') return -1 / (4 * Math.sqrt(x) ** 3);
  if (fn === 'cbrt') return -2 / (9 * Math.cbrt(x) ** 5);
  if (fn === 'ln') return -1 / x ** 2;
  return Math.exp(x);
}

/** f(a), f′(a), f″(a) at the nice point; exact because a is a perfect power, 1 or 0. */
export function derivativesAt(p: ApproxPoint) {
  const k = base(p);
  if (p.fn === 'sqrt') return { f0: k, f1: 1 / (2 * k), f2: -1 / (4 * k ** 3) };
  if (p.fn === 'cbrt') return { f0: k, f1: 1 / (3 * k ** 2), f2: -2 / (9 * k ** 5) };
  if (p.fn === 'ln') return { f0: 0, f1: 1, f2: -1 };
  return { f0: 1, f1: 1, f2: 1 };
}

/**
 * Draws a function, a nice point and a step. For the roots the step is a multiple of 0.05, at
 * most 3 and at most 15 % of a; for ln and exp it is a multiple of 0.005 between 0.03 and 0.2 in
 * size. Small steps keep the approximations good ones.
 */
export function drawPoint(rng: Rng): ApproxPoint {
  const fn = rng.pick(['sqrt', 'sqrt', 'cbrt', 'ln', 'exp'] as const);
  const sign = rng.next() < 0.7 ? 1 : -1;
  if (fn === 'sqrt' || fn === 'cbrt') {
    const k = fn === 'sqrt' ? rng.int(2, 20) : rng.int(2, 6);
    const a = fn === 'sqrt' ? k * k : k ** 3;
    const maxTwentieths = Math.min(60, Math.floor(3 * a));
    return { fn, a, h: (sign * rng.int(1, maxTwentieths)) / 20 };
  }
  return { fn, a: fn === 'ln' ? 1 : 0, h: (sign * rng.int(6, 40)) / 200 };
}

/** The function's name in LaTeX, e.g. "\sqrt{x}". */
export function fnLatex(fn: ApproxFn): string {
  if (fn === 'sqrt') return '\\sqrt{x}';
  if (fn === 'cbrt') return '\\sqrt[3]{x}';
  if (fn === 'ln') return '\\ln x';
  return 'e^x';
}

/** f(a + h) written the way the question asks for it, e.g. "\sqrt{26.5}", "\ln(1.05)", "e^{-0.04}". */
export function targetLatex({ fn, a, h }: ApproxPoint): string {
  const x = num(a + h, 3);
  if (fn === 'sqrt') return `\\sqrt{${x}}`;
  if (fn === 'cbrt') return `\\sqrt[3]{${x}}`;
  if (fn === 'ln') return `\\ln(${x})`;
  return `e^{${x}}`;
}

/** f′(x) and its value at a, as LaTeX: "f'(x) = \frac{1}{2\sqrt{x}}, \; f'(25) = \frac{1}{10}". */
export function slopeLatex(p: ApproxPoint): string {
  const k = base(p);
  if (p.fn === 'sqrt')
    return `f'(x) = \\dfrac{1}{2\\sqrt{x}}, \\quad f'(${num(p.a)}) = \\dfrac{1}{2 \\cdot ${k}} = \\dfrac{1}{${2 * k}}`;
  if (p.fn === 'cbrt')
    return `f'(x) = \\dfrac{1}{3x^{2/3}}, \\quad f'(${num(p.a)}) = \\dfrac{1}{3 \\cdot ${k}^2} = \\dfrac{1}{${3 * k * k}}`;
  if (p.fn === 'ln') return `f'(x) = \\dfrac{1}{x}, \\quad f'(1) = 1`;
  return `f'(x) = e^x, \\quad f'(0) = 1`;
}

/** f″(x) and its value at a, as LaTeX. */
export function curvatureLatex(p: ApproxPoint): string {
  const k = base(p);
  if (p.fn === 'sqrt')
    return `f''(x) = -\\dfrac{1}{4x^{3/2}}, \\quad f''(${num(p.a)}) = -\\dfrac{1}{4 \\cdot ${k}^3} = -\\dfrac{1}{${num(4 * k ** 3)}}`;
  if (p.fn === 'cbrt')
    return `f''(x) = -\\dfrac{2}{9x^{5/3}}, \\quad f''(${num(p.a)}) = -\\dfrac{2}{9 \\cdot ${k}^5} = -\\dfrac{2}{${num(9 * k ** 5)}}`;
  if (p.fn === 'ln') return `f''(x) = -\\dfrac{1}{x^2}, \\quad f''(1) = -1`;
  return `f''(x) = e^x, \\quad f''(0) = 1`;
}
