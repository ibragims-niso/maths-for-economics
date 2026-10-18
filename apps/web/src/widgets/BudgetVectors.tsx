import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

// The plot area is 266 × 174 pixels; one unit is the same length on both axes, so right angles
// on the screen are right angles in the maths.
const FRAME = { xMin: 0, xMax: (9 * 266) / 174, yMin: 0, yMax: 9 };

// Topic LA101, Example 3: prices p = (4, 3) and a budget of 24.
const BUDGET = 24;
const P2 = 3;

/** The dot product a·b = a₁b₁ + a₂b₂. */
export const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];

/** The length ‖a‖ = √(a·a). */
export const norm = (a: Vec) => Math.sqrt(dot(a, a));

/** The angle between a and b in degrees, from cos θ = a·b / (‖a‖‖b‖); null for a zero vector. */
export function angleBetween(a: Vec, b: Vec): number | null {
  const lengths = norm(a) * norm(b);
  if (lengths === 0) return null;
  const cos = Math.min(1, Math.max(-1, dot(a, b) / lengths));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Where a bundle costing p·x stands against the budget m. */
export function budgetStatus(cost: number, m: number): 'inside' | 'on' | 'outside' {
  if (Math.abs(cost - m) < 1e-9) return 'on';
  return cost < m ? 'inside' : 'outside';
}

/** The point of the budget line p·x = m closest to the origin: (m / ‖p‖²)·p, in the direction of p. */
export function footOfBudgetLine(p: Vec, m: number): Vec {
  const k = m / dot(p, p);
  return [k * p[0], k * p[1]];
}

const add = (a: Vec, b: Vec, s = 1): Vec => [a[0] + s * b[0], a[1] + s * b[1]];
const unit = (a: Vec): Vec => [a[0] / norm(a), a[1] / norm(a)];

/** LA101: a bundle x, the budget line p·x = 24 and the price vector p, which meets it at a right angle. */
export function BudgetVectors() {
  const [p1, setP1] = useState(4);
  const [x1, setX1] = useState(2);
  const [x2, setX2] = useState(3);
  const p: Vec = [p1, P2];
  const x: Vec = [x1, x2];
  const cost = dot(p, x);
  const left = BUDGET - cost;
  const angle = angleBetween(p, x);
  const status = budgetStatus(cost, BUDGET);

  // The price arrow starts on the budget line and points away from the origin.
  const foot = footOfBudgetLine(p, BUDGET);
  const tip = add(foot, p);
  const along = unit(p);
  const across: Vec = [-along[1], along[0]];
  const head = 0.45;
  const barbA = add(add(tip, along, -head), across, head * 0.5);
  const barbB = add(add(tip, along, -head), across, -head * 0.5);
  // A small square marks the right angle between p and the line.
  const c1 = add(foot, across, 0.35);
  const c2 = add(c1, along, 0.35);
  const c3 = add(foot, along, 0.35);

  const said = {
    inside: `x costs ${fmt(cost)}, less than the budget of 24: it lies inside the shaded budget set and ${fmt(left)} is left over.`,
    on: 'x costs exactly 24: it lies on the budget line, with nothing left over.',
    outside: `x costs ${fmt(cost)}, more than the budget of 24: it lies outside the budget set and is not affordable.`,
  }[status];

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x₁" yLabel="x₂" xTicks={[0, 4, 8, 12]} yTicks={[4, 8]}>
        <Area
          frame={FRAME}
          points={[
            [0, 0],
            [BUDGET / p1, 0],
            [0, BUDGET / P2],
          ]}
          tone="lilac"
        />
        <Curve frame={FRAME} fn={(v) => (BUDGET - p1 * v) / P2} from={0} to={BUDGET / p1} />
        <Segment frame={FRAME} from={c1} to={c2} />
        <Segment frame={FRAME} from={c2} to={c3} />
        <Segment frame={FRAME} from={foot} to={tip} />
        <Segment frame={FRAME} from={barbA} to={tip} />
        <Segment frame={FRAME} from={barbB} to={tip} />
        <Note frame={FRAME} x={tip[0] + 0.25} y={tip[1] - 0.15}>
          p
        </Note>
        <Guides frame={FRAME} x={x1} y={x2} />
        <Segment frame={FRAME} from={[0, 0]} to={x} tone="green" />
        <Dot frame={FRAME} x={x1} y={x2} />
        <Note frame={FRAME} x={x1 + 0.3} y={x2 + 0.3}>
          x
        </Note>
      </Plot>
      <Slider label="Good 1, x₁" value={x1} min={0} max={12} step={0.5} onChange={setX1} />
      <Slider label="Good 2, x₂" value={x2} min={0} max={8} step={0.5} onChange={setX2} />
      <Slider label="Price of good 1, p₁" value={p1} min={2} max={8} step={0.5} onChange={setP1} />
      <Readout
        items={[
          ['Cost p·x', fmt(cost)],
          ['Money left', fmt(left)],
          ['Angle between p and x', angle === null ? '—' : `${fmt(angle, 1)}°`],
        ]}
      />
      <figcaption>
        Prices p = ({fmt(p1)}, 3), budget 24. {said} The gold arrow is the price vector p: it meets
        the budget line at a right angle, because a move along the line does not change the cost.
      </figcaption>
    </figure>
  );
}
