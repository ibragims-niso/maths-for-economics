import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Whole-number returns: accept only the exact value. */
const WHOLE = { tolerance: 0.01, relTolerance: 0 } as const;

interface Params {
  /** Budget in whole units (millions). */
  units: number;
  /** returns[j][u]: extra annual income from u units in region j; returns[j][0] = 0. */
  returns: number[][];
}

const REGIONS = ['A', 'B', 'C'];

const r = (p: Params, j: number, u: number) => p.returns[j]?.[u] ?? 0;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Every split (a, b, c) of the whole budget, with its total return. */
function splits(p: Params) {
  const out: { units: number[]; total: number }[] = [];
  for (let a = 0; a <= p.units; a++)
    for (let b = 0; a + b <= p.units; b++) {
      const c = p.units - a - b;
      out.push({ units: [a, b, c], total: r(p, 0, a) + r(p, 1, b) + r(p, 2, c) });
    }
  return out;
}

const bestTotal = (p: Params) => Math.max(...splits(p).map((s) => s.total));

/** One unit at a time to the region with the largest extra return; null if a step is a tie. */
function greedy(p: Params): number | null {
  const given = [0, 0, 0];
  let total = 0;
  for (let k = 0; k < p.units; k++) {
    const gains = given.map((u, j) => r(p, j, u + 1) - r(p, j, u));
    const m = Math.max(...gains);
    if (gains.filter((g) => g === m).length > 1) return null;
    const j = gains.indexOf(m);
    given[j] = (given[j] ?? 0) + 1;
    total += m;
  }
  return total;
}

const candidates = (p: Params) => [
  { value: greedy(p) ?? Number.NaN, mistakeCode: 'GREEDY_UNIT' },
  { value: Math.max(...range(3).map((j) => r(p, j, p.units))), mistakeCode: 'ALL_IN_ONE' },
  {
    value: range(3).reduce((s, j) => s + r(p, j, p.units), 0),
    mistakeCode: 'IGNORE_BUDGET',
  },
];

/** f₂(x): the best return from x units shared between regions B and C, and the units B gets. */
function stageTwo(p: Params, x: number) {
  const options = range(x + 1).map((u) => r(p, 1, u) + r(p, 2, x - u));
  const value = Math.max(...options);
  return { options, value, toB: options.indexOf(value) };
}

/** DO03, difficulty 2: the best total return from sharing whole units of a budget among three regions. */
export const dpBudgetAllocationBestReturn: Generator<Params> = {
  id: 'dp-budget-allocation-best-return',
  title: 'Best way to share a budget among three regions',
  topicId: 'DO03',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const units = rng.int(3, 5);
      const returns = range(3).map(() => {
        let total = 0;
        return [0, ...range(units).map(() => (total += rng.int(1, 9)))];
      });
      const p: Params = { units, returns };
      const best = bestTotal(p);
      // One best split, which neither "one unit at a time" nor "everything in one region" finds.
      if (splits(p).filter((s) => s.total === best).length !== 1) continue;
      const g = greedy(p);
      if (g === null || g === best) continue;
      if (Math.max(...range(3).map((j) => r(p, j, units))) === best) continue;
      if (cleanDistractors(best, candidates(p), WHOLE.tolerance, WHOLE.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem(p) {
    const rows = range(p.units + 1)
      .map(
        (u) =>
          `${u} & ${range(3)
            .map((j) => num(r(p, j, u)))
            .join(' & ')}`,
      )
      .join(' \\\\ ');
    const table = `\\begin{array}{c|ccc} \\text{units} & ${REGIONS.map((n) => `\\text{${n}}`).join(' & ')} \\\\ \\hline ${rows} \\end{array}`;
    return `A development fund has ${p.units} (million) to invest in regions A, B and C, in whole millions. The table gives the extra annual income (million) produced by each number of units invested in each region: $${table}$ What is the largest total extra income the fund can achieve?`;
  },

  answer: (p) => ({ kind: 'numeric', value: bestTotal(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const n = p.units;
    const f2 = range(n + 1).map((x) => stageTwo(p, x));
    const firstOptions = range(n + 1).map((u) => r(p, 0, u) + (f2[n - u]?.value ?? 0));
    const best = Math.max(...firstOptions);
    const toA = firstOptions.indexOf(best);
    const rest = n - toA;
    const toB = f2[rest]?.toB ?? 0;
    const toC = rest - toB;
    return [
      {
        text: 'Last stage, region C on its own: whatever is left goes to C.',
        latex: `f_3(x) = r_C(x):\\; ${range(n + 1)
          .map((x) => num(r(p, 2, x)))
          .join(',\\ ')} \\quad (x = 0, \\dots, ${n})`,
        why: 'With one region left there is no choice: every remaining unit goes there, so the value of x units is just C’s return.',
      },
      {
        text: 'Stage 2, regions B and C together: for each budget x, try every amount u for B and give the rest to C.',
        latex: range(n + 1)
          .map((x) => `f_2(${x}) = ${num(f2[x]?.value ?? 0)}`)
          .join(',\\; '),
        why: 'f₂(x) = max over u of r_B(u) + f₃(x − u). Whatever B gets, the best use of the rest is already known, so only these sums need comparing.',
      },
      {
        text: 'Stage 1, region A: try every amount u for A and give the rest to B and C in the best way.',
        latex: `f_1(${n}) = \\max(${firstOptions.map((v) => num(v)).join(',\\ ')}) = ${num(best)}`,
        why: 'f₁(N) = max over u of r_A(u) + f₂(N − u): each term is A’s return plus the best possible return from the units left over.',
        result: best,
      },
      {
        text: 'Read the plan forwards.',
        latex: `\\text{A}: ${toA},\\ \\text{B}: ${toB},\\ \\text{C}: ${toC}: \\quad ${num(r(p, 0, toA))} + ${num(r(p, 1, toB))} + ${num(r(p, 2, toC))} = ${num(best)}`,
        why: 'The amount for A comes from the best term at stage 1; the stage-2 table then says how to split the rest between B and C.',
        result: r(p, 0, toA) + r(p, 1, toB) + r(p, 2, toC),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(bestTotal(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};
