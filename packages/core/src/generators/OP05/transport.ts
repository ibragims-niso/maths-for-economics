import type { Rng } from '../../engine/rng';
import { num } from '../format';

/** Shipping plan or cost table: rows = sources, columns = destinations. */
export type Table = number[][];

/** Integer totals: the answer is a whole number of money units. */
export const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

export const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);

/** Σ cᵢⱼxᵢⱼ: the total cost of a shipping plan. */
export function totalCost(plan: Table, cost: Table): number {
  return plan.reduce((s, row, i) => s + row.reduce((t, x, j) => t + x * (cost[i]?.[j] ?? 0), 0), 0);
}

const zeros = (m: number, n: number): Table => Array.from({ length: m }, () => Array(n).fill(0));

/**
 * North-west corner rule: start in the top-left cell, ship as much as possible, then move right
 * when the column (destination) is satisfied or down when the row (source) is used up.
 */
export function northWest(supply: readonly number[], demand: readonly number[]): Table {
  const plan = zeros(supply.length, demand.length);
  const s = [...supply];
  const d = [...demand];
  let i = 0;
  let j = 0;
  while (i < s.length && j < d.length) {
    const x = Math.min(s[i] ?? 0, d[j] ?? 0);
    (plan[i] as number[])[j] = x;
    s[i] = (s[i] ?? 0) - x;
    d[j] = (d[j] ?? 0) - x;
    if (s[i] === 0) i++;
    else j++;
  }
  return plan;
}

/**
 * Least-cost method: repeatedly fill the cheapest cell whose row and column are both still open.
 * Ties go to the earlier row, then the earlier column.
 */
export function leastCost(
  supply: readonly number[],
  demand: readonly number[],
  cost: Table,
): Table {
  const plan = zeros(supply.length, demand.length);
  const s = [...supply];
  const d = [...demand];
  for (;;) {
    let best: [number, number] | undefined;
    for (let i = 0; i < s.length; i++) {
      for (let j = 0; j < d.length; j++) {
        if ((s[i] ?? 0) <= 0 || (d[j] ?? 0) <= 0) continue;
        const c = cost[i]?.[j] ?? Number.POSITIVE_INFINITY;
        if (!best || c < (cost[best[0]]?.[best[1]] ?? Number.POSITIVE_INFINITY)) best = [i, j];
      }
    }
    if (!best) return plan;
    const [i, j] = best;
    const x = Math.min(s[i] ?? 0, d[j] ?? 0);
    (plan[i] as number[])[j] = x;
    s[i] = (s[i] ?? 0) - x;
    d[j] = (d[j] ?? 0) - x;
  }
}

/** The cells with a shipment, as [row, column] pairs (0-based), row by row. */
export function basicCells(plan: Table): [number, number][] {
  const cells: [number, number][] = [];
  plan.forEach((row, i) => {
    row.forEach((x, j) => {
      if (x > 0) cells.push([i, j]);
    });
  });
  return cells;
}

/**
 * Potentials of the potentials (MODI) method: uᵢ + vⱼ = cᵢⱼ on every cell of `cells`, with u₁ = 0.
 * Needs m + n − 1 cells that link every row and column (a non-degenerate plan).
 */
export function potentials(
  cells: readonly [number, number][],
  cost: Table,
  m: number,
  n: number,
): { u: number[]; v: number[]; trace: PotentialStep[] } {
  const u: (number | undefined)[] = Array(m).fill(undefined);
  const v: (number | undefined)[] = Array(n).fill(undefined);
  const trace: PotentialStep[] = [];
  u[0] = 0;
  for (let changed = true; changed; ) {
    changed = false;
    for (const [i, j] of cells) {
      const c = cost[i]?.[j] ?? 0;
      const ui = u[i];
      const vj = v[j];
      if (ui !== undefined && vj === undefined) {
        v[j] = c - ui;
        trace.push({ kind: 'v', i, j, value: c - ui });
        changed = true;
      } else if (ui === undefined && vj !== undefined) {
        u[i] = c - vj;
        trace.push({ kind: 'u', i, j, value: c - vj });
        changed = true;
      }
    }
  }
  if (u.some((x) => x === undefined) || v.some((x) => x === undefined)) {
    throw new Error('the cells do not link every row and column');
  }
  return { u: u as number[], v: v as number[], trace };
}

