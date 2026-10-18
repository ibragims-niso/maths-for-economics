import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 7 };
/** Machine A, fixed: x + 2y = 8 (the intuition in LA103). */
const A1 = 1;
const A2 = 2;
const HOURS_A = 8;
/** Machine B needs 4 hours per unit of product 2; its hours per unit of product 1 and its total vary. */
const B2 = 4;

export type LinesResult =
  | { kind: 'one'; pivot: number; rhs: number; x: number; y: number }
  | { kind: 'none'; pivot: 0; rhs: number }
  | { kind: 'many'; pivot: 0; rhs: 0 };

/**
 * Solves x + 2y = 8 and a·x + 4y = c by elimination. Row 2 − a × row 1 leaves
 * (4 − 2a)·y = c − 8a: one solution if that pivot is not zero, otherwise none or infinitely many.
 */
export function solveLines(a: number, c: number): LinesResult {
  const pivot = B2 - a * A2;
  const rhs = c - a * HOURS_A;
  if (Math.abs(pivot) < 1e-9) {
    return Math.abs(rhs) < 1e-9
      ? { kind: 'many', pivot: 0, rhs: 0 }
      : { kind: 'none', pivot: 0, rhs };
  }
  const y = rhs / pivot;
  return { kind: 'one', pivot, rhs, x: (HOURS_A - A2 * y) / A1, y };
}

/** The second row after elimination, as the panel shows it: "−2y = −6" or "0 = 2". */
export function secondRow(r: LinesResult): string {
  if (r.kind !== 'one') return `0 = ${fmt(r.rhs)}`;
  const coef = r.pivot === 1 ? '' : r.pivot === -1 ? '−' : fmt(r.pivot);
  return `${coef}y = ${fmt(r.rhs)}`;
}

const inside = (x: number, y: number) =>
  x >= FRAME.xMin && x <= FRAME.xMax && y >= FRAME.yMin && y <= FRAME.yMax;

/** The caption: what the two lines and the echelon row say, with the current numbers. */
export function describeLines(a: number, c: number): string {
  const r = solveLines(a, c);
  const xTerm = a === 0 ? '' : `${a === 1 ? '' : fmt(a)}x + `;
  const lines = `The lilac line is machine A, x + 2y = ${HOURS_A}; the green line is machine B, ${xTerm}${B2}y = ${fmt(c)}.`;
  if (r.kind === 'many') {
    return `${lines} Machine B's equation is exactly 2 times machine A's, so the lines are the same line: every point on it is a solution, and the second row becomes 0 = 0 with no pivot.`;
  }
  if (r.kind === 'none') {
    return `${lines} The lines are parallel and never meet, so the second row reads 0 = ${fmt(r.rhs)}, which is impossible: no plan uses both machines' hours exactly.`;
  }
  const where = inside(r.x, r.y)
    ? 'The lines cross at one point, the only plan that uses every hour.'
    : `The lines cross at x = ${fmt(r.x)}, y = ${fmt(r.y)}, outside this window; ${r.x < 0 || r.y < 0 ? 'a negative quantity means no workable plan' : 'move the sliders to bring it back'}.`;
  return `${lines} ${where} The second row has a non-zero pivot, ${fmt(r.pivot)}, so there is exactly one solution.`;
}

/** LA103: two equations in two unknowns as two lines; one, no or infinitely many solutions. */
export function TwoLineSystem() {
  const [a, setA] = useState(3);
  const [c, setC] = useState(18);
  const r = solveLines(a, c);
  const line1 = (x: number) => (HOURS_A - A1 * x) / A2;
  const line2 = (x: number) => (c - a * x) / B2;

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x" yLabel="y" xTicks={[0, 2, 4, 6, 8, 10]} yTicks={[2, 4, 6]}>
        <Curve frame={FRAME} fn={line1} />
        <Curve frame={FRAME} fn={line2} tone="green" dashed={r.kind === 'many'} />
        <Note frame={FRAME} x={9.9} y={6.5} anchor="end">
          {r.kind === 'one' ? 'one solution' : r.kind === 'none' ? 'parallel' : 'same line'}
        </Note>
        {r.kind === 'one' && inside(r.x, r.y) && (
          <>
            <Guides frame={FRAME} x={r.x} y={r.y} />
            <Dot frame={FRAME} x={r.x} y={r.y} />
          </>
        )}
      </Plot>
      <Slider
        label="Machine B hours per unit of product 1, a"
        value={a}
        min={0}
        max={4}
        step={0.5}
        onChange={setA}
      />
      <Slider
        label="Machine B hours available, c"
        value={c}
        min={4}
        max={24}
        step={2}
        onChange={setC}
      />
      <Readout
        items={[
          [`Row 2 after R₂ − ${fmt(a)}R₁`, secondRow(r)],
          [
            'Solution',
            r.kind === 'one'
              ? `x = ${fmt(r.x)}, y = ${fmt(r.y)}`
              : r.kind === 'none'
                ? 'none'
                : 'x = 8 − 2t, y = t',
          ],
          [
            'Case',
            r.kind === 'one'
              ? 'exactly one'
              : r.kind === 'none'
                ? 'no solution'
                : 'infinitely many',
          ],
        ]}
      />
      <figcaption>{describeLines(a, c)}</figcaption>
    </figure>
  );
}
