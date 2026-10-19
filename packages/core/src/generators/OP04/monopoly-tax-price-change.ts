import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Inverse demand P = a − b·q; cost C(q) = c·q + d·q² (d may be 0: constant marginal cost). */
  a: number;
  b: number;
  c: number;
  d: number;
  /** The per-unit tax rises from t0 to t0 + dt. */
  t0: number;
  dt: number;
  /** Best output at the old tax, a whole number. */
  q0: number;
}

// b = 1 is left out: then the output change and the price change have the same size.
const B_VALUES = [2, 3, 4, 5, 6] as const;
const D_VALUES = [0, 0.5, 1, 1.5, 2, 3] as const;

/** −π_qq = 2(b + d): how fast marginal profit falls with output. */
const curvature = (p: Params) => 2 * (p.b + p.d);
/** d(q*)/dt = −π_qt/π_qq = −1/(2(b + d)). */
const dqdt = (p: Params) => -1 / curvature(p);
/** d(P*)/dt = −b·d(q*)/dt = b/(2(b + d)). */
const dPdt = (p: Params) => p.b / curvature(p);
/** The price change; exact, because the first-order condition is linear in t. */
const priceChange = (p: Params) => round(dPdt(p) * p.dt, 2);

function candidates(p: Params) {
  return [
    { value: p.dt, mistakeCode: 'FULL_PASS_THROUGH' },
    { value: round(p.dt / 2, 2), mistakeCode: 'CONSTANT_COST_RULE' },
    { value: round(dqdt(p) * p.dt, 2), mistakeCode: 'QUANTITY_NOT_PRICE' },
    { value: -priceChange(p), mistakeCode: 'SIGN' },
  ];
}

const twoDecimals = (v: number) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;
const cost = (p: Params) => `${num(p.c)}q${p.d === 0 ? '' : ` + ${p.d === 1 ? '' : num(p.d)}q^2`}`;
const demand = (p: Params) => `${num(p.a)} - ${p.b === 1 ? '' : num(p.b)}q`;

/** OP04, difficulty 2: the change in a monopolist's price when a per-unit tax rises. */
export const monopolyTaxPriceChange: Generator<Params> = {
  id: 'monopoly-tax-price-change',
  title: 'A tax and the monopoly price',
  topicId: 'OP04',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const b = rng.pick(B_VALUES);
      const d = rng.pick(D_VALUES);
      const c = rng.int(5, 40);
      const t0 = rng.int(1, 20);
      const q0 = rng.int(5, 50);
      const dt = rng.int(1, 20);
      const p: Params = { a: c + t0 + 2 * (b + d) * q0, b, c, d, t0, dt, q0 };
      if (!Number.isInteger(p.a) || p.a > 600) continue;
      // Output stays clearly positive after the tax rise.
      if (q0 + dqdt(p) * dt < 2) continue;
      if (!twoDecimals(dPdt(p) * dt)) continue;
      if (cleanDistractors(priceChange(p), candidates(p)).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A monopolist faces the inverse demand $P = ${demand(p)}$ and has cost $C(q) = ${cost(p)}$. The government raises the tax on each unit it sells from ${num(p.t0)} to ${num(p.t0 + p.dt)}. Differentiate the first-order condition with respect to the tax to find the change in the price the monopolist charges. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: priceChange(p), decimals: 2 }),

  steps(p) {
    const k = curvature(p);
    const ans = priceChange(p);
    const costTerms = p.d === 0 ? num(p.c) : `${num(p.c)} - ${p.d === 0.5 ? '' : num(2 * p.d)}q`;
    return [
      {
        text: 'Write profit with the tax t and its first-order condition.',
        latex: `\\pi(q, t) = (${demand(p)})q - (${cost(p)}) - tq, \\quad \\pi_q = ${num(p.a)} - ${num(2 * p.b)}q - ${costTerms} - t = 0`,
        why: `Marginal revenue a − 2bq equals marginal cost plus the tax. At t = ${num(p.t0)} this gives q* = ${num(p.q0)}.`,
        result: p.q0,
      },
      {
        text: 'Find π_qq and π_qt, then dq*/dt.',
        latex: `\\pi_{qq} = -${num(k)}, \\quad \\pi_{qt} = -1, \\quad \\dfrac{dq^*}{dt} = -\\dfrac{\\pi_{qt}}{\\pi_{qq}} = -\\dfrac{1}{${num(k)}} = ${num(dqdt(p), 4)}`,
        why: 'π_qq < 0 confirms a maximum. The tax lowers the marginal profit of every unit by 1 (π_qt = −1), so the best output falls.',
        result: round(dqdt(p), 4),
      },
      {
        text: 'Turn the output response into a price response along the demand curve.',
        latex: `\\dfrac{dP^*}{dt} = -${num(p.b)} \\cdot \\dfrac{dq^*}{dt} = \\dfrac{${num(p.b)}}{${num(k)}} = ${num(dPdt(p), 4)}`,
        why: 'The monopolist sells less, and the price on the demand curve P = a − bq rises by b for each unit it gives up. Only part of the tax reaches the price.',
        result: round(dPdt(p), 4),
      },
      {
        text: 'Multiply by the rise in the tax.',
        latex: `\\Delta P = ${num(dPdt(p), 4)} \\times ${num(p.dt)} = ${num(ans)}`,
        why: 'The first-order condition is linear in t, so the derivative is constant and the change is exact, not just an estimate.',
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(priceChange(p), candidates(p)),
};
