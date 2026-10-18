import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Demand Q = 120 − bP (topic F10, Example 2 has b = 4). The frame is about 1.5 times wider than
// it is tall, like the plot area, so one unit is the same length on both axes and the mirror
// image in y = x really looks like a reflection.
const A = 120;
const FRAME = { xMin: 0, xMax: 200, yMin: 0, yMax: 130 };

/** Demand: the quantity bought at price p. */
export const demandQuantity = (a: number, b: number, p: number) => a - b * p;

/** Inverse demand: the price at which quantity q sells, P = (a − Q)/b. */
export const inverseDemandPrice = (a: number, b: number, q: number) => (a - q) / b;

/** The mirror image of a point in the line y = x: the two coordinates swap. */
export const mirror = ([x, y]: [number, number]): [number, number] => [y, x];

/** F10: demand and inverse demand are the same line reflected in y = x; move a point and its mirror. */
export function InverseDemandMirror() {
  const [b, setB] = useState(4);
  const [price, setPrice] = useState(10);
  const top = A / b;
  const p = Math.min(price, top);
  const q = demandQuantity(A, b, p);
  const [mx, my] = mirror([p, q]);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="x"
        yLabel="y"
        xTicks={[0, 40, 80, 120, 160]}
        yTicks={[40, 80, 120]}
      >
        <Curve frame={FRAME} fn={(v) => v} tone="gold" dashed />
        <Curve frame={FRAME} fn={(v) => demandQuantity(A, b, v)} from={0} to={top} />
        <Curve frame={FRAME} fn={(v) => inverseDemandPrice(A, b, v)} from={0} to={A} tone="green" />
        <Guides frame={FRAME} x={p} y={q} />
        <Guides frame={FRAME} x={mx} y={my} />
        <Dot frame={FRAME} x={p} y={q} />
        <Dot frame={FRAME} x={mx} y={my} hollow />
        <Note frame={FRAME} x={(A - 104) / b + 6} y={104}>
          Q = {A} − {b}P
        </Note>
        <Note frame={FRAME} x={A + 4} y={7}>
          P = {fmt(top)} − Q/{b}
        </Note>
        <Note frame={FRAME} x={132} y={116}>
          y = x
        </Note>
      </Plot>
      <Slider label="Price P" value={p} min={0} max={top} onChange={setPrice} />
      <Slider label="Slope b" value={b} min={2} max={6} onChange={setB} />
      <Readout
        items={[
          ['Point on demand (P, Q)', `(${fmt(p)}, ${fmt(q)})`],
          ['Mirror point (Q, P)', `(${fmt(mx)}, ${fmt(my)})`],
          ['Inverse demand', `P(${fmt(q)}) = ${fmt(inverseDemandPrice(A, b, q))}`],
        ]}
      />
      <figcaption>
        The lilac line is demand Q = {A} − {b}P, drawn with the price across and the quantity up.
        The green line is inverse demand P = {fmt(top)} − Q/{b}, with the quantity across and the
        price up: the same line reflected in the dashed line y = x. The filled point (P, Q) and the
        hollow point (Q, P) are mirror images.
      </figcaption>
    </figure>
  );
}
