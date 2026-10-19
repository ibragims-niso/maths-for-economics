import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Slider } from './kit';

/** Borrowers in the picture; each square is one of them. */
export const POPULATION = 1000;
/** The 1000 squares sit in 20 rows of 50. */
export const COLUMNS = 50;
export const ROWS = POPULATION / COLUMNS;

/** The grid fills y from GRID_BOTTOM to GRID_TOP; the bar of warned borrowers sits below it. */
const GRID_TOP = 27;
const GRID_BOTTOM = GRID_TOP - ROWS;
const BAR = { bottom: 0.6, top: 3.2 };
const FRAME = { xMin: 0, xMax: COLUMNS, yMin: 0, yMax: GRID_TOP };
/** The kit's fills are pale; three layers make a small square clearly visible. */
const LAYERS = [0, 1, 2] as const;
const GAP = 0.13;

type Tone = 'gold' | 'green' | 'lilac';

/**
 * Expected numbers of borrowers out of `population` (rates in per cent): the "natural
 * frequencies" version of Bayes' theorem.
 */
export function naturalFrequencies(
  base: number,
  hit: number,
  falseAlarm: number,
  population = POPULATION,
) {
  const defaulters = (population * base) / 100;
  const truePositives = (defaulters * hit) / 100;
  const falseAlarms = ((population - defaulters) * falseAlarm) / 100;
  const flagged = truePositives + falseAlarms;
  return {
    defaulters,
    repayers: population - defaulters,
    truePositives,
    missed: defaulters - truePositives,
    falseAlarms,
    flagged,
    /** P(default | warning) by Bayes' theorem: true warnings over all warnings. */
    posterior: flagged > 0 ? truePositives / flagged : 0,
  };
}

/** The same counts in whole borrowers, adding up to the population, for drawing. */
export function wholeBorrowers(base: number, hit: number, falseAlarm: number) {
  const f = naturalFrequencies(base, hit, falseAlarm);
  const defaulters = Math.round(f.defaulters);
  const truePositives = Math.round(f.truePositives);
  const falseAlarms = Math.round(f.falseAlarms);
  return {
    truePositives,
    missed: defaulters - truePositives,
    falseAlarms,
    clear: POPULATION - defaulters - falseAlarms,
  };
}

/** Column and row (from the top) of square number `index`, filled row by row. */
export function cellOf(index: number): [col: number, row: number] {
  return [index % COLUMNS, Math.floor(index / COLUMNS)];
}

/** The caption: who gets a warning, and why a warning for a rare event is often a false alarm. */
export function describeBayes(base: number, hit: number, falseAlarm: number): string {
  const f = naturalFrequencies(base, hit, falseAlarm);
  const w = wholeBorrowers(base, hit, falseAlarm);
  const rounded = [f.truePositives, f.falseAlarms].some((x) => !Number.isInteger(x));
  const about = rounded ? 'about ' : '';
  const repayers =
    w.falseAlarms === 0
      ? ` It warns none of the ${fmt(f.repayers)} who repay: there are no false alarms.`
      : ` Of the ${fmt(f.repayers)} who repay, it also warns ${about}${fmt(w.falseAlarms)} (green): false alarms.`;
  const intro = `Each square is one of ${fmt(POPULATION)} borrowers. Of the ${fmt(f.defaulters)} who default, the model warns ${about}${fmt(w.truePositives)} (gold) and misses ${about}${fmt(w.missed)} (lilac).${repayers}`;
  const share = ` The bar at the bottom is everyone warned: ${about}${fmt(w.truePositives)} of ${about}${fmt(w.truePositives + w.falseAlarms)} default, so P(default | warning) = ${fmt(f.posterior, 3)}.`;
  const why =
    f.falseAlarms > f.truePositives
      ? ' Defaults are rare, so even a small false-alarm rate applied to the large group that repays produces more warnings than the few defaulters do.'
      : ' Here true warnings outnumber false alarms, so a warning is strong evidence of default.';
  return intro + share + why;
}

/** A filled rectangle, drawn in layers so the colour is strong enough. */
function Block({
  x0,
  x1,
  y0,
  y1,
  tone,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  tone: Tone;
}) {
  const corners: [number, number][] = [
    [x0, y1],
    [x1, y1],
    [x1, y0],
    [x0, y0],
  ];
  return (
    <>
      {LAYERS.map((layer) => (
        <Area key={layer} frame={FRAME} tone={tone} points={corners} />
      ))}
    </>
  );
}

/** ST102: Bayes' theorem with 1000 borrowers: set the default, hit and false-alarm rates. */
export function BayesNaturalFrequencies() {
  const [base, setBase] = useState(5);
  const [hit, setHit] = useState(80);
  const [falseAlarm, setFalseAlarm] = useState(10);
  const f = naturalFrequencies(base, hit, falseAlarm);
  const w = wholeBorrowers(base, hit, falseAlarm);

  // Warned defaulters first, then false alarms (together: everyone warned), then missed defaulters.
  const groups: [Tone, number][] = [
    ['gold', w.truePositives],
    ['green', w.falseAlarms],
    ['lilac', w.missed],
  ];
  const squares: { index: number; tone: Tone }[] = [];
  let next = 0;
  for (const [tone, count] of groups) {
    for (let k = 0; k < count; k++) squares.push({ index: next++, tone });
  }
  const goldWidth = f.posterior * COLUMNS;

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="" yLabel="">
        {squares.map(({ index, tone }) => {
          const [col, row] = cellOf(index);
          const top = GRID_TOP - row;
          return (
            <Block
              key={index}
              x0={col + GAP}
              x1={col + 1 - GAP}
              y0={top - 1 + GAP}
              y1={top - GAP}
              tone={tone}
            />
          );
        })}
        <Note frame={FRAME} x={COLUMNS / 2} y={GRID_BOTTOM + 1.2} anchor="middle">
          {fmt(w.clear)} repay with no warning
        </Note>
        <Note frame={FRAME} x={0.3} y={BAR.top + 1.1}>
          warned: {fmt(w.truePositives + w.falseAlarms)} ({fmt(w.truePositives)} default,{' '}
          {fmt(w.falseAlarms)} repay)
        </Note>
        {goldWidth > 0 && <Block x0={0} x1={goldWidth} y0={BAR.bottom} y1={BAR.top} tone="gold" />}
        {goldWidth < COLUMNS && (
          <Block x0={goldWidth} x1={COLUMNS} y0={BAR.bottom} y1={BAR.top} tone="green" />
        )}
      </Plot>
      <Slider
        label="Default rate P(D)"
        value={base}
        min={1}
        max={30}
        onChange={setBase}
        format={(v) => `${v} %`}
      />
      <Slider
        label="Hit rate P(W | D)"
        value={hit}
        min={50}
        max={100}
        onChange={setHit}
        format={(v) => `${v} %`}
      />
      <Slider
        label="False-alarm rate P(W | not D)"
        value={falseAlarm}
        min={0}
        max={30}
        onChange={setFalseAlarm}
        format={(v) => `${v} %`}
      />
      <Readout
        items={[
          ['True warnings', fmt(f.truePositives, 1)],
          ['False alarms', fmt(f.falseAlarms, 1)],
          ['P(default | warning)', fmt(f.posterior, 3)],
        ]}
      />
      <figcaption>{describeBayes(base, hit, falseAlarm)}</figcaption>
    </figure>
  );
}
