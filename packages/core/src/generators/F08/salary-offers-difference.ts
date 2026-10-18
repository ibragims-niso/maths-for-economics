import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Offer A: first-year salary, then a fixed rise every year. */
  startA: number;
  raiseA: number;
  /** Offer B: first-year salary (never above A's), then a percentage rise every year. */
  startB: number;
  /** Yearly rise of offer B, in per cent. */
  growthB: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const ratio = (p: Params) => 1 + p.growthB / 100;
const arithmeticSum = (a: number, d: number, n: number) => (n * (2 * a + (n - 1) * d)) / 2;
const geometricSum = (a: number, r: number, n: number) => (a * (r ** n - 1)) / (r - 1);
const totalA = (p: Params) => arithmeticSum(p.startA, p.raiseA, p.years);
const totalB = (p: Params) => geometricSum(p.startB, ratio(p), p.years);
const gap = (p: Params) => round(Math.abs(totalB(p) - totalA(p)), 2);

/** F08, difficulty 3: compare a salary with fixed rises (arithmetic) and one with percentage rises (geometric) over n years. */
export const salaryOffersDifference: Generator<Params> = {
  id: 'salary-offers-difference',
  title: 'Comparing two salary offers',
  topicId: 'F08',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const startA = rng.int(20, 50) * 1000;
      const p: Params = {
        startA,
        raiseA: rng.int(4, 30) * 100,
        startB: startA - rng.int(0, 4) * 1000,
        growthB: rng.int(4, 16) / 2,
        years: rng.int(5, 15),
      };
      // A near tie makes "which offer is better" a matter of rounding; insist on a clear gap.
      if (Math.abs(totalB(p) - totalA(p)) >= 500) return p;
    }
  },

  stem: (p) =>
    `Offer A pays $${num(p.startA)}$ in the first year and rises by $${num(p.raiseA)}$ every year. Offer B pays $${num(p.startB)}$ in the first year and rises by $${num(p.growthB)}\\%$ every year. Over the first $${p.years}$ years, by how much does the total from the better offer exceed the total from the other? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: gap(p), decimals: 2, ...MONEY }),

  steps(p) {
    const n = p.years;
    const r = ratio(p);
    const sA = num(totalA(p));
    const sB = num(round(totalB(p), 2));
    const bWins = totalB(p) > totalA(p);
    return [
      {
        text: 'Total of offer A, an arithmetic series.',
        latex: `S_A = \\dfrac{${n}}{2}\\,(2 \\cdot ${num(p.startA)} + ${n - 1} \\cdot ${num(p.raiseA)}) = ${num(totalA(p))}`,
        why: 'A fixed rise every year makes the salaries an arithmetic sequence with a = first salary and d = the rise.',
        result: totalA(p),
      },
      {
        text: 'Find the common ratio of offer B.',
        latex: `r = 1 + ${num(p.growthB / 100, 4)} = ${num(r, 4)}`,
        why: 'A rise of g % multiplies each year’s salary by 1 + g/100, so offer B is a geometric sequence.',
        result: r,
      },
      {
        text: 'Total of offer B, a geometric series.',
        latex: `S_B = ${num(p.startB)} \\cdot \\dfrac{${num(r, 4)}^{${n}} - 1}{${num(r - 1, 4)}} = ${num(round(totalB(p), 2))}`,
        why: 'Sₙ = a(rⁿ − 1)/(r − 1) is the usual geometric sum, written this way round because r > 1.',
        result: round(totalB(p), 2),
      },
      {
        text: `Compare the totals: offer ${bWins ? 'B' : 'A'} pays more.`,
        latex: bWins
          ? `S_B - S_A = ${sB} - ${sA} = ${num(gap(p))}`
          : `S_A - S_B = ${sA} - ${sB} = ${num(gap(p))}`,
        why: 'The better offer is the one with the larger total over the whole period, whatever the starting salaries.',
        result: gap(p),
      },
    ];
  },

  distractors(p) {
    const n = p.years;
    const r = ratio(p);
    return cleanDistractors(
      gap(p),
      [
        {
          value: round(Math.abs(totalB(p) - (n * (2 * p.startA + n * p.raiseA)) / 2), 2),
          mistakeCode: 'OFF_BY_ONE',
        },
        {
          value: round(Math.abs(geometricSum(p.startB, r, n - 1) - totalA(p)), 2),
          mistakeCode: 'EXPONENT_OFF_BY_ONE',
        },
        {
          value: round(Math.abs(p.startB * r ** (n - 1) - (p.startA + (n - 1) * p.raiseA)), 2),
          mistakeCode: 'NTH_TERM_ONLY',
        },
        {
          value: round(
            Math.abs(arithmeticSum(p.startB, (p.startB * p.growthB) / 100, n) - totalA(p)),
            2,
          ),
          mistakeCode: 'FIXED_RAISE',
        },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
