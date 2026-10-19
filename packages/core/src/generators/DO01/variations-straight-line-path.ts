import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'output' | 'workforce' | 'capacity';
type Ask = 'value' | 'cost';

interface Params {
  context: Context;
  ask: Ask;
  /** Length of the plan, in months. */
  T: number;
  /** Starting level x(0) = A and the constant speed m = (B − A)/T on the cheapest path. */
  start: number;
  speed: number;
  /** Cost coefficient c in the adjustment cost c·ẋ² per month. */
  c: number;
  /** The month asked for when ask = 'value'. */
  t: number;
}

const end = (p: Params) => p.start + p.speed * p.T;
const level = (p: Params) => p.start + p.speed * p.t;
const minCost = (p: Params) => (p.c * (end(p) - p.start) ** 2) / p.T;
const value = (p: Params) => (p.ask === 'value' ? level(p) : minCost(p));

const candidates = (p: Params) => {
  const change = end(p) - p.start;
  return p.ask === 'value'
    ? [
        { value: (p.start + end(p)) / 2, mistakeCode: 'MIDPOINT' },
        { value: p.speed * p.t, mistakeCode: 'FORGOT_START' },
        { value: p.speed, mistakeCode: 'SPEED_ONLY' },
      ]
    : [
        { value: p.c * change ** 2 * p.T, mistakeCode: 'CHANGE_AS_SPEED' },
        { value: p.c * change, mistakeCode: 'FORGOT_SQUARE' },
        { value: p.speed, mistakeCode: 'SPEED_ONLY' },
      ];
};

const SETTING: Record<Context, { what: string; unit: string }> = {
  output: { what: 'its daily output', unit: 'units a day' },
  workforce: { what: 'its workforce', unit: 'employees' },
  capacity: { what: 'its warehouse capacity', unit: 'pallet spaces' },
};

/** "c·" in front of an integral, or nothing for 1. */
const coef = (x: number) => (x === 1 ? '' : `${num(x)}`);

/** DO01, difficulty 1: min c∫ẋ² dt with fixed ends: a level on the straight-line path, or the least cost. */
export const variationsStraightLinePath: Generator<Params> = {
  id: 'variations-straight-line-path',
  title: 'Cheapest path with quadratic adjustment cost',
  topicId: 'DO01',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const ask = rng.pick(['value', 'cost'] as const);
      const T = rng.pick([2, 3, 4, 5, 6, 8, 10, 12]);
      const p: Params = {
        context: rng.pick(['output', 'workforce', 'capacity'] as const),
        ask,
        T,
        start: rng.int(2, 40) * 5,
        speed: rng.int(1, 12),
        c: rng.pick([0.5, 1, 2, 3, 4, 5]),
        t: rng.int(1, T - 1),
      };
      // The month asked for is not the middle, so the midpoint is a wrong answer.
      if (ask === 'value' && 2 * p.t === T) continue;
      const kept = cleanDistractors(value(p), candidates(p));
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const { what, unit } = SETTING[p.context];
    const setup = `A firm will raise ${what} from $x(0) = ${num(p.start)}$ to $x(${num(p.T)}) = ${num(end(p))}$ ${unit} over ${num(p.T)} months. Changing the level quickly is costly: it chooses the path $x(t)$ that minimises the adjustment cost $${coef(p.c)}\\int_0^{${num(p.T)}} \\dot x^2\\,dt$.`;
    return p.ask === 'value'
      ? `${setup} On the cheapest path, what is $x(${num(p.t)})$, the level after ${num(p.t)} months?`
      : `${setup} What is the smallest possible adjustment cost?`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2 }),

  steps(p) {
    const B = end(p);
    const steps = [
      {
        text: `Apply the Euler–Lagrange equation to F = ${coef(p.c)}ẋ².`,
        latex: `F_x = 0,\\quad F_{\\dot x} = ${num(2 * p.c)}\\,\\dot x \\;\\Rightarrow\\; \\frac{d}{dt}\\big(${num(2 * p.c)}\\,\\dot x\\big) = 0 \\;\\Rightarrow\\; \\ddot x = 0`,
        why: 'F does not contain x, so ∂F/∂x = 0 and ∂F/∂ẋ must stay constant over time: the speed of change never varies.',
      },
      {
        text: 'Fit the straight line to the two fixed ends.',
        latex: `x(t) = ${num(p.start)} + \\dfrac{${num(B)} - ${num(p.start)}}{${num(p.T)}}\\,t = ${num(p.start)} + ${num(p.speed)}t`,
        why: 'ẍ = 0 means x(t) = c₁ + c₂t; x(0) fixes c₁ = A and x(T) fixes the slope (B − A)/T.',
        result: p.speed,
      },
    ];
    if (p.ask === 'value') {
      return [
        ...steps,
        {
          text: `Evaluate the path at t = ${num(p.t)}.`,
          latex: `x(${num(p.t)}) = ${num(p.start)} + ${num(p.speed)} \\times ${num(p.t)} = ${num(level(p))}`,
          why: 'The level is the starting level plus the constant speed times the months elapsed; the start must not be dropped.',
          result: level(p),
        },
      ];
    }
    return [
      ...steps,
      {
        text: 'Integrate the constant cost per month over the plan.',
        latex: `${coef(p.c)}\\int_0^{${num(p.T)}} ${num(p.speed)}^2\\,dt = ${num(p.c)} \\times ${num(p.speed ** 2)} \\times ${num(p.T)} = ${num(minCost(p))}`,
        why: 'The speed is the same every month, so the cost per month c·ẋ² is constant; the total is that times T, which equals c(B − A)²/T.',
        result: minCost(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(value(p), candidates(p)),
};
