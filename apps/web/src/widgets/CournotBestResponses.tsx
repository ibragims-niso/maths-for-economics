import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

const FRAME = { xMin: 0, xMax: 50, yMin: 0, yMax: 50 };
/** Demand P = a − B(q₁ + q₂) and firm 1's marginal cost, as in GT01 Example 3. */
const B = 2;
const C1 = 10;

/** Firm 1's best response to q₂: the output that maximises its profit, (a − c₁ − bq₂)/(2b). */
export const bestResponse1 = (a: number, q2: number) => Math.max(0, (a - C1 - B * q2) / (2 * B));

/** Firm 2's best response to q₁: (a − c₂ − bq₁)/(2b). */
export const bestResponse2 = (a: number, c2: number, q1: number) =>
  Math.max(0, (a - c2 - B * q1) / (2 * B));

/**
 * The Cournot–Nash equilibrium, where the two best responses cross:
 * q₁* = (a − 2c₁ + c₂)/(3b), q₂* = (a − 2c₂ + c₁)/(3b), price (a + c₁ + c₂)/3.
 */
export function cournotEquilibrium(a: number, c2: number) {
  const q1 = (a - 2 * C1 + c2) / (3 * B);
  const q2 = (a - 2 * c2 + C1) / (3 * B);
  return { q1, q2, price: a - B * (q1 + q2) };
}

/** The caption: what the lines are and how firm 2's cost moves the equilibrium. */
export function describeCournot(a: number, c2: number): string {
  const { q1, q2 } = cournotEquilibrium(a, c2);
  const lines = `The lilac line is firm 1's best response: for each output q₂ of firm 2 (up the side) it gives the output q₁ that maximises firm 1's profit. The green line is firm 2's best response to each output q₁ of firm 1 (along the bottom). They cross at q₁ = ${fmt(q1)}, q₂ = ${fmt(q2)}, where each output is the best reply to the other: neither firm gains by changing its output alone, so this is the Nash equilibrium.`;
  if (c2 > C1)
    return `${lines} Firm 2's cost is above firm 1's (${C1}), so its line sits lower: it produces less and firm 1 more.`;
  if (c2 < C1)
    return `${lines} Firm 2's cost is below firm 1's (${C1}), so its line sits higher: it produces more and firm 1 less.`;
  return `${lines} With equal costs the two firms produce the same amount.`;
}

/** GT01: Cournot duopoly as two best-response lines in the (q₁, q₂) plane; the crossing is the Nash equilibrium. */
export function CournotBestResponses() {
  const [c2, setC2] = useState(10);
  const [a, setA] = useState(100);
  const eq = cournotEquilibrium(a, c2);
  // Firm 1's line is q₁ = BR₁(q₂); drawn as q₂ = (a − c₁ − 2b·q₁)/b over the q₁ axis.
  const line1 = (q1: number) => (a - C1 - 2 * B * q1) / B;
  const line2 = (q1: number) => bestResponse2(a, c2, q1);
  const y1 = Math.min(40, (a - C1) / B - 4);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="q₁"
        yLabel="q₂"
        xTicks={[0, 10, 20, 30, 40, 50]}
        yTicks={[10, 20, 30, 40, 50]}
      >
        <Curve frame={FRAME} fn={line1} from={0} to={(a - C1) / (2 * B)} />
        <Curve frame={FRAME} fn={line2} tone="green" from={0} to={(a - c2) / B} />
        <Note frame={FRAME} x={bestResponse1(a, y1) + 1.5} y={y1}>
          BR₁
        </Note>
        <Note frame={FRAME} x={1.5} y={bestResponse2(a, c2, 0) + 2.5}>
          BR₂
        </Note>
        <Guides frame={FRAME} x={eq.q1} y={eq.q2} />
        <Dot frame={FRAME} x={eq.q1} y={eq.q2} />
      </Plot>
      <Slider label="Firm 2's marginal cost c₂" value={c2} min={0} max={30} onChange={setC2} />
      <Slider label="Demand intercept a" value={a} min={70} max={130} step={5} onChange={setA} />
      <Readout
        items={[
          ['Firm 1 output q₁*', fmt(eq.q1)],
          ['Firm 2 output q₂*', fmt(eq.q2)],
          ['Market price P*', fmt(eq.price)],
        ]}
      />
      <figcaption>
        Demand is P = a − 2(q₁ + q₂) and firm 1's marginal cost is {C1}. {describeCournot(a, c2)}
      </figcaption>
    </figure>
  );
}
