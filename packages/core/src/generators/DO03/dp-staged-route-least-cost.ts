import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Whole-number costs: accept only the exact value. */
const WHOLE = { tolerance: 0.01, relTolerance: 0 } as const;

interface Params {
  /** Number of towns in each middle stage, e.g. [2, 3]; the depot S comes before them, the market T after. */
  sizes: number[];
  /** cost[s][i][j]: cost of the road from node i of layer s to node j of layer s + 1 (layer 0 is S). */
  cost: number[][][];
}

const LETTERS = 'ABCDEFGHIJ';

/** Node counts of every layer, depot and market included. */
const layerSizes = (p: Params) => [1, ...p.sizes, 1];

/** Name of node i in layer s: S, then A, B, C... stage by stage, then T. */
function nodeName(p: Params, s: number, i: number): string {
  if (s === 0) return 'S';
  if (s === p.sizes.length + 1) return 'T';
  const before = p.sizes.slice(0, s - 1).reduce((a, b) => a + b, 0);
  return LETTERS[before + i] ?? '?';
}

const arc = (p: Params, s: number, i: number, j: number) => p.cost[s]?.[i]?.[j] ?? 0;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Every route from S to T as the node index in each layer, with its total cost. */
function routes(p: Params): { nodes: number[]; cost: number }[] {
  const L = layerSizes(p);
  let out = [{ nodes: [0], cost: 0 }];
  for (let s = 0; s < L.length - 1; s++) {
    out = out.flatMap((r) => {
      const i = r.nodes[r.nodes.length - 1] ?? 0;
      return range(L[s + 1] ?? 1).map((j) => ({
        nodes: [...r.nodes, j],
        cost: r.cost + arc(p, s, i, j),
      }));
    });
  }
  return out;
}

/** Backward induction: V[s][i] is the least cost from node i of layer s to T; best[s][i] the next node. */
function costToGo(p: Params) {
  const L = layerSizes(p);
  const last = L.length - 1;
  const V: number[][] = range(L.length).map(() => []);
  const best: number[][] = range(L.length).map(() => []);
  V[last] = [0];
  for (let s = last - 1; s >= 0; s--) {
    for (let i = 0; i < (L[s] ?? 1); i++) {
      const options = range(L[s + 1] ?? 1).map((j) => arc(p, s, i, j) + (V[s + 1]?.[j] ?? 0));
      const v = Math.min(...options);
      (V[s] ?? []).push(v);
      (best[s] ?? []).push(options.indexOf(v));
    }
  }
  return { V, best };
}

/** Always takes the cheapest road out of the current town; null if that choice is ever a tie. */
function greedy(p: Params): number | null {
  const L = layerSizes(p);
  let i = 0;
  let total = 0;
  for (let s = 0; s < L.length - 1; s++) {
    const out = range(L[s + 1] ?? 1).map((j) => arc(p, s, i, j));
    const m = Math.min(...out);
    if (out.filter((c) => c === m).length > 1) return null;
    total += m;
    i = out.indexOf(m);
  }
  return total;
}

const leastCost = (p: Params) => Math.min(...routes(p).map((r) => r.cost));

/** The cheapest road of each stage, added up even when those roads do not join into a route. */
const stageMinima = (p: Params) =>
  p.cost.reduce((sum, stage) => sum + Math.min(...stage.flat()), 0);

const candidates = (p: Params) => [
  { value: greedy(p) ?? Number.NaN, mistakeCode: 'GREEDY_PATH' },
  { value: Math.max(...routes(p).map((r) => r.cost)), mistakeCode: 'LONGEST_PATH' },
  { value: stageMinima(p), mistakeCode: 'STAGE_MINIMA' },
];

