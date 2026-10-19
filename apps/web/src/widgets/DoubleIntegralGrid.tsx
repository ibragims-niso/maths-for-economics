import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Orders per km² per day (in hundreds) f(x, y) = x² + y over the zone [0, a] × [0, 2]
// (topic MV13, Example 2: with a = 3 the exact total is 24 and the 2 × 2 grid gives 22.875).
const FRAME = { xMin: 0, xMax: 4.6, yMin: 0, yMax: 2.5 };

/** The north–south length of the zone (km). */
export const DEPTH = 2;
/** Number of shading steps: a cell is drawn with 1 to 5 layers, darker for a larger value. */
export const SHADES = 5;
/** Names of the stacked shading layers; a cell uses the first 1 to 5 of them. */
const LAYERS = ['s1', 's2', 's3', 's4', 's5'] as const;

/** The density at the point (x, y). */
export const density = (x: number, y: number) => x * x + y;

/** The exact double integral of x² + y over [0, a] × [0, 2]: 2a³/3 + 2a. */
export const exactTotal = (a: number) => (DEPTH * a ** 3) / 3 + (a * DEPTH ** 2) / 2;

/** One cell of the n × n grid: its corners, its centre and the density there. */
export interface Cell {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  value: number;
}

/** The n × n grid of cells over [0, a] × [0, 2], each with the density at its centre. */
export function gridCells(a: number, n: number): Cell[] {
  const dx = a / n;
  const dy = DEPTH / n;
  const cells: Cell[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x0 = i * dx;
      const y0 = j * dy;
      cells.push({ x0, x1: x0 + dx, y0, y1: y0 + dy, value: density(x0 + dx / 2, y0 + dy / 2) });
    }
  }
  return cells;
}

/** The Riemann sum: density at each cell centre times the cell's area, added over all cells. */
export function riemannSum(a: number, n: number): number {
  const area = (a / n) * (DEPTH / n);
  return gridCells(a, n).reduce((s, c) => s + c.value * area, 0);
}

/** How many shading layers a cell gets (1 to 5), relative to the largest value on the zone. */
export function shadeOf(value: number, a: number): number {
  const top = density(a, DEPTH);
  return Math.min(SHADES, Math.max(1, Math.ceil((SHADES * value) / top)));
}

/** MV13: split the zone into n × n cells, shade each by the density at its centre, and watch the Riemann sum approach the double integral. */
export function DoubleIntegralGrid() {
  const [n, setN] = useState(4);
  const [a, setA] = useState(3);
  const cells = gridCells(a, n);
  const count = n === 1 ? '1 cell' : `${n * n} cells`;
  const sum = riemannSum(a, n);
  const exact = exactTotal(a);
  // A small gap between cells so the grid is visible.
  const gx = (0.06 * a) / n;
  const gy = (0.06 * DEPTH) / n;

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x (km)" yLabel="y (km)" xTicks={[0, 1, 2, 3, 4]} yTicks={[1, 2]}>
        {cells.flatMap((c) =>
          LAYERS.slice(0, shadeOf(c.value, a)).map((layer) => (
            <Area
              key={`${c.x0}-${c.y0}-${layer}`}
              frame={FRAME}
              points={[
                [c.x0 + gx, c.y0 + gy],
                [c.x1 - gx, c.y0 + gy],
                [c.x1 - gx, c.y1 - gy],
                [c.x0 + gx, c.y1 - gy],
              ]}
            />
          )),
        )}
        <Segment frame={FRAME} from={[a, 0]} to={[a, DEPTH]} tone="lilac" />
        <Segment frame={FRAME} from={[0, DEPTH]} to={[a, DEPTH]} tone="lilac" />
        <Note frame={FRAME} x={a} y={DEPTH + 0.15} anchor="end">
          {`a = ${fmt(a)}`}
        </Note>
      </Plot>
      <Slider label="Cells per side n" value={n} min={1} max={12} onChange={setN} />
      <Slider label="Width a (km)" value={a} min={1} max={4} step={0.5} onChange={setA} />
      <Readout
        items={[
          [`Riemann sum (${count})`, fmt(sum, 3)],
          ['Exact double integral', fmt(exact, 3)],
          ['Error', fmt(exact - sum, 3)],
        ]}
      />
      <figcaption>
        The zone is {fmt(a)} km by 2 km and the density is f(x, y) = x² + y hundred orders per km².
        Each cell is shaded by f at its centre (the stronger the colour, the more orders). The
        Riemann sum adds f(centre) × cell area over {n === 1 ? 'the one cell' : `all ${count}`}; the
        exact total is the double integral 2a³/3 + 2a. Double n and the error falls to about a
        quarter.
      </figcaption>
    </figure>
  );
}
