import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, gcd, minLatex, ratioLatex, setPriceLatex, term } from './complements';

interface Params {
  /** U = min(a·x, b·y), a and b coprime and different. */
  a: number;
  b: number;
  px: number;
  py: number;
  M: number;
  /** The optimal bundle, drawn first: x = b·m and y = a·m, so a·x = b·y. */
  x: number;
  y: number;
  /** The good asked for. */
  ask: 'x' | 'y';
}

const value = (p: Params) => (p.ask === 'x' ? p.x : p.y);

/** The asked good's price, the other good's price, and units of the other good per unit of it. */
const own = (p: Params) =>
  p.ask === 'x'
    ? { price: p.px, otherPrice: p.py, wrongPer: p.b / p.a }
    : { price: p.py, otherPrice: p.px, wrongPer: p.a / p.b };

function candidates(p: Params) {
  const o = own(p);
  return [
    { value: round(p.M / o.price, 2), mistakeCode: 'ALL_ON_ONE_GOOD' },
    { value: round(p.M / (2 * o.price), 2), mistakeCode: 'HALF_BUDGET_SPLIT' },
    {
      value: round(p.M / (o.price + o.wrongPer * o.otherPrice), 2),
      mistakeCode: 'INVERTED_PROPORTION',
    },
    { value: round(p.M / (p.px + p.py), 2), mistakeCode: 'ONE_FOR_ONE' },
  ];
}

/** MV10, difficulty 1: the demand for one good when U = min(ax, by) (perfect complements). */
export const perfectComplementsDemand: Generator<Params> = {
  id: 'perfect-complements-demand',
  title: 'Demand for perfect complements',
  topicId: 'MV10',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 5);
      const b = rng.int(1, 5);
      if (a === b || gcd(a, b) !== 1) continue;
      const px = rng.int(2, 30);
      const py = rng.int(2, 30);
      if (px === py) continue;
      const m = rng.int(1, 40);
      const x = b * m;
      const y = a * m;
      const M = px * x + py * y;
      if (x < 2 || y < 2 || M < 60 || M > 3000) continue;
      const p: Params = { a, b, px, py, M, x, y, ask: rng.pick(['x', 'x', 'y'] as const) };
      const kept = cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer only ever uses goods $x$ and $y$ together, in fixed proportions (like a car and its fuel), so her utility is $U = ${minLatex(p.a, p.b)}$. The prices are $p_x = ${num(p.px)}$ and $p_y = ${num(p.py)}$ and her income is $M = ${num(p.M)}$. How many units of $${p.ask}$ does she buy?`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const setPrice = p.b * p.px + p.a * p.py;
    const xStar = (p.b * p.M) / setPrice;
    const solve =
      p.b === 1
        ? `\\dfrac{${num(p.M)}}{${num(setPrice)}}`
        : `\\dfrac{${num(p.b)}\\cdot ${num(p.M)}}{${num(p.b)}\\cdot ${num(p.px)} + ${num(p.a)}\\cdot ${num(p.py)}} = \\dfrac{${num(p.b * p.M)}}{${num(setPrice)}}`;
    const steps: Step[] = [
      {
        text: 'At the best bundle nothing is wasted: the two terms inside the min are equal.',
        latex: `${term(p.a, 'x')} = ${term(p.b, 'y')} \\quad\\Rightarrow\\quad y = ${ratioLatex(p.a, p.b)}\\,x`,
        why: 'If one term were larger, the extra units of that good would add no utility; spending that money on more of both goods would raise U.',
      },
      {
        text: 'Put y into the budget line.',
        latex: `${num(p.px)}x + ${num(p.py)}\\cdot ${ratioLatex(p.a, p.b)}\\,x = ${num(p.M)}`,
        why: `Each unit of x comes with ${num(p.a)}/${num(p.b)} of a unit of y, so one complete set costs pₓ + (${num(p.a)}/${num(p.b)})·p_y.`,
      },
      {
        text: 'Divide income by the price of one set.',
        latex: `x^* = \\dfrac{M}{${setPriceLatex(p.a, p.b)}} = ${solve} = ${num(xStar)}`,
        why: 'The whole budget buys complete sets. There is no tangency here: the indifference curves have a corner, so the MRS is not equal to the price ratio.',
        result: xStar,
      },
    ];
    if (p.ask === 'y') {
      steps.push({
        text: 'Find y from the fixed proportion.',
        latex: `y^* = ${ratioLatex(p.a, p.b)}\\cdot ${num(p.x)} = ${num(p.y)}`,
        why: `Check: ${num(p.px)}·${num(p.x)} + ${num(p.py)}·${num(p.y)} = ${num(p.M)}, so the budget is spent exactly.`,
        result: p.y,
      });
    }
    return steps;
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
