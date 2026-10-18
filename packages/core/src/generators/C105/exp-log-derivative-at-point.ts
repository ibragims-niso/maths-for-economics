import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The slope of an exponential path A·e^(kt) at time t. */
interface ExpParams {
  form: 'exp';
  context: 'gdp' | 'sales';
  A: number;
  k: number;
  t: number;
}

/** The growth rate d ln S/dt of a quadratic path S(t) = at² + b at time t. */
interface LogParams {
  form: 'log';
  a: number;
  b: number;
  t: number;
}

type Params = ExpParams | LogParams;

const slope = (p: ExpParams) => p.A * p.k * Math.exp(p.k * p.t);
const level = (p: LogParams) => p.a * p.t * p.t + p.b;
/** Growth rate of S in per cent a year, unrounded. */
const growth = (p: LogParams) => (100 * 2 * p.a * p.t) / level(p);

const value = (p: Params) => round(p.form === 'exp' ? slope(p) : growth(p), 2);

const expPath = (p: ExpParams) => `${num(p.A)}e^{${num(p.k)}t}`;
const quadPath = (p: LogParams) => `${p.a === 1 ? '' : num(p.a)}t^2 + ${num(p.b)}`;

/** Wrong answers from the usual mistakes with e^(kt) and ln g(t). */
function wrongAnswers(p: Params) {
  if (p.form === 'exp') {
    const ekt = Math.exp(p.k * p.t);
    return cleanDistractors(value(p), [
      { value: round(p.A * ekt, 2), mistakeCode: 'FORGOT_CHAIN' },
      { value: round((p.A * ekt) / p.k, 2), mistakeCode: 'DIVIDED_BY_K' },
      {
        value: round(p.A * p.k * p.t * Math.exp(p.k * p.t - 1), 2),
        mistakeCode: 'POWER_RULE_ON_EXP',
      },
    ]);
  }
  return cleanDistractors(value(p), [
    { value: round(100 / level(p), 2), mistakeCode: 'NO_INNER_DERIVATIVE' },
    { value: 2 * p.a * p.t, mistakeCode: 'SLOPE_NOT_RATE' },
    { value: round(200 / p.t, 2), mistakeCode: 'LOG_OF_SUM' },
  ]);
}

/** C105, difficulty 2: slope of A·e^(kt) at a time, or growth rate of at² + b via d ln S/dt. */
export const expLogDerivativeAtPoint: Generator<Params> = {
  id: 'exp-log-derivative-at-point',
  title: 'Slopes and growth rates with e and ln',
  topicId: 'C105',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      let p: Params;
      if (rng.next() < 0.5) {
        p = {
          form: 'exp',
          context: rng.pick(['gdp', 'sales'] as const),
          A: rng.int(10, 90) * 10,
          k: rng.int(1, 8) / 100,
          t: rng.int(1, 15),
        };
        if (p.k * p.t > 1.2 || slope(p) < 1) continue;
      } else {
        p = { form: 'log', a: rng.int(1, 10), b: rng.int(2, 60) * 10, t: rng.int(1, 12) };
        if (growth(p) < 2 || growth(p) > 60) continue;
      }
      if (wrongAnswers(p).length >= 2) return p;
    }
  },

  stem(p) {
    if (p.form === 'log') {
      return `A firm's yearly sales, in thousand units, are $S(t) = ${quadPath(p)}$, where $t$ is years since launch. What is the growth rate of sales at $t = ${p.t}$? Give it in per cent a year to 2 decimal places.`;
    }
    return p.context === 'gdp'
      ? `Real GDP, in billions, follows $Y(t) = ${expPath(p)}$, where $t$ is years from now. How fast is GDP rising at $t = ${p.t}$, in billions a year? Give your answer to 2 decimal places.`
      : `A firm's sales, in thousand units a year, follow $S(t) = ${expPath(p)}$, where $t$ is years since launch. How fast are sales rising at $t = ${p.t}$, in thousand units a year? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2 }),

  steps(p) {
    if (p.form === 'exp') {
      const ekt = Math.exp(p.k * p.t);
      const v = p.context === 'gdp' ? 'Y' : 'S';
      return [
        {
          text: 'Differentiate the exponential.',
          latex: `${v}'(t) = ${num(p.A)} \\times ${num(p.k)}\\,e^{${num(p.k)}t} = ${num(p.A * p.k)}\\,e^{${num(p.k)}t}`,
          why: 'Chain rule: the inner function kt has derivative k, which multiplies the exponential.',
        },
        {
          text: 'Work out the exponential at that time.',
          latex: `e^{${num(p.k)} \\times ${p.t}} = e^{${num(p.k * p.t)}} = ${num(ekt, 5)}`,
          why: 'Substitute the time into the exponent first; the exponent is k times t.',
          result: round(ekt, 5),
        },
        {
          text: 'Multiply to get the slope.',
          latex: `${v}'(${p.t}) = ${num(p.A * p.k)} \\times ${num(ekt, 5)} = ${num(value(p))}`,
          why: 'The slope is the rise per year at that moment. Divided by the level it gives k, the growth rate.',
          result: value(p),
        },
      ];
    }
    const s = level(p);
    const ds = 2 * p.a * p.t;
    return [
      {
        text: 'The growth rate is the derivative of ln S.',
        latex: `\\dfrac{d}{dt}\\ln S(t) = \\dfrac{S'(t)}{S(t)} = \\dfrac{${num(2 * p.a)}t}{${quadPath(p)}}`,
        why: 'Chain rule: the derivative of ln g(t) is g′(t) divided by g(t), the slope over the level.',
      },
      {
        text: 'Find the level of sales at that time.',
        latex: `S(${p.t}) = ${num(p.a)} \\times ${p.t * p.t} + ${num(p.b)} = ${num(s)}`,
        why: 'The growth rate measures the slope relative to this level.',
        result: s,
      },
      {
        text: 'Find the slope at that time.',
        latex: `S'(${p.t}) = ${num(2 * p.a)} \\times ${p.t} = ${num(ds)}`,
        why: 'This is how many thousand units a year sales are rising by.',
        result: ds,
      },
      {
        text: 'Divide the slope by the level.',
        latex: `\\dfrac{${num(ds)}}{${num(s)}} = ${num(ds / s, 4)} = ${num(value(p))}\\%`,
        why: 'Multiplying by 100 turns the rate into per cent a year.',
        result: value(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
