import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Inverse demand P = 100 − 2Q and inverse supply P = 10 + Q (topic C114, Examples 1 and 2).
const A = 100;
const B = 2;
const C = 10;
const D = 1;
const FRAME = { xMin: 0, xMax: 45, yMin: 0, yMax: 110 };

/** The most a buyer of the Q-th unit would pay. */
export const demandPrice = (q: number) => A - B * q;

/** The least a seller needs to supply the Q-th unit. */
export const supplyPrice = (q: number) => C + D * q;

/** Welfare with a per-unit tax t on the market: quantity, both prices and the four areas. */
export function welfare(tax: number) {
  const quantity = Math.max(0, (A - C - tax) / (B + D));
  const noTax = (A - C) / (B + D);
  const buyers = demandPrice(quantity);
  const sellers = buyers - tax;
  return {
    quantity,
    buyers,
    sellers,
    // ∫₀^Qₜ D(Q) dQ − Pb·Qₜ, a triangle because demand is a straight line.
    consumer: ((A - buyers) * quantity) / 2,
    // Ps·Qₜ − ∫₀^Qₜ S(Q) dQ.
    producer: ((sellers - C) * quantity) / 2,
    revenue: tax * quantity,
    // ∫ from Qₜ to Q* of D(Q) − S(Q): the triangle with height t and base Q* − Qₜ.
    deadweight: (tax * (noTax - quantity)) / 2,
  };
}

/** C114: a per-unit tax splits the gains from trade into CS, PS, tax revenue and a lost triangle. */
export function SurplusTaxWelfare() {
  const [tax, setTax] = useState(18);
  const w = welfare(tax);
  const q = w.quantity;
  const noTax = (A - C) / (B + D);
  const lost: [number, number][] = [
    [q, w.buyers],
    [noTax, supplyPrice(noTax)],
    [q, w.sellers],
  ];
  // The height of the triangle's centre: the mean of its three corners.
  const mid = (w.buyers + w.sellers + supplyPrice(noTax)) / 3;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="quantity Q"
        yLabel="price P"
        xTicks={[0, 10, 20, 30, 40]}
        yTicks={[0, 20, 40, 60, 80, 100]}
      >
        <Area
          frame={FRAME}
          top={demandPrice}
          bottom={() => w.buyers}
          from={0}
          to={q}
          tone="lilac"
        />
        <Area
          frame={FRAME}
          top={() => w.sellers}
          bottom={supplyPrice}
          from={0}
          to={q}
          tone="green"
        />
        {tax > 0 && (
          <Area frame={FRAME} top={() => w.buyers} bottom={() => w.sellers} from={0} to={q} />
        )}
        {tax > 0 && (
          // The lost triangle: both tints together, so it differs from the three named areas.
          <>
            <Area frame={FRAME} points={lost} tone="lilac" />
            <Area frame={FRAME} points={lost} tone="green" />
          </>
        )}
        <Curve frame={FRAME} fn={demandPrice} from={0} to={40} />
        <Curve frame={FRAME} fn={supplyPrice} from={0} to={40} tone="green" />
        {tax > 0 && <Segment frame={FRAME} from={[q, w.buyers]} to={[q, w.sellers]} />}
        <Guides frame={FRAME} x={q} y={w.buyers} />
        <Dot frame={FRAME} x={q} y={w.buyers} />
        {tax > 0 && <Dot frame={FRAME} x={q} y={w.sellers} hollow />}
        {/* Names inside the triangles, only while they are big enough to hold them. */}
        {q >= 12 && (
          <Note frame={FRAME} x={q / 3} y={w.buyers + (A - w.buyers) / 3 - 2}>
            CS
          </Note>
        )}
        {q >= 16 && (
          <Note frame={FRAME} x={q / 3} y={w.sellers - (w.sellers - C) / 3 - 2}>
            PS
          </Note>
        )}
        {tax >= 12 && q >= 6 && (
          <Note frame={FRAME} x={q / 2} y={(w.buyers + w.sellers) / 2 - 3} anchor="middle">
            tax
          </Note>
        )}
        {tax >= 4 && (
          // A gold pointer from the middle of the lost triangle to its name, in the empty corner.
          <>
            <Segment
              frame={FRAME}
              from={[(2 * q + noTax) / 3, mid]}
              to={[noTax + 1.5, 22]}
              dashed
            />
            <Note frame={FRAME} x={noTax - 1} y={15}>
              DWL
            </Note>
          </>
        )}
      </Plot>
      <Slider label="Tax per unit t" value={tax} min={0} max={60} step={3} onChange={setTax} />
      <Readout
        items={[
          ['Consumer surplus', fmt(w.consumer)],
          ['Producer surplus', fmt(w.producer)],
          ['Deadweight loss', fmt(w.deadweight)],
        ]}
      />
      <figcaption>
        Demand P = 100 − 2Q (lilac line), supply P = 10 + Q (green line). Buyers pay {fmt(w.buyers)}{' '}
        and sellers keep {fmt(w.sellers)}; {fmt(q)} units are traded.
        {tax > 0
          ? ` The gold rectangle is the tax revenue, ${fmt(w.revenue)}; the shaded triangle between the lines, right of the gold bar, is the deadweight loss: trades that no longer happen.`
          : ' With no tax, consumer and producer surplus share all the gains from trade.'}
      </figcaption>
    </figure>
  );
}
