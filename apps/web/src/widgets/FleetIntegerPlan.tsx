import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Slider } from './kit';

type Vec = [number, number];

// Topic OP06, Example 2: x lorries (30 thousand each) and y vans (10 thousand each), 6 drivers.
export const LORRY_COST = 30;
export const VAN_COST = 10;
export const DRIVERS = 6;
/** Yearly profit of a van, in thousands; the lorry's profit is set by a slider. */
export const VAN_PROFIT = 4;

const FRAME = { xMin: -0.4, xMax: 8, yMin: -0.4, yMax: 7.5 };
const EPS = 1e-9;

/** The two limits a·x + b·y ≤ c for a given budget. */
export const limits = (budget: number) => [
  { name: 'budget', a: LORRY_COST, b: VAN_COST, c: budget },
  { name: 'drivers', a: 1, b: 1, c: DRIVERS },
];

export const fits = (budget: number, [x, y]: Vec, eps = EPS) =>
  x >= -eps && y >= -eps && limits(budget).every((k) => k.a * x + k.b * y <= k.c + eps);

/** Yearly profit (thousands) of a fleet when a lorry earns p and a van 4. */
export const profit = (p: number, [x, y]: Vec) => p * x + VAN_PROFIT * y;

/** Corners of the feasible region, in order round its edge. */
export function regionCorners(budget: number): Vec[] {
  const lines = [{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }, ...limits(budget)];
  const found: Vec[] = [];
  lines.forEach((u, i) => {
    for (const v of lines.slice(i + 1)) {
      const det = u.a * v.b - v.a * u.b;
      if (det === 0) continue;
      // "+ 0" turns a −0 from the division into 0.
      const pt: Vec = [(u.c * v.b - v.c * u.b) / det + 0, (u.a * v.c - v.a * u.c) / det + 0];
      if (fits(budget, pt) && !found.some((f) => Math.hypot(f[0] - pt[0], f[1] - pt[1]) < EPS)) {
        found.push(pt);
      }
    }
  });
  const cx = found.reduce((s, f) => s + f[0], 0) / found.length;
  const cy = found.reduce((s, f) => s + f[1], 0) / found.length;
  return found.sort((m, n) => Math.atan2(m[1] - cy, m[0] - cx) - Math.atan2(n[1] - cy, n[0] - cx));
}

const isWhole = ([x, y]: Vec) => Number.isInteger(x) && Number.isInteger(y);

/**
 * The LP optimum: the best corner if vehicles could be bought in fractions. When two corners tie
 * (the profit line lies along an edge), a whole-number corner is preferred.
 */
export function lpOptimum(budget: number, p: number): { plan: Vec; profit: number } {
  let plan: Vec = [0, 0];
  for (const c of regionCorners(budget)) {
    const gain = profit(p, c) - profit(p, plan);
    if (gain > EPS || (gain > -EPS && isWhole(c) && !isWhole(plan))) plan = c;
  }
  return { plan, profit: profit(p, plan) };
}

/** Every whole-number fleet that fits the budget and the drivers. */
export function wholeFleets(budget: number): Vec[] {
  const out: Vec[] = [];
  for (let x = 0; x <= DRIVERS; x++) {
    for (let y = 0; y <= DRIVERS; y++) if (fits(budget, [x, y], 0)) out.push([x, y]);
  }
  return out;
}

/** The best whole-number fleets (more than one when they tie) and their profit. */
export function integerOptimum(budget: number, p: number): { plans: Vec[]; profit: number } {
  const fleets = wholeFleets(budget);
  const best = Math.max(...fleets.map((f) => profit(p, f)));
  return { plans: fleets.filter((f) => profit(p, f) === best), profit: best };
}

/** LP optimum minus the best whole-number profit: what insisting on whole vehicles costs. */
export const priceOfIntegrality = (budget: number, p: number) =>
  lpOptimum(budget, p).profit - integerOptimum(budget, p).profit;

const plan = ([x, y]: Vec) => `(${fmt(x)}, ${fmt(y)})`;

/** Read-out label for the best whole fleets: the plan, two plans, or how many tie. */
export const bestLabel = (plans: Vec[]) =>
  plans.length > 2
    ? `Best whole fleet (${plans.length} plans tie)`
    : `Best whole fleet ${plans.map(plan).join(' or ')}`;