/** One potential found from a used cell (i, j): vⱼ = cᵢⱼ − uᵢ or uᵢ = cᵢⱼ − vⱼ. */
export interface PotentialStep {
  kind: 'u' | 'v';
  i: number;
  j: number;
  value: number;
}

/** The trace in LaTeX: "v_1 = 6 - 0 = 6,\ u_2 = 10 - 6 = 4, …". */
export function traceLatex(
  trace: readonly PotentialStep[],
  cost: Table,
  u: readonly number[],
  v: readonly number[],
) {
  return trace
    .map(({ kind, i, j, value }) => {
      const c = num(cost[i]?.[j] ?? 0);
      const other = kind === 'v' ? (u[i] ?? 0) : (v[j] ?? 0);
      const name = kind === 'v' ? `v_${j + 1}` : `u_${i + 1}`;
      const otherText = other < 0 ? `(${num(other)})` : num(other);
      return `${name} = ${c} - ${otherText} = ${num(value)}`;
    })
    .join(',\\ ');
}

/** Reduced cost (opportunity cost) of cell (i, j): cᵢⱼ − (uᵢ + vⱼ). */
export function reducedCost(
  cost: Table,
  u: readonly number[],
  v: readonly number[],
  i: number,
  j: number,
) {
  return (cost[i]?.[j] ?? 0) - (u[i] ?? 0) - (v[j] ?? 0);
}

/** True when no partial sum of supplies equals a partial sum of demands (except the totals). */
export function nonDegenerate(supply: readonly number[], demand: readonly number[]): boolean {
  const partial = (xs: readonly number[]) => xs.slice(0, -1).map((_, k) => sum(xs.slice(0, k + 1)));
  const ps = partial(supply);
  return partial(demand).every((x) => !ps.includes(x));
}

/** The settings the problems are told in: who ships what to whom. */
export type Context = 'cement' | 'shops' | 'oil';

export const CONTEXTS: Readonly<
  Record<
    Context,
    {
      /** Letters for the sources and the destinations in the table, e.g. P₁ and S₁. */
      src: string;
      dst: string;
      srcName: [one: string, many: string];
      dstName: [one: string, many: string];
      unit: string;
      intro: string;
    }
  >
> = {
  cement: {
    src: 'P',
    dst: 'S',
    srcName: ['plant', 'plants'],
    dstName: ['site', 'sites'],
    unit: 'tonnes',
    intro: 'A cement producer ships cement from its plants to construction sites.',
  },
  shops: {
    src: 'W',
    dst: 'S',
    srcName: ['warehouse', 'warehouses'],
    dstName: ['shop', 'shops'],
    unit: 'pallets',
    intro: 'A retailer delivers goods from its warehouses to its shops.',
  },
  oil: {
    src: 'T',
    dst: 'R',
    srcName: ['terminal', 'terminals'],
    dstName: ['refinery', 'refineries'],
    unit: 'thousand barrels',
    intro: 'Crude oil is shipped from port terminals to refineries.',
  },
};

/**
 * The transportation table in LaTeX: unit costs inside, supplies on the right, demands at the
 * bottom. With `plan`, a used cell shows its shipment in brackets after the cost, e.g. "5\,(30)".
 */
