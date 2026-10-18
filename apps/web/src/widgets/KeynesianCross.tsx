import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

const FRAME = { xMin: 0, xMax: 5000, yMin: 0, yMax: 5000 };
/** Autonomous consumption and investment, as in F11 Example 1. */
const A = 50;
const I = 150;
/** Government spending of Example 1; the dashed line keeps it for comparison. */
const G0 = 200;

/** The multiplier 1/(1 − b) for a marginal propensity to consume b. */
export function multiplier(b: number): number {
  return 1 / (1 - b);
}

/** Equilibrium income Y* = (a + I + G)/(1 − b), where planned spending meets the 45° line. */
export function equilibriumIncome(a: number, b: number, i: number, g: number): number {
  return (a + i + g) * multiplier(b);
}

/** F11: the Keynesian cross. Change the MPC and government spending; watch Y* and the multiplier. */
export function KeynesianCross() {
  const [b, setB] = useState(0.8);
  const [g, setG] = useState(G0);
  const y = equilibriumIncome(A, b, I, g);
  const y0 = equilibriumIncome(A, b, I, G0);
  const spending = (x: number) => A + I + g + b * x;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="Income Y"
        yLabel="Planned spending AE"
        xTicks={[0, 1000, 2000, 3000, 4000]}
        yTicks={[1000, 2000, 3000, 4000]}
      >
        <Curve frame={FRAME} fn={(x) => x} tone="green" dashed />
        <Note frame={FRAME} x={4100} y={4700} anchor="end">
          45° line
        </Note>
        {g !== G0 && (
          <>
            <Curve frame={FRAME} fn={(x) => A + I + G0 + b * x} tone="gold" dashed />
            <Dot frame={FRAME} x={y0} y={y0} hollow />
          </>
        )}
        <Curve frame={FRAME} fn={spending} />
        <Note frame={FRAME} x={200} y={spending(200) + 450}>
          AE
        </Note>
        <Guides frame={FRAME} x={y} y={y} />
        <Dot frame={FRAME} x={y} y={y} />
      </Plot>
      <Slider
        label="Marginal propensity to consume b"
        value={b}
        min={0.5}
        max={0.85}
        step={0.05}
        onChange={setB}
      />
      <Slider
        label="Government spending G"
        value={g}
        min={100}
        max={350}
        step={10}
        onChange={setG}
      />
      <Readout
        items={[
          ['Equilibrium income Y*', fmt(y, 0)],
          ['Multiplier', fmt(multiplier(b))],
          [`Change in Y* from G = ${G0}`, fmt(y - y0, 0)],
        ]}
      />
      <figcaption>
        Planned spending is AE = {A} + {fmt(b)}Y + {I} + G. Equilibrium is where the AE line meets
        the 45° line, where spending equals income. A steeper AE line (bigger b) means a bigger
        multiplier, so each unit of extra G raises Y* by more.
        {g !== G0 && ` The dashed line is the economy with G = ${G0}.`}
      </figcaption>
    </figure>
  );
}
