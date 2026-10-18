import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Slider } from './kit';

// Profit π(Q) = −2Q² + 120Q − 800 (topic C109, Example 1: the maximum is 1000 at Q = 30).
// The frame reaches below the lowest profit, so the point never hides under the axis name.
const FRAME = { xMin: 0, xMax: 60, yMin: -1400, yMax: 1300 };

/** Profit at output q. */
export const profit = (q: number) => -2 * q * q + 120 * q - 800;

/** Marginal profit, the slope of the profit curve: π′(Q) = −4Q + 120. */
export const marginalProfit = (q: number) => -4 * q + 120;

/** The tangent to the profit curve at output q0, as a function of output. */
export const tangentAt = (q0: number) => (q: number) => profit(q0) + marginalProfit(q0) * (q - q0);

/** What the slope at the current output says the firm should do. */
export function describeSlope(q: number): string {
  const slope = marginalProfit(q);
  if (slope > 0)
    return `The tangent rises: one more unit adds about ${fmt(slope)} to profit, so producing more pays.`;
  if (slope < 0)
    return `The tangent falls: one more unit loses about ${fmt(-slope)}, so producing less pays.`;
  return `The tangent is flat: this is the top of the hill, the most profit the firm can make.`;
}

/** C109: slide along the profit hill and watch the tangent's slope, marginal profit, reach zero at the top. */
export function ProfitHillTangent() {
  const [q, setQ] = useState(20);
  const y = profit(q);
  const slope = marginalProfit(q);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output Q"
        yLabel="profit π"
        xTicks={[0, 10, 20, 30, 40, 50, 60]}
        yTicks={[-500, 0, 500, 1000]}
      >
        <Curve frame={FRAME} fn={profit} from={0} to={60} />
        <Curve
          frame={FRAME}
          fn={tangentAt(q)}
          from={Math.max(0, q - 12)}
          to={Math.min(60, q + 12)}
          tone="gold"
        />
        <Guides frame={FRAME} x={q} y={y} />
        <Dot frame={FRAME} x={q} y={y} />
      </Plot>
      <Slider label="Output Q" value={q} min={1} max={59} onChange={setQ} />
      <Readout
        items={[
          ['Output Q', fmt(q)],
          ['Profit π(Q)', fmt(y)],
          ['Marginal profit π′(Q)', fmt(slope)],
        ]}
      />
      <figcaption>
        Profit π(Q) = −2Q² + 120Q − 800 and its tangent at the point. {describeSlope(q)}
      </figcaption>
    </figure>
  );
}
