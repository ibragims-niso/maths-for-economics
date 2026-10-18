import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Utility U = xy with prices 2 and 3 and income 120 (topic MV01, Example 3: the indifference
// curve U = 600 touches the budget line 2x + 3y = 120 at the bundle (30, 20)).
// The frame is taller than the curves (they stop at y = 38), so the labels stay clear.
const FRAME = { xMin: 0, xMax: 60, yMin: 0, yMax: 45 };
const TOP_Y = 38;

/** The levels of the three indifference curves drawn on the map. */
export const LEVELS = [300, 600, 900] as const;

export const PRICE_X = 2;
export const PRICE_Y = 3;
export const INCOME = 120;

/** Utility of the bundle (x, y). */
export const utility = (x: number, y: number) => x * y;

/** Cost of the bundle (x, y) at the prices 2 and 3. */
export const spending = (x: number, y: number) => PRICE_X * x + PRICE_Y * y;

/** The indifference curve U = level, solved for y: y = level / x. */
export const curveAt = (level: number) => (x: number) => level / x;

/** Which drawn indifference curve the utility u lies on, or which two it lies between. */
export function placeOnMap(u: number): string {
  const [low, mid, high] = LEVELS;
  if (LEVELS.some((l) => l === u)) return `on U = ${fmt(u)}`;
  if (u < low) return `below ${low}`;
  if (u > high) return `above ${high}`;
  return u < mid ? `${low} to ${mid}` : `${mid} to ${high}`;
}

/** Where the bundle stands against the budget 2x + 3y = 120. */
export function describeBudget(x: number, y: number): string {
  const s = spending(x, y);
  if (s === INCOME) return 'The bundle costs exactly 120, so it lies on the budget line.';
  if (s < INCOME)
    return `The bundle costs ${fmt(s)}, less than 120: it is affordable, with money left over.`;
  return `The bundle costs ${fmt(s)}, more than 120: it lies beyond the budget line and cannot be bought.`;
}

/** MV01: move a bundle over a contour map of U = xy and compare it with three indifference curves and a budget line. */
export function IndifferenceMap() {
  const [x, setX] = useState(30);
  const [y, setY] = useState(20);
  const u = utility(x, y);
  const onDrawnCurve = LEVELS.some((l) => l === u);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="food x"
        yLabel="clothing y"
        xTicks={[0, 10, 20, 30, 40, 50, 60]}
        yTicks={[10, 20, 30, 40]}
      >
        <Segment
          frame={FRAME}
          from={[0, INCOME / PRICE_Y]}
          to={[INCOME / PRICE_X, 0]}
          tone="green"
        />
        {LEVELS.map((l) => (
          <Curve key={l} frame={FRAME} fn={curveAt(l)} from={l / TOP_Y} to={56} />
        ))}
        {u > 0 && !onDrawnCurve && (
          <Curve frame={FRAME} fn={curveAt(u)} from={u / TOP_Y} to={56} tone="gold" dashed />
        )}
        {LEVELS.map((l) => (
          <Note key={l} frame={FRAME} x={l / TOP_Y} y={TOP_Y + 1.5} anchor="middle">
            {l}
          </Note>
        ))}
        <Note frame={FRAME} x={1.5} y={24}>
          budget
        </Note>
        <Guides frame={FRAME} x={x} y={y} />
        <Dot frame={FRAME} x={x} y={y} />
      </Plot>
      <Slider label="Food x" value={x} min={0} max={60} onChange={setX} />
      <Slider label="Clothing y" value={y} min={0} max={40} onChange={setY} />
      <Readout
        items={[
          ['Utility U = xy', fmt(u)],
          ['Spending', `${fmt(spending(x, y))} of 120`],
          ['Level curve', placeOnMap(u)],
        ]}
      />
      <figcaption>
        Solid curves: the indifference curves U = 300, 600 and 900. Green line: the budget line 2x +
        3y = 120.{' '}
        {onDrawnCurve || u === 0
          ? ''
          : 'The dashed curve is the indifference curve through your bundle. '}
        {describeBudget(x, y)}
      </figcaption>
    </figure>
  );
}
