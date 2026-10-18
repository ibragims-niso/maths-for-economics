import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'cost' | 'gdp' | 'revenue';

interface Params {
  context: Context;
  /** f(x) = c + bx + ax²; a is negative for revenue. */
  a: number;
  b: number;
  c: number;
  x0: number;
}

/** The answer is exact (at most 2 decimals), so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const f = (p: Params, x: number) => round(p.c + p.b * x + p.a * x * x, 4);
/** The limit of the difference quotient of c + bx + ax² at x₀. */
const rate = (p: Params) => round(2 * p.a * p.x0 + p.b, 4);
const v = (p: Params) => (p.context === 'gdp' ? 't' : 'Q');
const name = (p: Params) => (p.context === 'cost' ? 'C' : p.context === 'gdp' ? 'Y' : 'R');
const coef = (k: number) => (k === 1 ? '' : num(k));

function formula(p: Params): string {
  const x = v(p);
  if (p.context === 'revenue') return `${num(p.b)}${x} - ${coef(-p.a)}${x}^2`;
  return `${num(p.c)} + ${num(p.b)}${x} + ${coef(p.a)}${x}^2`;
}

/** "+ 2h" or "- 0.5h" for the leftover a·h in the difference quotient. */
const plusAh = (a: number) => `${a < 0 ? '-' : '+'} ${coef(Math.abs(a))}h`;

/** C102, difficulty 2: instantaneous rate of change of a quadratic at a point, as the limit of the difference quotient. */
export const instantaneousRateQuadratic: Generator<Params> = {
  id: 'instantaneous-rate-quadratic',
  title: 'Instantaneous rate of change',
  topicId: 'C102',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    const context = rng.pick(['cost', 'gdp', 'revenue'] as const);
    if (context === 'gdp') {
      return {
        context,
        a: rng.int(1, 8) / 10,
        b: rng.int(4, 30) / 2,
        c: rng.int(20, 400),
        x0: rng.int(1, 15),
      };
    }
    const a = rng.int(1, 6) / 2;
    const x0 = rng.int(4, 50);
    if (context === 'cost') {
      return { context, a, b: rng.int(2, 40), c: rng.int(2, 40) * 50, x0 };
    }
    // Revenue still rising at x₀: the rate b − 2a·x₀ is drawn first, then b is built from it.
    const margin = rng.int(5, 60);
    return { context, a: -a, b: round(2 * a * x0 + margin, 4), c: 0, x0 };
  },

  stem: (p) => {
    const x = v(p);
    const how = 'Using the limit of the difference quotient, find';
    if (p.context === 'gdp') {
      return `A country's GDP, in billions, $t$ years after 2020 is modelled by $Y(t) = ${formula(p)}$. ${how} how fast GDP is growing, in billions per year, at $t = ${num(p.x0)}$.`;
    }
    const what = p.context === 'cost' ? 'total cost' : 'revenue';
    const units = p.context === 'cost' ? 'of producing' : 'from selling';
    return `A firm's ${what} ${units} $${x}$ units is $${name(p)}(${x}) = ${formula(p)}$. ${how} the instantaneous rate of change of ${what} at $${x} = ${num(p.x0)}$ (per extra unit).`;
  },

  answer: (p) => ({ kind: 'numeric', value: rate(p), decimals: 2, ...EXACT }),

  steps: (p) => {
    const F = name(p);
    const x0 = num(p.x0);
    return [
      {
        text: 'Write the difference quotient at the point.',
        latex: `\\dfrac{${F}(${x0} + h) - ${F}(${x0})}{h}`,
        why: `It is the slope of the secant line from ${v(p)} = ${x0} to ${v(p)} = ${x0} + h: the average rate of change over a step of size h.`,
      },
      {
        text: 'Expand and simplify.',
        latex: `${F}(${x0} + h) - ${F}(${x0}) = ${num(rate(p))}h ${plusAh(p.a)}^2 \\;\\Rightarrow\\; \\dfrac{${F}(${x0} + h) - ${F}(${x0})}{h} = ${num(rate(p))} ${plusAh(p.a)}`,
        why: `Use (${x0} + h)² = ${x0}² + 2·${x0}·h + h². Everything without an h cancels in the subtraction, so every term left has a factor h, and dividing by h is allowed because h ≠ 0.`,
      },
      {
        text: 'Let h shrink to zero.',
        latex: `\\lim_{h \\to 0}\\left(${num(rate(p))} ${plusAh(p.a)}\\right) = ${num(rate(p))}`,
        why: 'The leftover term vanishes as the step shrinks, so the secant slopes settle at the slope of the tangent: the instantaneous rate.',
        result: rate(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      rate(p),
      [
        { value: round(f(p, p.x0 + 1) - f(p, p.x0), 2), mistakeCode: 'SECANT_NOT_LIMIT' },
        { value: round(f(p, p.x0), 2), mistakeCode: 'VALUE_NOT_RATE' },
        { value: round(p.a * p.x0 + p.b, 2), mistakeCode: 'FORGOT_DOUBLE' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
