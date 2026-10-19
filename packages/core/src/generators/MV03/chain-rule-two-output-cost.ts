import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Cost C(x, y) = F + a·x² + b·x·y + c·y² of making x and y units a week. */
  F: number;
  a: number;
  b: number;
  c: number;
  /** Planned outputs: x(t) = x0 + m·t and y(t) = y0 + n·t², t in months. */
  x0: number;
  m: number;
  y0: number;
  n: number;
  /** The month at which the rate is asked. */
  t: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const xAt = (p: Params) => p.x0 + p.m * p.t;
const yAt = (p: Params) => p.y0 + p.n * p.t * p.t;
/** x′(t) = m and y′(t) = 2nt. */
const xRate = (p: Params) => p.m;
const yRate = (p: Params) => 2 * p.n * p.t;
/** C_x = 2ax + by and C_y = bx + 2cy at the month t. */
const cx = (p: Params) => 2 * p.a * xAt(p) + p.b * yAt(p);
const cy = (p: Params) => p.b * xAt(p) + 2 * p.c * yAt(p);
/** dC/dt = C_x·x′(t) + C_y·y′(t). */
const answerOf = (p: Params) => cx(p) * xRate(p) + cy(p) * yRate(p);

const candidates = (p: Params): Distractor[] => [
  { value: cx(p) * xRate(p), mistakeCode: 'FORGOT_PATH' },
  { value: cy(p) * yRate(p), mistakeCode: 'FORGOT_PATH' },
  { value: cx(p) * cy(p), mistakeCode: 'MULTIPLIED_PARTIALS' },
  { value: cx(p) + cy(p), mistakeCode: 'NO_INNER_DERIVATIVES' },
];

const wrongAnswers = (p: Params) =>
  cleanDistractors(answerOf(p), candidates(p), MONEY.tolerance, MONEY.relTolerance);

/** "3x^2", "x^2": a coefficient that hides when it is 1. */
const term = (k: number, body: string) => `${k === 1 ? '' : num(k)}${body}`;

/** MV03, difficulty 3: dC/dt for a two-product cost C(x, y) when both outputs follow time paths. */
export const chainRuleTwoOutputCost: Generator<Params> = {
  id: 'chain-rule-two-output-cost',
  title: 'Chain rule: cost along a time path',
  topicId: 'MV03',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        F: rng.int(2, 20) * 50,
        a: rng.int(1, 3),
        b: rng.int(1, 3),
        c: rng.int(1, 3),
        x0: rng.int(2, 12) * 5,
        m: rng.int(1, 5),
        y0: rng.int(1, 8) * 5,
        n: rng.int(1, 3),
        t: rng.int(1, 5),
      };
      if (wrongAnswers(p).length >= 3) return p;
    }
  },

  stem(p) {
    const cost = `${num(p.F)} + ${term(p.a, 'x^2')} + ${term(p.b, 'xy')} + ${term(p.c, 'y^2')}`;
    const xPath = `${num(p.x0)} + ${term(p.m, 't')}`;
    const yPath = `${num(p.y0)} + ${term(p.n, 't^2')}`;
    return `A bakery makes $x$ trays of bread and $y$ trays of cakes a week, at a weekly cost of $C(x, y) = ${cost}$. Its plan for the coming months is $x = ${xPath}$ and $y = ${yPath}$, where $t$ is time in months. At what rate is the weekly cost rising at $t = ${num(p.t)}$? Find $\\dfrac{dC}{dt}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 0, ...MONEY }),

  steps(p) {
    const X = xAt(p);
    const Y = yAt(p);
    return [
      {
        text: `Find the outputs at t = ${num(p.t)}.`,
        latex: `x = ${num(p.x0)} + ${num(p.m)} \\cdot ${num(p.t)} = ${num(X)}, \\quad y = ${num(p.y0)} + ${num(p.n)} \\cdot ${num(p.t)}^2 = ${num(Y)}`,
        why: 'The partial derivatives must be evaluated where the bakery actually is at that moment.',
      },
      {
        text: 'Find the marginal cost of bread there.',
        latex: `C_x = ${term(2 * p.a, 'x')} + ${term(p.b, 'y')} = ${num(2 * p.a)} \\cdot ${num(X)} + ${num(p.b)} \\cdot ${num(Y)} = ${num(cx(p))}`,
        why: `Hold y fixed: ${term(p.a, 'x²')} gives ${term(2 * p.a, 'x')}, the cross term ${term(p.b, 'xy')} gives ${term(p.b, 'y')}, and the terms without x vanish.`,
        result: cx(p),
      },
      {
        text: 'Find the marginal cost of cakes there.',
        latex: `C_y = ${term(p.b, 'x')} + ${term(2 * p.c, 'y')} = ${num(p.b)} \\cdot ${num(X)} + ${num(2 * p.c)} \\cdot ${num(Y)} = ${num(cy(p))}`,
        why: `Now hold x fixed: the cross term gives ${term(p.b, 'x')} and ${term(p.c, 'y²')} gives ${term(2 * p.c, 'y')}.`,
        result: cy(p),
      },
      {
        text: 'Find how fast each output changes.',
        latex: `\\dfrac{dx}{dt} = ${num(xRate(p))}, \\quad \\dfrac{dy}{dt} = ${term(2 * p.n, 't')} = ${num(yRate(p))}`,
        why: 'These are the inner derivatives: the rates at which time moves each output.',
      },
      {
        text: 'Combine the two paths with the chain rule.',
        latex: `\\dfrac{dC}{dt} = C_x\\,\\dfrac{dx}{dt} + C_y\\,\\dfrac{dy}{dt} = ${num(cx(p))} \\cdot ${num(xRate(p))} + ${num(cy(p))} \\cdot ${num(yRate(p))} = ${num(answerOf(p))}`,
        why: 'Time changes cost through bread and through cakes; each path is a marginal cost times the speed of that output, and the two paths add up.',
        result: answerOf(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
