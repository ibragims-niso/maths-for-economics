import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Inverse demand P = A − b(q₁ + q₂). */
  A: number;
  b: number;
  /** Marginal costs of firms 1 and 2 (different). */
  c1: number;
  c2: number;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Firm i's best response to the rival's output: (A − cᵢ − b·q)/(2b), never below 0. */
export const bestResponse = (p: Params, cost: number, rival: number) =>
  Math.max(0, (p.A - cost - p.b * rival) / (2 * p.b));

/** Firm 1's output after both firms respond once: q₁ ↦ BR₁(BR₂(q₁)). */
export const compositeResponse = (p: Params, q1: number) =>
  bestResponse(p, p.c1, bestResponse(p, p.c2, q1));

/** The intercept α of the composite map α + q₁/4 (valid while both responses are positive). */
export const compositeIntercept = (p: Params) => (p.A - 2 * p.c1 + p.c2) / (4 * p.b);

/** Nash equilibrium outputs: (A − 2c₁ + c₂)/(3b) and (A − 2c₂ + c₁)/(3b). */
export const nashOutput1 = (p: Params) => (p.A - 2 * p.c1 + p.c2) / (3 * p.b);
export const nashOutput2 = (p: Params) => (p.A - 2 * p.c2 + p.c1) / (3 * p.b);

function candidates(p: Params): Distractor[] {
  return [
    { value: round((p.A - p.c1) / (2 * p.b), 2), mistakeCode: 'BEST_RESPONSE_TO_ZERO' },
    { value: round((p.A - p.c1) / (3 * p.b), 2), mistakeCode: 'IGNORED_RIVAL_COST' },
    { value: round(compositeIntercept(p) / 1.25, 2), mistakeCode: 'SIGN_OF_K' },
    { value: round(nashOutput2(p), 2), mistakeCode: 'OTHER_FIRM' },
  ];
}

const coef = (k: number) => (k === 1 ? '' : num(k));

/** AN05, difficulty 3: Cournot duopoly with unequal costs; firm 1's Nash output as the fixed point of the composite best-response map (a contraction with k = 1/4). */
export const cournotBestResponseFixedPoint: Generator<Params> = {
  id: 'cournot-best-response-fixed-point',
  title: 'Nash output as a fixed point',
  topicId: 'AN05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const b = rng.int(1, 2);
      const q1 = rng.int(8, 60);
      const m = rng.int(-8, 8);
      if (m === 0) continue;
      const c1 = rng.int(2, 40);
      const c2 = c1 + b * m;
      // Firm 2's output is q₁ − m; both outputs and both costs must be positive.
      if (c2 < 2 || q1 - m < 5) continue;
      const p: Params = { A: 3 * b * q1 + 2 * c1 - c2, b, c1, c2 };
      if (cleanDistractors(q1, candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) =>
    `Two firms face inverse demand $P = ${num(p.A)} - ${coef(p.b)}(q_1 + q_2)$. Firm 1 has marginal cost ${num(p.c1)} and firm 2 has marginal cost ${num(p.c2)}, so the best responses are $q_1 = \\dfrac{${num(p.A - p.c1)} - ${coef(p.b)}q_2}{${num(2 * p.b)}}$ and $q_2 = \\dfrac{${num(p.A - p.c2)} - ${coef(p.b)}q_1}{${num(2 * p.b)}}$. The map $q_1 \\mapsto BR_1(BR_2(q_1))$ is a contraction. Find its fixed point, firm 1's Nash equilibrium output.`,

  answer: (p) => ({ kind: 'numeric', value: nashOutput1(p), decimals: 2, ...EXACT }),

  steps(p) {
    const alpha = compositeIntercept(p);
    const q1 = nashOutput1(p);
    const q2 = nashOutput2(p);
    const r1 = (p.A - p.c1) / (2 * p.b);
    const r2 = (p.A - p.c2) / (2 * p.b);
    return [
      {
        text: 'Write each best response as an intercept minus half the rival’s output.',
        latex: `BR_1(q_2) = ${num(r1)} - \\tfrac12 q_2, \\qquad BR_2(q_1) = ${num(r2)} - \\tfrac12 q_1`,
        why: 'Dividing (A − cᵢ − b·q_j) by 2b gives (A − cᵢ)/(2b) − q_j/2: each firm cuts its output by half of any increase in its rival’s.',
        result: round(r1, 2),
      },
      {
        text: 'Compose the two maps: firm 2 responds to q₁, then firm 1 responds to that.',
        latex: `g(q_1) = ${num(r1)} - \\tfrac12\\bigl(${num(r2)} - \\tfrac12 q_1\\bigr) = ${num(alpha)} + \\tfrac14 q_1`,
        why: 'The two slopes −1/2 multiply to +1/4, so |g(x) − g(y)| = ¼|x − y|: g is a contraction with k = 1/4, and it has exactly one fixed point.',
        result: round(alpha, 2),
      },
      {
        text: 'Solve q₁ = g(q₁).',
        latex: `q_1^* = \\dfrac{${num(alpha)}}{1 - \\tfrac14} = ${num(q1)}`,
        why: `At the fixed point firm 1 is already best-responding to firm 2’s best response. Check: firm 2 then produces ${round(r2)} − ${round(q1)}/2 = ${round(q2)}, and firm 1’s best response to ${round(q2)} is ${round(q1)} again, so neither firm wants to change: a Nash equilibrium.`,
        result: q1,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(nashOutput1(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
