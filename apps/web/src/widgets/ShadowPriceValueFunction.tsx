import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// Utility U = xy on the budget p_x·x + p_y·y = M (topic MV09, Example 1: with p_x = 5, p_y = 10
// and M = 600 the maximum utility is 1,800 and λ = 6; 10 more units of income add about 60).
const FRAME = { xMin: 0, xMax: 1050, yMin: 0, yMax: 5300 };
/** The price of good y stays fixed; the sliders change income, the price of x and the rise ΔM. */
export const PRICE_Y = 10;

/** Maximum utility V(M) = x*·y* = M²/(4·p_x·p_y): half of income goes on each good. */
export const valueFunction = (px: number, M: number) => (M * M) / (4 * px * PRICE_Y);

/** The Lagrange multiplier λ = U_x/p_x = y* / p_x = M/(2·p_x·p_y), the slope of V(M). */
export const multiplier = (px: number, M: number) => M / (2 * px * PRICE_Y);

/** The estimate of the rise in maximum utility, λ·ΔM. */
export const estimateChange = (px: number, M: number, dM: number) => multiplier(px, M) * dM;

/** The exact rise in maximum utility, V(M + ΔM) − V(M). */
export const exactChange = (px: number, M: number, dM: number) =>
  valueFunction(px, M + dM) - valueFunction(px, M);

/** MV09: the value function V(M), its tangent of slope λ, and the estimate λ·ΔM against the exact rise. */
export function ShadowPriceValueFunction() {
  const [M, setM] = useState(600);
  const [px, setPx] = useState(5);
  const [dM, setDM] = useState(100);
  const V = valueFunction(px, M);
  const lambda = multiplier(px, M);
  const estimate = estimateChange(px, M, dM);
  const exact = exactChange(px, M, dM);
  const tangent = (m: number) => V + lambda * (m - M);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="income M"
        yLabel="max utility V(M)"
        xTicks={[0, 200, 400, 600, 800, 1000]}
        yTicks={[1000, 2000, 3000, 4000, 5000]}
      >
        {dM > 0 && (
          <Area
            frame={FRAME}
            top={(m) => valueFunction(px, m)}
            bottom={tangent}
            from={M}
            to={M + dM}
          />
        )}
        <Curve frame={FRAME} fn={(m) => valueFunction(px, m)} />
        <Curve frame={FRAME} fn={tangent} from={M / 2} tone="green" dashed />
        <Guides frame={FRAME} x={M} y={V} />
        {dM > 0 && (
          <Segment
            frame={FRAME}
            from={[M + dM, tangent(M + dM)]}
            to={[M + dM, valueFunction(px, M + dM)]}
          />
        )}
        <Dot frame={FRAME} x={M} y={V} />
        <Dot frame={FRAME} x={M + dM} y={valueFunction(px, M + dM)} hollow />
      </Plot>
      <Slider label="Income M" value={M} min={200} max={700} step={50} onChange={setM} />
      <Slider label="Price of x, p_x" value={px} min={5} max={12} onChange={setPx} />
      <Slider label="Rise in income ΔM" value={dM} min={0} max={300} step={10} onChange={setDM} />
      <Readout
        items={[
          ['Maximum utility V(M)', fmt(V)],
          ['λ = slope of V at M', fmt(lambda, 3)],
          ['λ·ΔM vs exact rise', `${fmt(estimate)} vs ${fmt(exact)}`],
        ]}
      />
      <figcaption>
        The lilac curve is the value function V(M), the highest utility U = xy can reach with income
        M at prices p_x = {fmt(px)} and p_y = {PRICE_Y}. The dashed green line touches it at M ={' '}
        {fmt(M)} with slope λ = {fmt(lambda, 3)}, the Lagrange multiplier y*/p_x: one more unit of
        income adds about {fmt(lambda, 3)} to utility. Following the line for ΔM = {fmt(dM)} gives
        the estimate λ·ΔM = {fmt(estimate)}; the curve (hollow dot) rises by {fmt(exact)}. The
        difference, ΔM²/(4·p_x·p_y) = {fmt(exact - estimate)}, is the error of the estimate: the
        gold gap between curve and line, easy to see when ΔM is large. It shrinks quickly as ΔM gets
        small, because the curve bends away from its tangent only slowly.
      </figcaption>
    </figure>
  );
}
