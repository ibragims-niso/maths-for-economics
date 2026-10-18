import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Price 40, unit cost 25, fixed cost 9000 (topic F04, example 2). Money is drawn in thousands.
const FRAME = { xMin: 0, xMax: 1200, yMin: 0, yMax: 50 };

/** Break-even quantity Q* = F/(p − v), or null when the price does not exceed the unit cost. */
export function breakEvenQuantity(fixedCost: number, price: number, unitCost: number) {
  return price > unitCost ? fixedCost / (price - unitCost) : null;
}

/** Where to write a line's name: near the right edge, or where the line leaves the top. */
export function labelX(intercept: number, slope: number, frame = FRAME) {
  const top = frame.yMax * 0.92;
  return Math.min(frame.xMax * 0.93, slope > 0 ? (top - intercept) / slope : frame.xMax);
}

/** F04: move price, unit cost and fixed cost; see where revenue and cost lines cross. */
export function BreakEvenLines() {
  const [price, setPrice] = useState(40);
  const [unitCost, setUnitCost] = useState(25);
  const [fixedCost, setFixedCost] = useState(9000);
  const qStar = breakEvenQuantity(fixedCost, price, unitCost);
  const revenue = (q: number) => (price * q) / 1000;
  const cost = (q: number) => (fixedCost + unitCost * q) / 1000;
  const split = qStar === null ? FRAME.xMax : Math.min(qStar, FRAME.xMax);
  const xR = labelX(0, price / 1000);
  const xC = labelX(fixedCost / 1000, unitCost / 1000);

  let caption: string;
  if (qStar === null)
    caption =
      'The price does not exceed the unit cost, so no sale pays anything towards the fixed cost: the lines never cross and the firm never breaks even.';
  else if (qStar > FRAME.xMax)
    caption = `The lines cross at Q* = ${fmt(qStar)}, beyond the right edge of the graph: the margin is too small for this fixed cost.`;
  else
    caption =
      'Left of the crossing cost is above revenue (a loss, gold); right of it revenue is above cost (a profit, green).';

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="quantity Q"
        yLabel="R and C (000s)"
        xTicks={[0, 300, 600, 900, 1200]}
        yTicks={[0, 10, 20, 30, 40, 50]}
      >
        <Area frame={FRAME} top={cost} bottom={revenue} to={split} tone="gold" />
        {split < FRAME.xMax && (
          <Area frame={FRAME} top={revenue} bottom={cost} from={split} tone="green" />
        )}
        <Curve frame={FRAME} fn={cost} tone="green" />
        <Curve frame={FRAME} fn={revenue} />
        <Note frame={FRAME} x={xR} y={revenue(xR) + 2} anchor="end">
          R
        </Note>
        <Note frame={FRAME} x={xC} y={cost(xC) + 2} anchor="end">
          C
        </Note>
        {qStar !== null && qStar <= FRAME.xMax && (
          <>
            <Guides frame={FRAME} x={qStar} y={revenue(qStar)} />
            <Dot frame={FRAME} x={qStar} y={revenue(qStar)} />
          </>
        )}
      </Plot>
      <Slider label="Price p" value={price} min={10} max={60} onChange={setPrice} />
      <Slider label="Unit cost v" value={unitCost} min={5} max={45} onChange={setUnitCost} />
      <Slider
        label="Fixed cost F"
        value={fixedCost}
        min={3000}
        max={15000}
        step={500}
        onChange={setFixedCost}
      />
      <Readout
        items={[
          ['Margin p − v', fmt(price - unitCost)],
          ['Break-even Q*', qStar === null ? 'none' : fmt(qStar)],
          ['Revenue = cost at Q*', qStar === null ? '—' : fmt(price * qStar)],
        ]}
      />
      <figcaption>Revenue R = pQ and cost C = F + vQ cross at Q* = F/(p − v). {caption}</figcaption>
    </figure>
  );
}
