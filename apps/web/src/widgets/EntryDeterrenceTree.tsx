import { useState } from 'react';
import { Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

/** The entry game of GT03 Example 1, profits in millions. */
export const MONOPOLY = 100;
export const ACCOMMODATE = 40;
export const SHARE = 30;
export const LOSS = 20;

const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 7 };
const ROOT: [number, number] = [2, 3.9];
const OUT: [number, number] = [5, 6.2];
const NODE: [number, number] = [5, 2.4];
const FIGHT: [number, number] = [7.6, 4.1];
const SHARED: [number, number] = [7.6, 0.9];

export interface EntryOutcome {
  /** The incumbent's profit from accommodating once the penalty is paid. */
  accommodateNet: number;
  /** The incumbent's plan after entry: an indifferent incumbent carries out the threat. */
  fights: boolean;
  /** The entrant's choice, given that plan. */
  enters: boolean;
  /** Subgame-perfect payoffs (entrant, incumbent). */
  payoffs: [number, number];
}

/** Backward induction in the entry game with fighting profit F and a penalty P for accommodating. */
export function solveEntry(fight: number, penalty: number): EntryOutcome {
  const accommodateNet = ACCOMMODATE - penalty;
  const fights = fight >= accommodateNet;
  const enters = (fights ? -LOSS : SHARE) > 0;
  const payoffs: [number, number] = !enters
    ? [0, MONOPOLY]
    : fights
      ? [-LOSS, fight]
      : [SHARE, accommodateNet];
  return { accommodateNet, fights, enters, payoffs };
}

/** The caption: the comparison at each node, last mover first. */
export function describeEntry(fight: number, penalty: number): string {
  const o = solveEntry(fight, penalty);
  const net =
    penalty > 0 ? `${ACCOMMODATE} − ${penalty} = ${fmt(o.accommodateNet)}` : `${ACCOMMODATE}`;
  const first = `Start at the last move. After entry the incumbent compares fighting (${fmt(fight)}) with accommodating (${net}), so it ${o.fights ? 'fights' : 'accommodates'}.`;
  const second = o.fights
    ? ` The threat is credible: the entrant foresees a price war that would cost it ${LOSS}, stays out, and the incumbent keeps ${MONOPOLY}.`
    : ` A threat to fight is not credible: the entrant foresees accommodation, compares ${SHARE} with 0 and enters.`;
  return `${first}${second} Gold branches are the choices backward induction picks at each node, even where play never gets there; the filled end point is the subgame-perfect outcome. Payoffs are (entrant, incumbent) in millions.`;
}

const pair = (e: number, i: number) => `(${fmt(e)}, ${fmt(i)})`;

/** GT03: an entry-deterrence game tree solved by backward induction; a penalty can make the threat credible. */
export function EntryDeterrenceTree() {
  const [fight, setFight] = useState(10);
  const [penalty, setPenalty] = useState(0);
  const o = solveEntry(fight, penalty);
  const branch = (from: [number, number], to: [number, number], chosen: boolean) => (
    <Segment frame={FRAME} from={from} to={to} tone={chosen ? 'gold' : 'lilac'} dashed={!chosen} />
  );

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="" yLabel="payoffs: (entrant, incumbent)">
        {branch(ROOT, OUT, !o.enters)}
        {branch(ROOT, NODE, o.enters)}
        {branch(NODE, FIGHT, o.fights)}
        {branch(NODE, SHARED, !o.fights)}
        <Dot frame={FRAME} x={ROOT[0]} y={ROOT[1]} />
        <Dot frame={FRAME} x={NODE[0]} y={NODE[1]} />
        <Dot frame={FRAME} x={OUT[0]} y={OUT[1]} hollow={o.enters} />
        <Dot frame={FRAME} x={FIGHT[0]} y={FIGHT[1]} hollow={!(o.enters && o.fights)} />
        <Dot frame={FRAME} x={SHARED[0]} y={SHARED[1]} hollow={!(o.enters && !o.fights)} />
        <Note frame={FRAME} x={1.75} y={3.75} anchor="end">
          Entrant
        </Note>
        <Note frame={FRAME} x={4.8} y={1.85} anchor="end">
          Incumbent
        </Note>
        <Note frame={FRAME} x={3.3} y={5.45} anchor="end">
          Out
        </Note>
        <Note frame={FRAME} x={3.6} y={3.55}>
          In
        </Note>
        <Note frame={FRAME} x={6.1} y={3.45} anchor="end">
          Fight
        </Note>
        <Note frame={FRAME} x={6} y={2.05}>
          Accommodate
        </Note>
        <Note frame={FRAME} x={OUT[0] + 0.3} y={OUT[1] - 0.15}>
          {pair(0, MONOPOLY)}
        </Note>
        <Note frame={FRAME} x={FIGHT[0] + 0.3} y={FIGHT[1] - 0.15}>
          {pair(-LOSS, fight)}
        </Note>
        <Note frame={FRAME} x={SHARED[0] + 0.3} y={SHARED[1] - 0.15}>
          {pair(SHARE, o.accommodateNet)}
        </Note>
      </Plot>
      <Slider
        label="Incumbent's profit if it fights, F"
        value={fight}
        min={0}
        max={60}
        step={5}
        onChange={setFight}
      />
      <Slider
        label="Penalty if it accommodates, P"
        value={penalty}
        min={0}
        max={50}
        step={5}
        onChange={setPenalty}
      />
      <Readout
        items={[
          ['After entry, incumbent', o.fights ? 'Fights' : 'Accommodates'],
          ['Entrant', o.enters ? 'Enters' : 'Stays out'],
          ['Payoffs (E, I)', pair(...o.payoffs)],
        ]}
      />
      <figcaption>{describeEntry(fight, penalty)}</figcaption>
    </figure>
  );
}
