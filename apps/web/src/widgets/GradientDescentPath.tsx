import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

// Topic NM02, Example 2: fit sales y = a + bt to five years t = −2, …, 2 with sales
// 12, 15, 15, 18, 20 by least squares. S(a, b) = 5(a − 16)² + 10(b − 1.9)² + 1.9.
export const YEARS = [-2, -1, 0, 1, 2];
export const SALES = [12, 15, 15, 18, 20];
export const BEST: Vec = [16, 1.9];
const START: Vec = [0, 0];
const FRAME = { xMin: 0, xMax: 24, yMin: -2, yMax: 6 };
const LEVELS = [40, 120, 400];

/** The sum of squared errors S(a, b) = Σ(y − a − bt)², straight from the data. */
export const sumSquares = (a: number, b: number) =>
  YEARS.reduce((s, t, i) => s + ((SALES[i] ?? 0) - a - b * t) ** 2, 0);

/** The gradient (∂S/∂a, ∂S/∂b) = (10a − 160, 20b − 38); Σt = 0 keeps a and b apart. */
export const gradientS = (a: number, b: number): Vec => [10 * a - 160, 20 * b - 38];

/** What one step does to the distance from the best a and from the best b: 1 − 10α and 1 − 20α. */
export const stepFactors = (alpha: number): Vec => [1 - 10 * alpha, 1 - 20 * alpha];

/** The largest stable step size 2/λmax, with curvatures 10 (for a) and 20 (for b). */
export const STABLE_LIMIT = 2 / 20;

/** The points (a₀, b₀) = (0, 0), (a₁, b₁), …, (a_k, b_k) of gradient descent with step size α. */
export function descentPath(alpha: number, steps: number): Vec[] {
  const path: Vec[] = [START];
  let [a, b] = START;
  for (let k = 0; k < steps; k++) {
    const [ga, gb] = gradientS(a, b);
    a -= alpha * ga;
    b -= alpha * gb;
    path.push([a, b]);
  }
  return path;
}

/** The straight pieces of the path, from each point to the next. */
function legs(path: Vec[]): { id: string; from: Vec; to: Vec }[] {
  return path.slice(1).map((to, i) => ({ id: `step${i + 1}`, from: path[i] ?? START, to }));
}

/** The level curve S = level, an ellipse around the best fit, as an upper and a lower half. */
function ellipse(level: number) {
  const rA = Math.sqrt((level - 1.9) / 5);
  const half = (a: number) => Math.sqrt(Math.max(0, (level - 1.9 - 5 * (a - 16) ** 2) / 10));
  return {
    from: 16 - rA,
    to: 16 + rA,
    upper: (a: number) => 1.9 + half(a),
    lower: (a: number) => 1.9 - half(a),
  };
}

const near = (x: number, y: number) => Math.abs(x - y) < 1e-9;

/** What the step size does to the slope b, the steep direction of the bowl. */
export function describeStep(alpha: number): string {
  const [fa, fb] = stepFactors(alpha);
  const factors = `Each step multiplies the distance to the best a by 1 − 10α = ${fmt(fa)} and the distance to the best b by 1 − 20α = ${fmt(fb)}.`;
  let verdict: string;
  if (alpha < 0.05 - 1e-9)
    verdict =
      'Both factors are between 0 and 1, so the path creeps towards the best fit without overshooting; the flat direction a is the slow one.';
  else if (near(alpha, 0.05))
    verdict =
      'α = 1/20 is exactly one over the curvature in b, so b lands on 1.9 in the first step (a Newton step in that direction).';
  else if (alpha < STABLE_LIMIT - 1e-9)
    verdict =
      'The factor for b is negative, so b overshoots and zigzags across 1.9, but the zigzag shrinks: the method still converges.';
  else if (near(alpha, STABLE_LIMIT))
    verdict =
      'At α = 2/20 = 0.1, the stability limit, b bounces between 0 and 3.8 for ever and never settles.';
  else
    verdict =
      'α is above the limit 2/20 = 0.1, so |1 − 20α| > 1: every step overshoots b by more than the last, and S grows instead of falling.';
  return `${factors} ${verdict}`;
}

/** NM02: gradient descent on a least-squares fit, with a step-size and an iteration slider. */
export function GradientDescentPath() {
  const [alpha, setAlpha] = useState(0.04);
  const [steps, setSteps] = useState(2);
  const path = descentPath(alpha, steps);
  const [a, b] = path[path.length - 1] ?? START;
  const [ga, gb] = gradientS(a, b);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="a"
        yLabel="b"
        xTicks={[0, 4, 8, 12, 16, 20, 24]}
        yTicks={[-2, 0, 2, 4, 6]}
      >
        {LEVELS.map((level) => {
          const c = ellipse(level);
          return [
            <Curve key={`u${level}`} frame={FRAME} fn={c.upper} from={c.from} to={c.to} />,
            <Curve key={`l${level}`} frame={FRAME} fn={c.lower} from={c.from} to={c.to} />,
          ];
        })}
        {legs(path).map((leg) => (
          <Segment key={leg.id} frame={FRAME} from={leg.from} to={leg.to} />
        ))}
        <Dot frame={FRAME} x={BEST[0]} y={BEST[1]} hollow />
        <Note frame={FRAME} x={BEST[0]} y={BEST[1] + 0.5} anchor="middle">
          min
        </Note>
        <Dot frame={FRAME} x={a} y={b} />
      </Plot>
      <Slider
        label="Step size α"
        value={alpha}
        min={0.01}
        max={0.12}
        step={0.01}
        onChange={setAlpha}
      />
      <Slider label="Steps taken k" value={steps} min={0} max={15} onChange={setSteps} />
      <Readout
        items={[
          ['Point (a, b)', `(${fmt(a, 3)}, ${fmt(b, 3)})`],
          ['Sum of squares S', fmt(sumSquares(a, b))],
          ['Gradient of S', `(${fmt(ga)}, ${fmt(gb)})`],
        ]}
      />
      <figcaption>
        Fitting sales = a + b·t to five years of data by least squares, with the intercept a across
        and the slope b up. The rings are the sums of squares S = 40, 120 and 400 around the best
        fit a = 16, b = 1.9 (hollow point, S = 1.9). The gold path is gradient descent from (0, 0),
        and the solid point is where it is after k steps. {describeStep(alpha)}
      </figcaption>
    </figure>
  );
}