export function tableauLatex(
  context: Context,
  supply: readonly number[],
  demand: readonly number[],
  cost: Table,
  plan?: Table,
): string {
  const { src, dst } = CONTEXTS[context];
  const head = ` & ${demand.map((_, j) => `${dst}_${j + 1}`).join(' & ')} & \\text{supply}`;
  const rows = cost.map((row, i) => {
    const cells = row.map((c, j) => {
      const x = plan?.[i]?.[j] ?? 0;
      return x > 0 ? `${num(c)}\\,(${num(x)})` : num(c);
    });
    return `${src}_${i + 1} & ${cells.join(' & ')} & ${num(supply[i] ?? 0)}`;
  });
  const foot = `\\text{demand} & ${demand.map((d) => num(d)).join(' & ')} & ${num(sum(demand))}`;
  return `\\begin{array}{c|${'c'.repeat(demand.length)}|c} ${head} \\\\ \\hline ${rows.join(' \\\\ ')} \\\\ \\hline ${foot} \\end{array}`;
}

/** Whole numbers from `from` to `to` in steps of `step`. */
export const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, k) => from + k * step);

/** "x_{11} = 30" style list of the shipments of a plan. */
export function shipmentsLatex(plan: Table): string {
  return basicCells(plan)
    .map(([i, j]) => `x_{${i + 1}${j + 1}} = ${num(plan[i]?.[j] ?? 0)}`)
    .join(',\\ ');
}

/** The sum Σ cᵢⱼxᵢⱼ written out over the used cells, e.g. "4 \cdot 30 + 6 \cdot 20". */
export function costSumLatex(plan: Table, cost: Table): string {
  return basicCells(plan)
    .map(([i, j]) => `${num(cost[i]?.[j] ?? 0)} \\cdot ${num(plan[i]?.[j] ?? 0)}`)
    .join(' + ');
}

/** `count` different whole numbers from lo to hi (a partial shuffle, so no draw is wasted). */
export function distinctInts(rng: Rng, count: number, lo: number, hi: number): number[] {
  const pool = range(lo, hi);
  for (let k = 0; k < count; k++) {
    const r = rng.int(k, pool.length - 1);
    [pool[k], pool[r]] = [pool[r] as number, pool[k] as number];
  }
  return pool.slice(0, count);
}

/** A cost table of m rows and n columns with all entries different, from lo to hi. */
export function drawCosts(rng: Rng, m: number, n: number, lo = 2, hi = 15): Table {
  const flat = distinctInts(rng, m * n, lo, hi);
  return Array.from({ length: m }, (_, i) => flat.slice(i * n, (i + 1) * n));
}

/**
 * Balanced supplies and demands in tens, each from 20 to 90; null when the last demand falls
 * outside that range or the north-west corner plan would be degenerate.
 */
export function drawAmounts(
  rng: Rng,
  m: number,
  n: number,
): { supply: number[]; demand: number[] } | null {
  const supply = Array.from({ length: m }, () => 10 * rng.int(2, 9));
  const demand = Array.from({ length: n - 1 }, () => 10 * rng.int(2, 9));
  const last = sum(supply) - sum(demand);
  if (last < 20 || last > 90) return null;
  demand.push(last);
  return nonDegenerate(supply, demand) ? { supply, demand } : null;
}

/**
 * The cheapest plan when there are only two sources. With x₂ⱼ = bⱼ − x₁ⱼ the cost is
 * Σ c₂ⱼbⱼ + Σ (c₁ⱼ − c₂ⱼ)x₁ⱼ, so source 1 serves first the destinations where it is relatively
 * cheapest (smallest c₁ⱼ − c₂ⱼ), as much as each one needs, until its supply is used up.
 */
export function twoSourceOptimum(
  supply: readonly number[],
  demand: readonly number[],
  cost: Table,
): { plan: Table; order: number[]; diff: number[] } {
  const diff = demand.map((_, j) => (cost[0]?.[j] ?? 0) - (cost[1]?.[j] ?? 0));
  const order = demand.map((_, j) => j).sort((p, q) => (diff[p] ?? 0) - (diff[q] ?? 0) || p - q);
  const first = demand.map(() => 0);
  let left = supply[0] ?? 0;
  for (const j of order) {
    const x = Math.min(left, demand[j] ?? 0);
    first[j] = x;
    left -= x;
  }
  return { plan: [first, demand.map((d, j) => d - (first[j] ?? 0))], order, diff };
}
