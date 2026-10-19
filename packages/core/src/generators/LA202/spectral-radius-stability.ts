import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { charPolyLatex, paren } from './eigen';

interface Params {
  /** Entries of A in tenths (whole numbers), so A = (1/10)·[[a, b], [c, d]]; integers keep the arithmetic exact. */
  a: number;
  b: number;
  c: number;
  d: number;
}

/** The spectral radius is asked to 2 decimal places. */
const DP2 = { tolerance: 0.01, relTolerance: 0 } as const;

const traceOf = (p: Params) => (p.a + p.d) / 10;
const detOf = (p: Params) => (p.a * p.d - p.b * p.c) / 100;
/** (trace² − 4·det) × 100, a whole number: (a − d)² + 4bc. */
const disc100 = (p: Params) => (p.a - p.d) ** 2 + 4 * p.b * p.c;
const isReal = (p: Params) => disc100(p) > 0;

/** The two real eigenvalues, larger first (only when the discriminant is positive). */
const realRoots = (p: Params): [number, number] => {
  const s = Math.sqrt(disc100(p));
  return [(p.a + p.d + s) / 20, (p.a + p.d - s) / 20];
};

/** The spectral radius: the largest |λ|. A complex pair has |λ|² = λ·λ̄ = det A. */
const exactRho = (p: Params) => {
  if (!isReal(p)) return Math.sqrt(detOf(p));
  const [l1, l2] = realRoots(p);
  return Math.max(Math.abs(l1), Math.abs(l2));
};
const answerOf = (p: Params) => round(exactRho(p), 2);

const candidates = (p: Params): Distractor[] => {
  const diagonal = {
    value: Math.max(Math.abs(p.a), Math.abs(p.d)) / 10,
    mistakeCode: 'DIAGONAL_ENTRY',
  };
  if (isReal(p)) {
    const [l1, l2] = realRoots(p);
    return [
      { value: round(l1, 2), mistakeCode: 'SIGNED_NOT_ABSOLUTE' },
      { value: round(Math.min(Math.abs(l1), Math.abs(l2)), 2), mistakeCode: 'SMALLER_EIGENVALUE' },
      diagonal,
    ];
  }
  return [
    { value: round(Math.abs(traceOf(p)) / 2, 2), mistakeCode: 'REAL_PART_ONLY' },
    { value: round(detOf(p), 2), mistakeCode: 'MODULUS_SQUARED' },
    diagonal,
  ];
};

const matrixOf = (p: Params) => [
  [p.a / 10, p.b / 10],
  [p.c / 10, p.d / 10],
];

/** "=" when x has at most 2 decimals, "\approx" when num() rounds it. */
const rel = (x: number) => (Math.abs(x - round(x, 2)) < 1e-9 ? '=' : '\\approx');
/** "= 0.85" for an exact value, "\approx 0.85" otherwise. */
const eq = (x: number) => `${rel(x)} ${num(x)}`;

/** LA202, difficulty 3: the spectral radius of a 2×2 matrix, which decides whether x_{t+1} = Ax_t is stable. */
export const spectralRadiusStability: Generator<Params> = {
  id: 'spectral-radius-stability',
  title: 'Stability from the eigenvalues',
  topicId: 'LA202',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        a: rng.int(-5, 12),
        b: rng.int(1, 8) * rng.pick([1, -1]),
        c: rng.int(1, 8) * rng.pick([1, -1]),
        d: rng.int(-5, 12),
      };
      // No repeated eigenvalue, and ρ clearly on one side of 1 so the verdict is clear.
      if (disc100(p) === 0) continue;
      const rho = exactRho(p);
      if (Math.abs(rho - 1) < 0.03 || rho > 2 || rho < 0.2) continue;
      if (cleanDistractors(answerOf(p), candidates(p), DP2.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `Deviations of output in two sectors from their trend follow $x_{t+1} = Ax_t$ with $A = ${pmatrix(matrixOf(p))}$. The system is stable when the spectral radius $\\rho$, the largest $|\\lambda|$ over the eigenvalues of $A$, is below 1. Find $\\rho$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2, ...DP2 }),

  steps(p) {
    const t = traceOf(p);
    const det = detOf(p);
    const disc = disc100(p) / 100;
    const rho = exactRho(p);
    const first: Step[] = [
      {
        text: 'Find the trace and the determinant.',
        latex: `\\operatorname{tr} A = ${num(t)},\\qquad \\det A = ${paren(p.a / 10)} \\cdot ${paren(p.d / 10)} - ${paren(p.b / 10)} \\cdot ${paren(p.c / 10)} = ${num(det)}`,
        why: 'The characteristic equation of a 2×2 matrix is λ² − (trace)λ + det = 0.',
        result: det,
      },
    ];
    const verdict =
      rho < 1
        ? 'ρ < 1: every eigenvalue is smaller than 1 in size, so deviations shrink and the system is stable.'
        : 'ρ > 1: along the direction of the largest eigenvalue deviations grow, so the system is unstable.';
    if (isReal(p)) {
      const [l1, l2] = realRoots(p);
      return [
        ...first,
        {
          text: 'Solve the characteristic equation; the discriminant is positive, so both roots are real.',
          latex: `${charPolyLatex(t, det)} = 0,\\quad \\lambda = \\dfrac{${num(t)} \\pm \\sqrt{${num(disc)}}}{2}:\\quad \\lambda_1 ${eq(l1)},\\; \\lambda_2 ${eq(l2)}`,
          why: 'With trace² − 4·det > 0 there are two different real eigenvalues.',
        },
        {
          text: 'Take the larger of the two absolute values.',
          latex: `\\rho = \\max(|\\lambda_1|, |\\lambda_2|) ${eq(rho)}`,
          why: 'Stability depends on the size of the eigenvalues, not their sign: a negative eigenvalue makes the path flip sign every period, but it still shrinks if its size is below 1.',
          result: answerOf(p),
        },
        { text: 'Compare with 1.', latex: `\\rho ${rho < 1 ? '<' : '>'} 1`, why: verdict },
      ];
    }
    const beta = Math.sqrt(-disc) / 2;
    return [
      ...first,
      {
        text: 'Solve the characteristic equation; the discriminant is negative, so the roots are complex.',
        latex: `${charPolyLatex(t, det)} = 0,\\quad \\operatorname{tr}^2 - 4\\det = ${num(disc)} < 0:\\quad \\lambda ${rel(beta)} ${num(t / 2)} \\pm ${num(beta)}\\,i`,
        why: 'Complex eigenvalues come in a pair α ± βi; the path then circles round the origin, so deviations oscillate.',
      },
      {
        text: 'Find the size of the complex eigenvalues.',
        latex: `|\\lambda| = \\sqrt{\\alpha^2 + \\beta^2} = \\sqrt{\\det A} = \\sqrt{${num(det)}} ${eq(rho)}`,
        why: 'The two eigenvalues have the same size and multiply to det A, so |λ|² = det A.',
        result: answerOf(p),
      },
      { text: 'Compare with 1.', latex: `\\rho ${rho < 1 ? '<' : '>'} 1`, why: verdict },
    ];
  },

  distractors: (p) => cleanDistractors(answerOf(p), candidates(p), DP2.tolerance, 0),
};
