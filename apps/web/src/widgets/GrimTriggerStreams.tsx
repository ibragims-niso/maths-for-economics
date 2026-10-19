import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// The cartel of GT04, Examples 1 and 2: reward R = 12 if both collude, punishment P = 8 after
// cheating; the temptation T and the discount factor δ are on the sliders.
const REWARD = 12;
const PUNISHMENT = 8;
const PERIODS = 11;
// Month t is the stretch from t to t + 1 on the time axis; its two bars stand inside it.
const FRAME = { xMin: 0, xMax: PERIODS + 0.2, yMin: 0, yMax: 32 };

/** Present value of colluding for ever: R + Rδ + Rδ² + … = R/(1 − δ). */
export const pvCollude = (R: number, delta: number) => R / (1 - delta);

/** Present value of cheating now and being punished for ever after: T + δP/(1 − δ). */
export const pvCheat = (T: number, P: number, delta: number) => T + (delta * P) / (1 - delta);

/** The smallest δ at which grim trigger keeps the cartel together: (T − R)/(T − P). */
export const criticalDelta = (T: number, R: number, P: number) => (T - R) / (T - P);

/** What period t's profit is worth today on each path: δᵗR, or T at t = 0 and δᵗP after. */
export function discountedProfits(T: number, R: number, P: number, delta: number, t: number) {
  const weight = delta ** t;
  return { collude: weight * R, cheat: weight * (t === 0 ? T : P) };
}

/** How δ compares with δ*, and what that means for the cartel, from the two present values. */
export function verdict(collude: number, cheat: number): { sign: '>' | '=' | '<'; text: string } {
  if (Math.abs(collude - cheat) < 1e-9)
    return {
      sign: '=',
      text: 'the lost months exactly balance the one-off gain: the firm is just indifferent, and the cartel just holds.',
    };
  return collude > cheat
    ? {
        sign: '>',
        text: 'the lost months outweigh the one-off gain: colluding is worth more, so the cartel holds.',
      }
    : {
        sign: '<',
        text: 'the one-off gain outweighs the lost months: cheating is worth more, so the cartel breaks down.',
      };
}

/** GT04: change patience δ and the temptation T; compare the two discounted profit streams. */
export function GrimTriggerStreams() {
  const [delta, setDelta] = useState(0.75);
  const [T, setT] = useState(18);
  const collude = pvCollude(REWARD, delta);
  const cheat = pvCheat(T, PUNISHMENT, delta);
  const star = criticalDelta(T, REWARD, PUNISHMENT);
  const outcome = verdict(collude, cheat);
  const periods = Array.from({ length: PERIODS }, (_, t) => t);

  const bar = (key: string, left: number, height: number, tone: 'lilac' | 'gold') => [
    <Area
      key={`${key}a`}
      frame={FRAME}
      tone={tone}
      points={[
        [left, 0],
        [left + 0.36, 0],
        [left + 0.36, height],
        [left, height],
      ]}
    />,
    <Segment
      key={`${key}s`}
      frame={FRAME}
      from={[left, height]}
      to={[left + 0.36, height]}
      tone={tone}
    />,
  ];

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="t"
        yLabel="profit, valued today"
        xTicks={[0, 2, 4, 6, 8, 10]}
        yTicks={[10, 20, 30]}
      >
        {periods.map((t) => {
          const v = discountedProfits(T, REWARD, PUNISHMENT, delta, t);
          return [
            ...bar(`c${t}`, t + 0.12, v.collude, 'lilac'),
            ...bar(`d${t}`, t + 0.52, v.cheat, 'gold'),
          ];
        })}
        <Note frame={FRAME} x={PERIODS} y={29} anchor="end">
          δ* = {fmt(star)}
        </Note>
      </Plot>
      <Slider
        label="Discount factor δ"
        value={delta}
        min={0.05}
        max={0.95}
        step={0.05}
        onChange={setDelta}
      />
      <Slider label="Temptation T" value={T} min={13} max={30} onChange={setT} />
      <Readout
        items={[
          ['PV of colluding', fmt(collude)],
          ['PV of cheating', fmt(cheat)],
          ['Critical δ*', fmt(star)],
        ]}
      />
      <figcaption>
        Lilac bars: colluding earns {REWARD} every month. Gold bars: cheating earns {T} now, then{' '}
        {PUNISHMENT} a month for ever. Each bar is the profit of month t times δᵗ, so later months
        count for less. With δ = {fmt(delta)} {outcome.sign} δ* = {fmt(star)}, {outcome.text}
      </figcaption>
    </figure>
  );
}
