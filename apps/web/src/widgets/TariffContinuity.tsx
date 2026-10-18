import { useState } from 'react';
import { Curve, Dot, type Frame, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// The data plan of C101, Example 3: 20 + 4q up to 10 GB, k + 2q above 10 GB.
const FEE = 20;
const PRICE_LOW_USE = 4;
const PRICE_HIGH_USE = 2;
const THRESHOLD = 10;

const FRAME: Frame = { xMin: 0, xMax: 20, yMin: 0, yMax: 110 };

/** The monthly bill for q GB when the second rule is k + 2q. */
export function bill(q: number, k: number): number {
  return q <= THRESHOLD ? FEE + PRICE_LOW_USE * q : k + PRICE_HIGH_USE * q;
}

/** The limit of the bill as q approaches 10 from below (also the bill at exactly 10 GB). */
export const leftLimit = () => FEE + PRICE_LOW_USE * THRESHOLD;

/** The limit of the bill as q approaches 10 from above. */
export const rightLimit = (k: number) => k + PRICE_HIGH_USE * THRESHOLD;

/** The size of the jump at 10 GB: right limit minus left limit (0 means continuous). */
export const jump = (k: number) => rightLimit(k) - leftLimit();

/** The value of k that makes the bill continuous: 20 + 4·10 = k + 2·10. */
export const joiningK = () => leftLimit() - PRICE_HIGH_USE * THRESHOLD;

function describe(k: number): string {
  const gap = jump(k);
  if (gap === 0)
    return `With k = ${k} both one-sided limits are ${leftLimit()}, equal to the bill at 10 GB: the bill is continuous.`;
  return `With k = ${k} the bill jumps ${gap > 0 ? 'up' : 'down'} by ${fmt(Math.abs(gap))} at 10 GB: the left limit is ${leftLimit()}, the right limit ${rightLimit(k)}, so the limit at 10 does not exist.`;
}

/** C101: approach 10 GB from both sides of a two-part data tariff and close the jump with k. */
export function TariffContinuity() {
  const [k, setK] = useState(30);
  const [h, setH] = useState(2);
  const qLeft = THRESHOLD - h;
  const qRight = THRESHOLD + h;
  const continuous = jump(k) === 0;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="q (GB)"
        yLabel="bill C(q)"
        xTicks={[0, 5, 10, 15, 20]}
        yTicks={[20, 60, 100]}
      >
        <Curve frame={FRAME} fn={(q) => bill(q, k)} to={THRESHOLD} />
        <Curve frame={FRAME} fn={(q) => bill(q, k)} from={THRESHOLD + 1e-6} />
        {!continuous && (
          <Segment
            frame={FRAME}
            from={[THRESHOLD, leftLimit()]}
            to={[THRESHOLD, rightLimit(k)]}
            dashed
          />
        )}
        <Guides frame={FRAME} x={qLeft} y={bill(qLeft, k)} />
        <Guides frame={FRAME} x={qRight} y={bill(qRight, k)} />
        <Dot frame={FRAME} x={qLeft} y={bill(qLeft, k)} />
        <Dot frame={FRAME} x={qRight} y={bill(qRight, k)} />
        <Dot frame={FRAME} x={THRESHOLD} y={leftLimit()} />
        {!continuous && <Dot frame={FRAME} x={THRESHOLD} y={rightLimit(k)} hollow />}
      </Plot>
      <Slider
        label="Distance h from 10 GB"
        value={h}
        min={0.1}
        max={5}
        step={0.1}
        onChange={setH}
      />
      <Slider label="Constant k above 10 GB" value={k} min={20} max={60} step={5} onChange={setK} />
      <Readout
        items={[
          [`Left: C(${fmt(qLeft)})`, fmt(bill(qLeft, k))],
          [`Right: C(${fmt(qRight)})`, fmt(bill(qRight, k))],
          ['Jump at 10 GB', fmt(jump(k))],
        ]}
      />
      <figcaption>The bill is 20 + 4q up to 10 GB and k + 2q above. {describe(k)}</figcaption>
    </figure>
  );
}
