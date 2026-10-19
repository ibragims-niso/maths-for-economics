import type { Rng } from '../../engine/rng';

/** Whole numbers of days: accept only the exact value. */
export const WHOLE = { tolerance: 0.01, relTolerance: 0 } as const;

export const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/**
 * A project network, activity on node. Activities are numbered in an order where every
 * predecessor comes first; the last activity is the only one with no successor (it ends the project).
 */
export interface Network {
  /** Duration of each activity (days). */
  duration: number[];
  /** Indices of the activities that must finish before each one can start. */
  preds: number[][];
}

export const successors = (net: Network, i: number) =>
  net.preds.flatMap((ps, j) => (ps.includes(i) ? [j] : []));

/** Earliest start and finish of every activity, and the project duration T = largest EF. */
export function forwardPass(net: Network) {
  const es: number[] = [];
  const ef: number[] = [];
  net.duration.forEach((d, i) => {
    const start = Math.max(0, ...(net.preds[i] ?? []).map((j) => ef[j] ?? 0));
    es.push(start);
    ef.push(start + d);
  });
  return { es, ef, total: Math.max(...ef) };
}

/**
 * Latest finish and start of every activity that keep the project at T. With `merge = 'max'` it
 * makes the classic mistake of taking the largest successor LS instead of the smallest.
 */
export function backwardPass(net: Network, total: number, merge: 'min' | 'max' = 'min') {
  const n = net.duration.length;
  const lf = new Array<number>(n).fill(total);
  const ls = new Array<number>(n).fill(total);
  for (let i = n - 1; i >= 0; i--) {
    const next = successors(net, i).map((j) => ls[j] ?? total);
    lf[i] = next.length === 0 ? total : merge === 'min' ? Math.min(...next) : Math.max(...next);
    ls[i] = (lf[i] ?? total) - (net.duration[i] ?? 0);
  }
  return { ls, lf };
}

/** Total float LS − ES of every activity. */
export function totalFloats(net: Network) {
  const { es, total } = forwardPass(net);
  const { ls } = backwardPass(net, total);
  return ls.map((l, i) => l - (es[i] ?? 0));
}

/** Free float: how far an activity can slip without delaying the earliest start of any successor. */
export function freeFloat(net: Network, i: number) {
  const { es, ef, total } = forwardPass(net);
  const next = successors(net, i).map((j) => es[j] ?? 0);
  return (next.length === 0 ? total : Math.min(...next)) - (ef[i] ?? 0);
}

/** Every chain of activities from one with no predecessor to the final activity. */
export function allPaths(net: Network): number[][] {
  const out: number[][] = [];
  const walk = (i: number, path: number[]) => {
    const next = successors(net, i);
    if (next.length === 0) out.push(path);
    for (const j of next) walk(j, [...path, j]);
  };
  net.preds.forEach((ps, i) => {
    if (ps.length === 0) walk(i, [i]);
  });
  return out;
}

export const pathLength = (net: Network, path: number[]) =>
  path.reduce((s, i) => s + (net.duration[i] ?? 0), 0);

export const pathName = (path: number[]) => path.map((i) => NAMES[i]).join('');

/** True when `a` can be reached from `b` through precedence (a must finish before b starts). */
function isAncestor(net: Network, a: number, b: number): boolean {
  return (net.preds[b] ?? []).some((p) => p === a || isAncestor(net, a, p));
}

/**
 * A random network of 5–7 activities with durations 1–9 and one final activity, or null to try
 * again. No predecessor is listed twice in effect: if X comes before Y, an activity that follows Y
 * does not list X too.
 */
export function drawNetwork(rng: Rng): Network | null {
  const n = rng.int(5, 7);
  const starts = rng.int(1, 2);
  const preds: number[][] = [];
  /** Activities with no successor yet. */
  const open = new Set<number>();
  for (let i = 0; i < n - 1; i++) {
    if (i < starts) {
      preds.push([]);
    } else {
      // The first predecessor is an activity still waiting for a successor, when there is one.
      const waiting = [...open];
      const set = new Set<number>([waiting.length > 0 ? rng.pick(waiting) : rng.int(0, i - 1)]);
      if (i >= 2 && rng.int(0, 1) === 1) set.add(rng.int(0, i - 1));
      preds.push([...set].sort((a, b) => a - b));
    }
    for (const j of preds[i] ?? []) open.delete(j);
    open.add(i);
  }
  // The final activity follows everything that is still open, so it is the only end.
  if (open.size > 3) return null;
  preds.push([...open].sort((a, b) => a - b));
  const net: Network = { duration: Array.from({ length: n }, () => rng.int(1, 9)), preds };
  // No redundant precedence: listed predecessors are not ancestors of each other.
  for (const ps of preds) {
    for (const a of ps) for (const b of ps) if (a !== b && isAncestor(net, a, b)) return null;
  }
  return net;
}

/** "A (4 days; first)", "C (6 days; after A)", ... for a question stem. */
export function precedenceList(net: Network): string {
  return net.duration
    .map((d, i) => {
      const ps = net.preds[i] ?? [];
      const after =
        ps.length === 0 ? 'can start at once' : `after ${ps.map((j) => NAMES[j]).join(' and ')}`;
      return `${NAMES[i]} (${d} ${d === 1 ? 'day' : 'days'}, ${after})`;
    })
    .join('; ');
}
