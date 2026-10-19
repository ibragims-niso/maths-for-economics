import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

/** A machine limit a·x + b·y ≤ c, in hours a week. */
interface Limit {
  a: number;
  b: number;
  c: number;
}

// Topic OP03, Example 2 (the workshop of OP02 Example 2): tables x and cabinets y. Cutting hours
// vary with the slider; assembly and finishing stay fixed.
export const TABLE_PROFIT = 30;
export const CABINET_PROFIT = 20;
export const ASSEMBLY: Limit = { a: 1, b: 1, c: 24 };
export const FINISHING: Limit = { a: 1, b: 3, c: 60 };
export const cutting = (hours: number): Limit => ({ a: 2, b: 1, c: hours });

const EPS = 1e-9;
const REGION = { xMin: 0, xMax: 30, yMin: 0, yMax: 26 };
const VALUE = { xMin: 0, xMax: 60, yMin: 0, yMax: 800 };

/** Corners of the feasible region for the given cutting hours, in order round its edge. */
export function regionCorners(hours: number): Vec[] {
  const limits = [cutting(hours), ASSEMBLY, FINISHING];
  const lines = [{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }, ...limits];
  const fits = ([x, y]: Vec) =>
    x >= -EPS && y >= -EPS && limits.every((k) => k.a * x + k.b * y <= k.c + EPS);
  const found: Vec[] = [];
  lines.forEach((u, i) => {
    for (const v of lines.slice(i + 1)) {
      const det = u.a * v.b - v.a * u.b;
      if (det === 0) continue;
      // "+ 0" turns a −0 from the division into 0.
      const pt: Vec = [(u.c * v.b - v.c * u.b) / det + 0, (u.a * v.c - v.a * u.c) / det + 0];
      if (fits(pt) && !found.some((f) => Math.hypot(f[0] - pt[0], f[1] - pt[1]) < 1e-7)) {
        found.push(pt);
      }
    }
  });
  const cx = found.reduce((s, f) => s + f[0], 0) / found.length;
  const cy = found.reduce((s, f) => s + f[1], 0) / found.length;
  return found.sort((m, n) => Math.atan2(m[1] - cy, m[0] - cx) - Math.atan2(n[1] - cy, n[0] - cx));
}

const profit = ([x, y]: Vec) => TABLE_PROFIT * x + CABINET_PROFIT * y;

/** The best plan (the corner with the highest profit) and that maximum profit. */
export function bestPlan(hours: number): { plan: Vec; profit: number } {
  let plan: Vec = [0, 0];
  for (const c of regionCorners(hours)) if (profit(c) > profit(plan) + EPS) plan = c;
  return { plan, profit: profit(plan) };
}

/** The extra maximum profit from one more cutting hour: the shadow price of cutting. */
export const shadowPrice = (hours: number) => bestPlan(hours + 1).profit - bestPlan(hours).profit;

/** Cutting hours left over at the best plan. */
export function spareHours(hours: number): number {
  const [x, y] = bestPlan(hours).plan;
  return hours - (2 * x + y);
}

/** Which constraints set the best plan, and what an extra cutting hour is worth there. */
export function describeRange(hours: number): string {
  if (hours < 20)
    return 'Below 20 hours only cabinets are made, and each extra cutting hour makes one more cabinet: the shadow price is 20.';
  if (hours < 30)
    return 'Between 20 and 30 hours cutting and finishing are the binding machines, and each extra cutting hour adds 14.';
  if (hours < 48)
    return 'Between 30 and 48 hours cutting and assembly are the binding machines, and each extra cutting hour adds 10.';
  if (hours === 48)
    return 'At exactly 48 hours cutting is just used up, yet an extra hour would sit idle because assembly already stops the plan at 24 tables: binding, but with shadow price 0.';
  return 'From 48 hours on, assembly alone limits the plan at 24 tables; more cutting hours would sit idle, so the shadow price drops to 0.';
}

/** OP03: give the workshop more or fewer cutting hours and watch the maximum profit and its slope. */
export function ShadowPriceHours() {
  const [hours, setHours] = useState(40);
  const { plan, profit: best } = bestPlan(hours);
  const price = shadowPrice(hours);
  const spare = spareHours(hours);
  const corners = regionCorners(hours);
  const ahead = 10;

  return (
    <figure className="widget">
      <Plot
        frame={REGION}
        xLabel="tables x"
        yLabel="cabinets y"
        xTicks={[0, 10, 20, 30]}
        yTicks={[10, 20]}
      >
        <Area frame={REGION} points={corners} tone="green" />
        <Curve frame={REGION} fn={(x) => hours - 2 * x} tone="gold" />
        <Curve frame={REGION} fn={(x) => ASSEMBLY.c - x} />
        <Curve frame={REGION} fn={(x) => (FINISHING.c - x) / 3} />
        {/* Labels move with the cutting line so that they never sit on top of it. */}
        <Note
          frame={REGION}
          x={hours <= 30 ? hours / 2 + 0.6 : (hours - 21.5) / 2 + 0.6}
          y={hours <= 30 ? 1.2 : 21.5}
        >
          cutting
        </Note>
        <Note
          frame={REGION}
          x={hours < 46 ? 22 : 12}
          y={hours < 46 ? 4.8 : 9}
          anchor={hours < 46 ? 'start' : 'end'}
        >
          assembly
        </Note>
        <Note frame={REGION} x={27} y={12.4} anchor="middle">
          finishing
        </Note>
        <Dot frame={REGION} x={plan[0]} y={plan[1]} />
      </Plot>
      <Plot
        frame={VALUE}
        xLabel="cutting hours"
        yLabel="max profit"
        xTicks={[0, 20, 30, 48, 60]}
        yTicks={[400, 800]}
      >
        <Curve frame={VALUE} fn={(c) => bestPlan(c).profit} from={0} to={60} />
        <Segment
          frame={VALUE}
          from={[hours, best]}
          to={[hours + ahead, best + price * ahead]}
          dashed
        />
        <Guides frame={VALUE} x={hours} y={best} />
        <Dot frame={VALUE} x={hours} y={best} />
      </Plot>
      <Slider label="Cutting hours available" value={hours} min={10} max={60} onChange={setHours} />
      <Readout
        items={[
          ['Maximum profit', fmt(best)],
          ['Shadow price of cutting', fmt(price)],
          ['Cutting', spare > EPS ? `${fmt(spare)} hours spare` : 'binding'],
        ]}
      />
      <figcaption>
        Top: every plan that fits {fmt(hours)} cutting hours (gold line), 24 assembly hours and 60
        finishing hours; the dot is the best plan, {`(${fmt(plan[0])}, ${fmt(plan[1])})`}. Bottom:
        the maximum profit for each number of cutting hours. The dashed line running on from the dot
        has slope {fmt(price)}, the shadow price of cutting: the extra profit from one more hour.{' '}
        {describeRange(hours)}
      </figcaption>
    </figure>
  );
}
