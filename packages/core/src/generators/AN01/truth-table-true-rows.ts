import type { Rng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { cleanDistractors } from '../format';

export type Letter = 'P' | 'Q' | 'R';

export interface Literal {
  letter: Letter;
  negated: boolean;
}

/** One side of the conditional: a single literal, or two literals joined by "and" / "or". */
export interface Part {
  op: 'and' | 'or';
  literals: Literal[];
}

interface Params {
  /** The statement is hypothesis → conclusion. */
  hypothesis: Part;
  conclusion: Part;
}

/** Counts are exact: no tolerance beyond input noise. */
const COUNT = { tolerance: 0.01, relTolerance: 0 } as const;

const LETTERS = ['P', 'Q', 'R'] as const;

type Row = Record<Letter, boolean>;

/** The letters the statement uses, in the order P, Q, R. */
export const lettersOf = (p: Params): Letter[] =>
  LETTERS.filter((l) =>
    [...p.hypothesis.literals, ...p.conclusion.literals].some((x) => x.letter === l),
  );

/** Every combination of truth values of the letters, starting with all true (textbook order). */
function rowsOf(letters: Letter[]): Row[] {
  const n = letters.length;
  const rows: Row[] = [];
  for (let k = 0; k < 2 ** n; k++) {
    const row: Row = { P: false, Q: false, R: false };
    letters.forEach((l, j) => {
      row[l] = ((k >> (n - 1 - j)) & 1) === 0;
    });
    rows.push(row);
  }
  return rows;
}

const holds = (part: Part, row: Row) => {
  const values = part.literals.map((x) => row[x.letter] !== x.negated);
  return part.op === 'and' ? values.every(Boolean) : values.some(Boolean);
};

const count = (p: Params, test: (row: Row) => boolean) => rowsOf(lettersOf(p)).filter(test).length;

const totalRows = (p: Params) => 2 ** lettersOf(p).length;
const hypothesisRows = (p: Params) => count(p, (r) => holds(p.hypothesis, r));
/** Rows that break the promise: hypothesis true, conclusion false. */
const brokenRows = (p: Params) =>
  count(p, (r) => holds(p.hypothesis, r) && !holds(p.conclusion, r));
const trueRows = (p: Params) => totalRows(p) - brokenRows(p);
/** The converse conclusion → hypothesis. */
const converseTrueRows = (p: Params) =>
  count(p, (r) => !holds(p.conclusion, r) || holds(p.hypothesis, r));
/** Rows where both parts are true: what a student gets by calling every false-hypothesis row false. */
const bothTrueRows = (p: Params) =>
  count(p, (r) => holds(p.hypothesis, r) && holds(p.conclusion, r));

const literalLatex = (x: Literal) => `${x.negated ? '\\lnot ' : ''}${x.letter}`;

/** A part as LaTeX; two literals are wrapped in brackets when `bracket` is set. */
export function partLatex(part: Part, bracket = false): string {
  if (part.literals.length === 1) return literalLatex(part.literals[0] as Literal);
  const body = part.literals.map(literalLatex).join(part.op === 'and' ? ' \\land ' : ' \\lor ');
  return bracket ? `(${body})` : body;
}

export const statementLatex = (p: Params) =>
  `${partLatex(p.hypothesis, true)} \\to ${partLatex(p.conclusion, true)}`;

const sameLiteral = (x: Literal, y: Literal) => x.letter === y.letter && x.negated === y.negated;
const samePart = (a: Part, b: Part) =>
  a.literals.length === b.literals.length &&
  (a.literals.length === 1 || a.op === b.op) &&
  a.literals.every((x) => b.literals.some((y) => sameLiteral(x, y)));

const listLetters = (letters: Letter[]) =>
  letters.length === 2 ? `$${letters[0]}$ and $${letters[1]}$` : '$P$, $Q$ and $R$';

/** The broken rows written as (P, Q, R) = (T, T, F), when there are few of them. */
function brokenRowsLatex(p: Params): string {
  const letters = lettersOf(p);
  const rows = rowsOf(letters).filter((r) => holds(p.hypothesis, r) && !holds(p.conclusion, r));
  if (rows.length > 3) return '';
  const tuple = (r: Row) => letters.map((l) => `\\text{${r[l] ? 'T' : 'F'}}`).join(', ');
  return `: \\; (${letters.join(', ')}) = ${rows.map((r) => `(${tuple(r)})`).join(', \\ ')}`;
}

function drawPart(rng: Rng, size: number): Part {
  const first = LETTERS[rng.int(0, 2)] as Letter;
  const others = LETTERS.filter((l) => l !== first);
  const letters = size === 1 ? [first] : [first, others[rng.int(0, 1)] as Letter];
  return {
    op: rng.int(0, 1) === 0 ? 'and' : 'or',
    literals: letters.sort().map((letter) => ({ letter, negated: rng.int(0, 3) === 0 })),
  };
}

/** AN01, difficulty 1: in how many rows of its truth table is a conditional built from P, Q, R true? */
export const truthTableTrueRows: Generator<Params> = {
  id: 'truth-table-true-rows',
  title: 'Counting true rows of a truth table',
  topicId: 'AN01',
  difficulty: 1,
  timeSec: 120,

  params: (rng) => {
    for (;;) {
      const hSize = rng.int(1, 2);
      const cSize = hSize === 1 ? 2 : rng.int(1, 2);
      const p: Params = { hypothesis: drawPart(rng, hSize), conclusion: drawPart(rng, cSize) };
      if (samePart(p.hypothesis, p.conclusion)) continue;
      // Mostly three letters; two-letter statements only now and then.
      if (lettersOf(p).length === 2 && rng.int(0, 2) !== 0) continue;
      const t = trueRows(p);
      if (t === 0 || t === totalRows(p)) continue;
      if (truthTableTrueRows.distractors(p).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `A model's assumption is written in logic as $${statementLatex(p)}$, where ${listLetters(lettersOf(p))} are statements that can each be true or false. The truth table has one row for each combination of their truth values. In how many rows is the whole statement true?`,

  answer: (p) => ({ kind: 'numeric', value: trueRows(p), decimals: 0, ...COUNT }),

  steps: (p) => {
    const n = lettersOf(p).length;
    const h = partLatex(p.hypothesis);
    const c = partLatex(p.conclusion);
    return [
      {
        text: 'Count the rows of the truth table.',
        latex: `2^{${n}} = ${totalRows(p)}`,
        why: `Each of the ${n} letters can be true or false independently, so there are 2ⁿ combinations.`,
        result: totalRows(p),
      },
      {
        text: 'Count the rows where the hypothesis is true.',
        latex: `${h} \\text{ is true in } ${hypothesisRows(p)} \\text{ rows}`,
        why: 'A conditional can only be false when its hypothesis is true: in every row where the hypothesis is false, the statement is true automatically.',
        result: hypothesisRows(p),
      },
      {
        text: 'Among those rows, count the ones where the conclusion is false.',
        latex: `${h} \\text{ true and } ${c} \\text{ false in } ${brokenRows(p)} \\text{ row${brokenRows(p) === 1 ? '' : 's'}}${brokenRowsLatex(p)}`,
        why: 'These are the only rows where the promise "if the hypothesis holds, so does the conclusion" is broken.',
        result: brokenRows(p),
      },
      {
        text: 'Subtract the false rows from the total.',
        latex: `${totalRows(p)} - ${brokenRows(p)} = ${trueRows(p)}`,
        why: 'Every other row makes the conditional true, including all rows with a false hypothesis.',
        result: trueRows(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      trueRows(p),
      [
        { value: bothTrueRows(p), mistakeCode: 'FALSE_HYPOTHESIS' },
        { value: converseTrueRows(p), mistakeCode: 'CONVERSE' },
        { value: brokenRows(p), mistakeCode: 'COUNTED_FALSE' },
        { value: totalRows(p), mistakeCode: 'TOTAL_ROWS' },
      ],
      COUNT.tolerance,
      COUNT.relTolerance,
    ),
};
