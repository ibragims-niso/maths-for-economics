import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

// Topic MV07, Example 1: π = 56Q₁ + 68Q₂ − 2Q₁² − 3Q₂² − 2Q₁Q₂ − 200, maximum 352 at (10, 8).
const A = 56;
const B = 68;
const C = 2;
const D = 3;
const E = 2;
const F = 200;
export const BEST: Vec = [10, 8];

// The plot area is 266 × 174 pixels; one unit has the same length on both axes, so the
// gradient arrow meets the contour lines at a right angle on the screen too.
const FRAME = { xMin: 0, xMax: 20, yMin: 0, yMax: (20 * 174) / 266 };
const LEVELS = [340, 300, 200, 100];

/** Profit π(Q₁, Q₂). */
export const profit = (q1: number, q2: number) =>
  A * q1 + B * q2 - C * q1 * q1 - D * q2 * q2 - E * q1 * q2 - F;

/** The gradient (∂π/∂Q₁, ∂π/∂Q₂) = (56 − 4Q₁ − 2Q₂, 68 − 2Q₁ − 6Q₂). */
export const gradient = (q1: number, q2: number): Vec => [
  A - 2 * C * q1 - E * q2,
  B - E * q1 - 2 * D * q2,
];

/** The Hessian's determinant π₁₁π₂₂ − π₁₂² = (−4)(−6) − (−2)² and π₁₁. */
export const hessian = { p11: -2 * C, p22: -2 * D, p12: -E, det: 4 * C * D - E * E };

/**
 * The contour π = level as two curves over Q₁, from solving the profit equation for Q₂:
 * 3Q₂² + (2Q₁ − 68)Q₂ + (2Q₁² − 56Q₁ + 200 + level) = 0. Null when the level is above the top.
 */
export function contour(level: number) {
  const disc = (x: number) => (B - E * x) ** 2 - 4 * D * (C * x * x - A * x + F + level);
  // disc(x) = qa·x² + qb·x + qc; the contour spans the interval where it is not negative.
  const qa = E * E - 4 * C * D;
  const qb = -2 * B * E + 4 * D * A;
  const qc = B * B - 4 * D * (F + level);
  const inside = qb * qb - 4 * qa * qc;
  if (inside <= 0) return null;
  const r1 = (-qb + Math.sqrt(inside)) / (2 * qa);
  const r2 = (-qb - Math.sqrt(inside)) / (2 * qa);
  const root = (x: number) => Math.sqrt(Math.max(0, disc(x)));
  return {
    from: Math.min(r1, r2),
    to: Math.max(r1, r2),
    upper: (x: number) => (B - E * x + root(x)) / (2 * D),
    lower: (x: number) => (B - E * x - root(x)) / (2 * D),
  };
}

/** What the gradient at (q1, q2) tells the firm. */
export function describeGradient(q1: number, q2: number): string {
  const [g1, g2] = gradient(q1, q2);
  if (g1 === 0 && g2 === 0)
    return 'Both partial derivatives are zero: the gradient vanishes and this is the top of the hill. The Hessian test agrees: D = 20 > 0 and π₁₁ = −4 < 0, so it is a maximum.';
  const say = (g: number, good: string) =>
    g > 0
      ? `more ${good} raises profit`
      : g < 0
        ? `less ${good} raises profit`
        : `${good} is right`;
  return `Here ${say(g1, 'Q₁')} and ${say(g2, 'Q₂')}. The gold arrow, the gradient, points straight uphill, across the contour lines.`;
}

const add = (a: Vec, b: Vec, s = 1): Vec => [a[0] + s * b[0], a[1] + s * b[1]];

/** MV07: a contour map of a two-product profit with a movable point and its gradient arrow. */
export function TwoProductProfitMap() {
  const [q1, setQ1] = useState(4);
  const [q2, setQ2] = useState(4);
  const g = gradient(q1, q2);
  const size = Math.hypot(g[0], g[1]);
  // Arrow length grows with the gradient but stays inside the picture.
  const length = Math.min(4, size * 0.08);
  const along: Vec = size > 0 ? [g[0] / size, g[1] / size] : [0, 0];
  const across: Vec = [-along[1], along[0]];
  const tip = add([q1, q2], along, length);
  const head = Math.min(0.6, length * 0.4);
  const barbA = add(add(tip, along, -head), across, head * 0.5);
  const barbB = add(add(tip, along, -head), across, -head * 0.5);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="Q₁" yLabel="Q₂" xTicks={[0, 5, 10, 15, 20]} yTicks={[4, 8, 12]}>
        {LEVELS.map((level) => {
          const c = contour(level);
          if (!c) return null;
          return [
            <Curve key={`u${level}`} frame={FRAME} fn={c.upper} from={c.from} to={c.to} />,
            <Curve key={`l${level}`} frame={FRAME} fn={c.lower} from={c.from} to={c.to} />,
          ];
        })}
        <Dot frame={FRAME} x={BEST[0]} y={BEST[1]} hollow />
        <Note frame={FRAME} x={BEST[0]} y={BEST[1] + 0.75} anchor="middle">
          max
        </Note>
        {length > 0.05 && (
          <>
            <Segment frame={FRAME} from={[q1, q2]} to={tip} />
            <Segment frame={FRAME} from={barbA} to={tip} />
            <Segment frame={FRAME} from={barbB} to={tip} />
          </>
        )}
        <Dot frame={FRAME} x={q1} y={q2} />
      </Plot>
      <Slider
        label="Output of good 1, Q₁"
        value={q1}
        min={0}
        max={20}
        step={0.5}
        onChange={setQ1}
      />
      <Slider
        label="Output of good 2, Q₂"
        value={q2}
        min={0}
        max={13}
        step={0.5}
        onChange={setQ2}
      />
      <Readout
        items={[
          ['Profit π', fmt(profit(q1, q2))],
          ['∂π/∂Q₁', fmt(g[0])],
          ['∂π/∂Q₂', fmt(g[1])],
        ]}
      />
      <figcaption>
        Contour lines of π = 56Q₁ + 68Q₂ − 2Q₁² − 3Q₂² − 2Q₁Q₂ − 200 for profit 340 (the innermost
        ring), 300, 200 and 100; the hollow point is the maximum, profit 352.{' '}
        {describeGradient(q1, q2)}
      </figcaption>
    </figure>
  );
}
