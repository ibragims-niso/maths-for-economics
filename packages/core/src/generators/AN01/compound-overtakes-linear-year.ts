import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  context: 'economies' | 'savings';
  /** A's starting value (GDP, or the deposit). */
  start: number;
  /** B's starting value (equal to `start` for savings). */
  rival: number;
  /** A's growth rate in per cent a year, compounded. */
  rate: number;
  /** B's fixed increase per year (for savings: deposit × simple rate). */
  step: number;
  /** Savings only: B's simple interest rate in per cent. */
  simpleRate: number;
}

/** Years are exact: no tolerance beyond input noise. */
const COUNT = { tolerance: 0.01, relTolerance: 0 } as const;
/** Gaps below this are treated as ties and rejected, so the rounded values in the steps still compare the right way. */
const TIE = 0.05;

const a = (p: Params, n: number) => p.start * (1 + p.rate / 100) ** n;
const b = (p: Params, n: number) => p.rival + p.step * n;
/** A's increase during year n. */
const aIncrease = (p: Params, n: number) => a(p, n) - a(p, n - 1);

const firstYear = (test: (n: number) => boolean) => {
  for (let n = 1; n <= 400; n++) if (test(n)) return n;
  return Number.NaN;
};

/** The first year A is ahead; A then stays ahead (A − B is convex in n). */
const overtakeYear = (p: Params) => firstYear((n) => a(p, n) > b(p, n));
/** The first year A's own increase beats B's fixed increase. */
const increaseYear = (p: Params) => firstYear((n) => aIncrease(p, n) > p.step);
/** The answer if A grew by a fixed rate% of its starting value: start(1 + gn) > rival + dn. */
const simpleGrowthYear = (p: Params) => {
  const gain = p.start * p.rate - 100 * p.step;
  if (gain <= 0) return Number.NaN;
  return Math.floor((100 * (p.rival - p.start)) / gain) + 1;
};

const growth = (p: Params) => num(1 + p.rate / 100, 4);

/** AN01, difficulty 3: the first year a compound-growth path overtakes a linear one, with the inductive step that keeps it ahead. */
export const compoundOvertakesLinearYear: Generator<Params> = {
  id: 'compound-overtakes-linear-year',
  title: 'When compound growth overtakes',
  topicId: 'AN01',
  difficulty: 3,
  timeSec: 180,

  params: (rng) => {
    for (;;) {
      let p: Params;
      if (rng.int(0, 1) === 0) {
        const start = rng.int(10, 40) * 10;
        p = {
          context: 'economies',
          start,
          rival: start + rng.int(5, 30) * 10,
          rate: rng.int(2, 8),
          step: rng.int(2, 15),
          simpleRate: 0,
        };
      } else {
        const deposit = rng.int(2, 40) * 500;
        const rate = rng.int(3, 10);
        const simpleRate = rate + rng.int(1, 4);
        p = {
          context: 'savings',
          start: deposit,
          rival: deposit,
          rate,
          step: (deposit * simpleRate) / 100,
          simpleRate,
        };
      }
      const N = overtakeYear(p);
      if (!(N >= 3 && N <= 30)) continue;
      // No near-ties in any year up to the answer, nor in the increase comparison.
      let tie = false;
      for (let n = 1; n <= N + 1; n++) {
        if (Math.abs(a(p, n) - b(p, n)) < TIE) tie = true;
        if (Math.abs(aIncrease(p, n) - p.step) < TIE) tie = true;
      }
      if (tie) continue;
      if (compoundOvertakesLinearYear.distractors(p).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    p.context === 'economies'
      ? `Country A's GDP is $${num(p.start)}$ billion and grows by $${p.rate}\\%$ a year. Country B's GDP is $${num(p.rival)}$ billion and grows by a fixed $${num(p.step)}$ billion a year. In which year $n$ (counting from now, $n = 1, 2, \\dots$) is A's GDP larger than B's for the first time?`
      : `A deposit of $${num(p.start)}$ can go into plan A, which pays $${p.rate}\\%$ a year compound interest, or plan B, which pays $${p.simpleRate}\\%$ a year simple interest on the original deposit. After how many whole years $n$ is plan A's balance larger than plan B's for the first time?`,

  answer: (p) => ({ kind: 'numeric', value: overtakeYear(p), decimals: 0, ...COUNT }),

  steps: (p) => {
    const N = overtakeYear(p);
    const g = p.rate / 100;
    const bPath =
      p.context === 'savings'
        ? `${num(p.start)}(1 + ${num(p.simpleRate / 100, 2)}n) = ${num(p.rival)} + ${num(p.step)}n`
        : `${num(p.rival)} + ${num(p.step)}n`;
    return [
      {
        text: 'Write both paths.',
        latex: `A_n = ${num(p.start)} \\cdot ${growth(p)}^{n}, \\qquad B_n = ${bPath}`,
        why: 'A grows by a fixed percentage of its current value each year (compounding); B grows by the same amount every year.',
      },
      {
        text: `Year ${N - 1}: A is not yet ahead.`,
        latex: `A_{${N - 1}} = ${num(round(a(p, N - 1), 2))} < B_{${N - 1}} = ${num(b(p, N - 1))}`,
        why: 'Trying the years in order (or solving with logarithms) shows A is behind in every year up to this one.',
        result: round(a(p, N - 1), 2),
      },
      {
        text: `Base case, year ${N}: A is ahead.`,
        latex: `A_{${N}} = ${num(round(a(p, N), 2))} > B_{${N}} = ${num(b(p, N))}`,
        why: 'This is the first year with A above B, and the base case of the induction that A stays ahead.',
        result: round(a(p, N), 2),
      },
      {
        text: 'Inductive step: once ahead, A stays ahead.',
        latex: `A_{n+1} - B_{n+1} = (A_n - B_n) + (${num(g, 2)}A_n - ${num(p.step)}), \\quad ${num(g, 2)}A_{${N}} = ${num(round(g * a(p, N), 2))} > ${num(p.step)}`,
        why: 'If A is ahead in year n and its yearly increase gAₙ beats B’s fixed increase, A is still ahead in year n + 1. Aₙ only grows, so gAₙ stays above B’s increase for every n from this year on.',
        result: round(g * a(p, N), 2),
      },
      {
        text: 'Conclude.',
        latex: `n = ${N}`,
        why: `Base case and inductive step together show A is ahead in year ${N} and every year after it, and it was behind in year ${N - 1}.`,
        result: N,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      overtakeYear(p),
      [
        { value: overtakeYear(p) - 1, mistakeCode: 'LAST_YEAR_BEHIND' },
        { value: increaseYear(p), mistakeCode: 'YEARLY_NOT_TOTAL' },
        { value: simpleGrowthYear(p), mistakeCode: 'SIMPLE_GROWTH' },
      ],
      COUNT.tolerance,
      COUNT.relTolerance,
    ),
};
