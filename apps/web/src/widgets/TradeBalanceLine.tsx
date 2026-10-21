import { useState } from 'react';
import { Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic LA205, Example 2: two countries, country 1's income fixed at 200 billion.
const X1 = 200;
const FRAME = { xMin: 0, xMax: 500, yMin: -100, yMax: 160 };

/** Country 1's exports b·x₂, imports a·x₁ and balance; shares a and b as decimals. */
export function tradeOfCountry1(a: number, b: number, x2: number) {
  const exports = b * x2;
  const imports = a * X1;
  return { exports, imports, balance: exports - imports, balancingX2: (a * X1) / b };
}

/** LA205: move country 2's income until country 1's trade balance is zero. */
export function TradeBalanceLine() {
  const [a, setA] = useState(30);
  const [b, setB] = useState(20);
  const [x2, setX2] = useState(300);
  const t = tradeOfCountry1(a / 100, b / 100, x2);
  const line = (x: number) => (b / 100) * x - (a / 100) * X1;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="income x₂"
        yLabel="balance of country 1"
        xTicks={[0, 100, 200, 300, 400, 500]}
        yTicks={[-100, -50, 50, 100, 150]}
      >
        <Segment frame={FRAME} from={[0, line(0)]} to={[500, line(500)]} tone="lilac" />
        {t.balancingX2 <= 500 && <Guides frame={FRAME} x={t.balancingX2} y={0} />}
        <Dot frame={FRAME} x={x2} y={t.balance} />
        <Note frame={FRAME} x={10} y={105}>
          surplus
        </Note>
        <Note frame={FRAME} x={160} y={-80}>
          deficit
        </Note>
      </Plot>
      <Slider
        label="Country 1 spends abroad"
        value={a}
        min={5}
        max={50}
        step={5}
        onChange={setA}
        format={(v) => `${fmt(v, 0)} %`}
      />
      <Slider
        label="Country 2 spends abroad"
        value={b}
        min={5}
        max={50}
        step={5}
        onChange={setB}
        format={(v) => `${fmt(v, 0)} %`}
      />
      <Slider label="Income of country 2" value={x2} min={0} max={500} step={10} onChange={setX2} />
      <Readout
        items={[
          ['Exports of country 1', fmt(t.exports)],
          ['Imports of country 1', fmt(t.imports)],
          ['Balancing income x₂', fmt(t.balancingX2)],
        ]}
      />
      <figcaption>
        Country 1 earns 200 billion and spends {fmt(a, 0)} % of it, {fmt(t.imports)}, on goods from
        country 2; it sells {fmt(b, 0)} % of country 2's income back. Its balance is{' '}
        {Math.abs(t.balance) < 0.005
          ? 'exactly zero: incomes are in the ratio of the eigenvector of the structure matrix.'
          : t.balance > 0
            ? `a surplus of ${fmt(t.balance)}; country 2 is in deficit by the same amount.`
            : `a deficit of ${fmt(-t.balance)}; country 2 has the matching surplus.`}
      </figcaption>
    </figure>
  );
}
