import { useState } from 'react';
import { Area, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

const FRAME = { xMin: 0, xMax: 1, yMin: -5, yMax: 8 };
const EPS = 1e-9;

/** One of B's columns: A's gain when A plays row 1 (`top`) and row 2 (`bottom`). */
export interface Column {
  top: number;
  bottom: number;
}

/** B's first two columns in GT05 Example 3; the third is set by the sliders (default −3 and 6). */
export const FIXED: readonly Column[] = [
  { top: -2, bottom: 3 },
  { top: 4, bottom: -1 },
];

export const NAMES = ['B1', 'B2', 'B3'] as const;
const TONES = ['lilac', 'green', 'gold'] as const;

/** A's expected gain against a column when A plays row 1 with probability p. */
export const gainAt = (c: Column, p: number) => p * c.top + (1 - p) * c.bottom;

/** The lower envelope: what B's best answer leaves A at each p. */
export const envelope = (cols: readonly Column[], p: number) =>
  Math.min(...cols.map((c) => gainAt(c, p)));

/** The p in (0, 1) where two columns' lines cross, if they do. */
function crossing(c: Column, d: Column): number | undefined {
  const slope = c.top - c.bottom - (d.top - d.bottom);
  if (slope === 0) return undefined;
  const p = (d.bottom - c.bottom) / slope;
  return p > EPS && p < 1 - EPS ? p : undefined;
}

/** 0, 1 and every crossing, sorted: the envelope is straight between neighbouring points. */
export function breakpoints(cols: readonly Column[]): number[] {
  const ps = [0, 1];
  cols.forEach((c, i) => {
    for (const d of cols.slice(i + 1)) {
      const p = crossing(c, d);
      if (p !== undefined) ps.push(p);
    }
  });
  return [...new Set(ps)].sort((x, y) => x - y);
}

/**
 * The top of the lower envelope: the game value v, the best probabilities [pLow, pHigh] (equal
 * unless the top is flat) and the columns whose lines pass through the top (the ones B uses).
 */
export function solveEnvelope(cols: readonly Column[]) {
  const ps = breakpoints(cols);
  const value = Math.max(...ps.map((p) => envelope(cols, p)));
  const best = ps.filter((p) => Math.abs(envelope(cols, p) - value) < EPS);
  const pLow = Math.min(...best);
  const pHigh = Math.max(...best);
  const active = cols.flatMap((c, j) => (Math.abs(gainAt(c, pLow) - value) < EPS ? [j] : []));
  return { value, pLow, pHigh, active };
}

/** The saddle point [row, column] (lowest in its row, highest in its column), if there is one. */
export function saddlePoint(cols: readonly Column[]): [number, number] | undefined {
  const rows = [cols.map((c) => c.top), cols.map((c) => c.bottom)];
  for (const r of [0, 1])
    for (let j = 0; j < cols.length; j++) {
      const x = rows[r]?.[j] ?? 0;
      if ((rows[r] ?? []).every((y) => x <= y) && rows.every((row) => x >= (row[j] ?? 0)))
        return [r, j];
    }
  return undefined;
}

/**
 * Where to write "B3": at the left end of its line, moved right when it would sit on the B1 or B2
 * label, and below the line near the top of the graph (where the axis name is).
 */
export function labelSpot(c: Column): [number, number] {
  const x =
    (c.bottom >= -3.5 && c.bottom <= -0.5) || (c.bottom >= 2 && c.bottom <= 4) ? 0.16 : 0.03;
  const y = gainAt(c, x);
  return [x, y >= 5.5 ? y - 1 : y + 0.4];
}

/** The read-out text for the best probability of row 1. */
export const describeP = (pLow: number, pHigh: number) =>
  pHigh - pLow > EPS ? `${fmt(pLow, 3)} to ${fmt(pHigh, 3)}` : fmt(pLow, 3);

/** The caption: what the lines are, where the top of the envelope is, and which columns B uses. */
export function describeEnvelope(cols: readonly Column[]): string {
  const { value, pLow, pHigh, active } = solveEnvelope(cols);
  const saddle = saddlePoint(cols);
  const intro =
    'Each line is A’s expected gain against one of B’s columns when A plays row 1 with probability p. B answers with whichever line is lowest, so A can count only on the lower envelope, drawn solid.';
  const top =
    pHigh - pLow > EPS
      ? `Its top is flat at v = ${fmt(value)} for every p from ${fmt(pLow, 3)} to ${fmt(pHigh, 3)}.`
      : `Its highest point is A’s best mix: p* = ${fmt(pLow, 3)}, which guarantees v = ${fmt(value)}.`;
  const unused = cols.flatMap((c, j) =>
    active.includes(j) ? [] : [`${NAMES[j]} (${fmt(gainAt(c, pLow))} there)`],
  );
  let usage = '';
  if (!saddle && active.length >= 2) {
    const names = active.map((j) => NAMES[j]);
    const list = `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
    usage = `The lines through the top, ${list}, are the columns B mixes`;
    usage +=
      unused.length === 0
        ? '.'
        : `; ${unused.join(' and ')} ${unused.length === 1 ? 'lies above the top, so B never uses it.' : 'lie above the top, so B never uses them.'}`;
  }
  const pure = saddle
    ? `The game has a saddle point at (row ${saddle[0] + 1}, ${NAMES[saddle[1]]}): pure strategies already solve it and no one needs to mix.`
    : '';
  return [intro, top, usage, pure].filter(Boolean).join(' ');
}

/** GT05: the graphical method for a 2×3 zero-sum game: the top of the lower envelope gives p* and v. */
export function ZeroSumLowerEnvelope() {
  const [top3, setTop3] = useState(-3);
  const [bottom3, setBottom3] = useState(6);
  const cols: Column[] = [...FIXED, { top: top3, bottom: bottom3 }];
  const { value, pLow, pHigh } = solveEnvelope(cols);
  const saddle = saddlePoint(cols);
  const ps = breakpoints(cols);
  const label3 = labelSpot({ top: top3, bottom: bottom3 });
  const corners = ps.map((p) => [p, envelope(cols, p)] as [number, number]);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="p (row 1)"
        yLabel="A’s gain"
        xTicks={[0, 0.5, 1]}
        yTicks={[-3, 0, 3, 6]}
      >
        <Area frame={FRAME} points={[[0, FRAME.yMin], ...corners, [1, FRAME.yMin]]} tone="lilac" />
        {cols.map((c, j) => (
          <Segment
            key={NAMES[j]}
            frame={FRAME}
            from={[0, c.bottom]}
            to={[1, c.top]}
            tone={TONES[j]}
            dashed
          />
        ))}
        {ps.slice(1).map((p, k) => {
          const from = ps[k] ?? 0;
          const mid = (from + p) / 2;
          const j = cols.findIndex((c) => Math.abs(gainAt(c, mid) - envelope(cols, mid)) < EPS);
          const c = cols[j] ?? cols[0] ?? { top: 0, bottom: 0 };
          return (
            <Segment
              key={`piece${from}`}
              frame={FRAME}
              from={[from, gainAt(c, from)]}
              to={[p, gainAt(c, p)]}
              tone={TONES[j] ?? 'lilac'}
            />
          );
        })}
        <Note frame={FRAME} x={0.03} y={3.4}>
          B1
        </Note>
        <Note frame={FRAME} x={0.03} y={-1.9}>
          B2
        </Note>
        <Note frame={FRAME} x={label3[0]} y={label3[1]}>
          B3
        </Note>
        {pHigh - pLow > EPS && (
          <Segment frame={FRAME} from={[pLow, value]} to={[pHigh, value]} tone="gold" />
        )}
        <Guides frame={FRAME} x={pLow} y={value} />
        <Dot frame={FRAME} x={pLow} y={value} />
        {pHigh - pLow > EPS && <Dot frame={FRAME} x={pHigh} y={value} hollow />}
      </Plot>
      <Slider label="B3: A’s gain from row 1" value={top3} min={-3} max={7} onChange={setTop3} />
      <Slider
        label="B3: A’s gain from row 2"
        value={bottom3}
        min={-3}
        max={7}
        onChange={setBottom3}
      />
      <Readout
        items={[
          ['Best p* (row 1)', describeP(pLow, pHigh)],
          ['Value v', fmt(value)],
          ['Saddle point', saddle ? `row ${saddle[0] + 1}, ${NAMES[saddle[1]]}` : 'none'],
        ]}
      />
      <figcaption>{describeEnvelope(cols)}</figcaption>
    </figure>
  );
}
