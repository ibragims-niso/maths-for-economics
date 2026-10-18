import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

/** The fixed amount paid in the future. */
export const FUTURE_AMOUNT = 1000;

const FRAME = { xMin: 0, xMax: 30, yMin: 0, yMax: 1150 };

/** Money with two decimals: 15.1 → "15.10", 1000 → "1,000.00". */
export const money = (v: number) =>
  v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The value today of 1 paid in `years` years, at `ratePercent` % a year, compounded annually. */
export function discountFactor(ratePercent: number, years: number): number {
  return 1 / (1 + ratePercent / 100) ** years;
}

/** The present value of `amount` paid in `years` years: amount/(1 + r)^n. */
export function presentValue(amount: number, ratePercent: number, years: number): number {
  return amount * discountFactor(ratePercent, years);
}

/** What the picture shows at the chosen rate and date. */
export function describeDiscounting(ratePercent: number, years: number): string {
  if (years === 0) return 'A payment made today is not discounted: it is worth its full amount.';
  if (ratePercent === 0)
    return 'At a rate of 0 % money does not grow, so a future payment is worth its full amount today.';
  const pv = presentValue(FUTURE_AMOUNT, ratePercent, years);
  return `Saved today at ${fmt(ratePercent, 1)} % a year, ${money(pv)} would grow to exactly ${FUTURE_AMOUNT} in ${years} year${years === 1 ? '' : 's'}.`;
}

/** FM03: choose a rate and a date and see how the present value of 1000 shrinks. */
export function DiscountingExplorer() {
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(3);
  const pv = presentValue(FUTURE_AMOUNT, rate, years);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="years until paid"
        yLabel="value today"
        xTicks={[0, 10, 20, 30]}
        yTicks={[500, 1000]}
      >
        <Segment
          frame={FRAME}
          from={[0, FUTURE_AMOUNT]}
          to={[30, FUTURE_AMOUNT]}
          tone="green"
          dashed
        />
        <Note frame={FRAME} x={29.5} y={FUTURE_AMOUNT + 40} anchor="end">
          amount paid: 1000
        </Note>
        <Curve frame={FRAME} fn={(n) => presentValue(FUTURE_AMOUNT, rate, n)} />
        <Guides frame={FRAME} x={years} y={pv} />
        <Dot frame={FRAME} x={years} y={pv} />
      </Plot>
      <Slider
        label="Interest rate"
        value={rate}
        min={0}
        max={15}
        step={0.5}
        onChange={setRate}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider label="Years until paid" value={years} min={0} max={30} onChange={setYears} />
      <Readout
        items={[
          ['Discount factor', fmt(discountFactor(rate, years), 4)],
          ['Present value', money(pv)],
          ['Lost by waiting', money(FUTURE_AMOUNT - pv)],
        ]}
      />
      <figcaption>
        The curve shows what 1000 paid at each future date is worth today; the dot is your chosen
        date. {describeDiscounting(rate, years)}
      </figcaption>
    </figure>
  );
}
