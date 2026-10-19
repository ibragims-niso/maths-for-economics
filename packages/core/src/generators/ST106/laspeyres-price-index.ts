import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Goods for a household basket; base prices are drawn as `lo`–`hi` multiples of 20 qəpik. */
const GOODS = {
  bread: { name: 'Bread (loaf)', lo: 2, hi: 6 },
  milk: { name: 'Milk (litre)', lo: 4, hi: 10 },
  rice: { name: 'Rice (kg)', lo: 8, hi: 16 },
  fuel: { name: 'Fuel (litre)', lo: 4, hi: 9 },
  tea: { name: 'Tea (pack)', lo: 10, hi: 25 },
  meat: { name: 'Meat (kg)', lo: 40, hi: 70 },
} as const;

type Good = keyof typeof GOODS;

export interface BasketItem {
  good: Good;
  /** Base-period price in qəpik (1 manat = 100 qəpik). */
  p0: number;
  /** Current price in qəpik. */
  p1: number;
  /** Base-period quantity. */
  q0: number;
  /** Current quantity. */
  q1: number;
}

interface Params {
  items: BasketItem[];
  baseYear: number;
}

/** Index to 2 decimals; all sums are exact, so only rounding of the last digit can differ. */
const INDEX = { tolerance: 0.01, relTolerance: 0 } as const;

/** Σ price × quantity over the basket, in qəpik (whole numbers, so exact). */
export const spend = (items: BasketItem[], price: 'p0' | 'p1', quantity: 'q0' | 'q1'): number =>
  items.reduce((s, it) => s + it[price] * it[quantity], 0);

export const laspeyres = (items: BasketItem[]) =>
  (spend(items, 'p1', 'q0') / spend(items, 'p0', 'q0')) * 100;
export const paasche = (items: BasketItem[]) =>
  (spend(items, 'p1', 'q1') / spend(items, 'p0', 'q1')) * 100;

/** An amount in qəpik written in manat with both decimals: 120 → "1.20". */
const manat = (qepik: number) => (qepik / 100).toFixed(2);

function wrongAnswers(p: Params): Distractor[] {
  const relatives = p.items.map((it) => it.p1 / it.p0);
  const sumP0 = p.items.reduce((s, it) => s + it.p0, 0);
  const sumP1 = p.items.reduce((s, it) => s + it.p1, 0);
  return cleanDistractors(
    round(laspeyres(p.items), 2),
    [
      { value: round(paasche(p.items), 2), mistakeCode: 'PAASCHE_WEIGHTS' },
      {
        value: round((relatives.reduce((s, r) => s + r, 0) / relatives.length) * 100, 2),
        mistakeCode: 'UNWEIGHTED_RELATIVES',
      },
      {
        value: round((spend(p.items, 'p1', 'q1') / spend(p.items, 'p0', 'q0')) * 100, 2),
        mistakeCode: 'VALUE_INDEX',
      },
      { value: round((sumP1 / sumP0) * 100, 2), mistakeCode: 'SUM_OF_PRICES' },
    ],
    INDEX.tolerance,
    INDEX.relTolerance,
  );
}

/** The basket as a LaTeX table: one row per good with both prices and both quantities. */
function basketTable(p: Params): string {
  const y0 = p.baseYear;
  const y1 = p.baseYear + 1;
  const head = `\\text{Good} & p_{${y0}} & p_{${y1}} & q_{${y0}} & q_{${y1}}`;
  const rows = p.items.map(
    (it) =>
      `\\text{${GOODS[it.good].name}} & ${manat(it.p0)} & ${manat(it.p1)} & ${it.q0} & ${it.q1}`,
  );
  return `\\begin{array}{l|cccc} ${head} \\\\ \\hline ${rows.join(' \\\\ ')} \\end{array}`;
}

/** ST106, difficulty 2: Laspeyres price index of a 2–3 good basket, Σp₁q₀ / Σp₀q₀ × 100. */
export const laspeyresPriceIndex: Generator<Params> = {
  id: 'laspeyres-price-index',
  title: 'Laspeyres price index',
  topicId: 'ST106',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const count = rng.int(2, 3);
      const pool = [...(Object.keys(GOODS) as Good[])];
      const items: BasketItem[] = [];
      for (let k = 0; k < count; k++) {
        const good = pool.splice(rng.int(0, pool.length - 1), 1)[0] as Good;
        const g = GOODS[good];
        const p0 = 20 * rng.int(g.lo, g.hi);
        // A price change of −10 % to +60 % in steps of 5 %: p0 is a multiple of 20, so p1 is whole.
        const change = 5 * rng.int(-2, 12);
        const p1 = (p0 * (100 + change)) / 100;
        const q0 = rng.int(2, 30);
        const q1 = Math.max(1, q0 + rng.int(-Math.ceil(q0 / 3), Math.ceil(q0 / 3)));
        items.push({ good, p0, p1, q0, q1 });
      }
      const q: Params = { items, baseYear: rng.int(2015, 2024) };
      // At least one price must change, and the four wrong methods must all give other answers.
      if (items.every((it) => it.p1 === it.p0)) continue;
      if (wrongAnswers(q).length < 4) continue;
      return q;
    }
  },

  stem: (p) =>
    `A household basket has these prices (in manat) and quantities bought per week in ${p.baseYear} and ${p.baseYear + 1}: $${basketTable(p)}$ Find the Laspeyres price index for ${p.baseYear + 1} with ${p.baseYear} = 100. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(laspeyres(p.items), 2), decimals: 2, ...INDEX }),

  steps(p) {
    const base = spend(p.items, 'p0', 'q0');
    const now = spend(p.items, 'p1', 'q0');
    const terms = (price: 'p0' | 'p1') =>
      p.items.map((it) => `${manat(it[price])} \\times ${it.q0}`).join(' + ');
    return [
      {
        text: `Cost the ${p.baseYear} basket at ${p.baseYear} prices.`,
        latex: `\\sum p_0 q_0 = ${terms('p0')} = ${manat(base)}`,
        why: 'This is what the household spent in the base year; it is the denominator of the index.',
        result: base / 100,
      },
      {
        text: `Cost the same ${p.baseYear} basket at ${p.baseYear + 1} prices.`,
        latex: `\\sum p_1 q_0 = ${terms('p1')} = ${manat(now)}`,
        why: 'Laspeyres keeps the base-period quantities fixed, so only the prices change between the two sums.',
        result: now / 100,
      },
      {
        text: 'Divide and multiply by 100.',
        latex: `L = \\dfrac{${manat(now)}}{${manat(base)}} \\times 100 = ${num(laspeyres(p.items))}`,
        why: 'The ratio says how many times dearer the fixed basket has become; × 100 puts it on the scale where the base year is 100.',
        result: round(laspeyres(p.items), 2),
      },
    ];
  },

  distractors: wrongAnswers,
};
