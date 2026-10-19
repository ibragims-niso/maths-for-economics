import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Setting {
  /** Who produces, and the limit they face. */
  firm: string;
  /** What q counts, plural, with the period. */
  units: string;
}

const SETTINGS: readonly Setting[] = [
  { firm: 'A bakery', units: 'trays of bread a day' },
  { firm: 'A furniture workshop', units: 'chairs a week' },
  { firm: 'A brewery', units: 'hundred litres of beer a week' },
  { firm: 'A cement plant', units: 'tonnes of cement a day' },
];

interface Params {
  setting: Setting;
  /** π(q) = −a q² + b q − F. */
  a: number;
  b: number;
  fixedCost: number;
  /** The capacity K: output must satisfy 0 ≤ q ≤ K. */
  capacity: number;
}

/** Profits are exact to the cent. */
const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

export const profit = (p: Params, q: number) => -p.a * q * q + p.b * q - p.fixedCost;
/** Where π′(q) = b − 2aq = 0: the peak without the capacity limit. */
export const unconstrainedPeak = (p: Params) => p.b / (2 * p.a);

const square = (a: number) => (a === 1 ? '' : num(a));

/** AN03, difficulty 2: the largest profit on [0, capacity] when the unconstrained peak lies beyond capacity (extreme value theorem). */
export const capacityProfitMaximum: Generator<Params> = {
  id: 'capacity-profit-maximum',
  title: 'Best profit under a capacity limit',
  topicId: 'AN03',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const a = rng.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5] as const);
      const capacity = rng.int(2, 16) * 5;
      const peak = capacity + rng.int(2, 40);
      const p: Params = {
        setting: rng.pick(SETTINGS),
        a,
        b: 2 * a * peak,
        fixedCost: rng.int(1, 60) * 50,
        capacity,
      };
      if (profit(p, p.capacity) > 0) return p;
    }
  },

  stem: (p) =>
    `${p.setting.firm} earns profit $\\pi(q) = -${square(p.a)}q^2 + ${num(p.b)}q - ${num(p.fixedCost)}$ from $q$ ${p.setting.units}, but it can produce at most ${num(p.capacity)}, so $0 \\le q \\le ${num(p.capacity)}$. What is the largest profit it can earn?`,

  answer: (p) => ({ kind: 'numeric', value: profit(p, p.capacity), decimals: 2, ...MONEY }),

  steps(p) {
    const K = num(p.capacity);
    const peak = unconstrainedPeak(p);
    const slopeAtK = p.b - 2 * p.a * p.capacity;
    return [
      {
        text: 'A largest profit exists.',
        latex: `\\pi \\text{ continuous on } [0, ${K}] \\Rightarrow \\text{a maximum exists}`,
        why: `π is a polynomial, so it is continuous, and [0, ${p.capacity}] is closed and bounded. The extreme value theorem then guarantees a best output, which must be an endpoint or a point inside where π′ = 0.`,
      },
      {
        text: 'Look for a flat point inside the interval.',
        latex: `\\pi'(q) = ${num(p.b)} - ${num(2 * p.a)}q = 0 \\Rightarrow q = ${num(peak)} > ${K}`,
        why: 'The only point where profit stops rising lies beyond capacity, so it is not a candidate.',
        result: peak,
      },
      {
        text: 'Profit rises all the way to capacity.',
        latex: `\\pi'(q) \\ge \\pi'(${K}) = ${num(slopeAtK)} > 0 \\text{ for } 0 \\le q \\le ${K}`,
        why: `π′ falls as q grows, and it is still positive at q = ${p.capacity}, so each extra unit adds profit right up to the limit.`,
        result: slopeAtK,
      },
      {
        text: 'Compare the endpoints.',
        latex: `\\pi(0) = -${num(p.fixedCost)}, \\quad \\pi(${K}) = ${num(profit(p, p.capacity))}`,
        why: `With no interior candidate the maximum is at an endpoint. Producing at full capacity, q = ${p.capacity}, gives the larger value.`,
        result: profit(p, p.capacity),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      profit(p, p.capacity),
      [
        { value: profit(p, unconstrainedPeak(p)), mistakeCode: 'IGNORED_CAPACITY' },
        { value: profit(p, 0), mistakeCode: 'WRONG_ENDPOINT' },
        { value: p.capacity, mistakeCode: 'QUANTITY_NOT_PROFIT' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
