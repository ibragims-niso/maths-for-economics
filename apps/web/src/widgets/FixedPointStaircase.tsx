import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic AN05, Example 1: the price rule f(p) = 6 − 0.5p, started at p₀ = 1, settles at p* = 4.
const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
const STEPS = 10;
/** Iterates beyond this size are not drawn (the frame clips them anyway). */
const FAR = 100;

/** The straight-line map f(x) = a + k·x. */
export const mapValue = (a: number, k: number, x: number) => a + k * x;

const isOne = (k: number) => Math.abs(k - 1) < 1e-9;

/** Where f crosses the 45° line: one point a/(1 − k), none (k = 1, a ≠ 0) or every x (f(x) = x). */
export function fixedPoint(
  a: number,
  k: number,
): { kind: 'one'; x: number } | { kind: 'none' } | { kind: 'all' } {
  if (isOne(k)) return Math.abs(a) < 1e-9 ? { kind: 'all' } : { kind: 'none' };
  return { kind: 'one', x: a / (1 - k) };
}

/** Banach's condition for a line: every gap is multiplied by |k|, so it shrinks when |k| < 1. */
export const isContraction = (k: number) => Math.abs(k) < 1 - 1e-9;

/** Brouwer's condition on [0, 10]: a line maps the interval into itself when both ends land inside. */
export const mapsIntoItself = (a: number, k: number) =>
  [mapValue(a, k, 0), mapValue(a, k, 10)].every((y) => y >= -1e-9 && y <= 10 + 1e-9);

/** x₀, x₁ = f(x₀), …, x_steps. */
export function iterates(a: number, k: number, x0: number, steps = STEPS): number[] {
  const xs = [x0];
  for (let t = 1; t <= steps; t++) xs.push(mapValue(a, k, xs[t - 1] ?? x0));
  return xs;
}

/**
 * The staircase: up (or down) from (x₀, 0) to the graph at (x₀, x₁), across to the 45° line at
 * (x₁, x₁), up or down to the graph at (x₁, x₂), and so on; it stops once the values run far away.
 */
export function staircase(
  xs: number[],
): { id: string; from: [number, number]; to: [number, number] }[] {
  const legs: { id: string; from: [number, number]; to: [number, number] }[] = [];
  const x0 = xs[0] ?? 0;
  let corner: [number, number] = [x0, 0];
  for (let t = 1; t < xs.length; t++) {
    const before = xs[t - 1] ?? 0;
    const after = xs[t] ?? 0;
    if (Math.abs(after) > FAR) break;
    const onGraph: [number, number] = [before, after];
    const onDiagonal: [number, number] = [after, after];
    legs.push({ id: `up${t}`, from: corner, to: onGraph });
    legs.push({ id: `across${t}`, from: onGraph, to: onDiagonal });
    corner = onDiagonal;
  }
  return legs;
}

function bandText(k: number): string {
  if (isOne(k))
    return 'k = 1: the line is parallel to the 45° line, so it never crosses it (unless a = 0, when every point is fixed).';
  if (isContraction(k))
    return `|k| = ${fmt(Math.abs(k))} < 1, so f is a contraction: Banach adds that the fixed point is unique and that the gold staircase reaches it from any start, the gap shrinking by the factor ${fmt(Math.abs(k))} each step.`;
  if (Math.abs(k + 1) < 1e-9)
    return '|k| = 1, so f is not a contraction: the staircase goes round a square for ever, neither closer to nor further from the fixed point.';
  return `|k| = ${fmt(Math.abs(k))} > 1, so f is not a contraction: unless it starts exactly at the fixed point, the staircase moves away from it.`;
}

/** AN05: a line drawn against the 45° line; the staircase iterates x ↦ f(x) from a start. */
export function FixedPointStaircase() {
  const [k, setK] = useState(-0.5);
  const [a, setA] = useState(6);
  const [x0, setX0] = useState(1);
  const xs = iterates(a, k, x0);
  const legs = staircase(xs);
  const fp = fixedPoint(a, k);
  const star = fp.kind === 'one' ? fp.x : null;
  const inside = star !== null && star >= 0 && star <= 10;
  const last = xs[STEPS] ?? x0;
  // Write "f" just above the line near x = 0, or below it when the line starts near the top.
  const nearTop = mapValue(a, k, 0.3);
  const labelY = Math.min(9.3, Math.max(0.7, nearTop > 8.1 ? nearTop - 1.2 : nearTop + 0.5));
  const brouwer = mapsIntoItself(a, k)
    ? 'f maps [0, 10] into itself and is continuous, so Brouwer guarantees that the lilac line crosses the dashed 45° line: a fixed point exists.'
    : 'f sends part of [0, 10] outside [0, 10], so Brouwer’s condition fails and the theorem says nothing: a fixed point may lie off the graph, or not exist.';

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="x"
        yLabel="f(x)"
        xTicks={[0, 2, 4, 6, 8, 10]}
        yTicks={[2, 4, 6, 8, 10]}
      >
        <Curve frame={FRAME} fn={(x) => x} tone="green" dashed />
        <Curve frame={FRAME} fn={(x) => mapValue(a, k, x)} />
        {legs.map((leg) => (
          <Segment key={leg.id} frame={FRAME} from={leg.from} to={leg.to} />
        ))}
        <Dot frame={FRAME} x={x0} y={0} />
        {inside && star !== null && <Dot frame={FRAME} x={star} y={star} hollow />}
        <Note frame={FRAME} x={9.9} y={7.4} anchor="end">
          y = x
        </Note>
        <Note frame={FRAME} x={0.3} y={labelY}>
          f
        </Note>
      </Plot>
      <Slider label="Slope k" value={k} min={-1.2} max={1.2} step={0.05} onChange={setK} />
      <Slider label="Intercept a = f(0)" value={a} min={0} max={10} step={0.5} onChange={setA} />
      <Slider label="Start x₀" value={x0} min={0} max={10} step={0.5} onChange={setX0} />
      <Readout
        items={[
          [
            'Fixed point x*',
            fp.kind === 'one' ? fmt(fp.x, 3) : fp.kind === 'none' ? 'none' : 'every x',
          ],
          ['Contraction?', isContraction(k) ? 'yes' : 'no'],
          ['x₁₀ after 10 steps', fmt(last, 3)],
        ]}
      />
      <figcaption>
        The lilac line is f(x) = a + kx and the dashed green line is y = x; where they cross, f(x) =
        x, a fixed point (hollow dot when it is on the graph). The gold staircase starts at x₀
        (solid dot), goes to the graph to find f(x₀), then across to the 45° line to use it as the
        next input. {brouwer} {bandText(k)}
      </figcaption>
    </figure>
  );
}
