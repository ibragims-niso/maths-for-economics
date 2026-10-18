import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Asset = 'car' | 'van' | 'machine' | 'laptop' | 'tractor';

interface Params {
  asset: Asset;
  /** Purchase price. */
  price: number;
  /** Years from purchase to the observed value. */
  years: number;
  /** Observed value after `years` years. */
  value: number;
  /** The value we ask about; a simple fraction of the price. */
  target: number;
}

interface AssetSpec {
  name: string;
  /** Price = a whole number in [min, max] times step. */
  price: readonly [number, number, number];
  /** Yearly loss in per cent, [min, max]. */
  loss: readonly [number, number];
  /** Observed values are rounded to a multiple of this. */
  roundTo: number;
}

const ASSETS: Record<Asset, AssetSpec> = {
  car: { name: 'A car', price: [24, 120, 500], loss: [10, 25], roundTo: 100 },
  van: { name: 'A delivery van', price: [30, 100, 500], loss: [10, 25], roundTo: 100 },
  machine: { name: 'A factory machine', price: [20, 200, 1000], loss: [8, 20], roundTo: 100 },
  laptop: { name: 'A laptop', price: [8, 30, 100], loss: [20, 40], roundTo: 10 },
  tractor: { name: 'A tractor', price: [40, 150, 1000], loss: [8, 18], roundTo: 100 },
};

const FRACTIONS = [0.5, 0.4, 0.3, 0.25, 0.2, 0.1] as const;

const yearlyFactor = (p: Params) => (p.value / p.price) ** (1 / p.years);
const time = (p: Params) => (p.years * Math.log(p.target / p.price)) / Math.log(p.value / p.price);

/**
 * F07, difficulty 3: an asset loses a fixed percentage a year; find the yearly factor from two
 * values, then solve price · bᵗ = target for t.
 */
export const depreciationTimeToValue: Generator<Params> = {
  id: 'depreciation-time-to-value',
  title: 'Time for a value to fall',
  topicId: 'F07',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const asset = rng.pick(['car', 'van', 'machine', 'laptop', 'tractor'] as const);
      const spec = ASSETS[asset];
      const [min, max, step] = spec.price;
      const price = rng.int(min, max) * step;
      const loss = rng.int(spec.loss[0], spec.loss[1]) / 100;
      const years = rng.int(2, 5);
      const value = Math.round((price * (1 - loss) ** years) / spec.roundTo) * spec.roundTo;
      const target = Math.round(price * rng.pick(FRACTIONS));
      const p = { asset, price, years, value, target };
      if (value <= 0 || target >= value) continue;
      const t = time(p);
      if (t >= years + 0.5 && t <= 40) return p;
    }
  },

  stem: (p) =>
    `${ASSETS[p.asset].name} is bought for $${num(p.price)}$. After $${p.years}$ years it is worth $${num(p.value)}$. Assume it loses the same percentage of its value every year. How many years after purchase will it be worth $${num(p.target)}$? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(time(p), 2), decimals: 2 }),

  steps(p) {
    const b = yearlyFactor(p);
    const q = p.target / p.price;
    const t = round(time(p), 2);
    return [
      {
        text: `Find the yearly value factor b (the asset loses ${num((1 - b) * 100)} % of its value a year).`,
        latex: `${num(p.price)}\\,b^{${p.years}} = ${num(p.value)} \\;\\Rightarrow\\; b = \\left(\\dfrac{${num(p.value)}}{${num(p.price)}}\\right)^{1/${p.years}} = ${num(b, 5)}`,
        why: 'A constant percentage loss multiplies the value by the same factor b every year, so b to the power T is the total factor and its T-th root is the yearly one.',
        result: round(b, 5),
      },
      {
        text: 'Set the value equal to the target and divide by the purchase price.',
        latex: `${num(p.price)}\\,b^t = ${num(p.target)} \\;\\Rightarrow\\; b^t = \\dfrac{${num(p.target)}}{${num(p.price)}} = ${num(q, 4)}`,
        why: 'In a·bᵗ only b is raised to the power t, so divide by a first; (a·b)ᵗ would be a different function.',
        result: round(q, 4),
      },
      {
        text: 'Take natural logs and solve for t.',
        latex: `t = \\dfrac{\\ln ${num(q, 4)}}{\\ln ${num(b, 5)}} = \\dfrac{${num(Math.log(q), 4)}}{${num(Math.log(b), 5)}} = ${num(t)}`,
        why: 'Both logarithms are negative because both numbers are below 1, so their ratio, the time, is positive.',
        result: t,
      },
    ];
  },

  distractors(p) {
    const q = p.target / p.price;
    const t = time(p);
    const lossPerYear = (p.price - p.value) / p.years;
    const averageRate = (1 - p.value / p.price) / p.years;
    return cleanDistractors(round(t, 2), [
      { value: round((p.price - p.target) / lossPerYear, 2), mistakeCode: 'LINEAR_CHANGE' },
      { value: round(Math.log(q) / Math.log(1 - averageRate), 2), mistakeCode: 'SIMPLE_AVERAGE' },
      { value: round(t - p.years, 2), mistakeCode: 'WRONG_START' },
      { value: round(Math.log10(q) / Math.log(yearlyFactor(p)), 2), mistakeCode: 'MIXED_BASES' },
    ]);
  },
};
