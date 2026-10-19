import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT } from './region';

interface Params {
  /** Cost of each project (thousands), multiples of 10. */
  cost: number[];
  /** Net present value of each project (thousands). */
  npv: number[];
  budget: number;
}

const NAMES = ['A', 'B', 'C', 'D', 'E'];

const members = (n: number, mask: number) =>
  Array.from({ length: n }, (_, i) => i).filter((i) => (mask >> i) & 1);
const sum = (xs: number[], idx: number[]) => idx.reduce((s, i) => s + (xs[i] ?? 0), 0);

/** Every affordable selection, as a list of project indices, with its cost and NPV. */
function affordable(p: Params) {
  const n = p.cost.length;
  const out: { idx: number[]; cost: number; npv: number }[] = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    const idx = members(n, mask);
    const c = sum(p.cost, idx);
    if (c <= p.budget) out.push({ idx, cost: c, npv: sum(p.npv, idx) });
  }
  return out;
}

/** Affordable selections that leave no room for another project: the only real candidates. */
function full(p: Params) {
  const n = p.cost.length;
  return affordable(p).filter((s) =>
    Array.from({ length: n }, (_, i) => i).every(
      (i) => s.idx.includes(i) || s.cost + (p.cost[i] ?? 0) > p.budget,
    ),
  );
}

const best = (p: Params) => Math.max(...affordable(p).map((s) => s.npv));

/** Funds projects in the given order, skipping any that no longer fits. */
function greedy(p: Params, order: number[]) {
  let left = p.budget;
  let total = 0;
  for (const i of order) {
    const c = p.cost[i] ?? 0;
    if (c <= left) {
      left -= c;
      total += p.npv[i] ?? 0;
    }
  }
  return total;
}

const indices = (p: Params) => p.cost.map((_, i) => i);
const byNpv = (p: Params) => indices(p).sort((i, j) => (p.npv[j] ?? 0) - (p.npv[i] ?? 0));
const byRatio = (p: Params) =>
  indices(p).sort(
    (i, j) => (p.npv[j] ?? 0) * (p.cost[i] ?? 0) - (p.npv[i] ?? 0) * (p.cost[j] ?? 0),
  );

/** The LP relaxation: best ratio first, then a fraction of the first project that does not fit. */
function relaxation(p: Params) {
  let left = p.budget;
  let total = 0;
  for (const i of byRatio(p)) {
    const c = p.cost[i] ?? 0;
    const v = p.npv[i] ?? 0;
    if (c <= left) {
      left -= c;
      total += v;
    } else {
      total += (v * left) / c;
      break;
    }
  }
  return total;
}

const candidates = (p: Params) => [
  { value: greedy(p, byNpv(p)), mistakeCode: 'GREEDY_LARGEST_NPV' },
  { value: greedy(p, byRatio(p)), mistakeCode: 'GREEDY_BEST_RATIO' },
  { value: round(relaxation(p), 2), mistakeCode: 'FRACTIONAL_PROJECT' },
];

const label = (idx: number[]) =>
  idx.length === 0 ? '\\varnothing' : `\\{${idx.map((i) => NAMES[i]).join(', ')}\\}`;

/** OP06, difficulty 2: the largest total NPV from whole projects that fit a budget (a knapsack). */
export const projectSelectionBestNpv: Generator<Params> = {
  id: 'project-selection-best-npv',
  title: 'Best set of projects under a budget',
  topicId: 'OP06',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const n = rng.int(4, 5);
      const k = Array.from({ length: n }, () => rng.int(2, 9));
      const cost = k.map((x) => 10 * x);
      const npv = k.map((x) => rng.int(x, 4 * x));
      const total = cost.reduce((s, c) => s + c, 0);
      const budget = 10 * Math.round((total * (0.4 + 0.3 * rng.next())) / 10);
      const p: Params = { cost, npv, budget };
      // Different NPVs and different NPV-to-cost ratios make each greedy rule unambiguous.
      if (new Set(npv).size < n) continue;
      const sameRatio = indices(p).some((i) =>
        indices(p).some(
          (j) => i < j && (npv[i] ?? 0) * (cost[j] ?? 0) === (npv[j] ?? 0) * (cost[i] ?? 0),
        ),
      );
      if (sameRatio) continue;
      if (Math.max(...cost) > budget || total <= budget) continue;
      // A single best selection, which the "largest NPV first" rule misses.
      const top = best(p);
      if (affordable(p).filter((s) => s.npv === top).length !== 1) continue;
      if (greedy(p, byNpv(p)) === top) continue;
      if (full(p).length > 6) continue;
      if (cleanDistractors(top, candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 2)
        continue;
      return p;
    }
  },

  stem(p) {
    const list = p.cost
      .map((c, i) => `${NAMES[i]}: cost $${num(c)}$, NPV $${num(p.npv[i] ?? 0)}$`)
      .join('; ');
    return `A firm can fund some of ${p.cost.length} investment projects (in thousands), each in full or not at all. ${list}. The budget is $${num(p.budget)}$. What is the largest total NPV the firm can reach?`;
  },

  answer: (p) => ({ kind: 'numeric', value: best(p), decimals: 0, ...EXACT }),

  steps(p) {
    const n = p.cost.length;
    const vars = Array.from({ length: n }, (_, i) => `x_${NAMES[i]}`);
    const objective = vars.map((v, i) => `${num(p.npv[i] ?? 0)}${v}`).join(' + ');
    const budget = vars.map((v, i) => `${num(p.cost[i] ?? 0)}${v}`).join(' + ');
    const options = full(p).sort((s, t) => t.npv - s.npv);
    const top = options[0];
    return [
      {
        text: 'Give each project a yes/no variable and write the problem.',
        latex: `\\max\\; ${objective} \\quad\\text{s.t.}\\quad ${budget} \\le ${num(p.budget)},\\; x_i \\in \\{0, 1\\}`,
        why: 'xᵢ = 1 means "fund project i" and xᵢ = 0 means "do not". A project cannot be half-funded, so a fraction is not allowed.',
      },
      {
        text: 'List the affordable selections that leave no room for another project, with their cost and NPV.',
        latex: options
          .map((s) => `${label(s.idx)}: ${num(s.cost)},\\ ${num(s.npv)}`)
          .join(';\\quad '),
        why: 'Every NPV is positive, so a selection that could still take another project is beaten by adding it. With so few projects, checking these selections one by one is quick and certain.',
      },
      {
        text: 'The selection with the largest NPV is the answer.',
        latex: `${label(top?.idx ?? [])}: \\text{NPV} = ${num(best(p))}`,
        why: 'Simple rules such as "largest NPV first" or "best NPV per unit of cost first" can leave budget unused in an awkward amount; only the full comparison is guaranteed to find the best whole-project plan.',
        result: best(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(best(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
