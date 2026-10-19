import { useState } from 'react';
import { eigenvalues2, eigenvector2, type Mat2 } from './EigenDirections';
import { Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

const EPS = 1e-9;

// The plot area is 266 × 174 pixels; one unit is the same length on both axes, so the slopes
// of the eigenvector lines on the screen are their true slopes.
const Y_HALF = 6;
const X_HALF = (Y_HALF * 266) / 174;
const FRAME = { xMin: -X_HALF, xMax: X_HALF, yMin: -Y_HALF, yMax: Y_HALF };

// Topic DY05, Example 2: gaps of inflation π and unemployment u, π̇ = aπ − 0.2u, u̇ = 0.1π + du.
const B = -0.2;
const C = 0.1;
/** Example 2 starts at π = 3, u = −2 (a boom); the other paths start at mirror-image points. */
export const STARTS: Vec[] = [
  [3, -2],
  [-3, 2],
  [7, 3],
  [-7, -3],
];

export type PortraitKind =
  | 'stable node'
  | 'unstable node'
  | 'saddle'
  | 'stable focus'
  | 'unstable focus'
  | 'centre'
  | 'borderline';

/** The type of the steady state of ẋ = Ax from the trace, the determinant and tr² − 4 det. */
export function classify(m: Mat2): PortraitKind {
  const t = m.a + m.d;
  const det = m.a * m.d - m.b * m.c;
  if (Math.abs(det) < EPS) return 'borderline';
  if (det < 0) return 'saddle';
  if (t * t - 4 * det >= -EPS) return t < 0 ? 'stable node' : 'unstable node';
  if (Math.abs(t) < EPS) return 'centre';
  return t < 0 ? 'stable focus' : 'unstable focus';
}

/** ẋ = Ax at the point x. */
export const flow = (m: Mat2, x: Vec): Vec => [m.a * x[0] + m.b * x[1], m.c * x[0] + m.d * x[1]];

/** One classical Runge–Kutta step of length h. */
function rk4(m: Mat2, x: Vec, h: number): Vec {
  const k1 = flow(m, x);
  const k2 = flow(m, [x[0] + (h / 2) * k1[0], x[1] + (h / 2) * k1[1]]);
  const k3 = flow(m, [x[0] + (h / 2) * k2[0], x[1] + (h / 2) * k2[1]]);
  const k4 = flow(m, [x[0] + h * k3[0], x[1] + h * k3[1]]);
  return [
    x[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    x[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
  ];
}

const STEP = 0.1;

/** The state at time T from x(0), with fixed steps of 0.1 (time in years). */
export function stateAt(m: Mat2, start: Vec, T: number): Vec {
  let x = start;
  const n = Math.round(T / STEP);
  for (let k = 0; k < n; k++) x = rk4(m, x, STEP);
  return x;
}

/**
 * The path from `start` for up to 80 years, as points about 0.2 apart. It stops early when it
 * leaves the picture or has settled at the steady state.
 */
export function phasePath(m: Mat2, start: Vec): Vec[] {
  const points: Vec[] = [start];
  let x = start;
  let last = start;
  for (let k = 0; k < 800; k++) {
    x = rk4(m, x, STEP);
    if (Math.abs(x[0]) > 1.5 * X_HALF || Math.abs(x[1]) > 1.5 * Y_HALF) {
      points.push(x);
      break;
    }
    if (Math.hypot(x[0] - last[0], x[1] - last[1]) >= 0.2) {
      points.push(x);
      last = x;
    }
    if (Math.hypot(x[0], x[1]) < 0.05) break;
  }
  if (points[points.length - 1] !== x) points.push(x);
  return points;
}

/** The pieces of the paths from all four starting points, each with a stable name. */
export function pathSegments(m: Mat2): { id: string; from: Vec; to: Vec }[] {
  return STARTS.flatMap((s, k) => {
    const path = phasePath(m, s);
    return path.slice(1).map((to, i) => ({ id: `${k}-${i}`, from: path[i] ?? s, to }));
  });
}

/** The real eigenvector directions as unit vectors with their λ (none for complex λ). */
export function eigenLines(m: Mat2): { lambda: number; dir: Vec }[] {
  const e = eigenvalues2(m);
  if (e.kind === 'complex') return [];
  const values = Math.abs(e.values[0] - e.values[1]) < EPS ? [e.values[0]] : e.values;
  return values.map((lambda) => {
    const v = eigenvector2(m, lambda);
    const r = Math.hypot(v[0], v[1]);
    return { lambda, dir: [v[0] / r, v[1] / r] as Vec };
  });
}

const vecText = (v: Vec) => `(${fmt(v[0])}, ${fmt(v[1])})`;

/** "(1, −1) for λ = −0.2 and (2, −1) for λ = −0.3": each eigenvector, scaled to whole numbers when it can be. */
export function eigenText(m: Mat2, lines: { lambda: number }[]): string {
  return lines
    .map(({ lambda }) => {
      let v = eigenvector2(m, lambda);
      // (1, −0.5) reads better as (2, −1).
      const twice: Vec = [2 * v[0], 2 * v[1]];
      if (
        !Number.isInteger(Number(v[1].toFixed(6))) &&
        Number.isInteger(Number(twice[1].toFixed(6)))
      )
        v = twice;
      return `${vecText(v)} for λ = ${fmt(lambda, 3)}`;
    })
    .join(' and ');
}

/** An arrow from `from` to `to`: the shaft and two short barbs. */
function Arrow({ from, to, tone }: { from: Vec; to: Vec; tone: 'lilac' | 'gold' }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const r = Math.hypot(dx, dy);
  if (r < 0.02) return null;
  const along: Vec = [dx / r, dy / r];
  const head = Math.min(0.32, r / 2);
  const back: Vec = [to[0] - along[0] * head, to[1] - along[1] * head];
  const side: Vec = [-along[1] * head * 0.6, along[0] * head * 0.6];
  return (
    <>
      <Segment frame={FRAME} from={from} to={to} tone={tone} />
      <Segment frame={FRAME} from={[back[0] + side[0], back[1] + side[1]]} to={to} tone={tone} />
      <Segment frame={FRAME} from={[back[0] - side[0], back[1] - side[1]]} to={to} tone={tone} />
    </>
  );
}

const GRID: Vec[] = [];
for (let x = -8; x <= 8; x += 2) {
  for (let y = -5; y <= 5; y += 2) GRID.push([x, y]);
}

const CAPTION: Record<PortraitKind, string> = {
  'stable node':
    'Both eigenvalues are real and negative (det > 0, tr < 0 and tr² ≥ 4 det): every path runs into the steady state without circling round it, and near the end it comes in along the green line of the eigenvalue closer to 0, the slower one.',
  'unstable node':
    'Both eigenvalues are real and positive: every path leaves the steady state without circling, in the end along the green line of the larger eigenvalue.',
  saddle:
    'det < 0, so the eigenvalues are real with opposite signs: a saddle. Only paths that start exactly on the green line of the negative eigenvalue, the stable arm, reach the steady state; every other path is pushed away along the other green line.',
  'stable focus':
    'tr² < 4 det, so the eigenvalues are complex and paths circle round the steady state. Their real part tr/2 is negative, so the circles shrink: damped cycles of inflation and unemployment.',
  'unstable focus':
    'tr² < 4 det, so the eigenvalues are complex and paths circle round the steady state. Their real part tr/2 is positive, so the circles grow: cycles that get bigger and bigger.',
  centre:
    'tr = 0 and det > 0: the eigenvalues are purely imaginary, so paths go round closed loops for ever. The cycles neither die out nor grow.',
  borderline:
    'det = 0: one eigenvalue is 0, so a whole line of points are rest points and a path that is pushed off one does not come back to it. The steady state is not stable.',
};

/** DY05: the phase portrait of ẋ = Ax for the gaps of inflation and unemployment. */
export function LinearPhasePortrait() {
  const [a, setA] = useState(-0.4);
  const [d, setD] = useState(-0.1);
  const m: Mat2 = { a, b: B, c: C, d };
  const t = a + d;
  const det = a * d - B * C;
  const kind = classify(m);
  const e = eigenvalues2(m);
  const lines = eigenLines(m);
  const far = 3 * X_HALF;

  const valuesText =
    e.kind === 'complex'
      ? `${fmt(e.re, 3)} ± ${fmt(e.im, 3)}i`
      : lines.length === 1
        ? `${fmt(e.values[0], 3)} (twice)`
        : `${fmt(e.values[0], 3)} and ${fmt(e.values[1], 3)}`;

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="π gap" yLabel="u gap" xTicks={[-8, -4, 4, 8]} yTicks={[-4, 4]}>
        {lines.map(({ dir, lambda }) => (
          <Segment
            key={`line${lambda}`}
            frame={FRAME}
            from={[-far * dir[0], -far * dir[1]]}
            to={[far * dir[0], far * dir[1]]}
            tone="green"
            dashed
          />
        ))}
        {GRID.map((x) => {
          const v = flow(m, x);
          const r = Math.hypot(v[0], v[1]);
          if (r < EPS) return null;
          const len = 0.75;
          return (
            <Arrow
              key={`f${x[0]},${x[1]}`}
              from={x}
              to={[x[0] + (len * v[0]) / r, x[1] + (len * v[1]) / r]}
              tone="lilac"
            />
          );
        })}
        {pathSegments(m).map(({ id, from, to }) => (
          <Segment key={id} frame={FRAME} from={from} to={to} tone="gold" />
        ))}
        <Dot frame={FRAME} x={0} y={0} />
        <Dot frame={FRAME} x={STARTS[0]?.[0] ?? 0} y={STARTS[0]?.[1] ?? 0} hollow />
      </Plot>
      <Slider
        label="Inflation's own effect a"
        value={a}
        min={-0.5}
        max={0.5}
        step={0.05}
        onChange={setA}
      />
      <Slider
        label="Unemployment's own effect d"
        value={d}
        min={-0.5}
        max={0.5}
        step={0.05}
        onChange={setD}
      />
      <Readout
        items={[
          ['tr A, det A', `${fmt(t, 3)}, ${fmt(det, 4)}`],
          ['Eigenvalues', valuesText],
          ['Steady state', kind],
        ]}
      />
      <figcaption>
        Gaps of inflation π and unemployment u from their long-run values, with π̇ = {fmt(a)}π − 0.2u
        and u̇ = 0.1π {d < 0 ? '−' : '+'} {fmt(Math.abs(d))}u (Example 2 has a = −0.4 and d = −0.1).
        The lilac arrows show which way the economy moves from each point, and the gold curves are
        paths from four starting points; the hollow dot is Example 2's start, π = 3 and u = −2.{' '}
        {lines.length > 0 &&
          `The green dashed lines are the eigenvector directions: ${eigenText(m, lines)}. `}
        {CAPTION[kind]} The steady state is stable exactly when tr A &lt; 0 and det A &gt; 0.
      </figcaption>
    </figure>
  );
}
