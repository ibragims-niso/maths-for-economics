import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Q = A·K^a·L^b with a = ia/10 and b = ib/10. */
  A: number;
  ia: number;
  ib: number;
}

/** The answer is the exact value rounded to 2 decimals. */
const TOL = { tolerance: 0.01, relTolerance: 0 } as const;

/** A number inside a product, in brackets when negative: 3 → "3", −2.1 → "(-2.1)". */
const factor = (x: number) => (x < 0 ? `(${num(x, 4)})` : num(x, 4));

/**
 * The second partials at K = L = 1, computed from whole numbers so they are exact to 2 decimals:
 * Q_KK = A·a(a − 1), Q_LL = A·b(b − 1), Q_KL = A·a·b.
 */
const partials = ({ A, ia, ib }: Params) => ({
  kk: (A * ia * (ia - 10)) / 100,
  ll: (A * ib * (ib - 10)) / 100,
  kl: (A * ia * ib) / 100,
});

/** D = A²·a·b·(1 − a − b) at (1, 1), from whole numbers: A²·ia·ib·(10 − ia − ib)/1000. */
const exactDeterminant = ({ A, ia, ib }: Params) => (A * A * ia * ib * (10 - ia - ib)) / 1000;

/** MV06, difficulty 3: the Hessian determinant of a Cobb–Douglas Q = A·K^a·L^b at (1, 1). */
export const cobbDouglasHessianDeterminant: Generator<Params> = {
  id: 'cobb-douglas-hessian-determinant',
  title: 'Cobb–Douglas Hessian determinant',
  topicId: 'MV06',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const ia = rng.int(1, 9);
      const ib = rng.int(1, 9);
      // a + b = 1 gives D = 0, the borderline case; keep it, but not too often.
      if (ia + ib === 10 && rng.int(0, 3) > 0) continue;
      return { A: rng.int(2, 24), ia, ib };
    }
  },

  stem: (p) =>
    `A firm's output is $Q = ${num(p.A)}K^{${num(p.ia / 10, 1)}}L^{${num(p.ib / 10, 1)}}$. Find $D = Q_{KK}Q_{LL} - Q_{KL}^2$ at $K = 1$, $L = 1$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(exactDeterminant(p), 2), decimals: 2, ...TOL }),

  steps(p) {
    const a = num(p.ia / 10, 1);
    const b = num(p.ib / 10, 1);
    const { kk, ll, kl } = partials(p);
    const D = exactDeterminant(p);
    const sum = (p.ia + p.ib) / 10;
    return [
      {
        text: 'Differentiate twice with respect to K, then put K = L = 1.',
        latex: `Q_{KK} = ${num(p.A)} \\cdot ${a}(${a} - 1)K^{${a} - 2}L^{${b}} = ${num(kk)}`,
        why: 'Each differentiation brings the current power down and lowers it by one, so K^a gives a(a − 1)K^(a−2). At K = L = 1 every power equals 1.',
        result: kk,
      },
      {
        text: 'Do the same with respect to L.',
        latex: `Q_{LL} = ${num(p.A)} \\cdot ${b}(${b} - 1)K^{${a}}L^{${b} - 2} = ${num(ll)}`,
        why: 'With an exponent below 1 the factor b − 1 is negative, so each input on its own has a diminishing marginal product.',
        result: ll,
      },
      {
        text: 'Find the cross partial.',
        latex: `Q_{KL} = ${num(p.A)} \\cdot ${a} \\cdot ${b}\\,K^{${a} - 1}L^{${b} - 1} = ${num(kl)}`,
        why: 'Differentiate once by K and once by L. It is positive: more capital raises the marginal product of labour.',
        result: kl,
      },
      {
        text: 'Take the determinant of the Hessian.',
        latex: `D = ${factor(kk)} \\cdot ${factor(ll)} - ${factor(kl)}^2 = ${num(kk * ll, 4)} - ${num(kl * kl, 4)} = ${num(D, 4)}`,
        why: 'The product of the diagonal entries minus the square of the cross partial.',
        result: D,
      },
      {
        text: 'Read off whether Q is concave.',
        latex: `a + b = ${num(sum, 1)} ${sum < 1 ? '<' : sum > 1 ? '>' : '='} 1 \\Rightarrow D ${D > 0 ? '>' : D < 0 ? '<' : '='} 0`,
        why:
          sum <= 1
            ? 'In general D = A²ab(1 − a − b)K^(2a−2)L^(2b−2), which has the sign of 1 − a − b at every point. With a + b ≤ 1 and both own second partials negative, Q is concave: returns to scale are not increasing.'
            : 'In general D = A²ab(1 − a − b)K^(2a−2)L^(2b−2), which has the sign of 1 − a − b at every point. With a + b > 1, D < 0, so Q is not concave (increasing returns to scale), although its isoquants still bow towards the origin: Q is quasiconcave.',
      },
    ];
  },

  distractors(p) {
    const { kk, ll, kl } = partials(p);
    return cleanDistractors(
      round(exactDeterminant(p), 2),
      [
        { value: round(kk * ll + kl * kl, 2), mistakeCode: 'HESSIAN_ADDED' },
        { value: round(kk * ll, 2), mistakeCode: 'IGNORED_CROSS_TERM' },
        // Writing a² instead of a(a − 1): Q_KK = A·a², Q_LL = A·b², so D = A²a²b² − (Aab)² = 0.
        { value: 0, mistakeCode: 'POWER_NOT_LOWERED' },
      ],
      TOL.tolerance,
      TOL.relTolerance,
    );
  },
};
