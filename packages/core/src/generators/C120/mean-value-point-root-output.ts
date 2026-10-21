import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Output Q(L) = k·√L. */
  k: number;
  /** The interval [m², n²] of labour, so both square roots are whole numbers. */
  m: number;
  n: number;
}

/** c = ((m + n)/2)² ends in .00, .25 or .50 or .75, so it is exact to 2 decimals. */
const EXACT = { tolerance: 0.005, relTolerance: 0 } as const;

export const meanValuePoint = (p: Params) => ((p.m + p.n) / 2) ** 2;
export const averageRate = (p: Params) => (p.k * (p.n - p.m)) / (p.n ** 2 - p.m ** 2);

const candidates = (p: Params) => [
  { value: (p.m ** 2 + p.n ** 2) / 2, mistakeCode: 'MIDPOINT_RULE' },
  { value: round(averageRate(p), 2), mistakeCode: 'GAVE_RATE' },
  { value: (p.m + p.n) / 2, mistakeCode: 'FORGOT_SQUARE' },
];

/** C120, difficulty 1: the point the mean value theorem promises for Q = k√L on [m², n²]. */
export const meanValuePointRootOutput: Generator<Params> = {
  id: 'mean-value-point-root-output',
  title: 'Mean value point for a square-root production function',
  topicId: 'C120',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const k = rng.int(2, 12) * 5;
      const m = rng.int(1, 10);
      const n = m + rng.int(2, 8);
      const p: Params = { k, m, n };
      if (cleanDistractors(meanValuePoint(p), candidates(p), EXACT.tolerance, 0).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) =>
    `A workshop's daily output is $Q(L) = ${num(p.k)}\\sqrt{L}$, where $L$ is hours of labour. Hours rise from $${num(p.m ** 2)}$ to $${num(p.n ** 2)}$. By the mean value theorem there is an hour level $c$ in between where the marginal product $Q'(c)$ equals the average extra output per extra hour over the whole rise. Find $c$ to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: meanValuePoint(p), decimals: 2, ...EXACT }),

  steps(p) {
    const a = p.m ** 2;
    const b = p.n ** 2;
    const avg = averageRate(p);
    return [
      {
        text: 'Work out the average rate of change over the interval.',
        latex: `\\dfrac{Q(${num(b)}) - Q(${num(a)})}{${num(b)} - ${num(a)}} = \\dfrac{${num(p.k)}\\cdot ${num(p.n)} - ${num(p.k)}\\cdot ${num(p.m)}}{${num(b - a)}} = ${num(avg, 4)}`,
        why: 'This is the slope of the chord joining the two points of the curve: the extra output per extra hour, on average.',
        result: round(avg, 4),
      },
      {
        text: 'Set the marginal product equal to it.',
        latex: `Q'(c) = \\dfrac{${num(p.k)}}{2\\sqrt{c}} = \\dfrac{${num(p.k)}}{${num(p.m)} + ${num(p.n)}}`,
        why: 'The derivative of k√L is k/(2√L). The mean value theorem says some c inside the interval has this slope; the average rate simplifies to k/(m + n) because n² − m² = (n − m)(n + m).',
      },
      {
        text: 'Solve for c.',
        latex: `\\sqrt{c} = \\dfrac{${num(p.m)} + ${num(p.n)}}{2} = ${num((p.m + p.n) / 2)} \\;\\Rightarrow\\; c = ${num(meanValuePoint(p))}`,
        why: 'Cross-multiply, then square. The point is the square of the average of the two square roots, which lies inside the interval, as the theorem promises.',
        result: meanValuePoint(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(meanValuePoint(p), candidates(p), EXACT.tolerance, 0),
};
