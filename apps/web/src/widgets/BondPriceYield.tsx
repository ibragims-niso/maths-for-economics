import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// A 10-year bond with annual coupons, priced per 100 of face value (topic FM07, Example 2).
const FACE = 100;
const YEARS = 10;
const FRAME = { xMin: 0, xMax: 15, yMin: 0, yMax: 200 };

/**
 * Price per `face` of a bond with annual coupons at a yield (both rates as decimals):
 * C(1 − (1 + y)^(−n))/y + F/(1 + y)^n, and simply nC + F when the yield is 0.
 */
export function bondPrice(couponRate: number, yieldRate: number, years = YEARS, face = FACE) {
  const coupon = couponRate * face;
  if (yieldRate === 0) return years * coupon + face;
  return (coupon * (1 - (1 + yieldRate) ** -years)) / yieldRate + face / (1 + yieldRate) ** years;
}

/** Current yield: the yearly coupon divided by today's price. */
export function currentYield(couponRate: number, price: number, face = FACE): number {
  return (couponRate * face) / price;
}

/** Premium, par or discount: compares the coupon rate with the market yield. */
export function priceStatus(couponRate: number, yieldRate: number): 'premium' | 'par' | 'discount' {
  if (Math.abs(couponRate - yieldRate) < 1e-12) return 'par';
  return couponRate > yieldRate ? 'premium' : 'discount';
}

/** FM07: move the coupon rate and the market yield of a 10-year bond; watch the price react. */
export function BondPriceYield() {
  const [couponPct, setCouponPct] = useState(5);
  const [yieldPct, setYieldPct] = useState(6);
  const c = couponPct / 100;
  const y = yieldPct / 100;
  const price = bondPrice(c, y);
  const status = priceStatus(c, y);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="yield y (%)"
        yLabel="price per 100"
        xTicks={[0, 5, 10, 15]}
        yTicks={[50, 100, 150, 200]}
      >
        <Segment frame={FRAME} from={[0, FACE]} to={[FRAME.xMax, FACE]} dashed />
        <Note frame={FRAME} x={14.6} y={FACE + 7} anchor="end">
          par
        </Note>
        <Curve frame={FRAME} fn={(x) => bondPrice(c, x / 100)} />
        <Dot frame={FRAME} x={couponPct} y={FACE} hollow />
        <Guides frame={FRAME} x={yieldPct} y={price} />
        <Dot frame={FRAME} x={yieldPct} y={price} />
      </Plot>
      <Slider
        label="Coupon rate"
        value={couponPct}
        min={0}
        max={10}
        step={0.5}
        onChange={setCouponPct}
        format={(v) => `${fmt(v)} %`}
      />
      <Slider
        label="Market yield y"
        value={yieldPct}
        min={1}
        max={12}
        step={0.25}
        onChange={setYieldPct}
        format={(v) => `${fmt(v)} %`}
      />
      <Readout
        items={[
          ['Price per 100', fmt(price)],
          ['Trades at', status],
          ['Current yield', `${fmt(currentYield(c, price) * 100)} %`],
        ]}
      />
      <figcaption>
        The curve is the price of a {YEARS}-year bond paying {fmt(couponPct)} % of its face value
        each year, for every market yield. It slopes down: a higher yield discounts the same
        payments more heavily. It crosses the dashed par line (hollow dot) where the yield equals
        the coupon rate, and it is convex, so a fall in the yield raises the price by more than an
        equal rise lowers it. At a yield of {fmt(yieldPct)} % the bond trades at{' '}
        {status === 'par' ? 'par' : `a ${status}`}
        {status === 'par'
          ? ''
          : ` (${fmt(Math.abs(price - FACE))} ${status === 'premium' ? 'above' : 'below'} 100)`}
        .
      </figcaption>
    </figure>
  );
}
