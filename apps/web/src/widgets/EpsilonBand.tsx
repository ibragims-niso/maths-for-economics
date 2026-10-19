import { useState } from 'react';
import { Area, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Three sequences that all tend to 2 (topic AN02): the ε–N definition of convergence made visible.
const LIMIT = 2;
const SHOWN = 50;
/** Far enough out for every ε on the slider (the slowest case, ε = 0.05, needs N = 98). */
const HORIZON = 1000;
const FRAME = { xMin: 0, xMax: SHOWN + 1, yMin: -0.25, yMax: 3 };

export interface SequenceCase {
  name: string;
  /** The terms a₁, a₂, …, a_HORIZON (index 0 holds a₁). */
  terms: number[];
  story: string;
}

/** The terms of (2n + 1)/(n + 3), the sequence of Example 1. */
const rational = Array.from({ length: HORIZON }, (_, i) => (2 * (i + 1) + 1) / (i + 1 + 3));

/** The terms of 2 + (−0.9)ⁿ, a price path that overshoots and undershoots. */
const oscillating = Array.from({ length: HORIZON }, (_, i) => LIMIT + (-0.9) ** (i + 1));

/** x₁ = 0, xₙ₊₁ = √(2 + xₙ), the recursive sequence of Example 2. */
export function rootIteration(count: number): number[] {
  const xs = [0];
  while (xs.length < count) xs.push(Math.sqrt(2 + (xs[xs.length - 1] ?? 0)));
  return xs;
}

export const SEQUENCES: SequenceCase[] = [
  {
    name: '(2n + 1)/(n + 3)',
    terms: rational,
    story:
      'The gap is |aₙ − 2| = 5/(n + 3), so the first N is the first whole number above 5/ε − 3.',
  },
  {
    name: '2 + (−0.9)ⁿ',
    terms: oscillating,
    story:
      'The terms jump from one side of 2 to the other, like a price that overshoots, but the jumps shrink by 10 % each time.',
  },
  {
    name: 'xₙ₊₁ = √(2 + xₙ)',
    terms: rootIteration(HORIZON),
    story:
      'Starting from x₁ = 0 the terms rise towards 2 and the gap shrinks about four times each step, so even a narrow band needs only a small N: this is how a fast algorithm converges.',
  },
];

/** The gap |aₙ − 2|. For (2n + 1)/(n + 3) it is computed as 5/(n + 3), exactly as in the text. */
export function gapAt(index: number, n: number): number {
  if (index === 0) return 5 / (n + 3);
  return Math.abs((SEQUENCES[index]?.terms[n - 1] ?? LIMIT) - LIMIT);
}

/** The smallest N such that |aₙ − 2| < ε for every n from N up to the horizon. */
export function firstN(index: number, eps: number): number {
  let N = 1;
  for (let n = 1; n <= HORIZON; n++) if (!(gapAt(index, n) < eps)) N = n + 1;
  return N;
}

/** AN02: pick a sequence and a band 2 ± ε; see from which N on every term stays inside. */
export function EpsilonBand() {
  const [index, setIndex] = useState(0);
  const [eps, setEps] = useState(0.1);
  const e = Math.round(eps * 100) / 100;
  const seq = SEQUENCES[index] ?? SEQUENCES[0];
  const N = firstN(index, e);
  const aN = seq?.terms[N - 1] ?? LIMIT;
  const shown = (seq?.terms ?? []).slice(0, SHOWN).map((a, i) => [i + 1, a] as const);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="n"
        yLabel="aₙ"
        xTicks={[1, 10, 20, 30, 40, 50]}
        yTicks={[0, 1, 2, 3]}
      >
        <Area
          frame={FRAME}
          points={[
            [0, LIMIT - e],
            [SHOWN + 1, LIMIT - e],
            [SHOWN + 1, LIMIT + e],
            [0, LIMIT + e],
          ]}
        />
        <Segment frame={FRAME} from={[0, LIMIT]} to={[SHOWN + 1, LIMIT]} dashed />
        {N <= SHOWN && <Guides frame={FRAME} x={N} y={aN} />}
        {shown.map(([n, a]) => (
          <Segment
            key={n}
            frame={FRAME}
            from={[n - 0.2, a]}
            to={[n + 0.2, a]}
            tone={n >= N ? 'green' : 'lilac'}
          />
        ))}
        {N <= SHOWN && <Dot frame={FRAME} x={N} y={aN} />}
        <Note frame={FRAME} x={SHOWN + 0.5} y={Math.min(LIMIT + e + 0.08, 2.85)} anchor="end">
          2 ± ε
        </Note>
      </Plot>
      <Slider
        label="Sequence"
        value={index}
        min={0}
        max={SEQUENCES.length - 1}
        onChange={setIndex}
        format={(i) => SEQUENCES[i]?.name ?? ''}
      />
      <Slider
        label="Band half-width ε"
        value={eps}
        min={0.05}
        max={1}
        step={0.05}
        onChange={setEps}
      />
      <Readout
        items={[
          ['Limit L', fmt(LIMIT)],
          ['ε', fmt(e)],
          ['First N', N <= SHOWN ? `${N}` : `${N} (off the graph)`],
        ]}
      />
      <figcaption>
        The marks are the terms a₁, a₂, …, a₅₀ of {seq?.name}; the shaded band is 2 ± ε. Lilac terms
        lie outside the band; from n = N on (green, the first one marked gold) every term stays
        inside, for good. {seq?.story} Shrink ε and N grows, but for every ε &gt; 0 some N exists:
        that is exactly what aₙ → 2 means.
      </figcaption>
    </figure>
  );
}
