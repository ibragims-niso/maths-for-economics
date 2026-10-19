import { useState } from 'react';
import { Curve, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

// Output Q = 10·K^a·L^b (topic MV06, Example 2 uses a = 0.3, b = 0.5: D = 3 at (1, 1)).
export const A = 10;
const MAP = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };

/** The input mixes on the diagonal K = L that the three drawn isoquants pass through. */
export const DIAGONAL = [3, 5, 8] as const;

/** Output from K units of capital and L units of labour. */
export const output = (a: number, b: number, K: number, L: number) => A * K ** a * L ** b;

/** The isoquant Q = level, solved for L: L = (level / (A·K^a))^(1/b). */
export const isoquantL = (a: number, b: number, level: number) => (K: number) =>
  (level / (A * K ** a)) ** (1 / b);

/** a + b, rounded so slider steps such as 0.3 + 0.7 give exactly 1. */
export const scaleSum = (a: number, b: number) => Math.round((a + b) * 100) / 100;

/** The Hessian at K = L = 1 and its determinant D = Q_KK·Q_LL − Q_KL². */
export function hessianAtOne(a: number, b: number) {
  const kk = A * a * (a - 1);
  const ll = A * b * (b - 1);
  const kl = A * a * b;
  return { kk, ll, kl, det: kk * ll - kl * kl };
}

/** Concave iff a + b ≤ 1 (for exponents between 0 and 1). */
export function concavity(a: number, b: number): 'yes' | 'yes, just' | 'no' {
  const s = scaleSum(a, b);
  if (s < 1) return 'yes';
  return s === 1 ? 'yes, just' : 'no';
}

/**
 * Two input mixes on the isoquant through (5, 5): where it meets the rays L = 2K and L = K/2.
 * On the ray L = mK the isoquant point is K = 5·m^(−b/(a+b)), L = 5·m^(a/(a+b)).
 */
export function chordOnIsoquant(a: number, b: number): [[number, number], [number, number]] {
  const at = (m: number): [number, number] => [5 * m ** (-b / (a + b)), 5 * m ** (a / (a + b))];
  return [at(2), at(0.5)];
}

/** A round upper limit for an axis: 63 → 70, 15.8 → 20, 631 → 700. */
export function niceMax(v: number): number {
  const step = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / step - 1e-9) * step;
}

/** What the exponents mean for the two pictures. */
export function caption(a: number, b: number): string {
  const s = scaleSum(a, b);
  const iso =
    'The isoquants (top) bow towards the origin for every a and b, and the gold segment joining two mixes on the middle one lies where output is higher: Q is always quasiconcave.';
  if (s < 1)
    return `a + b = ${fmt(s)} < 1: along K = L output grows more and more slowly (decreasing returns to scale), the curve lies above the chord and Q is concave. ${iso}`;
  if (s === 1)
    return `a + b = 1: along K = L output is a straight line (constant returns to scale) and D = 0, so Q is concave, but only just. ${iso}`;
  return `a + b = ${fmt(s)} > 1: along K = L output bends upwards (increasing returns to scale), the curve lies below the chord, D < 0 and Q is not concave. ${iso}`;
}

/** MV06: change the exponents of Q = 10K^a·L^b and compare the isoquants with the cut along K = L. */
export function CobbDouglasCurvature() {
  const [a, setA] = useState(0.3);
  const [b, setB] = useState(0.5);
  const levels = DIAGONAL.map((t) => output(a, b, t, t));
  const [p1, p2] = chordOnIsoquant(a, b);
  const ray = (t: number) => output(a, b, t, t);
  const RAY = { xMin: 0, xMax: 10, yMin: 0, yMax: niceMax(ray(10)) };
  const top = ray(10);
  const { det } = hessianAtOne(a, b);

  return (
    <figure className="widget">
      <Plot
        frame={MAP}
        xLabel="capital K"
        yLabel="labour L"
        xTicks={[0, 3, 5, 8, 10]}
        yTicks={[3, 5, 8]}
      >
        <Segment frame={MAP} from={[0, 0]} to={[10, 10]} tone="green" dashed />
        {levels.map((level, i) => (
          <Curve
            key={DIAGONAL[i]}
            frame={MAP}
            fn={isoquantL(a, b, level)}
            from={0.02}
            to={MAP.xMax}
          />
        ))}
        <Segment frame={MAP} from={p1} to={p2} />
        <Dot frame={MAP} x={p1[0]} y={p1[1]} hollow />
        <Dot frame={MAP} x={p2[0]} y={p2[1]} hollow />
      </Plot>
      <Plot
        frame={RAY}
        xLabel="K = L = t"
        yLabel="Q along K = L"
        xTicks={[0, 2, 5, 8, 10]}
        yTicks={[RAY.yMax / 2, RAY.yMax]}
      >
        <Curve frame={RAY} fn={ray} />
        <Segment frame={RAY} from={[0, 0]} to={[10, top]} dashed />
        <Dot frame={RAY} x={5} y={top / 2} hollow />
        <Dot frame={RAY} x={5} y={ray(5)} />
      </Plot>
      <Slider
        label="Capital exponent a"
        value={a}
        min={0.1}
        max={0.9}
        step={0.05}
        onChange={setA}
      />
      <Slider label="Labour exponent b" value={b} min={0.1} max={0.9} step={0.05} onChange={setB} />
      <Readout
        items={[
          ['a + b', fmt(scaleSum(a, b))],
          ['Concave?', concavity(a, b)],
          ['D at (1, 1)', fmt(det, 2)],
        ]}
      />
      <figcaption>
        Top: isoquants of Q = 10K^a·L^b through (3, 3), (5, 5) and (8, 8); green: the diagonal K =
        L. Bottom: output along the diagonal, the gold chord from t = 0 to t = 10, the curve at t =
        5 (solid) and the middle of the chord (hollow). {caption(a, b)}
      </figcaption>
    </figure>
  );
}
