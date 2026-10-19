import { useState } from 'react';
import { Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

/** Share price today and the call's strike in the widget (worked examples 1–3 in SP04). */
export const S0 = 100;
export const STRIKE = 100;

const FRAME = { xMin: 0, xMax: 4.4, yMin: 0, yMax: 7 };

/** Where node (t, ups) sits in the picture: time to the right, more rises higher up. */
const at = (t: number, ups: number): [number, number] => [1 + 1.2 * t, 3.5 + 1.3 * (2 * ups - t)];

export interface BinomialTree {
  /** Gross risk-free return per period, R = 1 + r. */
  gross: number;
  /** False when R ≥ u or R ≤ d: then a riskless profit exists and no price makes sense. */
  noArbitrage: boolean;
  /** Risk-neutral probability of a rise, q = (R − d)/(u − d). */
  q: number;
  /** Share prices by period; in each list the node with the most rises comes first. */
  prices: number[][];
  /** Call values at every node, by backward induction from max(S − K, 0). */
  calls: number[][];
  /** Shares held today in the portfolio that copies the call, Δ = (C_u − C_d)/(S_u − S_d). */
  delta: number;
  /** The European put with the same strike, from put–call parity P = C − S₀ + K/R². */
  put: number;
}

/** A two-period binomial tree for a call with strike K on a share worth S₀ today. */
export function binomialTree(
  u: number,
  d: number,
  ratePct: number,
  s0 = S0,
  strike = STRIKE,
): BinomialTree {
  const gross = 1 + ratePct / 100;
  const q = (gross - d) / (u - d);
  const prices = [[s0], [s0 * u, s0 * d], [s0 * u * u, s0 * u * d, s0 * d * d]];
  const last = (prices[2] ?? []).map((s) => Math.max(s - strike, 0));
  const step = (next: number[]) =>
    next.slice(1).map((down, i) => (q * (next[i] ?? 0) + (1 - q) * down) / gross);
  const middle = step(last);
  const calls = [step(middle), middle, last];
  const [cu = 0, cd = 0] = middle;
  const [su = 0, sd = 0] = prices[1] ?? [];
  const c0 = calls[0]?.[0] ?? 0;
  return {
    gross,
    noArbitrage: d < gross && gross < u,
    q,
    prices,
    calls,
    delta: (cu - cd) / (su - sd),
    put: c0 - s0 + strike / gross ** 2,
  };
}

/** The caption: how the tree was solved, or why it cannot be. */
export function describeTree(tree: BinomialTree, u: number): string {
  if (!tree.noArbitrage) {
    return `R = ${fmt(tree.gross)} is not below u = ${fmt(u)}: lending at the risk-free rate does at least as well as the share even after a rise, so selling the share and lending the money is a riskless profit. Prices only make sense when d < R < u.`;
  }
  return `Each node shows the share price S and the call value C (strike ${STRIKE}). At the end C = max(S − ${STRIKE}, 0); hollow dots are where the call expires worthless. Earlier nodes use C = [q·C_up + (1 − q)·C_down]/R. The put with the same strike is worth ${fmt(tree.put)} by put–call parity. q is a pricing weight, not the real chance of a rise.`;
}

/** SP04: a two-period binomial tree; change u, d and r and watch q, Δ and the call price. */
export function BinomialOptionTree() {
  const [u, setU] = useState(1.25);
  const [d, setD] = useState(0.9);
  const [rate, setRate] = useState(4);
  const tree = binomialTree(u, d, rate);
  const ok = tree.noArbitrage;
  const nodes = tree.prices.flatMap((row, t) =>
    row.map((s, i) => ({ t, ups: t - i, s, c: tree.calls[t]?.[i] ?? 0 })),
  );

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="time" yLabel="more rises ↑">
        {nodes
          .filter((n) => n.t < 2)
          .flatMap((n) => [
            <Segment
              key={`${n.t}-${n.ups}-up`}
              frame={FRAME}
              from={at(n.t, n.ups)}
              to={at(n.t + 1, n.ups + 1)}
              tone="lilac"
            />,
            <Segment
              key={`${n.t}-${n.ups}-down`}
              frame={FRAME}
              from={at(n.t, n.ups)}
              to={at(n.t + 1, n.ups)}
              tone="lilac"
            />,
          ])}
        {nodes.map((n) => {
          const [x, y] = at(n.t, n.ups);
          // Labels sit where no branch passes: left of today, outside the middle nodes, right at the end.
          const place =
            n.t === 0
              ? { x: x - 0.14, y1: y + 0.2, y2: y - 0.35, anchor: 'end' as const }
              : n.t === 2
                ? { x: x + 0.14, y1: y + 0.45, y2: y - 0.1, anchor: 'start' as const }
                : n.ups === 1
                  ? { x: x - 0.1, y1: y + 0.95, y2: y + 0.4, anchor: 'end' as const }
                  : { x: x - 0.1, y1: y - 0.45, y2: y - 1, anchor: 'end' as const };
          return (
            <g key={`${n.t}-${n.ups}`}>
              <Dot frame={FRAME} x={x} y={y} hollow={n.t === 2 && n.c === 0} />
              <Note frame={FRAME} x={place.x} y={place.y1} anchor={place.anchor}>
                S {fmt(n.s)}
              </Note>
              <Note frame={FRAME} x={place.x} y={place.y2} anchor={place.anchor}>
                C {ok ? fmt(n.c) : '—'}
              </Note>
            </g>
          );
        })}
      </Plot>
      <Slider label="Up factor u" value={u} min={1.05} max={1.5} step={0.05} onChange={setU} />
      <Slider label="Down factor d" value={d} min={0.5} max={0.95} step={0.05} onChange={setD} />
      <Slider
        label="Interest rate r per period"
        value={rate}
        min={0}
        max={10}
        onChange={setRate}
        format={(v) => `${v} %`}
      />
      <Readout
        items={[
          ['Risk-neutral q', ok ? fmt(tree.q, 3) : '—'],
          ['Shares Δ today', ok ? fmt(tree.delta, 3) : '—'],
          ['Call today C₀', ok ? fmt(tree.calls[0]?.[0] ?? 0) : '—'],
        ]}
      />
      <figcaption>{describeTree(tree, u)}</figcaption>
    </figure>
  );
}
