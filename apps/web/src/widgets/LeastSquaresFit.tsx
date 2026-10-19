import { useState } from 'react';
import { Curve, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

// Monthly disposable income x and consumption spending y (both in hundreds) of eight households:
// the data of topic ST205, Example 2. Their least-squares line is ŷ = 10 + 0.8x.
export const INCOME = [20, 30, 40, 50, 60, 70, 80, 90];
export const SPENDING = [30, 28, 44, 54, 50, 66, 80, 80];
const FRAME = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };

const sum = (vs: number[]) => vs.reduce((s, v) => s + v, 0);
const mean = (vs: number[]) => sum(vs) / vs.length;

/** The least-squares line: b₁ = Σ(x − x̄)(y − ȳ)/Σ(x − x̄)², b₀ = ȳ − b₁x̄. */
export function leastSquares(xs = INCOME, ys = SPENDING) {
  const mx = mean(xs);
  const my = mean(ys);
  const sxy = sum(xs.map((x, i) => (x - mx) * ((ys[i] ?? 0) - my)));
  const sxx = sum(xs.map((x) => (x - mx) ** 2));
  const b1 = sxy / sxx;
  return { b0: my - b1 * mx, b1 };
}

/** The residuals y − (b₀ + b₁x) of a line through the data. */
export const residuals = (b0: number, b1: number, xs = INCOME, ys = SPENDING) =>
  xs.map((x, i) => (ys[i] ?? 0) - (b0 + b1 * x));

/** The sum of squared residuals of a line. */
export const ssrOf = (b0: number, b1: number) => sum(residuals(b0, b1).map((e) => e * e));

/** The total sum of squares Σ(y − ȳ)². */
export const sst = () => sum(SPENDING.map((y) => (y - mean(SPENDING)) ** 2));

/** R² = 1 − SSR/SST of the least-squares line. */
export function rSquared(): number {
  const { b0, b1 } = leastSquares();
  return 1 - ssrOf(b0, b1) / sst();
}

/** What the student should notice about the line they have drawn. */
export function describeFit(b0: number, b1: number): string {
  const best = leastSquares();
  const gap = ssrOf(b0, b1) - ssrOf(best.b0, best.b1);
  const total = sum(residuals(b0, b1));
  if (gap < 0.5)
    return `You have found the least-squares line: no other line has a smaller SSR, and its residuals add up to ${fmt(Math.abs(total))}.`;
  const shift =
    Math.abs(total) < 0.5
      ? 'Your residuals already add up to 0, so the intercept is the best one for this slope; now change the slope.'
      : `Your residuals add up to ${fmt(total)}, not 0: the line is too ${total > 0 ? 'low' : 'high'} on average, so ${total > 0 ? 'raise' : 'lower'} the intercept.`;
  return `Your line's SSR is ${fmt(gap, 0)} more than the least-squares one. ${shift}`;
}

/** ST205: move a candidate line through eight households and see its sum of squared residuals. */
export function LeastSquaresFit() {
  const [b1, setB1] = useState(0.5);
  const [b0, setB0] = useState(30);
  const best = leastSquares();
  const yours = ssrOf(b0, b1);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="income x"
        yLabel="spending y"
        xTicks={[20, 40, 60, 80, 100]}
        yTicks={[20, 40, 60, 80, 100]}
      >
        {INCOME.map((x, i) => (
          <Segment key={`e${x}`} frame={FRAME} from={[x, SPENDING[i] ?? 0]} to={[x, b0 + b1 * x]} />
        ))}
        <Curve frame={FRAME} fn={(x) => best.b0 + best.b1 * x} tone="green" dashed />
        <Curve frame={FRAME} fn={(x) => b0 + b1 * x} />
        {INCOME.map((x, i) => (
          <Dot key={x} frame={FRAME} x={x} y={SPENDING[i] ?? 0} />
        ))}
      </Plot>
      <Slider label="Slope b₁" value={b1} min={0.3} max={1.3} step={0.05} onChange={setB1} />
      <Slider label="Intercept b₀" value={b0} min={-10} max={40} onChange={setB0} />
      <Readout
        items={[
          ['Your SSR', fmt(yours, 0)],
          ['Least-squares SSR', fmt(ssrOf(best.b0, best.b1), 0)],
          ['R² (least squares)', fmt(rSquared(), 3)],
        ]}
      />
      <figcaption>
        Each dot is a household. The solid line is your line ŷ = b₀ + b₁x and the gold segments are
        its residuals; SSR adds up their squared lengths. The dashed green line is the least-squares
        line ŷ = {fmt(best.b0)} + {fmt(best.b1)}x, the one line with the smallest possible SSR.{' '}
        {describeFit(b0, b1)}
      </figcaption>
    </figure>
  );
}
