import { useState } from 'react';
import { Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

const FRAME = { xMin: -0.08, xMax: 1.08, yMin: -0.2, yMax: 1.16 };
/** Tax saved by cheating when there is no audit, in thousands (GT02 Example 1). */
export const GAIN = 10;

/** The audit rate that leaves the taxpayer indifferent: (1 − p)·G = p·F, so p* = G/(G + F). */
export const auditRate = (fine: number) => GAIN / (GAIN + fine);

/** The cheating rate that leaves the office indifferent: cost C = q·G, so q* = C/G. */
export const cheatRate = (cost: number) => cost / GAIN;

/** The taxpayer's expected gain from cheating, compared with honesty, when audits come with probability p. */
export const cheatGain = (p: number, fine: number) => (1 - p) * GAIN - p * fine;

/** The taxpayer's best reply to audit rate p: cheat (1), report honestly (0), or either (undefined). */
export function taxpayerReply(p: number, fine: number): 0 | 1 | undefined {
  const gain = cheatGain(p, fine);
  if (Math.abs(gain) < 1e-9) return undefined;
  return gain > 0 ? 1 : 0;
}

/** The caption's sentence about the trial audit rate the student has chosen. */
export function describeTrial(p: number, fine: number): string {
  const gain = cheatGain(p, fine);
  const at = `At your trial audit rate p = ${fmt(p)}`;
  if (Math.abs(gain) < 1e-9)
    return `${at} cheating gains nothing on average, so the taxpayer is indifferent and willing to mix: this is p*.`;
  return gain > 0
    ? `${at} cheating gains ${fmt(gain)} thousand on average, so the taxpayer cheats for sure (the hollow dot sits at q = 1).`
    : `${at} cheating loses ${fmt(-gain)} thousand on average, so the taxpayer reports honestly (the hollow dot sits at q = 0).`;
}

/** The whole caption: what the two step graphs are, the trial rate, and what the fine changes. */
export function describeAudit(fine: number, cost: number, trial: number): string {
  const p = fmt(auditRate(fine), 3);
  const q = fmt(cheatRate(cost), 3);
  return [
    `Cheating saves ${GAIN} thousand in tax unless there is an audit. The lilac steps are the taxpayer's best reply to each audit rate p: cheat (q = 1) while p is below p* = ${GAIN}/(${GAIN} + F) = ${p}, report honestly (q = 0) above it.`,
    `The green steps are the office's best reply to each cheating rate q: no audits while q is below q* = C/${GAIN} = ${q}, audit everyone above it. They cross only at the dot (p*, q*), the mixed equilibrium.`,
    describeTrial(trial, fine),
    "A bigger fine moves only the lilac step to the left: the office needs fewer audits to deter cheating, but the cheating rate q* stays the same, because it is set by the office's cost of auditing, not by the fine.",
  ].join(' ');
}

/** GT02: the inspection game as two best-response step graphs in the (p, q) square; they cross at the mixed equilibrium. */
export function AuditBestResponses() {
  const [fine, setFine] = useState(30);
  const [cost, setCost] = useState(2);
  const [trial, setTrial] = useState(0.1);
  const p = auditRate(fine);
  const q = cheatRate(cost);
  const reply = taxpayerReply(trial, fine);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="p (audit)"
        yLabel="q (cheat)"
        xTicks={[0, 0.5, 1]}
        yTicks={[0.5, 1]}
      >
        <Segment frame={FRAME} from={[trial, 0]} to={[trial, 1]} dashed />
        {/* Taxpayer: cheat while audits are rare, honest once they are frequent. */}
        <Segment frame={FRAME} from={[0, 1]} to={[p, 1]} tone="lilac" />
        <Segment frame={FRAME} from={[p, 1]} to={[p, 0]} tone="lilac" />
        <Segment frame={FRAME} from={[p, 0]} to={[1, 0]} tone="lilac" />
        {/* Office: no audits while cheating is rare, audit everyone once it is common. */}
        <Segment frame={FRAME} from={[0, 0]} to={[0, q]} tone="green" />
        <Segment frame={FRAME} from={[0, q]} to={[1, q]} tone="green" />
        <Segment frame={FRAME} from={[1, q]} to={[1, 1]} tone="green" />
        <Note frame={FRAME} x={p + 0.03} y={q > 0.5 ? 0.3 : 0.7}>
          taxpayer
        </Note>
        <Note frame={FRAME} x={0.97} y={q > 0.85 ? q - 0.09 : q + 0.04} anchor="end">
          office
        </Note>
        <Guides frame={FRAME} x={p} y={q} />
        <Dot frame={FRAME} x={p} y={q} />
        <Dot frame={FRAME} x={trial} y={reply ?? q} hollow />
      </Plot>
      <Slider label="Fine F (thousand)" value={fine} min={5} max={60} step={5} onChange={setFine} />
      <Slider
        label="Audit cost C (thousand)"
        value={cost}
        min={0.5}
        max={9.5}
        step={0.5}
        onChange={setCost}
      />
      <Slider
        label="Trial audit rate p"
        value={trial}
        min={0}
        max={1}
        step={0.05}
        onChange={setTrial}
      />
      <Readout
        items={[
          ['Audit rate p*', fmt(p, 3)],
          ['Cheating rate q*', fmt(q, 3)],
          ['Gain from cheating at p', fmt(cheatGain(trial, fine))],
        ]}
      />
      <figcaption>{describeAudit(fine, cost, trial)}</figcaption>
    </figure>
  );
}
