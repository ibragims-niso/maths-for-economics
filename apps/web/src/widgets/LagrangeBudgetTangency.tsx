import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// Utility U = x^a·y^(1−a) on the budget p_x·x + p_y·y = M (topic MV08, Example 1: with a = 0.5,
// p_x = 5, p_y = 10 and M = 600 the best bundle is 60 meals and 30 units of other goods).
const FRAME = { xMin: 0, xMax: 160, yMin: 0, yMax: 90 };
/** The price of other goods y stays fixed; the sliders change the price of meals and income. */
export const PRICE_Y = 10;
/** A lower indifference curve, drawn dashed: it cuts the budget line twice. */
const LOWER = 0.75;
/** Curves end at this height so they do not run into the x-axis label. */
const FLOOR = 12;

/** U = x^a·y^(1−a). */
export const utility = (a: number, x: number, y: number) => x ** a * y ** (1 - a);

/** Cobb–Douglas demands from the Lagrange conditions: the share a of income goes on x. */
export const optimum = (a: number, px: number, py: number, M: number) => ({
  x: (a * M) / px,
  y: ((1 - a) * M) / py,
});

/** The amount of y on the indifference curve U = u at a given x: y = (u / x^a)^(1/(1−a)). */
export const indifferenceY = (a: number, u: number, x: number) => (u / x ** a) ** (1 / (1 - a));

/** The amount of y the budget leaves after buying x. */
export const budgetY = (px: number, py: number, M: number, x: number) => (M - px * x) / py;

/** Where an indifference curve comes down to y = floor; curves stop there, clear of the axis label. */
export const xWhereY = (a: number, u: number, floor: number) => (u / floor ** (1 - a)) ** (1 / a);

/** MRS = U_x / U_y = a·y / ((1 − a)·x), minus the slope of the indifference curve. */
export const mrs = (a: number, x: number, y: number) => (a * y) / ((1 - a) * x);

/** MV08: a budget line, the indifference curve that touches it, and the tangency condition. */
export function LagrangeBudgetTangency() {
  const [px, setPx] = useState(5);
  const [M, setM] = useState(600);
  const [a, setA] = useState(0.5);
  const best = optimum(a, px, PRICE_Y, M);
  const u = utility(a, best.x, best.y);
  const ratio = px / PRICE_Y;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="meals x"
        yLabel="other goods y"
        xTicks={[0, 40, 80, 120, 160]}
        yTicks={[20, 40, 60, 80]}
      >
        <Segment frame={FRAME} from={[0, M / PRICE_Y]} to={[M / px, 0]} tone="green" />
        <Curve
          frame={FRAME}
          fn={(v) => indifferenceY(a, LOWER * u, v)}
          from={0.5}
          to={Math.min(FRAME.xMax, xWhereY(a, LOWER * u, FLOOR))}
          dashed
        />
        <Curve
          frame={FRAME}
          fn={(v) => indifferenceY(a, u, v)}
          from={0.5}
          to={Math.min(FRAME.xMax, xWhereY(a, u, FLOOR))}
        />
        <Guides frame={FRAME} x={best.x} y={best.y} />
        <Dot frame={FRAME} x={best.x} y={best.y} />
      </Plot>
      <Slider label="Price of a meal p_x" value={px} min={4} max={15} onChange={setPx} />
      <Slider label="Income M" value={M} min={200} max={800} step={50} onChange={setM} />
      <Slider label="Weight on meals a" value={a} min={0.2} max={0.8} step={0.1} onChange={setA} />
      <Readout
        items={[
          ['Best bundle (x*, y*)', `(${fmt(best.x)}, ${fmt(best.y)})`],
          ['MRS at the best bundle', fmt(mrs(a, best.x, best.y), 3)],
          ['Price ratio p_x / p_y', fmt(ratio, 3)],
        ]}
      />
      <figcaption>
        The green line is everything the budget {fmt(px)}x + {PRICE_Y}y = {fmt(M)} can buy. The
        solid lilac curve is the highest indifference curve of U = x^a·y^(1−a) that still touches
        it; the dashed one below cuts the line twice, so moving along the line towards the dot
        raises utility. At the dot the two curves are tangent: the MRS equals the price ratio,{' '}
        {fmt(ratio, 3)}. The Lagrange conditions give the same point, x* = a·M/p_x = {fmt(best.x)}{' '}
        meals, so the consumer spends the share a = {fmt(a, 1)} of income on meals.
      </figcaption>
    </figure>
  );
}
