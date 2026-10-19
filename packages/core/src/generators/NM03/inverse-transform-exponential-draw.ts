import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'default' | 'arrival' | 'claim';

interface Params {
  context: Context;
  /** The mean m of the exponential distribution, F(x) = 1 − e^(−x/m). */
  mean: number;
  /** The uniform draw u in (0, 1), given to 2 or 3 decimals. */
  u: number;
}

/** Two decimals are asked for; only rounding slips are forgiven. */
const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;

/** x = F⁻¹(u) = −m·ln(1 − u). */
export const inverseExponential = (p: Params) => -p.mean * Math.log(1 - p.u);

const draw = (p: Params) => round(inverseExponential(p), 2);

function candidates(p: Params) {
  return [
    { value: round(-p.mean * Math.log(p.u), 2), mistakeCode: 'LN_U_NOT_ONE_MINUS_U' },
    { value: round(-Math.log(1 - p.u) / p.mean, 2), mistakeCode: 'RATE_FOR_MEAN' },
    { value: round(p.mean * Math.log(1 - p.u), 2), mistakeCode: 'DROPPED_MINUS' },
  ];
}

const STORY: Record<Context, { what: string; unit: string }> = {
  default: { what: 'The time until a borrower defaults on a loan', unit: 'years' },
  arrival: { what: 'The time between two customers arriving at a bank branch', unit: 'minutes' },
  claim: { what: 'The size of an insurance claim', unit: 'thousand' },
};

/** NM03, difficulty 2: turn a uniform draw into an exponential one with the inverse transform. */
export const inverseTransformExponentialDraw: Generator<Params> = {
  id: 'inverse-transform-exponential-draw',
  title: 'Inverse transform: an exponential draw',
  topicId: 'NM03',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['default', 'arrival', 'claim'] as const);
      const mean =
        context === 'default'
          ? rng.int(2, 25)
          : context === 'arrival'
            ? rng.int(2, 30) / 2
            : rng.int(1, 60);
      const u = rng.pick([true, false]) ? rng.int(2, 98) / 100 : rng.int(11, 989) / 1000;
      const p: Params = { context, mean, u };
      // ln(1 − u) and ln u must differ clearly, so u = 0.5 and its neighbours are left out.
      if (Math.abs(u - 0.5) < 0.04) continue;
      if (cleanDistractors(draw(p), candidates(p), TWO_DP.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) => {
    const { what, unit } = STORY[p.context];
    return `${what} is exponential with mean $m = ${num(p.mean)}$ (${unit}), so its distribution function is $F(x) = 1 - e^{-x/${num(p.mean)}}$ for $x \\ge 0$. A simulation turns the uniform draw $u = ${num(p.u, 3)}$ into a value with the inverse transform $x = F^{-1}(u)$. Find $x$ to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: draw(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const m = num(p.mean);
    const u = num(p.u, 3);
    const ln = Math.log(1 - p.u);
    return [
      {
        text: 'Set the distribution function equal to the uniform draw.',
        latex: `1 - e^{-x/${m}} = ${u} \\iff e^{-x/${m}} = 1 - ${u} = ${num(1 - p.u, 3)}`,
        why: 'The inverse transform picks the value x whose cumulative probability F(x) is exactly u.',
      },
      {
        text: 'Take natural logarithms.',
        latex: `-\\dfrac{x}{${m}} = \\ln ${num(1 - p.u, 3)} = ${num(ln, 4)}`,
        why: 'ln undoes e^(·); the logarithm of a number below 1 is negative, so x will come out positive.',
        result: ln,
      },
      {
        text: 'Solve for x.',
        latex: `x = -${m} \\times (${num(ln, 4)}) = ${num(inverseExponential(p), 2)}`,
        why: 'Multiply both sides by −m. A larger u gives a larger x, because F is increasing.',
        result: draw(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(draw(p), candidates(p), TWO_DP.tolerance, 0),
};
