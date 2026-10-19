import { useState } from 'react';
import { Curve, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

const FRAME = { xMin: 0, xMax: 7, yMin: -40, yMax: 30 };

/** Profit of the firm in NM01 Example 3: price 27, fixed cost 30, variable cost q³. */
export const profit = (q: number) => 27 * q - q ** 3 - 30;
export const profitSlope = (q: number) => 27 - 3 * q ** 2;

/** The two break-even outputs (roots of q³ − 27q + 30 with q > 0), to 4 decimals. */
export const BREAK_EVEN = [1.1705, 4.5111] as const;

export interface NewtonRun {
  /** q₀, q₁, …: the estimates that could be computed. */
  path: number[];
  /** True when a tangent was flat, so the next step could not be taken. */
  flat: boolean;
}

/** Up to `steps` Newton steps q ↦ q − π(q)/π′(q), stopping at a flat tangent. */
export function newtonPath(start: number, steps: number): NewtonRun {
  const path = [start];
  let q = start;
  for (let k = 0; k < steps; k++) {
    const d = profitSlope(q);
    if (Math.abs(d) < 1e-9) return { path, flat: true };
    q -= profit(q) / d;
    path.push(q);
  }
  return { path, flat: false };
}

/** What happened, in words, for the caption. */
export function describeRun(run: NewtonRun): string {
  const q = run.path[run.path.length - 1] ?? 0;
  if (run.flat)
    return 'The tangent here is flat, at the top of the profit hill (π′ = 0): it never meets the axis, so Newton’s method cannot take a step.';
  if (q < 0)
    return 'The estimate is a negative output. The start was close to the top of the hill, where the tangent is almost flat, so the step overshot far beyond the break-even points.';
  if (run.path.length === 1) return 'Add steps to follow the tangent lines down to the axis.';
  const nearest = Math.abs(q - BREAK_EVEN[0]) < Math.abs(q - BREAK_EVEN[1]) ? 0 : 1;
  return `The estimates are closing in on the ${nearest === 0 ? 'lower' : 'higher'} break-even output, ${BREAK_EVEN[nearest]} thousand units. Starting on the other side of the hill top leads to the other one.`;
}

/** NM01: choose a starting output and watch Newton's tangent steps find a break-even output, or fail. */
export function NewtonBreakEven() {
  const [start, setStart] = useState(5);
  const [steps, setSteps] = useState(2);
  const run = newtonPath(start, steps);
  const { path } = run;
  const q = path[path.length - 1] ?? start;
  const prev = path[path.length - 2];
  // Step n follows the tangent at q(n−1) down to the axis at q(n).
  const tangentSteps = path.slice(1).map((next, i) => ({ n: i + 1, from: path[i] ?? start, next }));

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output q"
        yLabel="profit π"
        xTicks={[0, 1, 2, 3, 4, 5, 6, 7]}
        yTicks={[-40, -20, 0, 20]}
      >
        <Curve frame={FRAME} fn={profit} />
        {tangentSteps.map(({ n, from, next }) => (
          <g key={`step-${n}`}>
            <Segment frame={FRAME} from={[from, profit(from)]} to={[next, 0]} />
            <Segment frame={FRAME} from={[next, 0]} to={[next, profit(next)]} tone="green" dashed />
          </g>
        ))}
        {run.flat && (
          <Segment frame={FRAME} from={[q - 1.5, profit(q)]} to={[q + 1.5, profit(q)]} dashed />
        )}
        <Dot frame={FRAME} x={start} y={profit(start)} hollow />
        <Dot frame={FRAME} x={q} y={profit(q)} />
      </Plot>
      <Slider
        label="Starting output q₀"
        value={start}
        min={0.5}
        max={5.5}
        step={0.1}
        onChange={setStart}
      />
      <Slider label="Newton steps" value={steps} min={0} max={5} onChange={setSteps} />
      <Readout
        items={[
          [`Estimate q${subscript(path.length - 1)}`, fmt(q, 4)],
          ['Profit there', fmt(profit(q), 4)],
          ['Last step', prev === undefined ? '–' : fmt(Math.abs(q - prev), 4)],
        ]}
      />
      <figcaption>
        {describeRun(run)} The hollow dot is the start, the filled dot the latest estimate.
      </figcaption>
    </figure>
  );
}

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
function subscript(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUBSCRIPTS[Number(d)] ?? d)
    .join('');
}
