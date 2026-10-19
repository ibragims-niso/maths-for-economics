import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { inverseLine } from './consumer-surplus-linear-equilibrium';

interface Params {
  /** Inverse demand P = a − bQ. */
  a: number;
  b: number;
  /** Inverse supply P = c + dQ. */
  c: number;
  d: number;
  /** Equilibrium without the tax, drawn first so it is whole. */
  quantity: number;
  price: number;
  /** The tax cuts the quantity traded by k units: tax = k(b + d). */
  k: number;
  tax: number;
}

/** Deadweight loss ½ · t · (Q* − Qₜ). */
const deadweightLoss = (p: Params) => (p.tax * p.k) / 2;

/** C114, difficulty 2: deadweight loss of a per-unit tax with linear inverse demand and supply. */
export const deadweightLossPerUnitTax: Generator<Params> = {
  id: 'deadweight-loss-per-unit-tax',
  title: 'Deadweight loss of a tax',
  topicId: 'C114',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const b = rng.int(1, 5);
      const d = rng.int(1, 5);
      const k = rng.int(1, 6);
      if ((k * k * (b + d)) % 2 !== 0) continue; // keep ½·t·k whole
      const quantity = rng.int(10, 80);
      if (quantity - k < 2 * k + 5) continue; // the market stays well open after the tax
      const price = rng.int(15, 150);
      const c = price - d * quantity;
      if (c < 1) continue; // sellers need a positive price before they supply anything
      return { a: price + b * quantity, b, c, d, quantity, price, k, tax: k * (b + d) };
    }
  },

  stem: (p) =>
    `Inverse demand is $P = ${inverseLine(p.a, p.b, '-')}$ and inverse supply is $P = ${inverseLine(p.c, p.d, '+')}$. The government charges a tax of $${num(p.tax)}$ per unit. Find the deadweight loss of the tax.`,

  answer: (p) => ({ kind: 'numeric', value: deadweightLoss(p), decimals: 2 }),

  steps(p) {
    const taxed = p.quantity - p.k;
    const buyers = p.a - p.b * taxed;
    const dwl = deadweightLoss(p);
    return [
      {
        text: 'Find the quantity traded without the tax.',
        latex: `${inverseLine(p.a, p.b, '-')} = ${inverseLine(p.c, p.d, '+')} \\;\\Rightarrow\\; Q^* = \\dfrac{${num(p.a - p.c)}}{${num(p.b + p.d)}} = ${num(p.quantity)}`,
        why: 'Without the tax, trade continues until the demand price equals the supply price.',
        result: p.quantity,
      },
      {
        text: 'With the tax, the buyers’ price must exceed the sellers’ price by the tax.',
        latex: `${inverseLine(p.a, p.b, '-')} = ${inverseLine(p.c, p.d, '+')} + ${num(p.tax)} \\;\\Rightarrow\\; Q_t = \\dfrac{${num(p.a - p.c - p.tax)}}{${num(p.b + p.d)}} = ${num(taxed)}`,
        why: 'A unit is traded only if what a buyer will pay covers what the seller needs plus the tax.',
        result: taxed,
      },
      {
        text: 'Find the two prices at the taxed quantity.',
        latex: `P_b = ${num(p.a)} - ${p.b === 1 ? '' : `${num(p.b)} \\cdot `}${num(taxed)} = ${num(buyers)}, \\quad P_s = ${num(buyers)} - ${num(p.tax)} = ${num(buyers - p.tax)}`,
        why: 'Buyers pay the demand price; sellers keep that minus the tax. The gap is the height of the lost triangle.',
        result: buyers,
      },
      {
        text: 'The lost units between Qₜ and Q* would each have added demand price minus supply price.',
        latex: `DWL = \\int_{${num(taxed)}}^{${num(p.quantity)}} \\big[(${inverseLine(p.a, p.b, '-')}) - (${inverseLine(p.c, p.d, '+')})\\big]\\,dQ = \\tfrac12 \\cdot ${num(p.tax)} \\cdot ${num(p.k)} = ${num(dwl)}`,
        why: 'The gap between the curves falls from t at Qₜ to 0 at Q*, so the area is a triangle with height t and base Q* − Qₜ.',
        result: dwl,
      },
    ];
  },

  distractors(p) {
    const taxed = p.quantity - p.k;
    const buyersRise = p.b * p.k;
    return cleanDistractors(deadweightLoss(p), [
      { value: p.tax * taxed, mistakeCode: 'TAX_REVENUE_NOT_DWL' },
      { value: p.tax * p.k, mistakeCode: 'FORGOT_HALF' },
      { value: buyersRise * taxed + (buyersRise * p.k) / 2, mistakeCode: 'CONSUMER_LOSS_ONLY' },
    ]);
  },
};
