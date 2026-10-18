import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { at, colLatex, det, factor, inverse, type Matrix, matLatex, times } from './matrix';

interface Params {
  /** Coefficients of the linked markets: own-price effects on the diagonal, cross effects ≤ 0 off it. */
  A: Matrix;
  /** The equilibrium prices, whole numbers; drawn first, then b = A p. */
  prices: number[];
  /** Which price is asked for, counting from 0. */
  k: number;
}

/** The price is a whole number, so a value off by more than a rounding slip is wrong. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const rhs = (p: Params) => times(p.A, p.prices);
/** A⁻¹ rounded to the 2 decimals shown in the stem (it is exact by construction). */
const inv = (p: Params) => inverse(p.A).map((row) => row.map((x) => round(x, 2)));
const isWhole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;

/** Own-price effects on the diagonal, cross effects off it (2-market models are always linked). */
const OWN = [2, 3, 4, 5, 6];
const CROSS: Record<2 | 3, number[]> = { 2: [-1, -2, -3], 3: [0, -1, -2] };

/**
 * Every coefficient matrix the generator may use: own-price effects dominate cross effects (each
 * row adds up to more than 0, so the model is stable and A⁻¹ ≥ 0), and every entry of A⁻¹ is
 * exact to 2 decimals, so the stem can show it exactly. Built once, then cached.
 */
const MODELS: Partial<Record<2 | 3, Matrix[]>> = {};
export function models(n: 2 | 3): Matrix[] {
  const cached = MODELS[n];
  if (cached) return cached;
  const cells = n * n;
  const found: Matrix[] = [];
  const fill = (flat: number[]) => {
    if (flat.length === cells) {
      const A = Array.from({ length: n }, (_, i) => flat.slice(i * n, i * n + n));
      if (A.some((row) => row.reduce((s, x) => s + x, 0) <= 0)) return;
      // Every market is linked to at least one other one.
      if (A.some((row, i) => row.every((x, j) => i === j || x === 0))) return;
      if (det(A) <= 0) return;
      if (inverse(A).every((row) => row.every((x) => isWhole(x * 100) && x >= 0))) found.push(A);
      return;
    }
    const c = flat.length;
    for (const x of Math.floor(c / n) === c % n ? OWN : CROSS[n]) fill([...flat, x]);
  };
  fill([]);
  MODELS[n] = found;
  return found;
}

const candidates = (p: Params): Distractor[] => {
  const b = rhs(p);
  const Ainv = inv(p);
  return [
    // b written as a row on the left: column k of A⁻¹ instead of row k.
    {
      value: round(
        b.reduce((s, bi, i) => s + bi * at(Ainv, i, p.k), 0),
        2,
      ),
      mistakeCode: 'WRONG_ORDER',
    },
    { value: round(times(p.A, b)[p.k] ?? 0, 2), mistakeCode: 'USED_A' },
    { value: round((b[p.k] ?? 0) / at(p.A, p.k, p.k), 2), mistakeCode: 'IGNORED_OTHER_MARKET' },
  ];
};

const kept = (p: Params) =>
  cleanDistractors(p.prices[p.k] ?? 0, candidates(p), EXACT.tolerance, EXACT.relTolerance);

const GOODS = ['P_1', 'P_2', 'P_3'] as const;

/** LA105, difficulty 2: one equilibrium price of 2 or 3 linked markets from p = A⁻¹b, with A⁻¹ given. */
export const equilibriumPricesInverse: Generator<Params> = {
  id: 'equilibrium-prices-inverse',
  title: 'Equilibrium prices with an inverse',
  topicId: 'LA105',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const A = rng.pick(models(rng.int(2, 3) === 2 ? 2 : 3));
      const prices = A.map(() => rng.int(5, 60));
      const p: Params = { A, prices, k: rng.int(0, A.length - 1) };
      // The demand-side terms b are positive, and every mistake gives its own wrong price.
      if (rhs(p).some((bi) => bi < 5)) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem(p) {
    const n = p.A.length;
    const names = GOODS.slice(0, n).join(', ');
    return `The equilibrium prices $p = (${names})$ of ${n === 2 ? 'two' : 'three'} linked markets solve $Ap = b$ with $A = ${matLatex(p.A)}$ and $b = ${colLatex(rhs(p))}$. An analyst has already found $A^{-1} = ${matLatex(inv(p))}$. Find the equilibrium price $${GOODS[p.k]}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: p.prices[p.k] ?? 0, decimals: 2, ...EXACT }),

  steps(p) {
    const b = rhs(p);
    const row = inv(p)[p.k] ?? [];
    const price = p.prices[p.k] ?? 0;
    const name = GOODS[p.k] ?? 'P';
    const Arow = p.A[p.k] ?? [];
    return [
      {
        text: 'Multiply both sides of Ap = b by the inverse.',
        latex: 'A^{-1}Ap = A^{-1}b \\;\\Rightarrow\\; p = A^{-1}b',
        why: 'A⁻¹A = I and Ip = p, so the inverse turns the whole system into one multiplication.',
      },
      {
        text: `Multiply row ${p.k + 1} of A⁻¹ by the column b.`,
        latex: `${name} = ${row.map((x, j) => `${num(x)} \\cdot ${factor(b[j] ?? 0)}`).join(' + ')} = ${num(price)}`,
        why: `Entry ${p.k + 1} of a product A⁻¹b uses row ${p.k + 1} of A⁻¹ and the whole of b, matched entry by entry.`,
        result: price,
      },
      {
        text: `Check: with all the prices p = (${p.prices.map((x) => num(x)).join(', ')}), equation ${p.k + 1} of Ap = b holds.`,
        latex: `${Arow.map((x, j) => `${factor(x)} \\cdot ${num(p.prices[j] ?? 0)}`).join(' + ')} = ${num(b[p.k] ?? 0)}`,
        why: 'Substituting the solution back into the original equation is a quick test that no entry was misread.',
      },
    ];
  },

  distractors: (p) => kept(p),
};
