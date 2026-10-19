import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// Utility U = 24 ln x + y with budget p·x + y ≤ M (topic OP01, Example 1: p = 4, M = 16).
const A = 24;
const FRAME = { xMin: 0, xMax: 13, yMin: 0, yMax: 50 };

/**
 * The Kuhn–Tucker optimum of U = a ln x + y subject to p·x + y ≤ M, x, y ≥ 0. While income
 * covers the tangency point, x = a/p and y = M − a with λ = 1; below that, y = 0, x = M/p and
 * λ = a/M > 1.
 */
export function quasilinearOptimum(a: number, p: number, income: number) {
  const corner = income < a;
  const x = corner ? income / p : a / p;
  const y = income - p * x;
  // λ from ∂L/∂x = a/x − pλ = 0, which holds because x > 0.
  const lambda = a / (p * x);
  return { x, y, lambda, corner };
}

/** Utility a ln x + y of a bundle. */
export const utility = (a: number, x: number, y: number) => a * Math.log(x) + y;

/** The indifference curve at utility level u, as y in terms of x. */
export const indifferenceY = (a: number, u: number) => (x: number) => u - a * Math.log(x);

/** Which constraints hold with equality at the optimum. */
export function bindingLabel(a: number, income: number): string {
  if (income > a) return 'budget only';
  if (income === a) return 'budget; y just reaches 0';
  return 'budget and y ≥ 0';
}

/** OP01: change income and the price; with low income the best bundle jumps to the corner y = 0. */
export function QuasilinearCorner() {
  const [income, setIncome] = useState(16);
  const [price, setPrice] = useState(4);
  const best = quasilinearOptimum(A, price, income);
  const u = utility(A, best.x, best.y);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="good x"
        yLabel="other goods y"
        xTicks={[0, 4, 8, 12]}
        yTicks={[10, 20, 30, 40, 50]}
      >
        <Curve frame={FRAME} fn={indifferenceY(A, u - 12)} from={0.05} dashed />
        <Curve frame={FRAME} fn={indifferenceY(A, u + 12)} from={0.05} dashed />
        <Curve frame={FRAME} fn={indifferenceY(A, u)} from={0.05} />
        <Segment frame={FRAME} from={[0, income]} to={[income / price, 0]} />
        <Guides frame={FRAME} x={best.x} y={best.y} />
        <Dot frame={FRAME} x={best.x} y={best.y} />
      </Plot>
      <Slider label="Income M" value={income} min={4} max={48} step={2} onChange={setIncome} />
      <Slider label="Price of x, p" value={price} min={2} max={8} step={0.5} onChange={setPrice} />
      <Readout
        items={[
          ['Best bundle (x*, y*)', `(${fmt(best.x)}, ${fmt(best.y)})`],
          ['Multiplier λ', fmt(best.lambda)],
          ['Binding', bindingLabel(A, income)],
        ]}
      />
      <figcaption>
        Utility is U = 24 ln x + y. The gold line is the budget p·x + y = M, the solid lilac curve
        is the indifference curve through the best bundle and the dashed curves are one lower and
        one higher level.{' '}
        {best.corner
          ? `Income ${fmt(income)} is below 24, so the tangency point x = 24/p = ${fmt(A / price)} would need a negative y. She spends everything on x and buys no y: the constraint y ≥ 0 binds. Now λ = 24/M = ${fmt(best.lambda)} is above 1, so ∂L/∂y = 1 − λ = ${fmt(1 - best.lambda)} is negative, which complementary slackness allows only because y = 0.`
          : `Income covers the tangency point, where the steepness of the curve, 24/x, equals the price: x* = 24/p = ${fmt(best.x)}, whatever the income. Every extra unit of income goes to y, so λ = 1 and ∂L/∂y = 1 − λ = 0, as complementary slackness requires when y > 0.`}
      </figcaption>
    </figure>
  );
}
