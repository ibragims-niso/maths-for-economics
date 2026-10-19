import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { augmented, divideByPivot, equation, signed, system, term } from './matrix-latex';

interface Params {
  /** Cutting hours per chair, table and cabinet (all three products use cutting). */
  cutChair: number;
  cutTable: number;
  cutCabinet: number;
  /** Assembly hours per table and cabinet (chairs are not assembled). */
  asmTable: number;
  asmCabinet: number;
  /** Finishing hours per cabinet (only cabinets are finished). */
  finCabinet: number;
  /** The monthly plan that uses every machine hour: chairs, tables, cabinets. */
  chairs: number;
  tables: number;
  cabinets: number;
}

const NAMES = ['x', 'y', 'z'] as const;

/** Hours available on each machine: the plan times the hours per unit. */
const hours = (p: Params) => ({
  cutting: p.cutChair * p.chairs + p.cutTable * p.tables + p.cutCabinet * p.cabinets,
  assembly: p.asmTable * p.tables + p.asmCabinet * p.cabinets,
  finishing: p.finCabinet * p.cabinets,
});

const rows = (p: Params) => [
  [p.cutChair, p.cutTable, p.cutCabinet],
  [0, p.asmTable, p.asmCabinet],
  [0, 0, p.finCabinet],
];

const rhs = (p: Params) => {
  const h = hours(p);
  return [h.cutting, h.assembly, h.finishing];
};

/** The likely wrong answers; a problem keeps at least two after duplicates are removed. */
function wrongAnswers(p: Params) {
  const h = hours(p);
  const known = p.cutTable * p.tables + p.cutCabinet * p.cabinets;
  return cleanDistractors(p.chairs, [
    { value: h.cutting - known, mistakeCode: 'NOT_DIVIDED_BY_PIVOT' },
    { value: round((h.cutting + known) / p.cutChair, 2), mistakeCode: 'BACK_SUB_SIGN' },
    { value: p.tables, mistakeCode: 'WRONG_VARIABLE' },
  ]);
}

/** LA103, difficulty 1: a production plan from a system already in echelon form (back substitution). */
export const machineHoursBackSubstitution: Generator<Params> = {
  id: 'machine-hours-back-substitution',
  title: 'Production plan by back substitution',
  topicId: 'LA103',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const p: Params = {
        cutChair: rng.int(1, 4),
        cutTable: rng.int(1, 4),
        cutCabinet: rng.int(1, 4),
        asmTable: rng.int(1, 4),
        asmCabinet: rng.int(1, 4),
        finCabinet: rng.int(2, 5),
        chairs: rng.int(5, 40),
        tables: rng.int(5, 40),
        cabinets: rng.int(5, 30),
      };
      // Different numbers of chairs and tables, so "gave the tables" is a visible mistake.
      if (p.chairs !== p.tables && wrongAnswers(p).length >= 2) return p;
    }
  },

  stem: (p) =>
    `A workshop makes $x$ chairs, $y$ tables and $z$ cabinets a month. All three use the cutting machine, only tables and cabinets use the assembly line, and only cabinets go through finishing. Every available machine hour is used: $${system(rows(p), NAMES, rhs(p))}$ (cutting, assembly, finishing hours). How many chairs does the workshop make?`,

  answer: (p) => ({ kind: 'numeric', value: p.chairs, decimals: 0 }),

  steps(p) {
    const h = hours(p);
    const known = p.cutTable * p.tables + p.cutCabinet * p.cabinets;
    return [
      {
        text: 'Write the augmented matrix. It is already in row echelon form.',
        latex: augmented(rows(p), rhs(p)),
        why: 'Each row starts further to the right than the row above, so there is nothing to eliminate: solve from the bottom row up.',
      },
      {
        text: 'The last row has one unknown: the number of cabinets.',
        latex: `${equation([0, 0, p.finCabinet], NAMES, h.finishing)} \\;\\Rightarrow\\; z = ${num(p.cabinets)}`,
        why: `Only cabinets use finishing, so its ${num(h.finishing)} hours fix z on their own. Divide by the pivot ${num(p.finCabinet)}.`,
        result: p.cabinets,
      },
      {
        text: 'Substitute z into the assembly row to find the tables.',
        latex: `${term(p.asmTable, 'y')}${signed(p.asmCabinet * p.cabinets)} = ${num(h.assembly)} \\;\\Rightarrow\\; ${divideByPivot('y', h.assembly - p.asmCabinet * p.cabinets, p.asmTable, p.tables)}`,
        why: 'With z known, the assembly row has only one unknown left. Move the known hours to the right-hand side by subtracting them, then divide by the pivot.',
        result: p.tables,
      },
      {
        text: 'Substitute y and z into the cutting row to find the chairs.',
        latex: `${term(p.cutChair, 'x')}${signed(known)} = ${num(h.cutting)} \\;\\Rightarrow\\; ${divideByPivot('x', h.cutting - known, p.cutChair, p.chairs)}`,
        why: 'Tables and cabinets use some of the cutting hours; what is left is used by chairs. Subtract the known hours, then divide by the pivot.',
        result: p.chairs,
      },
    ];
  },

  distractors: wrongAnswers,
};
