import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

/** A 2×2 matrix with rows (a, b) and (c, d). */
export interface Mat2 {
  a: number;
  b: number;
  c: number;
  d: number;
}

export type Eigenvalues =
  | { kind: 'real'; values: [number, number] }
  | { kind: 'complex'; re: number; im: number };

const EPS = 1e-9;

// The plot area is 266 × 174 pixels; one unit is the same length on both axes, so the
// directions on the screen are the true directions of the vectors.
const Y_HALF = 1.6;
const X_HALF = (Y_HALF * 266) / 174;
const FRAME = { xMin: -X_HALF, xMax: X_HALF, yMin: -Y_HALF, yMax: Y_HALF };

// Topic LA202, Example 2: agriculture and industry with A = (0.6, 0.3; 0.6, 0.9).
const A11 = 0.6;
const A22 = 0.9;

/** The eigenvalues of a 2×2 matrix from λ² − (trace)λ + det = 0; the real ones larger first. */
export function eigenvalues2(m: Mat2): Eigenvalues {
  const t = m.a + m.d;
  const disc = (m.a - m.d) ** 2 + 4 * m.b * m.c;
  if (disc < -EPS) return { kind: 'complex', re: t / 2, im: Math.sqrt(-disc) / 2 };
  // A discriminant within rounding of 0 is a repeated eigenvalue.
  const s = disc > EPS ? Math.sqrt(disc) : 0;
  return { kind: 'real', values: [(t + s) / 2, (t - s) / 2] };
}

/** The spectral radius: the largest |λ|. For a complex pair |λ|² = det. */
export function spectralRadius2(m: Mat2): number {
  const e = eigenvalues2(m);
  if (e.kind === 'complex') return Math.hypot(e.re, e.im);
  return Math.max(Math.abs(e.values[0]), Math.abs(e.values[1]));
}

/** An eigenvector for the real eigenvalue λ, written (1, y) when possible and (0, 1) otherwise. */
export function eigenvector2(m: Mat2, lambda: number): Vec {
  // Row 1 of (A − λI)v = 0: (a − λ)·1 + b·y = 0.
  if (Math.abs(m.b) > EPS) return [1, (lambda - m.a) / m.b];
  // b = 0: row 2 reads c·v₁ + (d − λ)·v₂ = 0.
  if (Math.abs(m.d - lambda) > EPS) return [1, m.c / (lambda - m.d)];
  // λ = d with b = 0: either (0, 1) works or, when also c = 0 and a = d, every vector does.
  return [0, 1];
}

/** A·v. */
export const apply2 = (m: Mat2, v: Vec): Vec => [m.a * v[0] + m.b * v[1], m.c * v[0] + m.d * v[1]];

const unit = (v: Vec): Vec => {
  const r = Math.hypot(v[0], v[1]);
  return [v[0] / r, v[1] / r];
};

/** The eigen-directions of the matrix (none for complex eigenvalues), as unit vectors with their λ. */
export function eigenDirections(m: Mat2): { lambda: number; dir: Vec }[] {
  const e = eigenvalues2(m);
  if (e.kind === 'complex') return [];
  const [l1, l2] = e.values;
  if (Math.abs(l1 - l2) < EPS) {
    // A repeated eigenvalue: λI keeps every direction, anything else keeps only one.
    if (Math.abs(m.b) < EPS && Math.abs(m.c) < EPS) return [{ lambda: l1, dir: [1, 0] }];
    return [{ lambda: l1, dir: unit(eigenvector2(m, l1)) }];
  }
  return e.values.map((lambda) => ({ lambda, dir: unit(eigenvector2(m, lambda)) }));
}

const vecText = (v: Vec) => `(${fmt(v[0])}, ${fmt(v[1])})`;

/** An arrow from `from` to `to`: the shaft and two short barbs. */
function Arrow({ from, to, tone }: { from: Vec; to: Vec; tone: 'green' | 'gold' | 'lilac' }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const r = Math.hypot(dx, dy);
  if (r < 0.02) return null;
  const along: Vec = [dx / r, dy / r];
  const head = Math.min(0.09, r / 2);
  const back: Vec = [to[0] - along[0] * head, to[1] - along[1] * head];
  const side: Vec = [-along[1] * head * 0.55, along[0] * head * 0.55];
  return (
    <>
      <Segment frame={FRAME} from={from} to={to} tone={tone} />
      <Segment frame={FRAME} from={[back[0] + side[0], back[1] + side[1]]} to={to} tone={tone} />
      <Segment frame={FRAME} from={[back[0] - side[0], back[1] - side[1]]} to={to} tone={tone} />
    </>
  );
}

const CIRCLE: Vec[] = Array.from({ length: 73 }, (_, k) => {
  const t = (2 * Math.PI * k) / 72;
  return [Math.cos(t), Math.sin(t)];
});
const SAMPLES: Vec[] = Array.from({ length: 12 }, (_, k) => {
  const t = (2 * Math.PI * k) / 12 + Math.PI / 12;
  return [Math.cos(t), Math.sin(t)];
});