/** What happens if the LP plan is simply rounded to the nearest whole numbers. */
export function describeRounding(budget: number, p: number): string {
  const lp = lpOptimum(budget, p);
  const [x, y] = lp.plan;
  const whole = integerOptimum(budget, p);
  if (isWhole(lp.plan))
    return `The LP plan ${plan(lp.plan)} is already whole, so insisting on whole vehicles costs nothing.`;
  const r: Vec = [Math.round(x), Math.round(y)];
  if (!fits(budget, r, 0)) {
    const broken = limits(budget)
      .filter((k) => k.a * r[0] + k.b * r[1] > k.c)
      .map((k) =>
        k.name === 'budget'
          ? `the budget (it costs ${fmt(LORRY_COST * r[0] + VAN_COST * r[1])})`
          : `the drivers (it needs ${fmt(r[0] + r[1])})`,
      );
    return `Rounding ${plan(lp.plan)} to ${plan(r)} breaks ${broken.join(' and ')}, so it is not a plan at all.`;
  }
  if (profit(p, r) < whole.profit)
    return `Rounding ${plan(lp.plan)} to ${plan(r)} gives a fleet that fits but earns only ${fmt(profit(p, r))}, less than the best whole fleet.`;
  return `Here rounding ${plan(lp.plan)} to ${plan(r)} happens to give a best whole fleet, but that is luck, not a rule.`;
}

/** OP06: integer points inside an LP region; why rounding the LP optimum can fail. */
export function FleetIntegerPlan() {
  const [budget, setBudget] = useState(90);
  const [p, setP] = useState(9);
  const lp = lpOptimum(budget, p);
  const whole = integerOptimum(budget, p);
  const corners = regionCorners(budget);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="lorries x"
        yLabel="vans y"
        xTicks={[0, 2, 4, 6]}
        yTicks={[2, 4, 6]}
      >
        <Area frame={FRAME} points={corners} tone="green" />
        {/* Lines stop at the axes, and below y = 6.8 to keep the axis label clear. */}
        <Curve
          frame={FRAME}
          fn={(x) => (budget - LORRY_COST * x) / VAN_COST}
          from={Math.max(0, (budget - VAN_COST * 6.8) / LORRY_COST)}
          to={budget / LORRY_COST}
        />
        <Curve frame={FRAME} fn={(x) => DRIVERS - x} from={0} to={DRIVERS} />
        <Note frame={FRAME} x={(budget - VAN_COST * 6) / LORRY_COST + 0.35} y={6.4}>
          budget
        </Note>
        <Note frame={FRAME} x={5.2} y={1.4}>
          drivers
        </Note>
        <Curve
          frame={FRAME}
          fn={(x) => (whole.profit - p * x) / VAN_PROFIT}
          from={Math.max(0, (whole.profit - VAN_PROFIT * 6.8) / p)}
          to={whole.profit / p}
          tone="gold"
          dashed
        />
        {wholeFleets(budget).map(([x, y]) => (
          <Note key={`${x},${y}`} frame={FRAME} x={x} y={y - 0.2} anchor="middle">
            ●
          </Note>
        ))}
        {whole.plans.map(([x, y]) => (
          <Dot key={`best${x},${y}`} frame={FRAME} x={x} y={y} />
        ))}
        <Dot frame={FRAME} x={lp.plan[0]} y={lp.plan[1]} hollow />
      </Plot>
      <Slider
        label="Budget (thousands)"
        value={budget}
        min={60}
        max={150}
        step={10}
        onChange={setBudget}
      />
      <Slider label="Profit per lorry (thousands)" value={p} min={2} max={15} onChange={setP} />
      <Readout
        items={[
          [`LP optimum ${plan(lp.plan)}`, fmt(lp.profit)],
          [bestLabel(whole.plans), fmt(whole.profit)],
          ['Price of integrality', fmt(priceOfIntegrality(budget, p))],
        ]}
      />
      <figcaption>
        Shaded: every fleet that fits the budget and the 6 drivers; grey dots are the whole-number
        fleets. The hollow dot is the LP optimum, where vehicles could be bought in fractions; the
        filled dot is the best whole fleet, and the dashed line joins all plans that earn as much as
        it. No grey dot lies above the dashed line. {describeRounding(budget, p)}
      </figcaption>
    </figure>
  );
}
