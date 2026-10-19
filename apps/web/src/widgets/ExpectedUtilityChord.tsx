import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Expected utility and risk aversion (topic SP02). Wealth is in thousands on the graph.

/** Wealth without the loss, in thousands (worked examples 1 and 2 in SP02). */
export const WEALTH = 90;
/** The utility curve is rescaled to run from 0 at W_LOW to 1 at W_HIGH (thousands). */
const W_LOW = 30;
const W_HIGH = 100;
const FRAME = { xMin: 20, xMax: 100, yMin: 0, yMax: 1.08 };

/** CRRA utility W^(1−γ)/(1−γ), with ln W at γ = 1. γ = 0 is linear, γ < 0 convex. */
export function crraUtility(w: number, gamma: number): number {
  return gamma === 1 ? Math.log(w) : w ** (1 - gamma) / (1 - gamma);
}

/** The inverse of crraUtility: the wealth with utility v. */
export function crraInverse(v: number, gamma: number): number {
  return gamma === 1 ? Math.exp(v) : ((1 - gamma) * v) ** (1 / (1 - gamma));
}

/** Utility rescaled to 0 at W_LOW and 1 at W_HIGH; a positive linear rescaling changes no choice. */
export function scaledUtility(w: number, gamma: number): number {
  const lo = crraUtility(W_LOW, gamma);
  return (crraUtility(w, gamma) - lo) / (crraUtility(W_HIGH, gamma) - lo);
}

export interface Gamble {
  /** Expected wealth E[W]. */
  expected: number;
  /** Expected (rescaled) utility E[u(W)]. */
  expectedUtility: number;
  /** Certainty equivalent: u(CE) = E[u(W)]. */
  ce: number;
  /** Risk premium E[W] − CE (negative for a risk lover). */
  premium: number;
}

/** Wealth `wealth − loss` with probability p, `wealth` otherwise, for CRRA utility with this γ. */
export function gamble(wealth: number, loss: number, p: number, gamma: number): Gamble {
  const low = wealth - loss;
  const expected = p * low + (1 - p) * wealth;
  const eu = p * crraUtility(low, gamma) + (1 - p) * crraUtility(wealth, gamma);
  const ce = crraInverse(eu, gamma);
  return {
    expected,
    expectedUtility: p * scaledUtility(low, gamma) + (1 - p) * scaledUtility(wealth, gamma),
    ce,
    premium: expected - ce,
  };
}

/** The utility function in words for the caption. */
export function utilityName(gamma: number): string {
  if (gamma === 0) return 'u(W) = W';
  if (gamma === 0.5) return 'u(W) = √W (up to a factor 2)';
  if (gamma === 1) return 'u(W) = ln W';
  if (gamma === -1) return 'u(W) = W²/2';
  return `u(W) = W^(1 − γ)/(1 − γ) with γ = ${fmt(gamma, 1)}`;
}

/** What the curvature says about the attitude to risk. */
export function describeAttitude(gamma: number): string {
  if (gamma > 0)
    return 'The curve is concave, so the chord lies below it: the gamble is worth less to this person than its average, CE < E[W], and the risk premium is positive. That is risk aversion.';
  if (gamma === 0)
    return 'With γ = 0 utility is a straight line, the chord lies on it and CE = E[W]: a risk-neutral person cares only about the average.';
  return 'With γ < 0 the curve is convex and the chord lies above it: CE > E[W] and the risk premium is negative. This person is risk-loving and would pay to take the gamble.';
}

/** SP02: a wealth of 90,000 at risk of a loss; the chord of the utility curve shows E[u(W)], E[W] and CE. */
export function ExpectedUtilityChord() {
  const [gamma, setGamma] = useState(0.5);
  const [loss, setLoss] = useState(50);
  const [p, setP] = useState(0.5);
  const low = WEALTH - loss;
  const g = gamble(WEALTH, loss, p, gamma);
  const ceLeft = g.ce <= g.expected;
  // Near the right-hand end the labels would run into the axis name, so lift them a little.
  const labelY = Math.max(g.ce, g.expected) > 84 ? 0.14 : 0.03;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="W"
        yLabel="utility (rescaled)"
        xTicks={[20, 40, 60, 80, 100]}
        yTicks={[0.5, 1]}
      >
        <Curve
          frame={FRAME}
          fn={(w) => (w - W_LOW) / (W_HIGH - W_LOW)}
          from={W_LOW}
          to={W_HIGH}
          tone="green"
          dashed
        />
        <Curve frame={FRAME} fn={(w) => scaledUtility(w, gamma)} from={W_LOW} to={W_HIGH} />
        <Segment
          frame={FRAME}
          from={[low, scaledUtility(low, gamma)]}
          to={[WEALTH, scaledUtility(WEALTH, gamma)]}
        />
        <Segment frame={FRAME} from={[g.expected, 0]} to={[g.expected, g.expectedUtility]} dashed />
        <Guides frame={FRAME} x={g.ce} y={g.expectedUtility} />
        <Dot frame={FRAME} x={low} y={scaledUtility(low, gamma)} hollow />
        <Dot frame={FRAME} x={WEALTH} y={scaledUtility(WEALTH, gamma)} hollow />
        <Dot frame={FRAME} x={g.expected} y={g.expectedUtility} hollow />
        <Dot frame={FRAME} x={g.ce} y={g.expectedUtility} />
        <Note
          frame={FRAME}
          x={g.ce + (ceLeft ? -1 : 1)}
          y={labelY}
          anchor={ceLeft ? 'end' : 'start'}
        >
          CE
        </Note>
        <Note
          frame={FRAME}
          x={g.expected + (ceLeft ? 1 : -1)}
          y={labelY}
          anchor={ceLeft ? 'start' : 'end'}
        >
          E[W]
        </Note>
      </Plot>
      <Slider
        label="Risk aversion γ"
        value={gamma}
        min={-1}
        max={4}
        step={0.5}
        onChange={setGamma}
      />
      <Slider
        label="Loss L (thousands)"
        value={loss}
        min={10}
        max={60}
        step={5}
        onChange={setLoss}
      />
      <Slider
        label="Probability of the loss p"
        value={p}
        min={0.01}
        max={0.99}
        step={0.01}
        onChange={setP}
      />
      <Readout
        items={[
          ['Expected wealth E[W]', fmt(g.expected * 1000, 0)],
          ['Certainty equivalent CE', fmt(g.ce * 1000, 0)],
          ['Risk premium E[W] − CE', fmt(g.premium * 1000, 0)],
        ]}
      />
      <figcaption>
        Wealth W is shown in thousands: {fmt(WEALTH * 1000, 0)}, or {fmt(low * 1000, 0)} if the loss
        happens. The lilac curve is {utilityName(gamma)}, rescaled to run from 0 at 30,000 to 1 at
        100,000 (rescaling changes no choice); the dashed green line is a risk-neutral, linear
        utility. The gold chord joins the two outcomes, and its point above E[W] (hollow dot) is the
        expected utility. The filled dot is the point of the curve at the same height: its wealth is
        the certainty equivalent. {describeAttitude(gamma)}
      </figcaption>
    </figure>
  );
}
