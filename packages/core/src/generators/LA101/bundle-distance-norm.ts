import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The two bundles, of the same 2 or 3 goods. */
  a: number[];
  b: number[];
}

/** Answer to 2 decimal places; a student who rounds correctly is within 0.005. */
const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;

const vec = (xs: readonly number[]) => `(${xs.map((x) => num(x)).join(', ')})`;
const diff = (p: Params) => p.a.map((ai, i) => ai - (p.b[i] ?? 0));
const squares = (p: Params) => diff(p).reduce((s, d) => s + d * d, 0);
const length = (xs: readonly number[]) => Math.sqrt(xs.reduce((s, x) => s + x * x, 0));
const distance = (p: Params) => round(Math.sqrt(squares(p)), 2);

const candidates = (p: Params): Distractor[] => [
  { value: squares(p), mistakeCode: 'NO_SQUARE_ROOT' },
  { value: diff(p).reduce((s, d) => s + Math.abs(d), 0), mistakeCode: 'ABS_DIFFERENCES' },
  { value: round(Math.abs(length(p.a) - length(p.b)), 2), mistakeCode: 'NORMS_SUBTRACTED' },
];

/** LA101, difficulty 2: the distance ‖a − b‖ between two bundles of 2 or 3 goods. */
export const bundleDistanceNorm: Generator<Params> = {
  id: 'bundle-distance-norm',
  title: 'Distance between two bundles',
  topicId: 'LA101',
  difficulty: 2,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const n = rng.int(2, 3);
      const p: Params = {
        a: Array.from({ length: n }, () => rng.int(0, 12)),
        b: Array.from({ length: n }, () => rng.int(0, 12)),
      };
      // The bundles must differ in at least two goods, so the answer is a real Pythagoras step.
      if (diff(p).filter((d) => d !== 0).length < 2) continue;
      if (length(p.a) === 0 || length(p.b) === 0) continue;
      const kept = cleanDistractors(distance(p), candidates(p), TWO_DP.tolerance, 0);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `Two households buy the bundles $a = ${vec(p.a)}$ and $b = ${vec(p.b)}$ of the same ${p.a.length === 2 ? 'two' : 'three'} goods. How far apart are the bundles, $\\|a - b\\|$? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: distance(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const d = diff(p);
    const sq = squares(p);
    const root = Number.isInteger(Math.sqrt(sq)) ? '=' : '\\approx';
    return [
      {
        text: 'Subtract the bundles good by good.',
        latex: `a - b = ${vec(d)}`,
        why: 'The gap between two bundles is itself a vector: how many more (or fewer) units of each good the first household buys.',
      },
      {
        text: 'Square each entry of the difference and add.',
        latex: `${d.map((x) => (x < 0 ? `(${num(x)})^2` : `${num(x)}^2`)).join(' + ')} = ${num(sq)}`,
        why: 'This is Pythagoras in several dimensions. Squaring also removes the signs, so buying 2 units fewer counts as much as buying 2 units more.',
        result: sq,
      },
      {
        text: 'Take the square root.',
        latex: `\\|a - b\\| = \\sqrt{${num(sq)}} ${root} ${num(distance(p))}`,
        why: 'The sum of squares is a squared length; its square root is the straight-line distance, in units of the goods.',
        result: distance(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(distance(p), candidates(p), TWO_DP.tolerance, 0),
};
