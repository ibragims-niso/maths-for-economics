import { useState } from 'react';
import { Curve, Dot, type Frame, fmt, Guides, Plot, Readout, Slider } from './kit';

type Mat2 = [[number, number], [number, number]];
type Vec2 = [number, number];

const FRAME: Frame = { xMin: 0, xMax: 60, yMin: 0, yMax: 60 };

// Topic LA105, Examples 1 and 2: tea 3P₁ − P₂ = 40 and coffee −P₁ + 2P₂ = 30.
const CROSS = -1;
const B2 = 30;

/** det A = a₁₁a₂₂ − a₁₂a₂₁. */
export const det2 = (A: Mat2) => A[0][0] * A[1][1] - A[0][1] * A[1][0];

/** The inverse (1/det A)(a₂₂ −a₁₂; −a₂₁ a₁₁), or null when det A = 0. */
export function inverse2(A: Mat2): Mat2 | null {
  const D = det2(A);
  if (Math.abs(D) < 1e-9) return null;
  return [
    [A[1][1] / D, -A[0][1] / D],
    [-A[1][0] / D, A[0][0] / D],
  ];
}

/** Matrix times column vector. */
export const apply2 = (A: Mat2, x: Vec2): Vec2 => [
  A[0][0] * x[0] + A[0][1] * x[1],
  A[1][0] * x[0] + A[1][1] * x[1],
];

/** The solution x = A⁻¹b of Ax = b, or null when A has no inverse. */
export function solve2(A: Mat2, b: Vec2): Vec2 | null {
  const Ai = inverse2(A);
  return Ai ? apply2(Ai, b) : null;
}

/** A no-break space, so a row of the matrix stays on one line. */
const NBSP = String.fromCharCode(160);

/** A 2×2 matrix as text, rows separated by ";": "[0.4 0.2; 0.2 0.6]". */
export const matText = (A: Mat2) =>
  `[${fmt(A[0][0])}${NBSP}${fmt(A[0][1])}; ${fmt(A[1][0])}${NBSP}${fmt(A[1][1])}]`;

/** What the caption says about the determinant and the solution. */
export function explain(A: Mat2, x: Vec2 | null): string {
  const D = det2(A);
  if (!x) {
    return 'det A = 0: the two lines are parallel, so A squashes the plane onto a line, has no inverse, and the markets have no single equilibrium.';
  }
  const off = x[0] < FRAME.xMin || x[0] > FRAME.xMax || x[1] < FRAME.yMin || x[1] > FRAME.yMax;
  const where = off ? ' The crossing is off the picture.' : '';
  if (Math.abs(D) < 1) {
    return `det A = ${fmt(D)} is close to 0: the lines are almost parallel and every entry of A⁻¹ is divided by this small number, so the inverse blows up and a small change in b moves the prices a lot.${where}`;
  }
  return `A sends x = (${fmt(x[0])}, ${fmt(x[1])}) to Ax = b. Change b₁ and the same A⁻¹ gives the new prices at once.${where}`;
}

// Both own-price effects are at least 1, so det A = a₁₁a₂₂ − 1 ≥ 0 and the prices are never negative.

/** LA105: two linked markets Ax = b; the solution x = A⁻¹b is where the two market lines cross. */
export function InverseTwoMarkets() {
  const [a11, setA11] = useState(3);
  const [a22, setA22] = useState(2);
  const [b1, setB1] = useState(40);
  const A: Mat2 = [
    [a11, CROSS],
    [CROSS, a22],
  ];
  const Ai = inverse2(A);
  const x = solve2(A, [b1, B2]);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="P₁" yLabel="P₂" xTicks={[0, 20, 40, 60]} yTicks={[20, 40, 60]}>
        {/* Tea clears: a₁₁P₁ − P₂ = b₁, so P₂ = a₁₁P₁ − b₁. */}
        <Curve frame={FRAME} fn={(p1) => a11 * p1 - b1} />
        {/* Coffee clears: −P₁ + a₂₂P₂ = 30, so P₂ = (30 + P₁)/a₂₂. */}
        <Curve frame={FRAME} fn={(p1) => (B2 + p1) / a22} tone="green" />
        {x && x[0] >= 0 && x[0] <= FRAME.xMax && x[1] >= 0 && x[1] <= FRAME.yMax && (
          <>
            <Guides frame={FRAME} x={x[0]} y={x[1]} />
            <Dot frame={FRAME} x={x[0]} y={x[1]} />
          </>
        )}
      </Plot>
      <Slider
        label="Tea own-price effect, a₁₁"
        value={a11}
        min={1}
        max={5}
        step={0.25}
        onChange={setA11}
      />
      <Slider
        label="Coffee own-price effect, a₂₂"
        value={a22}
        min={1}
        max={4}
        step={0.25}
        onChange={setA22}
      />
      <Slider
        label="Tea demand shifter, b₁"
        value={b1}
        min={20}
        max={60}
        step={5}
        onChange={setB1}
      />
      <Readout
        items={[
          ['det A', fmt(det2(A))],
          ['A⁻¹', Ai ? matText(Ai) : 'none'],
          ['x = A⁻¹b', x ? `(${fmt(x[0])}, ${fmt(x[1])})` : 'none'],
        ]}
      />
      <figcaption>
        A = [{fmt(a11)} −1; −1 {fmt(a22)}], b = ({fmt(b1)}, 30). Lilac line: prices at which the tea
        market clears; green line: the coffee market. The dot is x = A⁻¹b, where both clear.{' '}
        {explain(A, x)}
      </figcaption>
    </figure>
  );
}
