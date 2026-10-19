import { Fragment, useState } from 'react';
import { Area, Curve, fmt, Plot, Readout, Segment, Slider } from './kit';

// The marginal cost of topic C113, Example 1: MC(q) = 10 + 0.4q + 0.03q².
const C = 10;
const D = 0.4;
const E = 0.03;
const FRAME = { xMin: 0, xMax: 30, yMin: 0, yMax: 50 };

/** Marginal cost MC(q) = 10 + 0.4q + 0.03q². */
export function marginalCost(q: number): number {
  return C + D * q + E * q ** 2;
}

/** An antiderivative of marginal cost: F(q) = 10q + 0.2q² + 0.01q³. */
export function antiderivative(q: number): number {
  return C * q + (D / 2) * q ** 2 + (E / 3) * q ** 3;
}

/** The exact integral of MC from a to b, F(b) − F(a); negative when a > b. */
export function exactIntegral(a: number, b: number): number {
  return antiderivative(b) - antiderivative(a);
}

/** The left ends of the n strips from a towards b (strip width (b − a)/n, which may be negative). */
export function samplePoints(a: number, b: number, n: number): number[] {
  const width = (b - a) / n;
  return Array.from({ length: n }, (_, i) => a + i * width);
}

/** The Riemann sum with n rectangles, each as high as MC at the left end of its strip. */
export function riemannSum(a: number, b: number, n: number): number {
  const width = (b - a) / n;
  return samplePoints(a, b, n).reduce((sum, q) => sum + marginalCost(q) * width, 0);
}

function caption(a: number, b: number, n: number, sum: number, exact: number): string {
  if (a === b) {
    return 'With a = b the strips have no width, so the integral is 0: no extra units, no extra cost.';
  }
  if (a > b) {
    return `Because a is above b, each strip has a negative width, (b − a)/n = ${fmt((b - a) / n, 3)}, so the Riemann sum (${fmt(sum)}) and the integral (${fmt(exact)}) are both negative: reversing the limits flips the sign. Move a below b to see the extra cost of raising output.`;
  }
  return `${n} rectangle${n === 1 ? '' : 's'} of width ${fmt((b - a) / n, 3)} add up to ${fmt(sum)}; the exact area under the curve is ${fmt(exact)}. Marginal cost rises, so each rectangle, as high as MC at the left end of its strip, misses a sliver under the curve. With more, thinner rectangles the slivers shrink and the sum tends to the integral.`;
}

/** C113: approximate the area under a marginal cost curve by n rectangles and compare with the integral. */
export function RiemannSumMarginalCost() {
  const [n, setN] = useState(5);
  const [a, setA] = useState(10);
  const [b, setB] = useState(20);
  const width = (b - a) / n;
  const sum = riemannSum(a, b, n);
  const exact = exactIntegral(a, b);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output q"
        yLabel="marginal cost MC(q)"
        xTicks={[0, 5, 10, 15, 20, 25, 30]}
        yTicks={[10, 20, 30, 40, 50]}
      >
        <Area frame={FRAME} top={marginalCost} from={lo} to={hi} tone="lilac" />
        {(a === b ? [] : samplePoints(a, b, n)).map((q) => {
          const h = marginalCost(q);
          return (
            <Fragment key={q}>
              <Area
                frame={FRAME}
                points={[
                  [q, 0],
                  [q, h],
                  [q + width, h],
                  [q + width, 0],
                ]}
                tone="gold"
              />
              <Segment frame={FRAME} from={[q, h]} to={[q + width, h]} tone="gold" />
            </Fragment>
          );
        })}
        <Segment frame={FRAME} from={[a, 0]} to={[a, marginalCost(a)]} tone="green" dashed />
        <Segment frame={FRAME} from={[b, 0]} to={[b, marginalCost(b)]} tone="green" dashed />
        <Curve frame={FRAME} fn={marginalCost} />
      </Plot>
      <Slider label="Rectangles n" value={n} min={1} max={50} onChange={setN} />
      <Slider label="From q = a" value={a} min={0} max={30} onChange={setA} />
      <Slider label="To q = b" value={b} min={0} max={30} onChange={setB} />
      <Readout
        items={[
          ['Riemann sum', fmt(sum)],
          ['Exact integral', fmt(exact)],
          ['Error', fmt(exact - sum)],
        ]}
      />
      <figcaption>{caption(a, b, n, sum, exact)}</figcaption>
    </figure>
  );
}
