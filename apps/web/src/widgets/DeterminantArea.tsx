import { useState } from 'react';
import { Area, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

/** First column of A, fixed: the matrix of worked example 3 of LA104 is [3 −1; −1 2]. */
export const FIRST_COLUMN: [number, number] = [3, -1];

/** Square units on both axes: 10 units across and 6.54 up, the shape of the plot area. */
const FRAME = { xMin: -3.5, xMax: 6.5, yMin: -3.04, yMax: 3.5 };

/** det A = a11·a22 − a12·a21 for A = [3 a12; −1 a22]. */
export function determinant(a12: number, a22: number): number {
  const [a11, a21] = FIRST_COLUMN;
  return a11 * a22 - a12 * a21;
}

/** The image of the unit square: corners 0, column 1, column 1 + column 2, column 2. */
export function parallelogram(a12: number, a22: number): [number, number][] {
  const [a11, a21] = FIRST_COLUMN;
  return [
    [0, 0],
    [a11, a21],
    [a11 + a12, a21 + a22],
    [a12, a22],
  ];
}

/** The area of a polygon by the shoelace formula, signed (positive when the corners turn anticlockwise). */
export function signedArea(points: [number, number][]): number {
  let twice = 0;
  points.forEach(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length] ?? [0, 0];
    twice += x1 * y2 - x2 * y1;
  });
  return twice / 2;
}

export type Orientation = 'kept' | 'flipped' | 'flat';

export function orientation(det: number): Orientation {
  if (Math.abs(det) < 1e-9) return 'flat';
  return det > 0 ? 'kept' : 'flipped';
}

/** The caption: area, orientation and what det A says about the system Ax = d. */
export function describeDeterminant(a12: number, a22: number): string {
  const det = determinant(a12, a22);
  const [a11, a21] = FIRST_COLUMN;
  const par = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
  const area = `The columns of A are (${fmt(a11)}, ${fmt(a21)}), green, and (${fmt(a12)}, ${fmt(a22)}), lilac with the solid dot. A sends the sides of the dashed unit square to them, so the square becomes the gold parallelogram with area |det A| = |${par(a11)}·${par(a22)} − ${par(a12)}·${par(a21)}| = ${fmt(Math.abs(det))}.`;
  const turn = {
    kept: ' det A > 0: the orientation is kept (from the first column to the second is an anticlockwise turn).',
    flipped:
      ' det A < 0: the square is flipped over (from the first column to the second is a clockwise turn).',
    flat: ' det A = 0: the two columns lie on one line and the square is squashed flat.',
  }[orientation(det)];
  const system =
    orientation(det) === 'flat'
      ? ' So Ax = d has no solution or infinitely many, and Cramer’s rule cannot be used.'
      : ' So Ax = d has exactly one solution for every right-hand side d.';
  return area + turn + system;
}

/** LA104: move the second column of a 2×2 matrix and watch the determinant as a signed area. */
export function DeterminantArea() {
  const [a12, setA12] = useState(-1);
  const [a22, setA22] = useState(2);
  const [a11, a21] = FIRST_COLUMN;
  const det = determinant(a12, a22);
  const corners = parallelogram(a12, a22);
  const far = corners[2] ?? [0, 0];
  const turn = orientation(det);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x" yLabel="y" xTicks={[-2, 0, 2, 4, 6]} yTicks={[-2, 2]}>
        <Area frame={FRAME} points={corners} tone="gold" />
        <Area
          frame={FRAME}
          points={[
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ]}
          tone="lilac"
        />
        <Segment frame={FRAME} from={[1, 0]} to={[1, 1]} tone="lilac" dashed />
        <Segment frame={FRAME} from={[0, 1]} to={[1, 1]} tone="lilac" dashed />
        <Segment frame={FRAME} from={[a11, a21]} to={far} tone="gold" dashed />
        <Segment frame={FRAME} from={[a12, a22]} to={far} tone="gold" dashed />
        <Segment frame={FRAME} from={[0, 0]} to={[a11, a21]} tone="green" />
        <Segment frame={FRAME} from={[0, 0]} to={[a12, a22]} tone="lilac" />
        <Dot frame={FRAME} x={a11} y={a21} hollow />
        <Dot frame={FRAME} x={a12} y={a22} />
      </Plot>
      <Slider
        label="Top-right entry a₁₂"
        value={a12}
        min={-3}
        max={3}
        step={0.5}
        onChange={setA12}
      />
      <Slider
        label="Bottom-right entry a₂₂"
        value={a22}
        min={-2}
        max={3}
        step={0.5}
        onChange={setA22}
      />
      <Readout
        items={[
          ['det A (signed area)', fmt(det)],
          ['Orientation', turn],
          ['Unique solution', turn === 'flat' ? 'no' : 'yes'],
        ]}
      />
      <figcaption>{describeDeterminant(a12, a22)}</figcaption>
    </figure>
  );
}
