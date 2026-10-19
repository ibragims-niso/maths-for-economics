import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// A mortgage of 200,000 repaid monthly (topic FM05). Bars are in thousands per year.
const LOAN = 200000;

/** The level monthly payment L·r/(1 − (1 + r)^(−n)), with r = annual rate/12 and n = 12 × years. */
export function monthlyPayment(loan: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  const n = 12 * years;
  return r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n);
}

/** Interest and principal paid in each year, added up from the monthly schedule row by row. */
export function yearlySplit(
  loan: number,
  annualRate: number,
  years: number,
): { interest: number; principal: number }[] {
  const r = annualRate / 12;
  const pay = monthlyPayment(loan, annualRate, years);
  let balance = loan;
  const rows: { interest: number; principal: number }[] = [];
  for (let y = 0; y < years; y++) {
    let interest = 0;
    let principal = 0;
    for (let m = 0; m < 12; m++) {
      const i = r * balance;
      interest += i;
      principal += pay - i;
      balance -= pay - i;
    }
    rows.push({ interest, principal });
  }
  return rows;
}

/** Total interest over the life of the loan: everything paid minus what was borrowed. */
export function totalInterest(loan: number, annualRate: number, years: number): number {
  return 12 * years * monthlyPayment(loan, annualRate, years) - loan;
}

/** The first year (1, 2, …) in which more of the payments repays principal than pays interest. */
export function crossoverYear(rows: { interest: number; principal: number }[]): number {
  const i = rows.findIndex((row) => row.principal > row.interest);
  return i === -1 ? rows.length : i + 1;
}

/** A round step for the vertical axis, so that three or four ticks fit under `top`. */
export function tickStep(top: number): number {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100];
  return steps.find((s) => top / s <= 4) ?? 100;
}

/** FM05: change the rate and the term of a mortgage; watch interest and principal trade places. */
export function LoanScheduleBars() {
  const [ratePct, setRatePct] = useState(4.8);
  const [years, setYears] = useState(25);
  const rate = ratePct / 100;
  const pay = monthlyPayment(LOAN, rate, years);
  const rows = yearlySplit(LOAN, rate, years);
  const total = totalInterest(LOAN, rate, years);
  const cross = crossoverYear(rows);
  const k = (v: number) => v / 1000;
  const perYear = k(12 * pay);
  const frame = { xMin: 0, xMax: years + 1, yMin: 0, yMax: perYear * 1.4 };
  const step = tickStep(perYear);
  const yTicks = [step, 2 * step, 3 * step, 4 * step].filter((t) => t <= perYear);
  const xTicks = [1, 5, 10, 15, 20, 25, 30, 35].filter((t) => t <= years);
  const share = (row: { interest: number; principal: number } | undefined) =>
    row ? (100 * row.interest) / (row.interest + row.principal) : 0;
  const half = 0.38;
  // Keep the label inside the frame when the crossover is near either end.
  const where = (cross - 0.5) / frame.xMax;
  const anchor = where < 0.3 ? 'start' : where > 0.7 ? 'end' : 'middle';

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="year"
        yLabel="paid per year (thousands)"
        xTicks={xTicks}
        yTicks={yTicks}
      >
        {rows.map((row, i) => {
          const x = i + 1;
          const p = k(row.principal);
          return (
            <g key={x}>
              <Area
                frame={frame}
                points={[
                  [x - half, 0],
                  [x - half, p],
                  [x + half, p],
                  [x + half, 0],
                ]}
                tone="green"
              />
              <Segment frame={frame} from={[x - half, p]} to={[x + half, p]} tone="green" />
              <Area
                frame={frame}
                points={[
                  [x - half, p],
                  [x - half, perYear],
                  [x + half, perYear],
                  [x + half, p],
                ]}
                tone="gold"
              />
            </g>
          );
        })}
        <Segment
          frame={frame}
          from={[0.5, perYear]}
          to={[years + 0.5, perYear]}
          tone="lilac"
          dashed
        />
        {cross > 1 && (
          <Segment
            frame={frame}
            from={[cross - 0.5, 0]}
            to={[cross - 0.5, perYear * 1.1]}
            tone="green"
            dashed
          />
        )}
        {cross > 1 && (
          <Note frame={frame} x={cross - 0.5} y={perYear * 1.14} anchor={anchor}>
            principal &gt; interest
          </Note>
        )}
      </Plot>
      <Slider
        label="Interest rate (a year)"
        value={ratePct}
        min={1}
        max={10}
        step={0.1}
        onChange={setRatePct}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider label="Term in years" value={years} min={5} max={35} onChange={setYears} />
      <Readout
        items={[
          ['Monthly payment', fmt(pay)],
          ['Total interest', fmt(total)],
          ['Principal > interest from', `year ${cross}`],
        ]}
      />
      <figcaption>
        Each bar is one year of payments on a mortgage of {fmt(LOAN)}: 12 × {fmt(pay)} ={' '}
        {fmt(12 * pay)}, the same every year (lilac dashed line). The gold part is interest, the
        green part repays the loan. Interest is charged on the balance still owed, which keeps
        falling, so interest takes {fmt(share(rows[0]), 0)} % of the payments in year 1 but only{' '}
        {fmt(share(rows[rows.length - 1]), 0)} % in year {years}.{' '}
        {cross > 1
          ? `From year ${cross} on (green dashed line), more of each year's payments repays the loan than pays interest.`
          : 'Here principal is the larger part from the very first year: with a low rate or a short term, interest never takes half of the payments.'}{' '}
        Over the whole term you pay {fmt(total, 0)} of interest on top of the {fmt(LOAN)} borrowed.
      </figcaption>
    </figure>
  );
}
