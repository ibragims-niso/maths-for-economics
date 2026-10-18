import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// ln(1 + x) about a = 0 and its Taylor polynomials (topic C111, Example 3: ln 1.1 at h = 0.1).
const FRAME = { xMin: -0.6, xMax: 1.2, yMin: -1, yMax: 1.2 };

/** The true value ln(1 + h). */
export function logValue(h: number): number {
  return Math.log(1 + h);
}

/**
 * The Taylor polynomial of ln(1 + x) about 0 of the given order:
 * x − x²/2 + x³/3 − … (order 1 is the tangent line y = x).
 */
export function logTaylor(h: number, order: number): number {
  let sum = 0;
  for (let k = 1; k <= order; k++) sum += ((-1) ** (k + 1) * h ** k) / k;
  return sum;
}

/** Approximation minus true value: positive means the approximation is too high. */
export function approxError(h: number, order: number): number {
  return logTaylor(h, order) - logValue(h);
}

/** An error with its sign: "+0.0047", "−0.0003", "0". */
export function signed(err: number): string {
  const text = fmt(err, 4);
  return Number(err.toFixed(4)) > 0 ? `+${text}` : text;
}

/** C111: move away from a = 0 and watch the tangent line and the parabola drift off ln(1 + x). */
export function TaylorLogApproximation() {
  const [h, setH] = useState(0.1);
  const truth = logValue(h);
  const linear = logTaylor(h, 1);
  const quadratic = logTaylor(h, 2);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x" yLabel="y" xTicks={[-0.5, 0.5, 1]} yTicks={[-0.5, 0.5, 1]}>
        <Curve frame={FRAME} fn={(x) => logTaylor(x, 1)} tone="gold" />
        <Curve frame={FRAME} fn={(x) => logTaylor(x, 2)} tone="green" dashed />
        <Curve frame={FRAME} fn={logValue} from={-0.59} />
        <Guides frame={FRAME} x={h} y={truth} />
        <Dot frame={FRAME} x={h} y={linear} hollow />
        <Dot frame={FRAME} x={h} y={quadratic} hollow />
        <Dot frame={FRAME} x={h} y={truth} />
        <Note frame={FRAME} x={0.22} y={-0.4}>
          gold: tangent y = x
        </Note>
        <Note frame={FRAME} x={0.22} y={-0.62}>
          green: x − x²/2
        </Note>
        <Note frame={FRAME} x={0.22} y={-0.84}>
          lilac: ln(1 + x)
        </Note>
      </Plot>
      <Slider
        label="Distance from a = 0, h"
        value={h}
        min={-0.5}
        max={1}
        step={0.05}
        onChange={setH}
      />
      <Readout
        items={[
          ['True ln(1 + h)', fmt(truth, 4)],
          ['Linear h (error)', `${fmt(linear, 4)} (${signed(approxError(h, 1))})`],
          ['Quadratic (error)', `${fmt(quadratic, 4)} (${signed(approxError(h, 2))})`],
        ]}
      />
      <figcaption>
        The lilac curve is ln(1 + x), the gold line its tangent at x = 0 and the green dashed
        parabola its quadratic approximation. For small h the linear error is close to h²/2 (here{' '}
        {fmt((h * h) / 2, 4)}) and the quadratic error close to h³/3 (here{' '}
        {fmt(Math.abs(h) ** 3 / 3, 4)} in size): halve h and the first falls to about a quarter, the
        second to about an eighth. Near the point both are excellent; far from it the gaps grow
        quickly.
      </figcaption>
    </figure>
  );
}
