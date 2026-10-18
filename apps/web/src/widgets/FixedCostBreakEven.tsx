import { useState } from 'react';
import { Area, Curve, Dot, fmt, Plot, Readout, Slider } from './kit';

// Profit before fixed costs −2Q² + 140Q (topic F02, examples 2 and 3). Profit is drawn in thousands.
export const A = 2;
export const B = 140;
const FRAME = { xMin: 0, xMax: 70, yMin: -4.6, yMax: 2.6 };

/** Profit π(Q) = −aQ² + bQ − F. */
export const profit = (q: number, fixedCost: number) => -A * q * q + B * q - fixedCost;

/** The discriminant of 2Q² − 140Q + F = 0: D = b² − 4aF. */
export const discriminant = (fixedCost: number) => B * B - 4 * A * fixedCost;

/** The outputs where profit is zero, smallest first: two, one (D = 0) or none (D < 0). */
export function breakEvenOutputs(fixedCost: number): number[] {
  const d = discriminant(fixedCost);
  if (d < 0) return [];
  if (d === 0) return [B / (2 * A)];
  const root = Math.sqrt(d);
  return [(B - root) / (2 * A), (B + root) / (2 * A)];
}

function describe(d: number) {
  if (d > 0)
    return 'D > 0: profit is zero at two outputs, and the firm makes a profit between them (shaded).';
  if (d === 0)
    return 'D = 0: the curve just touches zero at Q = 35. This is the largest fixed cost at which the firm can still break even.';
  return 'D < 0: the curve never reaches zero, so the firm makes a loss at every output.';
}

/**
 * F02: raise the fixed cost and watch the two break-even outputs move together, meet and vanish;
 * test the sign of profit at any output.
 */
export function FixedCostBreakEven() {
  const [fixedCost, setFixedCost] = useState(2000);
  const [output, setOutput] = useState(30);
  const d = discriminant(fixedCost);
  const roots = breakEvenOutputs(fixedCost);
  const k = (q: number) => profit(q, fixedCost) / 1000;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output Q"
        yLabel="profit π (thousands)"
        xTicks={[0, 10, 20, 30, 40, 50, 60, 70]}
        yTicks={[-4, -3, -2, -1, 0, 1, 2]}
      >
        {roots.length === 2 && (
          <Area frame={FRAME} top={k} from={roots[0]} to={roots[1]} tone="green" />
        )}
        <Curve frame={FRAME} fn={k} />
        {roots.map((q) => (
          <Dot key={q} frame={FRAME} x={q} y={0} />
        ))}
        <Dot frame={FRAME} x={output} y={k(output)} hollow />
      </Plot>
      <Slider
        label="Fixed cost F"
        value={fixedCost}
        min={0}
        max={3500}
        step={50}
        onChange={setFixedCost}
      />
      <Slider label="Output Q" value={output} min={0} max={70} onChange={setOutput} />
      <Readout
        items={[
          ['Discriminant D', fmt(d)],
          ['Break-even outputs', roots.length ? roots.map((q) => fmt(q)).join(' and ') : 'none'],
          [`Profit at Q = ${output}`, fmt(profit(output, fixedCost))],
        ]}
      />
      <figcaption>
        Profit π(Q) = −2Q² + 140Q − F, so D = 140² − 8F. {describe(d)} The hollow dot is the profit
        at the chosen output.
      </figcaption>
    </figure>
  );
}
