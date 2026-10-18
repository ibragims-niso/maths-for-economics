import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Salary in the first year. */
  start: number;
  /** The same rise every year (the common difference). */
  raise: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const lastSalary = (p: Params) => p.start + (p.years - 1) * p.raise;
// n(2a + (n − 1)d)/2 is a whole number here: 2a and (n − 1)d are both even.
const total = (p: Params) => (p.years * (p.start + lastSalary(p))) / 2;

/** F08, difficulty 1: total salary over n years when it rises by a fixed amount (arithmetic series). */
export const arithmeticSalaryTotal: Generator<Params> = {
  id: 'arithmetic-salary-total',
  title: 'Total salary with fixed rises',
  topicId: 'F08',
  difficulty: 1,
  timeSec: 90,

  params: (rng) => ({
    start: rng.int(18, 60) * 1000,
    raise: rng.int(5, 40) * 100,
    years: rng.int(4, 15),
  }),

  stem: (p) =>
    `Your salary is $${num(p.start)}$ in the first year and rises by $${num(p.raise)}$ every year. How much do you earn in total over the first $${p.years}$ years?`,

  answer: (p) => ({ kind: 'numeric', value: total(p), decimals: 0, ...MONEY }),

  steps: (p) => [
    {
      text: 'Recognise an arithmetic sequence.',
      latex: `a = ${num(p.start)}, \\quad d = ${num(p.raise)}, \\quad n = ${p.years}`,
      why: 'Every year adds the same amount, so the salaries go up in equal steps: first term a, common difference d.',
    },
    {
      text: 'Find the salary in the last year.',
      latex: `u_{${p.years}} = ${num(p.start)} + ${p.years - 1} \\cdot ${num(p.raise)} = ${num(lastSalary(p))}`,
      why: 'Year 1 has no rise yet, so year n has had n − 1 rises: uₙ = a + (n − 1)d.',
      result: lastSalary(p),
    },
    {
      text: 'Add up all the years.',
      latex: `S_{${p.years}} = \\dfrac{${p.years}}{2}\\,(${num(p.start)} + ${num(lastSalary(p))}) = ${num(total(p))}`,
      why: 'An arithmetic sum is the number of terms times the average term, and the average term is halfway between the first and the last.',
      result: total(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      total(p),
      [
        { value: lastSalary(p), mistakeCode: 'NTH_TERM_ONLY' },
        {
          value: (p.years * (2 * p.start + p.years * p.raise)) / 2,
          mistakeCode: 'OFF_BY_ONE',
        },
        { value: 2 * total(p), mistakeCode: 'FORGOT_HALF' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