/** DO03, difficulty 1: least total cost through a staged network, by backward induction. */
export const dpStagedRouteLeastCost: Generator<Params> = {
  id: 'dp-staged-route-least-cost',
  title: 'Cheapest route through a staged network',
  topicId: 'DO03',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const sizes = rng
        .pick([
          [2, 2],
          [2, 3],
          [3, 2],
          [2, 2, 2],
        ] as const)
        .slice();
      const L = [1, ...sizes, 1];
      const cost = range(L.length - 1).map((s) =>
        range(L[s] ?? 1).map(() => range(L[s + 1] ?? 1).map(() => rng.int(1, 9))),
      );
      const p: Params = { sizes, cost };
      const all = routes(p);
      const best = leastCost(p);
      // One cheapest route, which the "cheapest next road" rule misses without any tie.
      if (all.filter((r) => r.cost === best).length !== 1) continue;
      const g = greedy(p);
      if (g === null || g === best) continue;
      if (cleanDistractors(best, candidates(p), WHOLE.tolerance, WHOLE.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem(p) {
    const stages = p.cost
      .map((stage, s) => {
        const roads = stage.flatMap((row, i) =>
          row.map((c, j) => `${nodeName(p, s, i)}\\to ${nodeName(p, s + 1, j)}\\ ${num(c)}`),
        );
        return `stage ${s + 1}: $${roads.join(',\\; ')}$`;
      })
      .join('; ');
    return `A haulier takes goods from depot S to market T, passing through one town in each stage. Every town in a stage is joined to every town in the next one. Road costs: ${stages}. What is the least total cost of getting from S to T?`;
  },

  answer: (p) => ({ kind: 'numeric', value: leastCost(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const L = layerSizes(p);
    const last = L.length - 1;
    const { V, best } = costToGo(p);
    const v = (s: number, i: number) => V[s]?.[i] ?? 0;
    const layer = (s: number) =>
      range(L[s] ?? 1)
        .map((i) => {
          const name = `V(${nodeName(p, s, i)})`;
          if (s === last - 1) return `${name} = ${num(v(s, i))}`;
          const terms = range(L[s + 1] ?? 1).map(
            (j) => `${num(arc(p, s, i, j))} + ${num(v(s + 1, j))}`,
          );
          return `${name} = \\min(${terms.join(',\\ ')}) = ${num(v(s, i))}`;
        })
        .join(',\\quad ');
    const steps: ReturnType<Generator<Params>['steps']> = [
      {
        text: 'Start at the last stage: from each town there is only one road left, the road to T.',
        latex: layer(last - 1),
        why: 'V(town) is the least cost still to pay from that town to the market. In the last stage there is no choice, so it is just the cost of the final road.',
      },
    ];
    for (let s = last - 2; s >= 1; s--) {
      steps.push({
        text: `Move back one stage: from each town, add each road's cost to the value of the town it leads to, and keep the smallest.`,
        latex: layer(s),
        why: 'Whichever town you go to next, the best you can do from there is already known. Only the cost of this road plus that value matters (the principle of optimality).',
      });
    }
    const route = [0];
    for (let s = 0; s < last; s++) route.push(best[s]?.[route[s] ?? 0] ?? 0);
    const names = route.map((i, s) => nodeName(p, s, i));
    const roadCosts = route.slice(1).map((j, s) => arc(p, s, route[s] ?? 0, j));
    steps.push(
      {
        text: 'Finally, the depot.',
        latex: layer(0),
        why: 'V(S) is the least cost of the whole trip: the best first road, followed by the best possible continuation.',
        result: v(0, 0),
      },
      {
        text: 'Read the route forwards, taking the road that achieved each minimum.',
        latex: `${names.join('\\to ')}: ${roadCosts.map((c) => num(c)).join(' + ')} = ${num(v(0, 0))}`,
        why: 'The backward pass stored the best next town for every town; following those choices from S gives the cheapest route, and its cost equals V(S).',
        result: roadCosts.reduce((a, b) => a + b, 0),
      },
    );
    return steps;
  },

  distractors: (p) =>
    cleanDistractors(leastCost(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};
