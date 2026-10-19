import { useState } from 'react';
import { Area, Guides, Note, Plot, Readout, Slider } from './kit';

/** The five statement forms built from P and Q (topic AN01). */
export const FORMS = [
  { name: 'implication', label: 'P → Q', value: (p: boolean, q: boolean) => !p || q },
  { name: 'converse', label: 'Q → P', value: (p: boolean, q: boolean) => !q || p },
  { name: 'contrapositive', label: '¬Q → ¬P', value: (p: boolean, q: boolean) => q || !p },
  { name: 'inverse', label: '¬P → ¬Q', value: (p: boolean, q: boolean) => p || !q },
  { name: 'biconditional', label: 'P ↔ Q', value: (p: boolean, q: boolean) => p === q },
] as const;

/** The four rows of the table in textbook order: TT, TF, FT, FF. */
export const ROWS: [boolean, boolean][] = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
];

/** The value of form `form` (an index into FORMS) when P and Q have the given values. */
export function formValue(form: number, p: boolean, q: boolean): boolean {
  return (FORMS[form] ?? FORMS[0]).value(p, q);
}

/** How many of the four rows make the form true. */
export function trueRowCount(form: number): number {
  return ROWS.filter(([p, q]) => formValue(form, p, q)).length;
}

/** The rows (indices into ROWS) where the form disagrees with P → Q. */
export function rowsDifferingFromImplication(form: number): number[] {
  return ROWS.flatMap(([p, q], i) => (formValue(form, p, q) !== formValue(0, p, q) ? [i] : []));
}

const tf = (v: boolean) => (v ? 'true' : 'false');
const letter = (v: boolean) => (v ? 'T' : 'F');

/** The caption: what the chosen form says, how it compares with P → Q, and the current row. */
export function describeForm(form: number, p: boolean, q: boolean): string {
  const f = FORMS[form] ?? FORMS[0];
  const intro = {
    implication:
      'P → Q is false only in the row P true, Q false; whenever P is false the promise is not broken, so the statement is true.',
    converse:
      'The converse Q → P swaps hypothesis and conclusion. It differs from P → Q in two rows (shaded), so proving one does not prove the other.',
    contrapositive:
      'The contrapositive ¬Q → ¬P has the same value as P → Q in every row: the two are equivalent, so proving one proves the other.',
    inverse:
      'The inverse ¬P → ¬Q negates both parts. It matches the converse in every row (each is the contrapositive of the other) but differs from P → Q in two rows (shaded).',
    biconditional:
      'P ↔ Q is true when P and Q have the same value: it is P → Q and Q → P together, so it differs from P → Q in the row P false, Q true (shaded).',
  }[f.name];
  return `${intro} In the highlighted row P is ${tf(p)} and Q is ${tf(q)}, so ${f.label} is ${tf(formValue(form, p, q))}.`;
}

const FRAME = { xMin: 0, xMax: 4, yMin: 0, yMax: 5 };
/** Row i of the table sits between y = 3 − i and y = 4 − i; the header is between 4 and 5. */
const rowMid = (i: number) => 3.5 - i;
/** The four columns: P, Q, P → Q and the chosen form. */
const COLUMNS: {
  key: string;
  head: string;
  x: number;
  cell: (p: boolean, q: boolean, form: number) => boolean;
}[] = [
  { key: 'p', head: 'P', x: 0.5, cell: (p) => p },
  { key: 'q', head: 'Q', x: 1.5, cell: (_p, q) => q },
  { key: 'imp', head: 'P → Q', x: 2.5, cell: (p, q) => formValue(0, p, q) },
  { key: 'form', head: '', x: 3.5, cell: (p, q, form) => formValue(form, p, q) },
];

/** AN01: toggle P and Q and pick a statement form; the truth table shows which forms say the same thing. */
export function ImplicationTruthTable() {
  const [pVal, setP] = useState(1);
  const [qVal, setQ] = useState(0);
  const [form, setForm] = useState(0);
  const p = pVal === 1;
  const q = qVal === 1;
  const current = ROWS.findIndex(([a, b]) => a === p && b === q);
  const differs = rowsDifferingFromImplication(form);
  const chosen = FORMS[form] ?? FORMS[0];
  const band = (x0: number, x1: number, i: number): [number, number][] => [
    [x0, 3 - i],
    [x1, 3 - i],
    [x1, 4 - i],
    [x0, 4 - i],
  ];

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="" yLabel="">
        <Area frame={FRAME} points={band(0, 4, current)} tone="gold" />
        {differs.map((i) => (
          <Area key={`d${i}`} frame={FRAME} points={band(3, 4, i)} tone="lilac" />
        ))}
        {[1, 2, 3, 4].map((x) => (
          <Guides key={`v${x}`} frame={FRAME} x={x} y={5} />
        ))}
        {[1, 2, 3, 4].map((y) => (
          <Guides key={`h${y}`} frame={FRAME} x={4} y={y} />
        ))}
        {COLUMNS.map((col) => (
          <Note key={col.key} frame={FRAME} x={col.x} y={4.38} anchor="middle">
            {col.key === 'form' ? chosen.label : col.head}
          </Note>
        ))}
        {ROWS.map(([a, b], i) => (
          <g key={`r${letter(a)}${letter(b)}`}>
            {COLUMNS.map((col) => (
              <Note key={col.key} frame={FRAME} x={col.x} y={rowMid(i) - 0.12} anchor="middle">
                {letter(col.cell(a, b, form))}
              </Note>
            ))}
          </g>
        ))}
      </Plot>
      <Slider
        label="P is"
        value={pVal}
        min={0}
        max={1}
        onChange={setP}
        format={(v) => tf(v === 1)}
      />
      <Slider
        label="Q is"
        value={qVal}
        min={0}
        max={1}
        onChange={setQ}
        format={(v) => tf(v === 1)}
      />
      <Slider
        label="Statement"
        value={form}
        min={0}
        max={FORMS.length - 1}
        onChange={setForm}
        format={(v) => `${FORMS[v]?.label ?? ''} (${FORMS[v]?.name ?? ''})`}
      />
      <Readout
        items={[
          [`${chosen.label} in this row`, tf(formValue(form, p, q))],
          ['Rows where it is true', `${trueRowCount(form)} of 4`],
          [
            'Same as P → Q?',
            differs.length === 0
              ? 'yes, in all 4 rows'
              : `no, differs in ${differs.length} row${differs.length === 1 ? '' : 's'}`,
          ],
        ]}
      />
      <figcaption>{describeForm(form, p, q)}</figcaption>
    </figure>
  );
}
