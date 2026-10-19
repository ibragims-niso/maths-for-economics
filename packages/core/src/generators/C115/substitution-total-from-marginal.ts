import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'root': marginal cost aQ√(Q² + c); 'log': marginal revenue aQ/(Q² + c). */
  form: 'root' | 'log';
  a: number;
  c: number;
  /** Upper limit: output rises from Q = 0 to Q = b. */
  b: number;
}

/** Pythagorean triples [b, √c, √(b² + c)], so that both limits of u = Q² + c are perfect squares. */
const TRIPLES = [
  [3, 4, 5],
  [4, 3, 5],
  [5, 12, 13],
  [12, 5, 13],
  [6, 8, 10],
  [8, 6, 10],
  [8, 15, 17],
  [15, 8, 17],
  [9, 12, 15],
  [12, 9, 15],
] as const;

const upper = (p: Params) => p.b * p.b + p.c;

/** The exact value of ∫₀ᵇ of the marginal function. */
function exact(p: Params): number {
  if (p.form === 'root') return (p.a / 3) * (upper(p) ** 1.5 - p.c ** 1.5);
  return (p.a / 2) * Math.log(upper(p) / p.c);
}

/** "a/3" written as a whole number when it is one, otherwise as a fraction. */
const third = (a: number) => (a % 3 === 0 ? num(a / 3) : `\\tfrac{${a}}{3}`);
const coef = (a: number) => (a === 1 ? '' : num(a));

/** C115, difficulty 1: total cost or revenue from a marginal function by substituting u = Q² + c. */
export const substitutionTotalFromMarginal: Generator<Params> = {
  id: 'substitution-total-from-marginal',
  title: 'Total from a marginal function by substitution',
  topicId: 'C115',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    if (rng.next() < 0.5) {
      const [b, s] = rng.pick(TRIPLES);
      return { form: 'root', a: rng.int(1, 9), c: s * s, b };
    }
    for (;;) {
      const p: Params = {
        form: 'log',
        a: 2 * rng.int(1, 30),
        c: rng.int(2, 30),
        b: rng.int(1, 12),
      };
      if (exact(p) >= 2) return p;
    }
  },

  stem: (p) =>
    p.form === 'root'
      ? `A firm's marginal cost is $MC(Q) = ${coef(p.a)}Q\\sqrt{Q^2 + ${num(p.c)}}$. By how much does total cost rise when output goes from $Q = 0$ to $Q = ${num(p.b)}$, that is, what is $\\int_0^{${num(p.b)}} MC(Q)\\,dQ$?${Number.isInteger(round(exact(p), 2)) ? '' : ' Give your answer to 2 decimal places.'}`
      : `A firm's marginal revenue is $MR(Q) = \\dfrac{${num(p.a)}Q}{Q^2 + ${num(p.c)}}$, with revenue $0$ at $Q = 0$. Find total revenue from selling $Q = ${num(p.b)}$ units, $R(${num(p.b)}) = \\int_0^{${num(p.b)}} MR(Q)\\,dQ$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(exact(p), 2), decimals: 2 }),

  steps(p) {
    const u1 = upper(p);
    const first: Step[] = [
      {
        text: 'Substitute u = Q² + c.',
        latex: `u = Q^2 + ${num(p.c)},\\quad du = 2Q\\,dQ \\;\\Rightarrow\\; ${coef(p.a)}Q\\,dQ = ${coef(p.a / 2)}\\,du`,
        why: 'The factor Q outside is, up to a constant, the derivative of the inside Q² + c. That is the chain rule pattern f(g(Q))·g′(Q) run backwards.',
      },
      {
        text: 'Change the limits to values of u.',
        latex: `Q = 0 \\Rightarrow u = ${num(p.c)}, \\qquad Q = ${num(p.b)} \\Rightarrow u = ${num(u1)}`,
        why: 'After the substitution the variable is u, so the limits must be values of u: put each Q-limit into u = Q² + c.',
      },
    ];
    if (p.form === 'root') {
      const h = Math.sqrt(u1);
      const s = Math.sqrt(p.c);
      return [
        ...first,
        {
          text: 'Integrate the power of u.',
          latex: `\\int_{${num(p.c)}}^{${num(u1)}} ${num(p.a / 2)}\\,u^{1/2}\\,du = ${third(p.a)}\\Big[u^{3/2}\\Big]_{${num(p.c)}}^{${num(u1)}}`,
          why: 'Raise the power by one, from 1/2 to 3/2, and divide by the new power: (a/2) × (2/3) = a/3.',
        },
        {
          text: 'Evaluate at the two limits.',
          latex: `${third(p.a)}\\big(${num(h)}^3 - ${num(s)}^3\\big) = ${third(p.a)}(${num(h ** 3)} - ${num(s ** 3)}) = ${num(round(exact(p), 2))}`,
          why: 'u^(3/2) = (√u)³, and both limits are perfect squares. Subtract the value at the lower limit from the value at the upper limit.',
          result: round(exact(p), 2),
        },
      ];
    }
    return [
      ...first,
      {
        text: 'Integrate 1/u.',
        latex: `\\int_{${num(p.c)}}^{${num(u1)}} \\frac{${num(p.a / 2)}}{u}\\,du = ${coef(p.a / 2)}\\Big[\\ln u\\Big]_{${num(p.c)}}^{${num(u1)}}`,
        why: 'The integral of 1/u is ln u, since the derivative of ln u is 1/u (u is positive here).',
      },
      {
        text: 'Evaluate at the two limits.',
        latex: `${coef(p.a / 2)}\\big(\\ln ${num(u1)} - \\ln ${num(p.c)}\\big) = ${coef(p.a / 2)}\\ln\\dfrac{${num(u1)}}{${num(p.c)}} = ${num(round(exact(p), 2))}`,
        why: 'Subtract the value at the lower limit; a difference of logs is the log of a ratio.',
        result: round(exact(p), 2),
      },
    ];
  },

  distractors(p) {
    const answer = round(exact(p), 2);
    const u1 = upper(p);
    if (p.form === 'root') {
      return cleanDistractors(answer, [
        { value: round((p.a / 3) * p.b ** 3, 2), mistakeCode: 'FORGOT_LIMITS' },
        { value: round((p.a / 3) * u1 ** 1.5, 2), mistakeCode: 'LOWER_LIMIT_DROPPED' },
        { value: round(2 * exact(p), 2), mistakeCode: 'FORGOT_DU_FACTOR' },
        { value: round(3 * exact(p), 2), mistakeCode: 'DIVIDED_BY_OLD_POWER' },
      ]);
    }
    return cleanDistractors(answer, [
      { value: round((p.a / 2) * Math.log(u1), 2), mistakeCode: 'LOWER_LIMIT_DROPPED' },
      { value: round(2 * exact(p), 2), mistakeCode: 'FORGOT_DU_FACTOR' },
    ]);
  },
};
