import { useState } from 'react';
import { Dot, fmt, Note, Plot, Readout, Segment, Slider, sx, sy } from './kit';

// Topic DO03, Example 1: a haulier's route from depot S to market T through two stages of towns.
export const NAMES = ['S', 'A', 'B', 'C', 'D', 'T'] as const;
/** Roads of Example 1 as [from, to, cost]; the slider replaces the cost of S → B (index 1). */
export const ROADS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [0, 2, 4],
  [1, 3, 8],
  [1, 4, 4],
  [2, 3, 3],
  [2, 4, 1],
  [3, 5, 3],
  [4, 5, 6],
];
export const SB = 1;
const T = 5;

const roadsWith = (sb: number) => ROADS.map(([i, j, c], k) => [i, j, k === SB ? sb : c] as const);

/**
 * Backward induction: V[i] is the least cost from town i to T, worked out from T backwards
 * (towns are numbered so that every road goes to a higher number).
 */
export function valueFunction(sb: number): number[] {
  const roads = roadsWith(sb);
  const V = NAMES.map(() => Number.POSITIVE_INFINITY);
  V[T] = 0;
  for (let i = T - 1; i >= 0; i--) {
    for (const [from, to, c] of roads) if (from === i) V[i] = Math.min(V[i] ?? 0, c + (V[to] ?? 0));
  }
  return V;
}

/** Every cheapest route from S to T, written as letters ("SBCT"). */
export function bestRoutes(sb: number): string[] {
  const roads = roadsWith(sb);
  const V = valueFunction(sb);
  const out: string[] = [];
  const walk = (path: number[]) => {
    const i = path[path.length - 1] ?? 0;
    if (i === T) {
      out.push(path.map((k) => NAMES[k]).join(''));
      return;
    }
    for (const [from, to, c] of roads)
      if (from === i && c + (V[to] ?? 0) === V[i]) walk([...path, to]);
  };
  walk([0]);
  return out;
}

/** The myopic route: always the cheapest road out of the current town (no ties for 3 ≤ S→B ≤ 10). */
export function greedyRoute(sb: number): { route: string; cost: number } {
  const roads = roadsWith(sb);
  let i = 0;
  let cost = 0;
  const path = [0];
  while (i !== T) {
    const out = roads.filter(([from]) => from === i);
    const [, to, c] = out.reduce((a, b) => (b[2] < a[2] ? b : a));
    cost += c;
    i = to;
    path.push(i);
  }
  return { route: path.map((k) => NAMES[k]).join(''), cost };
}

/** What the student should notice for a given cost of S → B. */
export function describeRoute(sb: number): string {
  const V = valueFunction(sb)[0] ?? 0;
  const g = greedyRoute(sb);
  const start =
    'Each town shows V, the least cost still to pay from there to T, found backwards from T. Gold roads form the cheapest route.';
  if (V < g.cost)
    return `${start} The cheapest first road, S → A, leads into dear roads later: going via B costs ${fmt(V)}, ${fmt(g.cost - V)} less than the greedy ${fmt(g.cost)}. Bellman's rule V(S) = min(2 + V(A), ${fmt(sb)} + V(B)) sees this because V(A) and V(B) already price the rest of the trip.`;
  if (bestRoutes(sb).length > 1)
    return `${start} At S → B = 6 both first roads give 12: 2 + V(A) = 2 + 10 and 6 + V(B) = 6 + 6, so the haulier is indifferent.`;
  return `${start} Now S → B is so dear that going via A is best after all, and the greedy route happens to be optimal too. V(A) and V(B) did not change: only the choice at S did.`;
}

const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 6 };
/** Where each town is drawn. */
const POS: [number, number][] = [
  [1, 3],
  [3.6, 4.7],
  [3.6, 1.3],
  [6.4, 4.7],
  [6.4, 1.3],
  [9.2, 3],
];
/** Where each road's cost goes, as a fraction of the way along it, and a nudge in maths units. */
const COST_AT: [t: number, dx: number, dy: number][] = [
  [0.5, -0.3, 0.25],
  [0.5, -0.3, -0.55],
  [0.5, 0, 0.25],
  [0.28, 0.35, -0.05],
  [0.28, 0.35, -0.2],
  [0.5, 0, -0.55],
  [0.5, 0.3, 0.25],
  [0.5, 0.3, -0.55],
];
const R = 9; // gap left around a town, in pixels

