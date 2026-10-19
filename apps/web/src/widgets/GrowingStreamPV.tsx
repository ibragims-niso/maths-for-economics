import { useState } from 'react';
import { Area, Curve, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

/** The income stream of C115 Example 2: f(t) = 100 + 20t thousand per year. */
export const START = 100;
export const GROWTH = 20;

const FRAME = { xMin: 0, xMax: 20, yMin: 0, yMax: 560 };

/** Money with two decimals: 1508.5707 → "1,508.57". */
export const money = (v: number) =>
  v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The income rate at time t, a + bt. */
export const incomeRate = (t: number) => START + GROWTH * t;

/** The same income discounted to today: (a + bt)·e^(−rt). */
export function discountedRate(t: number, ratePercent: number): number {
  return incomeRate(t) * Math.exp((-ratePercent / 100) * t);
}

/** Total income over T years with no discounting: aT + bT²/2. */
export function undiscountedTotal(years: number): number {
  return START * years + (GROWTH * years * years) / 2;
}

/**
 * Present value ∫₀ᵀ (a + bt)e^(−rt) dt by the parts formula:
 * a(1 − e^(−rT))/r + b[(1 − e^(−rT))/r² − T·e^(−rT)/r].
 */
export function streamPresentValue(ratePercent: number, years: number): number {
  const r = ratePercent / 100;
  if (r === 0) return undiscountedTotal(years);
  const end = Math.exp(-r * years);
  return START * ((1 - end) / r) + GROWTH * ((1 - end) / (r * r) - (years * end) / r);
}

/** What the picture shows at the chosen rate and horizon. */
export function describeStream(ratePercent: number, years: number): string {
  if (ratePercent === 0)
    return 'At a rate of 0 % nothing is discounted: the two curves coincide and the present value equals the plain total.';
  const share = 1 - streamPresentValue(ratePercent, years) / undiscountedTotal(years);
  return `At ${fmt(ratePercent, 1)} % over ${years} year${years === 1 ? '' : 's'}, discounting removes ${fmt(100 * share, 1)} % of the total. Later income is both larger and more heavily discounted.`;
}

/** C115: the income stream 100 + 20t and its discounted value; the area is the present value. */
export function GrowingStreamPV() {
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const pv = streamPresentValue(rate, years);
  const total = undiscountedTotal(years);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="years t"
        yLabel="income per year"
        xTicks={[0, 5, 10, 15, 20]}
        yTicks={[100, 300, 500]}
      >
        <Area
          frame={FRAME}
          top={incomeRate}
          bottom={(t) => discountedRate(t, rate)}
          from={0}
          to={years}
          tone="gold"
        />
        <Area frame={FRAME} top={(t) => discountedRate(t, rate)} from={0} to={years} tone="lilac" />
        <Curve frame={FRAME} fn={incomeRate} from={0} to={years} tone="green" />
        <Curve frame={FRAME} fn={(t) => discountedRate(t, rate)} from={0} to={years} />
        <Segment
          frame={FRAME}
          from={[years, 0]}
          to={[years, incomeRate(years)]}
          tone="green"
          dashed
        />
        <Note frame={FRAME} x={0.4} y={Math.min(incomeRate(years) + 30, 470)}>
          income 100 + 20t
        </Note>
        <Note frame={FRAME} x={0.4} y={30}>
          discounted
        </Note>
      </Plot>
      <Slider
        label="Discount rate r"
        value={rate}
        min={0}
        max={15}
        step={0.5}
        onChange={setRate}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider label="Years T" value={years} min={1} max={20} onChange={setYears} />
      <Readout
        items={[
          ['Undiscounted total', money(total)],
          ['Present value', money(pv)],
          ['Discount loss', money(total - pv)],
        ]}
      />
      <figcaption>
        The green line is the income rate 100 + 20t (thousand per year) and the purple curve is the
        same income discounted to today, (100 + 20t)e^(−rt). The purple area is the present value;
        the gold band between the two is what discounting takes away. {describeStream(rate, years)}
      </figcaption>
    </figure>
  );
}
