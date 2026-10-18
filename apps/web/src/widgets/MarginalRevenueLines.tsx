import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Inverse demand P = 120 − 2Q (topic C106, Example 2: at Q = 20, P = 80 and MR = 40).
const A = 120;
const B = 2;
const FRAME = { xMin: 0, xMax: 60, yMin: -125, yMax: 130 };

/** The price buyers pay when Q units are sold: P = 120 − 2Q. */
export const price = (q: number) => A - B * q;

/** Revenue R = P·Q. */
export const revenue = (q: number) => price(q) * q;

/** Marginal revenue R′(Q) = 120 − 4Q: same intercept as demand, twice as steep. */
export const marginalRevenue = (q: number) => A - 2 * B * q;

/** The exact change in revenue from selling unit q + 1, split into its two parts. */
export function oneMoreUnit(q: number) {
  const newPrice = price(q + 1);
  const priceCut = B * q;
  return { newPrice, priceCut, change: newPrice - priceCut };
}

/** Why MR is below the price at q, and what its sign means for revenue. */
export function describeMarginalRevenue(q: number): string {
  const { newPrice, priceCut, change } = oneMoreUnit(q);
  const split =
    q === 0
      ? `The first unit sells for ${fmt(newPrice)} and there are no earlier units to cut the price on.`
      : `Unit ${q + 1} sells for ${fmt(newPrice)}, but the price of the ${q} earlier ${q === 1 ? 'unit' : 'units'} falls by ${B} each, a loss of ${fmt(priceCut)}: revenue changes by ${fmt(change)}, close to MR = ${fmt(marginalRevenue(q))}.`;
  const mr = marginalRevenue(q);
  const sign =
    mr > 0
      ? 'MR is positive, so selling more still raises revenue.'
      : mr < 0
        ? 'MR is negative: selling more now lowers revenue.'
        : 'MR is zero: revenue is at its peak.';
  return `${split} ${sign}`;
}

/** C106: slide along the demand line and compare the price with marginal revenue, which falls twice as fast. */
export function MarginalRevenueLines() {
  const [q, setQ] = useState(20);
  const p = price(q);
  const mr = marginalRevenue(q);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="Q"
        yLabel="P, MR"
        xTicks={[0, 15, 30, 45, 60]}
        yTicks={[-100, 0, 60, 120]}
      >
        <Area
          frame={FRAME}
          points={[
            [0, 0],
            [q, 0],
            [q, p],
            [0, p],
          ]}
          tone="lilac"
        />
        <Curve frame={FRAME} fn={price} />
        <Curve frame={FRAME} fn={marginalRevenue} to={55} tone="gold" />
        <Guides frame={FRAME} x={q} y={p} />
        <Dot frame={FRAME} x={q} y={p} />
        <Dot frame={FRAME} x={q} y={mr} hollow />
        <Note frame={FRAME} x={42} y={42}>
          demand
        </Note>
        <Note frame={FRAME} x={28} y={-22} anchor="end">
          MR
        </Note>
      </Plot>
      <Slider label="Quantity Q" value={q} min={1} max={55} onChange={setQ} />
      <Readout
        items={[
          ['Price P', fmt(p)],
          ['Marginal revenue MR', fmt(mr)],
          ['Revenue P × Q', fmt(revenue(q))],
        ]}
      />
      <figcaption>
        Demand P = 120 − 2Q (lilac) and marginal revenue MR = 120 − 4Q (gold); the shaded rectangle
        is revenue. {describeMarginalRevenue(q)}
      </figcaption>
    </figure>
  );
}
