import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Slider } from './kit';

type Vec = [number, number];

/** A machine limit a·x + b·y ≤ c, in hours a week. */
interface Limit {
  name: string;
  a: number;
  b: number;
  c: number;
}

// Topic OP02, Example 2: tables x and cabinets y; profit 20 per cabinet, p per table.
export const LIMITS: Limit[] = [
  { name: 'cutting', a: 2, b: 1, c: 40 },
  { name: 'assembly', a: 1, b: 1, c: 24 },
  { name: 'finishing', a: 1, b: 3, c: 60 },
];
export const CABINET_PROFIT = 20;

const FRAME = { xMin: 0, xMax: 30, yMin: 0, yMax: 26 };
const EPS = 1e-9;

const fits = ([x, y]: Vec) =>
  x >= -EPS && y >= -EPS && LIMITS.every((k) => k.a * x + k.b * y <= k.c + EPS);

/** Corners of the feasible region, in order round its edge (so they can be shaded as a polygon). */
export function regionCorners(): Vec[] {
  const lines = [{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }, ...LIMITS];
  const found: Vec[] = [];
  lines.forEach((u, i) => {
    for (const v of lines.slice(i + 1)) {
      const det = u.a * v.b - v.a * u.b;
      if (det === 0) continue;
      // "+ 0" turns a −0 from the division into 0.
      const pt: Vec = [(u.c * v.b - v.c * u.b) / det + 0, (u.a * v.c - v.a * u.c) / det + 0];
      if (fits(pt) && !found.some((f) => Math.hypot(f[0] - pt[0], f[1] - pt[1]) < EPS)) {
        found.push(pt);
      }
    }
  });
  const cx = found.reduce((s, f) => s + f[0], 0) / found.length;
  const cy = found.reduce((s, f) => s + f[1], 0) / found.length;
  return found.sort((m, n) => Math.atan2(m[1] - cy, m[0] - cx) - Math.atan2(n[1] - cy, n[0] - cx));
}

const CORNERS = regionCorners();

/** Profit of a plan when a table earns p and a cabinet 20. */
export const profit = (p: number, [x, y]: Vec) => p * x + CABINET_PROFIT * y;

/** The best corners (two of them when the iso-profit line lies along an edge) and the profit. */
export function optimum(p: number) {
  const best = Math.max(...CORNERS.map((c) => profit(p, c)));
  return { corners: CORNERS.filter((c) => profit(p, c) > best - EPS), profit: best };
}

/** Machines with no hours to spare at every one of the given plans. */
export function binding(plans: Vec[]): string[] {
  return LIMITS.filter((k) => plans.every(([x, y]) => Math.abs(k.a * x + k.b * y - k.c) < EPS)).map(
    (k) => k.name,
  );
}

const plan = ([x, y]: Vec) => `(${fmt(x)}, ${fmt(y)})`;

/** Why the optimum is where it is, from the slope of the iso-profit line. */
export function describeOptimum(p: number): string {
  const slope = `The iso-profit line has slope −p/20 = −${fmt(p / CABINET_PROFIT)}`;
  if (p > 40)
    return `${slope}, steeper than the cutting line (−2): tables pay so well that the best plan makes only tables, at (20, 0).`;
  if (p === 40)
    return `${slope}, exactly the slope of the cutting line, so the whole edge from (16, 8) to (20, 0) is optimal: multiple optima.`;
  if (p > 20)
    return `${slope}, between the cutting line (−2) and the assembly line (−1), so the best plan is the corner where those two lines cross, (16, 8).`;
  if (p === 20)
    return `${slope}, exactly the slope of the assembly line, so the whole edge from (6, 18) to (16, 8) is optimal: multiple optima.`;
  if (3 * p > CABINET_PROFIT)
    return `${slope}, between the assembly line (−1) and the finishing line (−1/3), so the best plan is the corner where those two cross, (6, 18).`;
  return `${slope}, flatter than the finishing line (−1/3): cabinets pay so much more that the best plan makes only cabinets, at (0, 20).`;
}

/** Where the dashed line stands compared with the best profit. */
export function describeLevel(p: number, level: number): string {
  const best = optimum(p).profit;
  if (level > best + EPS)
    return `At ${fmt(level)} the dashed line misses the region: no plan earns that much.`;
  if (level > best - EPS)
    return `At ${fmt(level)} the dashed line just touches the region: this is the maximum.`;
  return `Every plan on the dashed line earns ${fmt(level)}, but the line can still slide outwards, so better plans exist.`;
}

/** OP02: slide an iso-profit line across a production region and watch the best corner jump. */
export function IsoProfitCorners() {
  const [p, setP] = useState(30);
  const [level, setLevel] = useState(400);
  const best = optimum(p);
  const tied = best.corners.length > 1;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="tables x"
        yLabel="cabinets y"
        xTicks={[0, 10, 20, 30]}
        yTicks={[10, 20]}
      >
        <Area frame={FRAME} points={CORNERS} tone="green" />
        {LIMITS.map((k) => (
          <Curve key={k.name} frame={FRAME} fn={(x) => (k.c - k.a * x) / k.b} />
        ))}
        <Note frame={FRAME} x={8.6} y={23.5}>
          cutting
        </Note>
        <Note frame={FRAME} x={21.8} y={3.6}>
          assembly
        </Note>
        <Note frame={FRAME} x={24} y={13.6} anchor="middle">
          finishing
        </Note>
        <Curve frame={FRAME} fn={(x) => (level - p * x) / CABINET_PROFIT} tone="gold" dashed />
        {CORNERS.map(([x, y]) => (
          <Dot key={`${x},${y}`} frame={FRAME} x={x} y={y} hollow />
        ))}
        {best.corners.map(([x, y]) => (
          <Dot key={`best${x},${y}`} frame={FRAME} x={x} y={y} />
        ))}
      </Plot>
      <Slider label="Profit per table, p" value={p} min={5} max={60} onChange={setP} />
      <Slider
        label="Iso-profit level"
        value={level}
        min={0}
        max={1200}
        step={20}
        onChange={setLevel}
      />
      <Readout
        items={[
          ['Best plan (x, y)', best.corners.map(plan).join(' to ')],
          ['Maximum profit', fmt(best.profit)],
          [tied ? 'Binding on the edge' : 'Binding machines', binding(best.corners).join(', ')],
        ]}
      />
      <figcaption>
        Shaded: every plan that fits the cutting, assembly and finishing hours; dots mark its
        corners and the filled dot is the best. The dashed line joins the plans that earn the chosen
        profit level. {describeLevel(p, level)} {describeOptimum(p)}
      </figcaption>
    </figure>
  );
}
