import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Family = 'odd' | 'pair' | 'square' | 'cube';

interface Params {
  family: Family;
  /** Number of terms. */
  n: number;
}

/** Counts are exact: no tolerance beyond input noise. */
const COUNT = { tolerance: 0.01, relTolerance: 0 } as const;

interface Spec {
  /** The k-th term. */
  term: (k: number) => number;
  /** The closed form proved by induction. */
  closed: (n: number) => number;
  /** A closed form that belongs to a different sum (or is misremembered). */
  wrong: (n: number) => number;
  termLatex: string;
  closedLatex: string;
  /** The closed form with numbers in, e.g. "\dfrac{12 \cdot 13 \cdot 14}{3}". */
  closedAt: (n: number) => string;
  /** Inductive step: S(n) + term(n + 1) = S(n + 1), in LaTeX. */
  stepLatex: string;
  /** Range of n. */
  range: [number, number];
  stem: (n: number) => string;
}

const SPECS: Record<Family, Spec> = {
  odd: {
    term: (k) => 2 * k - 1,
    closed: (n) => n * n,
    wrong: (n) => n * (n + 1) - 1,
    termLatex: '(2k - 1)',
    closedLatex: 'n^2',
    closedAt: (n) => `${n}^2`,
    stepLatex: 'n^2 + (2(n+1) - 1) = n^2 + 2n + 1 = (n+1)^2',
    range: [15, 60],
    stem: (n) =>
      `A workshop's cost of making the $k$-th unit of a product is $2k - 1$ (in tens). What is the total cost of the first $${n}$ units, $\\sum_{k=1}^{${n}} (2k - 1)$? Use the closed form that induction proves rather than adding term by term.`,
  },
  pair: {
    term: (k) => k * (k + 1),
    closed: (n) => (n * (n + 1) * (n + 2)) / 3,
    wrong: (n) => (n * (n + 1) * (n + 2)) / 6,
    termLatex: 'k(k + 1)',
    closedLatex: '\\dfrac{n(n+1)(n+2)}{3}',
    closedAt: (n) => `\\dfrac{${n} \\cdot ${n + 1} \\cdot ${n + 2}}{3}`,
    stepLatex: '\\dfrac{n(n+1)(n+2)}{3} + (n+1)(n+2) = \\dfrac{(n+1)(n+2)(n + 3)}{3}',
    range: [8, 30],
    stem: (n) =>
      `In month $k$ after launch, a firm installs $k(k + 1)$ solar panels. How many panels does it install in the first $${n}$ months, that is, what is $\\sum_{k=1}^{${n}} k(k + 1)$? Use the closed form that induction proves rather than adding term by term.`,
  },
  square: {
    term: (k) => k * k,
    closed: (n) => (n * (n + 1) * (2 * n + 1)) / 6,
    wrong: (n) => ((n * (n + 1)) / 2) ** 2,
    termLatex: 'k^2',
    closedLatex: '\\dfrac{n(n+1)(2n+1)}{6}',
    closedAt: (n) => `\\dfrac{${n} \\cdot ${n + 1} \\cdot ${2 * n + 1}}{6}`,
    stepLatex:
      '\\dfrac{n(n+1)(2n+1)}{6} + (n+1)^2 = \\dfrac{(n+1)(2n^2 + 7n + 6)}{6} = \\dfrac{(n+1)(n+2)(2n+3)}{6}',
    range: [8, 30],
    stem: (n) =>
      `A firm's marginal cost of the $k$-th unit is $k^2$. What is the total variable cost of the first $${n}$ units, $\\sum_{k=1}^{${n}} k^2$? Use the closed form that induction proves rather than adding term by term.`,
  },
  cube: {
    term: (k) => k ** 3,
    closed: (n) => ((n * (n + 1)) / 2) ** 2,
    wrong: (n) => (n * (n + 1) * (2 * n + 1)) / 6,
    termLatex: 'k^3',
    closedLatex: '\\left(\\dfrac{n(n+1)}{2}\\right)^2',
    closedAt: (n) => `\\left(\\dfrac{${n} \\cdot ${n + 1}}{2}\\right)^2`,
    stepLatex:
      '\\left(\\dfrac{n(n+1)}{2}\\right)^2 + (n+1)^3 = \\dfrac{(n+1)^2(n^2 + 4n + 4)}{4} = \\left(\\dfrac{(n+1)(n+2)}{2}\\right)^2',
    range: [5, 20],
    stem: (n) =>
      `A new mine's output in year $k$ is $k^3$ thousand tonnes as it expands. What is its total output over the first $${n}$ years, $\\sum_{k=1}^{${n}} k^3$, in thousand tonnes? Use the closed form that induction proves rather than adding term by term.`,
  },
};

/** The family's term, closed form and wrong closed form (used by the tests). */
export const sumSpec = (family: Family) => SPECS[family];

/** AN01, difficulty 2: a sum Σ_{k=1}^{n} of 2k − 1, k(k + 1), k² or k³ from its closed form, proved by induction. */
export const inductionSumClosedForm: Generator<Params> = {
  id: 'induction-sum-closed-form',
  title: 'A sum from a formula proved by induction',
  topicId: 'AN01',
  difficulty: 2,
  timeSec: 150,

  params: (rng) => {
    const family = rng.pick(['odd', 'pair', 'square', 'cube'] as const);
    const [lo, hi] = SPECS[family].range;
    return { family, n: rng.int(lo, hi) };
  },

  stem: (p) => SPECS[p.family].stem(p.n),

  answer: (p) => ({ kind: 'numeric', value: SPECS[p.family].closed(p.n), decimals: 0, ...COUNT }),

  steps: (p) => {
    const s = SPECS[p.family];
    return [
      {
        text: 'Write down the closed form.',
        latex: `\\sum_{k=1}^{n} ${s.termLatex} = ${s.closedLatex}`,
        why: 'A closed form replaces n additions by one calculation; the next two steps are its proof by induction.',
      },
      {
        text: 'Base case: check n = 1.',
        latex: `\\text{sum} = ${num(s.term(1))}, \\quad \\text{formula} = ${s.closedAt(1)} = ${num(s.closed(1))}`,
        why: 'With one term the sum is just the first term, so the formula must give that number.',
        result: s.closed(1),
      },
      {
        text: 'Inductive step: add the next term.',
        latex: s.stepLatex,
        why: 'Assume the formula holds for n terms. Adding term n + 1 gives the same formula with n replaced by n + 1, so the formula passes from each n to the next and, starting from n = 1, holds for every n.',
      },
      {
        text: `Substitute n = ${p.n}.`,
        latex: `\\sum_{k=1}^{${p.n}} ${s.termLatex} = ${s.closedAt(p.n)} = ${num(s.closed(p.n))}`,
        why: 'The formula is now proved for every n, so it can be used for this one.',
        result: s.closed(p.n),
      },
    ];
  },

  distractors: (p) => {
    const s = SPECS[p.family];
    return cleanDistractors(
      s.closed(p.n),
      [
        { value: s.closed(p.n - 1), mistakeCode: 'ONE_TERM_SHORT' },
        { value: s.term(p.n), mistakeCode: 'TERM_NOT_SUM' },
        { value: s.wrong(p.n), mistakeCode: 'WRONG_CLOSED_FORM' },
      ],
      COUNT.tolerance,
      COUNT.relTolerance,
    );
  },
};
