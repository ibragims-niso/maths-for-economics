import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// A competitive firm with cost C(q) = 100 + q³/30 (topic OP04, Example 1: at p = 40 the best
// output is 20 and dq*/dp = 0.25).
const HILL = { xMin: 0, xMax: 35, yMin: -200, yMax: 1000 };
const SUPPLY = { xMin: 10, xMax: 70, yMin: 0, yMax: 30 };
export const FIXED_COST = 100;
export const COST_DIVISOR = 30;
export const START_PRICE = 40;

/** Profit π(q, p) = pq − 100 − q³/30. */
export const profit = (q: number, p: number) => p * q - FIXED_COST - q ** 3 / COST_DIVISOR;

/** The best output, where p = MC = q²/10: q*(p) = √(10p). */
export const bestOutput = (p: number) => Math.sqrt((COST_DIVISOR / 3) * p);

/** Maximum profit π*(p) = π(q*(p), p). */
export const maxProfit = (p: number) => profit(bestOutput(p), p);

/** π_qq = −6q/30 at the best output. */
export const secondDerivative = (p: number) => (-6 * bestOutput(p)) / COST_DIVISOR;

/** d(q*)/dp = −π_qp/π_qq with π_qp = 1: the comparative-statics formula, not a difference. */
export const supplySlope = (p: number) => -1 / secondDerivative(p);

/** OP04: a price slider moves the profit hill and its peak; the supply curve q*(p) and its tangent. */
export function SupplyComparativeStatics() {
  const [p, setP] = useState(START_PRICE);
  const q = bestOutput(p);
  const best = maxProfit(p);
  const slope = supplySlope(p);
  const reach = 15;

  return (
    <figure className="widget">
      <Plot
        frame={HILL}
        xLabel="output q"
        yLabel="profit"
        xTicks={[0, 10, 20, 30]}
        yTicks={[0, 400, 800]}
      >
        <Curve frame={HILL} fn={(x) => profit(x, START_PRICE)} to={28} tone="green" dashed />
        <Curve frame={HILL} fn={(x) => profit(x, p)} to={28} />
        <Guides frame={HILL} x={q} y={best} />
        <Dot frame={HILL} x={q} y={best} />
      </Plot>
      <Plot
        frame={SUPPLY}
        xLabel="price p"
        yLabel="best output q*"
        xTicks={[20, 40, 60]}
        yTicks={[10, 20, 30]}
      >
        <Curve frame={SUPPLY} fn={bestOutput} from={10} to={70} />
        <Segment
          frame={SUPPLY}
          from={[p - reach, q - slope * reach]}
          to={[p + reach, q + slope * reach]}
          dashed
        />
        <Guides frame={SUPPLY} x={p} y={q} />
        <Dot frame={SUPPLY} x={p} y={q} />
      </Plot>
      <Slider label="Price p" value={p} min={20} max={60} step={0.5} onChange={setP} />
      <Readout
        items={[
          ['Best output q*', fmt(q)],
          ['Maximum profit π*', fmt(best)],
          ['dq*/dp = −π_qp/π_qq', fmt(slope, 3)],
        ]}
      />
      <figcaption>
        Top: the profit p·q − 100 − q³/30 of a firm selling at the price p = {fmt(p)} (lilac), with
        the profit at the starting price 40 dashed for comparison. A higher price tilts the hill up
        more steeply on the right, so its peak, the dot, moves to a larger output. Bottom: the best
        output q* for every price, the firm's supply curve. The dashed gold line is its tangent at p
        = {fmt(p)}, with slope −π_qp/π_qq = 1/{fmt(-secondDerivative(p), 3)} = {fmt(slope, 3)}: a
        price rise of 1 raises output by about {fmt(slope, 2)}. The slope falls as the price rises,
        because marginal cost q²/10 gets steeper.
      </figcaption>
    </figure>
  );
}
