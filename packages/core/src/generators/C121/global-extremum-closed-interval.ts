import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** f(x) = x³ − 3s²x + h on [−left, right]; critical points at ±s. */
  s: number;
  h: number;
  left: number;
  right: number;
  kind: 'max' | 'min';
}

const WHOLE = { tolerance: 0.001, relTolerance: 0 } as const;

export const f = (p: Params, x: number) => x ** 3 - 3 * p.s ** 2 * x + p.h;

/** All candidates: both ends and both critical points (each inside the interval). */
export const candidatePoints = (p: Params) => [-p.left, -p.s, p.s, p.right];

export function globalValue(p: Params) {
  const values = candidatePoints(p).map((x) => f(p, x));
  return p.kind === 'max' ? Math.max(...values) : Math.min(...values);
}

function wrong(p: Params) {
  const local = p.kind === 'max' ? f(p, -p.s) : f(p, p.s);
  const end = p.kind === 'max' ? f(p, p.right) : f(p, -p.left);
  const values = candidatePoints(p).map((x) => f(p, x));
  const other = p.kind === 'max' ? Math.min(...values) : Math.max(...values);
  return [
    { value: local, mistakeCode: 'LOCAL_ONLY' },
    { value: end, mistakeCode: 'ENDPOINT_ONLY' },
    { value: other, mistakeCode: 'MAX_MIN_SWAPPED' },
    { value: f(p, 0), mistakeCode: 'INFLECTION_POINT' },
  ];
}

/** C121, difficulty 3: the largest or smallest value of a cubic on a closed interval. */
export const globalExtremumClosedInterval: Generator<Params> = {
  id: 'global-extremum-closed-interval',
  title: 'Largest or smallest value on a closed interval',
  topicId: 'C121',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const s = rng.int(1, 4);
      const h = rng.int(-20, 40);
      const left = s + rng.int(1, 3);
      const right = s + rng.int(1, 4);
      const kind = rng.pick(['max', 'min'] as const);
      const p: Params = { s, h, left, right, kind };
      // A unique winner, so the answer does not depend on a tie.
      const values = candidatePoints(p).map((x) => f(p, x));
      const best = globalValue(p);
      if (h === 0 || values.filter((v) => v === best).length > 1) continue;
      if (cleanDistractors(best, wrong(p), WHOLE.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm's profit (thousand manat) when output differs from the plan by $x$ hundred units is $f(x) = x^3 - ${num(3 * p.s ** 2)}x ${p.h < 0 ? '-' : '+'} ${num(Math.abs(p.h))}$, and only changes with $${num(-p.left)} \\le x \\le ${num(p.right)}$ are allowed. Find the ${p.kind === 'max' ? 'largest' : 'smallest'} value of $f$ on this interval.`,

  answer: (p) => ({ kind: 'numeric', value: globalValue(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const xs = candidatePoints(p);
    const list = xs.map((x) => `f(${num(x)}) = ${num(f(p, x))}`).join(', \\quad ');
    return [
      {
        text: 'Find the critical points from f′(x) = 0.',
        latex: `f'(x) = 3x^2 - ${num(3 * p.s ** 2)} = 0 \\;\\Rightarrow\\; x = \\pm ${num(p.s)}`,
        why: 'A largest or smallest value inside the interval can only occur where the derivative is zero (Fermat, C120). Both critical points lie inside the allowed range.',
      },
      {
        text: 'Evaluate f at the critical points and at both ends.',
        latex: list,
        why: 'On a closed interval a continuous function reaches its largest and smallest values (C101), either at a critical point or at an end. A local extremum need not be the global one.',
      },
      {
        text: `Pick the ${p.kind === 'max' ? 'largest' : 'smallest'} of these values.`,
        latex: `${p.kind === 'max' ? '\\max' : '\\min'} f = ${num(globalValue(p))}`,
        why: 'Compare all four candidates; the second derivative test alone only tells you whether a critical point is a local maximum or minimum.',
        result: globalValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(globalValue(p), wrong(p), WHOLE.tolerance, 0),
};
