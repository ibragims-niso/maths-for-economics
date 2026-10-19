import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

// The plot area is 266 × 174 pixels; one unit is the same length on both axes, so a ball
// (a disc in the plane) is drawn as a true circle.
const FRAME = { xMin: 0, xMax: (7 * 266) / 174, yMin: 0, yMax: 7 };

// Topic AN04, Examples 1 and 2: p = (p₁, 4) with p₁ = 3 at the start, and income 24.
export const P2 = 4;
export const INCOME = 24;
/** Far beyond the right edge of the graph: where the budget set "ends" when it is unbounded. */
const FAR = 100;

export type Position = 'interior' | 'boundary' | 'outside';

/** Where the bundle (x, y) lies relative to S = {x ≥ 0, y ≥ 0, p₁x + 4y ≤ 24}. */
export function positionOf(p1: number, x: number, y: number): Position {
  const cost = p1 * x + P2 * y;
  if (x < 0 || y < 0 || cost > INCOME + 1e-9) return 'outside';
  if (x === 0 || y === 0 || Math.abs(cost - INCOME) < 1e-9) return 'boundary';
  return 'interior';
}

/** The distance from (x, y) to the budget line p₁x + 4y = 24: |24 − p·x| / ‖p‖. */
export function distanceToBudgetLine(p1: number, x: number, y: number): number {
  return Math.abs(INCOME - p1 * x - P2 * y) / Math.hypot(p1, P2);
}

/**
 * The largest open ball around (x, y) that stays in S: its radius is the distance to the nearest
 * of the edges x = 0, y = 0 and the budget line. Zero on the boundary; null outside S.
 */
export function largestBallRadius(p1: number, x: number, y: number): number | null {
  const where = positionOf(p1, x, y);
  if (where === 'outside') return null;
  if (where === 'boundary') return 0;
  return Math.min(x, y, distanceToBudgetLine(p1, x, y));
}

/** The point of the edges nearest to (x, y), and which edge it is on. */
export function nearestEdge(p1: number, x: number, y: number): { point: Vec; edge: string } {
  const p: Vec = [p1, P2];
  const k = (INCOME - p1 * x - P2 * y) / (p1 * p1 + P2 * P2);
  const options = [
    { point: [0, y] as Vec, edge: 'the edge x = 0', d: x },
    { point: [x, 0] as Vec, edge: 'the edge y = 0', d: y },
    {
      point: [x + k * p[0], y + k * p[1]] as Vec,
      edge: 'the budget line',
      d: distanceToBudgetLine(p1, x, y),
    },
  ];
  const best = options.reduce((a, b) => (b.d < a.d ? b : a));
  return { point: best.point, edge: best.edge };
}

/** S is compact (closed and bounded) exactly when every price is positive. */
export const isCompact = (p1: number) => p1 > 0;

/** The bundle that maximises U = xy on S: half of income on each good; none if good 1 is free. */
export function bestBundleXY(p1: number): Vec | null {
  return isCompact(p1) ? [INCOME / (2 * p1), INCOME / (2 * P2)] : null;
}

/** Half the height of the circle of radius r at horizontal offset dx from its centre. */
const halfChord = (r: number, dx: number) => Math.sqrt(Math.max(0, r * r - dx * dx));

/** Points of the circle of radius r around c, for drawing the ball. */
export function circlePoints(c: Vec, r: number, count = 72): Vec[] {
  return Array.from({ length: count }, (_, i) => {
    const t = (2 * Math.PI * i) / count;
    return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)] as Vec;
  });
}

