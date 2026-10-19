import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic DY03, Example 2: demand D(p) = 100 − 2p, supply S(p) = 10 + 3p, and the price moves
// with excess demand, dp/dt = λ(D − S), starting from p(0) = 30 with λ = 0.1 (time in months).
const ALPHA = 100;
const BETA = 2;
const GAMMA = 10;
const DELTA = 3;
const MONTHS = 10;
const FRAME = { xMin: 0, xMax: MONTHS, yMin: 0, yMax: 40 };
/** The kit's plot area in screen pixels, to give every direction mark the same drawn length. */
const PX_WIDTH = 266;
const PX_HEIGHT = 174;

export const demand = (p: number) => ALPHA - BETA * p;
export const supply = (p: number) => GAMMA + DELTA * p;
/** Excess demand D(p) − S(p): positive below the equilibrium price, negative above it. */
export const excessDemand = (p: number) => demand(p) - supply(p);

/** The equilibrium price p* = (α − γ)/(β + δ), where excess demand is zero. */
export const equilibriumPrice = () => (ALPHA - GAMMA) / (BETA + DELTA);

/** The coefficient a = λ(β + δ) in dp/dt + a·p = λ(α − γ). */
export const adjustmentRate = (lambda: number) => lambda * (BETA + DELTA);

/** dp/dt = λ(D(p) − S(p)). */
export const priceSpeed = (lambda: number, p: number) => lambda * excessDemand(p);

/** The solution p(t) = p* + (p(0) − p*)·e^(−at). */
export const priceAt = (lambda: number, start: number, t: number) =>
  equilibriumPrice() + (start - equilibriumPrice()) * Math.exp(-adjustmentRate(lambda) * t);

/** The time for the gap to p* to halve, ln 2/(λ(β + δ)). */
export const halfLife = (lambda: number) => Math.log(2) / adjustmentRate(lambda);

/**
 * A short direction mark centred on (t, p) with the slope dp/dt of the equation there, scaled so
 * that every mark has the same length on screen (`length` pixels).
 */
export function directionMark(
  lambda: number,
  t: number,
  p: number,
  length = 14,
): [[number, number], [number, number]] {
  const slope = priceSpeed(lambda, p);
  const pxPerT = PX_WIDTH / (FRAME.xMax - FRAME.xMin);
  const pxPerP = PX_HEIGHT / (FRAME.yMax - FRAME.yMin);
  const k = length / 2 / Math.hypot(pxPerT, pxPerP * slope);
  return [
    [t - k, p - k * slope],
    [t + k, p + k * slope],
  ];
}

const MARK_TIMES = [1, 3, 5, 7, 9];
const MARK_PRICES = [6, 12, 18, 24, 30, 36];
const MARKS = MARK_TIMES.flatMap((t) => MARK_PRICES.map((p) => ({ id: `m${t}-${p}`, t, p })));

/** What drives the price at the start, in words. */
export function startStory(lambda: number, start: number): string {
  const gap = excessDemand(start);
  const speed = priceSpeed(lambda, start);
  if (Math.abs(gap) < 1e-9)
    return `At p₀ = ${fmt(start)} demand equals supply, so the price stays where it is.`;
  const kind = gap > 0 ? 'excess demand' : 'excess supply';
  const move = gap > 0 ? 'pushes the price up' : 'pulls the price down';
  return `At p₀ = ${fmt(start)} demand is ${fmt(demand(start))} and supply ${fmt(supply(start))}: ${kind} of ${fmt(Math.abs(gap))} ${move}, at first by ${fmt(Math.abs(speed))} a month.`;
}

/** DY03: Walrasian price adjustment. Excess demand moves the price towards equilibrium. */
export function PriceAdjustmentPath() {
  const [lambda, setLambda] = useState(0.1);
  const [start, setStart] = useState(30);
  const star = equilibriumPrice();
  const marks = MARKS.map((m) => ({ ...m, ends: directionMark(lambda, m.t, m.p) }));

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="months t"
        yLabel="price p"
        xTicks={[0, 2, 4, 6, 8, 10]}
        yTicks={[10, 18, 30, 40]}
      >
        {marks.map((m) => (
          <Segment key={m.id} frame={FRAME} from={m.ends[0]} to={m.ends[1]} tone="gold" />
        ))}
        <Segment frame={FRAME} from={[0, star]} to={[MONTHS, star]} tone="green" dashed />
        <Curve frame={FRAME} fn={(t) => priceAt(lambda, start, t)} />
        <Dot frame={FRAME} x={0} y={start} />
        <Dot frame={FRAME} x={5} y={priceAt(lambda, start, 5)} hollow />
        <Note frame={FRAME} x={9.9} y={27} anchor="end">
          ↓
        </Note>
        <Note frame={FRAME} x={9.9} y={9} anchor="end">
          ↑
        </Note>
      </Plot>
      <Slider
        label="Speed of adjustment λ"
        value={lambda}
        min={0.02}
        max={0.4}
        step={0.02}
        onChange={setLambda}
      />
      <Slider label="Starting price p₀" value={start} min={2} max={40} onChange={setStart} />
      <Readout
        items={[
          ['Equilibrium price p*', fmt(star)],
          ['Half-life of the gap', `${fmt(halfLife(lambda))} months`],
          ['Price at t = 5', fmt(priceAt(lambda, start, 5))],
        ]}
      />
      <figcaption>
        Demand D = 100 − 2p, supply S = 10 + 3p and dp/dt = λ(D − S). The lilac curve is the price
        path from the solid dot (the hollow dot is month 5); the dashed line is p* = 18; the gold
        marks show the slope dp/dt at each price, and the arrows on the right are the phase line:
        above p* the price falls, below it the price rises. {startStory(lambda, start)} The gap to
        p* halves every {fmt(halfLife(lambda))} months, whatever the starting price.
      </figcaption>
    </figure>
  );
}
