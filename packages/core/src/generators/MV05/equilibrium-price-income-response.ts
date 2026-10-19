import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Demand Q = a − b·p + c·I (linear) or Q = a − b·p² + c·I (quadratic); supply Q = d + e·p. */
  kind: 'linear' | 'quadratic';
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  /** Income (in thousands) and the equilibrium price at that income. */
  income: number;
  price: number;
  good: string;
}

const GOODS = ['restaurant meals', 'cinema tickets', 'fresh fish', 'gym memberships'] as const;
const B_QUADRATIC = [0.1, 0.2, 0.25, 0.5, 1] as const;

/** −∂F/∂p for F = D − S: the demand slope (in absolute value) plus the supply slope. */
const demandSlope = (p: Params) => (p.kind === 'linear' ? p.b : 2 * p.b * p.price);
const minusFp = (p: Params) => round(demandSlope(p) + p.e, 6);
/** Equilibrium quantity, from supply. */
const quantityOf = (p: Params) => p.d + p.e * p.price;
/** Implicit function theorem: dp* / dI = −F_I / F_p = c / (demand slope + supply slope). */
const response = (p: Params) => round(p.c / minusFp(p), 2);

function candidates(p: Params) {
  const list = [
    { value: -response(p), mistakeCode: 'SIGN' },
    { value: round(p.c / demandSlope(p), 2), mistakeCode: 'IGNORED_SUPPLY' },
    { value: round(p.c / p.e, 2), mistakeCode: 'SUPPLY_SLOPE_ONLY' },
  ];
  if (p.kind === 'quadratic') {
    list.push({ value: round(p.c / (p.b * p.price + p.e), 2), mistakeCode: 'POWER_RULE' });
  }
  return list;
}

const demand = (p: Params) =>
  `${num(p.a)} - ${p.b === 1 ? '' : num(p.b)}${p.kind === 'linear' ? 'p' : 'p^2'} + ${p.c === 1 ? '' : num(p.c)}I`;
const supply = (p: Params) => `${p.d ? `${num(p.d)} + ` : ''}${p.e === 1 ? '' : num(p.e)}p`;

/** MV05, difficulty 2: how the equilibrium price responds to income, dp* / dI = −F_I / F_p. */
export const equilibriumPriceIncomeResponse: Generator<Params> = {
  id: 'equilibrium-price-income-response',
  title: 'Equilibrium price response to income',
  topicId: 'MV05',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const kind = rng.pick(['linear', 'quadratic'] as const);
      const b = kind === 'linear' ? rng.int(1, 10) : rng.pick(B_QUADRATIC);
      const price = kind === 'linear' ? rng.int(5, 60) : rng.int(2, 30);
      const p: Params = {
        kind,
        a: 0,
        b,
        c: rng.int(1, 10),
        d: rng.int(0, 20),
        e: rng.int(1, 10),
        income: rng.int(10, 80),
        price,
        good: rng.pick(GOODS),
      };
      const dropped = kind === 'linear' ? b * price : round(b * price * price, 6);
      if (!Number.isInteger(dropped)) continue;
      p.a = quantityOf(p) + dropped - p.c * p.income;
      if (p.a <= 0 || p.a > 5000) continue;
      const r = response(p);
      if (r < 0.1 || r > 10) continue;
      if (cleanDistractors(r, candidates(p)).length < candidates(p).length) continue;
      return p;
    }
  },

  stem: (p) =>
    `In the market for ${p.good}, demand is $Q_D = ${demand(p)}$ and supply is $Q_S = ${supply(p)}$, where $p$ is the price and $I$ is average income in thousands. At $I = ${p.income}$ the market clears at $p^* = ${p.price}$. Use the implicit function theorem on the equilibrium condition to find $\\dfrac{dp^*}{dI}$ at this point. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: response(p), decimals: 2 }),

  steps(p) {
    const ans = response(p);
    const dTerm = p.kind === 'linear' ? 'p' : 'p^2';
    const Fp =
      p.kind === 'linear' ? `-${num(p.b)} - ${num(p.e)}` : `-${num(2 * p.b)}p - ${num(p.e)}`;
    return [
      {
        text: 'Write the equilibrium condition as F(p, I) = 0.',
        latex: `F(p, I) = Q_D - Q_S = ${num(p.a)} - ${p.b === 1 ? '' : num(p.b)}${dTerm} + ${p.c === 1 ? '' : num(p.c)}I - (${supply(p)}) = 0`,
        why: 'The market clears when demand equals supply. This one equation ties the price to income, so it defines the equilibrium price p*(I) implicitly.',
      },
      {
        text: 'Find the two partial derivatives.',
        latex: `F_I = ${num(p.c)}, \\quad F_p = ${Fp}`,
        why: 'F_I is how far demand shifts when income rises by 1 (in thousands). F_p is the demand slope minus the supply slope.',
      },
      {
        text: `Evaluate F_p at p* = ${p.price}.`,
        latex: `F_p = ${num(-minusFp(p))}`,
        why: 'F_p is not zero, so the equilibrium price really is a differentiable function of income near this point.',
        result: -minusFp(p),
      },
      {
        text: 'Apply dp*/dI = −F_I/F_p.',
        latex: `\\dfrac{dp^*}{dI} = -\\dfrac{F_I}{F_p} = -\\dfrac{${num(p.c)}}{${num(-minusFp(p))}} = ${num(ans)}`,
        why: `Higher income shifts demand out, so the price rises: by about ${num(ans)} for each extra thousand of income. The shift is shared between a higher price and a larger quantity, which is why both slopes are in the denominator.`,
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(response(p), candidates(p)),
};
