import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Profit is π(Q) = −aQ² + bQ − c = −a(Q − low)(Q − high). */
  a: number;
  b: number;
  c: number;
  /** Drawn first: the two break-even quantities, low < high. */
  low: number;
  high: number;
  ask: 'smaller' | 'larger';
}

const asked = (p: Params) => (p.ask === 'smaller' ? p.low : p.high);
/** −1 picks the "−" branch of ±, +1 the "+" branch. */
const branch = (p: Params) => (p.ask === 'smaller' ? -1 : 1);

/** F02, difficulty 2: smaller or larger break-even quantity for π(Q) = −aQ² + bQ − c. */
export const quadraticBreakEven: Generator<Params> = {
  id: 'quadratic-break-even',
  title: 'Break-even with quadratic profit',
  topicId: 'F02',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    const a = rng.int(1, 5);
    const low = rng.int(5, 60);
    const high = low + rng.int(5, 80);
    return {
      a,
      b: a * (low + high),
      c: a * low * high,
      low,
      high,
      ask: rng.pick(['smaller', 'larger'] as const),
    };
  },

  stem: (p) =>
    `A firm's profit from producing $Q$ units is $\\pi(Q) = -${p.a === 1 ? '' : num(p.a)}Q^2 + ${num(p.b)}Q - ${num(p.c)}$. Find the ${
      p.ask === 'smaller'
        ? 'smaller break-even quantity, where the firm starts to make a profit'
        : 'larger break-even quantity, beyond which the firm makes a loss again'
    }.`,

  answer: (p) => ({ kind: 'numeric', value: asked(p), decimals: 0 }),

  steps(p) {
    const d = p.b * p.b - 4 * p.a * p.c;
    const s = Math.sqrt(d);
    return [
      {
        text: 'Break-even means zero profit. Set π(Q) = 0 and multiply both sides by −1.',
        latex: `${p.a === 1 ? '' : num(p.a)}Q^2 - ${num(p.b)}Q + ${num(p.c)} = 0`,
        why: 'Multiplying by −1 keeps the same solutions and makes the Q² coefficient positive, so fewer signs can slip.',
      },
      {
        text: 'Compute the discriminant.',
        latex: `D = ${num(p.b)}^2 - 4 \\cdot ${num(p.a)} \\cdot ${num(p.c)} = ${num(d)}`,
        why: 'D = b² − 4ac is positive, so the equation has two solutions: two break-even quantities.',
        result: d,
      },
      {
        text: 'Apply the quadratic formula.',
        latex: `Q = \\dfrac{${num(p.b)} \\pm \\sqrt{${num(d)}}}{2 \\cdot ${num(p.a)}} = \\dfrac{${num(p.b)} \\pm ${num(s)}}{${num(2 * p.a)}}, \\quad Q_1 = ${num(p.low)}, \\; Q_2 = ${num(p.high)}`,
        why: 'The minus sign gives the smaller solution and the plus sign the larger one; the whole numerator is divided by 2a.',
      },
      {
        text: `Choose the ${p.ask} break-even quantity.`,
        latex: `Q = ${num(asked(p))}`,
        why: 'Profit is positive between the two break-even quantities: the firm starts to make a profit at the smaller one and makes a loss again beyond the larger one.',
        result: asked(p),
      },
    ];
  },

  distractors(p) {
    const s = Math.sqrt(p.b * p.b - 4 * p.a * p.c);
    const k = branch(p);
    return cleanDistractors(asked(p), [
      { value: p.ask === 'smaller' ? p.high : p.low, mistakeCode: 'OTHER_ROOT' },
      { value: round((p.b + k * s) / p.a, 2), mistakeCode: 'HALF_DENOMINATOR' },
      { value: round(p.b + (k * s) / (2 * p.a), 2), mistakeCode: 'PARTIAL_DIVISION' },
      {
        value: round((p.b + k * Math.sqrt(p.b * p.b + 4 * p.a * p.c)) / (2 * p.a), 2),
        mistakeCode: 'DISCRIMINANT_SIGN',
      },
    ]);
  },
};
