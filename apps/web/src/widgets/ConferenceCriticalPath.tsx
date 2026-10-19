import { useState } from 'react';
import { Dot, fmt, Note, Plot, Readout, Segment, Slider, sx, sy } from './kit';

// Topic OP07, Example 2: organising a conference (durations in weeks, activity on node).
export const NAMES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
/** Durations of Example 2; the slider replaces C (index 2). */
export const BASE_DURATION = [4, 3, 6, 2, 5, 3] as const;
/** Predecessors of each activity. */
export const PREDS: readonly (readonly number[])[] = [[], [], [0], [0], [1, 3], [2, 4]];
export const C = 2;

const successors = (i: number) => PREDS.flatMap((ps, j) => (ps.includes(i) ? [j] : []));

/** Forward and backward pass for a given duration of C. */
export function schedule(c: number) {
  const d = BASE_DURATION.map((x, i) => (i === C ? c : x));
  const es: number[] = [];
  const ef: number[] = [];
  d.forEach((di, i) => {
    es[i] = Math.max(0, ...(PREDS[i] ?? []).map((j) => ef[j] ?? 0));
    ef[i] = (es[i] ?? 0) + di;
  });
  const total = Math.max(...ef);
  const ls: number[] = [];
  const lf: number[] = [];
  for (let i = d.length - 1; i >= 0; i--) {
    const next = successors(i).map((j) => ls[j] ?? total);
    lf[i] = next.length === 0 ? total : Math.min(...next);
    ls[i] = (lf[i] ?? total) - (d[i] ?? 0);
  }
  const float = ls.map((l, i) => l - (es[i] ?? 0));
  return { duration: d, es, ef, ls, lf, float, total };
}

/** Every chain from an activity with no predecessor to the final activity F. */
export function chains(): number[][] {
  const out: number[][] = [];
  const walk = (path: number[]) => {
    const last = path[path.length - 1] ?? 0;
    const next = successors(last);
    if (next.length === 0) out.push(path);
    for (const j of next) walk([...path, j]);
  };
  PREDS.forEach((ps, i) => {
    if (ps.length === 0) walk([i]);
  });
  return out;
}

/** The chains with the largest total duration, written as letters ("ADEF"). */
export function criticalPaths(c: number): string[] {
  const { duration, total } = schedule(c);
  return chains()
    .filter((p) => p.reduce((s, i) => s + (duration[i] ?? 0), 0) === total)
    .map((p) => p.map((i) => NAMES[i]).join(''));
}

/** What happens to the project as catering (C) gets longer. */
export function describeCatering(c: number): string {
  const s = schedule(c);
  const tf = s.float[C] ?? 0;
  const start =
    'Gold dots and arrows form the critical path; hollow dots have float. Each node shows the activity, its duration in weeks and its total float.';
  if (tf > 0)
    return `${start} Catering has ${fmt(tf)} ${tf === 1 ? 'week' : 'weeks'} of float: it can grow to 7 weeks before the conference date moves, because the chain A–D–E takes 11 weeks before F can start.`;
  if (s.total === 14)
    return `${start} At 7 weeks catering has no float left: both A–C–F and A–D–E–F take 14 weeks, so a delay on either chain now delays the conference.`;
  return `${start} Catering is now on the only critical path: every extra week of catering adds a week to the project, which now takes ${fmt(s.total)} weeks instead of 14.`;
}

const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 6 };
/** Where each activity is drawn. */
const POS: [number, number][] = [
  [1.2, 4],
  [1.2, 1.2],
  [5.2, 4],
  [4.2, 2.6],
  [6.6, 1.2],
  [9, 2.6],
];
/** Where each node's two-line label goes: offset of the first line and text anchor. */
const LABEL: [dx: number, dy: number, anchor: 'start' | 'middle' | 'end'][] = [
  [0, 0.95, 'middle'],
  [0, 0.95, 'middle'],
  [0, 0.95, 'middle'],
  [-0.35, -0.3, 'end'],
  [0, -0.6, 'middle'],
  [0, 1.3, 'middle'],
];
const R = 9; // gap left around a node, in pixels

/** A shortened arrow from node i to node j, with a two-stroke head, in maths units. */
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
    const [hx, hy] = at(-(ux * c - uy * s) * 8, -(ux * s + uy * c) * 8);
    return [to[0] + hx, to[1] + hy];
  };
  return { from, to, left: head(0.5), right: head(-0.5) };
}

/** OP07: drag the duration of catering and watch the critical path and the float change. */
export function ConferenceCriticalPath() {
  const [c, setC] = useState(6);
  const s = schedule(c);
  const crit = (i: number) => (s.float[i] ?? 0) === 0;
  const edges = PREDS.flatMap((ps, j) => ps.map((i) => [i, j] as const));

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="" yLabel="">
        {edges.map(([i, j]) => {
          const a = arrow(i, j);
          // An arrow is critical when both ends are critical and there is no gap between them.
          const tone = crit(i) && crit(j) && s.ef[i] === s.es[j] ? 'gold' : 'lilac';
          return (
            <g key={`${i}${j}`}>
              <Segment frame={FRAME} from={a.from} to={a.to} tone={tone} />
              <Segment frame={FRAME} from={a.left} to={a.to} tone={tone} />
              <Segment frame={FRAME} from={a.right} to={a.to} tone={tone} />
            </g>
          );
        })}
        {NAMES.map((name, i) => {
          const [x, y] = POS[i] ?? [0, 0];
          const [dx, dy, anchor] = LABEL[i] ?? [0, 0, 'middle'];
          return (
            <g key={name}>
              <Dot frame={FRAME} x={x} y={y} hollow={!crit(i)} />
              <Note frame={FRAME} x={x + dx} y={y + dy} anchor={anchor}>
                {name} · {fmt(s.duration[i] ?? 0)}
              </Note>
              <Note frame={FRAME} x={x + dx} y={y + dy - 0.5} anchor={anchor}>
                float {fmt(s.float[i] ?? 0)}
              </Note>
            </g>
          );
        })}
      </Plot>
      <Slider label="Catering C (weeks)" value={c} min={1} max={12} onChange={setC} />
      <Readout
        items={[
          ['Project duration', `${fmt(s.total)} weeks`],
          ['Critical path', criticalPaths(c).join(', ')],
          ['Float of C', `${fmt(s.float[C] ?? 0)} wk`],
        ]}
      />
      <figcaption>{describeCatering(c)}</figcaption>
    </figure>
  );
}
