import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// One day's sales (topic LA102, Example 1): rows are shops A and B, columns bread, milk, coffee.
export const SALES = [
  [40, 25, 10],
  [30, 50, 20],
] as const;
export const MILK_PRICE = 3;
const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 600 };

/** The matrix–vector product Qp: each entry is one row of Q times the price vector p. */
export function revenueVector(q: readonly (readonly number[])[], p: readonly number[]): number[] {
  return q.map((row) => row.reduce((sum, x, k) => sum + x * (p[k] ?? 0), 0));
}

/** The revenue of shop `shop` (0 = A, 1 = B) as a function of the coffee price. */
export function revenueAtCoffeePrice(shop: 0 | 1, bread: number, coffee: number): number {
  return revenueVector(SALES, [bread, MILK_PRICE, coffee])[shop] ?? 0;
}

/** LA102: change two prices and watch the revenue vector Qp; each shop's line rises at its coffee sales. */
export function ShopRevenueMatrix() {
  const [bread, setBread] = useState(2);
  const [coffee, setCoffee] = useState(5);
  const [a = 0, b = 0] = revenueVector(SALES, [bread, MILK_PRICE, coffee]);
  const lineA = (c: number) => revenueAtCoffeePrice(0, bread, c);
  const lineB = (c: number) => revenueAtCoffeePrice(1, bread, c);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="coffee price"
        yLabel="revenue"
        xTicks={[0, 2, 4, 6, 8, 10]}
        yTicks={[100, 300, 500]}
      >
        <Segment frame={FRAME} from={[coffee, 0]} to={[coffee, FRAME.yMax]} dashed />
        <Curve frame={FRAME} fn={lineB} tone="green" />
        <Curve frame={FRAME} fn={lineA} />
        <Note frame={FRAME} x={9.8} y={lineB(9.8) + 25} anchor="end">
          Shop B
        </Note>
        <Note frame={FRAME} x={9.8} y={lineA(9.8) - 70} anchor="end">
          Shop A
        </Note>
        <Dot frame={FRAME} x={coffee} y={b} hollow />
        <Dot frame={FRAME} x={coffee} y={a} />
      </Plot>
      <Slider label="Price of bread" value={bread} min={0} max={6} step={0.5} onChange={setBread} />
      <Slider
        label="Price of coffee"
        value={coffee}
        min={0}
        max={10}
        step={0.5}
        onChange={setCoffee}
      />
      <Readout
        items={[
          ['Shop A revenue', fmt(a)],
          ['Shop B revenue', fmt(b)],
          ['Both shops', fmt(a + b)],
        ]}
      />
      <figcaption>
        Sales matrix Q: shop A sells 40 bread, 25 milk, 10 coffee; shop B sells 30 bread, 50 milk,
        20 coffee. With prices p = ({fmt(bread)}, {MILK_PRICE}, {fmt(coffee)}) the revenue vector is
        Qp = ({fmt(a)}, {fmt(b)}). Each line is one shop's revenue as the coffee price changes; its
        slope, 10 for A and 20 for B, is the coffee column of Q.
      </figcaption>
    </figure>
  );
}
