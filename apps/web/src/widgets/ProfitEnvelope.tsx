import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// A competitive firm with cost C(q) = 100 + 2q² (topic MV12, Example 1: at p = 40 the best
// output is 10, maximum profit is 100 and dπ*/dp = 10).
const FRAME = { xMin: 10, xMax: 72, yMin: -150, yMax: 450 };
export const FIXED_COST = 100;
export const COST_COEFFICIENT = 2;
/** The frozen outputs drawn as gold lines; each touches the envelope at p = 4q. */
export const FROZEN_OUTPUTS = [5, 10, 15] as const;

/** Profit pq − 100 − 2q² with output frozen at q: a straight line in p with slope q. */
export const frozenProfit = (q: number, p: number) => p * q - FIXED_COST - COST_COEFFICIENT * q * q;

/** The best output q*(p) = p/(2c), where price equals marginal cost 4q. */
export const bestOutput = (p: number) => p / (2 * COST_COEFFICIENT);

/** Maximum profit π*(p) = p²/(4c) − F, the upper envelope of the frozen-output lines. */
export const maxProfit = (p: number) => (p * p) / (4 * COST_COEFFICIENT) - FIXED_COST;

/** The slope of π* at p, measured by a central difference (not from the formula q*). */
export const numericalSlope = (p: number, h = 0.01) =>
  (maxProfit(p + h) - maxProfit(p - h)) / (2 * h);

/** MV12: maximum profit as the upper envelope of frozen-output profit lines (Hotelling's lemma). */
export function ProfitEnvelope() {
  const [p, setP] = useState(40);
  const q = bestOutput(p);
  const best = maxProfit(p);
  const slope = numericalSlope(p);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="price p"
        yLabel="profit"
        xTicks={[20, 30, 40, 50, 60]}
        yTicks={[-100, 0, 100, 200, 300, 400]}
      >
        {FROZEN_OUTPUTS.map((fq) => (
          <Curve key={fq} frame={FRAME} fn={(x) => frozenProfit(fq, x)} tone="gold" />
        ))}
        {FROZEN_OUTPUTS.map((fq) => (
          // Above the envelope, where no line can reach, next to the point the line touches.
          <Note
            key={`n${fq}`}
            frame={FRAME}
            x={4 * fq - 1}
            y={Math.max(frozenProfit(fq, 4 * fq) + 55, 30)}
            anchor="end"
          >
            q = {fq}
          </Note>
        ))}
        <Curve frame={FRAME} fn={maxProfit} />
        <Curve frame={FRAME} fn={(x) => frozenProfit(q, x)} tone="green" dashed />
        <Guides frame={FRAME} x={p} y={best} />
        <Dot frame={FRAME} x={p} y={best} />
      </Plot>
      <Slider label="Price p" value={p} min={20} max={60} onChange={setP} />
      <Readout
        items={[
          ['Maximum profit π*(p)', fmt(best)],
          ['Best output q*(p)', fmt(q)],
          ['Slope of π* (numerical)', fmt(slope)],
        ]}
      />
      <figcaption>
        Each gold line is the profit p·q − 100 − 2q² of a firm that keeps its output frozen at q =
        5, 10 or 15 whatever the price: a straight line with slope q. The lilac curve is the maximum
        profit π*(p) = p²/8 − 100, which runs along the top of all such lines, their upper envelope.
        At p = {fmt(p)} the best output is q* = {fmt(q)}; the dashed green line is the profit with
        output frozen at that level. It touches the curve at the dot and lies below it everywhere
        else, so the curve's slope there, {fmt(slope)}, equals q*. That is Hotelling's lemma: a
        price rise of 1 adds about q* to maximum profit, and adjusting output adds almost nothing
        more.
      </figcaption>
    </figure>
  );
}
