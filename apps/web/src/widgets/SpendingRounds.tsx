import { useState } from 'react';
import { Area, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// The government spends 100 and everyone re-spends a fraction c (topic F08, Example 2).
const FIRST = 100;
const ROUNDS = 20;

/** Spending in round k (round 1 is the first injection): a·cᵏ⁻¹. */
export const roundSpending = (a: number, c: number, k: number) => a * c ** (k - 1);

/** Total spending over the first n rounds: a(1 − cⁿ)/(1 − c). */
export const totalAfter = (a: number, c: number, n: number) => (a * (1 - c ** n)) / (1 - c);

/** The long-run total if the rounds go on for ever: a/(1 − c), for 0 ≤ c < 1. */
export const longRunTotal = (a: number, c: number) => a / (1 - c);

/** The smallest of 1, 2, 2.5 or 5 times a power of 10 that is at least x. */
export function niceCeil(x: number): number {
  const power = 10 ** Math.floor(Math.log10(x));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * power >= x - 1e-9) ?? 10;
  return step * power;
}

/** F08: change the fraction re-spent and the number of rounds; watch the total approach a/(1 − c). */
export function SpendingRounds() {
  const [c, setC] = useState(0.75);
  const [n, setN] = useState(5);
  const ceiling = longRunTotal(FIRST, c);
  const top = niceCeil(ceiling * 1.15);
  const frame = { xMin: 0, xMax: ROUNDS + 3, yMin: 0, yMax: top };
  const bars = Array.from({ length: n }, (_, i) => i + 1);

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="n"
        yLabel="total spending"
        xTicks={[1, 5, 10, 15, 20]}
        yTicks={[top / 2, top]}
      >
        {bars.map((k) => {
          const before = totalAfter(FIRST, c, k - 1);
          const after = totalAfter(FIRST, c, k);
          const left = k - 0.36;
          const right = k + 0.36;
          return [
            <Area
              key={`b${k}`}
              frame={frame}
              tone="lilac"
              points={[
                [left, 0],
                [right, 0],
                [right, before],
                [left, before],
              ]}
            />,
            <Area
              key={`r${k}`}
              frame={frame}
              tone="gold"
              points={[
                [left, before],
                [right, before],
                [right, after],
                [left, after],
              ]}
            />,
            <Segment key={`t${k}`} frame={frame} from={[left, after]} to={[right, after]} />,
          ];
        })}
        <Segment frame={frame} from={[0, ceiling]} to={[ROUNDS + 3, ceiling]} tone="green" dashed />
        <Dot frame={frame} x={n} y={totalAfter(FIRST, c, n)} />
        <Note frame={frame} x={ROUNDS + 2.6} y={ceiling + top * 0.04} anchor="end">
          a/(1 − c) = {fmt(ceiling)}
        </Note>
      </Plot>
      <Slider
        label="Fraction re-spent c"
        value={c}
        min={0.1}
        max={0.95}
        step={0.05}
        onChange={setC}
      />
      <Slider label="Rounds n" value={n} min={1} max={ROUNDS} onChange={setN} />
      <Readout
        items={[
          [`Round ${n} spending`, fmt(roundSpending(FIRST, c, n))],
          [`Total after ${n} rounds`, fmt(totalAfter(FIRST, c, n))],
          ['Long-run total', fmt(ceiling)],
        ]}
      />
      <figcaption>
        Round 1 is a first injection of 100; each later round is {`${fmt(c * 100)}\u00a0%`} of the
        one before. Each bar is the running total, with the round it adds in gold. The bars creep up
        towards the dashed line a/(1 − c) but never reach it.
      </figcaption>
    </figure>
  );
}
