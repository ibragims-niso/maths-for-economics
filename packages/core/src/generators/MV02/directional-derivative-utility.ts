import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Utility U = x^a · y^b with whole exponents 1 or 2. */
  a: number;
  b: number;
  /** The bundle (x, y). */
  x: number;
  y: number;
  /** The direction vector v = (v1, v2); its length is a whole number (a Pythagorean triple). */
  v1: number;
  v2: number;
}

/** Directions with whole lengths, so the unit vector has short decimals. */
const TRIPLES = [
  [3, 4],
  [4, 3],
  [5, 12],
  [12, 5],
  [6, 8],
  [8, 6],
  [8, 15],
  [15, 8],
] as const;

const EXPONENTS = [
  [1, 1],
  [2, 1],
  [1, 2],
] as const;

/** U_x = a·x^(a−1)·y^b and U_y = b·x^a·y^(b−1). */
const ux = (p: Params) => p.a * p.x ** (p.a - 1) * p.y ** p.b;
const uy = (p: Params) => p.b * p.x ** p.a * p.y ** (p.b - 1);
const length = (p: Params) => Math.hypot(p.v1, p.v2);
const exact = (p: Params) => (ux(p) * p.v1 + uy(p) * p.v2) / length(p);
const directional = (p: Params) => round(exact(p), 2);

const candidates = (p: Params): Distractor[] => [
  { value: ux(p) * p.v1 + uy(p) * p.v2, mistakeCode: 'NOT_UNIT_VECTOR' },
  { value: round(Math.hypot(ux(p), uy(p)), 2), mistakeCode: 'GRADIENT_LENGTH' },
  { value: round((uy(p) * p.v1 + ux(p) * p.v2) / length(p), 2), mistakeCode: 'COMPONENTS_SWAPPED' },
];

const wrongAnswers = (p: Params) => cleanDistractors(directional(p), candidates(p));

/** U_x and U_y as formulas, by the exponents "ab". */
const PARTIALS: Record<string, [string, string]> = {
  '11': ['y', 'x'],
  '21': ['2xy', 'x^2'],
  '12': ['y^2', '2xy'],
};

const power = (base: string, n: number) => (n === 1 ? base : `${base}^{${n}}`);
const utilityLatex = (p: Params) => `${power('x', p.a)}${power('y', p.b)}`;
/** A component in brackets when negative, so −6 is written (−6) inside a product or a square. */
const paren = (v: number) => (v < 0 ? `(${num(v)})` : num(v));
const sq = (v: number) => `${paren(v)}^2`;

/** MV02, difficulty 3: directional derivative D_u U = ∇U·u of U = x^a·y^b along a given vector. */
export const directionalDerivativeUtility: Generator<Params> = {
  id: 'directional-derivative-utility',
  title: 'Directional derivative of utility',
  topicId: 'MV02',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const [a, b] = rng.pick(EXPONENTS);
      const [t1, t2] = rng.pick(TRIPLES);
      // Sometimes the consumer gives up some of one good to get more of the other.
      const sign = rng.pick([
        [1, 1],
        [1, -1],
        [-1, 1],
      ] as const);
      const p: Params = {
        a,
        b,
        x: rng.int(1, 8),
        y: rng.int(1, 8),
        v1: sign[0] * t1,
        v2: sign[1] * t2,
      };
      const d = directional(p);
      if (Math.abs(d) >= 0.5 && wrongAnswers(p).length >= 2) return p;
    }
  },

  stem: (p) =>
    `A consumer's utility is $U(x, y) = ${utilityLatex(p)}$ and she has the bundle $(x, y) = (${num(p.x)}, ${num(p.y)})$. Find the directional derivative of $U$ at this bundle in the direction of the vector $(${num(p.v1)}, ${num(p.v2)})$: the rate at which utility changes per unit of distance moved that way. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: directional(p), decimals: 2 }),

  steps(p) {
    const n = length(p);
    const gx = ux(p);
    const gy = uy(p);
    const [fx, fy] = PARTIALS[`${p.a}${p.b}`] ?? ['', ''];
    const frac = (v: number) => `${v < 0 ? '-' : ''}\\tfrac{${num(Math.abs(v))}}{${num(n)}}`;
    return [
      {
        text: 'Find the two partial derivatives at the bundle: together they are the gradient.',
        latex: `U_x = ${fx} = ${num(gx)}, \\quad U_y = ${fy} = ${num(gy)}, \\quad \\nabla U = (${num(gx)}, ${num(gy)})`,
        why: 'Each partial holds the other good fixed; the gradient collects the two marginal utilities in one vector.',
      },
      {
        text: 'Turn the direction into a unit vector.',
        latex: `\\lVert v \\rVert = \\sqrt{${sq(p.v1)} + ${sq(p.v2)}} = ${num(n)}, \\quad u = \\left(${frac(p.v1)}, ${frac(p.v2)}\\right)`,
        why: 'The directional derivative measures change per unit of distance, so the direction must have length 1.',
        result: n,
      },
      {
        text: 'Take the dot product of the gradient with the unit vector.',
        latex: `D_u U = \\dfrac{${num(gx)} \\cdot ${paren(p.v1)} ${p.v2 < 0 ? '-' : '+'} ${num(gy)} \\cdot ${num(Math.abs(p.v2))}}{${num(n)}} = \\dfrac{${num(gx * p.v1 + gy * p.v2)}}{${num(n)}} = ${num(directional(p))}`,
        why: 'D_u U = U_x·u₁ + U_y·u₂: each marginal utility is weighted by how far the move goes in that good.',
        result: directional(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
