import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Total cost C(Q) = 200 + 10Q + Q² (topic C102, Examples 1 and 2).
const FRAME = { xMin: 0, xMax: 32, yMin: 0, yMax: 1500 };

/** Total cost C(Q) = 200 + 10Q + Q². */
export function cost(q: number): number {
  return 200 + 10 * q + q * q;
}

/** Slope of the secant through (Q₀, C(Q₀)) and (Q₀ + h, C(Q₀ + h)): the average rate of change. */
export function secantSlope(q0: number, h: number): number {
  return (cost(q0 + h) - cost(q0)) / h;
}

/** Slope of the tangent at Q₀, the limit of the secant slopes: C′(Q₀) = 10 + 2Q₀. */
export function tangentSlope(q0: number): number {
  return 10 + 2 * q0;
}

/** The straight line through (x0, y0) with the given slope, as a function. */
const lineThrough = (x0: number, y0: number, slope: number) => (x: number) => y0 + slope * (x - x0);

/** C102: shrink the step h and watch the secant's slope settle at the tangent's slope. */
export function SecantToTangent() {
  const [q0, setQ0] = useState(10);
  const [h, setH] = useState(5);
  const c0 = cost(q0);
  const c1 = cost(q0 + h);
  const secant = lineThrough(q0, c0, secantSlope(q0, h));
  const tangent = lineThrough(q0, c0, tangentSlope(q0));
  const gap = secantSlope(q0, h) - tangentSlope(q0);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output Q"
        yLabel="cost C(Q)"
        xTicks={[0, 10, 20, 30]}
        yTicks={[400, 800, 1200]}
      >
        <Segment
          frame={FRAME}
          from={[FRAME.xMin, secant(FRAME.xMin)]}
          to={[FRAME.xMax, secant(FRAME.xMax)]}
        />
        <Segment
          frame={FRAME}
          from={[FRAME.xMin, tangent(FRAME.xMin)]}
          to={[FRAME.xMax, tangent(FRAME.xMax)]}
          tone="green"
          dashed
        />
        <Curve frame={FRAME} fn={cost} />
        <Guides frame={FRAME} x={q0} y={c0} />
        <Dot frame={FRAME} x={q0} y={c0} />
        <Dot frame={FRAME} x={q0 + h} y={c1} hollow />
        <Note frame={FRAME} x={1.5} y={1000}>
          C(Q) = 200 + 10Q + Q²
        </Note>
      </Plot>
      <Slider label="Output Q₀" value={q0} min={2} max={20} onChange={setQ0} />
      <Slider label="Step h" value={h} min={0.1} max={10} step={0.1} onChange={setH} />
      <Readout
        items={[
          ['Secant slope ΔC/ΔQ', fmt(secantSlope(q0, h))],
          ['Tangent slope C′(Q₀)', fmt(tangentSlope(q0))],
          ['Gap', fmt(gap)],
        ]}
      />
      <figcaption>
        The gold line is the secant from Q = {q0} to Q = {fmt(q0 + h)}: going up by {fmt(h)}{' '}
        {h === 1 ? 'unit' : 'units'} costs {fmt(c1 - c0)} more, an average of{' '}
        {fmt(secantSlope(q0, h))} per unit. The green dashed line is the tangent at Q = {q0}, with
        slope {fmt(tangentSlope(q0))}: the marginal cost there. Here the gap between the two slopes
        is exactly h, so it disappears as h shrinks to 0.
      </figcaption>
    </figure>
  );
}
