import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Two bundles of the same three goods, every entry at least 1. */
  a: number[];
  b: number[];
}

/** Answer to 3 decimal places. */
const THREE_DP = { tolerance: 0.001, relTolerance: 0 } as const;

const vec = (xs: readonly number[]) => `(${xs.map((x) => num(x)).join(', ')})`;
const dot = (p: Params) => p.a.reduce((s, ai, i) => s + ai * (p.b[i] ?? 0), 0);
const sumSq = (xs: readonly number[]) => xs.reduce((s, x) => s + x * x, 0);
const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
const exactCos = (p: Params) => dot(p) / Math.sqrt(sumSq(p.a) * sumSq(p.b));
const cosine = (p: Params) => round(exactCos(p), 3);

const candidates = (p: Params): Distractor[] => [
  { value: round(dot(p) / (sumSq(p.a) * sumSq(p.b)), 3), mistakeCode: 'SQUARED_NORMS' },
  { value: round(dot(p) / (sum(p.a) * sum(p.b)), 3), mistakeCode: 'LENGTH_AS_SUM' },
  {
    value: round(dot(p) / (Math.sqrt(sumSq(p.a)) + Math.sqrt(sumSq(p.b))), 3),
    mistakeCode: 'NORMS_ADDED',
  },
];

/** "√14 ≈ 3.742", or "√9 = 3" when the square root is whole. */
const rootLatex = (n: number) => {
  const r = Math.sqrt(n);
  return Number.isInteger(r)
    ? `\\sqrt{${num(n)}} = ${num(r)}`
    : `\\sqrt{${num(n)}} \\approx ${num(r, 3)}`;
};

/** LA101, difficulty 3: cosine of the angle between two bundles, a·b / (‖a‖‖b‖). */
export const bundleAngleCosine: Generator<Params> = {
  id: 'bundle-angle-cosine',
  title: 'Angle between two bundles',
  topicId: 'LA101',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p: Params = {
        a: Array.from({ length: 3 }, () => rng.int(1, 9)),
        b: Array.from({ length: 3 }, () => rng.int(1, 9)),
      };
      // Nearly parallel bundles make every answer round to 1, so keep a visible angle.
      if (exactCos(p) > 0.99) continue;
      const kept = cleanDistractors(cosine(p), candidates(p), THREE_DP.tolerance, 0);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `Two consumers buy the bundles $a = ${vec(p.a)}$ and $b = ${vec(p.b)}$ of the same three goods. Find $\\cos\\theta$, the cosine of the angle between the bundles; the closer it is to 1, the more alike their choices. Give your answer to 3 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: cosine(p), decimals: 3, ...THREE_DP }),

  steps(p) {
    const na = Math.sqrt(sumSq(p.a));
    const nb = Math.sqrt(sumSq(p.b));
    return [
      {
        text: 'Find the dot product of the two bundles.',
        latex: `a \\cdot b = ${p.a.map((ai, i) => `${num(ai)} \\cdot ${num(p.b[i] ?? 0)}`).join(' + ')} = ${num(dot(p))}`,
        why: 'The dot product multiplies matching entries and adds them; it is the top of the cosine formula.',
        result: dot(p),
      },
      {
        text: 'Find the length of a.',
        latex: `\\|a\\| = \\sqrt{${p.a.map((x) => `${num(x)}^2`).join(' + ')}} = ${rootLatex(sumSq(p.a))}`,
        why: 'The length of a vector is the square root of the sum of its squared entries (Pythagoras).',
        result: round(na, 3),
      },
      {
        text: 'Find the length of b.',
        latex: `\\|b\\| = \\sqrt{${p.b.map((x) => `${num(x)}^2`).join(' + ')}} = ${rootLatex(sumSq(p.b))}`,
        why: 'The same rule applies to the second bundle.',
        result: round(nb, 3),
      },
      {
        text: 'Divide the dot product by the product of the lengths.',
        latex: `\\cos\\theta = \\dfrac{${num(dot(p))}}{${num(na, 3)} \\cdot ${num(nb, 3)}} \\approx ${num(cosine(p), 3)}`,
        why: 'Since a·b = ‖a‖‖b‖cos θ, dividing by both lengths leaves only the cosine, which does not depend on how large the bundles are.',
        result: cosine(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(cosine(p), candidates(p), THREE_DP.tolerance, 0),
};
