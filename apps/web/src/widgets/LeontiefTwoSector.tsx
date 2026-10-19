import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Agriculture (1) and industry (2) from topic LA106, Examples 1 and 2: A = (0.1 a₁₂; 0.2 0.4),
// final demand for agriculture 80; the student sets a₁₂ and the final demand for industry.
const A11 = 0.1;
const A21 = 0.2;
const A22 = 0.4;
const D1 = 80;
const FRAME = { xMin: 0, xMax: 4, yMin: 0, yMax: 1000 };
const BAR = [1, 2.5] as const;
const HALF_WIDTH = 0.42;
const NAMES = ['Agriculture', 'Industry'];

type Vec = [number, number];
type Mat = [Vec, Vec];

/** The coefficient matrix with the chosen a₁₂. */
export const coefficients = (a12: number): Mat => [
  [A11, a12],
  [A21, A22],
];

/** A times a vector. */
export const times = (A: Mat, v: Vec): Vec => [
  A[0][0] * v[0] + A[0][1] * v[1],
  A[1][0] * v[0] + A[1][1] * v[1],
];

/** The Leontief inverse (I − A)⁻¹ of a 2×2 A: adj(I − A) / det(I − A). */
export function leontiefInverse(A: Mat): Mat {
  const det = (1 - A[0][0]) * (1 - A[1][1]) - A[0][1] * A[1][0];
  return [
    [(1 - A[1][1]) / det, A[0][1] / det],
    [A[1][0] / det, (1 - A[0][0]) / det],
  ];
}

/** Total outputs x = (I − A)⁻¹d. */
export const outputs = (A: Mat, d: Vec): Vec => times(leontiefInverse(A), d);

/** Output multiplier of sector j: the column sum of the Leontief inverse. */
export const multiplier = (A: Mat, j: 0 | 1) => {
  const L = leontiefInverse(A);
  return L[0][j] + L[1][j];
};

/** One stacked bar from `from` to `to` (output units) at horizontal position x. */
function Block({
  x,
  from,
  to,
  tone,
}: {
  x: number;
  from: number;
  to: number;
  tone: 'lilac' | 'gold' | 'green';
}) {
  if (to - from < 0.5) return null;
  return (
    <Area
      frame={FRAME}
      tone={tone}
      points={[
        [x - HALF_WIDTH, from],
        [x + HALF_WIDTH, from],
        [x + HALF_WIDTH, to],
        [x - HALF_WIDTH, to],
      ]}
    />
  );
}

/** A line across a bar at height y, marking where one block ends. */
function Edge({ x, y, tone }: { x: number; y: number; tone: 'lilac' | 'gold' | 'green' }) {
  if (y < 0.5) return null;
  return <Segment frame={FRAME} from={[x - HALF_WIDTH, y]} to={[x + HALF_WIDTH, y]} tone={tone} />;
}

/** LA106: set industry's final demand and its input from agriculture; watch both outputs. */
export function LeontiefTwoSector() {
  const [d2, setD2] = useState(260);
  const [a12, setA12] = useState(0.2);
  const A = coefficients(a12);
  const d: Vec = [D1, d2];
  const first = times(A, d);
  const x = outputs(A, d);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="sector" yLabel="output" yTicks={[250, 500, 750]}>
        {([0, 1] as const).map((i) => {
          const at = BAR[i];
          const di = d[i];
          const ri = di + first[i];
          const xi = x[i];
          return [
            <Block key={`d${i}`} x={at} from={0} to={di} tone="lilac" />,
            <Block key={`r${i}`} x={at} from={di} to={ri} tone="gold" />,
            <Block key={`l${i}`} x={at} from={ri} to={xi} tone="green" />,
            <Edge key={`e${i}`} x={at} y={di} tone="lilac" />,
            <Edge key={`f${i}`} x={at} y={ri} tone="gold" />,
            <Edge key={`t${i}`} x={at} y={xi} tone="green" />,
            <Note key={`n${i}`} frame={FRAME} x={at} y={xi + 25} anchor="middle">
              {NAMES[i]} {fmt(xi, 0)}
            </Note>,
          ];
        })}
      </Plot>
      <Slider
        label="Final demand for industry d₂"
        value={d2}
        min={0}
        max={400}
        step={10}
        onChange={setD2}
      />
      <Slider
        label="Agricultural input per unit of industry a₁₂"
        value={a12}
        min={0}
        max={0.5}
        step={0.05}
        onChange={setA12}
      />
      <Readout
        items={[
          ['Agriculture output x₁', fmt(x[0], 1)],
          ['Industry output x₂', fmt(x[1], 1)],
          ['Industry output multiplier', fmt(multiplier(A, 1))],
        ]}
      />
      <figcaption>
        Each bar is a sector's total output. Lilac is final demand d = ({fmt(d[0])}, {fmt(d[1])}).
        Gold is the first round of inputs needed to make it, Ad = ({fmt(first[0], 1)},{' '}
        {fmt(first[1], 1)}). Making those inputs needs more inputs, and so on; all the later,
        smaller rounds are green. Added up, the rounds give x = (I − A)⁻¹d.
      </figcaption>
    </figure>
  );
}
