import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Slider } from './kit';

// Q = K^a·L^b along the ray K = L = t (topic MV04; Example 2 uses a = 0.25, b = 0.75).
const FRAME = { xMin: 0, xMax: 2.6, yMin: 0, yMax: 5 };
const HALF_BAR = 0.08;

/** a + b, rounded so slider steps such as 0.25 + 0.75 give exactly 1. */
export const scaleSum = (a: number, b: number) => Math.round((a + b) * 100) / 100;

/** Output from K units of capital and L units of labour. */
export const output = (a: number, b: number, K: number, L: number) => K ** a * L ** b;

/** Output when both inputs are t: Q(t, t) = t^(a+b)·Q(1, 1), and Q(1, 1) = 1. */
export const rayOutput = (a: number, b: number, t: number) => t ** (a + b);

/** What each input earns if paid its marginal product: K·MP_K = a·Q and L·MP_L = b·Q. */
export function eulerSplit(a: number, b: number, K: number, L: number) {
  const q = output(a, b, K, L);
  const capital = K * a * K ** (a - 1) * L ** b;
  const labour = L * b * K ** a * L ** (b - 1);
  return { q, capital, labour, total: capital + labour };
}

/** The payments as a percentage of output: 100·(a + b) by Euler's theorem. */
export const paidPercent = (a: number, b: number) => Math.round(scaleSum(a, b) * 100);

/** What the picture shows for these exponents. */
export function caption(a: number, b: number): string {
  const s = scaleSum(a, b);
  const p = paidPercent(a, b);
  if (s < 1)
    return `a + b = ${fmt(s)} < 1, decreasing returns to scale: past the start the curve stays below the dashed line, and paying each input its marginal product uses only ${p} % of output, so ${100 - p} % is left over as profit.`;
  if (s === 1)
    return 'a + b = 1, constant returns to scale: the curve is the dashed straight line, and the bar ends exactly at the dot. Paying each input its marginal product uses up the whole output, with nothing left over and nothing missing (product exhaustion).';
  return `a + b = ${fmt(s)} > 1, increasing returns to scale: past the start the curve climbs above the dashed line, and paying each input its marginal product would cost ${p} % of output, more than the firm produces.`;
}

/** MV04: scale both inputs of Q = K^a·L^b by t and compare output with the Euler split a·Q + b·Q. */
export function EulerReturnsToScale() {
  const [a, setA] = useState(0.25);
  const [b, setB] = useState(0.75);
  const [t, setT] = useState(2);
  const { q, capital, total } = eulerSplit(a, b, t, t);
  const left = t - HALF_BAR;
  const right = t + HALF_BAR;
  // Labels to the right of the bar, kept one text line apart; hidden when the bar is too short.
  const showNotes = total >= 1.2;
  const noteX = right + 0.05;
  const capitalY = Math.max(capital / 2, 0.15);
  const labourY = Math.max((capital + total) / 2, capitalY + 0.45);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="t"
        yLabel="output Q"
        xTicks={[0, 0.5, 1, 1.5, 2, 2.5]}
        yTicks={[1, 2, 3, 4, 5]}
      >
        <Curve frame={FRAME} fn={(x) => x} tone="green" dashed />
        <Area
          frame={FRAME}
          points={[
            [left, 0],
            [right, 0],
            [right, capital],
            [left, capital],
          ]}
          tone="green"
        />
        <Area
          frame={FRAME}
          points={[
            [left, capital],
            [right, capital],
            [right, total],
            [left, total],
          ]}
        />
        <Curve frame={FRAME} fn={(x) => rayOutput(a, b, x)} from={0.01} />
        {showNotes && (
          <Note frame={FRAME} x={noteX} y={capitalY}>
            capital
          </Note>
        )}
        {showNotes && (
          <Note frame={FRAME} x={noteX} y={labourY}>
            labour
          </Note>
        )}
        <Dot frame={FRAME} x={1} y={1} hollow />
        <Dot frame={FRAME} x={t} y={q} />
      </Plot>
      <Slider
        label="Capital exponent a"
        value={a}
        min={0.1}
        max={0.8}
        step={0.05}
        onChange={setA}
      />
      <Slider label="Labour exponent b" value={b} min={0.1} max={0.8} step={0.05} onChange={setB} />
      <Slider label="Scale t" value={t} min={0.5} max={2} step={0.1} onChange={setT} />
      <Readout
        items={[
          ['a + b', fmt(scaleSum(a, b))],
          ['Q(t, t) ÷ Q(1, 1)', fmt(rayOutput(a, b, t))],
          ['Paid at marginal products', `${paidPercent(a, b)} % of Q`],
        ]}
      />
      <figcaption>
        Q = K^a·L^b with both inputs equal to t, starting from K = L = 1 (hollow dot). Lilac: output
        as t grows; dashed green: output growing in proportion to t. The bar at t stacks what
        capital (green, K·MP_K) and labour (gold, L·MP_L) earn when each input is paid its marginal
        product; the solid dot is the output there. {caption(a, b)}
      </figcaption>
    </figure>
  );
}
