import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** f(x, y) = p·x + q·y + a·x² + b·xy + c·y². */
  p: number;
  q: number;
  a: number;
  b: number;
  c: number;
}

/** Whole-number answers are exact, so the tolerance is tight. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** "c·x" with a coefficient of 1 left out: (1, "x^2") → "x^2", (3, "xy") → "3xy". */
const term = (c: number, x: string) => `${c === 1 ? '' : num(c)}${x}`;

/** A term with its sign in front: (3, "xy") → " + 3xy", (−2, "y^2") → " - 2y^2". */
const signed = (c: number, x: string) => `${c < 0 ? ' - ' : ' + '}${term(Math.abs(c), x)}`;

/** A number inside a product, in brackets when negative: 3 → "3", −2 → "(-2)". */
const factor = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/** D = f_xx·f_yy − f_xy² = (2a)(2c) − b². */
const determinant = (p: Params) => 4 * p.a * p.c - p.b * p.b;

/** What the signs say about the shape of f everywhere (the second partials are constants). */
function verdict(p: Params): { latex: string; why: string } {
  const D = determinant(p);
  if (D < 0)
    return {
      latex: 'D < 0 \\Rightarrow \\text{neither concave nor convex}',
      why: 'D < 0 means f bends up in some directions and down in others, like a saddle. Some chords lie above the graph and some below, so f is neither concave nor convex.',
    };
  if (p.a < 0)
    return {
      latex: `f_{xx} < 0,\\ f_{yy} < 0,\\ D ${D > 0 ? '>' : '='} 0 \\Rightarrow \\text{concave}`,
      why:
        D > 0
          ? 'Both own second partials are negative and D > 0 at every point, so the Hessian is negative definite everywhere: f is concave, every chord lies below the graph, and a critical point would be the global maximum.'
          : 'Both own second partials are negative and D = 0, so the Hessian is negative semidefinite: f is concave, but flat along one direction, so a maximum need not be unique.',
    };
  return {
    latex: `f_{xx} > 0,\\ f_{yy} > 0,\\ D ${D > 0 ? '>' : '='} 0 \\Rightarrow \\text{convex}`,
    why:
      D > 0
        ? 'Both own second partials are positive and D > 0 at every point, so f is convex: every chord lies above the graph, and a critical point would be the global minimum.'
        : 'Both own second partials are positive and D = 0, so the Hessian is positive semidefinite: f is convex, but flat along one direction.',
  };
}

/** MV06, difficulty 1: the Hessian determinant of a quadratic f(x, y), which decides its shape. */
export const quadraticConcavityDeterminant: Generator<Params> = {
  id: 'quadratic-concavity-determinant',
  title: 'Hessian test for concavity',
  topicId: 'MV06',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    // Half the problems are concave (as profit or output functions usually are), a quarter convex
    // (like cost functions) and a quarter have squares of opposite signs (a saddle).
    const shape = rng.pick(['concave', 'concave', 'convex', 'mixed'] as const);
    const s1 = rng.int(1, 6);
    const s2 = rng.int(1, 6);
    const flip = rng.int(0, 1) === 1;
    const [a, c] =
      shape === 'concave'
        ? [-s1, -s2]
        : shape === 'convex'
          ? [s1, s2]
          : flip
            ? [s1, -s2]
            : [-s1, s2];
    return {
      p: rng.int(2, 60),
      q: rng.int(2, 60),
      a,
      b: rng.pick([-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]),
      c,
    };
  },

  stem: (p) =>
    `Let $f(x, y) = ${num(p.p)}x + ${num(p.q)}y${signed(p.a, 'x^2')}${signed(p.b, 'xy')}${signed(p.c, 'y^2')}$. Find $D = f_{xx}f_{yy} - f_{xy}^2$, the determinant of its Hessian, which decides whether $f$ is concave.`,

  answer: (p) => ({ kind: 'numeric', value: determinant(p), decimals: 0, ...EXACT }),

  steps(p) {
    const D = determinant(p);
    const shape = verdict(p);
    return [
      {
        text: 'Find the three second partial derivatives.',
        latex: `f_{xx} = ${num(2 * p.a)}, \\qquad f_{yy} = ${num(2 * p.c)}, \\qquad f_{xy} = ${num(p.b)}`,
        why: 'Differentiating a·x² twice gives 2a, not a; the cross term b·xy differentiated once by x and once by y gives b. The linear terms vanish.',
      },
      {
        text: 'Take the determinant of the Hessian.',
        latex: `D = ${factor(2 * p.a)} \\cdot ${factor(2 * p.c)} - ${factor(p.b)}^2 = ${num(4 * p.a * p.c)} - ${num(p.b * p.b)} = ${num(D)}`,
        why: 'The determinant of a 2×2 matrix is the product down the main diagonal minus the product of the two off-diagonal entries, here f_xy times itself.',
        result: D,
      },
      {
        text: 'Read off the shape of f.',
        latex: shape.latex,
        why: `${shape.why} For a quadratic the second partials do not depend on (x, y), so this verdict holds at every point.`,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      determinant(p),
      [
        { value: p.a * p.c - p.b * p.b, mistakeCode: 'FORGOT_FACTOR_TWO' },
        { value: 4 * p.a * p.c + p.b * p.b, mistakeCode: 'HESSIAN_ADDED' },
        { value: 4 * p.a * p.c - 4 * p.b * p.b, mistakeCode: 'CROSS_DOUBLED' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
