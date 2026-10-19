import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'population': thousand people per km²; 'orders': delivery orders per km² per day. */
  context: 'population' | 'orders';
  /** East–west length of the rectangle (km): x runs from 0 to a. */
  a: number;
  /** North–south length (km): y runs from 0 to b. */
  b: number;
  /** Density f(x, y) = c + dx + ey. */
  c: number;
  d: number;
  e: number;
}

/** The totals are exact whole numbers, so only rounding slips are accepted. */
export const WHOLE = { tolerance: 0.01, relTolerance: 0 } as const;

/** The double integral of c + dx + ey over [0, a] × [0, b]: the answer. */
export const total = (p: Params) =>
  p.c * p.a * p.b + (p.d * p.a * p.a * p.b) / 2 + (p.e * p.a * p.b * p.b) / 2;

const candidates = (p: Params): Distractor[] => [
  // ∫x dx written as x² instead of x²/2 (same for y): the far-corner value times the area.
  { value: p.a * p.b * (p.c + p.d * p.a + p.e * p.b), mistakeCode: 'POWER_NOT_DIVIDED' },
  // The x-limits used for y and the y-limits for x.
  { value: p.a * p.b * (p.c + (p.d * p.b) / 2 + (p.e * p.a) / 2), mistakeCode: 'LIMITS_SWAPPED' },
  // In the inner integral, dx was left as dx instead of becoming dx·b.
  {
    value: p.c * p.a * p.b + (p.d * p.a * p.a) / 2 + (p.e * p.a * p.b * p.b) / 2,
    mistakeCode: 'CONSTANT_NOT_INTEGRATED',
  },
];

const density = (p: Params) =>
  `${num(p.c)} + ${p.d === 1 ? '' : num(p.d)}x + ${p.e === 1 ? '' : num(p.e)}y`;

/** MV13, difficulty 1: the double integral of a linear density c + dx + ey over a rectangle. */
export const rectangleLinearDensityTotal: Generator<Params> = {
  id: 'rectangle-linear-density-total',
  title: 'Total over a rectangle',
  topicId: 'MV13',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        context: rng.pick(['population', 'orders'] as const),
        a: rng.int(2, 8),
        b: rng.int(2, 6),
        c: rng.int(1, 20),
        d: rng.int(1, 6),
        e: rng.int(1, 6),
      };
      if (p.a === p.b || p.d === p.e) continue;
      if (!Number.isInteger(total(p))) continue;
      if (cleanDistractors(total(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) => {
    const where = `a rectangular area ${num(p.a)} km east–west and ${num(p.b)} km north–south. At the point $x$ km east and $y$ km north of its south-west corner,`;
    return p.context === 'population'
      ? `A city district is ${where} the population density is $f(x, y) = ${density(p)}$ thousand people per km². Find the total population, in thousands: $\\displaystyle\\int_0^{${num(p.a)}}\\!\\int_0^{${num(p.b)}} f(x, y)\\,dy\\,dx$.`
      : `A delivery firm serves ${where} it receives $f(x, y) = ${density(p)}$ orders per km² per day. Find the total number of orders per day: $\\displaystyle\\int_0^{${num(p.a)}}\\!\\int_0^{${num(p.b)}} f(x, y)\\,dy\\,dx$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: total(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const cb = p.c * p.b;
    const db = p.d * p.b;
    const eb = (p.e * p.b * p.b) / 2;
    const centre = p.c + (p.d * p.a) / 2 + (p.e * p.b) / 2;
    return [
      {
        text: 'Integrate with respect to y first, treating x as a constant.',
        latex: `\\int_0^{${num(p.b)}} (${density(p)})\\,dy = \\Big[${p.c === 1 ? '' : num(p.c)}y +${p.d === 1 ? '' : num(p.d)}xy + ${p.e === 2 ? '' : num(p.e / 2)}y^2\\Big]_0^{${num(p.b)}} = ${num(cb)} + ${num(db)}x + ${num(eb)} = ${num(cb + eb)} + ${num(db)}x`,
        why: 'In the inner integral x does not change, so a term in x alone integrates like a constant: dx becomes dx·y. The result is the total along one north–south strip at position x.',
      },
      {
        text: 'Integrate the result with respect to x from 0 to a.',
        latex: `\\int_0^{${num(p.a)}} (${num(cb + eb)} + ${num(db)}x)\\,dx = ${num(cb + eb)} \\cdot ${num(p.a)} + ${num(db)} \\cdot \\tfrac{${num(p.a)}^2}{2} = ${num(total(p))}`,
        why: 'Adding up the strips from x = 0 to x = a covers the whole rectangle; ∫x dx = x²/2.',
        result: total(p),
      },
      {
        text: 'Check: for a linear density, the average equals the value at the centre of the rectangle.',
        latex: `f\\big(\\tfrac{${num(p.a)}}{2}, \\tfrac{${num(p.b)}}{2}\\big) \\times ${num(p.a)} \\cdot ${num(p.b)} = ${num(centre)} \\times ${num(p.a * p.b)} = ${num(centre * p.a * p.b)}`,
        why: 'Total = average density × area, and a linear density is as much above its centre value on one side as below it on the other.',
        result: centre * p.a * p.b,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(total(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};