/** LA202: a 2×2 matrix moves every point of the unit circle; eigenvectors only get stretched. */
export function EigenDirections() {
  const [b, setB] = useState(0.3);
  const [c, setC] = useState(0.6);
  const m: Mat2 = { a: A11, b, c, d: A22 };
  const e = eigenvalues2(m);
  const rho = spectralRadius2(m);
  const dirs = eigenDirections(m);
  const far = 3 * X_HALF;

  const eigenText =
    e.kind === 'complex'
      ? `${fmt(e.re)} ± ${fmt(e.im)}i`
      : dirs.length === 1 && Math.abs(e.values[0] - e.values[1]) < EPS
        ? `${fmt(e.values[0])} (twice)`
        : `${fmt(e.values[0])} and ${fmt(e.values[1])}`;
  const dirText =
    dirs.length === 0
      ? 'none (complex λ)'
      : dirs
          .map(({ lambda }) => vecText(eigenvector2(m, lambda)))
          .filter((t, i, all) => all.indexOf(t) === i)
          .join(' and ');
  const stable = rho < 1 - EPS ? 'Yes' : rho > 1 + EPS ? 'No' : 'On the edge';

  let said: string;
  if (e.kind === 'complex') {
    said = `Here b·c is so negative that the eigenvalues are complex: no direction stays on its own line, every arrow turns, and a path of xₜ₊₁ = Axₜ circles round the origin, so it oscillates. Its size is multiplied by |λ| = ${fmt(rho, 3)} each period, so it spirals ${rho < 1 ? 'inwards: the system is stable' : 'outwards: the system is unstable'}.`;
  } else if (dirs.length === 1) {
    said = `Here the eigenvalue ${fmt(e.values[0])} is repeated and only one direction stays on its own line. Its size is ${rho < 1 - EPS ? 'below 1, so the system is stable' : 'not below 1, so the system is not stable'}.`;
  } else {
    const [first, second] = dirs;
    const big = first && Math.abs(first.lambda) >= Math.abs(second?.lambda ?? 0) ? first : second;
    said = `Here A stretches ${vecText(eigenvector2(m, first?.lambda ?? 0))} by ${fmt(first?.lambda ?? 0)} and ${vecText(eigenvector2(m, second?.lambda ?? 0))} by ${fmt(second?.lambda ?? 0)}. ${
      rho < 1 - EPS
        ? 'Both are below 1 in size, so every path of xₜ₊₁ = Axₜ shrinks to 0: the system is stable.'
        : rho > 1 + EPS
          ? `In the long run xₜ₊₁ = Axₜ grows by the factor ${fmt(rho)} a period along ${vecText(eigenvector2(m, big?.lambda ?? 0))}: the system is not stable.`
          : 'The largest has size exactly 1, so paths neither die out nor explode: the edge of stability.'
    }`;
  }

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x₁" yLabel="x₂" xTicks={[-2, -1, 1, 2]} yTicks={[-1, 1]}>
        <Area frame={FRAME} points={CIRCLE} tone="lilac" />
        <Area frame={FRAME} points={CIRCLE.map((v) => apply2(m, v))} tone="gold" />
        {dirs.map(({ dir }) => (
          <Segment
            key={`line${dir[0]}`}
            frame={FRAME}
            from={[-far * dir[0], -far * dir[1]]}
            to={[far * dir[0], far * dir[1]]}
            tone="green"
            dashed
          />
        ))}
        {[...SAMPLES, ...dirs.flatMap(({ dir }) => [dir, [-dir[0], -dir[1]] as Vec])].map((v) => (
          <Arrow key={`${v[0]},${v[1]}`} from={v} to={apply2(m, v)} tone="gold" />
        ))}
        {dirs.map(({ dir, lambda }) => {
          // Label each green line near the edge of the picture, on its right-hand half, and
          // beside the line rather than on it: shifted along the normal that points upwards.
          const s = dir[0] < 0 || (dir[0] === 0 && dir[1] < 0) ? -1 : 1;
          const u: Vec = [s * dir[0], s * dir[1]];
          const normal: Vec = [-u[1], u[0]];
          const r = Math.min(1.75, (Y_HALF - 0.2) / Math.max(Math.abs(u[1]), 0.01));
          return (
            <Note
              key={`note${lambda}`}
              frame={FRAME}
              x={u[0] * r + 0.14 * normal[0]}
              y={u[1] * r + 0.14 * normal[1]}
              anchor={normal[0] < 0 ? 'end' : 'start'}
            >
              λ = {fmt(lambda)}
            </Note>
          );
        })}
      </Plot>
      <Slider
        label="Top-right entry b"
        value={b}
        min={-0.8}
        max={0.8}
        step={0.05}
        onChange={setB}
      />
      <Slider
        label="Bottom-left entry c"
        value={c}
        min={-0.8}
        max={0.8}
        step={0.05}
        onChange={setC}
      />
      <Readout
        items={[
          ['Eigenvalues', eigenText],
          ['Eigenvector directions', dirText],
          ['Stable?', `${stable}, ρ = ${fmt(rho, 3)}`],
        ]}
      />
      <figcaption>
        A = ({fmt(A11)}, {fmt(b)}; {fmt(c)}, {fmt(A22)}). Each point v of the lilac unit circle
        moves along its gold arrow to Av, and the gold oval is where the whole circle lands. Most
        arrows turn v off its own line through the origin. An eigenvector direction is a line that A
        maps onto itself: there the arrow points straight along the line, because A only stretches v
        by the factor λ. {dirs.length > 0 && 'The green dashed lines are these directions. '}
        {said}
      </figcaption>
    </figure>
  );
}
