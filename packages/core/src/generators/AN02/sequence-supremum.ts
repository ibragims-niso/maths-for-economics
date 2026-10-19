import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** What the plans are and what uₙ measures. */
  setting: string;
  /** Plan n gives uₙ = (p·n + q)/(n + r), for n = 1, 2, 3, … */
  p: number;
  q: number;
  r: number;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const SETTINGS = [
  'A consumer can choose one of the plans $n = 1, 2, 3, \\dots$, and plan $n$ gives her utility',
  'A firm can choose one of the designs $n = 1, 2, 3, \\dots$, and design $n$ earns a profit (in thousands) of',
  'A worker can choose one of the training schemes $n = 1, 2, 3, \\dots$, and scheme $n$ raises her hourly wage by',
] as const;

/** The value of plan n. */
export const planValue = (p: Pick<Params, 'p' | 'q' | 'r'>, n: number) =>
  (p.p * n + p.q) / (n + p.r);

/** q − p·r: negative when the values rise towards p, positive when they fall towards p. */
const tilt = (p: Params) => p.q - p.p * p.r;

const rising = (p: Params) => tilt(p) < 0;

/** The least upper bound: the limit p when the values rise, the first value when they fall. */
const supremum = (p: Params) => (rising(p) ? p.p : round(planValue(p, 1), 2));

function candidates(p: Params) {
  return rising(p)
    ? [
        { value: round(planValue(p, 1), 2), mistakeCode: 'INF_AS_SUP' },
        { value: round(planValue(p, 10), 2), mistakeCode: 'LAST_TERM_CHECKED' },
      ]
    : [
        { value: p.p, mistakeCode: 'INF_AS_SUP' },
        { value: round(p.q / p.r, 2), mistakeCode: 'STARTED_AT_ZERO' },
      ];
}

/** True when u₁ = (p + q)/(1 + r) has at most 2 decimals. */
const exactFirst = (p: Params) => (100 * (p.p + p.q)) % (1 + p.r) === 0;

const fraction = (p: Params) =>
  `\\dfrac{${p.p === 1 ? '' : num(p.p)}n + ${num(p.q)}}{n + ${num(p.r)}}`;

/** AN02, difficulty 1: the supremum of the values (pn + q)/(n + r), n ≥ 1: a limit or a first term. */
export const sequenceSupremum: Generator<Params> = {
  id: 'sequence-supremum',
  title: 'Supremum of attainable values',
  topicId: 'AN02',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        setting: rng.pick(SETTINGS),
        p: rng.int(2, 12),
        q: rng.int(1, 60),
        r: rng.int(1, 9),
      };
      if (tilt(p) === 0) continue;
      // A falling sequence has its first value as the answer: keep it to 2 decimals exactly.
      if (!rising(p) && !exactFirst(p)) continue;
      if (
        cleanDistractors(supremum(p), candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 2
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `${p.setting} $u_n = ${fraction(p)}$. What is the supremum (least upper bound) of the set of values $\\{u_1, u_2, u_3, \\dots\\}$?${Number.isInteger(supremum(p)) ? '' : ' Give your answer to 2 decimal places.'}`,

  answer: (p) => ({ kind: 'numeric', value: supremum(p), decimals: 2, ...EXACT }),

  steps(p) {
    const t = tilt(p);
    const gap = `u_n - ${num(p.p)} = \\frac{${num(p.q)} - ${num(p.p)} \\cdot ${num(p.r)}}{n + ${num(p.r)}} = \\frac{${num(t)}}{n + ${num(p.r)}}`;
    const first = {
      text: 'Compare each value with the limit p of the sequence.',
      latex: gap,
      why: `As n grows the values tend to ${p.p}, the ratio of the coefficients of n. The sign of the numerator tells us on which side of ${p.p} every value lies, and the growing denominator shows the gap shrinking.`,
    };
    if (rising(p)) {
      return [
        first,
        {
          text: 'The values rise towards the limit and never reach it.',
          latex: `u_1 ${exactFirst(p) ? '=' : '\\approx'} ${num(planValue(p, 1), 2)} < u_2 < u_3 < \\dots < ${num(p.p)}`,
          why: `The numerator −${-t} is negative, so every value is below ${p.p}, and the gap shrinks as n grows, so the values increase. ${p.p} is therefore an upper bound.`,
          result: round(planValue(p, 1), 2),
        },
        {
          text: 'No smaller number is an upper bound.',
          latex: `\\sup_n u_n = \\lim_{n \\to \\infty} u_n = ${num(p.p)}`,
          why: `Any number below ${p.p} is overtaken by uₙ for large enough n, because the values come as close to ${p.p} as we like. So ${p.p} is the least upper bound, but no option attains it: there is no best choice.`,
          result: p.p,
        },
      ];
    }
    return [
      first,
      {
        text: 'The values fall towards the limit, so the first one is the largest.',
        latex: `u_1 > u_2 > u_3 > \\dots > ${num(p.p)}`,
        why: `The numerator ${t} is positive, so every value is above ${p.p}, and the gap shrinks as n grows, so the values decrease. ${p.p} is the infimum, not the supremum.`,
      },
      {
        text: 'The supremum is the first value, and it is attained.',
        latex: `\\sup_n u_n = u_1 = \\frac{${num(p.p)} + ${num(p.q)}}{1 + ${num(p.r)}} = ${num(supremum(p))}`,
        why: 'n starts at 1, so u₁ is in the set and no value exceeds it. A supremum that belongs to the set is a maximum: option 1 is the best choice.',
        result: supremum(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(supremum(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
