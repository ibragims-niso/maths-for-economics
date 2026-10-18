import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Setting {
  /** Who charges, and for what. */
  seller: string;
  /** What q counts, plural. */
  units: string;
}

const SETTINGS: readonly Setting[] = [
  { seller: 'A wholesaler charges a delivery fee plus a price per box', units: 'boxes' },
  { seller: 'A mobile operator charges a monthly fee plus a price per GB of data', units: 'GB' },
  { seller: 'A print shop charges a set-up fee plus a price per page', units: 'pages' },
];

interface Params {
  setting: Setting;
  /** Fixed fee on the first piece. */
  fee: number;
  /** Price per unit up to the threshold. */
  price1: number;
  /** Lower price per unit above the threshold (a volume discount). */
  price2: number;
  threshold: number;
}

/** The value of k that joins the two pieces: fee + price1·m = k + price2·m. */
const joiningK = (p: Params) => p.fee + (p.price1 - p.price2) * p.threshold;

/** C101, difficulty 2: the constant k that makes a two-part tariff continuous at its threshold. */
export const continuousTariffParameter: Generator<Params> = {
  id: 'continuous-tariff-parameter',
  title: 'Making a tariff continuous',
  topicId: 'C101',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    const price1 = rng.int(3, 12);
    return {
      setting: rng.pick(SETTINGS),
      fee: rng.int(2, 40) * 5,
      price1,
      price2: rng.int(1, price1 - 1),
      threshold: rng.int(1, 12) * 5,
    };
  },

  stem: (p) =>
    `${p.setting.seller}. The bill for $q$ ${p.setting.units} is $C(q) = ${num(p.fee)} + ${num(p.price1)}q$ for $q \\le ${num(p.threshold)}$ and $C(q) = k + ${p.price2 === 1 ? '' : num(p.price2)}q$ for $q > ${num(p.threshold)}$. Which value of $k$ makes the bill continuous, with no jump at $q = ${num(p.threshold)}$?`,

  answer: (p) => ({ kind: 'numeric', value: joiningK(p), decimals: 2 }),

  steps(p) {
    const m = num(p.threshold);
    const left = p.fee + p.price1 * p.threshold;
    return [
      {
        text: `Find the limit from the left, using the rule for q ≤ ${p.threshold}.`,
        latex: `\\lim_{q \\to ${m}^-} C(q) = ${num(p.fee)} + ${num(p.price1)} \\cdot ${m} = ${num(left)}`,
        why: 'Just below the threshold the first rule applies, and it is a straight line, so its limit is its value there. This is also C at the threshold itself.',
        result: left,
      },
      {
        text: `Find the limit from the right, using the rule for q > ${p.threshold}.`,
        latex: `\\lim_{q \\to ${m}^+} C(q) = k + ${num(p.price2)} \\cdot ${m} = k + ${num(p.price2 * p.threshold)}`,
        why: 'Just above the threshold the second rule applies, so the bill approaches k + (second price) × threshold.',
      },
      {
        text: 'Set the two one-sided limits equal and solve for k.',
        latex: `k + ${num(p.price2 * p.threshold)} = ${num(left)} \\;\\Rightarrow\\; k = ${num(left)} - ${num(p.price2 * p.threshold)} = ${num(joiningK(p))}`,
        why: 'Continuous means both one-sided limits exist, are equal, and equal the value at the threshold, so the graph has no jump there.',
        result: joiningK(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(joiningK(p), [
      { value: p.fee + p.price1 * p.threshold, mistakeCode: 'LEFT_VALUE_ONLY' },
      { value: p.fee, mistakeCode: 'SAME_FIXED_FEE' },
      { value: p.fee + (p.price1 + p.price2) * p.threshold, mistakeCode: 'MOVED_TERM_SIGN' },
    ]),
};
