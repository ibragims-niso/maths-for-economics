import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Exponents in U = x^a · y^b: (1, 1), (2, 1) or (1, 2). */
  a: number;
  b: number;
  /** Bundle A = (x1, y1) fixes the indifference curve. */
  x1: number;
  y1: number;
  /** Bundle B has x0 units of x; the answer y0 puts it on the same curve. */
  x0: number;
  y0: number;
}

/** The utility level of bundle A, Ū = x1^a · y1^b. */
const level = (p: Params) => p.x1 ** p.a * p.y1 ** p.b;

/** U = x^a·y^b written as LaTeX: "xy", "x^2y", "xy^2". */
const utilityLatex = (p: Params) => `x${p.a === 1 ? '' : `^${p.a}`}y${p.b === 1 ? '' : `^${p.b}`}`;

const candidates = (p: Params): Distractor[] => {
  const u = level(p);
  const list: Distractor[] = [];
  // From x^a·y^b = Ū a student writes y^b = Ū − x^a.
  const diff = u - p.x0 ** p.a;
  if (diff > 0) {
    list.push({ value: round(diff ** (1 / p.b), 2), mistakeCode: 'SUBTRACTED_NOT_DIVIDED' });
  }
  if (p.b > 1) list.push({ value: u / p.x0 ** p.a, mistakeCode: 'POWER_NOT_UNDONE' });
  if (p.a !== p.b) {
    list.push({
      value: round((u / p.x0 ** p.b) ** (1 / p.a), 2),
      mistakeCode: 'EXPONENTS_SWAPPED',
    });
  }
  // Scaling y in the same proportion as x, as if more of one good needed more of the other.
  list.push({ value: round((p.y1 * p.x0) / p.x1, 2), mistakeCode: 'WRONG_DIRECTION' });
  return list;
};

/**
 * MV01, difficulty 2: bundle B has a given amount of x; how much y puts it on the same
 * indifference curve of U = x^a·y^b as bundle A?
 */
export const sameIndifferenceCurveQuantity: Generator<Params> = {
  id: 'same-indifference-curve-quantity',
  title: 'A bundle on the same indifference curve',
  topicId: 'MV01',
  difficulty: 2,
  timeSec: 150,

  // On x^a·y^b = Ū, y0 = y1·(x1/x0)^(a/b). Drawing u, v (x1 : x0 = u : v, or u² : v² when
  // b = 2) and building y1 and y0 from them makes every number whole.
  params(rng) {
    for (;;) {
      const [a, b] = rng.pick([
        [1, 1],
        [2, 1],
        [1, 2],
      ] as const);
      const u = rng.int(1, a === 1 && b === 1 ? 6 : 4);
      const v = rng.int(1, a === 1 && b === 1 ? 6 : 4);
      const c = rng.int(1, 8);
      const w = rng.int(1, 12);
      if (u === v) continue;
      let p: Params;
      if (a === 2) p = { a, b, x1: c * u, x0: c * v, y1: v * v * w, y0: u * u * w };
      else if (b === 2) p = { a, b, x1: c * u * u, x0: c * v * v, y1: v * w, y0: u * w };
      else p = { a, b, x1: c * u, x0: c * v, y1: v * w, y0: u * w };
      const values = [p.x1, p.x0, p.y1, p.y0];
      if (values.some((n) => n < 2 || n > 120)) continue;
      if (level(p) > 20000) continue;
      if (cleanDistractors(p.y0, candidates(p)).length >= 2) return p;
    }
  },

  stem: (p) =>
    `A consumer's utility from $x$ units of food and $y$ units of clothing is $U(x, y) = ${utilityLatex(p)}$. Bundle A has $x = ${num(p.x1)}$ and $y = ${num(p.y1)}$. Bundle B has $x = ${num(p.x0)}$. How many units of clothing must bundle B contain to lie on the same indifference curve as A?`,

  answer: (p) => ({ kind: 'numeric', value: p.y0, decimals: 0 }),

  steps(p) {
    const u = level(p);
    const yPow = p.b === 1 ? 'y' : `y^${p.b}`;
    const xPow = p.a === 1 ? num(p.x0) : `${num(p.x0)}^${p.a}`;
    const steps: Step[] = [
      {
        text: 'Find the level of the indifference curve through A.',
        latex: `\\bar U = U(${num(p.x1)}, ${num(p.y1)}) = ${num(p.x1)}${p.a === 1 ? '' : `^${p.a}`} \\cdot ${num(p.y1)}${p.b === 1 ? '' : `^${p.b}`} = ${num(u)}`,
        why: 'Every bundle on the same indifference curve gives the same utility, the utility of A.',
        result: u,
      },
      {
        text: "Put B's amount of food into U = Ū and divide.",
        latex: `${xPow} \\cdot ${yPow} = ${num(u)} \\;\\Rightarrow\\; ${yPow} = \\dfrac{${num(u)}}{${num(p.x0 ** p.a)}} = ${num(u / p.x0 ** p.a)}`,
        why: 'The utility is a product, so the unknown factor is the level divided by the known factor.',
        result: u / p.x0 ** p.a,
      },
    ];
    if (p.b === 2) {
      steps.push({
        text: 'Take the square root to undo the power 2.',
        latex: `y = \\sqrt{${num(u / p.x0 ** p.a)}} = ${num(p.y0)}`,
        why: 'Quantities are positive, so only the positive root makes sense.',
        result: p.y0,
      });
    }
    steps.push({
      text: 'Check that B gives the same utility as A.',
      latex: `U(${num(p.x0)}, ${num(p.y0)}) = ${num(p.x0 ** p.a * p.y0 ** p.b)} = \\bar U`,
      why: `B has ${p.x0 < p.x1 ? 'less food, so it needs more clothing' : 'more food, so it needs less clothing'} to keep the consumer equally happy.`,
    });
    return steps;
  },

  distractors: (p) => cleanDistractors(p.y0, candidates(p)),
};
