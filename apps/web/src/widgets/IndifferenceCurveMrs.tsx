import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Utility U = x·y (topic C110, Example 1: the curve xy = 48 at the bundle (4, 12) has slope −3).
const FRAME = { xMin: 0, xMax: 16, yMin: 0, yMax: 34 };

/** The amount of y on the indifference curve xy = u at a given x. */
export const bundleY = (u: number, x: number) => u / x;

/**
 * Slope of the indifference curve xy = u, by implicit differentiation: y + x·y′ = 0, so
 * y′ = −y/x.
 */
export const slopeAt = (u: number, x: number) => -bundleY(u, x) / x;

/** Marginal rate of substitution: how much y the consumer gives up for one more x, −dy/dx. */
export const mrsAt = (u: number, x: number) => -slopeAt(u, x);

/** The tangent to the indifference curve at the bundle on it with this x, as a function of x. */
export const tangentAt = (u: number, x0: number) => (x: number) =>
  bundleY(u, x0) + slopeAt(u, x0) * (x - x0);

/** C110: move a bundle along an indifference curve and watch the MRS, minus the tangent's slope, fall. */
export function IndifferenceCurveMrs() {
  const [u, setU] = useState(48);
  const [x, setX] = useState(4);
  const y = bundleY(u, x);
  const slope = slopeAt(u, x);
  const mrs = mrsAt(u, x);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="food x"
        yLabel="clothing y"
        xTicks={[0, 4, 8, 12, 16]}
        yTicks={[10, 20, 30]}
      >
        <Curve frame={FRAME} fn={(v) => bundleY(u, v)} from={0.3} />
        <Curve
          frame={FRAME}
          fn={tangentAt(u, x)}
          from={Math.max(0, x - 4)}
          to={Math.min(16, x + 4)}
          tone="gold"
          dashed
        />
        <Note frame={FRAME} x={15.6} y={26} anchor="end">
          curve: xy = {fmt(u)}
        </Note>
        <Guides frame={FRAME} x={x} y={y} />
        <Dot frame={FRAME} x={x} y={y} />
      </Plot>
      <Slider label="Utility level U" value={u} min={12} max={60} step={4} onChange={setU} />
      <Slider label="Food x" value={x} min={2} max={12} step={0.5} onChange={setX} />
      <Readout
        items={[
          ['Bundle (x, y)', `(${fmt(x)}, ${fmt(y)})`],
          ['Slope dy/dx', fmt(slope)],
          ['MRS = −dy/dx', fmt(mrs)],
        ]}
      />
      <figcaption>
        Every bundle on the lilac curve gives the same utility, xy = {fmt(u)}. The gold dashed line
        is the tangent at your bundle; implicit differentiation gives its slope, dy/dx = −y/x ={' '}
        {fmt(slope)}. So here the consumer would give up about {fmt(mrs)} units of clothing for one
        more unit of food. Move food x to the right: the curve flattens and the MRS falls, because
        the more food the consumer already has, the less clothing an extra unit of food is worth to
        them.
      </figcaption>
    </figure>
  );
}
