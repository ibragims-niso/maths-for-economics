import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

// The plot area is 266 × 174 pixels; one unit is the same length on both axes, so the
// directions on the screen are the true directions of the vectors.
const Y_HALF = 5.5;
const X_HALF = (Y_HALF * 266) / 174;
const FRAME = { xMin: -X_HALF, xMax: X_HALF, yMin: -Y_HALF, yMax: Y_HALF };

// Topic LA201, Example 1: asset A pays a = (2, 1) and asset B pays b = (3, 4).
const A: Vec = [2, 1];

/** The determinant of the 2×2 matrix with a and b as its columns, a₁b₂ − b₁a₂. */
export const det2 = (a: Vec, b: Vec) => a[0] * b[1] - b[0] * a[1];

/** The rank of [a b]: 2 if the vectors are independent, 1 if they lie on one line, 0 if both are zero. */
export function rank2(a: Vec, b: Vec): 0 | 1 | 2 {
  if (Math.abs(det2(a, b)) > 1e-9) return 2;
  return [...a, ...b].some((x) => x !== 0) ? 1 : 0;
}

/** Coordinates (c₁, c₂) of x in the basis {a, b}, so that x = c₁a + c₂b; null when {a, b} is not a basis. */
export function coordinatesIn(a: Vec, b: Vec, x: Vec): Vec | null {
  const d = det2(a, b);
  if (Math.abs(d) < 1e-9) return null;
  return [(b[1] * x[0] - b[0] * x[1]) / d, (-a[1] * x[0] + a[0] * x[1]) / d];
}

const add = (u: Vec, v: Vec, s = 1): Vec => [u[0] + s * v[0], u[1] + s * v[1]];
const len = (u: Vec) => Math.hypot(u[0], u[1]);

/** An arrow from the origin to `tip`: the shaft and two short barbs. */
function Arrow({ tip, tone }: { tip: Vec; tone: 'green' | 'gold' }) {
  if (len(tip) === 0) return null;
  const along: Vec = [tip[0] / len(tip), tip[1] / len(tip)];
  const across: Vec = [-along[1], along[0]];
  const head = Math.min(0.5, len(tip) / 2);
  const back = add(tip, along, -head);
  return (
    <>
      <Segment frame={FRAME} from={[0, 0]} to={tip} tone={tone} />
      <Segment frame={FRAME} from={add(back, across, head * 0.5)} to={tip} tone={tone} />
      <Segment frame={FRAME} from={add(back, across, -head * 0.5)} to={tip} tone={tone} />
    </>
  );
}

/** LA201: two vectors in the plane; together they span the whole plane, unless they line up. */
export function SpanAndBasis() {
  const [b1, setB1] = useState(3);
  const [b2, setB2] = useState(4);
  const b: Vec = [b1, b2];
  const d = det2(A, b);
  const rank = rank2(A, b);
  const far = 3 * X_HALF;
  const unitA: Vec = [A[0] / len(A), A[1] / len(A)];
  // A label next to each arrow's tip, a little to its left, so it stays readable when the arrows line up.
  const label = (v: Vec): Vec => {
    if (len(v) === 0) return v;
    const along: Vec = [v[0] / len(v), v[1] / len(v)];
    return add(add(v, along, 0.3), [-along[1], along[0]], 0.6);
  };
  const la = label(A);
  const lb = label(b);

  const said =
    rank === 2
      ? `a and b point in different directions, so det = ${fmt(d)} ≠ 0 and they are linearly independent. Their combinations s·a + t·b reach every point of the plane: they span ℝ² and form a basis. The shaded parallelogram has area |det| = ${fmt(Math.abs(d))}.`
      : b1 === 0 && b2 === 0
        ? 'b is the zero vector, so det = 0: any set that contains the zero vector is dependent. The span is only the dashed line through a, rank 1.'
        : `b = ${fmt(b1 / A[0])}·a lies on the same line as a, so det = 0 and the vectors are linearly dependent. Every combination s·a + t·b stays on the dashed line: the span is a line, the rank is 1, and b adds nothing new.`;

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="recession" yLabel="boom" xTicks={[-6, -3, 3, 6]} yTicks={[-4, 4]}>
        {rank === 2 ? (
          <Area frame={FRAME} points={[[0, 0], A, add(A, b), b]} tone="lilac" />
        ) : (
          <Segment
            frame={FRAME}
            from={add([0, 0], unitA, -far)}
            to={add([0, 0], unitA, far)}
            tone="lilac"
            dashed
          />
        )}
        <Arrow tip={A} tone="green" />
        <Arrow tip={b} tone="gold" />
        <Note frame={FRAME} x={la[0]} y={la[1] - 0.2} anchor="middle">
          a
        </Note>
        {len(b) > 0 && (
          <Note frame={FRAME} x={lb[0]} y={lb[1] - 0.2} anchor="middle">
            b
          </Note>
        )}
      </Plot>
      <Slider
        label="First entry of b, b₁"
        value={b1}
        min={-4}
        max={4}
        step={0.5}
        onChange={setB1}
      />
      <Slider
        label="Second entry of b, b₂"
        value={b2}
        min={-4}
        max={4}
        step={0.5}
        onChange={setB2}
      />
      <Readout
        items={[
          ['det [a b]', fmt(d)],
          ['Rank of [a b]', String(rank)],
          ['Basis of ℝ²?', rank === 2 ? 'Yes' : 'No'],
        ]}
      />
      <figcaption>
        a = (2, 1) in green is fixed; b = ({fmt(b1)}, {fmt(b2)}) in gold moves with the sliders.{' '}
        {said}
      </figcaption>
    </figure>
  );
}
