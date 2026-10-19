import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Bundle A = (x1, y1) and bundle B = (x2, y2), with x1·y1 = x2·y2 and x1 < x2. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Weight on A in quarters: C = (tq/4)·A + (1 − tq/4)·B, tq ∈ {1, 2, 3}. */
  tq: 1 | 2 | 3;
}

/** Whole-number answers are exact, so the tolerance is tight. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const WEIGHT_LATEX = { 1: '\\tfrac14', 2: '\\tfrac12', 3: '\\tfrac34' } as const;

/** The mixed bundle C = tA + (1 − t)B. */
const mix = (p: Params): [number, number] => [
  (p.tq * p.x1 + (4 - p.tq) * p.x2) / 4,
  (p.tq * p.y1 + (4 - p.tq) * p.y2) / 4,
];

const utilityOfMix = (p: Params) => {
  const [x, y] = mix(p);
  return x * y;
};

/** MV06, difficulty 2: utility U = xy of a weighted mix of two equally good bundles. */
export const mixedBundleUtility: Generator<Params> = {
  id: 'mixed-bundle-utility',
  title: 'Utility of a mixed bundle',
  topicId: 'MV06',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    // A = (p·r, q·s) and B = (p·s, q·r) always give the same product p·q·r·s.
    for (;;) {
      const pf = rng.int(1, 6);
      const qf = rng.int(1, 6);
      const r = rng.int(1, 8);
      const s = rng.int(r + 1, 15);
      const tq = rng.pick([1, 2, 3] as const);
      const p: Params = { x1: pf * r, y1: qf * s, x2: pf * s, y2: qf * r, tq };
      if (Math.max(p.x2, p.y1) > 72) continue;
      const [x, y] = mix(p);
      // Whole-number coordinates of the mixed bundle keep the arithmetic readable.
      if (!Number.isInteger(x) || !Number.isInteger(y)) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer's utility from $x$ units of food and $y$ units of clothing is $U = xy$. Bundles $A = (${num(p.x1)}, ${num(p.y1)})$ and $B = (${num(p.x2)}, ${num(p.y2)})$ lie on the same indifference curve. Find the utility of the mixed bundle $C = ${WEIGHT_LATEX[p.tq]}A + ${WEIGHT_LATEX[(4 - p.tq) as 1 | 2 | 3]}B$.`,

  answer: (p) => ({ kind: 'numeric', value: utilityOfMix(p), decimals: 0, ...EXACT }),

  steps(p) {
    const ubar = p.x1 * p.y1;
    const [x, y] = mix(p);
    const u = x * y;
    const t = WEIGHT_LATEX[p.tq];
    const s = WEIGHT_LATEX[(4 - p.tq) as 1 | 2 | 3];
    return [
      {
        text: 'Find the utility of the two bundles.',
        latex: `U(A) = ${num(p.x1)} \\cdot ${num(p.y1)} = ${num(ubar)}, \\qquad U(B) = ${num(p.x2)} \\cdot ${num(p.y2)} = ${num(ubar)}`,
        why: 'Both bundles are on the same indifference curve, so they give the same utility; this is the level of that curve.',
        result: ubar,
      },
      {
        text: 'Mix the bundles good by good with the given weights.',
        latex: `C = \\left(${t} \\cdot ${num(p.x1)} + ${s} \\cdot ${num(p.x2)},\\ ${t} \\cdot ${num(p.y1)} + ${s} \\cdot ${num(p.y2)}\\right) = (${num(x)}, ${num(y)})`,
        why: 'A mixed bundle is a weighted average of the quantities, food with food and clothing with clothing. It lies on the straight segment from A to B.',
      },
      {
        text: 'Find the utility of the mixed bundle.',
        latex: `U(C) = ${num(x)} \\cdot ${num(y)} = ${num(u)}`,
        why: 'Put the mixed quantities into the utility function; do not average the two utilities.',
        result: u,
      },
      {
        text: 'Compare with the indifference curve.',
        latex: `U(C) = ${num(u)} > ${num(ubar)} = U(A) = U(B)`,
        why: 'The mix is strictly better than either extreme bundle: the segment from A to B lies in the upper level set, which is convex. That is what quasiconcave utility and indifference curves bowed towards the origin mean.',
      },
    ];
  },

  distractors(p) {
    const ubar = p.x1 * p.y1;
    return cleanDistractors(
      utilityOfMix(p),
      [
        { value: ubar, mistakeCode: 'AVERAGED_UTILITIES' },
        { value: ((p.x1 + p.x2) * (p.y1 + p.y2)) / 4, mistakeCode: 'IGNORED_WEIGHTS' },
        { value: (p.x1 + p.x2) * (p.y1 + p.y2), mistakeCode: 'SUMMED_BUNDLES' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
