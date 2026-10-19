import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// The M/M/1 queue (topic SP05): the average time in the system against the utilisation.

// With whole-number rates W = 60/(μ − λ) is at most 60 minutes, so 90 leaves room for the curve.
const W_MAX = 90;
const FRAME = { xMin: 0, xMax: 1.08, yMin: 0, yMax: W_MAX };

export interface Mm1Measures {
  rho: number;
  /** Average number in the system. */
  L: number;
  /** Average number waiting in the queue. */
  Lq: number;
  /** Average time in the system, in minutes. */
  W: number;
  /** Average wait before service, in minutes. */
  Wq: number;
}

/** M/M/1 measures for rates per hour, or null when ρ = λ/μ ≥ 1 (no steady state). */
export function mm1Measures(lambda: number, mu: number): Mm1Measures | null {
  const rho = lambda / mu;
  if (rho >= 1) return null;
  return {
    rho,
    L: rho / (1 - rho),
    Lq: (rho * rho) / (1 - rho),
    W: 60 / (mu - lambda),
    Wq: (60 * lambda) / (mu * (mu - lambda)),
  };
}

/** Average time in the system in minutes at utilisation ρ: the service time 60/μ divided by 1 − ρ. */
export function waitingMinutes(rho: number, mu: number): number {
  return 60 / mu / (1 - rho);
}

/** What the current utilisation means for the queue. */
export function describeQueue(rho: number): string {
  if (rho >= 1)
    return 'Customers arrive at least as fast as they can be served, so the queue grows without limit: there is no average wait at all.';
  if (rho < 0.5)
    return 'At this low utilisation the server is often idle and customers rarely wait long, but much of the capacity you pay for is unused.';
  if (rho < 0.85)
    return 'The curve is starting to bend upwards: each extra customer per hour now adds more waiting than the one before.';
  return 'This is the steep part of the curve: a small rise in arrivals, or a slightly slower server, makes the wait shoot up.';
}

/** SP05: set λ and μ; see where the queue sits on the curve W = (1/μ)/(1 − ρ). */
export function QueueWaitingCurve() {
  const [lambda, setLambda] = useState(12);
  const [mu, setMu] = useState(15);
  const m = mm1Measures(lambda, mu);
  const service = 60 / mu;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="ρ"
        yLabel="W (minutes)"
        xTicks={[0, 0.25, 0.5, 0.75, 1]}
        yTicks={[30, 60, 90]}
      >
        <Segment frame={FRAME} from={[1, 0]} to={[1, W_MAX]} dashed />
        <Segment frame={FRAME} from={[0, service]} to={[1, service]} tone="green" dashed />
        <Curve frame={FRAME} fn={(r) => waitingMinutes(r, mu)} from={0} to={0.9995} />
        {m && <Guides frame={FRAME} x={m.rho} y={m.W} />}
        {m && <Dot frame={FRAME} x={m.rho} y={m.W} />}
        {!m && (
          <Note frame={FRAME} x={0.05} y={W_MAX * 0.72}>
            ρ ≥ 1: unstable
          </Note>
        )}
      </Plot>
      <Slider
        label="Arrival rate λ per hour"
        value={lambda}
        min={1}
        max={30}
        onChange={setLambda}
      />
      <Slider label="Service rate μ per hour" value={mu} min={5} max={30} onChange={setMu} />
      <Readout
        items={[
          ['Utilisation ρ', fmt(lambda / mu, 2)],
          ['Average number L', m ? fmt(m.L, 2) : 'no limit'],
          ['Time in system W', m ? `${fmt(m.W, 1)} min` : 'no limit'],
        ]}
      />
      <figcaption>
        The lilac curve is the average time in the system, W = (1/μ)/(1 − ρ), for a server who
        handles {mu} customers an hour; the dashed green line is the service time alone,{' '}
        {fmt(service, 1)} minutes, and the dashed gold line marks ρ = 1. Waiting time does not grow
        in step with ρ: it is multiplied by 1/(1 − ρ), which shoots up as ρ approaches 1.{' '}
        {describeQueue(lambda / mu)}
      </figcaption>
    </figure>
  );
}