/** A shortened arrow from town i to town j, with a two-stroke head, in maths units. */
function arrow(i: number, j: number) {
  const [x1, y1] = POS[i] ?? [0, 0];
  const [x2, y2] = POS[j] ?? [0, 0];
  const kx = sx(FRAME, 1) - sx(FRAME, 0);
  const ky = sy(FRAME, 0) - sy(FRAME, 1);
  const dx = (x2 - x1) * kx;
  const dy = (y2 - y1) * ky;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const at = (px: number, py: number): [number, number] => [px / kx, py / ky];
  const [ax, ay] = at(ux * R, uy * R);
  const from: [number, number] = [x1 + ax, y1 + ay];
  const to: [number, number] = [x2 - ax, y2 - ay];
  const head = (turn: number): [number, number] => {
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    const [hx, hy] = at(-(ux * c - uy * s) * 7, -(ux * s + uy * c) * 7);
    return [to[0] + hx, to[1] + hy];
  };
  return { from, to, left: head(0.5), right: head(-0.5) };
}

/** DO03: change the cost of the road S → B and watch the values V and the cheapest route. */
export function HaulierRouteBellman() {
  const [sb, setSb] = useState(4);
  const V = valueFunction(sb);
  const best = bestRoutes(sb);
  const onBest = (i: number, j: number) => best.some((r) => r.includes(`${NAMES[i]}${NAMES[j]}`));
  const greedy = greedyRoute(sb);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="" yLabel="">
        {roadsWith(sb).map(([i, j, c], k) => {
          const a = arrow(i, j);
          const tone = onBest(i, j) ? 'gold' : 'lilac';
          const [x1, y1] = POS[i] ?? [0, 0];
          const [x2, y2] = POS[j] ?? [0, 0];
          const [t, dx, dy] = COST_AT[k] ?? [0.5, 0, 0];
          return (
            <g key={`${i}${j}`}>
              <Segment frame={FRAME} from={a.from} to={a.to} tone={tone} />
              <Segment frame={FRAME} from={a.left} to={a.to} tone={tone} />
              <Segment frame={FRAME} from={a.right} to={a.to} tone={tone} />
              <Note
                frame={FRAME}
                x={x1 + (x2 - x1) * t + dx}
                y={y1 + (y2 - y1) * t + dy}
                anchor="middle"
              >
                {fmt(c)}
              </Note>
            </g>
          );
        })}
        {NAMES.map((name, i) => {
          const [x, y] = POS[i] ?? [0, 0];
          const hollow = !best.some((r) => r.includes(name));
          // The depot and the market sit between two roads: name above, value below.
          if (i === 0 || i === T)
            return (
              <g key={name}>
                <Dot frame={FRAME} x={x} y={y} hollow={hollow} />
                <Note frame={FRAME} x={x} y={y + 0.5} anchor="middle">
                  {name}
                </Note>
                <Note frame={FRAME} x={i === T ? x + 0.3 : x} y={y - 0.95} anchor="middle">
                  V={fmt(V[i] ?? 0)}
                </Note>
              </g>
            );
          return (
            <g key={name}>
              <Dot frame={FRAME} x={x} y={y} hollow={hollow} />
              <Note frame={FRAME} x={x} y={y > 3 ? y + 0.55 : y - 0.85} anchor="middle">
                {name} · V={fmt(V[i] ?? 0)}
              </Note>
            </g>
          );
        })}
      </Plot>
      <Slider label="Cost of road S → B" value={sb} min={3} max={10} onChange={setSb} />
      <Readout
        items={[
          ['Least cost V(S)', fmt(V[0] ?? 0)],
          ['Cheapest route', best.join(', ')],
          ['Greedy route', `${greedy.route} · ${fmt(greedy.cost)}`],
        ]}
      />
      <figcaption>{describeRoute(sb)}</figcaption>
    </figure>
  );
}
