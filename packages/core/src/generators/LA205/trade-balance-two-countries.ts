import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Share of country 1's income spent on imports from country 2, in per cent. */
  a: number;
  /** Share of country 2's income spent on imports from country 1, in per cent. */
  b: number;
  /** Country 1's national income (billion). */
  x1: number;
}

const MONEY = { tolerance: 0.005, relTolerance: 0 } as const;

export const balancedIncome = (p: Params) => (p.a * p.x1) / p.b;
const answerValue = (p: Params) => round(balancedIncome(p), 2);

const candidates = (p: Params) => [
  { value: round((p.b * p.x1) / p.a, 2), mistakeCode: 'RATIO_FLIPPED' },
  { value: p.x1, mistakeCode: 'EQUAL_INCOMES' },
  { value: round(((100 - p.a) * p.x1) / (100 - p.b), 2), mistakeCode: 'USED_HOME_SHARES' },
];

/** LA205, difficulty 2: balanced trade between two countries, x₂ = a·x₁/b. */
export const tradeBalanceTwoCountries: Generator<Params> = {
  id: 'trade-balance-two-countries',
  title: 'Balanced trade between two countries',
  topicId: 'LA205',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 9) * 5;
      const b = rng.int(1, 9) * 5;
      const x1 = rng.int(4, 40) * 10;
      if (a === b) continue;
      const p: Params = { a, b, x1 };
      if (cleanDistractors(answerValue(p), candidates(p), MONEY.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `Two countries trade only with each other. Country 1 spends ${num(p.a)} % of its national income on goods from country 2 and the rest at home; country 2 spends ${num(p.b)} % of its income on goods from country 1 and the rest at home. Country 1's national income is ${num(p.x1)} billion. What must country 2's national income be for trade to be balanced (each country's sales equal its income)? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: answerValue(p), decimals: 2, ...MONEY }),

  steps(p) {
    const a = num(p.a / 100);
    const b = num(p.b / 100);
    return [
      {
        text: 'Write the structure matrix: column j shows how country j splits its income.',
        latex: `A = \\begin{pmatrix} ${num(1 - p.a / 100)} & ${b} \\\\ ${a} & ${num(1 - p.b / 100)} \\end{pmatrix}`,
        why: 'Entry a_ij is the share of country j’s income spent on goods from country i, so each column adds up to 1: every country spends all its income somewhere.',
      },
      {
        text: 'Balanced trade means A x = x, a homogeneous system (A − I) x = 0.',
        latex: `${num(1 - p.a / 100)}x_1 + ${b}x_2 = x_1 \\;\\Rightarrow\\; ${b}x_2 = ${a}x_1`,
        why: 'Country 1’s sales are what it sells at home plus its exports to country 2; balance requires them to equal its income x₁. The second equation says the same thing, because the columns of A − I add up to 0.',
      },
      {
        text: 'Solve for x₂.',
        latex: `x_2 = \\dfrac{${a}}{${b}} \\cdot ${num(p.x1)} = ${num(answerValue(p))}`,
        why: 'Only the ratio of incomes is fixed, (x₁, x₂) = t·(b, a); the given income of country 1 picks one point on that line.',
        result: answerValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerValue(p), candidates(p), MONEY.tolerance, 0),
};
