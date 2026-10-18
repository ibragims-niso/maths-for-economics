import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

// The plot area is 266 × 174 pixels; one unit is the same length on both axes, so the right
// angle between the gradient and the indifference curve looks like a right angle.
const FRAME = { xMin: 0, xMax: (10 * 266) / 174, yMin: 0, yMax: 10 };

/** Indifference curves drawn for reference, dashed. */
const LEVELS = [4, 16, 36, 64];
/** Length of both arrows on the graph; the panel gives their true sizes. */
const ARROW = 2.2;

/** Utility U(x, y) = x·y (topic MV02, Example 3). */
export const utility = (x: number, y: number) => x * y;

/** The gradient ∇U = (U_x, U_y) = (y, x): each marginal utility holds the other good fixed. */
export const gradient = (x: number, y: number): Vec => [y, x];

/** The length ‖v‖ = √(v₁² + v₂²). */
export const norm = (v: Vec) => Math.hypot(v[0], v[1]);

/** The unit vector at `degrees` from the x-axis, anticlockwise. */
export const unitAt = (degrees: number): Vec => {
  const t = (degrees * Math.PI) / 180;
  return [Math.cos(t), Math.sin(t)];
};

/** D_u U = ∇U·u for a unit vector u. */
export const directional = (g: Vec, u: Vec) => g[0] * u[0] + g[1] * u[1];

/** The direction of the gradient, in degrees from the x-axis (0 to 360). */
export const gradientAngle = (g: Vec) => {
  const deg = (Math.atan2(g[1], g[0]) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
};

/** How the chosen direction compares with the gradient, in words. */
export function describeDirection(g: Vec, u: Vec): string {
  const cos = directional(g, u) / norm(g);
  if (cos > 0.999)
    return 'Direction u points along the gradient: utility rises as fast as it can here.';
  if (cos < -0.999)
    return 'Direction u points against the gradient: utility falls as fast as it can.';
  if (Math.abs(cos) < 0.02)
    return 'Direction u runs along the indifference curve, at a right angle to the gradient, so utility hardly changes.';
  return cos > 0
    ? 'Direction u makes an acute angle with the gradient, so utility rises, but more slowly than along the gradient.'
    : 'Direction u makes an obtuse angle with the gradient, so utility falls.';
}

const add = (a: Vec, b: Vec, s = 1): Vec => [a[0] + s * b[0], a[1] + s * b[1]];
const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s];

/** An arrow of fixed length from `from` in the direction `dir`, as three segments. */
function Arrow({ from, dir, tone }: { from: Vec; dir: Vec; tone: 'gold' | 'green' }) {
  const along = scale(dir, 1 / norm(dir));
  const across: Vec = [-along[1], along[0]];
  const tip = add(from, along, ARROW);
  const back = add(tip, along, -0.4);
  return (
    <>
      <Segment frame={FRAME} from={from} to={tip} tone={tone} />
      <Segment frame={FRAME} from={add(back, across, 0.22)} to={tip} tone={tone} />
      <Segment frame={FRAME} from={add(back, across, -0.22)} to={tip} tone={tone} />
    </>
  );
}

/** MV02: a point on the indifference map of U = x·y, its gradient and a chosen direction u. */
export function GradientLevelCurves() {
  const [x, setX] = useState(4);
  const [y, setY] = useState(6);
  const [theta, setTheta] = useState(0);
  const point: Vec = [x, y];
  const level = utility(x, y);
  const g = gradient(x, y);
  const u = unitAt(theta);
  const rate = directional(g, u);

  // A small square marks the right angle between the gradient and the indifference curve.
  const gHat = scale(g, 1 / norm(g));
  const tangent: Vec = [gHat[1], -gHat[0]];
  const c1 = add(point, tangent, 0.5);
  const c2 = add(c1, gHat, 0.5);
  const c3 = add(point, gHat, 0.5);
  const gTip = add(point, gHat, ARROW + 0.45);
  const uTip = add(point, u, ARROW + 0.45);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x" yLabel="y" xTicks={[0, 4, 8, 12]} yTicks={[4, 8]}>
        {LEVELS.map((k) => (
          <Curve key={k} frame={FRAME} fn={(v) => k / v} from={k / 9.4} dashed />
        ))}
        <Curve frame={FRAME} fn={(v) => level / v} from={level / 9.4} />
        <Segment frame={FRAME} from={c1} to={c2} />
        <Segment frame={FRAME} from={c2} to={c3} />
        <Arrow from={point} dir={u} tone="green" />
        <Arrow from={point} dir={g} tone="gold" />
        <Note frame={FRAME} x={gTip[0]} y={gTip[1] - 0.2} anchor="middle">
          ∇U
        </Note>
        <Note frame={FRAME} x={uTip[0]} y={uTip[1] - 0.2} anchor="middle">
          u
        </Note>
        <Dot frame={FRAME} x={x} y={y} />
      </Plot>
      <Slider label="Good x" value={x} min={1.5} max={12} step={0.5} onChange={setX} />
      <Slider label="Good y" value={y} min={1.5} max={7} step={0.5} onChange={setY} />
      <Slider
        label="Direction of u"
        value={theta}
        min={0}
        max={359}
        onChange={setTheta}
        format={(v) => `${v}°`}
      />
      <Readout
        items={[
          ['Gradient ∇U', `(${fmt(g[0])}, ${fmt(g[1])})`],
          ['Length |∇U|', fmt(norm(g))],
          ['Rate along u', fmt(rate)],
        ]}
      />
      <figcaption>
        U = x·y. At ({fmt(x)}, {fmt(y)}) utility is {fmt(level)}; the solid curve is the
        indifference curve U = {fmt(level)}, the dashed ones are U = 4, 16, 36 and 64. The gold
        arrow is the gradient, at {fmt(gradientAngle(g), 0)}°; the green arrow is u. Both are drawn
        the same length. {describeDirection(g, u)}
      </figcaption>
    </figure>
  );
}
