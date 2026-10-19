import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic DY01, Example 2: demand Q = 100 − 2P(t), supply Q = 30 + δ·P(t − 1) with δ = 1.5,
// and a price of 28 in year 0 after a bad harvest.
const ALPHA = 100;
const BETA = 2;
const GAMMA = 30;
const YEARS = 8;
const MARKET = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 };
const TIME = { xMin: 0, xMax: YEARS, yMin: 0, yMax: 50 };

/** The steady-state price P* = (α − γ)/(β + δ), where demand meets supply. */
export const steadyPrice = (delta: number) => (ALPHA - GAMMA) / (BETA + delta);

/** The factor a = −δ/β in P(t) = b + a·P(t − 1). */
export const cobwebFactor = (delta: number) => -delta / BETA;

/** One year: farmers supply γ + δ·P(t − 1), and the price clears the market for that harvest. */
export const nextPrice = (delta: number, previous: number) =>
  (ALPHA - GAMMA - delta * previous) / BETA;

/** P(0), P(1), …, P(years), by applying the market-clearing rule year after year. */
export function cobwebPrices(delta: number, start: number, years = YEARS): number[] {
  const prices = [start];
  for (let t = 1; t <= years; t++) prices.push(nextPrice(delta, prices[t - 1] ?? start));
  return prices;
}

/** Whether the price settles, keeps cycling or swings ever wider. */
export function cobwebVerdict(delta: number): 'converges' | 'cycles' | 'explodes' {
  const m = Math.abs(cobwebFactor(delta));
  if (Math.abs(m - 1) < 1e-9) return 'cycles';
  return m < 1 ? 'converges' : 'explodes';
}

/**
 * The corners of the cobweb in the (Q, P) plane: from (Q₁, P₀) on the supply line down or up to
 * (Q₁, P₁) on the demand line, across to (Q₂, P₁) on supply, and so on.
 */
export function cobwebCorners(delta: number, prices: number[]): [number, number][] {
  const corners: [number, number][] = [];
  for (let t = 1; t < prices.length; t++) {
    const before = prices[t - 1] ?? 0;
    const harvest = GAMMA + delta * before;
    corners.push([harvest, before], [harvest, prices[t] ?? 0]);
  }
  return corners;
}

/** The prices up to (not including) the first negative one: there the linear model breaks down. */
export function pricesWhileValid(prices: number[]): number[] {
  const end = prices.findIndex((p) => p < 0);
  return end === -1 ? prices : prices.slice(0, end);
}

/** Where to write "supply": near the top end of the supply line, inside the frame. */
export function supplyLabel(delta: number): [number, number] {
  const top = GAMMA + 46 * delta;
  return top <= 96 ? [top - 3, 46] : [96, (96 - GAMMA) / delta + 3];
}

const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈'];

const VERDICT_TEXT = {
  converges:
    'Supply reacts less than demand (δ < β, so |a| < 1): each swing is smaller than the last and the price spirals in to P*.',
  cycles:
    'Supply reacts exactly as strongly as demand (δ = β, so a = −1): the price jumps between the same two values for ever.',
  explodes:
    'Supply reacts more than demand (δ > β, so |a| > 1): each swing is bigger than the last and the price spirals away from P*.',
} as const;

/** DY01: the cobweb model. Farmers plant on last year's price; the path spirals in or out. */
export function CobwebDiagram() {
  const [delta, setDelta] = useState(1.5);
  const [start, setStart] = useState(28);
  const prices = pricesWhileValid(cobwebPrices(delta, start));
  const corners = cobwebCorners(delta, prices);
  const star = steadyPrice(delta);
  const verdict = cobwebVerdict(delta);
  const [labelQ, labelP] = supplyLabel(delta);
  const listed = prices
    .slice(1, 4)
    .map((p, t) => `P${SUB[t + 1]} = ${fmt(p)}`)
    .join(', ');
  const last = prices.length - 1;
  // One named leg per line of the cobweb and per year of the time path.
  const legs = corners.slice(1).map((to, i) => ({ id: `leg${i + 1}`, from: corners[i] ?? to, to }));
  const years = prices.slice(1).map((p, t) => ({
    id: `year${t + 1}`,
    from: [t, prices[t] ?? 0] as [number, number],
    to: [t + 1, p] as [number, number],
  }));
  const path =
    last === YEARS
      ? `${listed}, …, P₈ = ${fmt(prices[YEARS] ?? 0)}.`
      : `${listed ? `${listed}. ` : ''}In year ${last + 1} the price would be negative, so the straight-line model breaks down and the path stops.`;

  return (
    <figure className="widget">
      <Plot frame={MARKET} xLabel="Q" yLabel="P" xTicks={[0, 30, 60, 90]} yTicks={[10, 20, 30, 40]}>
        <Curve frame={MARKET} fn={(q) => (ALPHA - q) / BETA} />
        <Curve frame={MARKET} fn={(q) => (q - GAMMA) / delta} from={GAMMA} tone="green" />
        {legs.map((leg) => (
          <Segment key={leg.id} frame={MARKET} from={leg.from} to={leg.to} />
        ))}
        <Dot frame={MARKET} x={GAMMA + delta * star} y={star} hollow />
        <Dot frame={MARKET} x={GAMMA + delta * start} y={start} />
        <Note frame={MARKET} x={2} y={32}>
          demand
        </Note>
        <Note frame={MARKET} x={labelQ} y={labelP} anchor="end">
          supply
        </Note>
      </Plot>
      <Plot
        frame={TIME}
        xLabel="year t"
        yLabel="price Pₜ"
        xTicks={[0, 2, 4, 6, 8]}
        yTicks={[10, 20, 30, 40]}
      >
        <Segment frame={TIME} from={[0, star]} to={[YEARS, star]} tone="green" dashed />
        {years.map((year) => (
          <Segment key={year.id} frame={TIME} from={year.from} to={year.to} tone="lilac" />
        ))}
        <Dot frame={TIME} x={0} y={start} />
        {last > 0 && last < YEARS && <Dot frame={TIME} x={last} y={prices[last] ?? start} hollow />}
      </Plot>
      <Slider
        label="Supply response δ (demand slope β = 2)"
        value={delta}
        min={0.5}
        max={3}
        step={0.25}
        onChange={setDelta}
      />
      <Slider label="Starting price P₀" value={start} min={5} max={45} onChange={setStart} />
      <Readout
        items={[
          ['Steady-state price P*', fmt(star)],
          ['Factor a = −δ/β', fmt(cobwebFactor(delta))],
          ['Path', verdict],
        ]}
      />
      <figcaption>
        Top: demand (lilac) and supply (green); the gold cobweb starts at the solid dot, and the
        hollow dot is the steady state. Bottom: the price year by year, with P* dashed: {path}{' '}
        {VERDICT_TEXT[verdict]}
      </figcaption>
    </figure>
  );
}