/** AN04: a budget set, a bundle and the largest open ball around it; a free good breaks compactness. */
export function BudgetSetBall() {
  const [p1, setP1] = useState(3);
  const [x, setX] = useState(2);
  const [y, setY] = useState(3);
  const where = positionOf(p1, x, y);
  const r = largestBallRadius(p1, x, y);
  const compact = isCompact(p1);
  const best = bestBundleXY(p1);
  const top = INCOME / P2;
  const right = compact ? INCOME / p1 : FAR;
  const edge = nearestEdge(p1, x, y);
  const circle = r && r > 0 ? circlePoints([x, y], r) : [];
  const cost = p1 * x + P2 * y;

  const said = {
    interior: `(${fmt(x)}, ${fmt(y)}) is an interior point: the gold open ball of radius ${fmt(r ?? 0)} around it stays inside S, and so does every smaller one. A bigger ball would cross ${edge.edge}, the nearest edge.`,
    boundary: `(${fmt(x)}, ${fmt(y)}) is a boundary point: every ball around it, however small, contains bundles outside S. S contains all its boundary points, which is what makes it closed.`,
    outside: `(${fmt(x)}, ${fmt(y)}) costs ${fmt(cost)}, more than the income of 24, so it lies outside S.`,
  }[where];
  const set = compact
    ? `With both prices positive, S is closed and bounded (it fits in the box 0 ≤ x ≤ ${fmt(right)}, 0 ≤ y ≤ 6), so it is compact and the continuous utility xy reaches a maximum on it, at the hollow dot (${fmt(best?.[0] ?? 0)}, 3).`
    : 'Good 1 is free (p₁ = 0): S is the strip 0 ≤ y ≤ 6 that runs to the right for ever. It is still closed but not bounded, so it is not compact, and xy has no maximum on it: more of the free good is always better.';

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x" yLabel="y" xTicks={[0, 2, 4, 6, 8, 10]} yTicks={[2, 4, 6]}>
        <Area
          frame={FRAME}
          tone="lilac"
          points={
            compact
              ? [
                  [0, 0],
                  [right, 0],
                  [0, top],
                ]
              : [
                  [0, 0],
                  [FAR, 0],
                  [FAR, top],
                  [0, top],
                ]
          }
        />
        <Segment
          frame={FRAME}
          from={[0, top]}
          to={compact ? [right, 0] : [FAR, top]}
          tone="green"
        />
        {circle.length > 0 && <Area frame={FRAME} points={circle} />}
        {circle.length > 0 && (
          <>
            <Curve
              frame={FRAME}
              fn={(v) => y + halfChord(r ?? 0, v - x)}
              from={x - (r ?? 0)}
              to={x + (r ?? 0)}
              tone="gold"
            />
            <Curve
              frame={FRAME}
              fn={(v) => y - halfChord(r ?? 0, v - x)}
              from={x - (r ?? 0)}
              to={x + (r ?? 0)}
              tone="gold"
            />
          </>
        )}
        {where === 'interior' && (
          <Segment frame={FRAME} from={[x, y]} to={edge.point} tone="gold" dashed />
        )}
        {best && <Dot frame={FRAME} x={best[0]} y={best[1]} hollow />}
        <Note frame={FRAME} x={0.3} y={top - 1.3}>
          {compact ? 'S' : 'S (runs on for ever) →'}
        </Note>
        <Dot frame={FRAME} x={x} y={y} />
      </Plot>
      <Slider label="Price of good 1, p₁" value={p1} min={0} max={6} step={0.5} onChange={setP1} />
      <Slider label="Bundle: good 1, x" value={x} min={0} max={10} step={0.5} onChange={setX} />
      <Slider label="Bundle: good 2, y" value={y} min={0} max={7} step={0.5} onChange={setY} />
      <Readout
        items={[
          ['Largest ball r', r === null ? 'none' : fmt(r)],
          [
            'Bundle is',
            where === 'interior'
              ? 'interior'
              : where === 'boundary'
                ? 'on the boundary'
                : 'outside S',
          ],
          ['S is', compact ? 'compact' : 'not compact'],
        ]}
      />
      <figcaption>
        The shaded set is S = {'{'}x ≥ 0, y ≥ 0, p₁x + 4y ≤ 24{'}'}, the budget set with p₂ = 4 and
        income 24; the green line is the budget line. {said} {set}
      </figcaption>
    </figure>
  );
}
