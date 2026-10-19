import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, lcm } from './complements';

interface Params {
  /** U = xy; the price of food x changes from p0 to p1, the price of other goods y is py. */
  p0: number;
  p1: number;
  py: number;
  M: number;
  /** Which part of the change is asked for. */
  ask: 'substitution' | 'income';
}

/** Demand for x with U = xy: half of income goes on x. */
const demand = (p: Params, price: number) => p.M / (2 * price);
/** Compensated demand on the original indifference curve: √(U₀·p_y/p₁) = M/(2√(p₀p₁)). */
const compensated = (p: Params) => p.M / (2 * Math.sqrt(p.p0 * p.p1));

/** A signed number for the plain-text why lines, with a true minus sign. */
const signed = (v: number) => num(v).replace('-', '−');

const effects = (p: Params) => {
  const x0 = demand(p, p.p0);
  const h = Math.round(compensated(p));
  const x1 = demand(p, p.p1);
  return { x0, h, x1, sub: h - x0, inc: x1 - h, total: x1 - x0 };
};

const value = (p: Params) => {
  const e = effects(p);
  return p.ask === 'substitution' ? e.sub : e.inc;
};

function candidates(p: Params) {
  const e = effects(p);
  const sub = p.ask === 'substitution';
  return [
    { value: e.total, mistakeCode: 'TOTAL_NOT_SPLIT' },
    { value: sub ? e.inc : e.sub, mistakeCode: 'SWAPPED_EFFECTS' },
    { value: sub ? e.h : e.x1, mistakeCode: 'GAVE_NEW_QUANTITY' },
    { value: -value(p), mistakeCode: 'EFFECT_SIGN' },
  ];
}

/** MV10, difficulty 2: the substitution or income effect of a price change for U = xy (Hicks split). */
export const slutskySubstitutionIncomeEffect: Generator<Params> = {
  id: 'slutsky-substitution-income-effect',
  title: 'Substitution and income effects',
  topicId: 'MV10',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      // p0 = k·s² and p1 = k·t², so √(p0·p1) = k·s·t is whole. s and t differ by 1, so the price
      // changes by a factor between 1.56 and 4 (or falls by the same factor).
      const s = rng.int(1, 4);
      const [from, to] = rng.pick([
        [s, s + 1],
        [s + 1, s],
      ] as const);
      const k = rng.int(1, 10);
      const p0 = k * from * from;
      const p1 = k * to * to;
      if (p0 > 40 || p1 > 40) continue;
      const py = rng.int(1, 10);
      // M/(2·p0), M/(2·p1), M/(2·k·s·t) and M/(2·py) must all be whole.
      const unit = 2 * lcm(k * from * from * to * to, py);
      const mMin = Math.ceil(100 / unit);
      const mMax = Math.floor(3000 / unit);
      if (mMax < mMin) continue;
      const M = unit * rng.int(mMin, mMax);
      const p: Params = {
        p0,
        p1,
        py,
        M,
        ask: rng.pick(['substitution', 'substitution', 'income'] as const),
      };
      const e = effects(p);
      if (Math.min(e.x0, e.x1) < 2) continue;
      const kept = cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A household's utility from food $x$ and other goods $y$ is $U = xy$. Its income is $M = ${num(p.M)}$ and other goods cost $p_y = ${num(p.py)}$. The price of food ${p.p1 > p.p0 ? 'rises' : 'falls'} from ${num(p.p0)} to ${num(p.p1)}. Split the change in the quantity of food into a substitution effect (the change if income were adjusted to keep utility at its original level) and an income effect. What is the ${p.ask} effect? Give a fall as a negative number.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const e = effects(p);
    const y0 = p.M / (2 * p.py);
    const u0 = e.x0 * y0;
    const last =
      p.ask === 'substitution'
        ? {
            text: 'The substitution effect is the move along the old indifference curve.',
            latex: `h - x_0 = ${num(e.h)} - ${num(e.x0)} = ${num(e.sub)}`,
            why: `Only the relative price changed between these two bundles, so the household ${e.sub < 0 ? 'buys less of the good that became dearer' : 'buys more of the good that became cheaper'}. The income effect, x₁ − h = ${signed(e.inc)}, makes up the rest of the total change ${signed(e.total)}.`,
            result: e.sub,
          }
        : {
            text: 'The income effect is the move from the compensated bundle to the new choice.',
            latex: `x_1 - h = ${num(e.x1)} - ${num(e.h)} = ${num(e.inc)}`,
            why: `Prices are the same at h and x₁; only real income differs. Food is a normal good here, so ${e.inc < 0 ? 'lower real income means less food' : 'higher real income means more food'}. With the substitution effect h − x₀ = ${signed(e.sub)} it adds up to the total change ${signed(e.total)}.`,
            result: e.inc,
          };
    return [
      {
        text: 'Find the original choice: with U = xy, half of income goes on each good.',
        latex: `x_0 = \\dfrac{${num(p.M)}}{2\\cdot ${num(p.p0)}} = ${num(e.x0)}, \\quad y_0 = \\dfrac{${num(p.M)}}{2\\cdot ${num(p.py)}} = ${num(y0)}, \\quad U_0 = ${num(e.x0)}\\cdot ${num(y0)} = ${num(u0)}`,
        why: 'The demand functions x = M/(2pₓ) and y = M/(2p_y) come from MRS = y/x = pₓ/p_y and the budget.',
        result: e.x0,
      },
      {
        text: 'Find the new choice at the new price and the same income.',
        latex: `x_1 = \\dfrac{${num(p.M)}}{2\\cdot ${num(p.p1)}} = ${num(e.x1)}`,
        why: `The total effect of the price change is x₁ − x₀ = ${signed(e.total)}; the next steps split it in two.`,
        result: e.x1,
      },
      {
        text: 'Find the compensated bundle: the new price ratio, but the old utility.',
        latex: `y = ${num(p.p1)}x/${num(p.py)},\\ \\ xy = ${num(u0)} \\;\\Rightarrow\\; h = \\sqrt{\\dfrac{${num(u0)}\\cdot ${num(p.py)}}{${num(p.p1)}}} = ${num(e.h)}`,
        why: 'Income is adjusted just enough to keep the household on its original indifference curve; there it chooses the point where the MRS equals the new price ratio.',
        result: e.h,
      },
      last,
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
